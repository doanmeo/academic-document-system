# Academic Document System (Khoa CNTT)

Hệ thống quản lý và tra cứu tài liệu học tập nội bộ.

**Stack:** React + Vite + TypeScript + Tailwind | Spring Boot 3 + JWT | MySQL | Supabase Storage

**Roles:** STUDENT · ADMIN

## Tuần 0 — đã chuẩn bị

| File | Mô tả |
|------|--------|
| `docs/api-envelope.md` | Format API success / error |
| `docs/supabase-bucket.md` | Hướng dẫn bucket private |
| `db/V1__init_users_and_catalogs.sql` | Migration users + danh mục + LOV + seed |
| `backend/.env.example` | Biến môi trường BE |
| `frontend/.env.example` | Biến môi trường FE |
| `PROJECT_STRUCTURE.txt` | Khung thư mục text |

## Git

- `main` — ổn định
- `develop` — tích hợp
- Làm việc trên `feature/*`, PR vào `develop`

## Chạy DB (Tuần 0)

```bash
mysql -u root -p < db/V1__init_users_and_catalogs.sql
```

## Tuần 1 (tiếp theo)

1. TV1: Spring Initializr + JWT Auth
2. TV2: `npm create vite@latest` + Tailwind + Login UI
3. TV3: nối FileStorageService skeleton + Postman Auth

**Không** làm upload/search cho đến khi login E2E xong.
