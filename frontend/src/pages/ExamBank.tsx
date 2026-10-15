import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  GraduationCap,
  Search,
  Filter,
  CheckCircle2,
  Lightbulb,
  FileText,
  Download,
  Eye,
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  FileCheck2,
  ChevronRight,
  RotateCcw
} from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { documentApi } from '../api/documentApi'
import { catalogApi } from '../api/catalogApi'
import { DocumentSummary } from '../types/document'

export const ExamBank: React.FC = () => {
  const [exams, setExams] = useState<DocumentSummary[]>([])
  const [subjects, setSubjects] = useState<{ id: number; name: string; code: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('')
  const [onlyWithSolution, setOnlyWithSolution] = useState(false)

  useEffect(() => {
    fetchCatalogs()
    fetchExams()
  }, [])

  const fetchCatalogs = async () => {
    try {
      const subs = await catalogApi.getSubjects()
      setSubjects(subs)
    } catch {
      //
    }
  }

  const fetchExams = async () => {
    try {
      setLoading(true)
      const res = await documentApi.getDocuments({
        page: 0,
        size: 50,
      })
      const examDocs = res.content.filter(
        (d) =>
          d.documentTypeCode === 'EXAM' ||
          d.documentTypeCode === 'EXERCISE' ||
          d.examDifficulty ||
          d.title.toLowerCase().includes('đề thi') ||
          d.title.toLowerCase().includes('đáp án') ||
          d.title.toLowerCase().includes('ôn tập')
      )
      setExams(examDocs)
    } catch {
      //
    } finally {
      setLoading(false)
    }
  }

  const handleResetFilters = () => {
    setSearch('')
    setSelectedSubject('')
    setSelectedDifficulty('')
    setOnlyWithSolution(false)
  }

  const filteredExams = exams.filter((exam) => {
    if (search && !exam.title.toLowerCase().includes(search.toLowerCase()) && !exam.subjectName?.toLowerCase().includes(search.toLowerCase())) {
      return false
    }
    if (selectedSubject && exam.subjectId !== parseInt(selectedSubject, 10)) {
      return false
    }
    if (selectedDifficulty && exam.examDifficulty !== selectedDifficulty) {
      return false
    }
    if (onlyWithSolution && !exam.hasSolution) {
      return false
    }
    return true
  })

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 antialiased transition-colors duration-150">
      <Navbar />

      <main className="w-full pt-20 pb-16 flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-6">
            <Link to="/search" className="hover:text-blue-600 dark:hover:text-blue-400">Trang chủ</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-800 dark:text-slate-200 font-semibold">Kho Đề Thi & Đáp Án UTC</span>
          </div>

          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 text-white p-8 md:p-10 mb-8 shadow-md border border-blue-900/40">
            <div className="relative z-10 max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-200">
                <FileCheck2 className="w-4 h-4 text-amber-400" />
                <span>Kho Đề Thi Kết Thúc Học Phần &amp; Giữa Kỳ · Khoa CNTT UTC</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
                Kho Đề Thi Cũ &amp; Lời Bình Đề Thi UTC FIT
              </h1>
              <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed max-w-2xl">
                Hệ thống lưu trữ đề thi các năm học trước, phân loại theo độ khó, giảng viên phụ trách, có đáp án chi tiết và kinh nghiệm ôn thi từ các thế hệ sinh viên khóa trước.
              </p>
            </div>
          </div>

          {/* Filter bar */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-8 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên đề thi, mã môn..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Tất cả học phần</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.code} - {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Độ khó (Tất cả)</option>
                  <option value="EASY">Cơ bản (Qua môn / Điểm B)</option>
                  <option value="MEDIUM">Trung bình (Điểm B+ đến A)</option>
                  <option value="HARD">Nâng cao (Phân hóa xuất sắc A+)</option>
                </select>
              </div>

              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={onlyWithSolution}
                    onChange={(e) => setOnlyWithSolution(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-700 focus:ring-blue-600"
                  />
                  <span>Chỉ hiện đề có đáp án</span>
                </label>

                {(search || selectedSubject || selectedDifficulty || onlyWithSolution) && (
                  <button
                    onClick={handleResetFilters}
                    className="p-2 text-xs text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="Đặt lại bộ lọc"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Results grid */}
          {loading ? (
            <div className="py-20 text-center text-slate-400 text-xs">
              Đang tải danh sách đề thi học phần...
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs">
              <GraduationCap className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">Không tìm thấy đề thi phù hợp</h3>
              <p className="text-xs text-slate-400 mt-1">Thử thay đổi bộ lọc học phần hoặc từ khóa tìm kiếm</p>
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExams.map((exam) => (
                <div
                  key={exam.id}
                  className="flex flex-col justify-between bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200"
                >
                  <div>
                    {/* Header tags */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
                        {exam.subjectName}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {exam.hasSolution && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Có đáp án</span>
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            exam.examDifficulty === 'HARD'
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                              : exam.examDifficulty === 'EASY'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {exam.examDifficulty === 'HARD' ? 'Nâng cao (A+)' : exam.examDifficulty === 'EASY' ? 'Cơ bản (B)' : 'Trung bình (B+/A)'}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <Link
                      to={`/documents/${exam.id}`}
                      className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 text-sm sm:text-base line-clamp-2 transition-colors mb-2 block"
                    >
                      {exam.title}
                    </Link>

                    {/* Meta details */}
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 dark:text-slate-400 mb-3 font-mono">
                      {exam.examSemester && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{exam.examSemester}</span>
                        </span>
                      )}
                      {exam.advisorName && (
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-slate-400" />
                          <span>GV: {exam.advisorName}</span>
                        </span>
                      )}
                    </div>

                    {/* Exam Tips Callout */}
                    {exam.examTips && (
                      <div className="bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-xl p-3 text-xs text-amber-900 dark:text-amber-200 mb-4">
                        <div className="flex items-start gap-1.5">
                          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <p className="line-clamp-2 italic">{exam.examTips}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom action */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono text-[11px]">{exam.viewCount || 0} lượt xem</span>
                    <Link
                      to={`/documents/${exam.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem online</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default ExamBank
