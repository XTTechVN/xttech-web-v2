import type { Metadata } from 'next';
import { NO_INDEX_METADATA } from '@/config';
import { AuthClientLayout } from './_components/auth-client-layout';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  ...NO_INDEX_METADATA,
  title: 'Không gian làm việc nội bộ',
};

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AuthClientLayout>{children}</AuthClientLayout>;
}
