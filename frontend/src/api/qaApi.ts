import api from './axios'
import { DocumentQA } from '../types/document'

export const getDocumentQA = async (documentId: number): Promise<DocumentQA[]> => {
  const res = await api.get(`/documents/${documentId}/qa`)
  return (res as any)?.data?.data || (res as any)?.data || []
}

export const postDocumentQA = async (
  documentId: number,
  data: { question: string; parentId?: number | null; pageNumber?: number | null }
): Promise<DocumentQA> => {
  const res = await api.post(`/documents/${documentId}/qa`, data)
  return (res as any)?.data?.data || (res as any)?.data
}

export const upvoteDocumentQA = async (qaId: number): Promise<DocumentQA> => {
  const res = await api.post(`/documents/qa/${qaId}/upvote`)
  return (res as any)?.data?.data || (res as any)?.data
}

export const qaApi = {
  getDocumentQA,
  postDocumentQA,
  upvoteDocumentQA,
}
