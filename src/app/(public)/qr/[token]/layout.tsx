import type { Metadata } from 'next';
import { NO_INDEX_METADATA } from '@/config';

export const metadata: Metadata = {
  ...NO_INDEX_METADATA,
  title: 'Tra cứu QR sản phẩm & Bảo hành điện tử',
};

export default function QrTokenLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
