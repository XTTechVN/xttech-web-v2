import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.xttech.app',
  appName: 'XTTech',
  webDir: 'public',
  server: {
    // Thay bằng domain web app thực tế của bạn trên Railway
    url: 'https://dev-xt-web-v2.up.railway.app',
    cleartext: true,
  },
};

export default config;
