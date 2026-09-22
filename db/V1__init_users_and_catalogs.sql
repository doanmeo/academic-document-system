-- Tuần 0: users + danh mục + LOV
-- MySQL 8+ recommended

CREATE DATABASE IF NOT EXISTS academic_docs
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE academic_docs;

CREATE TABLE majors (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(30) NOT NULL,
  name VARCHAR(200) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_majors_code (code)
) ENGINE=InnoDB;

CREATE TABLE subjects (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(30) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description VARCHAR(500) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_subjects_code (code)
) ENGINE=InnoDB;

CREATE TABLE academic_years (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  start_year SMALLINT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_academic_years_code (code)
) ENGINE=InnoDB;

CREATE TABLE technologies (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_technologies_name (name),
  UNIQUE KEY uk_technologies_slug (slug)
) ENGINE=InnoDB;

CREATE TABLE lov_groups (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(150) NOT NULL,
  description VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_lov_groups_code (code)
) ENGINE=InnoDB;

CREATE TABLE lov_values (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  group_id BIGINT NOT NULL,
  code VARCHAR(50) NOT NULL,
  label VARCHAR(150) NOT NULL,
  description VARCHAR(255) NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_lov_values_group_code (group_id, code),
  CONSTRAINT fk_lov_values_group FOREIGN KEY (group_id) REFERENCES lov_groups (id)
) ENGINE=InnoDB;

CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(191) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  student_code VARCHAR(50) NULL,
  role ENUM('STUDENT', 'ADMIN') NOT NULL,
  major_id BIGINT NULL,
  avatar_url VARCHAR(500) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_users_email (email),
  UNIQUE KEY uk_users_student_code (student_code),
  KEY idx_users_role (role),
  KEY idx_users_is_active (is_active),
  CONSTRAINT fk_users_major FOREIGN KEY (major_id) REFERENCES majors (id) ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO majors (code, name) VALUES
  ('SE', 'Kỹ thuật phần mềm'),
  ('IS', 'Hệ thống thông tin');

INSERT INTO subjects (code, name) VALUES
  ('INT1001', 'Nhập môn lập trình'),
  ('INT2001', 'Cơ sở dữ liệu'),
  ('INT3001', 'Phát triển phần mềm mã nguồn mở');

INSERT INTO academic_years (code, name, start_year) VALUES
  ('2023-2024', 'Năm học 2023-2024', 2023),
  ('2024-2025', 'Năm học 2024-2025', 2024),
  ('2025-2026', 'Năm học 2025-2026', 2025);

INSERT INTO technologies (name, slug) VALUES
  ('React', 'react'),
  ('Spring Boot', 'spring-boot'),
  ('MySQL', 'mysql'),
  ('TypeScript', 'typescript');

INSERT INTO lov_groups (code, name) VALUES
  ('DOCUMENT_TYPE', 'Loại tài liệu'),
  ('FILE_TYPE', 'Loại file'),
  ('VISIBILITY', 'Phạm vi hiển thị'),
  ('REPORT_REASON', 'Lý do báo cáo'),
  ('REPORT_STATUS', 'Trạng thái báo cáo');

INSERT INTO lov_values (group_id, code, label, display_order)
SELECT g.id, v.code, v.label, v.ord FROM lov_groups g
JOIN (
  SELECT 'DOCUMENT_TYPE' AS gcode, 'THESIS' AS code, 'Đồ án / Khóa luận' AS label, 1 AS ord UNION ALL
  SELECT 'DOCUMENT_TYPE', 'SLIDE', 'Slide bài giảng', 2 UNION ALL
  SELECT 'DOCUMENT_TYPE', 'NOTE', 'Ghi chú ôn tập', 3 UNION ALL
  SELECT 'DOCUMENT_TYPE', 'ASSIGNMENT', 'Bài tập lớn', 4 UNION ALL
  SELECT 'DOCUMENT_TYPE', 'REFERENCE', 'Tài liệu tham khảo', 5 UNION ALL
  SELECT 'DOCUMENT_TYPE', 'OTHER', 'Khác', 6 UNION ALL
  SELECT 'FILE_TYPE', 'PDF', 'PDF', 1 UNION ALL
  SELECT 'FILE_TYPE', 'DOCX', 'DOCX', 2 UNION ALL
  SELECT 'FILE_TYPE', 'PPTX', 'PPTX', 3 UNION ALL
  SELECT 'FILE_TYPE', 'XLSX', 'XLSX', 4 UNION ALL
  SELECT 'FILE_TYPE', 'ZIP', 'ZIP', 5 UNION ALL
  SELECT 'FILE_TYPE', 'EXTERNAL_LINK', 'Liên kết ngoài', 6 UNION ALL
  SELECT 'VISIBILITY', 'PUBLIC_INTERNAL', 'Nội bộ Khoa', 1 UNION ALL
  SELECT 'REPORT_REASON', 'COPYRIGHT', 'Vi phạm bản quyền', 1 UNION ALL
  SELECT 'REPORT_REASON', 'INAPPROPRIATE', 'Nội dung không phù hợp', 2 UNION ALL
  SELECT 'REPORT_REASON', 'SPAM', 'Spam', 3 UNION ALL
  SELECT 'REPORT_REASON', 'WRONG_INFO', 'Thông tin sai', 4 UNION ALL
  SELECT 'REPORT_REASON', 'OTHER', 'Khác', 5 UNION ALL
  SELECT 'REPORT_STATUS', 'PENDING', 'Chờ xử lý', 1 UNION ALL
  SELECT 'REPORT_STATUS', 'IN_REVIEW', 'Đang xem xét', 2 UNION ALL
  SELECT 'REPORT_STATUS', 'RESOLVED', 'Đã xử lý', 3 UNION ALL
  SELECT 'REPORT_STATUS', 'REJECTED', 'Từ chối báo cáo', 4
) v ON v.gcode = g.code;

-- Tuần 1: seed lại password bằng BCrypt thật (AuthService / DataInitializer)
INSERT INTO users (email, password_hash, full_name, student_code, role, major_id, is_active) VALUES
  ('admin@cntt.local', '$2a$10$REPLACE_WITH_REAL_BCRYPT', 'Admin Khoa', NULL, 'ADMIN', NULL, 1),
  ('sv01@cntt.local', '$2a$10$REPLACE_WITH_REAL_BCRYPT', 'Nguyen Van A', 'SV001', 'STUDENT', 1, 1),
  ('sv02@cntt.local', '$2a$10$REPLACE_WITH_REAL_BCRYPT', 'Tran Thi B', 'SV002', 'STUDENT', 2, 1);
