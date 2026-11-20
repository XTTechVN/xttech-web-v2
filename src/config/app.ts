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
 * URL video giới thiệu công ty trên trang /introduce (lưu trên MinIO thay vì commit vào Git)
 * Có thể ghi đè qua biến môi trường NEXT_PUBLIC_INTRO_VIDEO_URL
 */
export const INTRO_VIDEO_URL =
  process.env.NEXT_PUBLIC_INTRO_VIDEO_URL ||
  'http://dev-xt-minio-v2-production.up.railway.app/api/v1/download-shared-object/aHR0cDovLzEyNy4wLjAuMTo5MDAwL3h0dGVjaC1wcm9kL1VudGl0bGVkX1NjZW5lXzExLTIwXzA1XzE0XzQyXzIwMjYxMTIwMTIxODU5Lm1wND9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPVRaUkJWUTdLN0NISEpPU1E4TFJYJTJGMjAyNjExMjAlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjYxMTIwVDExMTkzM1omWC1BbXotRXhwaXJlcz00MzE5NCZYLUFtei1TZWN1cml0eS1Ub2tlbj1leUpoYkdjaU9pSklVelV4TWlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKaFkyTmxjM05MWlhraU9pSlVXbEpDVmxFM1N6ZERTRWhLVDFOUk9FeFNXQ0lzSW1WNGNDSTZNVGM1TlRJeE5qUTVOQ3dpY0dGeVpXNTBJam9pZUhSMFpXTm9JbjAuZ2hfU0k1bXNVenMwdDA2NmJmZFBJdjU4ZUpvNWtVYzBMdVI2cDdtYkhiQ3Z6MHBxcUlXbkhLeDVOWnBoQzZHcThCMWc3WXVsRU9lWnpaMTVCemY1X0EmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JnZlcnNpb25JZD1udWxsJlgtQW16LVNpZ25hdHVyZT1lZmUwNzgzMmYxZGMzNDhkN2RlMWY2ZWNhZmY4NjlmOTYzMjI3NjBmNWI3MDI2MDhlNTNkNWYxZWRlZjU5OTlk';

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
