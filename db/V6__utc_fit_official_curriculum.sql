-- V6: Khung chương trình đào tạo chính thức Khoa Công nghệ Thông tin - Trường ĐH Giao thông Vận tải (UTC)
-- Chuẩn hóa 6 Ngành học, 55 Môn học theo 4 khối kiến thức và 8 Loại tài liệu chuẩn (không trùng lặp).

-- 1. Cập nhật 6 Ngành học chính thức
INSERT INTO majors (code, name, is_active, created_at)
VALUES
  ('CNTT', 'Công nghệ thông tin (Đại trà & CLC Việt - Anh)', true, NOW()),
  ('KHMT', 'Khoa học máy tính', true, NOW()),
  ('KTPM', 'Kỹ thuật phần mềm', true, NOW()),
  ('HTTT', 'Hệ thống thông tin', true, NOW()),
  ('MMT_ATTT', 'Mạng máy tính & An toàn thông tin', true, NOW()),
  ('AI_DS', 'Trí tuệ nhân tạo và Khoa học dữ liệu', true, NOW())
ON CONFLICT (code) DO UPDATE 
SET name = EXCLUDED.name, is_active = true;

UPDATE majors SET name = 'Kỹ thuật phần mềm (KTPM)' WHERE code = 'SE';
UPDATE majors SET name = 'Hệ thống thông tin (HTTT)' WHERE code = 'IS';
UPDATE majors SET name = 'Khoa học máy tính (KHMT)' WHERE code = 'CS';
UPDATE majors SET name = 'Mạng máy tính & An toàn thông tin (MMT/ATTT)' WHERE code = 'CN';

-- 2. Khối kiến thức Giáo dục đại cương & Cơ sở Toán - Khoa học
INSERT INTO subjects (code, name, credit, is_active, created_at) VALUES
('MATH101', 'Giải tích 1', 3, true, NOW()),
('MATH102', 'Giải tích 2', 3, true, NOW()),
('MATH103', 'Đại số tuyến tính', 3, true, NOW()),
('MATH104', 'Xác suất thống kê', 3, true, NOW()),
('PHYS101', 'Vật lý đại cương', 3, true, NOW()),
('MATH105', 'Toán rời rạc & Lý thuyết đồ thị', 3, true, NOW()),
('LLCT101', 'Triết học Mác - Lênin', 3, true, NOW()),
('LLCT102', 'Kinh tế chính trị Mác - Lênin', 2, true, NOW()),
('LLCT103', 'Chủ nghĩa xã hội khoa học', 2, true, NOW()),
('LLCT104', 'Lịch sử Đảng Cộng sản Việt Nam', 2, true, NOW()),
('LLCT105', 'Tư tưởng Hồ Chí Minh', 2, true, NOW()),
('ENG101', 'Tiếng Anh cơ bản', 4, true, NOW()),
('ENG102', 'Tiếng Anh chuyên ngành CNTT', 3, true, NOW()),
('GDTC_QP', 'Giáo dục quốc phòng & Giáo dục thể chất', 4, true, NOW())
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, credit = EXCLUDED.credit;

-- 3. Khối kiến thức Cơ sở nhóm ngành & Cơ sở ngành CNTT (Bắt buộc chung)
INSERT INTO subjects (code, name, credit, is_active, created_at) VALUES
('IT101', 'Nhập môn Công nghệ thông tin / Tin học đại cương', 3, true, NOW()),
('IT102', 'Kỹ thuật lập trình (C/C++)', 3, true, NOW()),
('IT201', 'Lập trình hướng đối tượng (OOP) (Java / C++)', 3, true, NOW()),
('IT202', 'Cấu trúc dữ liệu và giải thuật', 3, true, NOW()),
('IT203', 'Kiến trúc máy tính và Hợp ngữ', 3, true, NOW()),
('IT204', 'Nguyên lý Hệ điều hành (Linux / Windows)', 3, true, NOW()),
('IT205', 'Cơ sở dữ liệu (SQL, Thiết kế CSDL quan hệ)', 3, true, NOW()),
('IT206', 'Hệ quản trị cơ sở dữ liệu (PostgreSQL, SQL Server, MySQL)', 3, true, NOW()),
('IT207', 'Mạng máy tính & Truyền thông dữ liệu', 3, true, NOW()),
('IT208', 'Công nghệ phần mềm / Nhập môn Kỹ thuật phần mềm', 3, true, NOW()),
('IT209', 'Tương tác người - máy (HCI)', 2, true, NOW())
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, credit = EXCLUDED.credit;

-- 4. Khối kiến thức Chuyên ngành theo từng định hướng
-- Định hướng Công nghệ thông tin / Kỹ thuật phần mềm:
INSERT INTO subjects (code, name, credit, is_active, created_at) VALUES
('SE301', 'Lập trình Web (React / Spring Boot / Node.js)', 3, true, NOW()),
('SE302', 'Lập trình ứng dụng di động (Android / iOS / Flutter)', 3, true, NOW()),
('SE303', 'Thiết kế & Kiến trúc phần mềm', 3, true, NOW()),
('SE304', 'Kiểm thử và đảm bảo chất lượng phần mềm (QA/QC)', 3, true, NOW()),
('SE305', 'Quản trị dự án CNTT (Agile / Scrum)', 2, true, NOW()),
('SE306', 'Điện toán đám mây & DevOps cơ bản (Docker, CI/CD)', 3, true, NOW())
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, credit = EXCLUDED.credit;

-- Định hướng Hệ thống thông tin & Khoa học dữ liệu:
INSERT INTO subjects (code, name, credit, is_active, created_at) VALUES
('IS301', 'Phân tích và thiết kế hệ thống thông tin', 3, true, NOW()),
('IS302', 'Khai phá dữ liệu (Data Mining) & Kho dữ liệu (Data Warehouse)', 3, true, NOW()),
('IS303', 'Cơ sở dữ liệu phân tán & NoSQL', 3, true, NOW()),
('IS304', 'Phân tích dữ liệu lớn (Big Data)', 3, true, NOW())
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, credit = EXCLUDED.credit;

-- Định hướng Mạng máy tính & An toàn thông tin:
INSERT INTO subjects (code, name, credit, is_active, created_at) VALUES
('CN301', 'Quản trị mạng máy tính (Cisco / Linux Server)', 3, true, NOW()),
('CN302', 'Định tuyến và chuyển mạch (Routing & Switching)', 3, true, NOW()),
('CN303', 'Cơ sở An toàn thông tin & Mật mã học', 3, true, NOW()),
('CN304', 'An ninh mạng và điều tra số (Digital Forensics)', 3, true, NOW())
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, credit = EXCLUDED.credit;

-- Định hướng Trí tuệ nhân tạo (AI & Machine Learning):
INSERT INTO subjects (code, name, credit, is_active, created_at) VALUES
('AI301', 'Nhập môn Trí tuệ nhân tạo', 3, true, NOW()),
('AI302', 'Học máy (Machine Learning)', 3, true, NOW()),
('AI303', 'Học sâu (Deep Learning) & Thị giác máy tính / NLP', 3, true, NOW())
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, credit = EXCLUDED.credit;

-- 5. Khối kiến thức Tốt nghiệp & Thực tập:
INSERT INTO subjects (code, name, credit, is_active, created_at) VALUES
('CAP401', 'Thực tập cơ sở / Thực tập chuyên ngành tại doanh nghiệp', 3, true, NOW()),
('CAP402', 'Đồ án môn học (Đồ án CSDL / KTPM / Mạng)', 2, true, NOW()),
('CAP501', 'Đồ án tốt nghiệp / Khóa luận tốt nghiệp Kỹ sư/Cử nhân CNTT', 10, true, NOW())
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, credit = EXCLUDED.credit;

-- 6. Chuẩn hóa 8 Loại tài liệu học tập (DOCUMENT_TYPE) không trùng lặp
INSERT INTO lov_groups (code, name, description, created_at)
VALUES ('DOCUMENT_TYPE', 'Loại tài liệu', 'Phân loại 8 loại tài liệu học tập chuẩn không trùng lặp', NOW())
ON CONFLICT (code) DO NOTHING;

INSERT INTO lov_values (group_id, code, value, display_order, is_active, created_at)
SELECT g.id, v.code, v.value, v.display_order, true, NOW()
FROM lov_groups g
CROSS JOIN (
  VALUES
    ('SLIDE', 'Slide bài giảng', 1),
    ('NOTE', 'Ghi chú ôn tập', 2),
    ('ASSIGNMENT', 'Bài tập lớn (BTL) & Đồ án', 3),
    ('SAMPLE_CODE', 'Mã nguồn mẫu (GitHub/GitLab)', 4),
    ('REFERENCE', 'Tài liệu tham khảo & Giáo trình', 5),
    ('THESIS', 'Đồ án / Khóa luận tốt nghiệp', 6),
    ('EXAM', 'Đề thi & Đáp án (Past Papers)', 7),
    ('LAB', 'Hướng dẫn Lab & Thực hành', 8)
) AS v(code, value, display_order)
WHERE g.code = 'DOCUMENT_TYPE'
ON CONFLICT (group_id, code) DO UPDATE 
SET value = EXCLUDED.value, display_order = EXCLUDED.display_order, is_active = true;

-- Migrate legacy document type codes in documents table
UPDATE documents SET document_type_code = 'SLIDE' WHERE document_type_code = 'LECTURE';
UPDATE documents SET document_type_code = 'ASSIGNMENT' WHERE document_type_code IN ('CAPSTONE', 'PROJECT');
UPDATE documents SET document_type_code = 'LAB' WHERE document_type_code = 'EXERCISE';
UPDATE documents SET document_type_code = 'EXAM' WHERE document_type_code = 'EXAM_REVIEW';
