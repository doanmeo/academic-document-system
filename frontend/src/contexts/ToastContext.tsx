import React, { createContext, useContext, useState, useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastMessage {
  id: string
  type: ToastType
  title: string
  message?: string
}

interface ToastContextValue {
  toasts: ToastMessage[]
  showToast: (type: ToastType, title: string, message?: string) => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, type, title, message }])

    // Auto dismiss after 3.8 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3800)
  }, [])

  const success = useCallback((title: string, message?: string) => showToast('success', title, message), [showToast])
  const error = useCallback((title: string, message?: string) => showToast('error', title, message), [showToast])
  const info = useCallback((title: string, message?: string) => showToast('info', title, message), [showToast])
  const warning = useCallback((title: string, message?: string) => showToast('warning', title, message), [showToast])

  return (
    <ToastContext.Provider value={{ toasts, showToast, success, error, info, warning, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: ToastMessage[]
  onRemove: (id: string) => void
}) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success'
        const isError = toast.type === 'error'
        const isWarning = toast.type === 'warning'
        const isInfo = toast.type === 'info'

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-right-5 fade-in ${
              isSuccess
                ? 'bg-emerald-50/95 border-emerald-300 text-emerald-950 shadow-emerald-500/10'
                : isError
                ? 'bg-red-50/95 border-red-300 text-red-950 shadow-red-500/10'
                : isWarning
                ? 'bg-amber-50/95 border-amber-300 text-amber-950 shadow-amber-500/10'
                : 'bg-sky-50/95 border-sky-300 text-sky-950 shadow-sky-500/10'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[22px] shrink-0 mt-0.5 ${
                isSuccess
                  ? 'text-emerald-600'
                  : isError
                  ? 'text-red-600'
                  : isWarning
                  ? 'text-amber-600'
                  : 'text-sky-600'
              }`}
            >
              {isSuccess
                ? 'check_circle'
                : isError
                ? 'error'
                : isWarning
                ? 'warning'
                : 'info'}
            </span>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-body-sm leading-snug">{toast.title}</p>
              {toast.message && (
                <p className="text-caption opacity-90 mt-0.5 leading-relaxed">{toast.message}</p>
              )}
            </div>

            <button
              onClick={() => onRemove(toast.id)}
              className="text-on-surface-variant/60 hover:text-on-surface transition-colors shrink-0 p-0.5 rounded cursor-pointer"
              title="Đóng thông báo"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )
      })}
    </div>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
