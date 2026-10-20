# Hướng Dẫn Deploy Miễn Phí 100% Cho Demo (Free Deployment Guide)

Dự án: **Academic Document System — Khoa Công nghệ Thông tin (UTC)**  
Kiến trúc: **Frontend (Vercel) + Backend (Render / Koyeb) + Database & Storage (Supabase)**

---

## 🌟 Tổng Quan Kiến Trúc Miễn Phí (Zero Cost Architecture)

| Thành phần | Dịch vụ đề xuất | Chi phí | Điểm mạnh cho Demo |
| :--- | :--- | :--- | :--- |
| **Frontend (React 19)** | **Vercel** | **0 VNĐ / Tháng** | CDN toàn cầu, build siêu nhanh (<1 phút), tự động cấp HTTPS, không bao giờ ngủ (sleep). |
| **Backend (Spring Boot 3.4)** | **Render.com** (hoặc **Koyeb**) | **0 VNĐ / Tháng** | Hỗ trợ Dockerfile & Java 21, cấp sẵn subdomain `*.onrender.com` có SSL. |
| **Database (PostgreSQL)** | **Supabase** | **0 VNĐ / Tháng** | Đã cấu hình và kết nối sẵn, 500MB DB, có SSL. |
| **File Storage** | **Supabase Storage** | **0 VNĐ / Tháng** | Đã cấu hình bucket `documents` (1GB storage free). |
| **AI Assistant** | **Google Gemini 3.8 / OpenRouter** | **0 VNĐ / Tháng** | Free tier API key (AI Studio / OpenRouter Free models). |

---

## 🚀 BƯỚC 1: Push Code Lên GitHub

Đảm bảo toàn bộ mã nguồn mới nhất đã được đẩy lên repository GitHub cá nhân:

```bash
git add .
git commit -m "feat: optimize architecture, add docker and free deployment configs"
git push origin main
```

---

## 🚀 BƯỚC 2: Deploy Backend Lên Render.com (3 Phút)

1. Đăng ký/Đăng nhập tài khoản tại: [https://render.com](https://render.com) (chọn Login with GitHub).
2. Tại Dashboard, nhấn **New +** $\rightarrow$ Chọn **Web Service**.
3. Chọn repository GitHub dự án của bạn và nhấn **Connect**.
4. Điền các thông số cấu hình:
   * **Name:** `academic-docs-api` (hoặc tên tùy chọn)
   * **Region:** `Singapore` (để độ trễ về Việt Nam thấp nhất)
   * **Branch:** `main`
   * **Root Directory:** `backend`
   * **Runtime:** `Docker` (Render sẽ tự động đọc `backend/Dockerfile` đã được tối ưu cho 512MB RAM)
   * **Instance Type:** `Free (0.5 CPU, 512MB RAM)`
5. Mở rộng phần **Advanced** $\rightarrow$ **Environment Variables**, thêm các biến môi trường sau:

| Tên biến (Key) | Giá trị mẫu (Value) | Ghi chú |
| :--- | :--- | :--- |
| `SPRING_PROFILES_ACTIVE` | `prod` | Kích hoạt cấu hình production |
| `DB_HOST` | `db.qsxuyysnqmyristjiwws.supabase.co` | Host database Supabase |
| `DB_PORT` | `5432` | Cổng PostgreSQL |
| `DB_NAME` | `postgres` | Tên cơ sở dữ liệu |
| `DB_USER` | `academic_user` | Tài khoản DB |
| `DB_PASSWORD` | `AcademicDocsUtc2026!` | Mật khẩu DB Supabase |
| `JWT_SECRET` | `4b8f9a2e6c1d7e3f5a0b9c8d7e6f5a4b3c2d1e0f` | Khóa bí mật JWT (tối thiểu 32 ký tự) |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,https://*.vercel.app` | Cho phép Vercel gọi API |
| `SUPABASE_URL` | `https://qsxuyysnqmyristjiwws.supabase.co` | URL Supabase Project |
| `SUPABASE_SERVICE_ROLE_KEY` | *(Lấy từ Supabase Project Settings → API)* | Key quyền Service Role |
| `SUPABASE_BUCKET` | `documents` | Tên bucket |
| `GEMINI_API_KEY` | *(Lấy từ Google AI Studio)* | API key sinh tóm tắt |
| `OPENROUTER_API_KEY` | *(Tùy chọn, dự phòng cho Gemini)* | API key OpenRouter |

6. Nhấn **Create Web Service**. Render sẽ bắt đầu build image và deploy trong khoảng 2–3 phút.
7. Khi thấy trạng thái chuyển sang **Live**, copy URL backend (Ví dụ: `https://academic-docs-api.onrender.com`).
   * *Kiểm tra ngay:* Mở tab mới truy cập `https://academic-docs-api.onrender.com/api/health` $\rightarrow$ Thấy `{"service":"academic-docs","status":"UP"}` là backend đã sẵn sàng!

---

## 🚀 BƯỚC 3: Deploy Frontend Lên Vercel (2 Phút)

1. Đăng ký/Đăng nhập tại: [https://vercel.com](https://vercel.com) bằng tài khoản GitHub.
2. Nhấn **Add New...** $\rightarrow$ **Project**.
3. Chọn repository GitHub vừa push và nhấn **Import**.
4. Cấu hình dự án trên Vercel:
   * **Framework Preset:** `Vite` (Vercel tự động nhận diện)
   * **Root Directory:** Nhấn **Edit** và chọn thư mục `frontend`
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
5. Mở rộng mục **Environment Variables** và điền biến kết nối tới backend vừa tạo ở Bước 2:
   * **Key:** `VITE_API_BASE_URL`
   * **Value:** `https://academic-docs-api.onrender.com/api` *(Thay bằng URL thật ở Bước 2, nhớ có hậu tố `/api`)*
6. Nhấn **Deploy**.
7. Vercel sẽ tự động build với file `vercel.json` đã tạo sẵn (hỗ trợ SPA routing để khi F5 trang không bị lỗi 404). Chỉ sau khoảng 30–45 giây, bạn sẽ nhận được domain demo (Ví dụ: `https://academic-docs-frontend.vercel.app`).

---

## 🚀 BƯỚC 4: Đồng Bộ CORS Sau Khi Có Domain Frontend

Sau khi Vercel cấp domain (ví dụ `https://academic-docs-frontend.vercel.app`):
1. Quay lại trang quản trị Render của Backend (`academic-docs-api`).
2. Vào mục **Environment** $\rightarrow$ Sửa biến `CORS_ALLOWED_ORIGINS`:
   ```
   CORS_ALLOWED_ORIGINS=https://academic-docs-frontend.vercel.app,http://localhost:5173
   ```
3. Nhấn **Save Changes**. Render sẽ tự động redeploy trong 30 giây để cập nhật chính sách CORS mới.

---

## 💡 MẸO QUAN TRỌNG KHI DEMO (Pro Tips for Free Tier)

> [!TIP]
> **Render Free Tier sẽ tạm ngủ (Spin down) sau 15 phút không có lượt truy cập:**
> * Lần đầu tiên mở lại trang sau thời gian nghỉ, backend sẽ mất khoảng **30 - 45 giây** để khởi động lại.
> * **Trước khi vào phòng báo cáo / demo:** Hãy mở sẵn đường link `https://academic-docs-api.onrender.com/api/health` trên điện thoại hoặc máy tính trước 2 phút để máy chủ được "đánh thức" (Warm up). Suốt buổi demo sau đó, hệ thống sẽ phản hồi siêu tốc dưới 100ms.
> * Hoặc bạn có thể sử dụng dịch vụ miễn phí như [UptimeRobot](https://uptimerobot.com) ping URL `/api/health` mỗi 10 phút một lần để giữ cho máy chủ luôn thức 24/7!

---

## 📋 Bảng Kiểm Thử Nghiệm Thu Sau Deploy (Smoke Test Checklist)

- [ ] Truy cập trang chủ Frontend trên domain Vercel hiển thị giao diện mượt mà.
- [ ] Chuyển đổi theme Sáng / Tối (Dark mode) hoạt động trơn tru.
- [ ] Đăng nhập tài khoản Admin (`admin@cntt.local` / `Admin@123`) thành công.
- [ ] Mở mục **Thông báo** (chuông) xem các thông báo mẫu.
- [ ] Thử nộp một tài liệu mẫu (upload PDF và nhấn nút "Gợi ý AI" kiểm tra Gemini).
- [ ] Mở xem trước PDF trực tuyến (Signed URL) hiển thị tốt trong iframe.
