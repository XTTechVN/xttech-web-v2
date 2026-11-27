'use client';

import { Building2, ChevronRight } from 'lucide-react';
import { Tag } from '@/components-remake';
import type { Department } from '@/types';

export const formatDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString('vi-VN') : '–');

function Name({ row }: { row: Department }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex size-9 flex-none items-center justify-center rounded-control bg-primary/5 text-primary">
        <Building2 size={18} />
      </span>
      <p className="min-w-0 truncate text-sm font-semibold text-slate-900" title={row.name}>
        {row.name}
      </p>
    </div>
  );
}

const TH = 'px-4 py-3 text-left text-xs font-medium text-slate-500';

// Từ 768px: bảng thật, cả dòng bấm được để mở chi tiết; dưới 768px: thẻ gọn. Ngày tạo từ 1024px.
export function DepartmentList({ rows, onOpen }: { rows: Department[]; onOpen: (d: Department) => void }) {
  return (
    <div className="overflow-hidden rounded-block border border-slate-200/80 bg-white">
      <table className="hidden w-full md:table">
        <caption className="sr-only">Danh sách phòng ban. Bấm vào một dòng để xem chi tiết.</caption>
        <thead className="border-b border-slate-200/80 bg-slate-50">
          <tr>
            <th scope="col" className={TH}>
              Phòng ban
            </th>
            <th scope="col" className={`${TH} w-44`}>
              Mã phòng ban
            </th>
            <th scope="col" className={`${TH} hidden w-36 lg:table-cell`}>
              Ngày tạo
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
                  <Name row={row} />
                </button>
              </td>
              <td className="px-4 py-3">{row.code ? <Tag>{row.code}</Tag> : <span className="text-xs text-slate-400">–</span>}</td>
              <td className="hidden px-4 py-3 text-sm tabular-nums text-slate-600 lg:table-cell">{formatDate(row.createdAt)}</td>
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
              <Name row={row} />
              <div className="flex flex-wrap items-center gap-2">
                {row.code && <Tag>{row.code}</Tag>}
                <span className="text-xs text-slate-500">Tạo {formatDate(row.createdAt)}</span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
