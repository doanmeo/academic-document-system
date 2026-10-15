import React, { useEffect, useState } from 'react'
import { MessageSquare, ThumbsUp, Send, CornerDownRight, HelpCircle, Loader2 } from 'lucide-react'
import { DocumentQA } from '../types/document'
import { qaApi } from '../api/qaApi'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

interface DocumentQASectionProps {
  documentId: number
}

export const DocumentQASection: React.FC<DocumentQASectionProps> = ({ documentId }) => {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [questions, setQuestions] = useState<DocumentQA[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [newQuestion, setNewQuestion] = useState('')
  const [pageNumber, setPageNumber] = useState<string>('')
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const data = await qaApi.getDocumentQA(documentId)
      setQuestions(data)
    } catch {
      // Fallback or empty
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [documentId])

  const handlePostQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQuestion.trim()) return

    try {
      setSubmitting(true)
      await qaApi.postDocumentQA(documentId, {
        question: newQuestion.trim(),
        pageNumber: pageNumber ? parseInt(pageNumber, 10) : undefined,
      })
      addToast('success', 'Đã gửi câu hỏi thảo luận thành công!')
      setNewQuestion('')
      setPageNumber('')
      fetchQuestions()
    } catch {
      addToast('error', 'Không thể gửi câu hỏi, vui lòng thử lại sau.')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePostReply = async (parentId: number) => {
    if (!replyText.trim()) return

    try {
      setSubmitting(true)
      await qaApi.postDocumentQA(documentId, {
        question: replyText.trim(),
        parentId,
      })
      addToast('success', 'Đã gửi phản hồi thành công!')
      setReplyText('')
      setReplyingTo(null)
      fetchQuestions()
    } catch {
      addToast('error', 'Không thể gửi phản hồi, vui lòng thử lại sau.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpvote = async (qaId: number) => {
    try {
      await qaApi.upvoteDocumentQA(qaId)
      fetchQuestions()
    } catch {
      // Ignore
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Hỏi đáp học thuật & Thảo luận ({questions.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Trao đổi thắc mắc, phân tích thuật toán hoặc chỉ ra đính chính theo từng trang PDF
            </p>
          </div>
        </div>
      </div>

      {/* Input box */}
      <form onSubmit={handlePostQuestion} className="mb-6">
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
          <textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            rows={2}
            placeholder={
              user
                ? `Thắc mắc về nội dung bài viết, thuật toán hoặc lỗi trong slide...`
                : 'Đăng nhập để đặt câu hỏi hoặc phản hồi...'
            }
            disabled={!user || submitting}
            className="w-full bg-transparent border-none text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none resize-none"
          />
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700/60 mt-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">Trang PDF (nếu có):</span>
              <input
                type="number"
                min="1"
                placeholder="vd: 12"
                value={pageNumber}
                onChange={(e) => setPageNumber(e.target.value)}
                disabled={!user || submitting}
                className="w-20 px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={!user || !newQuestion.trim() || submitting}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Gửi câu hỏi</span>
            </button>
          </div>
        </div>
      </form>

      {/* List */}
      {loading ? (
        <div className="py-8 text-center text-slate-500 dark:text-slate-400 flex items-center justify-center space-x-2">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          <span className="text-sm">Đang tải thảo luận...</span>
        </div>
      ) : questions.length === 0 ? (
        <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
          <HelpCircle className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Chưa có câu hỏi nào cho tài liệu này</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Hãy là người đầu tiên đặt câu hỏi để cùng thảo luận với sinh viên và giảng viên Khoa!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <div
              key={q.id}
              className="border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl p-4 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    {q.userFullName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{q.userFullName}</span>
                      {q.userStudentCode && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono">
                          {q.userStudentCode}
                        </span>
                      )}
                      {q.pageNumber && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium">
                          Trang {q.pageNumber}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(q.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleUpvote(q.id)}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs transition-colors"
                  title="Hữu ích"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-blue-500" />
                  <span className="font-semibold">{q.upvotes || 0}</span>
                </button>
              </div>

              <p className="mt-3 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line">{q.question}</p>

              {/* Action */}
              <div className="mt-3 flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400">
                <button
                  onClick={() => setReplyingTo(replyingTo === q.id ? null : q.id)}
                  className="font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                >
                  <CornerDownRight className="w-3.5 h-3.5" />
                  <span>{replyingTo === q.id ? 'Hủy phản hồi' : 'Trả lời'}</span>
                </button>
              </div>

              {/* Reply Form */}
              {replyingTo === q.id && (
                <div className="mt-3 pl-4 border-l-2 border-blue-500">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Viết câu trả lời hoặc góp ý..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handlePostReply(q.id)}
                      disabled={!replyText.trim() || submitting}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50"
                    >
                      Gửi
                    </button>
                  </div>
                </div>
              )}

              {/* Replies list */}
              {q.replies && q.replies.length > 0 && (
                <div className="mt-3 pl-4 border-l-2 border-slate-200 dark:border-slate-700 space-y-2">
                  {q.replies.map((r) => (
                    <div key={r.id} className="bg-white dark:bg-slate-800 p-2.5 rounded-lg text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{r.userFullName}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <p className="mt-1 text-slate-700 dark:text-slate-300">{r.question}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
export default DocumentQASection
