import type { Metadata } from 'next';
import { NO_INDEX_METADATA } from '@/config';

export const metadata: Metadata = {
  ...NO_INDEX_METADATA,
  title: 'Đăng nhập hệ thống',
};

export default function SigninLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
