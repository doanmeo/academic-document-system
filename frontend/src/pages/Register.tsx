import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getMajors } from '../api/catalogApi'
import { getErrorMessage, getFieldErrors } from '../utils/errorMessages'
import type { Major } from '../types/catalog'
import CustomSelect from '../components/ui/CustomSelect'

interface FormState {
  fullName: string
  studentCode: string
  majorId: number | ''
  email: string
  password: string
  confirmPassword: string
}

export default function Register() {
  const [form, setForm] = useState<FormState>({
    fullName: '',
    studentCode: '',
    majorId: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [majors, setMajors] = useState<Major[]>([])
  const [loadingMajors, setLoadingMajors] = useState(true)

  const { register } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    getMajors()
      .then((data) => {
        if (data && data.length > 0) {
          setMajors(data)
        }
      })
      .catch(() => {
        // Fallback demo majors if backend not connected yet
        setMajors([
          { id: 1, code: 'KTPM', name: 'Kỹ thuật phần mềm', isActive: true },
          { id: 2, code: 'CNTT', name: 'Công nghệ thông tin', isActive: true },
          { id: 3, code: 'HTTT', name: 'Hệ thống thông tin', isActive: true },
          { id: 4, code: 'ATTT', name: 'An toàn thông tin', isActive: true },
          { id: 5, code: 'KHDL', name: 'Khoa học dữ liệu', isActive: true },
        ])
      })
      .finally(() => setLoadingMajors(false))
  }, [])

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  // Password strength calculation
  const getPasswordStrength = () => {
    const pwd = form.password
    if (!pwd) return { width: '0%', color: '', label: 'Độ mạnh mật khẩu', textColor: 'text-on-surface-variant' }
    let score = 0
    if (pwd.length >= 8) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++

    if (score <= 1) return { width: '25%', color: 'bg-error', label: 'Mật khẩu yếu', textColor: 'text-error' }
    if (score === 2) return { width: '50%', color: 'bg-secondary', label: 'Mật khẩu trung bình', textColor: 'text-secondary' }
    if (score === 3) return { width: '75%', color: 'bg-primary-container', label: 'Mật khẩu khá mạnh', textColor: 'text-primary' }
    return { width: '100%', color: 'bg-primary', label: 'Mật khẩu rất mạnh', textColor: 'text-primary font-bold' }
  }

  const isPasswordMatch = form.confirmPassword.length > 0 && form.password === form.confirmPassword
  const strength = getPasswordStrength()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    if (form.password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }

    if (form.majorId === '') {
      setError('Vui lòng chọn ngành đào tạo.')
      return
    }

    if (!agreed) {
      setError('Vui lòng đồng ý với Quy chế sử dụng học liệu để tiếp tục.')
      return
    }

    setLoading(true)

    try {
      await register({
        fullName: form.fullName,
        studentCode: form.studentCode,
        majorId: Number(form.majorId),
        email: form.email,
        password: form.password,
      })
      navigate('/')
    } catch (err) {
      setError(getErrorMessage(err))
      setFieldErrors(getFieldErrors(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between items-center px-4 py-8 antialiased">
      <div className="w-full max-w-[500px] bg-surface-container-lowest rounded-2xl shadow-xl overflow-hidden border border-surface-container my-auto">
        {/* Header Ribbon */}
        <div className="p-6 md:p-8 flex flex-col items-center text-center bg-surface-container-low border-b border-surface-container">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-fixed text-on-primary-fixed rounded-full text-caption font-label-code uppercase tracking-wider mb-3">
            <span className="material-symbols-outlined text-[16px]">school</span>
            <span className="font-bold">CỔNG HỌC THUẬT ĐIỆN TỬ</span>
          </div>
          <div className="w-14 h-14 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-md mb-3">
            <span className="material-symbols-outlined text-3xl">local_library</span>
          </div>
          <h1 className="font-headline-md text-headline-md text-primary font-bold">
            Đăng ký tài khoản Sinh viên
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5 max-w-sm">
            Hệ thống quản lý &amp; tra cứu tài liệu học tập Khoa CNTT - UTC
          </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-4 bg-surface-container-lowest">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-body-sm">
              <span className="material-symbols-outlined text-red-600 text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-body-sm text-body-sm text-on-surface font-semibold flex items-center justify-between" htmlFor="fullname">
              <span>Họ và tên sinh viên</span>
              <span className="font-label-code text-[11px] text-primary uppercase font-bold">Bắt buộc</span>
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-outline pointer-events-none text-[20px]">person</span>
              <input
                id="fullname"
                type="text"
                required
                value={form.fullName}
                onChange={(e) => setField('fullName', e.target.value)}
                placeholder="VD: Vũ Đức An Ninh"
                className="w-full pl-10 pr-3 py-2.5 bg-surface-container-low text-on-surface font-body-md text-body-md rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-secondary border border-transparent focus:border-secondary transition-all"
              />
            </div>
            {fieldErrors.fullName && <p className="text-xs text-error">{fieldErrors.fullName}</p>}
          </div>

          {/* MSSV & Major Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-body-sm text-body-sm text-on-surface font-semibold" htmlFor="mssv">
                Mã số sinh viên (MSSV)
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-outline pointer-events-none text-[20px]">badge</span>
                <input
                  id="mssv"
                  type="text"
                  required
                  maxLength={12}
                  value={form.studentCode}
                  onChange={(e) => setField('studentCode', e.target.value)}
                  placeholder="VD: 231230859"
                  className="w-full pl-10 pr-3 py-2.5 bg-surface-container-low text-on-surface font-body-md text-body-md rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-secondary border border-transparent focus:border-secondary transition-all font-label-code"
                />
              </div>
              {fieldErrors.studentCode && <p className="text-xs text-error">{fieldErrors.studentCode}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-body-sm text-body-sm text-on-surface font-semibold" htmlFor="major">
                Ngành đào tạo
              </label>
              <CustomSelect
                value={form.majorId ? String(form.majorId) : ''}
                onChange={(val) => setField('majorId', Number(val))}
                options={[
                  { value: '', label: '-- Chọn ngành đào tạo --' },
                  ...majors.map((m) => ({ value: String(m.id), label: m.name })),
                ]}
                placeholder="-- Chọn ngành đào tạo --"
                icon="account_tree"
                className="w-full"
              />
              {fieldErrors.majorId && <p className="text-xs text-error">{fieldErrors.majorId}</p>}
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="font-body-sm text-body-sm text-on-surface font-semibold" htmlFor="email">
              Email học thuật UTC
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-outline pointer-events-none text-[20px]">alternate_email</span>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                placeholder="ninh231230859@utc.edu.vn"
                className="w-full pl-10 pr-3 py-2.5 bg-surface-container-low text-on-surface font-body-md text-body-md rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-secondary border border-transparent focus:border-secondary transition-all font-label-code"
              />
            </div>
            <p className="font-caption text-caption text-on-surface-variant flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[14px] text-secondary">info</span>
              <span>Sử dụng email tên miền <strong className="text-primary">@utc.edu.vn</strong> hoặc <strong className="text-primary">@st.utc.edu.vn</strong></span>
            </p>
            {fieldErrors.email && <p className="text-xs text-error">{fieldErrors.email}</p>}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="font-body-sm text-body-sm text-on-surface font-semibold" htmlFor="password">
              Mật khẩu tài khoản
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-outline pointer-events-none text-[20px]">lock</span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password}
                onChange={(e) => setField('password', e.target.value)}
                placeholder="Tối thiểu 8 ký tự, có số &amp; chữ hoa"
                className="w-full pl-10 pr-10 py-2.5 bg-surface-container-low text-on-surface font-body-md text-body-md rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-secondary border border-transparent focus:border-secondary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-outline hover:text-on-surface flex items-center justify-center p-0.5"
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {/* Strength Bar */}
            <div className="flex flex-col gap-1 mt-1">
              <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden flex">
                <div
                  className={`h-full transition-all duration-300 ${strength.color}`}
                  style={{ width: strength.width }}
                />
              </div>
              <div className="flex justify-between items-center font-caption text-caption">
                <span className={strength.textColor}>{strength.label}</span>
                <span className="text-on-surface-variant">Tối thiểu 8 ký tự, chữ hoa, số</span>
              </div>
            </div>
            {fieldErrors.password && <p className="text-xs text-error">{fieldErrors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label className="font-body-sm text-body-sm text-on-surface font-semibold" htmlFor="confirmPassword">
              Xác nhận mật khẩu
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-outline pointer-events-none text-[20px]">verified_user</span>
              <input
                id="confirmPassword"
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) => setField('confirmPassword', e.target.value)}
                placeholder="Nhập lại mật khẩu vừa tạo"
                className="w-full pl-10 pr-10 py-2.5 bg-surface-container-low text-on-surface font-body-md text-body-md rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-secondary border border-transparent focus:border-secondary transition-all"
              />
              {isPasswordMatch && (
                <div className="absolute right-3 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
                </div>
              )}
            </div>
            {isPasswordMatch && (
              <p className="font-caption text-caption text-secondary flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">done</span>
                Mật khẩu xác nhận hoàn toàn khớp.
              </p>
            )}
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start gap-2.5 pt-1">
            <input
              id="terms"
              type="checkbox"
              required
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-primary focus:ring-0 cursor-pointer accent-primary"
            />
            <label htmlFor="terms" className="font-body-sm text-body-sm text-on-surface cursor-pointer select-none">
              Tôi đồng ý với <span className="text-primary font-semibold hover:underline">Quy chế chia sẻ học liệu</span> và cam kết tuân thủ quy định <span className="text-primary font-semibold hover:underline">Bản quyền Khoa CNTT UTC</span>.
            </label>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-primary text-on-primary font-headline-sm text-headline-sm rounded-lg shadow-md hover:bg-primary-container active:scale-[0.99] transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <span className="font-bold">Đăng ký tài khoản</span>
                <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">
                  arrow_forward
                </span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-2">
            <div className="w-full h-px bg-surface-container-highest"></div>
            <span className="absolute bg-surface-container-lowest px-3 font-caption text-[11px] text-on-surface-variant uppercase tracking-wider">
              Hoặc đăng nhập sinh viên
            </span>
          </div>

          {/* Bottom Login Link */}
          <div className="pt-2 flex justify-center text-center">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Đã có tài khoản sinh viên?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline ml-1">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </form>
      </div>

      <footer className="mt-8 text-center flex flex-col items-center gap-1 text-on-surface-variant font-caption text-caption">
        <div className="flex items-center gap-2 text-outline font-medium">
          <span>KHOA CÔNG NGHỆ THÔNG TIN</span>
          <span>•</span>
          <span>TRƯỜNG ĐẠI HỌC GIAO THÔNG VẬN TẢI</span>
        </div>
        <p>&copy; 2026 Khoa CNTT - UTC. Bản quyền tài liệu và giáo trình điện tử được bảo lưu.</p>
      </footer>
    </div>
  )
}
