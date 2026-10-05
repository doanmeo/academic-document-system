# Academic Document System (Khoa CNTT)

Hệ thống quản lý và tra cứu tài liệu học tập nội bộ.

**Stack:** React + Vite + TypeScript + Tailwind | Spring Boot 3/4 + JWT | MySQL 8.0 | Supabase Storage (Private bucket `documents`)

**Roles:** `STUDENT` · `ADMIN`

---

## 1. Hạ tầng & Database Migrations

Các file SQL được lưu trong thư mục `db/` và chạy theo thứ tự:

```bash
# Khởi tạo database, bảng danh mục, users & seed data ban đầu
mysql -u root -p academic_docs < db/V1__init_users_and_catalogs.sql

# Bảng refresh_tokens cho cơ chế JWT refresh
mysql -u root -p academic_docs < db/V1_1__refresh_tokens.sql

# Bảng documents, document_files, reviews, bookmarks, reports
mysql -u root -p academic_docs < db/V2__documents_and_files.sql
```

---

## 2. Cấu hình Môi trường Backend

Tạo file `backend/.env` từ file mẫu `backend/.env.example`:

```env
# Server
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=dev

# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=academic_docs
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
JWT_EXPIRATION_MS=86400000

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173

# Supabase Storage
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_secret_key_here
SUPABASE_BUCKET=documents
SIGNED_URL_EXPIRY_SECONDS=300

# Upload limits
MAX_FILE_SIZE_MB=20
ALLOWED_MIME_TYPES=application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/zip
```

Chạy Backend:
```bash
cd backend
./mvnw spring-boot:run
```
Swagger UI: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

---

## 3. Kiểm thử API bằng Postman Collection (`docs/postman/`)

Tất cả các collection đều được tích hợp sẵn test script tự động trích xuất token, lưu biến môi trường và kiểm tra `ApiResponse` envelope:

| Collection File | Nội dung kiểm thử |
| :--- | :--- |
| [Auth.postman_collection.json](docs/postman/Auth.postman_collection.json) | **Tuần 1**: Health check, Đăng ký (`/auth/register`), Đăng nhập (`/auth/login`), Refresh Token, Lấy profile (`/auth/me`), Đăng xuất (`/auth/logout`), và các case lỗi Negative (401/403). |
| [Academic_Docs_Week2.postman_collection.json](docs/postman/Academic_Docs_Week2.postman_collection.json) | **Tuần 2**: <br>1. **Files**: Upload PDF, lấy Preview Signed URL (TTL 300s), lấy Download Signed URL (tăng lượt tải), chặn upload file `.exe`/quá dung lượng.<br>2. **Document+File Flow**: Đăng nhập sinh viên $\rightarrow$ Tạo bản nháp Document (`DRAFT`) $\rightarrow$ Upload đính kèm file $\rightarrow$ Nộp duyệt (`PENDING`) $\rightarrow$ Đăng nhập Admin $\rightarrow$ Xem hàng đợi duyệt $\rightarrow$ Phê duyệt (`APPROVED`). |
| [Admin_Moderation.postman_collection.json](docs/postman/Admin_Moderation.postman_collection.json) | **Tuần 3**: <br>1. **Admin Moderation**: Lấy hàng đợi chờ duyệt (`/admin/documents/pending`), Phê duyệt (`/approve`), Từ chối kèm lý do (`/reject`), Ẩn tài liệu (`/hide`), Lấy lịch sử kiểm duyệt (`/reviews`).<br>2. **Negative Tests**: Sinh viên cố tình gọi API admin (403), Admin từ chối nhưng không điền lý do (400 `INVALID_REJECTION_NOTE`). |
| [Reports.postman_collection.json](docs/postman/Reports.postman_collection.json) | **Tuần 3**: <br>1. **Reports Flow**: Sinh viên báo cáo tài liệu APPROVED (`/documents/{id}/reports`), xem báo cáo của tôi (`/users/me/reports`), Admin lấy hàng đợi báo cáo (`/admin/reports?status=`), Admin xử lý báo cáo (`/admin/reports/{id}/handle`) với `hideDocument=true` (ẩn tài liệu).<br>2. **Negative Tests**: Sinh viên báo cáo tài liệu DRAFT (400 `INVALID_DOCUMENT_STATUS`), Sinh viên truy cập hàng đợi admin (403). |
| [Bookmarks.postman_collection.json](docs/postman/Bookmarks.postman_collection.json) | **Tuần 3**: <br>1. **Bookmarks Flow**: Sinh viên đánh dấu yêu thích tài liệu APPROVED (`/documents/{id}/bookmark`), xem danh sách yêu thích (`/users/me/bookmarks`), hủy đánh dấu (`DELETE /documents/{id}/bookmark`).<br>2. **Negative Tests**: Đánh dấu trùng lặp (409 `DUPLICATE_BOOKMARK`), đánh dấu tài liệu DRAFT (400 `INVALID_DOCUMENT_STATUS`), đánh dấu tài liệu không tồn tại (404), gọi không có token (401). |

### Hướng dẫn chạy Postman:
1. Mở ứng dụng **Postman** $\rightarrow$ Chọn **Import** $\rightarrow$ Chọn file collection trong thư mục `docs/postman/`.
2. Đảm bảo biến `baseUrl` đặt là `http://localhost:8080/api`.
3. Chạy lần lượt các request: Token và các định danh (`accessToken`, `studentToken`, `adminToken`, `fileId`, `documentId`) sẽ được tự động lưu và truyền qua các bước tiếp theo.

