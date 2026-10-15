import api from './axios'
import type { InAppNotification } from '../types/document'

const unwrap = <T>(res: { data: { data: T } }): T => res.data.data

export const notificationApi = {
  /**
   * GET /me/notifications
   * Lấy danh sách thông báo của người dùng hiện tại
   */
  getNotifications: async (unreadOnly = false): Promise<InAppNotification[]> => {
    const res = await api.get('/me/notifications', { params: { unreadOnly } })
    return unwrap(res)
  },

  /**
   * GET /me/notifications/unread-count
   * Đếm số lượng thông báo chưa đọc
   */
  getUnreadCount: async (): Promise<number> => {
    const res = await api.get('/me/notifications/unread-count')
    return unwrap(res)
  },

  /**
   * PUT /me/notifications/:id/read
   * Đánh dấu 1 thông báo đã đọc
   */
  markAsRead: async (id: number): Promise<void> => {
    await api.put(`/me/notifications/${id}/read`)
  },

  /**
   * PUT /me/notifications/read-all
   * Đánh dấu tất cả thông báo đã đọc
   */
  markAllAsRead: async (): Promise<void> => {
    await api.put('/me/notifications/read-all')
  },
}

export default notificationApi
