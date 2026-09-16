export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { AuthClientLayout } from './_components/auth-client-layout';

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AuthClientLayout>{children}</AuthClientLayout>;
}
