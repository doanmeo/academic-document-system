-- V3: Seed demo data for documents, files, members, technologies, reviews, bookmarks, ratings, reports

USE academic_docs;

-- 8 Approved Documents
INSERT INTO documents (id, title, abstract_text, description, status, document_type_code, uploader_id, subject_id, major_id, academic_year_id, advisor_name, github_url, view_count, download_count, avg_rating, rating_count, approved_by, approved_at, created_at)
VALUES
(1, 'Graph Algorithms: Tối ưu Phân cụm', 
 'Nghiên cứu tập trung giải quyết bài toán phân cụm đồ thị quy mô lớn với độ phức tạp tính toán tối ưu O(V log V). Ứng dụng kỹ thuật phân rã phổ kết hợp thuật toán tối ưu Louvain, giúp giảm 42% độ trễ xử lý các tập dữ liệu mạng lưới giao thông thông minh thời gian thực.',
 'Mô tả chi tiết: Đồ án nghiên cứu chuyên sâu về các thuật toán tối ưu trên đồ thị lớn...',
 'APPROVED', 'THESIS', 2, 1, 1, 1, 'PGS. TS. Đào Thị Lệ Thủy', 'https://github.com/utc-fit/graph-louvain-opt', 1280, 320, 4.9, 48, 1, NOW(), DATE_SUB(NOW(), INTERVAL 20 DAY)),

(2, 'Mô hình Học sâu trong Thị giác máy', 
 'Xây dựng kiến trúc mạng nơ-ron tích chập (CNN) phát hiện chướng ngại vật và biển báo giao thông trong điều kiện thời tiết sương mù và ánh sáng yếu.',
 'Mô tả chi tiết: Triển khai mô hình YOLOv8 tùy biến kết hợp Attention mechanism...',
 'APPROVED', 'CAPSTONE', 2, 2, 1, 1, 'TS. Nguyễn Thị Mai', 'https://github.com/utc-fit/deeplearning-medical-vision', 1540, 410, 4.8, 36, 1, NOW(), DATE_SUB(NOW(), INTERVAL 25 DAY)),

(3, 'Tính toán Biên trong IoT Công nghiệp', 
 'Kiến trúc điện toán biên phân tán (Edge Computing) xử lý dữ liệu cảm biến thời gian thực, giảm áp lực băng thông lên Cloud và đảm bảo tính sẵn sàng cao.',
 'Mô tả chi tiết: Áp dụng MQTT, Kafka và triển khai K3s trên các node Raspberry Pi 4...',
 'APPROVED', 'THESIS', 3, 3, 2, 1, 'PGS. TS. Trần Văn Hùng', 'https://github.com/utc-fit/edge-iot-mesh', 980, 210, 4.7, 19, 1, NOW(), DATE_SUB(NOW(), INTERVAL 30 DAY)),

(4, 'Tối ưu Hóa Truy vấn SQL Phân tán', 
 'Phân tích kế hoạch thực thi (Execution Plan), đánh chỉ mục chuyên sâu và thiết kế bộ đệm đa tầng cho hệ thống cơ sở dữ liệu giao dịch tần suất cao.',
 'Mô tả chi tiết: Nghiên cứu phân mảnh cơ sở dữ liệu (sharding), tối ưu query latency...',
 'APPROVED', 'LECTURE', 2, 4, 1, 1, 'ThS. Lê Hoàng Nam', 'https://github.com/utc-fit/sql-distributed-opt', 870, 190, 4.6, 14, 1, NOW(), DATE_SUB(NOW(), INTERVAL 45 DAY)),

(5, 'Bảo mật Ứng dụng Web theo Chuẩn OWASP Top 10', 
 'Phân tích các lỗ hổng bảo mật phổ biến (SQL Injection, XSS, CSRF, SSRF) và xây dựng hệ thống phòng thủ đa lớp kết hợp Web Application Firewall (WAF).',
 'Mô tả chi tiết: Xây dựng demo lab kiểm thử an toàn thông tin theo chuẩn NIST & OWASP...',
 'APPROVED', 'LAB', 3, 5, 3, 1, 'ThS. Nguyễn Duy Hưng', 'https://github.com/utc-fit/owasp-security-lab', 2150, 580, 4.9, 62, 1, NOW(), DATE_SUB(NOW(), INTERVAL 50 DAY)),

(6, 'Thiết kế CSDL Phân tán quy mô lớn', 
 'Giải pháp phân mảnh ngang (Sharding), sao lưu đồng bộ và bất đồng bộ trên cụm cơ sở dữ liệu phân tán PostgreSQL và Redis Cluster.',
 'Mô tả chi tiết: Hệ thống cluster 5 nodes đảm bảo ACID và High Availability 99.99%...',
 'APPROVED', 'CAPSTONE', 2, 6, 1, 1, 'TS. Đào Thị Lệ Thủy', 'https://github.com/utc-fit/distributed-db-cluster', 1680, 380, 4.8, 31, 1, NOW(), DATE_SUB(NOW(), INTERVAL 60 DAY)),

(7, 'Kiến trúc Micro-Frontend hiện đại', 
 'Phát triển kiến trúc Web phân tán ứng dụng Module Federation, kết hợp React 19 và Tailwind CSS giúp các đội ngũ độc lập phát triển và phát hành vi dịch vụ giao diện.',
 'Mô tả chi tiết: Độc lập bundle, chia sẻ component thư viện thông qua runtime injection...',
 'APPROVED', 'THESIS', 3, 7, 1, 1, 'ThS. Nguyễn Duy Hưng', 'https://github.com/utc-fit/micro-frontends-react', 2340, 620, 4.9, 52, 1, NOW(), DATE_SUB(NOW(), INTERVAL 70 DAY)),

(8, 'Tối ưu CI/CD Kubernetes Pipeline', 
 'Tự động hóa toàn diện quy trình kiểm thử đơn vị, quét lỗ hổng bảo mật SonarQube và triển khai GitOps an toàn lên môi trường Production với ArgoCD.',
 'Mô tả chi tiết: Pipeline chuẩn GitHub Actions kết hợp Vault secrets management...',
 'APPROVED', 'PROJECT', 2, 8, 2, 1, 'TS. Vũ Trọng Khang', 'https://github.com/utc-fit/k8s-gitops-pipeline', 1890, 450, 4.7, 25, 1, NOW(), DATE_SUB(NOW(), INTERVAL 80 DAY)),

-- 1 Pending, 1 Revision Required, 1 Draft, 1 Rejected
(9, 'Nghiên cứu ứng dụng Blockchain trong xác thực văn bằng UTC',
 'Xây dựng mạng lưới private blockchain dựa trên Hyperledger Fabric để cấp phát và thẩm định chứng chỉ số hóa cho sinh viên tốt nghiệp.',
 'Mô tả chi tiết: Smart contract kiểm tra tính hợp lệ của chữ ký số Hội đồng...',
 'PENDING', 'THESIS', 3, 1, 1, 1, 'TS. Nguyễn Mạnh Hùng', 'https://github.com/utc-fit/diploma-blockchain', 45, 0, 0.0, 0, NULL, NULL, NOW()),

(10, 'Hệ thống Quản lý Thư viện Số UTC - Kiến trúc Clean & Microservices',
 'Thiết kế hệ thống mượn trả tài liệu học thuật theo mô hình hướng dịch vụ Spring Boot 3 & Next.js.',
 'Cần bổ sung: Sơ đồ ERD độ phân giải cao và cam kết bản quyền mã nguồn theo yêu cầu của hội đồng thẩm định.',
 'REVISION_REQUIRED', 'CAPSTONE', 2, 2, 1, 1, 'PGS. TS. Trần Văn Hùng', 'https://github.com/utc-fit/clean-library-sys', 120, 5, 0.0, 0, NULL, NULL, NOW());

-- Files
INSERT INTO document_files (id, document_id, file_name, storage_key, mime_type, file_size, is_primary)
VALUES
(1, 1, 'KLTN_GraphAlgorithms_AliceWang.pdf', 'docs/1/graph-algorithms.pdf', 'application/pdf', 15400000, 1),
(2, 2, 'KLTN_DeepLearning_MedicalVision.pdf', 'docs/2/deeplearning-vision.pdf', 'application/pdf', 22100000, 1),
(3, 3, 'BTL_EdgeComputing_K3s_IoT.pdf', 'docs/3/edge-iot.pdf', 'application/pdf', 8400000, 1),
(4, 10, 'DoAn_Clean_Library_V1.pdf', 'docs/10/clean-library-v1.pdf', 'application/pdf', 12300000, 1);

-- Technologies
INSERT INTO document_technologies (document_id, technology_id, usage_note)
VALUES
(1, 1, 'Backend core services'),
(2, 2, 'Training model and preprocessing'),
(3, 1, 'Microservices on Edge'),
(7, 3, 'Frontend framework'),
(8, 4, 'Infrastructure container runtime');

-- Bookmarks
INSERT INTO bookmarks (user_id, document_id)
VALUES
(2, 2),
(2, 5),
(3, 1),
(3, 7);

-- Ratings
INSERT INTO ratings (user_id, document_id, score)
VALUES
(2, 1, 5),
(3, 1, 5),
(2, 2, 5),
(3, 2, 4);

-- Reports
INSERT INTO reports (id, document_id, reporter_id, reason_code, description, status, created_at)
VALUES
(1, 2, 3, 'PLAGIARISM', 'Toàn bộ Đoạn 3.2 (trang 42 đến 48) về mô hình Convolutional-LSTM sao chép nguyên văn đồ án tốt nghiệp của nhóm SV K62 năm 2024 không ghi chú nguồn gốc.', 'PENDING', NOW()),
(2, 3, 2, 'MISLEADING', 'Chương 4 phần tập lệnh Thumb-2 có nhiều đoạn mã giả lập in sai thanh ghi dẫn đến chạy thử nghiệm bị tràn bộ nhớ stack.', 'IN_REVIEW', NOW());
