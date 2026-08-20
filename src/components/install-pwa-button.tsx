/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components';
import { Download } from 'lucide-react';

export function InstallPwaButton({ className }: { className?: string }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Kiểm tra xem người dùng đã mở ở dạng App chưa (nếu đang ở trong App thì không hiện nút nữa)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
    }

    // Bắt sự kiện có thể cài đặt từ Chrome / Android
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Đối với iPhone (Safari)
      alert(
        '📱 Hướng dẫn cài đặt trên iPhone:\n1. Bấm nút [Chia sẻ] (biểu tượng mũi tên lên ở dưới cùng Safari).\n2. Chọn [Thêm vào Màn hình chính] (Add to Home Screen).'
      );
      return;
    }

    // Kích hoạt popup cài đặt Native của Android / Chrome
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Nếu đã cài và đang chạy dạng App thì ẩn nút
  if (isStandalone) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleInstallClick}
      leftIcon={<Download size={15} />}
      className={className || "gap-2 text-primary border-primary/30 hover:bg-primary/5"}
    >
      Cài đặt ứng dụng
    </Button>
  );
}

export default InstallPwaButton;
