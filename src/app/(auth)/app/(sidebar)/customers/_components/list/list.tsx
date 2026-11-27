'use client';

import { ChevronRight } from 'lucide-react';
import { Tag } from '@/components-remake';
import type { Customer } from '@/types';
import { fmtDate, staffName, typeOf } from './format';

const TH = 'px-4 py-3 text-left text-xs font-medium text-slate-500';

function Type({ row }: { row: Customer }) {
  const t = typeOf(row.type);
  return <Tag tone={t.tone}>{t.label}</Tag>;
}

interface Props {
  rows: Customer[];
  /** Chế độ quản lý: hiện người phụ trách; chỉ thấy khách của mình thì ẩn */
  showStaff: boolean;
  onOpen: (c: Customer) => void;
}

// Từ 1024px: bảng thật, cả dòng bấm được; dưới đó: thẻ gọn. Phụ trách và nhà cung cấp từ 1280px.
export function CustomerList({ rows, showStaff, onOpen }: Props) {
  return (
    <div className="overflow-hidden rounded-block border border-slate-200/80 bg-white">
      <table className="hidden w-full lg:table">
        <caption className="sr-only">Danh sách khách hàng. Bấm vào một dòng để xem chi tiết.</caption>
        <thead className="border-b border-slate-200/80 bg-slate-50">
          <tr>
            <th scope="col" className={TH}>
              Khách hàng
            </th>
            <th scope="col" className={`${TH} w-44`}>
              Liên hệ
            </th>
            <th scope="col" className={`${TH} w-40`}>
              Phân loại
            </th>
            {showStaff && (
              <th scope="col" className={`${TH} hidden w-40 xl:table-cell`}>
                Phụ trách
              </th>
            )}
            <th scope="col" className={`${TH} hidden w-40 xl:table-cell`}>
              Nhà cung cấp
            </th>
            <th scope="col" className="w-10">
              <span className="sr-only">Chi tiết</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r) => (
            <tr key={r.id} onClick={() => onOpen(r)} className="cursor-pointer hover:bg-slate-50/60">
              <td className="max-w-0 px-4 py-3">
                <button
                  type="button"
                  className="block w-full cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <span className="block truncate text-sm font-semibold text-slate-900" title={r.name}>
                    {r.name}
                  </span>
                </button>
                <span className="block truncate text-xs text-slate-500">{r.address || 'Chưa có địa chỉ'}</span>
              </td>
              <td className="max-w-0 px-4 py-3 text-sm text-slate-600">
                <span className="block truncate tabular-nums">{r.phone || '–'}</span>
                <span className="block truncate text-xs text-slate-500">{r.email}</span>
              </td>
              <td className="px-4 py-3">
                <Type row={r} />
              </td>
              {showStaff && (
                <td className="hidden max-w-0 px-4 py-3 text-sm text-slate-600 xl:table-cell">
                  <span className="block truncate">{staffName(r)}</span>
                </td>
              )}
              <td className="hidden max-w-0 px-4 py-3 text-sm text-slate-600 xl:table-cell">
                <span className="block truncate">{r.provider?.name ?? '–'}</span>
              </td>
              <td className="pr-3 text-slate-400">
                <ChevronRight size={16} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-slate-100 lg:hidden">
        {rows.map((r) => (
          <li key={r.id}>
            <button
              type="button"
              onClick={() => onOpen(r)}
              className="flex w-full cursor-pointer flex-col gap-1.5 px-3 py-3 text-left active:bg-slate-50"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="min-w-0 truncate text-sm font-semibold text-slate-900">{r.name}</p>
                <span className="flex-none">
                  <Type row={r} />
                </span>
              </div>
              <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                {r.phone && <span className="tabular-nums">{r.phone}</span>}
                {showStaff && r.staff && <span className="truncate">· {staffName(r)}</span>}
                <span>· {fmtDate(r.createdAt)}</span>
              </p>
              {r.address && <p className="line-clamp-1 text-xs text-slate-600 [overflow-wrap:anywhere]">{r.address}</p>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
