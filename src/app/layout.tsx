import type { Metadata } from 'next';
import { Geist, Geist_Mono, Lexend } from 'next/font/google';
import { Toaster } from 'react-hot-toast';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const lexend = Lexend({
  variable: '--font-lexend',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'XTTech - Quản lý doanh nghiệp',
  description: 'XTTech - Quản lý doanh nghiệp',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${lexend.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
