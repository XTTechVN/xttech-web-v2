import toast from "react-hot-toast";

export interface ApiErrorResponse {
  message?: string | string[];
  error?: {
    code?: string;
    message?: string;
  };
  detail?:
    | string
    | Array<{ msg?: string; [key: string]: unknown } | string>
    | { message?: string; [key: string]: unknown };
  details?:
    | string
    | Array<{ msg?: string; [key: string]: unknown } | string>
    | { message?: string; [key: string]: unknown };
}

export function getErrorMessage(err: unknown, fallback = 'Đã có lỗi xảy ra. Vui lòng thử lại.'): string {
  if (!err) return fallback;
  if (typeof err === 'string') return err;

  const errorObj = err as {
    response?: { data?: ApiErrorResponse };
    message?: string;
  };

  const data = errorObj.response?.data;
  if (data) {
    // 1. Trường hợp có cấu trúc detail hoặc details (FastAPI / attendance backend)
    const rawDetail = data.detail ?? data.details;
    if (typeof rawDetail === 'string' && rawDetail.trim()) {
      return rawDetail;
    }
    if (Array.isArray(rawDetail) && rawDetail.length > 0) {
      const messages = rawDetail
        .map((item) => (typeof item === 'string' ? item : item.msg || item.message))
        .filter(Boolean);
      if (messages.length > 0) {
        return messages.join(', ');
      }
    }
    if (typeof rawDetail === 'object' && rawDetail !== null && 'message' in rawDetail && typeof rawDetail.message === 'string') {
      return rawDetail.message;
    }

    // 2. Trường hợp cấu trúc chuẩn: error.message
    if (data.error?.message) {
      return data.error.message;
    }

    // 3. Trường hợp cấu trúc NestJS/Express: message (string hoặc array)
    if (data.message) {
      return Array.isArray(data.message) ? data.message.join(', ') : data.message;
    }
  }

  if (errorObj.message && typeof errorObj.message === 'string') {
    return errorObj.message;
  }

  return fallback;
}

export function showSuccessToast(message: string): void {
  toast.success(message);
}

export function showErrorToast(err: unknown, fallback?: string): string {
  const message = getErrorMessage(err, fallback);
  toast.error(message);
  return message;
}

