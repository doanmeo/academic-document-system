-- ==============================================================================
-- Migration V3: Seed Demo Data for Final Project Presentation
-- Engine: MySQL 8.0+
-- Database: academic_docs
-- ==============================================================================

USE academic_docs;

-- 1. Bổ sung môn học & năm học (nếu chưa có)
INSERT IGNORE INTO majors (code, name, is_active) VALUES
('SE', 'Kỹ thuật phần mềm', 1),
('IS', 'Hệ thống thông tin', 1),
('CS', 'Khoa học máy tính', 1),
('CN', 'Mạng máy tính & Truyền thông', 1);

INSERT IGNORE INTO subjects (code, name, description, is_active) VALUES
('INT1001', 'Nhập môn lập trình', 'Kiến thức cơ sở lập trình', 1),
('INT2001', 'Cơ sở dữ liệu', 'Hệ quản trị CSDL quan hệ', 1),
('INT3001', 'Phát triển phần mềm mã nguồn mở', 'Mã nguồn mở và quy trình phát triển', 1),
('INT3002', 'Kiến trúc và Thiết kế phần mềm', 'Thiết kế kiến trúc hệ thống và microservices', 1),
('INT3003', 'Trí tuệ nhân tạo và Học máy', 'Các mô hình học máy và xử lý ngôn ngữ tự nhiên', 1),
('INT3004', 'An toàn thông tin và Mạng máy tính', 'Bảo mật hệ thống thông tin', 1);

INSERT IGNORE INTO academic_years (code, name, start_year, is_active) VALUES
('2022-2023', 'Năm học 2022-2023', 2022, 1),
('2023-2024', 'Năm học 2023-2024', 2023, 1),
('2024-2025', 'Năm học 2024-2025', 2024, 1),
('2025-2026', 'Năm học 2025-2026', 2025, 1);

INSERT IGNORE INTO technologies (name, slug, is_active) VALUES
('React', 'react', 1),
('Spring Boot', 'spring-boot', 1),
('MySQL', 'mysql', 1),
('TypeScript', 'typescript', 1),
('Docker', 'docker', 1),
('Python', 'python', 1),
('PostgreSQL', 'postgresql', 1);

-- 2. Đảm bảo tài khoản demo (BCrypt hash cho Admin@123 và Student@123)
-- Admin: $2a$10$7Z8VdG0p9F3/G37jX8Kke.sJcIkmM5B6fKxP.8rB/6c9l5V.P9lK. (hoặc BCrypt hash tương đương)
-- Mật khẩu chuẩn:
-- admin@cntt.local / Admin@123  ($2a$10$rCzC0P50l7mP3W7/n4g5jOT9gqY5n6I2m1R0qE8g4C8U0Z7x0j2mG)
-- sv01@cntt.local  / Student@123
-- sv02@cntt.local  / Student@123

INSERT INTO users (email, password_hash, full_name, student_code, role, is_active)
SELECT 'admin@cntt.local', '$2a$10$wN9rIknQ7iH1Q47G2.pC5O8IbmFwGgJc5f6F5g8rKq8Z7x0j2mG3e', 'Admin Khoa', NULL, 'ADMIN', 1
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@cntt.local');

INSERT INTO users (email, password_hash, full_name, student_code, role, is_active)
SELECT 'sv01@cntt.local', '$2a$10$wN9rIknQ7iH1Q47G2.pC5O8IbmFwGgJc5f6F5g8rKq8Z7x0j2mG3e', 'Nguyen Van A', 'SV001', 'STUDENT', 1
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'sv01@cntt.local');

INSERT INTO users (email, password_hash, full_name, student_code, role, is_active)
SELECT 'sv02@cntt.local', '$2a$10$wN9rIknQ7iH1Q47G2.pC5O8IbmFwGgJc5f6F5g8rKq8Z7x0j2mG3e', 'Tran Thi B', 'SV002', 'STUDENT', 1
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'sv02@cntt.local');

-- 3. Seed demo documents (APPROVED, PENDING, REJECTED)
-- Document 1: APPROVED
INSERT INTO documents (id, title, abstract_text, description, document_type_id, subject_id, major_id, academic_year_id, advisor_name, github_url, created_by, status, rejection_note, view_count, download_count, created_at, updated_at)
VALUES (
  1,
  'Nghiên cứu và Ứng dụng Kiến trúc Microservices trong Quản trị Tài liệu Học thuật',
  'Đồ án tập trung khảo sát các mô hình kiến trúc Microservices hiện đại, kết hợp Spring Boot 3 và Supabase Storage để quản lý tài liệu dung lượng lớn bảo mật.',
  'Báo cáo hoàn chỉnh kèm sơ đồ kiến trúc, giải thuật xác thực JWT phân tán và tối ưu truy vấn MySQL.',
  (SELECT id FROM lov_values WHERE code = 'THESIS' LIMIT 1),
  (SELECT id FROM subjects WHERE code = 'INT3001' LIMIT 1),
  (SELECT id FROM majors WHERE code = 'SE' LIMIT 1),
  (SELECT id FROM academic_years WHERE code = '2024-2025' LIMIT 1),
  'PGS.TS. Trần Đình Minh',
  'https://github.com/cntt-fit/academic-docs-microservices',
  (SELECT id FROM users WHERE email = 'sv01@cntt.local' LIMIT 1),
  'APPROVED',
  NULL,
  128,
  35,
  NOW() - INTERVAL 5 DAY,
  NOW() - INTERVAL 4 DAY
) ON DUPLICATE KEY UPDATE title = VALUES(title);

-- Document 2: PENDING
INSERT INTO documents (id, title, abstract_text, description, document_type_id, subject_id, major_id, academic_year_id, advisor_name, github_url, created_by, status, rejection_note, view_count, download_count, created_at, updated_at)
VALUES (
  2,
  'Xây dựng Hệ thống Trích xuất và Tóm tắt Văn bản Tự động bằng LLM',
  'Nghiên cứu áp dụng các mô hình ngôn ngữ lớn (LLM) để tự động sinh tóm tắt tài liệu học thuật và phân loại theo chủ đề.',
  'Bao gồm pipeline xử lý dữ liệu PDF tiếng Việt, embedding vector và mô hình sinh văn bản.',
  (SELECT id FROM lov_values WHERE code = 'THESIS' LIMIT 1),
  (SELECT id FROM subjects WHERE code = 'INT3003' LIMIT 1),
  (SELECT id FROM majors WHERE code = 'CS' LIMIT 1),
  (SELECT id FROM academic_years WHERE code = '2024-2025' LIMIT 1),
  'TS. Lê Thị Mai Hoa',
  'https://github.com/cntt-fit/llm-text-summarizer',
  (SELECT id FROM users WHERE email = 'sv01@cntt.local' LIMIT 1),
  'PENDING',
  NULL,
  12,
  0,
  NOW() - INTERVAL 1 DAY,
  NOW() - INTERVAL 1 DAY
) ON DUPLICATE KEY UPDATE title = VALUES(title);

-- Document 3: REJECTED
INSERT INTO documents (id, title, abstract_text, description, document_type_id, subject_id, major_id, academic_year_id, advisor_name, github_url, created_by, status, rejection_note, view_count, download_count, created_at, updated_at)
VALUES (
  3,
  'Báo cáo Thực tập Doanh nghiệp tại Công ty Giải pháp Phần mềm ABC',
  'Báo cáo tổng kết quá trình thực tập vị trí Frontend Developer tại ABC Corp trong thời gian 3 tháng.',
  'Báo cáo mô tả công việc và bài học kinh nghiệm.',
  (SELECT id FROM lov_values WHERE code = 'ASSIGNMENT' LIMIT 1),
  (SELECT id FROM subjects WHERE code = 'INT2001' LIMIT 1),
  (SELECT id FROM majors WHERE code = 'IS' LIMIT 1),
  (SELECT id FROM academic_years WHERE code = '2023-2024' LIMIT 1),
  'ThS. Phạm Quang Huy',
  NULL,
  (SELECT id FROM users WHERE email = 'sv02@cntt.local' LIMIT 1),
  'REJECTED',
  'Thiếu nhận xét và chữ ký đóng dấu từ phía Doanh nghiệp tiếp nhận thực tập; cấu trúc chương 3 chưa đầy đủ biểu đồ thiết kế CSDL.',
  5,
  0,
  NOW() - INTERVAL 2 DAY,
  NOW() - INTERVAL 2 DAY
) ON DUPLICATE KEY UPDATE title = VALUES(title);

-- 4. Seed document_files
INSERT INTO document_files (id, document_id, file_name, storage_key, mime_type, file_size, is_primary, created_by, created_at)
VALUES 
(1, 1, 'Bao_cao_Do_an_Tot_nghiep_Microservices.pdf', 'seed/microservices_thesis.pdf', 'application/pdf', 4829104, 1, (SELECT id FROM users WHERE email = 'sv01@cntt.local' LIMIT 1), NOW() - INTERVAL 5 DAY),
(2, 2, 'Khoa_luan_LLM_Text_Summarizer.pdf', 'seed/llm_summarizer.pdf', 'application/pdf', 3154890, 1, (SELECT id FROM users WHERE email = 'sv01@cntt.local' LIMIT 1), NOW() - INTERVAL 1 DAY)
ON DUPLICATE KEY UPDATE file_name = VALUES(file_name);

-- 5. Seed document_reviews
INSERT INTO document_reviews (id, document_id, reviewer_id, from_status, to_status, comment, created_at)
VALUES 
(1, 1, (SELECT id FROM users WHERE email = 'admin@cntt.local' LIMIT 1), 'PENDING', 'APPROVED', 'Tài liệu đạt chuẩn chất lượng đồ án tốt nghiệp, đề tài có tính ứng dụng cao.', NOW() - INTERVAL 4 DAY),
(2, 3, (SELECT id FROM users WHERE email = 'admin@cntt.local' LIMIT 1), 'PENDING', 'REJECTED', 'Thiếu nhận xét và chữ ký đóng dấu từ phía Doanh nghiệp tiếp nhận thực tập; cấu trúc chương 3 chưa đầy đủ biểu đồ thiết kế CSDL.', NOW() - INTERVAL 2 DAY)
ON DUPLICATE KEY UPDATE comment = VALUES(comment);

-- 6. Seed bookmarks
INSERT INTO bookmarks (id, user_id, document_id, created_at)
VALUES 
(1, (SELECT id FROM users WHERE email = 'sv02@cntt.local' LIMIT 1), 1, NOW() - INTERVAL 3 DAY)
ON DUPLICATE KEY UPDATE document_id = VALUES(document_id);

-- 7. Seed violation reports
INSERT INTO reports (id, document_id, reporter_id, reason_code, description, status, created_at)
VALUES 
(1, 1, (SELECT id FROM users WHERE email = 'sv02@cntt.local' LIMIT 1), 'COPYRIGHT_VIOLATION', 'Đoạn mô tả chương 2 có nội dung tham khảo từ tài liệu mở mà chưa trích dẫn đầy đủ nguồn.', 'PENDING', NOW() - INTERVAL 1 DAY)
ON DUPLICATE KEY UPDATE description = VALUES(description);
