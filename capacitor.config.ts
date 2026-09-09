import type { CapacitorConfig } from '@capacitor/cli';
import { loadEnvConfig } from '@next/env';

// Tự động nạp các biến môi trường từ .env, .env.local theo đúng chuẩn Next.js
loadEnvConfig(process.cwd());

const serverUrl =
  process.env.CAPACITOR_SERVER_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  'https://xttech.vn'; // Fallback mặc định nếu chưa cấu hình env

const config: CapacitorConfig = {
  appId: 'com.xttech.app2',
  appName: 'XTTech',
  webDir: 'public',
  server: {
    url: serverUrl,
    cleartext: true,
  },
};

export default config;
