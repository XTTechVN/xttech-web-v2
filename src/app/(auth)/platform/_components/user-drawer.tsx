'use client';

import Link from 'next/link';
import { Drawer, DrawerBody, DrawerHeader, DrawerSection, InfoRow, Tag } from '@/components-remake';
import type { PlatformGlobalUser, PlatformUser } from '@/types';

type Props = { user: PlatformUser | PlatformGlobalUser | null; onClose: () => void };

// Chi tiết người dùng: chỉ đọc
export function UserDrawer({ user, onClose }: Props) {
  return (
    <Drawer isOpen={!!user} onClose={onClose} label="Chi tiết người dùng">
      {user && (
        <>
          <DrawerHeader compact title={user.fullName || user.username} onClose={onClose} />
          <DrawerBody>
            <div className="pt-4">
              <DrawerSection title="Thông tin">
                {'orgId' in user && (
                  <InfoRow label="Doanh nghiệp">
                    <Link href={`/platform/organizations/${user.orgId}`} className="font-medium text-primary">
                      {user.orgName}
                    </Link>
                    <span className="block text-xs text-slate-500">{user.orgCode}</span>
                  </InfoRow>
                )}
                <InfoRow label="Tên đăng nhập">{user.username}</InfoRow>
                <InfoRow label="Email">{user.email || '–'}</InfoRow>
                <InfoRow label="Trạng thái">
                  <Tag tone={user.deletedAt ? 'red' : 'green'}>{user.deletedAt ? 'Đã xoá' : 'Đang hoạt động'}</Tag>
                </InfoRow>
                <InfoRow label="Ngày tạo">{user.createdAt ? new Date(user.createdAt).toLocaleString('vi-VN') : '–'}</InfoRow>
              </DrawerSection>
              <DrawerSection title={`Vai trò (${user.roles.length})`}>
                {user.roles.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {user.roles.map((r) => (
                      <Tag key={r} tone="teal">
                        {r}
                      </Tag>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Chưa có vai trò</p>
                )}
              </DrawerSection>
            </div>
          </DrawerBody>
        </>
      )}
    </Drawer>
  );
}
