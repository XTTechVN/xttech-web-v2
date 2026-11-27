/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import { User, Lock, LogOut, Download, ChevronsUpDown } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Avatar, Dropdown } from '@/components';
import { useAuthStore } from '@/stores';
import { NativeTracking } from '@/hooks';
import { getFileUrl } from '@/utils';
import { ProfileModal } from './profile-modal';
import { PasswordModal } from './password-modal';

export function UserMenu() {
  const { user } = useAuthStore();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

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

  const handleLogout = async () => {
    if (Capacitor.isNativePlatform()) {
      await NativeTracking.stopTracking().catch(() => undefined);
    }
    await useAuthStore.getState().signout();
  };

  const roleName = user?.roles?.[0]?.name || 'Thành viên';

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Đối với iPhone (Safari)
      alert(
        '📱 Hướng dẫn cài đặt trên iPhone:\n1. Bấm nút [Chia sẻ] (biểu tượng mũi tên lên ở dưới cùng Safari).\n2. Chọn [Thêm vào Màn hình chính] (Add to Home Screen).',
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

  const avatarUrl = user?.avatar
    ? `${getFileUrl(user.avatar)}${user.updatedAt ? `?v=${encodeURIComponent(user.updatedAt)}` : ''}`
    : null;

  const displayName = user?.fullName || user?.username || 'Thành viên';

  return (
    <div>
      <Dropdown
        className="block w-full"
        triggerClassName="flex w-full"
        menuClassName="bottom-full left-0 w-full pt-0 pb-2"
        trigger={
          <div className="flex w-full min-w-0 items-center gap-3 rounded-control p-2 transition-colors hover:bg-slate-50 active:bg-slate-100">
            <Avatar src={avatarUrl || undefined} name={displayName} size="md" />
            <div className="flex min-w-0 flex-1 flex-col text-left">
              <span className="truncate text-sm font-medium text-slate-900">{displayName}</span>
              <span className="truncate text-xs text-slate-500">{roleName}</span>
            </div>
            <ChevronsUpDown size={16} className="flex-none text-slate-400" />
          </div>
        }
        items={[
          { label: 'Thông tin cá nhân', icon: <User size={16} />, onClick: () => setIsProfileOpen(true) },
          { label: 'Đổi mật khẩu', icon: <Lock size={16} />, onClick: () => setIsPasswordOpen(true) },
          { label: 'Cài đặt ứng dụng', icon: <Download size={16} />, onClick: handleInstallClick, disabled: isStandalone },
          { label: 'Đăng xuất', icon: <LogOut size={16} />, danger: true, onClick: handleLogout },
        ]}
      />

      {/* Modals */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <PasswordModal isOpen={isPasswordOpen} onClose={() => setIsPasswordOpen(false)} />
    </div>
  );
}
