import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'XTTech - Hệ thống ERP Quản trị Doanh nghiệp',
    short_name: 'XTTech ERP',
    description: 'Hệ thống quản lý chấm công, sản xuất, báo giá và nhân sự XTTech',
    start_url: '/signin',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#045863',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/favicon.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/favicon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
  };
}
