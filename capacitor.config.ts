import type { CapacitorConfig } from '@capacitor/cli';
import { loadEnvConfig } from '@next/env';

// Tự động nạp các biến môi trường từ .env, .env.local theo đúng chuẩn Next.js
loadEnvConfig(process.cwd());

const rawUrl =
  process.env.CAPACITOR_SERVER_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  'https://xttech.vn';

// Đảm bảo mở app là tải thẳng vào Dashboard, không qua Landing Page
const cleanUrl = rawUrl.replace(/\/+$/, '');
const serverUrl = cleanUrl.endsWith('/app/dashboard')
  ? cleanUrl
  : `${cleanUrl}/app/dashboard`;

// Capacitor coi mọi điều hướng top-level KHÔNG bắt đầu bằng serverUrl (/app/dashboard) là link ngoài:
// huỷ điều hướng và mở Safari (vd: redirect sang /login, /app/projects...). Cần cho phép cả domain.
const serverHost = new URL(serverUrl).hostname;

const config: CapacitorConfig = {
  appId: 'com.xttech.app2',
  appName: 'XTTech',
  webDir: 'public',
  server: {
    url: serverUrl,
    cleartext: true,
    errorPath: 'offline.html',
    allowNavigation: [serverHost, `*.${serverHost}`],
  },
};


export default config;
