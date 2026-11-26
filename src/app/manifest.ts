import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'XTTECH — Hệ thống ERP Quản trị Sản xuất Nhôm Kính & Xây dựng',
    short_name: 'XTTECH ERP',
    description:
      'Hệ sinh thái ERP quản lý thiết kế cửa CAD 2D/3D, bóc tách vật tư BOM, báo giá, kho xưởng và chấm công GPS công trình XTTECH.',
    start_url: '/',
    scope: '/',
    lang: 'vi',
    dir: 'ltr',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#045863',
    categories: ['business', 'productivity', 'utilities'],
    icons: [
      {
        src: '/favicon/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/favicon/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/favicon/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
