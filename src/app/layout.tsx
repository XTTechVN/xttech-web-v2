import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { Toaster } from 'react-hot-toast';
import { AppUpdateModal } from '@/components';
import {
  BASE_SITE_URL,
  PAGE_SEO_META,
  SEO_CONFIG,
  SEO_KEYWORDS,
  isProductionIndexingAllowed,
} from '@/config';
import { QueryProvider } from '@/contexts';

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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: SEO_CONFIG.themeColor,
};

const allowIndex = isProductionIndexingAllowed();

export const metadata: Metadata = {
  metadataBase: new URL(BASE_SITE_URL),
  applicationName: SEO_CONFIG.siteName,
  title: {
    default: PAGE_SEO_META.home.title,
    template: SEO_CONFIG.titleTemplate,
  },
  description: PAGE_SEO_META.home.description,
  keywords: SEO_KEYWORDS,
  authors: [{ name: SEO_CONFIG.siteName, url: BASE_SITE_URL }],
  creator: SEO_CONFIG.siteName,
  publisher: SEO_CONFIG.legalName,
  category: 'business',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: SEO_CONFIG.locale,
    url: BASE_SITE_URL,
    siteName: SEO_CONFIG.siteName,
    title: PAGE_SEO_META.home.title,
    description: PAGE_SEO_META.home.description,
    images: [
      {
        url: SEO_CONFIG.defaultOgImage,
        width: SEO_CONFIG.defaultOgImageWidth,
        height: SEO_CONFIG.defaultOgImageHeight,
        alt: SEO_CONFIG.brandTitle,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_SEO_META.home.title,
    description: PAGE_SEO_META.home.description,
    images: [SEO_CONFIG.defaultOgImage],
  },
  robots: allowIndex
    ? {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      }
    : {
        index: false,
        follow: false,
      },
  verification: {
    google: 'wkh7Hi792MQ5-_HPPSn7epZUryUcQfwVJZwIxNT5R4k',
  },
  other: {
    'facebook-domain-verification': 'bdvtycdcy863x260asdrime4wdi3n0',
  },
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
        <QueryProvider>
          {children}
          <Toaster position="top-center" />
          <AppUpdateModal />
        </QueryProvider>
      </body>
    </html>
  );
}
