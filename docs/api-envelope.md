# API Response Format (chốt Tuần 0)

Áp dụng cho **mọi** REST API của backend.

## Thành công

```json
{
  "success": true,
  "message": "Request processed successfully",
  "data": {}
}
```

- `data` có thể là object, array, hoặc `null`.
- Phân trang (search, list):

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "content": [],
    "page": 0,
    "size": 12,
    "totalElements": 0,
    "totalPages": 0
  }
}
```

## Lỗi

```json
{
  "success": false,
  "message": "File type is not supported",
  "errors": [
    {
      "field": "file",
      "code": "INVALID_FILE_TYPE"
    }
  ]
}
```

- `errors` có thể `[]` hoặc bỏ qua nếu chỉ có `message`.
- `code`: hằng số UPPER_SNAKE (để FE map i18n sau này).

## HTTP status

| Code | Ý nghĩa |
|------|---------|
| 200 | Thành công |
| 201 | Tạo mới |
| 204 | Thành công, không body (ít dùng nếu giữ envelope) |
| 400 | Request không hợp lệ |
| 401 | Chưa đăng nhập / token sai |
| 403 | Không đủ quyền |
| 404 | Không tìm thấy |
| 409 | Trùng (email, bookmark…) |
| 422 | Business rule (sai status transition…) |
| 500 | Lỗi server |

## Auth header

```
Authorization: Bearer <access_token>
```

## Quy ước đặt tên

- Endpoint: `/api/...` (số nhiều: `/api/documents`)
- JSON field: `camelCase`
- Enum status document: `DRAFT | PENDING | REVISION_REQUIRED | APPROVED | REJECTED | HIDDEN | ARCHIVED`
- Role: `STUDENT | ADMIN`
