export const APP_VERSION = '1.0.0';
export const APP_NAME = 'XTTech';

/**
 * Backend API Base URL
 * Ưu tiên đọc từ biến môi trường NEXT_PUBLIC_API_URL trong .env / .env.local
 */
export const BASE_API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://api.xttech.vn'
    : 'https://dev-xt-api-v2.up.railway.app');

export const BASE_WS_URL = BASE_API_URL.replace(/^http/, 'ws');

/**
 * MinIO Public Media Storage URL
 * Ưu tiên đọc từ NEXT_PUBLIC_MINIO_URL trong .env / .env.local
 */
export const BASE_MINIO_URL =
  process.env.NEXT_PUBLIC_MINIO_URL || 'https://minio-production-2298.up.railway.app';

/**
 * Website Canonical Domain (bắt buộc URL hợp lệ có protocol để phục vụ metadataBase)
 * Ưu tiên đọc từ NEXT_PUBLIC_SITE_URL trong .env / .env.local
 */
export const BASE_SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NODE_ENV === 'production' ? 'https://xttech.vn' : 'http://localhost:3000')
).replace(/\/+$/, '');

/**
 * Meta (Facebook) Pixel ID
 * Chỉ kích hoạt khi được cấu hình rõ ràng trong biến môi trường NEXT_PUBLIC_FB_PIXEL_ID
 * Tránh hardcode ID tracking để không làm nhiễm bẩn dữ liệu quảng cáo môi trường Dev/Test
 */
export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || '';
