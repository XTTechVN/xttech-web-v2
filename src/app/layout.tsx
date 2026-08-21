import type { Metadata, Viewport } from 'next';
import { Geist_Mono, Lexend } from 'next/font/google';
import { Toaster } from 'react-hot-toast';

import './globals.css';

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const lexend = Lexend({
  variable: '--font-lexend',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
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
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${lexend.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="bg-white antialiased min-h-screen" suppressHydrationWarning>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
