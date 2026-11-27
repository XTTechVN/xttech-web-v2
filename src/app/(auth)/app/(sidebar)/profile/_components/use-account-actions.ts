'use client';

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { toast } from 'react-hot-toast';
import { NativeTracking } from '@/hooks';
import { useAuthStore } from '@/stores';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Cài ứng dụng (PWA): Chrome/Android có hộp thoại riêng, iPhone chỉ có hướng dẫn thêm vào màn hình chính
export function useInstallApp() {
  const [deferred, setDeferred] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as InstallPromptEvent);
    };
    const timer = window.setTimeout(() => setInstalled(standalone), 0);
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', onPrompt);
    };
  }, []);

  const install = async () => {
    if (!deferred) {
      toast('Trên iPhone: bấm Chia sẻ ở thanh dưới Safari, rồi chọn Thêm vào Màn hình chính.', { duration: 8000 });
      return;
    }
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === 'accepted') setDeferred(null);
  };

  return { installed, install };
}

export async function signOutApp() {
  if (Capacitor.isNativePlatform()) {
    await NativeTracking.stopTracking().catch(() => undefined);
  }
  await useAuthStore.getState().signout();
}
