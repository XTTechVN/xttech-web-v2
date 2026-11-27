'use client';

import { ChevronRight } from 'lucide-react';
import { Tag } from '@/components-remake';
import type { CustomerProvider } from '@/types';
import { fmtDate } from './format';

const TH = 'px-4 py-3 text-left text-xs font-medium text-slate-500';

interface Props {
  rows: CustomerProvider[];
  onOpen: (p: CustomerProvider) => void;
}

// Từ 1024px: bảng thật, cả dòng bấm được; dưới đó: thẻ gọn
export function ProviderList({ rows, onOpen }: Props) {
  return (
    <div className="overflow-hidden rounded-block border border-slate-200/80 bg-white">
      <table className="hidden w-full lg:table">
        <caption className="sr-only">Danh sách nhà cung cấp. Bấm vào một dòng để xem chi tiết.</caption>
        <thead className="border-b border-slate-200/80 bg-slate-50">
          <tr>
            <th scope="col" className={TH}>
              Nhà cung cấp
            </th>
            <th scope="col" className={`${TH} w-40`}>
              Mã
            </th>
            <th scope="col" className={`${TH} w-32`}>
              Ngày tạo
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
              </td>
              <td className="px-4 py-3">
                <Tag tone="blue">{r.code}</Tag>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm tabular-nums text-slate-600">{fmtDate(r.createdAt)}</td>
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
              <p className="min-w-0 truncate text-sm font-semibold text-slate-900">{r.name}</p>
              <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                <Tag tone="blue">{r.code}</Tag>
                <span>{fmtDate(r.createdAt)}</span>
              </p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
