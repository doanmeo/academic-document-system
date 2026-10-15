import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCircle, XCircle, AlertCircle, Info, CheckCheck } from 'lucide-react'
import { notificationApi } from '../api/notificationApi'
import type { InAppNotification } from '../types/document'

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<InAppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Fetch unread count & notifications
  const fetchCountsAndList = async () => {
    try {
      const count = await notificationApi.getUnreadCount()
      setUnreadCount(count)
    } catch {
      // Bỏ qua nếu lỗi mạng
    }
  }

  const loadNotifications = async () => {
    setIsLoading(true)
    try {
      const list = await notificationApi.getNotifications(false)
      setNotifications(list)
      const count = list.filter((n) => !n.isRead).length
      setUnreadCount(count)
    } catch {
      // Ignored
    } finally {
      setIsLoading(false)
    }
  }

  // Polling unread count every 60s
  useEffect(() => {
    fetchCountsAndList()
    const timer = setInterval(fetchCountsAndList, 60000)
    return () => clearInterval(timer)
  }, [])

  // Đóng dropdown khi click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggle = () => {
    if (!isOpen) {
      loadNotifications()
    }
    setIsOpen(!isOpen)
  }

  const handleMarkAsRead = async (notif: InAppNotification, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!notif.isRead) {
      await notificationApi.markAsRead(notif.id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
  }

  const handleItemClick = async (notif: InAppNotification) => {
    if (!notif.isRead) {
      try {
        await notificationApi.markAsRead(notif.id)
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      } catch {
        // Ignored
      }
    }
    setIsOpen(false)
    if (notif.link) {
      navigate(notif.link)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch {
      // Ignored
    }
  }

  const renderIcon = (type: string) => {
    switch (type) {
      case 'DOCUMENT_APPROVED':
        return <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
      case 'DOCUMENT_REJECTED':
        return <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
      case 'DOCUMENT_REVISION_REQUIRED':
        return <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
      default:
        return <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        type="button"
        title="Thông báo"
        aria-label="Thông báo"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Thông báo</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-rose-50 text-rose-700 rounded-full">
                  {unreadCount} mới
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Đọc tất cả
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {isLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">Đang tải thông báo...</div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">Không có thông báo nào</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${
                    notif.isRead ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/40 hover:bg-blue-50/70'
                  }`}
                >
                  {renderIcon(notif.type)}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs ${notif.isRead ? 'font-medium text-slate-800' : 'font-bold text-slate-950'}`}>
                      {notif.title}
                    </p>
                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{notif.body}</p>
                    <span className="text-[10px] text-slate-400 mt-1 inline-block">
                      {new Date(notif.createdAt).toLocaleDateString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                      })}
                    </span>
                  </div>
                  {!notif.isRead && (
                    <button
                      onClick={(e) => handleMarkAsRead(notif, e)}
                      title="Đánh dấu đã đọc"
                      className="p-1 text-slate-400 hover:text-blue-600 rounded-full hover:bg-slate-200/50"
                    >
                      <span className="w-2 h-2 rounded-full bg-blue-600 block"></span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
