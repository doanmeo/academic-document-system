-- =============================================================================
-- V4__notifications_tags_and_student_year.sql
-- Thêm thông báo nội bộ, tags tài liệu, phân loại năm học sinh viên (Năm 1-5)
-- Chuẩn hóa danh mục loại tài liệu (DOCUMENT_TYPE)
-- =============================================================================

-- 1. Bổ sung cột target_year (Năm học sinh viên) vào bảng documents
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS target_year VARCHAR(20) DEFAULT 'ALL' 
COMMENT 'YEAR_1, YEAR_2, YEAR_3, YEAR_4, YEAR_5, ALL';

-- 2. Tạo bảng notifications (In-App Notifications)
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL COMMENT 'DOCUMENT_APPROVED, DOCUMENT_REJECTED, REVISION_REQUIRED, REPORT_RESOLVED, SYSTEM',
    title VARCHAR(255) NOT NULL,
    body TEXT,
    link VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user_unread (user_id, is_read, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tạo bảng document_tags (Gắn nhãn tìm kiếm theo chủ đề/công nghệ)
CREATE TABLE IF NOT EXISTS document_tags (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    document_id BIGINT NOT NULL,
    tag VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_doc_tags_doc FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    UNIQUE KEY uq_doc_tag (document_id, tag),
    INDEX idx_doc_tag_name (tag)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Chuẩn hóa document_type_code trên dữ liệu hiện có
UPDATE documents SET document_type_code = 'REFERENCE' WHERE document_type_code IN ('TAI_LIEU_THAM_KHAO', 'tai_lieu_tham_khao');
UPDATE documents SET document_type_code = 'CAPSTONE' WHERE document_type_code IN ('BTL', 'PROJECT', 'DO_AN');
UPDATE documents SET document_type_code = 'EXAM' WHERE document_type_code IN ('DE_THI');
UPDATE documents SET document_type_code = 'SLIDE' WHERE document_type_code IN ('LECTURE');
UPDATE documents SET document_type_code = 'LAB' WHERE document_type_code IN ('EXERCISE');

-- 5. Cập nhật nhóm LOV_GROUP TARGET_YEAR
INSERT INTO lov_groups (code, name, description, is_active)
VALUES ('TARGET_YEAR', 'Năm học sinh viên', 'Đối tượng sinh viên theo năm đào tạo (Năm 1 đến Năm 5)', true)
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description);

-- 6. Bổ sung các giá trị LOV TARGET_YEAR
INSERT INTO lov_values (group_id, code, label, display_order, is_active)
SELECT g.id, 'ALL', 'Tất cả các năm', 1, true FROM lov_groups g WHERE g.code = 'TARGET_YEAR'
ON DUPLICATE KEY UPDATE label = VALUES(label);

INSERT INTO lov_values (group_id, code, label, display_order, is_active)
SELECT g.id, 'YEAR_1', 'Năm thứ 1 (Đại cương)', 2, true FROM lov_groups g WHERE g.code = 'TARGET_YEAR'
ON DUPLICATE KEY UPDATE label = VALUES(label);

INSERT INTO lov_values (group_id, code, label, display_order, is_active)
SELECT g.id, 'YEAR_2', 'Năm thứ 2 (Cơ sở ngành)', 3, true FROM lov_groups g WHERE g.code = 'TARGET_YEAR'
ON DUPLICATE KEY UPDATE label = VALUES(label);

INSERT INTO lov_values (group_id, code, label, display_order, is_active)
SELECT g.id, 'YEAR_3', 'Năm thứ 3 (Chuyên ngành)', 4, true FROM lov_groups g WHERE g.code = 'TARGET_YEAR'
ON DUPLICATE KEY UPDATE label = VALUES(label);

INSERT INTO lov_values (group_id, code, label, display_order, is_active)
SELECT g.id, 'YEAR_4', 'Năm thứ 4 (Đồ án / Tốt nghiệp)', 5, true FROM lov_groups g WHERE g.code = 'TARGET_YEAR'
ON DUPLICATE KEY UPDATE label = VALUES(label);

INSERT INTO lov_values (group_id, code, label, display_order, is_active)
SELECT g.id, 'YEAR_5', 'Năm thứ 5 (Kỹ sư chuyên sâu)', 6, true FROM lov_groups g WHERE g.code = 'TARGET_YEAR'
ON DUPLICATE KEY UPDATE label = VALUES(label);

-- 7. Cập nhật phân bổ target_year mẫu cho các học liệu
UPDATE documents SET target_year = 'YEAR_1' WHERE subject_id IN (1, 6) OR title LIKE '%Nhập môn%' OR title LIKE '%OOP%';
UPDATE documents SET target_year = 'YEAR_2' WHERE subject_id IN (4, 7, 8) OR title LIKE '%Cơ sở dữ liệu%' OR title LIKE '%Unix%' OR title LIKE '%Mạng máy tính%';
UPDATE documents SET target_year = 'YEAR_3' WHERE subject_id IN (2, 3, 5, 9, 10) OR title LIKE '%Trí tuệ nhân tạo%' OR title LIKE '%An toàn%' OR title LIKE '%Kiến trúc%' OR title LIKE '%Kiểm thử%';
UPDATE documents SET target_year = 'YEAR_4' WHERE document_type_code IN ('THESIS', 'CAPSTONE') OR title LIKE '%KLTN%' OR title LIKE '%Đồ án%';
UPDATE documents SET target_year = 'ALL' WHERE target_year IS NULL;
