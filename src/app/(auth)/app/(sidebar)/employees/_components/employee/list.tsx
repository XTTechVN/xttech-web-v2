'use client';

import { ChevronRight } from 'lucide-react';
import { Avatar } from '@/components';
import { Tag, toneFor, type TagTone } from '@/components-remake';
import { getFileUrl } from '@/utils';
import type { Employee } from '@/types';

const ROLE_TONE: Record<string, TagTone> = {
  admin: 'red',
  hr: 'amber',
  accountant: 'orange',
  sale: 'blue',
  technician: 'teal',
  super: 'green',
};

export function roleTone(code: string): TagTone {
  const key = Object.keys(ROLE_TONE).find((k) => code.toLowerCase().includes(k));
  return key ? ROLE_TONE[key] : 'slate';
}

export const formatDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString('vi-VN') : '–');

function Person({ row, sub }: { row: Employee; sub: string }) {
  const name = row.fullName || row.username;
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar src={getFileUrl(row.avatar) || undefined} name={name} size="sm" />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
        <p className="truncate text-xs text-slate-500">{sub}</p>
      </div>
    </div>
  );
}

const NONE = <span className="text-xs text-slate-400">–</span>;

function Tags({ items, max }: { items: { key: string; text: string; tone: TagTone }[]; max?: number }) {
  if (items.length === 0) return NONE;
  const shown = max ? items.slice(0, max) : items;
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1">
      {shown.map((i) => (
        <Tag key={i.key} tone={i.tone}>
          {i.text}
        </Tag>
      ))}
      {max && items.length > max && <span className="text-xs text-slate-500">+{items.length - max}</span>}
    </div>
  );
}

export function RoleTags({ row, max }: { row: Employee; max?: number }) {
  const roles = row.roles?.length ? row.roles : [{ code: 'staff', name: 'Nhân viên' }];
  return <Tags max={max} items={roles.map((r) => ({ key: r.code, text: r.name, tone: roleTone(r.code) }))} />;
}

export function DepartmentTags({ row, max }: { row: Employee; max?: number }) {
  const names = [...new Set((row.positions ?? []).map((p) => p.department?.name).filter((n): n is string => !!n))];
  return <Tags max={max} items={names.map((n) => ({ key: n, text: n, tone: toneFor(n) }))} />;
}

export function PositionTags({ row, max }: { row: Employee; max?: number }) {
  const list = row.positions ?? [];
  return <Tags max={max} items={list.map((p) => ({ key: String(p.id), text: p.name, tone: 'slate' }))} />;
}

const TH = 'px-4 py-3 text-left text-xs font-medium text-slate-500';

// Từ 768px: bảng thật, cả dòng bấm được để mở chi tiết; dưới 768px: thẻ gọn. SĐT và ngày vào làm từ 1280px.
export function EmployeeList({ rows, onOpen }: { rows: Employee[]; onOpen: (e: Employee) => void }) {
  return (
    <div className="overflow-hidden rounded-block border border-slate-200/80 bg-white">
      <table className="hidden w-full md:table">
        <caption className="sr-only">Danh sách nhân sự. Bấm vào một dòng để xem chi tiết.</caption>
        <thead className="border-b border-slate-200/80 bg-slate-50">
          <tr>
            <th scope="col" className={`${TH} w-[28%] min-w-48`}>
              Nhân sự
            </th>
            <th scope="col" className={`${TH} hidden w-36 xl:table-cell`}>
              Số điện thoại
            </th>
            <th scope="col" className={`${TH} w-36`}>
              Vai trò
            </th>
            <th scope="col" className={`${TH} w-[18%]`}>
              Phòng ban
            </th>
            <th scope="col" className={`${TH} w-[18%]`}>
              Chức vụ
            </th>
            <th scope="col" className={`${TH} hidden w-32 xl:table-cell`}>
              Ngày vào làm
            </th>
            <th scope="col" className="w-10">
              <span className="sr-only">Chi tiết</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.id} onClick={() => onOpen(row)} className="cursor-pointer hover:bg-slate-50/60">
              <td className="max-w-0 px-4 py-3">
                <button
                  type="button"
                  className="block w-full cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <Person row={row} sub={row.email} />
                </button>
              </td>
              <td className="hidden px-4 py-3 text-sm tabular-nums text-slate-600 xl:table-cell">{row.phoneNumber || '–'}</td>
              <td className="px-4 py-3">
                <RoleTags row={row} max={1} />
              </td>
              <td className="px-4 py-3">
                <DepartmentTags row={row} max={2} />
              </td>
              <td className="px-4 py-3">
                <PositionTags row={row} max={2} />
              </td>
              <td className="hidden px-4 py-3 text-sm tabular-nums text-slate-600 xl:table-cell">{formatDate(row.joinedAt)}</td>
              <td className="pr-3 text-slate-400">
                <ChevronRight size={16} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-slate-100 md:hidden">
        {rows.map((row) => (
          <li key={row.id}>
            <button
              type="button"
              onClick={() => onOpen(row)}
              className="flex w-full cursor-pointer flex-col gap-2 px-3 py-3 text-left active:bg-slate-50"
            >
              <Person row={row} sub={row.phoneNumber || row.email} />
              <div className="flex flex-wrap items-center gap-1">
                <RoleTags row={row} max={1} />
                <DepartmentTags row={row} max={1} />
                <PositionTags row={row} max={1} />
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
