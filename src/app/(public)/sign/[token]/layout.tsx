import type { Metadata } from 'next';
import { NO_INDEX_METADATA } from '@/config';

export const metadata: Metadata = {
  ...NO_INDEX_METADATA,
  title: 'Ký số xác nhận hồ sơ trực tuyến',
};

export default function SignTokenLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
