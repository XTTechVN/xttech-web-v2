'use client';

import Link from 'next/link';
import { Badge } from '@/components';
import type { PlatformGlobalUser, PlatformUser } from '@/types';
import { Drawer } from './drawer';

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-0.5 px-4 py-3">
    <dt className="text-xs text-gray-500">{label}</dt>
    <dd className="text-sm text-gray-900 [overflow-wrap:anywhere]">{children}</dd>
  </div>
);

export const UserDrawer = ({ user, onClose }: { user: PlatformUser | PlatformGlobalUser; onClose: () => void }) => (
  <Drawer title={user.fullName || user.username} subtitle={user.username} onClose={onClose}>
    <dl className="divide-y divide-gray-100">
      {'orgId' in user && (
        <Field label="Doanh nghiệp">
          <Link
            href={`/platform/organizations/${user.orgId}`}
            className="font-medium text-primary underline-offset-2 active:opacity-70 [@media(hover:hover)]:hover:underline"
          >
            {user.orgName}
          </Link>
          <span className="block text-xs text-gray-500">{user.orgCode}</span>
        </Field>
      )}
      <Field label="Tên đăng nhập">{user.username}</Field>
      <Field label="Email">{user.email || '—'}</Field>
      <Field label="Trạng thái">
        <Badge size="sm" variant={user.deletedAt ? 'danger' : 'success'}>
          {user.deletedAt ? 'Đã xoá' : 'Đang hoạt động'}
        </Badge>
      </Field>
      <Field label="Ngày tạo">{user.createdAt ? new Date(user.createdAt).toLocaleString('vi-VN') : '—'}</Field>
      <Field label={`Vai trò (${user.roles.length})`}>
        {user.roles.length ? (
          <span className="flex flex-wrap gap-1.5">
            {user.roles.map((r) => (
              <Badge key={r} size="sm">
                {r}
              </Badge>
            ))}
          </span>
        ) : (
          'Chưa có vai trò'
        )}
      </Field>
    </dl>
  </Drawer>
);
