'use client';

import { ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface Column<T> {
  key: string;
  header: string;
  /** Độ rộng / căn lề của cột (class Tailwind) */
  className?: string;
  /** Chỉ hiện từ 1280px */
  wide?: boolean;
  render: (row: T) => React.ReactNode;
}

interface Props<T> {
  caption: string;
  rows: T[];
  rowKey: (row: T) => string | number;
  columns: Column<T>[];
  /** Thẻ gọn dưới 1024px */
  card: (row: T) => React.ReactNode;
  /** Không truyền = dòng không bấm được */
  onOpen?: (row: T) => void;
}

const TH = 'px-4 py-3 text-left text-xs font-medium text-slate-500';

// Từ 1024px: bảng thật (cột phụ từ 1280px); dưới đó: thẻ gọn. Dùng chung cho các tab kho.
export function DataTable<T>({ caption, rows, rowKey, columns, card, onOpen }: Props<T>) {
  return (
    <div className="overflow-hidden rounded-block border border-slate-200/80 bg-white">
      <table className="hidden w-full lg:table">
        <caption className="sr-only">{caption}</caption>
        <thead className="border-b border-slate-200/80 bg-slate-50">
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" className={cn(TH, c.wide && 'hidden xl:table-cell', c.className)}>
                {c.header}
              </th>
            ))}
            {onOpen && (
              <th scope="col" className="w-10">
                <span className="sr-only">Chi tiết</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r) => (
            <tr key={rowKey(r)} onClick={onOpen && (() => onOpen(r))} className={cn(onOpen && 'cursor-pointer hover:bg-slate-50/60')}>
              {columns.map((c) => (
                <td key={c.key} className={cn('px-4 py-3 text-sm text-slate-600', c.wide && 'hidden xl:table-cell', c.className)}>
                  {c.render(r)}
                </td>
              ))}
              {onOpen && (
                <td className="pr-3 text-slate-400">
                  <ChevronRight size={16} />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-slate-100 lg:hidden">
        {rows.map((r) => (
          <li key={rowKey(r)}>
            {onOpen ? (
              <button type="button" onClick={() => onOpen(r)} className="block w-full cursor-pointer px-3 py-3 text-left active:bg-slate-50">
                {card(r)}
              </button>
            ) : (
              <div className="px-3 py-3">{card(r)}</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
