# Hệ Thống Quản Lý & Tra Cứu Tài Liệu Học Thuật (Khoa CNTT)
## Academic Document Management System

Hệ thống quản lý, lưu trữ, thẩm định và tra cứu đồ án, khóa luận, bài giảng và tài liệu học tập nội bộ dành riêng cho **Khoa Công nghệ Thông tin**.

---

## 🎯 Mục Tiêu Dự Án & Phạm Vi Vận Hành

- **Phạm vi nội bộ Khoa CNTT**: Tập trung phục vụ nhu cầu học tập, tham khảo đồ án môn học, khóa luận tốt nghiệp, bài giảng, bài lab và nghiên cứu khoa học của Giảng viên & Sinh viên trong Khoa.
- **Liêm chính học thuật**: Cam kết bản quyền nội bộ khi đăng tải, quy trình kiểm duyệt rõ ràng, báo cáo vi phạm và công cụ AI hỗ trợ kiểm tra tính mới của đề tài nghiên cứu.
- **Trải nghiệm hiện đại & thân thiện**: Giao diện trực quan, tốc độ tra cứu tức thì, tự động render bìa tài liệu học thuật và trích dẫn chuẩn hóa (APA, IEEE, BibTeX).

---

## 👥 Vai Trò Người Dùng (Roles & Permissions)

| Vai trò | Phân quyền & Chức năng |
|---|---|
| **Sinh viên (`STUDENT`)** | • Đăng nhập, quản lý hồ sơ cá nhân.<br>• Tải lên tài liệu học tập, đồ án, slide bài giảng kèm cam kết bản quyền.<br>• Theo dõi trạng thái kiểm duyệt, chỉnh sửa nộp lại nếu bị từ chối.<br>• Tra cứu, đọc trước (preview), tải xuống tài liệu đã duyệt.<br>• Lưu tài liệu vào danh sách yêu thích (Bookmark) & Bộ sưu tập cá nhân (Collections).<br>• Trích dẫn nhanh (APA, IEEE, BibTeX).<br>• Kiểm tra tính mới của đề tài đồ án/nghiên cứu (Topic Novelty Checker).<br>• Báo cáo vi phạm bản quyền/nội dung không phù hợp. |
| **Quản trị Khoa (`ADMIN`)** | • Quản lý danh mục học phần, thể loại và người dùng.<br>• Thẩm định tài liệu chờ duyệt (`Approve` / `Reject` kèm lý do chi tiết).<br>• Xử lý danh sách báo cáo vi phạm (`Ẩn tài liệu` / `Bác bỏ báo cáo`).<br>• Thống kê kho tài liệu, lượt tải, phân bố đồ án theo giảng viên và học phần. |

---

## 🚀 Các Tính Năng Nổi Bật

### 1. Phân Loại Tài Liệu Học Thuật Đa Dạng
Hỗ trợ đầy đủ các thể loại tài liệu học tập trong Khoa:
- 🎓 **Khóa luận tốt nghiệp (`THESIS`)**
- 💻 **Đồ án môn học / BTL (`PROJECT_REPORT`)**
- 📄 **Bài báo khoa học (`RESEARCH_PAPER`)**
- 📊 **Bài giảng / Slide bài học (`LECTURE_SLIDE`)**
- 📋 **Đề cương chi tiết môn học (`SYLLABUS`)**
- 🧪 **Bài tập / Bài thực hành Lab (`EXERCISE_LAB`)**

### 2. Quy Trình Phê Duyệt & Thẩm Định Đồ Án
- Trạng thái kiểm duyệt minh bạch: `PENDING_APPROVAL` ➔ `APPROVED` / `REJECTED` / `HIDDEN`.
- Khi tài liệu bị từ chối, sinh viên nhận thông báo kèm lý do phản hồi của Giảng viên/Admin và có thể chỉnh sửa (`EditDocument`) để nộp lại vòng thẩm định mới.

### 3. Học Phần & Bộ Sưu Tập (Course Hub & Collections)
- Gom nhóm tài liệu học tập theo từng học phần chuyên ngành (Công nghệ phần mềm, Trí tuệ nhân tạo, Mạng máy tính, Hệ cơ sở dữ liệu, An toàn thông tin,...).
- Sinh viên có thể tạo bộ sưu tập cá nhân, đánh dấu ghi chú và quản lý tài liệu ôn tập theo học kỳ.

### 4. Kiểm Tra Tính Mới Đề Tài (Topic Novelty Checker)
- Tích hợp AI (Gemini / OpenRouter) so khớp ngữ nghĩa tên đề tài và mô tả với toàn bộ đồ án, khóa luận lưu trữ trong Khoa.
- Đánh giá chỉ số mới (Novelty Score), cảnh báo nguy cơ trùng lặp và gợi ý mở rộng hướng nghiên cứu tiềm năng.

### 5. Trích Dẫn Chuẩn Học Thuật (APA, IEEE, BibTeX)
- Xuất trích dẫn tự động với 1 click theo đúng chuẩn trích dẫn khoa học:
  - **APA 7th Edition**
  - **IEEE Style**
  - **BibTeX** (sử dụng ngay cho LaTeX / Overleaf)

### 6. Bìa Tài Liệu Trực Quan Động (Dynamic Visual Covers)
- Tự động tạo ảnh bìa trang nhã, phân biệt màu sắc và icon nhận diện theo loại tài liệu và môn học, mang lại cảm giác chuyên nghiệp như một thư viện số hiện đại.

### 7. Hệ Thống Thông Báo Nội Bộ (In-app Notification Bell)
- Cập nhật chuông thông báo ngay trên thanh điều hướng khi tài liệu được duyệt, từ chối kèm phản hồi hoặc có cập nhật hệ thống.

---

## 🛠️ Kiến Trúc Công Nghệ (Tech Stack)

### Backend
- **Framework:** Spring Boot 3.4.3
- **Ngôn ngữ:** Java 21+ (tương thích JDK 21 - JDK 26)
- **Bảo mật:** Spring Security 6 + JWT (JSON Web Token)
- **Truy vấn dữ liệu:** Spring Data JPA + Hibernate
- **Database:**
  - **Development / Test:** H2 Database in-memory (chế độ MySQL dialect), tự động nạp sẵn 18 tài liệu mẫu chuẩn học thuật.
  - **Production:** MySQL 8.x
- **Lưu trữ tệp tin:** Supabase Storage (S3 / REST API) với cơ chế Signed URL bảo mật.
- **Tích hợp AI:** Google Gemini API & OpenRouter API (hỗ trợ mô hình miễn phí, phân tích đề tài, gợi ý từ khóa).

### Frontend
- **Framework:** React 18 + Vite + TypeScript
- **Styling:** Tailwind CSS + Lucide React Icons
- **Giao tiếp API:** Axios (kèm Interceptor tự động gắn Bearer Token và xử lý lỗi đồng bộ)
- **Routing:** React Router v6

---

## 🔑 Tài Khoản Kiểm Thử Mặc Định (Demo Accounts)

Khi khởi chạy hệ thống ở môi trường phát triển (`dev`), các tài khoản mẫu sau đã được tạo sẵn:

| Tài khoản | Tên đăng nhập / Email | Mật khẩu | Quyền hạn |
|---|---|---|---|
| **Quản trị viên Khoa** | `admin` (hoặc `admin@cntt.edu.vn`) | `admin123` | `ADMIN` (Kiểm duyệt, xem báo cáo, quản lý danh mục) |
| **Sinh viên 01** | `student` (hoặc `sv01@cntt.edu.vn`) | `student123` | `STUDENT` (Tác giả các đồ án, upload và tra cứu) |
| **Sinh viên 02** | `student2` (hoặc `sv02@cntt.edu.vn`) | `student123` | `STUDENT` (Tạo bộ sưu tập, lưu tài liệu, kiểm tra đề tài) |

---

## ⚙️ Hướng Dẫn Cài Đặt & Chạy Hệ Thống

### 1. Yêu Cầu Môi Trường
- **JDK:** Java Development Kit 21 trở lên
- **Node.js:** Phiên bản 18.x hoặc 20.x trở lên
- **Maven:** 3.8 trở lên (hoặc sử dụng wrapper `mvnw`)

---

### 2. Khởi Chạy Backend (Spring Boot)

1. Di chuyển vào thư mục backend:
   ```bash
   cd backend
   ```

2. Tạo hoặc cấu hình tệp `.env` (tham khảo `.env.example`):
   ```properties
   JWT_SECRET=your_jwt_secret_key_must_be_at_least_256_bits_long
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your_supabase_service_or_anon_key
   SUPABASE_BUCKET=documents
   # Tùy chọn cấu hình AI:
   OPENROUTER_API_KEY=your_openrouter_key
   GEMINI_API_KEY=your_gemini_key
   ```

3. Chạy Backend với profile phát triển (H2 In-Memory tự động seed dữ liệu):
   ```bash
   mvn spring-boot:run -Dspring-boot.run.profiles=dev
   ```
   *Backend sẽ khởi động tại:* `http://localhost:8080/api`

4. Chạy kiểm thử tự động (Unit & Integration Tests):
   ```bash
   mvn test
   ```

---

### 3. Khởi Chạy Frontend (React + Vite)

1. Di chuyển vào thư mục frontend:
   ```bash
   cd frontend
   ```

2. Cài đặt các gói thư viện:
   ```bash
   npm install
   ```

3. Cấu hình tệp `.env` (nếu cần đổi cổng Backend):
   ```properties
   VITE_API_BASE_URL=http://localhost:8080/api
   ```

4. Khởi chạy máy chủ phát triển:
   ```bash
   npm run dev
   ```
   *Frontend sẽ hoạt động tại:* `http://localhost:5173`

5. Kiểm tra build sản phẩm & TypeScript typecheck:
   ```bash
   npm run build
   ```

---

## 📁 Cấu Trúc Thư Mục Chính

```
academic-document-system/
├── backend/
│   ├── src/main/java/com/cntt/academicdocs/
│   │   ├── config/          # Cấu hình Security, JWT, Data Initializer, WebMvc
│   │   ├── controller/      # REST API Controllers (Auth, Document, Collection, File, Report,...)
│   │   ├── dto/             # Data Transfer Objects & Requests/Responses
│   │   ├── entity/          # Các thực thể JPA (User, Document, Category, Course, Report,...)
│   │   ├── exception/       # Xử lý lỗi toàn cục (GlobalExceptionHandler)
│   │   ├── repository/      # Spring Data JPA Repositories
│   │   └── service/         # Nghiệp vụ (DocumentService, CollectionService, GeminiService,...)
│   ├── src/main/resources/
│   │   ├── application.yml      # Cấu hình chính (MySQL Production)
│   │   └── application-dev.yml  # Cấu hình phát triển (H2 In-memory + Auto Seed)
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── api/             # Module gọi API backend qua Axios
│   │   ├── components/      # UI Components (Navbar, Footer, NotificationBell, TopicNoveltyChecker,...)
│   │   ├── pages/           # Màn hình ứng dụng (Home, Search, DocumentDetail, Upload, Collections, Admin,...)
│   │   ├── types/           # Định nghĩa kiểu dữ liệu TypeScript
│   │   └── App.tsx          # Router cấu hình phân quyền và luồng ứng dụng
│   ├── package.json
│   └── vite.config.ts
│
├── db/                      # Scripts khởi tạo DB MySQL gốc
└── README.md                # Tài liệu hướng dẫn sử dụng và triển khai
```

---

## 📜 Quy Trình Git & Đóng Góp

- `main`: Nhánh ổn định, chứa các phiên bản đã được kiểm thử và nghiệm thu.
- `develop`: Nhánh tích hợp tính năng chung của nhóm.
- Mọi nhánh tính năng mới tuân theo quy tắc đặt tên: `feature/<tên-tính-năng>`.
