import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<'info' | 'password' | 'notifications'>('info')
  const [fullName, setFullName] = useState(user?.fullName || 'Vũ Đức An Ninh')
  const [personalEmail, setPersonalEmail] = useState('anninh.dev@gmail.com')
  const [phoneNumber, setPhoneNumber] = useState('0987 654 321')
  const [bio, setBio] = useState('Sinh viên ngành Công nghệ phần mềm & Hệ thống thông tin. Quan tâm nghiên cứu kiến trúc phân tán, Microservices và Cloud Native.')
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Password state
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwdMsg, setPwdMsg] = useState('')

  // Notifications
  const [notifyApproval, setNotifyApproval] = useState(true)
  const [notifyComment, setNotifyComment] = useState(true)
  const [notifyWeekly, setNotifyWeekly] = useState(false)

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault()
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setPwdMsg('Mật khẩu xác nhận không khớp.')
      return
    }
    if (newPassword.length < 8) {
      setPwdMsg('Mật khẩu mới phải có ít nhất 8 ký tự.')
      return
    }
    setPwdMsg('Đã đổi mật khẩu thành công!')
    setOldPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setTimeout(() => setPwdMsg(''), 3000)
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface antialiased">
      <Navbar />

      <main className="w-full pt-20 pb-16 flex-grow bg-surface">
        <div className="max-w-7xl mx-auto px-4 lg:px-gutter-desktop space-y-6">
          {/* Header Block with Swiss Academic Tagging */}
          <div className="bg-surface-container-low p-6 lg:p-8 rounded-xl border border-surface-container shadow-xs">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-primary text-on-primary font-label-code text-caption tracking-wider uppercase font-bold rounded">
                    UTC-FIT IDENT V2.4
                  </span>
                  <span className="font-label-code text-caption text-on-surface-variant uppercase tracking-wider">
                    CỔNG ĐỊNH DANH HỌC THUẬT NỘI BỘ
                  </span>
                </div>
                <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
                  Hồ Sơ Cá Nhân &amp; Tài Khoản
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                  Quản lý thông tin định danh học thuật, liên kết số và trạng thái bảo mật của bạn tại Khoa CNTT UTC.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="block font-label-code text-caption uppercase text-on-surface-variant">Trạng thái định danh</span>
                  <span className="inline-flex items-center gap-1.5 font-label-code text-caption font-bold text-primary">
                    <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                    ĐÃ XÁC THỰC UTC ID
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Asymmetric Workspace Layout: 4 cols Left + 8 cols Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Academic Persona Manifest (4 cols) */}
            <aside className="lg:col-span-4 flex flex-col gap-6">
              {/* Identity Card */}
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-container shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-surface-container text-caption font-label-code">
                  <span className="text-on-surface-variant font-bold">[NODE // {user?.studentCode || 'UTC-K64'}]</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">ACTIVE</span>
                </div>

                {/* Avatar Module */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative group">
                    <div className="w-28 h-28 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-3xl shadow-md border-4 border-surface-container">
                      {user?.fullName?.charAt(0) || 'U'}
                    </div>
                  </div>
                  <div className="mt-4">
                    <h2 className="font-headline-sm text-headline-sm font-bold text-primary tracking-tight">
                      {user?.fullName || 'Vũ Đức An Ninh'}
                    </h2>
                    <div className="mt-1 flex items-center justify-center gap-2">
                      <span className="font-label-code text-body-sm font-bold text-on-surface-variant">
                        MSSV: {user?.studentCode || '231230859'}
                      </span>
                    </div>
                    <div className="mt-2">
                      <span className="inline-block px-3 py-1 bg-primary text-on-primary font-label-code text-[11px] font-bold tracking-wider uppercase rounded-full">
                        {user?.role === 'ADMIN' ? 'BAN QUẢN TRỊ KHOA' : 'SINH VIÊN (K64 - CNTT)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Official Email Attribute */}
                <div className="bg-surface-container-low p-3.5 rounded-lg border border-surface-container">
                  <div className="flex items-center justify-between">
                    <span className="font-label-code text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
                      Email UTC xác thực
                    </span>
                    <span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
                  </div>
                  <p className="font-label-code text-body-sm font-semibold text-primary mt-1 break-all select-all">
                    {user?.email || 'anninh231230859@utc.edu.vn'}
                  </p>
                </div>

                {/* Academic Contribution Telemetry */}
                <div className="space-y-3 pt-2 border-t border-surface-container">
                  <div className="flex items-center justify-between">
                    <span className="font-label-code text-[11px] uppercase tracking-wider font-bold text-on-surface">
                      Đóng góp học thuật
                    </span>
                    <span className="font-label-code text-[10px] px-2 py-0.5 bg-secondary text-on-secondary font-bold rounded">
                      TOP 5%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-surface-container-low p-2.5 rounded-lg text-center">
                      <span className="block font-headline-sm font-bold text-primary">06</span>
                      <span className="font-caption text-[11px] text-on-surface-variant">Tài liệu</span>
                    </div>
                    <div className="bg-surface-container-low p-2.5 rounded-lg text-center">
                      <span className="block font-headline-sm font-bold text-on-surface">14.8k</span>
                      <span className="font-caption text-[11px] text-on-surface-variant">Lượt xem</span>
                    </div>
                    <div className="bg-surface-container-low p-2.5 rounded-lg text-center">
                      <span className="block font-headline-sm font-bold text-secondary">920</span>
                      <span className="font-caption text-[11px] text-on-surface-variant">Điểm EXP</span>
                    </div>
                  </div>

                  {/* Academic Progression Bar */}
                  <div className="bg-surface-container-low p-3 rounded-lg">
                    <div className="flex justify-between font-label-code text-[11px] text-on-surface-variant mb-1">
                      <span>HẠNG HỌC HỘI // CẤP BẬC V</span>
                      <span className="font-bold text-primary">920 / 1000 EXP</span>
                    </div>
                    <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Integrated Security Snapshot */}
                <div className="space-y-2 pt-2 border-t border-surface-container">
                  <span className="block font-label-code text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
                    Bảo mật tích hợp
                  </span>
                  <div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded-lg text-body-sm">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-primary">security</span>
                      <span className="font-body-sm font-medium">Bảo vệ 2FA (OTP UTC)</span>
                    </div>
                    <span className="px-2 py-0.5 bg-primary text-on-primary font-label-code text-[10px] font-bold rounded">
                      BẬT
                    </span>
                  </div>
                </div>

                {/* Sign Out Action */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      logout()
                      navigate('/login')
                    }}
                    type="button"
                    className="w-full flex items-center justify-center gap-2 bg-error hover:bg-error/90 text-on-error px-4 py-2.5 font-label-code text-body-sm font-bold uppercase rounded-lg transition-all cursor-pointer shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    <span>Đăng xuất khỏi hệ thống</span>
                  </button>
                </div>
              </div>

              {/* Guidelines Callout */}
              <div className="bg-surface-container-lowest p-5 rounded-xl border border-surface-container flex items-start gap-3">
                <div className="w-8 h-8 bg-primary text-on-primary rounded-lg flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">info</span>
                </div>
                <div>
                  <h3 className="font-body-sm font-bold text-on-surface">Lưu ý bản quyền Khoa CNTT</h3>
                  <p className="font-caption text-on-surface-variant mt-1 leading-relaxed">
                    Mọi tài liệu tải lên hệ thống chịu sự giám sát từ Hội đồng Khoa học Khoa CNTT - ĐH Giao thông Vận tải. Hãy đảm bảo tuân thủ li-xăng học thuật.
                  </p>
                </div>
              </div>
            </aside>

            {/* Right Column: Settings & Forms (8 cols) */}
            <main className="lg:col-span-8 flex flex-col gap-6">
              {/* Tab Navigation Bar */}
              <div className="bg-surface-container-lowest p-2 rounded-xl border border-surface-container shadow-xs flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('info')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-headline-sm text-body-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'info'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">badge</span>
                  <span>Thông tin cá nhân</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('password')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-headline-sm text-body-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'password'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">key</span>
                  <span>Đổi mật khẩu</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('notifications')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-headline-sm text-body-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'notifications'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">notifications</span>
                  <span>Cài đặt thông báo</span>
                </button>
              </div>

              {/* TAB 1: THÔNG TIN CÁ NHÂN */}
              {activeTab === 'info' && (
                <div className="bg-surface-container-lowest p-6 lg:p-8 rounded-xl border border-surface-container shadow-xs space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-surface-container">
                    <span className="font-label-code text-caption uppercase tracking-wider text-on-surface-variant font-bold">
                      [EDIT FORM // THÔNG TIN HỌC THUẬT]
                    </span>
                    <span className="font-label-code text-caption text-secondary font-bold">TRƯỜNG CNTT - UTC</span>
                  </div>

                  {saveSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-body-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px]">check_circle</span>
                      <span>Đã lưu cập nhật thông tin cá nhân thành công!</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveInfo} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block font-label-code text-caption uppercase tracking-wider font-bold text-on-surface mb-2">
                          Họ và tên sinh viên <span className="text-secondary">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full px-4 py-2.5 bg-surface-container-low text-on-surface font-body-md text-body-md rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-secondary border border-transparent focus:border-secondary transition-all"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block font-label-code text-caption uppercase tracking-wider font-bold text-on-surface">
                            Mã sinh viên (MSSV)
                          </label>
                          <span className="font-label-code text-[11px] text-on-surface-variant uppercase font-bold">Cố định</span>
                        </div>
                        <input
                          type="text"
                          readOnly
                          value={user?.studentCode || '231230859'}
                          className="w-full px-4 py-2.5 bg-surface-container text-on-surface-variant font-label-code text-body-sm font-bold rounded-lg cursor-not-allowed select-all border border-surface-container"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block font-label-code text-caption uppercase tracking-wider font-bold text-on-surface mb-2">
                          Email cá nhân phụ (Nhận sao lưu)
                        </label>
                        <input
                          type="email"
                          value={personalEmail}
                          onChange={(e) => setPersonalEmail(e.target.value)}
                          placeholder="anninh.dev@gmail.com"
                          className="w-full px-4 py-2.5 bg-surface-container-low text-on-surface font-body-md text-body-md rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-secondary border border-transparent focus:border-secondary transition-all"
                        />
                        <p className="font-caption text-caption text-on-surface-variant mt-1">Dùng để khôi phục mật khẩu khi mất quyền truy cập tài khoản trường.</p>
                      </div>

                      <div>
                        <label className="block font-label-code text-caption uppercase tracking-wider font-bold text-on-surface mb-2">
                          Số điện thoại liên hệ
                        </label>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="0987 654 321"
                          className="w-full px-4 py-2.5 bg-surface-container-low text-on-surface font-body-md text-body-md rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-secondary border border-transparent focus:border-secondary transition-all"
                        />
                        <p className="font-caption text-caption text-on-surface-variant mt-1">Chỉ hiển thị với cố vấn học tập và ban chủ nhiệm bộ môn.</p>
                      </div>
                    </div>

                    <div>
                      <label className="block font-label-code text-caption uppercase tracking-wider font-bold text-on-surface mb-2">
                        Giới thiệu bản thân &amp; Hướng nghiên cứu
                      </label>
                      <textarea
                        rows={4}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full px-4 py-2.5 bg-surface-container-low text-on-surface font-body-md text-body-md rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-secondary border border-transparent focus:border-secondary transition-all leading-relaxed"
                      />
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-body-sm font-bold rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">save</span>
                        <span>Lưu cập nhật hồ sơ</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 2: ĐỔI MẬT KHẨU */}
              {activeTab === 'password' && (
                <div className="bg-surface-container-lowest p-6 lg:p-8 rounded-xl border border-surface-container shadow-xs space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-surface-container">
                    <span className="font-label-code text-caption uppercase tracking-wider text-on-surface-variant font-bold">
                      [SECURITY // ĐỔI MẬT KHẨU XÁC THỰC]
                    </span>
                  </div>

                  {pwdMsg && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-body-sm">
                      {pwdMsg}
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                    <div>
                      <label className="block font-label-code text-caption uppercase font-bold text-on-surface mb-1.5">
                        Mật khẩu hiện tại
                      </label>
                      <input
                        type="password"
                        required
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full px-4 py-2.5 bg-surface-container-low text-on-surface rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-secondary border border-transparent focus:border-secondary transition-all"
                      />
                    </div>

                    <div>
                      <label className="block font-label-code text-caption uppercase font-bold text-on-surface mb-1.5">
                        Mật khẩu mới (Tối thiểu 8 ký tự)
                      </label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2.5 bg-surface-container-low text-on-surface rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-secondary border border-transparent focus:border-secondary transition-all"
                      />
                    </div>

                    <div>
                      <label className="block font-label-code text-caption uppercase font-bold text-on-surface mb-1.5">
                        Xác nhận mật khẩu mới
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2.5 bg-surface-container-low text-on-surface rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-secondary border border-transparent focus:border-secondary transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      className="mt-2 px-6 py-2.5 bg-primary text-on-primary font-headline-sm text-body-sm font-bold rounded-lg shadow-sm hover:bg-primary-container transition-all cursor-pointer"
                    >
                      Cập nhật mật khẩu mới
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 3: CÀI ĐẶT THÔNG BÁO */}
              {activeTab === 'notifications' && (
                <div className="bg-surface-container-lowest p-6 lg:p-8 rounded-xl border border-surface-container shadow-xs space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-surface-container">
                    <span className="font-label-code text-caption uppercase tracking-wider text-on-surface-variant font-bold">
                      [PREFERENCES // THÔNG BÁO HỌC THUẬT]
                    </span>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-start gap-3 p-3 bg-surface-container-low rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifyApproval}
                        onChange={(e) => setNotifyApproval(e.target.checked)}
                        className="mt-1 w-4 h-4 accent-primary"
                      />
                      <div>
                        <span className="font-body-sm font-bold text-primary block">Thông báo kết quả kiểm duyệt đề tài</span>
                        <span className="text-caption text-on-surface-variant">Gửi email khi đồ án hoặc tài liệu được Hội đồng Khoa phê duyệt hoặc yêu cầu chỉnh sửa.</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 bg-surface-container-low rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifyComment}
                        onChange={(e) => setNotifyComment(e.target.checked)}
                        className="mt-1 w-4 h-4 accent-primary"
                      />
                      <div>
                        <span className="font-body-sm font-bold text-primary block">Tương tác và đánh giá mới</span>
                        <span className="text-caption text-on-surface-variant">Thông báo khi có sinh viên khác lưu bộ sưu tập hoặc để lại đánh giá tài liệu của bạn.</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 bg-surface-container-low rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifyWeekly}
                        onChange={(e) => setNotifyWeekly(e.target.checked)}
                        className="mt-1 w-4 h-4 accent-primary"
                      />
                      <div>
                        <span className="font-body-sm font-bold text-primary block">Bản tin học liệu nổi bật hàng tuần</span>
                        <span className="text-caption text-on-surface-variant">Tổng hợp các đồ án xuất sắc và bài giảng mới cập nhật từ Khoa CNTT.</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
