import api from './axios'
import type { UserStats } from '../types/document'

const unwrap = <T>(res: { data: { data: T } }): T => res.data.data

export const userApi = {
  /**
   * GET /users/me/stats
   * Lấy thống kê đóng góp cá nhân (F5)
   */
  getMyStats: async (): Promise<UserStats> => {
    const res = await api.get('/users/me/stats')
    return unwrap(res)
  },
}

export default userApi
