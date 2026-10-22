import axios, { AxiosRequestConfig } from 'axios'

const resolveBaseUrl = () => {
  let url = (import.meta.env.VITE_API_BASE_URL || '').trim()
  if (!url) {
    return 'http://localhost:8080/api'
  }
  url = url.replace(/\/+$/, '')
  if (!url.endsWith('/api')) {
    url += '/api'
  }
  return url
}

const BASE_URL = resolveBaseUrl()

// ─── Instance chính ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

// ─── REQUEST interceptor: gắn accessToken ────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // Khi gửi FormData, xóa Content-Type để Axios và trình duyệt tự động sinh multipart boundary hợp lệ
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── RESPONSE interceptor: xử lý 401 → thử refresh → redirect /login ─────────
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error)
    else p.resolve(token!)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }
    const reqUrl = originalRequest?.url ?? ''

    // Chỉ retry khi: 401, chưa retry lần nào, và không phải các endpoint auth (login/register/refresh)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !reqUrl.includes('/auth/refresh') &&
      !reqUrl.includes('/auth/login') &&
      !reqUrl.includes('/auth/register')
    ) {
      const refreshToken = localStorage.getItem('refreshToken')
      const hadAccessToken = Boolean(localStorage.getItem('accessToken'))

      // Nếu khách chưa đăng nhập (không có refreshToken) → trả lỗi về cho component tự xử lý, không ép reload /login trên trang công khai
      if (!refreshToken) {
        if (hadAccessToken) {
          localStorage.clear()
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
        }
        return Promise.reject(error)
      }

      // Nếu đang có request refresh đang chạy → xếp hàng chờ
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${token}`,
            }
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Dùng axios thuần (không qua interceptor) để tránh vòng lặp vô tận
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh`,
          { refreshToken }
        )
        const newAccessToken: string = data.data.accessToken
        const newRefreshToken: string = data.data.refreshToken

        localStorage.setItem('accessToken', newAccessToken)
        localStorage.setItem('refreshToken', newRefreshToken)

        // Cập nhật header cho request gốc bị lỗi
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newAccessToken}`,
        }

        processQueue(null, newAccessToken)
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.clear()
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
