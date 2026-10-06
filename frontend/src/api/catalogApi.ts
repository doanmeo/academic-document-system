import api from './axios'
import type {
  Subject,
  Major,
  AcademicYear,
  Technology,
  LovItem,
  LovGroupCode,
} from '../types/catalog'

const unwrap = <T>(res: { data: { data: T } }): T => res.data.data

// ─── Catalog API ──────────────────────────────────────────────────────────────

/** GET /catalog/subjects */
export const getSubjects = async (): Promise<Subject[]> => {
  const res = await api.get('/catalog/subjects')
  return unwrap(res)
}

/** GET /catalog/majors */
export const getMajors = async (): Promise<Major[]> => {
  const res = await api.get('/catalog/majors')
  return unwrap(res)
}

/** GET /catalog/academic-years */
export const getAcademicYears = async (): Promise<AcademicYear[]> => {
  const res = await api.get('/catalog/academic-years')
  return unwrap(res)
}

/** GET /catalog/technologies */
export const getTechnologies = async (): Promise<Technology[]> => {
  const res = await api.get('/catalog/technologies')
  return unwrap(res)
}

/** GET /catalog/lov/:groupCode */
export const getLov = async (groupCode: LovGroupCode): Promise<LovItem[]> => {
  const res = await api.get(`/catalog/lov/${groupCode}`)
  return unwrap(res)
}
