import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { Toaster } from 'react-hot-toast';
import { AppUpdateModal } from '@/components';

import './globals.css';

const geistMono = localFont({
  src: '../../public/fonts/geist-mono-latin.woff2',
  variable: '--font-geist-mono',
  display: 'swap',
});

const lexend = localFont({
  src: [
    {
      path: '../../public/fonts/lexend-vietnamese.woff2',
      style: 'normal',
    },
    {
      path: '../../public/fonts/lexend-latin.woff2',
      style: 'normal',
    },
  ],
  variable: '--font-lexend',
  display: 'swap',
});

// 1. Cấu hình Viewport để màn hình không bị phóng to thu nhỏ lung tung
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#045863',
};

export const metadata: Metadata = {
  title: 'XTTech - Quản lý doanh nghiệp',
  description: 'XTTech - Quản lý doanh nghiệp',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'XTTech ERP',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${lexend.variable} ${geistMono.variable} h-full antialiased scroll-smooth`} suppressHydrationWarning>
      <body className="bg-white antialiased min-h-screen" suppressHydrationWarning>
        {children}
        <Toaster position="top-center" />
        <AppUpdateModal />
      </body>
    </html>
  );
}
