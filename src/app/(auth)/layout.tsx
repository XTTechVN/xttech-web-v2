/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/stores';

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    // Nếu store đã nạp xong từ localStorage
    if (useAuthStore.persist.hasHydrated()) {
      setHasHydrated(true);
    }

    // Lắng nghe sự kiện rehydrate hoàn tất
    const unsubFinish = useAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });

    return () => {
      unsubFinish();
    };
  }, []);

  useEffect(() => {
    // Chỉ kiểm tra và chuyển hướng khi đã chắc chắn hoàn tất nạp dữ liệu từ storage
    if (hasHydrated && !isAuthenticated) {
      router.replace('/signin');
    }
  }, [hasHydrated, isAuthenticated, router]);

  // Trong thời gian rehydrate ngắn ban đầu, hiển thị loading nhẹ để tránh chớp màn hình
  if (!hasHydrated || !isAuthenticated) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50/60">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <div className="w-full h-full">{children}</div>;
}
