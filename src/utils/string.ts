import { BASE_MINIO_URL } from '@/config';

export function getFileUrl(path?: string | null, fallback = ''): string {

  if (!path || !path.trim()) {
    return fallback;
  }
  const cleanPath = path.trim();
  // 2. Nếu đã là link đầy đủ (http, https, blob, data-uri) -> giữ nguyên
  if (
    cleanPath.startsWith('http://') ||
    cleanPath.startsWith('https://') ||
    cleanPath.startsWith('blob:') ||
    cleanPath.startsWith('data:')
  ) {
    return cleanPath;
  }
  // 3. Chuẩn hóa dấu gạch chéo: đảm bảo nối chính xác 1 dấu '/'
  const cleanBase = BASE_MINIO_URL.replace(/\/+$/, '');
  const formattedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  return `${cleanBase}${formattedPath}`;
}

/**
 * Chuẩn hóa chuỗi để so sánh khi tìm kiếm phía client:
 * gộp NFC/NFD, bỏ dấu tiếng Việt (kể cả đ/Đ), chuyển chữ thường và cắt khoảng trắng thừa.
 */
export function normalizeSearchText(text?: string | null): string {
  if (!text) {
    return '';
  }
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

/** Kiểm tra 	ext có chứa query hay không, không phân biệt hoa/thường, dấu và dạng Unicode. */
export function includesSearchText(text: string | null | undefined, query: string): boolean {
  return normalizeSearchText(text).includes(normalizeSearchText(query));
}