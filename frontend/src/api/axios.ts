// === LUỒNG 1: XÁC THỰC & CẤU HÌNH TRUYỀN THÔNG MẠNG (Axios Client & Interceptors) ===
// Quản lý baseURL, tự động gắn accessToken vào Header và tự động Refresh Token khi hết hạn
import axios, { AxiosRequestConfig } from 'axios'

// LUỒNG 1: Tự động phát hiện và chuẩn hóa địa chỉ API gốc (baseURL)
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

// ─── Khởi tạo instance Axios dùng chung toàn dự án ─────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

// ─── REQUEST INTERCEPTOR: Tự động gắn accessToken vào Header ───────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      // Gắn Bearer Token để Backend xác thực danh tính sinh viên/giảng viên
      config.headers.Authorization = `Bearer ${token}`
    }
    // Khi gửi FormData (upload file), xóa Content-Type để Axios và trình duyệt tự động sinh multipart boundary hợp lệ
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── RESPONSE INTERCEPTOR: Xử lý lỗi 401, tự động cấp mới Token không ngắt quãng người dùng ───
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

    // Chỉ tự động refresh khi: Lỗi 401 Unauthorized, chưa từng retry, và không phải các API auth cơ bản
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !reqUrl.includes('/auth/refresh') &&
      !reqUrl.includes('/auth/login') &&
      !reqUrl.includes('/auth/register')
    ) {
      const refreshToken = localStorage.getItem('refreshToken')
      const hadAccessToken = Boolean(localStorage.getItem('accessToken'))

      // Nếu khách chưa từng đăng nhập → trả lỗi về cho component tự xử lý, không ép chuyển trang /login
      if (!refreshToken) {
        if (hadAccessToken) {
          localStorage.clear()
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
        }
        return Promise.reject(error)
      }

      // Nếu đang có một tiến trình refresh token chạy ngầm → xếp hàng các request đến sau
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
        // Dùng axios thuần (không qua interceptor) để tránh bị lặp vô tận
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh`,
          { refreshToken }
        )
        const newAccessToken: string = data.data.accessToken
        const newRefreshToken: string = data.data.refreshToken

        // Cập nhật cặp token mới vào LocalStorage
        localStorage.setItem('accessToken', newAccessToken)
        localStorage.setItem('refreshToken', newRefreshToken)

        // Cập nhật token mới vào request vừa bị lỗi và gửi lại
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newAccessToken}`,
        }

        processQueue(null, newAccessToken)
        return api(originalRequest)
      } catch (refreshError) {
        // Nếu refresh token cũng hết hạn → xóa phiên đăng nhập và đưa người dùng về trang /login
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
