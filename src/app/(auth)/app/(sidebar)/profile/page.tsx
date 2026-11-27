'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, KeyRound, LogOut } from 'lucide-react';
import { getMyProfile } from '@/actions';
import { Button, PageHeading } from '@/components-remake';
import { useCan } from '@/hooks';
import { ChangePasswordDrawer } from './_components/change-password-drawer';
import { EditProfileDrawer } from './_components/edit-profile-drawer';
import { ProfileDetails, ProfileHeader } from './_components/profile-overview';
import { signOutApp, useInstallApp } from './_components/use-account-actions';

// Thông tin của chính người dùng: ai cũng vào được; API /me/profile chỉ trả và chỉ sửa hồ sơ của người gọi
export default function ProfilePage() {
  const { can } = useCan();
  const canEdit = can('user:update');
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const { installed, install } = useInstallApp();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['my-profile'], queryFn: getMyProfile });

  return (
    <div className="p-4 font-body md:p-6 [&_h1]:font-heading [&_h2]:font-heading [&_h3]:font-heading">
      <PageHeading title="Thông tin cá nhân" description="Hồ sơ, mật khẩu và ứng dụng của bạn." />

      {isLoading && <div className="h-64 animate-pulse rounded-block bg-slate-100" aria-label="Đang tải" />}
      {isError && (
        <div className="rounded-block border border-slate-200 bg-white p-6 text-center">
          <p className="text-sm text-slate-700">Không tải được thông tin cá nhân.</p>
          <Button variant="outline" className="mt-3" onClick={() => refetch()}>
            Thử lại
          </Button>
        </div>
      )}

      {data && (
        <div className="flex flex-col gap-4">
          <ProfileHeader user={data} onEdit={canEdit ? () => setEditing(true) : undefined} />

          <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <ProfileDetails user={data} />
            <section className="rounded-block border border-slate-200 bg-white p-4 md:p-5">
              <h2 className="mb-3 font-heading text-sm font-semibold text-slate-900">Tài khoản và bảo mật</h2>
              <div className="flex flex-col gap-2">
                <Button variant="outline" icon={<KeyRound size={16} />} onClick={() => setChangingPassword(true)}>
                  Đổi mật khẩu
                </Button>
                <Button variant="outline" icon={<Download size={16} />} onClick={install} disabled={installed}>
                  {installed ? 'Đã cài đặt ứng dụng' : 'Cài đặt ứng dụng'}
                </Button>
                <Button variant="outline" className="text-red-700" icon={<LogOut size={16} />} onClick={() => void signOutApp()}>
                  Đăng xuất
                </Button>
              </div>
            </section>
          </div>

          {canEdit && <EditProfileDrawer user={data} isOpen={editing} onClose={() => setEditing(false)} />}
          <ChangePasswordDrawer isOpen={changingPassword} onClose={() => setChangingPassword(false)} />
        </div>
      )}
    </div>
  );
}
