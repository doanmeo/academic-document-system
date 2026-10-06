// ─── Catalog types ─────────────────────────────────────────────────────────────

export interface Subject {
  id: number
  code: string
  name: string
}

export interface Major {
  id: number
  code: string
  name: string
}

export interface AcademicYear {
  id: number
  code: string
  name: string
  startYear: number
}

export interface Technology {
  id: number
  name: string
  slug: string
}

export interface LovItem {
  code: string
  label: string
  displayOrder: number
}

// Nhóm mã LOV hợp lệ
export type LovGroupCode =
  | 'DOCUMENT_TYPE'
  | 'FILE_TYPE'
  | 'REPORT_REASON'
  | 'REPORT_STATUS'
