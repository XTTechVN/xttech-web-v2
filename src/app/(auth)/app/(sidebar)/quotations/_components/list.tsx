'use client';

import { ChevronRight } from 'lucide-react';
import { Tag } from '@/components-remake';
import type { QuotationOverviewItem } from '@/types';
import { formatCurrency } from '@/utils';
import { marginClass, statusOf } from './format';

const TH = 'px-4 py-3 text-left text-xs font-medium text-slate-500';

function Status({ row }: { row: QuotationOverviewItem }) {
  const s = statusOf(row.status);
  return <Tag tone={s.tone}>{s.label}</Tag>;
}

interface Props {
  rows: QuotationOverviewItem[];
  onOpen: (q: QuotationOverviewItem) => void;
}

// Từ 1024px: bảng thật, cả dòng bấm được; dưới đó: thẻ gọn. Chiết khấu và biên lãi từ 1280px.
export function QuotationList({ rows, onOpen }: Props) {
  return (
    <div className="overflow-hidden rounded-block border border-slate-200/80 bg-white">
      <table className="hidden w-full lg:table">
        <caption className="sr-only">Danh sách báo giá. Bấm vào một dòng để xem chi tiết.</caption>
        <thead className="border-b border-slate-200/80 bg-slate-50">
          <tr>
            <th scope="col" className={TH}>
              Báo giá
            </th>
            <th scope="col" className={`${TH} w-64`}>
              Dự án / Khách hàng
            </th>
            <th scope="col" className={`${TH} w-36 text-right`}>
              Tổng tiền
            </th>
            <th scope="col" className={`${TH} hidden w-24 text-right xl:table-cell`}>
              Biên lãi
            </th>
            <th scope="col" className={`${TH} w-44`}>
              Trạng thái
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
                  <span className="block truncate text-sm font-semibold text-slate-900">
                    {r.code} (v{r.version})
                  </span>
                </button>
                <span className="block truncate text-xs text-slate-500">{r.designOptionName ? `${r.name} · ${r.designOptionName}` : r.name}</span>
              </td>
              <td className="max-w-0 px-4 py-3 text-sm text-slate-600">
                <span className="block truncate">{r.projectName}</span>
                <span className="block truncate text-xs text-slate-500">{r.customerName ?? '–'}</span>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold tabular-nums text-slate-900">
                {formatCurrency(r.totalAmount)}
              </td>
              <td
                className={`hidden whitespace-nowrap px-4 py-3 text-right text-sm font-medium tabular-nums xl:table-cell ${marginClass(r.effectiveMarginPercent)}`}
              >
                {r.effectiveMarginPercent.toFixed(1)}%
              </td>
              <td className="px-4 py-3">
                <Status row={r} />
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
                <p className="min-w-0 truncate text-sm font-semibold text-slate-900">
                  {r.code} (v{r.version})
                </p>
                <span className="flex-none">
                  <Status row={r} />
                </span>
              </div>
              <p className="min-w-0 truncate text-xs text-slate-600">
                {r.projectName}
                {r.customerName && ` · ${r.customerName}`}
              </p>
              <p className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold tabular-nums text-slate-900">{formatCurrency(r.totalAmount)}</span>
                <span className={`tabular-nums ${marginClass(r.effectiveMarginPercent)}`}>lãi {r.effectiveMarginPercent.toFixed(1)}%</span>
              </p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
