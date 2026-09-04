'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Capacitor } from '@capacitor/core';
import useAuthStore from '@/stores/useAuthStore';

export const AppLauncherRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    // Chỉ tự động điều hướng khi đang chạy trên ứng dụng di động (Android / iOS native qua Capacitor)
    if (Capacitor.isNativePlatform()) {
      const checkAndRedirect = () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated) {
          router.replace('/app/dashboard');
        } else {
          router.replace('/signin');
        }
      };

      if (useAuthStore.persist.hasHydrated()) {
        checkAndRedirect();
      } else {
        const unsub = useAuthStore.persist.onFinishHydration(() => {
          checkAndRedirect();
        });
        return () => unsub();
      }
    }
  }, [router]);

  return null;
};
