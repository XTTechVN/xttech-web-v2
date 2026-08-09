'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/stores';

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isAuthenticated) {
      router.push('/signin');
    }
  }, [isMounted, isAuthenticated, router]);

  if (!isMounted || !isAuthenticated) {
    return null;
  }
  return <div className="w-full h-full">{children}</div>;
}
