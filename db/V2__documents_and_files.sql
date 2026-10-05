-- ==============================================================================
-- Migration V2: Documents, Document Files, and Related Relations
-- Engine: MySQL 8.0+
-- Database: academic_docs
-- ==============================================================================

USE academic_docs;

-- 1. Bảng tài liệu học thuật chính
CREATE TABLE IF NOT EXISTS documents (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  abstract_text TEXT NULL,
  description TEXT NULL,
  document_type_id BIGINT NULL,
  subject_id BIGINT NOT NULL,
  major_id BIGINT NULL,
  academic_year_id BIGINT NOT NULL,
  advisor_name VARCHAR(150) NULL,
  github_url VARCHAR(500) NULL,
  created_by BIGINT NOT NULL,
  status ENUM('DRAFT', 'PENDING', 'REVISION_REQUIRED', 'APPROVED', 'REJECTED', 'HIDDEN', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  rejection_note VARCHAR(1000) NULL,
  view_count INT NOT NULL DEFAULT 0,
  download_count INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  CONSTRAINT fk_documents_document_type FOREIGN KEY (document_type_id) REFERENCES lov_values (id) ON DELETE SET NULL,
  CONSTRAINT fk_documents_subject FOREIGN KEY (subject_id) REFERENCES subjects (id),
  CONSTRAINT fk_documents_major FOREIGN KEY (major_id) REFERENCES majors (id) ON DELETE SET NULL,
  CONSTRAINT fk_documents_academic_year FOREIGN KEY (academic_year_id) REFERENCES academic_years (id),
  CONSTRAINT fk_documents_created_by FOREIGN KEY (created_by) REFERENCES users (id),
  
  -- Indexes tối ưu tìm kiếm & lọc
  KEY idx_documents_status (status),
  KEY idx_documents_created_by (created_by),
  KEY idx_documents_subject (subject_id),
  KEY idx_documents_academic_year (academic_year_id),
  KEY idx_documents_major (major_id),
  KEY idx_documents_created_at (created_at)
) ENGINE=InnoDB;

-- 2. Bảng quản lý tập tin đính kèm (Lưu trữ metadata & Supabase storage key)
CREATE TABLE IF NOT EXISTS document_files (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  document_id BIGINT NULL,
  file_name VARCHAR(255) NOT NULL,
  storage_key VARCHAR(500) NOT NULL,
  mime_type VARCHAR(120) NOT NULL,
  file_size BIGINT NOT NULL,
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  created_by BIGINT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  CONSTRAINT fk_document_files_document FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE,
  CONSTRAINT fk_document_files_created_by FOREIGN KEY (created_by) REFERENCES users (id),
  
  -- Indexes
  KEY idx_document_files_document (document_id),
  KEY idx_document_files_created_by (created_by),
  KEY idx_document_files_is_primary (is_primary)
) ENGINE=InnoDB;

-- 3. Bảng thành viên tham gia thực hiện tài liệu/đồ án
CREATE TABLE IF NOT EXISTS document_members (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  document_id BIGINT NOT NULL,
  student_code VARCHAR(50) NOT NULL,
  full_name VARCHAR(150) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Keys & Unique Constraint
  CONSTRAINT fk_document_members_document FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE,
  UNIQUE KEY uk_document_members (document_id, student_code)
) ENGINE=InnoDB;

-- 4. Bảng liên kết công nghệ sử dụng (N-N giữa documents và technologies)
CREATE TABLE IF NOT EXISTS document_technologies (
  document_id BIGINT NOT NULL,
  technology_id BIGINT NOT NULL,
  PRIMARY KEY (document_id, technology_id),
  
  -- Foreign Keys
  CONSTRAINT fk_doc_tech_document FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE,
  CONSTRAINT fk_doc_tech_technology FOREIGN KEY (technology_id) REFERENCES technologies (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Bảng lịch sử kiểm duyệt của Admin
CREATE TABLE IF NOT EXISTS document_reviews (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  document_id BIGINT NOT NULL,
  reviewer_id BIGINT NOT NULL,
  from_status VARCHAR(50) NOT NULL,
  to_status VARCHAR(50) NOT NULL,
  comment TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  CONSTRAINT fk_document_reviews_document FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE,
  CONSTRAINT fk_document_reviews_reviewer FOREIGN KEY (reviewer_id) REFERENCES users (id),
  
  KEY idx_document_reviews_document (document_id)
) ENGINE=InnoDB;

-- 6. Bảng lưu tài liệu yêu thích (Bookmark của sinh viên)
CREATE TABLE IF NOT EXISTS bookmarks (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  document_id BIGINT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Keys & Unique Constraint
  CONSTRAINT fk_bookmarks_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_bookmarks_document FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE,
  UNIQUE KEY uk_bookmarks_user_document (user_id, document_id)
) ENGINE=InnoDB;

-- 7. Bảng báo cáo vi phạm tài liệu
CREATE TABLE IF NOT EXISTS reports (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  document_id BIGINT NOT NULL,
  reporter_id BIGINT NOT NULL,
  reason_code VARCHAR(50) NOT NULL,
  description TEXT NULL,
  status ENUM('PENDING', 'RESOLVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  resolved_by BIGINT NULL,
  resolution_note TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME NULL,
  
  -- Foreign Keys
  CONSTRAINT fk_reports_document FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE,
  CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_id) REFERENCES users (id),
  CONSTRAINT fk_reports_resolved_by FOREIGN KEY (resolved_by) REFERENCES users (id) ON DELETE SET NULL,
  
  KEY idx_reports_document (document_id),
  KEY idx_reports_status (status)
) ENGINE=InnoDB;
