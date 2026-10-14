# 🎬 KỊCH BẢN DEMO END-TO-END 20 BƯỚC (ACADEMIC DOCUMENT SYSTEM)

> **Thời lượng chuẩn:** 10 - 15 phút  
> **Phạm vi:** Trình diễn toàn bộ chức năng Đồ án môn học "Phát triển Phần mềm Mã nguồn mở" (Khoa CNTT - UTC).  
> **Dữ liệu demo:** Học liệu thực tế 10 môn học Khoa CNTT - UTC nạp từ Supabase Private Storage & MySQL Seed Data.

---

## 👥 Bảng Phân Công Vai Trò Thuyết Trình & Thao Tác

| Thành viên | Phụ trách chính | Nội dung thuyết trình khi Demo |
| :--- | :--- | :--- |
| **TV1 (Backend Core)** | Architecture, Auth JWT, Document Core, Search & Citation | Thuyết trình kiến trúc tổng thể, mô hình bảo mật Spring Security + JWT, cơ chế phân quyền RBAC và API tìm kiếm tối ưu. |
| **TV2 (Frontend Lead)** | React 18, Tailwind CSS, Responsive UI, State Management | Điều khiển máy chiếu / thao tác giao diện trực tiếp, thuyết minh trải nghiệm người dùng (UX/UI), xử lý form, preview PDF, trích dẫn. |
| **TV3 (Storage, QA & Release)** | Supabase Storage, Offline Resilience, Flyway DB, Postman QA | Thuyết minh cơ chế lưu trữ Cloud Private Bucket + Signed URL bảo mật, cơ chế Offline Resilience (chống sập khi mất mạng), dữ liệu seed thực tế và Postman test suites. |

---

## 📋 Danh Sách Tài Khoản Trình Diễn

| Vai trò | Email đăng nhập | Mật khẩu | Mục đích sử dụng trong kịch bản |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@cntt.local` | `Admin@123` | Duyệt bài, yêu cầu sửa đổi, từ chối, xử lý báo cáo vi phạm, quản lý ẩn học liệu. |
| **Sinh viên Tác giả (Student 1)** | `sv01@cntt.local` | `Student@123` | Đăng tải học liệu thực tế, upload file PDF lên Supabase, theo dõi trạng thái duyệt. |
| **Sinh viên Độc giả (Student 2)** | `sv02@cntt.local` | `Student@123` | Tìm kiếm học liệu, xem trước PDF, trích dẫn chuẩn IEEE/APA, bookmark, gửi báo cáo vi phạm. |

---

## 🚀 CHI TIẾT 20 BƯỚC DEMO TRỰC QUAN

| Bước | Thời gian | Vai diễn / Thao tác | Thao tác Giao diện & Dữ liệu nhập | Cơ chế Kỹ thuật Dưới nền (Backend/Storage) | Lời Thuyết Trình Mẫu | Kết quả Kỳ vọng |
| :---: | :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | 00:00 | **TV1** (Giới thiệu) | Mở trang chủ: `http://localhost:5173/` | Frontend React khởi động, gọi `GET /api/health` và `GET /api/catalogs` nạp sẵn bộ môn học. | *"Kính chào Thầy Cô và các bạn. Nhóm xin trình bày Đồ án Hệ thống Quản lý và Tra cứu Tài liệu Học thuật dành cho Khoa CNTT - Trường ĐH Giao thông Vận tải."* | Trang chủ hiển thị hero banner, thanh tìm kiếm và các danh mục môn học UTC. |
| **2** | 00:45 | **TV2** (Đăng nhập SV1) | Click **Đăng nhập** $\rightarrow$ Nhập `sv01@cntt.local` / `Student@123`. | `POST /api/auth/login` $\rightarrow$ Trả về `accessToken` và `refreshToken` mã hóa BCrypt. | *"Đầu tiên, em đăng nhập với tư cách Sinh viên Nguyễn Văn A (sv01) để thực hiện chia sẻ một đồ án chuyên ngành."* | Đăng nhập thành công, Avatar góc phải hiện `SV001 - Nguyễn Văn A`. |
| **3** | 01:15 | **TV2** (Vào form Upload) | Click nút **Đăng tải tài liệu** trên thanh Header. | Chuyển hướng `/upload`. Tải danh mục loại tài liệu (Đồ án, BTL, Slide, Đề thi...). | *"Giao diện đăng tải được thiết kế trực quan, bắt buộc sinh viên điền đầy đủ siêu dữ liệu học thuật."* | Form đăng tải hiển thị 3 bước: Thông tin chung, Tải tệp, và Cam kết liêm chính. |
| **4** | 01:45 | **TV2** (Điền Metadata & Check Trùng lặp) | - **Tiêu đề:** *Báo cáo Đồ án Chuyên ngành: Hệ thống Chatbot RAG Hỗ trợ Tra cứu Quy chế UTC*<br>- **Hệ thống tự động phát hiện:** Hộp kiểm tra đề tài tương tự (Real-time similarity check) hiển thị mức tương quan với các đề tài đã nghiệm thu.<br>- **Môn học:** *Phát triển PM mã nguồn mở*<br>- **Chuyên ngành:** *Kỹ thuật phần mềm*<br>- **GVHD:** *PGS. TS. Đào Thị Lệ Thủy* (bắt buộc theo Checklist Khoa)<br>- **Năm học:** *2024-2025*<br>- **Phạm vi:** *Nội bộ UTC (`INTERNAL`)*. | `POST /api/documents/check-similarity` tính điểm tương đồng đa chiều (Môn học +35, GVHD +30, Ngành +15, Tiêu đề token overlap). Tạo bản ghi nháp `DRAFT` khi hoàn thành checklist. | *"Đặc biệt, hệ thống tích hợp Bộ đối soát đề tài tương tự theo thời gian thực và Checklist chuẩn Khoa CNTT: bắt buộc GVHD đối với Khóa luận/Đồ án và cam kết liêm chính, giúp ngăn chặn trùng lặp đề tài."* | Box đối soát đề tài tương tự hiển thị xanh/vàng; Checklist 6/6 tiêu chí đạt chuẩn; nút nộp bài sáng lên. |
| **5** | 02:30 | **TV3** (Upload Storage) | Chọn file PDF thực tế từ máy tính (`btl-chatbot-rag-utc.pdf`). | `POST /api/files/upload` $\rightarrow$ Đẩy file nhị phân lên Supabase Storage bucket `documents` (Private). | *"Tại đây, TV3 đã thiết kế cơ chế upload trực tiếp vào Private Bucket trên Cloud Supabase Storage. File được mã hóa đường dẫn và tạo mã băm SHA-256."* | Thanh Progress bar chạy mượt mà 0% $\rightarrow$ 100%, file đính kèm hiển thị dung lượng và icon PDF. |
| **6** | 03:00 | **TV2** (Nộp phê duyệt) | Tích chọn *“Cam kết liêm chính học thuật UTC”* $\rightarrow$ Click **Nộp phê duyệt**. | `POST /api/documents/{id}/submit` kiểm tra tính hợp lệ toàn diện của checklist (GVHD, Môn học, Tóm tắt >= 15 ký tự) rồi chuyển từ `DRAFT` sang `PENDING`. | *"Sau khi nộp, tài liệu chuyển sang trạng thái chờ duyệt (PENDING) và xuất hiện trong hàng đợi của Ban Quản trị Khoa."* | Thông báo Toast xanh: *"Đã nộp tài liệu thành công. Đang chờ Admin phê duyệt."* |
| **7** | 03:30 | **TV2** (Đăng xuất SV1) | Click Avatar $\rightarrow$ **Đăng xuất**. | Xóa JWT Token khỏi LocalStorage / Cookie. | *"Bây giờ nhóm sẽ chuyển sang vai trò Quản trị viên để tiến hành kiểm duyệt học liệu vừa nộp."* | Quay về màn hình trang chủ chưa đăng nhập. |
| **8** | 03:45 | **TV1** (Đăng nhập Admin) | Đăng nhập `admin@cntt.local` / `Admin@123`. | `POST /api/auth/login` trả về quyền `ROLE_ADMIN`. Frontend kích hoạt Admin Sidebar. | *"Admin đăng nhập bằng tài khoản quản trị Khoa CNTT với quyền hạn kiểm duyệt tối cao."* | Menu xuất hiện thêm mục **Quản lý kiểm duyệt** và **Báo cáo vi phạm**. |
| **9** | 04:15 | **TV2** (Vào Hàng đợi duyệt) | Vào menu **Kiểm duyệt tài liệu** (`/admin/moderation`). | `GET /api/admin/documents/pending` lấy danh sách toàn bộ học liệu đang `PENDING`. | *"Tại màn hình Kiểm duyệt, Admin nhìn thấy ngay đồ án Chatbot RAG của bạn sv01 vừa nộp cùng các tài liệu khác."* | Bảng hàng đợi hiển thị đầy đủ tên SV, tiêu đề, môn học, ngày nộp. |
| **10** | 04:45 | **TV3** (Xem trước & Phê duyệt, Dashboard Khoa) | Admin click **Xem chi tiết & Duyệt** $\rightarrow$ Xem trước file $\rightarrow$ Nhập ghi chú: *“Đề tài chất lượng tốt, đúng quy chuẩn đồ án UTC”* $\rightarrow$ Click **Phê duyệt (Approve)**. Sau đó mở Dashboard Khoa: Xem tỷ lệ đạt chuẩn, cơ cấu Chuyên ngành, Top Môn học và Bảng xếp hạng Top Giảng viên hướng dẫn. | `POST /api/admin/documents/{id}/approve` $\rightarrow$ Trạng thái sang `APPROVED`. Gọi `GET /api/admin/dashboard` tổng hợp phân bổ theo Chuyên ngành, Môn học và Top Giảng viên hướng dẫn. | *"Dashboard Quản trị không xếp hạng framework công nghệ mà tập trung vào các chiều học thuật cốt lõi của Khoa: phân bổ đồ án theo chuyên ngành SE/IS/CS/CN, môn học trọng điểm và bảng xếp hạng Top Giảng viên hướng dẫn."* | Trạng thái chuyển sang `APPROVED`. Dashboard hiển thị đầy đủ biểu đồ cơ cấu Khoa và Top GVHD. |
| **11** | 05:30 | **TV1** (Duyệt/Yêu cầu sửa đổi) | Chọn 1 tài liệu mẫu khác $\rightarrow$ Thử tính năng **Yêu cầu chỉnh sửa (Request Revision)** với ghi chú: *“Bổ sung thêm tài liệu tham khảo IEEE”*. | `POST /api/admin/documents/{id}/request-revision` $\rightarrow$ Chuyển trạng thái `REVISION_REQUIRED`. | *"Ngoài Phê duyệt và Từ chối, hệ thống hỗ trợ quy trình 'Yêu cầu sửa đổi', giúp tác giả bổ sung mà không bị hủy bài."* | Tài liệu chuyển sang trạng thái cam `REVISION_REQUIRED`. |
| **12** | 06:15 | **TV2** (Đăng nhập SV2 Độc giả) | Đăng xuất Admin $\rightarrow$ Đăng nhập `sv02@cntt.local` / `Student@123`. | Đăng nhập với quyền `ROLE_STUDENT`. | *"Tiếp theo, bạn Trần Thị B (sv02) đăng nhập để tìm kiếm học liệu ôn thi và làm bài tập lớn."* | Đăng nhập thành công với tài khoản sinh viên thứ hai. |
| **13** | 06:45 | **TV1** (Tìm kiếm 5 Chiều Học thuật) | Trên thanh tìm kiếm, lọc theo 5 chiều: Môn học (*Phát triển PM mã nguồn mở*), Chuyên ngành (*Kỹ thuật phần mềm*), GVHD (*PGS. TS. Đào Thị Lệ Thủy*), Loại tài liệu (*Đồ án chuyên ngành*), Năm (*2024-2025*). | `GET /api/documents/search?keyword=...&subjectId=...&majorId=...&advisorName=...&documentTypeCode=...` | *"Bộ tìm kiếm của Khoa được thiết kế chuẩn mực 5 chiều học thuật: Môn - Ngành - GVHD - Loại - Năm, giúp sinh viên tra cứu đúng đề tài theo style của thầy cô hướng dẫn."* | Kết quả trả về chính xác tài liệu vừa được duyệt ở bước 10 với huy hiệu Môn học, Ngành và GVHD rõ ràng. |
| **14** | 07:30 | **TV2** (Xem Chi tiết, Bìa số & Học liệu Cùng Mạch) | Click vào tài liệu **Hệ thống Chatbot RAG** $\rightarrow$ Chuyển đến trang chi tiết `/documents/{id}`. Xem Bìa học liệu số chuẩn Khoa CNTT, banner học thuật và mục **Học liệu cùng mạch học thuật & Hướng nghiên cứu**. | `GET /api/documents/{id}` lấy chi tiết; `GET /api/documents/{id}/related` đề xuất 4 học liệu tương quan cao nhất theo cùng Môn học, GVHD và Chuyên ngành kèm lý do match. | *"Trang chi tiết hiển thị Bìa học liệu số chuẩn Khoa CNTT, trình đọc PDF trực tiếp và danh sách 'Học liệu cùng mạch học thuật' giúp sinh viên dễ dàng khám phá các đề tài cùng hướng nghiên cứu của Thầy Cô."* | PDF hiển thị sắc nét; Mục 'Học liệu cùng mạch học thuật' đề xuất chính xác các đồ án liên quan. |
| **15** | 08:15 | **TV3** (Demo Offline Resilience) | Thuyết minh cơ chế Offline Fallback nếu Supabase ngắt kết nối hoặc mạng yếu. | `SupabaseStorageService` tự động chuyển sang fallback mock signed URL hoặc `/sample.pdf`, không bao giờ trả về lỗi HTTP 500. | *"Đặc biệt, TV3 đã lập trình lớp bảo vệ Offline Resilience: nếu mạng wifi trường bị gián đoạn, dịch vụ sẽ tự động fallback thông minh, đảm bảo trang web không bao giờ bị crash hoặc đơ."* | PDF vẫn mở xem trước ổn định và an toàn. |
| **16** | 08:45 | **TV2** (Trích dẫn Tự động Chuẩn Khoa) | Click nút **Trích dẫn (Cite)** $\rightarrow$ Chọn tab **IEEE**, **APA**, **BibTeX** $\rightarrow$ Click **Sao chép**. | `GET /api/documents/{id}/cite?format=IEEE` sinh trích dẫn học thuật tích hợp đầy đủ Tác giả, Tiêu đề, GVHD, Môn học, Khoa CNTT - UTC. | *"Hệ thống tự động sinh trích dẫn chuẩn IEEE và BibTeX với đầy đủ thông tin GVHD và Khoa CNTT - ĐH GTVT, sẵn sàng đưa vào danh mục tài liệu tham khảo."* | Modal trích dẫn mở ra, hiển thị định dạng chuẩn xác kèm nút sao chép 1-click. |
| **17** | 09:15 | **TV2** (Bookmark & Đánh giá) | Click nút **Đánh dấu (Bookmark)** $\rightarrow$ Đánh giá **5 sao** kèm bình luận: *“Đồ án viết rất chi tiết, source code chuẩn!”*. | `POST /api/documents/{id}/bookmark` và `POST /api/documents/{id}/reviews`. | *"Sinh viên có thể lưu tài liệu vào Tủ sách cá nhân và để lại đánh giá chất lượng cho cộng đồng."* | Icon Bookmark chuyển sang trạng thái đã lưu; điểm Rating cập nhật tức thì. |
| **18** | 09:45 | **TV2** (Báo cáo Vi phạm) | Giả lập phát hiện tài liệu có vấn đề: Click nút **Báo cáo vi phạm (Report)** $\rightarrow$ Chọn lý do `Bản quyền` $\rightarrow$ Nhập: *“Trùng lặp nội dung nghiên cứu”* $\rightarrow$ Gửi. | `POST /api/documents/{id}/reports` $\rightarrow$ Tạo báo cáo trạng thái `PENDING`. | *"Để giữ gìn môi trường học thuật trong sạch, độc giả có thể gửi Báo cáo vi phạm về Ban Quản trị."* | Thông báo: *"Đã gửi báo cáo vi phạm. Cảm ơn đóng góp của bạn."* |
| **19** | 10:15 | **TV1** (Admin Xử lý Báo cáo & Ẩn) | Chuyển sang tab Admin $\rightarrow$ Vào **Quản lý Báo cáo vi phạm** $\rightarrow$ Click **Xử lý** $\rightarrow$ Tích chọn **Ẩn tài liệu (Hide Document)** $\rightarrow$ Xác nhận. | `POST /api/admin/reports/{id}/handle` với `hideDocument: true` $\rightarrow$ Tài liệu chuyển sang `HIDDEN`. | *"Admin tiếp nhận báo cáo, kiểm tra và quyết định Ẩn tài liệu (hideDocument=true) để bảo vệ bản quyền."* | Báo cáo chuyển trạng thái `RESOLVED`. Tài liệu chuyển trạng thái `HIDDEN`. |
| **20** | 10:45 | **TV2 + TV3** (Kiểm chứng & Tổng kết) | Quay lại tài khoản Sinh viên $\rightarrow$ Tìm kiếm lại từ khóa `Chatbot RAG` $\rightarrow$ Kết quả: **Không tìm thấy**. Thuyết minh tổng kết hệ thống và Postman Suite. | `GET /api/documents/search` tự động loại bỏ các tài liệu không phải `APPROVED` (chống lộ lọt dữ liệu). Chạy nhanh 1 test Postman kiểm chứng. | *"Tài liệu bị ẩn lập tức biến mất khỏi kết quả tìm kiếm của sinh viên. Toàn bộ 35/35 Automated Tests & Postman Suites đều đạt 100% Pass. Nhóm xin kết thúc phần demo!"* | Màn hình thông báo không tìm thấy kết quả. Kết thúc kịch bản ấn tượng và chặt chẽ! |

---

## 🛠️ Hướng Dẫn Chuẩn Bị Trước Giờ Báo Cáo

1. **Khởi động Backend:**
   ```bash
   cd d:\LT_MNM_code\academic-document-system\backend
   ./mvnw spring-boot:run
   ```
2. **Khởi động Frontend:**
   ```bash
   cd d:\LT_MNM_code\academic-document-system\frontend
   npm run dev
   ```
3. **Mở sẵn 2 trình duyệt / Profile:**
   - Cửa sổ thường: Đăng nhập Sinh viên (`sv01@cntt.local` / `sv02@cntt.local`).
   - Cửa sổ ẩn danh (Incognito): Đăng nhập Admin (`admin@cntt.local`).
4. **Mở Postman Desktop:** Import thư mục `docs/postman/` để sẵn sàng trình chiếu khi Hội đồng yêu cầu kiểm tra API Contract.
