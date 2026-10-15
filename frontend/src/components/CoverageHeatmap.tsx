import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Grid3X3,
  Search,
  PlusCircle,
  ExternalLink,
  BookOpen,
  Sparkles,
  Layers,
  CheckCircle2,
} from 'lucide-react'
import { documentApi } from '../api/documentApi'
import type { CoverageMatrix } from '../types/document'

export const CoverageHeatmap: React.FC = () => {
  const [data, setData] = useState<CoverageMatrix | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [filterKeyword, setFilterKeyword] = useState<string>('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchMatrix = async () => {
      setLoading(true)
      try {
        const matrix = await documentApi.getCoverageMatrix()
        setData(matrix)
      } catch (err) {
        console.error('Failed to load coverage matrix', err)
      } finally {
        setLoading(false)
      }
    }
    fetchMatrix()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-600">Đang khởi tạo bản đồ học liệu Khoa CNTT...</p>
      </div>
    )
  }

  if (!data || data.subjects.length === 0) {
    return (
      <div className="text-center p-12 bg-slate-50 rounded-2xl border border-slate-200">
        <p className="text-slate-500 text-sm">Chưa có dữ liệu độ phủ học liệu.</p>
      </div>
    )
  }

  // Lọc môn học theo từ khóa
  const filteredSubjects = data.subjects.filter(
    (s) =>
      s.code.toLowerCase().includes(filterKeyword.toLowerCase()) ||
      s.name.toLowerCase().includes(filterKeyword.toLowerCase())
  )

  // Tính toán thống kê tổng quan
  const totalSlots = data.subjects.length * data.types.length
  let filledSlots = 0
  let totalDocs = 0

  data.subjects.forEach((s) => {
    data.types.forEach((t) => {
      const count = data.cellCounts[`${s.id}_${t.code}`] || 0
      if (count > 0) filledSlots++
      totalDocs += count
    })
  })

  const coveragePercent = totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0

  // Màu sắc theo độ phủ (Heatmap)
  const getCellColor = (count: number) => {
    if (count === 0) return 'bg-slate-50 text-slate-400 hover:bg-amber-50 hover:text-amber-800'
    if (count <= 2) return 'bg-blue-50 text-blue-800 hover:bg-blue-100'
    if (count <= 5) return 'bg-blue-100 text-blue-900 font-bold hover:bg-blue-200'
    return 'bg-blue-600 text-white font-extrabold hover:bg-blue-700 shadow-2xs'
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-linear-to-br from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng học liệu đã duyệt</p>
            <p className="text-2xl font-black text-slate-900">{totalDocs}</p>
          </div>
        </div>

        <div className="p-4 bg-linear-to-br from-emerald-50 to-teal-50/50 rounded-2xl border border-emerald-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Môn học trong hệ thống</p>
            <p className="text-2xl font-black text-slate-900">{data.subjects.length} môn</p>
          </div>
        </div>

        <div className="p-4 bg-linear-to-br from-amber-50 to-orange-50/50 rounded-2xl border border-amber-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tỷ lệ lấp đầy kho tài liệu</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-slate-900">{coveragePercent}%</span>
              <span className="text-xs text-slate-500">({filledSlots}/{totalSlots} ô)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar / Search filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2">
          <Grid3X3 className="w-5 h-5 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900">Ma trận Độ phủ Học liệu (Môn học × Thể loại)</h2>
        </div>
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={filterKeyword}
            onChange={(e) => setFilterKeyword(e.target.value)}
            placeholder="Lọc môn học (mã môn, tên môn)..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
          />
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
        </div>
      </div>

      {/* Heatmap Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 font-bold text-slate-700 min-w-[220px]">
                  Môn học ({filteredSubjects.length})
                </th>
                {data.types.map((type) => (
                  <th
                    key={type.code}
                    className="py-3 px-3 font-semibold text-slate-700 text-center min-w-[120px]"
                  >
                    {type.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubjects.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-4">
                    <div className="font-semibold text-slate-900">{sub.name}</div>
                    <div className="text-[11px] font-mono text-slate-500">{sub.code}</div>
                  </td>
                  {data.types.map((type) => {
                    const key = `${sub.id}_${type.code}`
                    const count = data.cellCounts[key] || 0
                    const isZero = count === 0

                    return (
                      <td key={type.code} className="p-1.5 text-center">
                        <div
                          onClick={() => {
                            if (isZero) {
                              navigate(`/upload?subjectId=${sub.id}&type=${type.code}`)
                            } else {
                              navigate(`/search?subjectId=${sub.id}&type=${type.code}`)
                            }
                          }}
                          className={`group relative py-2 px-2.5 rounded-xl cursor-pointer transition-all border border-transparent ${
                            isZero ? 'hover:border-amber-300' : 'hover:border-blue-400'
                          } ${getCellColor(count)}`}
                          title={
                            isZero
                              ? `Chưa có ${type.label} cho môn ${sub.name}. Click để đóng góp tài liệu ngay!`
                              : `Có ${count} ${type.label} đã duyệt. Click để xem danh sách.`
                          }
                        >
                          <div className="flex items-center justify-center gap-1">
                            {isZero ? (
                              <span className="flex items-center gap-1 text-[11px] text-amber-700 group-hover:text-amber-900 font-medium">
                                <PlusCircle className="w-3 h-3 text-amber-600" />
                                <span className="hidden sm:inline">Cần nộp</span>
                                <span className="sm:hidden">0</span>
                              </span>
                            ) : (
                              <span className="text-xs font-bold inline-flex items-center gap-1">
                                {count}
                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend & Guide */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-800">Chú giải ma trận:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-slate-100 border border-slate-200"></span>
            <span>0 (Chưa có)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-blue-50 border border-blue-200"></span>
            <span>1 - 2</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-blue-100 border border-blue-300"></span>
            <span>3 - 5</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-blue-600"></span>
            <span className="font-medium text-slate-800">&gt; 5 (Phong phú)</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-blue-700 font-medium">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Click vào ô trống để nộp tài liệu cho môn học còn thiếu</span>
        </div>
      </div>
    </div>
  )
}

export default CoverageHeatmap
