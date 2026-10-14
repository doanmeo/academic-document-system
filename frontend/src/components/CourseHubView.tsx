import React, { useState, useEffect } from 'react'
import type { Subject, DocumentSummary, CourseHub } from '../types'
import { documentApi } from '../api/documentApi'
import { catalogApi } from '../api/catalogApi'
import BookCard from './BookCard'
import LoadingSpinner from './LoadingSpinner'
import CustomSelect from './ui/CustomSelect'

interface CourseHubViewProps {
  onSelectDoc: (doc: DocumentSummary) => void
  onViewPdf: (doc: DocumentSummary) => void
  initialSubjectId?: number
}

export default function CourseHubView({
  onSelectDoc,
  onViewPdf,
  initialSubjectId,
}: CourseHubViewProps) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(
    initialSubjectId || null
  )
  const [hubData, setHubData] = useState<CourseHub | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState<'all' | 'lectures' | 'labs' | 'projects' | 'exams'>('all')

  // Load subjects
  useEffect(() => {
    catalogApi
      .getSubjects()
      .then((res: any) => {
        const list: Subject[] = Array.isArray(res) ? res : res?.data || []
        setSubjects(list)
        if (!selectedSubjectId && list.length > 0) {
          // Default to first subject
          setSelectedSubjectId(list[0].id)
        }
      })
      .catch(console.error)
  }, [])

  // Load Course Hub when subject changes
  useEffect(() => {
    if (!selectedSubjectId) return
    setLoading(true)
    documentApi
      .getCourseHub(selectedSubjectId)
      .then((data) => {
        setHubData(data)
      })
      .catch((err) => {
        console.error('Lỗi khi tải Course Hub:', err)
        setHubData(null)
      })
      .finally(() => setLoading(false))
  }, [selectedSubjectId])

  return (
    <div className="space-y-6">
      {/* Subject Header & Selector */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-md border border-indigo-800/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
                SỔ TAY HỌC PHẦN BỘ MÔN
              </span>
              <span className="text-xs text-indigo-200">Khoa CNTT · UTC</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>{hubData?.subject?.name || 'Gói Học Liệu Chuẩn Bộ Môn'}</span>
              {hubData?.subject?.code && (
                <span className="text-sm px-2 py-0.5 bg-white/10 rounded-md font-mono text-indigo-200">
                  {hubData.subject.code}
                </span>
              )}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Học liệu chính khóa được chuẩn hóa theo từng học phần: Bài giảng chính thức, tài liệu hướng dẫn thực hành Lab, đồ án mẫu và đề cương ôn tập.
            </p>
          </div>

          {/* Quick Subject Dropdown */}
          <div className="w-full sm:w-72 shrink-0">
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Chuyển đổi học phần:
            </label>
            <CustomSelect
              value={selectedSubjectId ? String(selectedSubjectId) : ''}
              onChange={(val) => {
                if (val) setSelectedSubjectId(Number(val))
              }}
              options={subjects.map((s) => ({ value: String(s.id), label: `${s.name} (${s.code || ''})` }))}
              placeholder="Chọn học phần"
              className="w-full bg-white text-slate-900"
            />
          </div>
        </div>

        {/* Quick Pills for popular subjects */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 mt-4 border-t border-white/10 no-scrollbar">
          <span className="text-[11px] font-semibold text-indigo-200 shrink-0">Học phần hot:</span>
          {subjects.slice(0, 7).map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSubjectId(s.id)}
              className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-all cursor-pointer ${
                selectedSubjectId === s.id
                  ? 'bg-white text-blue-950 font-bold shadow-xs'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center">
          <LoadingSpinner />
          <p className="text-xs text-slate-500 mt-3 font-medium">Đang tải gói học liệu chuẩn bộ môn...</p>
        </div>
      ) : hubData ? (
        <div className="space-y-6">
          {/* Metrics & Instructors Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-medium text-slate-500 block">Tổng tài liệu</span>
              <span className="text-xl font-bold text-slate-900 mt-0.5 block">{hubData.totalDocuments}</span>
              <span className="text-[10px] text-slate-400">Đã kiểm duyệt</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-medium text-blue-600 block">📚 Slide bài giảng</span>
              <span className="text-xl font-bold text-blue-950 mt-0.5 block">{hubData.totalLectures}</span>
              <span className="text-[10px] text-slate-400">Giáo trình chính thức</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-medium text-emerald-600 block">🧪 Hướng dẫn Lab</span>
              <span className="text-xl font-bold text-emerald-950 mt-0.5 block">{hubData.totalLabs}</span>
              <span className="text-[10px] text-slate-400">Bài tập thực hành</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-medium text-purple-600 block">🏆 Đồ án & BTL mẫu</span>
              <span className="text-xl font-bold text-purple-950 mt-0.5 block">{hubData.totalProjects}</span>
              <span className="text-[10px] text-slate-400">Kèm link GitHub repo</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
              <span className="text-[11px] font-medium text-amber-600 block">📝 Đề thi & Đề cương</span>
              <span className="text-xl font-bold text-amber-950 mt-0.5 block">{hubData.totalExams}</span>
              <span className="text-[10px] text-slate-400">Ôn tập học phần</span>
            </div>
          </div>

          {/* Instructor Advisors for this Subject */}
          {hubData.instructorAdvisors && hubData.instructorAdvisors.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-base">👨‍🏫</span>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Giảng viên / Ban cố vấn phụ trách học phần:
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {hubData.instructorAdvisors.map((adv, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-white border border-slate-200 text-slate-800 text-xs font-medium rounded-lg shadow-2xs flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    {adv}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Category Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Tất cả ({hubData.totalDocuments})
            </button>
            <button
              onClick={() => setActiveCategory('lectures')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeCategory === 'lectures'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              <span>📚 Slide & Bài giảng</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {hubData.totalLectures}
              </span>
            </button>
            <button
              onClick={() => setActiveCategory('labs')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeCategory === 'labs'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
              }`}
            >
              <span>🧪 Hướng dẫn Lab & Thực hành</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {hubData.totalLabs}
              </span>
            </button>
            <button
              onClick={() => setActiveCategory('projects')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeCategory === 'projects'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-600 hover:bg-purple-50 hover:text-purple-700'
              }`}
            >
              <span>🏆 Đồ án & BTL mẫu (GitHub)</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {hubData.totalProjects}
              </span>
            </button>
            <button
              onClick={() => setActiveCategory('exams')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeCategory === 'exams'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-600 hover:bg-amber-50 hover:text-amber-700'
              }`}
            >
              <span>📝 Đề thi & Đề cương</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {hubData.totalExams}
              </span>
            </button>
          </div>

          {/* Section: Slide bài giảng */}
          {(activeCategory === 'all' || activeCategory === 'lectures') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span className="text-blue-600">📚</span>
                  <span>Slide & Giáo trình Bộ môn</span>
                  <span className="text-xs text-slate-400 font-normal">({hubData.lectures.length})</span>
                </h3>
              </div>
              {hubData.lectures.length === 0 ? (
                <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
                  Chưa có slide bài giảng được đăng tải cho môn học này.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {hubData.lectures.map((doc) => (
                    <BookCard
                      key={doc.id}
                      doc={doc}
                      onClick={() => onSelectDoc(doc)}
                      onPreviewPdf={() => onViewPdf(doc)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section: Hướng dẫn thực hành Lab */}
          {(activeCategory === 'all' || activeCategory === 'labs') && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span className="text-emerald-600">🧪</span>
                  <span>Hướng dẫn Thực hành & Bài tập Lab</span>
                  <span className="text-xs text-slate-400 font-normal">({hubData.labs.length})</span>
                </h3>
              </div>
              {hubData.labs.length === 0 ? (
                <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
                  Chưa có tài liệu Lab thực hành cho môn học này.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {hubData.labs.map((doc) => (
                    <BookCard
                      key={doc.id}
                      doc={doc}
                      onClick={() => onSelectDoc(doc)}
                      onPreviewPdf={() => onViewPdf(doc)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section: Đồ án & BTL mẫu */}
          {(activeCategory === 'all' || activeCategory === 'projects') && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span className="text-purple-600">🏆</span>
                  <span>BTL & Đồ án Tiêu biểu (Tham khảo mã nguồn)</span>
                  <span className="text-xs text-slate-400 font-normal">({hubData.projects.length})</span>
                </h3>
              </div>
              {hubData.projects.length === 0 ? (
                <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
                  Chưa có đồ án hoặc BTL mẫu được duyệt cho môn học này.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {hubData.projects.map((doc) => (
                    <BookCard
                      key={doc.id}
                      doc={doc}
                      onClick={() => onSelectDoc(doc)}
                      onPreviewPdf={() => onViewPdf(doc)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section: Đề thi & Đề cương */}
          {(activeCategory === 'all' || activeCategory === 'exams') && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span className="text-amber-600">📝</span>
                  <span>Đề thi & Đề cương Ôn tập Học phần</span>
                  <span className="text-xs text-slate-400 font-normal">({hubData.exams.length})</span>
                </h3>
              </div>
              {hubData.exams.length === 0 ? (
                <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
                  Chưa có đề thi hoặc đề cương cho môn học này.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {hubData.exams.map((doc) => (
                    <BookCard
                      key={doc.id}
                      doc={doc}
                      onClick={() => onSelectDoc(doc)}
                      onPreviewPdf={() => onViewPdf(doc)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <p className="text-sm text-slate-600">Vui lòng chọn một học phần để xem gói tài liệu chuẩn Bộ môn.</p>
        </div>
      )}
    </div>
  )
}
