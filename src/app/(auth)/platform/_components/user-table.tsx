'use client';

import { useState } from 'react';
import { Tag } from '@/components-remake';
import { DataTable, type Column } from '@/components-remake/data-table';
import type { PlatformGlobalUser, PlatformUser } from '@/types';
import { LoadMore } from './states';
import { UserDrawer } from './user-drawer';

type Row = PlatformUser | PlatformGlobalUser;

const nameOf = (u: Row) => u.fullName || u.username;
const sub = (u: Row) => `${u.username}${u.email && u.email !== u.username ? ` · ${u.email}` : ''}`;
const deleted = (u: Row) => u.deletedAt && <Tag tone="red">Đã xoá</Tag>;

interface Props {
  rows: Row[];
  total: number;
  loadingMore: boolean;
  onMore: () => void;
  /** Trang tìm toàn hệ thống có thêm cột doanh nghiệp */
  withOrg?: boolean;
}

// Danh sách người dùng dùng chung cho trang toàn hệ thống và tab của doanh nghiệp; bấm dòng mở ngăn kéo chi tiết
export function UserTable({ rows, total, loadingMore, onMore, withOrg }: Props) {
  const [selected, setSelected] = useState<Row | null>(null);
  const columns: Column<Row>[] = [
    {
      key: 'name',
      header: 'Người dùng',
      className: 'max-w-72',
      render: (u) => (
        <span className="flex items-center gap-2">
          <span className="min-w-0">
            <span className="block truncate font-medium text-slate-900">{nameOf(u)}</span>
            <span className="block truncate text-xs text-slate-500">{sub(u)}</span>
          </span>
          {deleted(u)}
        </span>
      ),
    },
    ...(withOrg
      ? [
          {
            key: 'org',
            header: 'Doanh nghiệp',
            className: 'max-w-56',
            render: (u: Row) => <span className="block truncate">{'orgName' in u ? u.orgName : ''}</span>,
          },
        ]
      : []),
    {
      key: 'roles',
      header: 'Vai trò',
      wide: true,
      className: 'max-w-64',
      render: (u) => <span className="block truncate">{u.roles.join(', ') || '–'}</span>,
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <DataTable
        caption="Danh sách người dùng"
        rows={rows}
        rowKey={(u) => u.id}
        columns={columns}
        onOpen={setSelected}
        card={(u) => (
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">{nameOf(u)}</p>
              <p className="truncate text-xs text-slate-500">{sub(u)}</p>
              {'orgName' in u && <p className="truncate text-xs text-slate-500">{u.orgName}</p>}
            </div>
            {deleted(u)}
          </div>
        )}
      />
      <LoadMore visible={rows.length} total={total} loading={loadingMore} onClick={onMore} />
      <UserDrawer user={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
