-- V2: documents, files, members, technologies, bookmarks, ratings, reports, reviews

USE academic_docs;

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(500) NOT NULL,
  user_id BIGINT NOT NULL,
  expires_at DATETIME NOT NULL,
  revoked TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_refresh_tokens_token (token),
  KEY idx_refresh_tokens_user (user_id),
  CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS documents (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  abstract_text TEXT NOT NULL,
  description MEDIUMTEXT NULL,
  status ENUM('DRAFT','PENDING','REVISION_REQUIRED','APPROVED','REJECTED','HIDDEN','ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  document_type_code VARCHAR(50) NOT NULL,
  uploader_id BIGINT NOT NULL,
  subject_id BIGINT NOT NULL,
  major_id BIGINT NULL,
  academic_year_id BIGINT NOT NULL,
  advisor_name VARCHAR(150) NULL,
  github_url VARCHAR(500) NULL,
  gitlab_url VARCHAR(500) NULL,
  view_count INT NOT NULL DEFAULT 0,
  download_count INT NOT NULL DEFAULT 0,
  avg_rating DOUBLE NOT NULL DEFAULT 0.0,
  rating_count INT NOT NULL DEFAULT 0,
  approved_by BIGINT NULL,
  approved_at DATETIME NULL,
  rejection_note TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_documents_status_created (status, created_at),
  KEY idx_documents_uploader (uploader_id),
  KEY idx_documents_subject (subject_id),
  KEY idx_documents_major (major_id),
  KEY idx_documents_year (academic_year_id),
  CONSTRAINT fk_documents_uploader FOREIGN KEY (uploader_id) REFERENCES users(id),
  CONSTRAINT fk_documents_subject FOREIGN KEY (subject_id) REFERENCES subjects(id),
  CONSTRAINT fk_documents_major FOREIGN KEY (major_id) REFERENCES majors(id) ON DELETE SET NULL,
  CONSTRAINT fk_documents_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
  CONSTRAINT fk_documents_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS document_files (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  document_id BIGINT NOT NULL,
  file_name VARCHAR(300) NOT NULL,
  storage_key VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size BIGINT NOT NULL,
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  external_url VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_document_files_document (document_id),
  CONSTRAINT fk_document_files_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS document_members (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  document_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  member_order INT NOT NULL DEFAULT 0,
  is_leader TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_doc_user (document_id, user_id),
  CONSTRAINT fk_document_members_doc FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  CONSTRAINT fk_document_members_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS document_technologies (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  document_id BIGINT NOT NULL,
  technology_id BIGINT NOT NULL,
  usage_note VARCHAR(300) NULL,
  UNIQUE KEY uk_doc_tech (document_id, technology_id),
  CONSTRAINT fk_document_tech_doc FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  CONSTRAINT fk_document_tech_tech FOREIGN KEY (technology_id) REFERENCES technologies(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS bookmarks (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  document_id BIGINT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_bookmarks_user_doc (user_id, document_id),
  KEY idx_bookmarks_user (user_id),
  CONSTRAINT fk_bookmarks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_bookmarks_doc FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ratings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  document_id BIGINT NOT NULL,
  score TINYINT NOT NULL CHECK (score BETWEEN 1 AND 5),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_ratings_user_doc (user_id, document_id),
  CONSTRAINT fk_ratings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_ratings_doc FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reports (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  document_id BIGINT NOT NULL,
  reporter_id BIGINT NOT NULL,
  reason_code VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  handled_by BIGINT NULL,
  handled_at DATETIME NULL,
  handling_note TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_reports_status (status),
  KEY idx_reports_doc (document_id),
  KEY idx_reports_reporter (reporter_id),
  CONSTRAINT fk_reports_doc FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reports_handled_by FOREIGN KEY (handled_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS document_reviews (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  document_id BIGINT NOT NULL,
  reviewer_id BIGINT NOT NULL,
  from_status VARCHAR(30) NOT NULL,
  to_status VARCHAR(30) NOT NULL,
  comment TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_doc_reviews_doc (document_id),
  CONSTRAINT fk_doc_reviews_doc FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  CONSTRAINT fk_doc_reviews_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
