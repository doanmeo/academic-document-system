# Hướng Dẫn Dữ Liệu Mẫu & Kịch Bản Demo (10 Phút)

Tài liệu này cung cấp danh sách tài khoản, dữ liệu khởi tạo (seed data) và kịch bản trình diễn (demo script) chuẩn 10 phút phục vụ bảo vệ/báo cáo đồ án môn học **Academic Document System (Hệ thống Quản lý và Tra cứu Tài liệu Học thuật)**.

---

## 1. Danh sách Tài khoản Demo

Hệ thống được thiết lập sẵn 3 tài khoản mẫu thuộc 2 phân quyền (`ADMIN` và `STUDENT`). Tất cả mật khẩu đều tuân thủ chính sách bảo mật và mã hóa BCrypt.

| Phân quyền | Họ và tên | Mã SV | Email đăng nhập | Mật khẩu mặc định | Ghi chú vai trò |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | Admin Khoa | *(Trống)* | `admin@cntt.local` | `Admin@123` | Quản trị viên: Kiểm duyệt tài liệu, xử lý vi phạm, quản lý danh mục |
| **STUDENT** | Nguyen Van A | `SV001` | `sv01@cntt.local` | `Student@123` | Sinh viên tác giả: Tạo tài liệu, upload tệp đính kèm, nộp duyệt |
| **STUDENT** | Tran Thi B | `SV002` | `sv02@cntt.local` | `Student@123` | Sinh viên người xem: Tìm kiếm, tải tệp, bookmark, gửi báo cáo vi phạm |

---

## 2. Tổng quan Dữ liệu Seed Khởi tạo

Khi backend khởi động lần đầu (thông qua `DataInitializer`) hoặc chạy script `db/V3__seed_demo_data.sql`, cơ sở dữ liệu sẽ tự động có sẵn:

### a. Danh mục tra cứu & Bộ lọc (Catalogs)
- **Chuyên ngành (Majors):** Kỹ thuật phần mềm (`SE`), Hệ thống thông tin (`IS`), Khoa học máy tính (`CS`), Mạng máy tính (`CN`).
- **Môn học (Subjects):** `INT1001` (Nhập môn lập trình), `INT2001` (Cơ sở dữ liệu), `INT3001` (Phát triển PM mã nguồn mở), `INT3002` (Kiến trúc phần mềm), `INT3003` (Trí tuệ nhân tạo), `INT3004` (An toàn thông tin).
- **Năm học (Academic Years):** `2022-2023`, `2023-2024`, `2024-2025`, `2025-2026`.
- **Công nghệ (Technologies):** `React`, `Spring Boot`, `MySQL`, `TypeScript`, `Docker`, `Python`, `PostgreSQL`.
- **LOV Groups:** `DOCUMENT_TYPE` (Đồ án, Slide, Ghi chú, Bài tập lớn...), `FILE_TYPE` (PDF, DOCX, PPTX, ZIP...), `REPORT_REASON` (Bản quyền, Spam, Nội dung sai...).

### b. Danh sách Tài liệu Mẫu (Documents)

| ID | Tiêu đề | Trạng thái | Tác giả | File đính kèm | Ghi chú dữ liệu |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **#1** | **Nghiên cứu và Ứng dụng Kiến trúc Microservices trong Quản trị Tài liệu** | `APPROVED` | `sv01` | `Bao_cao_Do_an_Tot_nghiep_Microservices.pdf` (4.8 MB) | Đã duyệt; View: 128, Download: 35; Có 1 bookmark (`sv02`), 1 review duyệt. |
| **#2** | **Xây dựng Hệ thống Trích xuất và Tóm tắt Văn bản Tự động bằng LLM** | `PENDING` | `sv01` | `Khoa_luan_LLM_Text_Summarizer.pdf` (3.1 MB) | Đang nằm trong hàng đợi chờ Admin kiểm duyệt. |
| **#3** | **Báo cáo Thực tập Doanh nghiệp tại Công ty ABC** | `REJECTED` | `sv02` | *(Không có)* | Bị từ chối kèm ghi chú: *"Thiếu nhận xét đóng dấu của Doanh nghiệp; CSDL chưa hoàn chỉnh"*. |

---

## 3. Cách Kích Hoạt Seed Data

### Cách 1: Tự động qua Spring Boot (Khuyên dùng)
Khi chạy backend với profile `dev` hoặc `test`, `DataInitializer` sẽ tự động kiểm tra và seed dữ liệu nếu bảng đang trống.

```bash
cd backend
./mvnw spring-boot:run
```

### Cách 2: Chạy trực tiếp script SQL vào MySQL
```bash
mysql -u root -p academic_docs < db/V1__init_users_and_catalogs.sql
mysql -u root -p academic_docs < db/V1_1__refresh_tokens.sql
mysql -u root -p academic_docs < db/V2__documents_and_files.sql
mysql -u root -p academic_docs < db/V3__seed_demo_data.sql
```

---

## 4. Kịch Bản Trình Diễn Chi Tiết (10 Phút Demo)

```
[00:00 - 02:00]  Đăng nhập & Nộp tài liệu mới (Student sv01)
       │
[02:00 - 05:00]  Kiểm duyệt tài liệu & Lịch sử duyệt (Admin)
       │
[05:00 - 07:00]  Tra cứu, Tải Signed URL & Bookmark (Student sv02)
       │
[07:00 - 09:00]  Báo cáo vi phạm & Xử lý ẩn tài liệu (sv02 + Admin)
       │
[09:00 - 10:00]  Q&A, Tổng kết Kiến trúc & Bảo mật
```

---

### ⏱️ Phút 00:00 - 02:00 | Flow Sinh viên Tác giả (sv01@cntt.local)

1. **Đăng nhập:**
   - Đăng nhập tài khoản `sv01@cntt.local` / `Student@123`.
   - Nhận Access Token & Refresh Token, hiển thị thông tin sinh viên Nguyễn Văn A (`SV001`).
2. **Tạo tài liệu mới & Upload tệp:**
   - Vào mục **Đăng tải tài liệu**.
   - Điền thông tin: Tiêu đề, Môn học (`INT3001`), Chuyên ngành (`SE`), Năm học (`2024-2025`), GVHD.
   - Hệ thống tạo bản ghi `DRAFT` (HTTP 201).
   - Chọn file PDF đồ án $\rightarrow$ Upload lên Supabase Storage thông qua REST API (`POST /api/files/upload`).
   - Kiểm tra tính hợp lệ: Thử upload file `.exe` hoặc file > 20MB $\rightarrow$ Hệ thống lập tức từ chối và báo lỗi 422 đúng API Contract.
3. **Nộp phê duyệt:**
   - Nhấn **Nộp duyệt** (`POST /api/documents/{id}/submit`).
   - Trạng thái tài liệu chuyển từ `DRAFT` $\rightarrow$ `PENDING`.

---

### ⏱️ Phút 02:00 - 05:00 | Flow Quản Trị Viên Kiểm Duyệt (admin@cntt.local)

1. **Đăng nhập Quản trị:**
   - Đăng xuất sinh viên, đăng nhập `admin@cntt.local` / `Admin@123`.
2. **Hàng đợi kiểm duyệt (`GET /api/admin/documents/pending`):**
   - Mở màn hình **Quản lý phê duyệt**.
   - Thấy tài liệu vừa nộp và tài liệu mẫu `#2` (`LLM Text Summarizer`) đang ở trạng thái `PENDING`.
3. **Thao tác Phê duyệt / Từ chối:**
   - **Tài liệu #2:** Nhấn **Phê duyệt** (`POST /api/admin/documents/2/approve`). Trạng thái chuyển thành `APPROVED`, ghi nhận vào bảng `document_reviews`.
   - **Tài liệu kiểm thử từ chối:** Chọn 1 tài liệu và nhấn **Từ chối** (`POST /api/admin/documents/{id}/reject`).
   - Thử không nhập lý do $\rightarrow$ Hệ thống chặn báo lỗi (HTTP 400 `INVALID_REJECTION_NOTE`).
   - Nhập lý do hợp lệ: *"Tài liệu định dạng chưa chuẩn font Times New Roman, thiếu mục lục"* $\rightarrow$ Trạng thái chuyển thành `REJECTED`.
4. **Xem lịch sử kiểm duyệt:**
   - Gọi `GET /api/admin/documents/{id}/reviews` để chứng minh lịch sử duyệt rõ ràng, có vết người duyệt, thời gian và nhận xét.

---

### ⏱️ Phút 05:00 - 07:00 | Flow Sinh viên Người xem & Tải tệp (sv02@cntt.local)

1. **Đăng nhập Sinh viên 2:**
   - Đăng nhập tài khoản `sv02@cntt.local` / `Student@123`.
2. **Tìm kiếm & Bộ lọc:**
   - Tìm kiếm theo từ khóa *"Microservices"*, lọc theo môn học `INT3001`, năm học `2024-2025`.
   - Kết quả chỉ hiển thị các tài liệu `APPROVED` (không hiện DRAFT hay REJECTED của người khác).
3. **Xem chi tiết & Bảo mật Private Storage:**
   - Mở tài liệu `#1` (`Microservices`).
   - Nhấn **Xem trước (Preview)**: Backend tạo Signed URL tạm thời với TTL 300s từ Supabase Storage Private Bucket.
   - Nhấn **Tải về (Download)**: Backend sinh Download URL đồng thời tăng chỉ số `download_count` của tài liệu.
4. **Đánh dấu Yêu thích (Bookmark):**
   - Nhấn biểu tượng Bookmark (`POST /api/documents/1/bookmark`) $\rightarrow$ Thành công (201 Created).
   - Thử nhấn lại lần 2 $\rightarrow$ Backend trả về HTTP 409 Conflict (`DUPLICATE_BOOKMARK`).
   - Vào tab **Tài liệu yêu thích của tôi** (`GET /api/users/me/bookmarks`) $\rightarrow$ Hiển thị đầy đủ thông tin tài liệu `#1`.

---

### ⏱️ Phút 07:00 - 09:00 | Flow Báo Cáo Vi Phạm & Tự Động Ẩn Tài Liệu

1. **Sinh viên gửi Báo cáo Vi phạm:**
   - Tài khoản `sv02` phát hiện tài liệu có nghi vấn sao chép.
   - Nhấn **Báo cáo vi phạm** (`POST /api/documents/1/reports`):
     - Lý do: `COPYRIGHT_VIOLATION`.
     - Mô tả: *"Nội dung chương 2 sao chép bài báo khoa học mà không ghi nguồn"*.
   - Hệ thống tạo báo cáo ở trạng thái `PENDING`.
   - Xem lại báo cáo cá nhân tại `GET /api/users/me/reports`.
2. **Admin tiếp nhận & Xử lý báo cáo:**
   - Đăng nhập `admin@cntt.local`.
   - Vào mục **Hàng đợi Báo cáo vi phạm** (`GET /api/admin/reports?status=PENDING`).
   - Nhấn **Xử lý báo cáo** (`POST /api/admin/reports/{id}/handle`):
     - Quyết định: `RESOLVED`.
     - Ghi chú: *"Xác minh vi phạm bản quyền chính xác, thực hiện ẩn tài liệu"*.
     - Chọn option: `hideDocument = true`.
3. **Kiểm tra hiệu ứng:**
   - Tài liệu `#1` ngay lập tức chuyển trạng thái sang `HIDDEN`.
   - Sinh viên `sv02` tìm kiếm lại không còn thấy tài liệu `#1` xuất hiện trong danh sách công khai.

---

### ⏱️ Phút 09:00 - 10:00 | Tổng Kết & Điểm Nhấn Kiến Trúc (Q&A)

1. **Chuẩn kiến trúc RESTful:** Mọi response đồng nhất qua `ApiResponse<T>` envelope, phân tách mã lỗi chuẩn HTTP (200, 201, 400, 401, 403, 404, 409, 422).
2. **Bảo mật nhiều lớp:**
   - Stateless JWT Authentication + Spring Security RBAC.
   - Private Supabase Storage với Signed URL (TTL ngắn 300s, không bao giờ lộ storage key hay direct public access).
3. **Kiểm thử tự động:** Toàn bộ test suite **34/34 tests PASS** (Auth, Storage, Files, Moderation, Reports, Bookmarks).
4. **Postman Collections hoàn chỉnh:** Thư mục `docs/postman/` chứa 5 collections test độc lập và test script tự động.
