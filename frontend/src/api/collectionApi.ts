import api from './axios'
import { Collection } from '../types/document'

export const getUserCollections = async (): Promise<Collection[]> => {
  const res = await api.get('/collections')
  return (res as any)?.data?.data || (res as any)?.data || []
}

export const getCollectionDetail = async (id: number): Promise<Collection> => {
  const res = await api.get(`/collections/${id}`)
  return (res as any)?.data?.data || (res as any)?.data
}

export const createCollection = async (data: {
  title: string
  description?: string
  isPublic?: boolean
}): Promise<Collection> => {
  const res = await api.post('/collections', data)
  return (res as any)?.data?.data || (res as any)?.data
}

export const addItemToCollection = async (
  collectionId: number,
  data: { documentId: number; note?: string }
): Promise<Collection> => {
  const res = await api.post(`/collections/${collectionId}/items`, data)
  return (res as any)?.data?.data || (res as any)?.data
}

export const removeItemFromCollection = async (
  collectionId: number,
  documentId: number
): Promise<void> => {
  await api.delete(`/collections/${collectionId}/items/${documentId}`)
}

export const deleteCollection = async (id: number): Promise<void> => {
  await api.delete(`/collections/${id}`)
}

export const getPublicCollection = async (shareToken: string): Promise<Collection> => {
  const res = await api.get(`/collections/public/${shareToken}`)
  return (res as any)?.data?.data || (res as any)?.data
}

export const collectionApi = {
  getUserCollections,
  getCollectionDetail,
  createCollection,
  addItemToCollection,
  removeItemFromCollection,
  deleteCollection,
  getPublicCollection,
}
