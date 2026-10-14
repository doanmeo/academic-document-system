import React, { useState, useEffect } from 'react'
import type { Subject, Major, TopicComparisonResult } from '../types'
import { documentApi } from '../api/documentApi'
import { catalogApi } from '../api/catalogApi'
import LoadingSpinner from './LoadingSpinner'
import CustomSelect from './ui/CustomSelect'

export default function TopicNoveltyChecker() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [majors, setMajors] = useState<Major[]>([])
  const [advisors, setAdvisors] = useState<string[]>([])

  // Inputs
  const [title, setTitle] = useState('')
  const [subjectId, setSubjectId] = useState<number | ''>('')
  const [majorId, setMajorId] = useState<number | ''>('')
  const [advisorName, setAdvisorName] = useState('')
  const [expectedMethodology, setExpectedMethodology] = useState('')

  // State
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TopicComparisonResult | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  // Quick sample topics to test
  const SAMPLE_TOPICS = [
    {
      title: 'Phát hiện mã độc và tấn công mạng DDoS bằng thuật toán Random Forest',
      subjectName: 'An toàn và bảo mật thông tin',
      advisor: 'TS. Nguyễn Đức Hiếu',
    },
    {
      title: 'Hệ thống nhận diện biển số xe tự động phục vụ trạm thu phí ETC',
      subjectName: 'Trí tuệ nhân tạo',
      advisor: 'PGS. TS. Trần Nguyên Hưng',
    },
    {
      title: 'Xây dựng website bán linh kiện máy tính bằng Spring Boot và React',
      subjectName: 'Phát triển phần mềm mã nguồn mở',
      advisor: 'ThS. Hoàng Thị Phương',
    },
  ]

  useEffect(() => {
    Promise.all([catalogApi.getSubjects(), catalogApi.getMajors(), catalogApi.getAdvisors()])
      .then(([subRes, majRes, advRes]: any[]) => {
        setSubjects(Array.isArray(subRes) ? subRes : subRes?.data || [])
        setMajors(Array.isArray(majRes) ? majRes : majRes?.data || [])
        setAdvisors(Array.isArray(advRes) ? advRes : advRes?.data || [])
      })
      .catch(console.error)
  }, [])

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!title.trim() || title.trim().length < 4) return

    setLoading(true)
    setHasSearched(true)
    try {
      const data = await documentApi.compareTopics({
        title: title.trim(),
        subjectId: subjectId ? Number(subjectId) : undefined,
        majorId: majorId ? Number(majorId) : undefined,
        advisorName: advisorName.trim() || undefined,
        expectedMethodology: expectedMethodology.trim() || undefined,
      })
      setResult(data)
    } catch (err) {
      console.error('Lỗi phân tích tính mới:', err)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectSample = (sample: (typeof SAMPLE_TOPICS)[0]) => {
    setTitle(sample.title)
    setAdvisorName(sample.advisor)
    const matchSub = subjects.find((s) => s.name.toLowerCase().includes(sample.subjectName.toLowerCase()))
    if (matchSub) setSubjectId(matchSub.id)
  }

  const getRiskBadge = (level: string) => {
    if (level === 'HIGH_DUPLICATION_RISK') {
      return {
        label: 'CẢNH BÁO TRÙNG LẶP CAO',
        color: 'bg-red-50 text-red-700 border-red-200',
        badge: 'bg-red-600 text-white',
        desc: 'Đề tài có độ trùng lớn với đồ án khóa trước. Cần đổi công nghệ lõi hoặc đổi phạm vi đối tượng khảo sát.',
      }
    }
    if (level === 'MEDIUM_SIMILARITY') {
      return {
        label: 'TRÙNG LẶP TRUNG BÌNH (CÓ THỂ KẾ THỪA)',
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        badge: 'bg-amber-600 text-white',
        desc: 'Có điểm tương đồng về chủ đề hoặc công nghệ. Bạn nên tham khảo mã nguồn khóa trước và bổ sung các tính năng nâng cao.',
      }
    }
    return {
      label: 'TÍNH MỚI CAO / Ý TƯỞNG ĐỘC LẬP',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      badge: 'bg-emerald-600 text-white',
      desc: 'Ý tưởng đề tài có hướng tiếp cận riêng biệt, ít bị trùng lặp với cơ sở dữ liệu đồ án đã nghiệm thu trong Khoa.',
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-6 text-white border border-indigo-900/50 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                BẢN ĐỒ KẾ THỪA HỌC THUẬT
              </span>
              <span className="text-xs text-slate-300">Khoa CNTT · ĐH Giao thông Vận tải</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Công cụ Đánh giá Tính mới &amp; Chống Trùng Đề tài</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Hệ thống đối soát tự động tên đề tài, môn học và hướng nghiên cứu với toàn bộ kho Khóa luận tốt nghiệp &amp; Đồ án mẫu đã nghiệm thu của Khoa để tìm góc tiếp cận đột phá.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs px-4 py-3 rounded-xl border border-white/10 text-center shrink-0">
            <span className="text-[11px] text-indigo-200 block font-medium">Cơ sở dữ liệu đối soát</span>
            <span className="text-lg font-bold text-white block mt-0.5">50+ Đồ án &amp; KLTN</span>
            <span className="text-[10px] text-slate-300">Khoa CNTT - UTC</span>
          </div>
        </div>

        {/* Quick Sample Links */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-white/10 text-xs">
          <span className="text-slate-300 text-[11px] font-medium">Thử nhanh đề tài mẫu:</span>
          {SAMPLE_TOPICS.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSample(s)}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-200 rounded-lg text-[11px] transition-colors cursor-pointer text-left"
            >
              {s.title.slice(0, 38)}...
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Input Form + Result Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: 5 cols */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="material-symbols-outlined text-[18px] text-indigo-600">tune</span>
            <span>Thông tin Đề tài dự kiến</span>
          </h3>

          <form onSubmit={handleAnalyze} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên đề tài / Hướng nghiên cứu <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Xây dựng hệ thống phát hiện tấn công mạng DDoS sử dụng mô hình học sâu CNN-LSTM..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden resize-none"
              />
              <span className="text-[10px] text-slate-400">Tối thiểu 5 ký tự để phân tích.</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Môn học / Học phần
                </label>
                <CustomSelect
                  value={subjectId ? String(subjectId) : ''}
                  onChange={(val) => setSubjectId(val ? Number(val) : '')}
                  options={[
                    { value: '', label: '-- Tất cả môn học --' },
                    ...subjects.map((s) => ({ value: String(s.id), label: s.name })),
                  ]}
                  placeholder="Chọn môn học"
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chuyên ngành
                </label>
                <CustomSelect
                  value={majorId ? String(majorId) : ''}
                  onChange={(val) => setMajorId(val ? Number(val) : '')}
                  options={[
                    { value: '', label: '-- Chọn chuyên ngành --' },
                    ...majors.map((m) => ({ value: String(m.id), label: `${m.name} (${m.code})` })),
                  ]}
                  placeholder="Chọn chuyên ngành"
                  className="w-full text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Giảng viên hướng dẫn dự kiến
              </label>
              <CustomSelect
                value={advisorName}
                onChange={(val) => setAdvisorName(val)}
                options={[
                  { value: '', label: '-- Chọn GVHD (hoặc để trống) --' },
                  ...advisors.map((adv) => ({ value: adv, label: adv })),
                ]}
                placeholder="Chọn GVHD"
                className="w-full text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phương pháp kỹ thuật / Công nghệ dự kiến (tùy chọn)
              </label>
              <input
                type="text"
                value={expectedMethodology}
                onChange={(e) => setExpectedMethodology(e.target.value)}
                placeholder="Ví dụ: React, Spring Boot, PyTorch, YOLOv8..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={loading || title.trim().length < 4}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang đối soát kho học liệu Khoa...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>Phân tích Tính mới &amp; Đối soát Trùng lặp</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Content: 7 cols */}
        <div className="lg:col-span-7 space-y-4">
          {!hasSearched && (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-3">
              <span className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-xl font-bold">
                💡
              </span>
              <h4 className="text-sm font-bold text-slate-800">Sẵn sàng đối soát ý tưởng đề tài</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Nhập tên đề tài của bạn ở biểu mẫu bên trái hoặc bấm chọn nhanh một trong các đề tài mẫu để nhận báo cáo đối soát độ trùng lặp và các góc tiếp cận mới.
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3 shadow-xs">
              <LoadingSpinner />
              <p className="text-xs font-semibold text-slate-700">Đang quét cơ sở dữ liệu khóa luận &amp; đồ án...</p>
              <p className="text-[11px] text-slate-400">Đang so khớp ngữ nghĩa môn học, giảng viên và từ khóa kỹ thuật</p>
            </div>
          )}

          {!loading && result && (
            <div className="space-y-4">
              {/* Verdict Card */}
              {(() => {
                const badge = getRiskBadge(result.riskLevel)
                const noveltyScore = Math.max(0, 100 - result.overallOverlapScore)
                return (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase ${badge.badge}`}>
                          {badge.label}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-2">{result.verdict}</h4>
                      </div>

                      {/* Novelty Gauge */}
                      <div className="flex items-center gap-3 shrink-0 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <div className="text-center">
                          <span className="text-[10px] text-slate-500 block">Độ trùng lặp</span>
                          <span className="text-base font-bold text-red-600">{result.overallOverlapScore}%</span>
                        </div>
                        <div className="h-6 w-px bg-slate-200" />
                        <div className="text-center">
                          <span className="text-[10px] text-slate-500 block">Chỉ số tính mới</span>
                          <span className="text-base font-bold text-emerald-600">{noveltyScore}%</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {badge.desc}
                    </p>

                    {/* Novelty Suggestions */}
                    {result.noveltyRecommendations && result.noveltyRecommendations.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                          <span className="text-indigo-600">🚀</span>
                          <span>Gợi ý tạo đột phá &amp; góc tiếp cận khác biệt từ Khoa:</span>
                        </span>
                        <div className="space-y-1.5">
                          {result.noveltyRecommendations.map((rec, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs text-indigo-950 flex items-start gap-2"
                            >
                              <span className="font-bold text-indigo-600">#{idx + 1}</span>
                              <span className="leading-relaxed">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* Matched Past Theses */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="text-slate-500">📑</span>
                    <span>Đồ án / Khóa luận tiền nhiệm liên quan ({result.matchedDocuments.length})</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">Tham khảo kế thừa học thuật</span>
                </div>

                {result.matchedDocuments.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">
                    Không tìm thấy đề tài nào có độ trùng đáng kể trong kho học liệu. Ý tưởng hoàn toàn độc lập!
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {result.matchedDocuments.map((m) => (
                      <div
                        key={m.id}
                        className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded">
                              REF: #{88000 + m.id}
                            </span>
                            <span className="text-xs font-bold text-slate-900 truncate block">
                              {m.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {m.subjectName} • {m.academicYearName} {m.advisorName ? `• GVHD: ${m.advisorName}` : ''}
                          </p>
                          <p className="text-[11px] text-amber-700 font-medium">
                            Điểm giao thoa: {m.overlappingAspects}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                          <span className="px-2 py-1 bg-amber-100 text-amber-900 font-bold text-[10px] rounded-lg">
                            {m.similarityScore}% trùng
                          </span>
                          {m.githubUrl && (
                            <a
                              href={m.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-slate-900 text-white hover:bg-indigo-600 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1"
                            >
                              <span>GitHub</span>
                              <span className="text-[10px]">↗</span>
                            </a>
                          )}
                          <a
                            href={`/documents/${m.id}`}
                            className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 hover:text-indigo-600 text-[11px] font-medium rounded-lg transition-colors"
                          >
                            Xem chi tiết
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
