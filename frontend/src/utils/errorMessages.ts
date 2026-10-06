// ─── Bảng map Error Code → thông báo tiếng Việt ──────────────────────────────
export const ERROR_MESSAGES: Record<string, string> = {
  EMAIL_ALREADY_EXISTS: 'Email này đã được sử dụng. Vui lòng chọn email khác.',
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không chính xác.',
  USER_INACTIVE: 'Tài khoản của bạn đang bị khóa. Vui lòng liên hệ Quản trị viên.',
  INVALID_REFRESH_TOKEN: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  EXPIRED_REFRESH_TOKEN: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  DOCUMENT_NOT_FOUND: 'Không tìm thấy tài liệu yêu cầu.',
  NOT_DOCUMENT_OWNER: 'Bạn không có quyền chỉnh sửa tài liệu này.',
  INVALID_STATUS_TRANSITION: 'Hành động không hợp lệ với trạng thái tài liệu hiện tại.',
  DOCUMENT_HAS_NO_FILES: 'Vui lòng đính kèm ít nhất một tệp PDF trước khi nộp duyệt.',
  FILE_TOO_LARGE: 'Kích thước tệp vượt quá giới hạn 25MB cho phép.',
  INVALID_FILE_TYPE: 'Định dạng tệp không được hỗ trợ (chỉ nhận PDF, DOCX, PPTX, ZIP).',
  BOOKMARK_EXISTS: 'Tài liệu này đã có trong danh sách lưu của bạn.',
  VALIDATION_ERROR: 'Thông tin nhập vào không hợp lệ. Vui lòng kiểm tra lại.',
  FORBIDDEN: 'Bạn không có quyền thực hiện hành động này.',
}

/**
 * Trích xuất thông báo lỗi tiếng Việt từ Axios error response.
 *
 * Ưu tiên theo thứ tự:
 * 1. errors[0].code → tra bảng ERROR_MESSAGES
 * 2. message từ envelope
 * 3. Thông báo mặc định
 */
export const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as {
      response?: { data?: { errors?: { code: string }[]; message?: string } }
    }
    const responseData = axiosError.response?.data

    // Ưu tiên code lỗi nghiệp vụ đầu tiên
    const code = responseData?.errors?.[0]?.code
    if (code && ERROR_MESSAGES[code]) {
      return ERROR_MESSAGES[code]
    }

    // Fallback: message từ envelope
    if (responseData?.message) {
      return responseData.message
    }
  }
  return 'Đã có lỗi xảy ra. Vui lòng thử lại sau.'
}

/**
 * Trích xuất danh sách lỗi field (dùng cho form validation).
 * @returns Record<fieldName, errorMessage>
 */
export const getFieldErrors = (error: unknown): Record<string, string> => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as {
      response?: { data?: { errors?: { field: string; code: string; message: string }[] } }
    }
    const errors = axiosError.response?.data?.errors ?? []
    return errors.reduce<Record<string, string>>((acc, err) => {
      if (err.field) {
        acc[err.field] = ERROR_MESSAGES[err.code] ?? err.message
      }
      return acc
    }, {})
  }
  return {}
}
