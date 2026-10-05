# Supabase Storage — Hướng dẫn cấu hình & kiểm thử (Tuần 0 - TV3)

Tài liệu hướng dẫn thiết lập Supabase Storage, bảo mật bucket private, quản lý API keys và kiểm thử upload/signed URL cho dự án Academic Document System.

---

## 1. Thiết lập Bucket `documents` (Private)

1. Truy cập [Supabase Dashboard](https://supabase.com/dashboard) và chọn project của nhóm (hoặc project `academic_docs`).
2. Điều hướng vào menu **Storage** ở thanh điều hướng bên trái.
3. Nhấn **New bucket**:
   - **Name**: `documents`
   - **Public bucket**: **TẮT (OFF / Disabled)** -> Để đảm bảo toàn bộ tài liệu là Private, chỉ truy cập thông qua Signed URL hoặc Service Role backend.
4. Nhấn **Save bucket**.

---

## 2. Lấy URL và Service Role Key (Giao diện API Keys mới của Supabase)

1. Vào mục **Project Settings** (biểu tượng bánh răng ở góc dưới bên trái) -> Chọn tab **API**.
2. **Project URL**:
   - Sao chép giá trị tại mục **Project URL** (dạng `https://<project-ref>.supabase.co`).
   - Gán vào biến `SUPABASE_URL` trong file `backend/.env`.
3. **API Keys / Service Role Key**:
   - Tìm mục **Project API keys** (hoặc giao diện mới: **Secret keys / service_role secret**).
   - Chọn key có nhãn `service_role` (có chú thích *secret*, có quyền bypass RLS dùng riêng cho backend).
   - Nhấn nút **Reveal** hoặc copy token.
   - Gán vào biến `SUPABASE_SERVICE_ROLE_KEY` trong file `backend/.env`.
   - ⚠️ **LƯU Ý BẢO MẬT**: Tuyệt đối **KHÔNG commit** key `service_role` hoặc file `.env` lên GitHub/Git repository.

---

## 3. Kiểm thử tải file tay (Manual Upload)

1. Tại Supabase Dashboard -> **Storage** -> Chọn bucket `documents`.
2. Nhấn **Upload files** và tải thử 1 tệp mẫu (ví dụ: `sample.pdf` hoặc `test_document.docx`).
3. Xác nhận tệp hiển thị trong danh sách file của bucket với trạng thái upload thành công.

---

## 4. Kiểm thử Signed URL (Tạo URL tạm thời có thời hạn)

Vì bucket ở chế độ **Private**, link tải trực tiếp thông thường sẽ bị chặn (HTTP 400/403 Unauthorized). Ta cần tạo **Signed URL**:

1. Tại danh sách file trong bucket `documents`:
   - Nhấn vào biểu tượng ba chấm `...` bên cạnh file vừa upload.
   - Chọn **Get URL** hoặc **Create signed URL**.
   - Thiết lập thời gian hết hạn (TTL), ví dụ: `60` hoặc `300` giây (tương ứng biến `SIGNED_URL_EXPIRY_SECONDS=300`).
2. **Kiểm tra truy cập**:
   - Sao chép Signed URL và mở trên tab ẩn danh (Incognito) -> **Mở / tải file thành công**.
   - Đợi sau khi hết thời gian TTL (ví dụ 60s) -> F5 refresh lại link -> Phải nhận thông báo lỗi URL hết hạn (`{"statusCode":"400","error":"Error","message":"URL expired"}`).

---

## 5. Checklist nghiệm thu Tuần 0 (TV3)

- [x] Project Supabase sẵn sàng và kết nối tốt.
- [x] Bucket `documents` được tạo và đặt chế độ **Private** (`public: false`).
- [x] Đã cấu hình đầy đủ biến môi trường trong `backend/.env` local (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_BUCKET`, `SIGNED_URL_EXPIRY_SECONDS`, `MAX_FILE_SIZE_MB`, `ALLOWED_MIME_TYPES`).
- [x] File `.env.example` đã chuẩn hóa và không để lộ secret.
- [x] Upload thử nghiệm thủ công thành công.
- [x] Signed URL hoạt động đúng (mở được khi còn hạn, chặn khi hết hạn).

