import api from './axios'
import type { ApiResponse, Subject, Major, AcademicYear, Technology, LovValue } from '../types'

export const catalogApi = {
  getSubjects: async (): Promise<ApiResponse<Subject[]>> => {
    const res = await api.get<ApiResponse<Subject[]>>('/catalog/subjects')
    return res.data
  },

  getMajors: async (): Promise<ApiResponse<Major[]>> => {
    const res = await api.get<ApiResponse<Major[]>>('/catalog/majors')
    return res.data
  },

  getAcademicYears: async (): Promise<ApiResponse<AcademicYear[]>> => {
    const res = await api.get<ApiResponse<AcademicYear[]>>('/catalog/academic-years')
    return res.data
  },

  getTechnologies: async (): Promise<ApiResponse<Technology[]>> => {
    const res = await api.get<ApiResponse<Technology[]>>('/catalog/technologies')
    return res.data
  },

  getLovValues: async (groupCode: string): Promise<ApiResponse<LovValue[]>> => {
    const res = await api.get<ApiResponse<LovValue[]>>(`/catalog/lov/${groupCode}`)
    return res.data
  },
}
