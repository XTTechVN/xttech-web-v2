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
