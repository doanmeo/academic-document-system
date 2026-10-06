# Supabase Storage — Tuần 0 (TV3)

## Việc cần làm

1. Tạo project tại https://supabase.com
2. **Storage → New bucket**
   - Name: `documents`
   - **Public bucket: OFF** (private)
3. Lấy keys:
   - Project URL → `SUPABASE_URL`
   - Settings → API → `service_role` → `SUPABASE_SERVICE_ROLE_KEY`
   - **Không commit** service_role lên Git
4. Thử upload 1 PDF trong dashboard
5. Thử Create signed URL (TTL 60–300s)

## Checklist

- [ ] Bucket `documents` private
- [ ] URL + service_role trong `.env` local
- [ ] Upload thử OK
- [ ] Signed URL mở được / hết hạn thì không
