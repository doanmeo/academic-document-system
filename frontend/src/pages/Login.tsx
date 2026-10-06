import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getErrorMessage } from '../utils/errorMessages'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between items-center px-4 py-8 antialiased">
      <div className="w-full max-w-[460px] bg-surface-container-lowest rounded-2xl shadow-xl overflow-hidden border border-surface-container my-auto">
        {/* Header Ribbon */}
        <div className="p-6 md:p-8 flex flex-col items-center text-center bg-surface-container-low border-b border-surface-container">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-fixed text-on-primary-fixed rounded-full text-caption font-label-code uppercase tracking-wider mb-3">
            <span className="material-symbols-outlined text-[16px]">school</span>
            <span className="font-bold">CỔNG HỌC THUẬT ĐIỆN TỬ</span>
          </div>
          <div className="w-14 h-14 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-md mb-3">
            <span className="material-symbols-outlined text-3xl">login</span>
          </div>
          <h1 className="font-headline-md text-headline-md text-primary font-bold">
            Đăng nhập hệ thống
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5 max-w-sm">
            Hệ thống quản lý &amp; tra cứu đồ án, khóa luận tốt nghiệp Khoa CNTT - UTC
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-5 bg-surface-container-lowest">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-body-sm">
              <span className="material-symbols-outlined text-red-600 text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="font-body-sm text-body-sm text-on-surface font-semibold flex items-center justify-between" htmlFor="email">
              <span>Email</span>
              <span className="font-label-code text-[11px] text-outline">UTC Mail / @cntt.local</span>
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-outline pointer-events-none text-[20px]">mail</span>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant/60 rounded-xl text-on-surface font-body-sm placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="sv@cntt.local hoặc admin@cntt.local"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="font-body-sm text-body-sm text-on-surface font-semibold flex items-center justify-between" htmlFor="password">
              <span>Mật khẩu</span>
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-outline pointer-events-none text-[20px]">lock</span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-2.5 bg-surface-container-lowest border border-outline-variant/60 rounded-xl text-on-surface font-body-sm placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-outline hover:text-on-surface flex items-center"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-primary hover:bg-primary-hover active:scale-[0.99] text-on-primary font-headline-sm text-body-md font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white" />
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">login</span>
                <span>Đăng nhập</span>
              </>
            )}
          </button>

          {/* Account Hint */}
          <div className="bg-surface-container-low p-3 rounded-xl border border-surface-container text-xs text-on-surface-variant space-y-1">
            <div className="font-semibold text-primary flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">info</span>
              Tài khoản mẫu thử nghiệm:
            </div>
            <div>Admin: <code className="bg-surface-container px-1 py-0.5 rounded text-on-surface font-mono">admin@cntt.local</code> / <code className="bg-surface-container px-1 py-0.5 rounded text-on-surface font-mono">Admin@123</code></div>
            <div>Sinh viên: <code className="bg-surface-container px-1 py-0.5 rounded text-on-surface font-mono">sv01@cntt.local</code> / <code className="bg-surface-container px-1 py-0.5 rounded text-on-surface font-mono">Student@123</code></div>
          </div>

          <div className="text-center pt-2 border-t border-surface-container">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Chưa có tài khoản sinh viên?{' '}
              <Link to="/register" className="text-primary hover:underline font-semibold">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </form>
      </div>

      {/* Footer Branding */}
      <footer className="text-center text-outline text-caption py-4">
        <p>© {new Date().getFullYear()} Trường Đại học Giao thông Vận tải • Khoa Công nghệ Thông tin</p>
      </footer>
    </div>
  )
}
