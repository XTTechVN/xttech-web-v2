import type { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/utils';

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** Cột gọn: co theo nội dung, không xuống dòng. Mặc định cột giãn và cắt chữ bằng dấu … */
  fit?: boolean;
  /** Chỉ hiện từ 1280px để bảng không chật */
  wideOnly?: boolean;
  align?: 'right';
}

interface Props<T> {
  rows: T[];
  rowKey: (row: T) => string | number;
  columns: Column<T>[];
  /** Nội dung thẻ cho màn hẹp (< 768px) */
  card: (row: T) => ReactNode;
  /** Bấm dòng: đi tới trang (href) hoặc mở sheet (onOpen); không truyền thì dòng chỉ để xem */
  href?: (row: T) => string;
  onOpen?: (row: T) => void;
  label: string;
  /** Dùng trong khung hẹp (sheet bên phải): luôn hiện thẻ, không hiện bảng dù màn rộng */
  compact?: boolean;
}

const OVERLAY = 'before:absolute before:inset-0 before:content-[""] focus-visible:outline-2 focus-visible:outline-rm-primary';

// Danh sách dữ liệu: từ 768px là <table> (cột phụ chỉ hiện từ 1280), dưới 768px là thẻ cao thoáng.
export function DataList<T>({ rows, rowKey, columns, card, href, onOpen, label, compact }: Props<T>) {
  const firstFlex = columns.find((c) => !c.fit);
  return (
    <>
      <ul className={cn('divide-y divide-rm-line rounded-rm-xl border border-rm-edge bg-rm-surface', !compact && 'md:hidden')}>
        {rows.map((r) => {
          const inner = (
            <>
              <span className="min-w-0 flex-1 space-y-1">{card(r)}</span>
              {(href || onOpen) && <ChevronRight size={18} className="flex-none text-rm-muted" aria-hidden="true" />}
            </>
          );
          const cls = 'flex min-h-rm-row w-full items-center gap-3 px-rm-gutter py-3 text-left active:bg-rm-bg';
          return (
            <li key={rowKey(r)}>
              {href ? (
                <Link href={href(r)} className={cls}>
                  {inner}
                </Link>
              ) : onOpen ? (
                <button type="button" onClick={() => onOpen(r)} className={cls}>
                  {inner}
                </button>
              ) : (
                <div className={cn(cls, 'active:bg-transparent')}>{inner}</div>
              )}
            </li>
          );
        })}
      </ul>

      {!compact && (
        <div className="hidden overflow-hidden rounded-rm-xl border border-rm-edge bg-rm-surface md:block">
          <table className="w-full text-sm">
            <caption className="sr-only">{label}</caption>
            <thead className="border-b border-rm-line bg-rm-bg text-left text-xs text-rm-muted">
              <tr>
                {columns.map((c) => (
                  <th
                    key={c.key}
                    scope="col"
                    className={cn(
                      'px-3 py-2 font-medium',
                      c.fit ? 'w-px whitespace-nowrap' : cn('max-w-0 truncate', c === firstFlex ? 'w-1/2' : 'w-1/4'),
                      c.align === 'right' && 'text-right',
                      c.wideOnly && 'hidden xl:table-cell',
                    )}
                  >
                    {c.header}
                  </th>
                ))}
                <th scope="col" className="w-10 px-3">
                  <span className="sr-only">Mở</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rm-line">
              {rows.map((r) => (
                <tr key={rowKey(r)} className="relative h-rm-row hover:bg-rm-bg">
                  {columns.map((c, i) => {
                    const body = c.cell(r);
                    const cell = cn(
                      'px-3 py-2 align-middle',
                      c.fit ? 'whitespace-nowrap' : 'max-w-0',
                      c.align === 'right' && 'text-right',
                      c.wideOnly && 'hidden xl:table-cell',
                    );
                    if (i > 0)
                      return (
                        <td key={c.key} className={cn(cell, !c.fit && 'truncate')}>
                          {body}
                        </td>
                      );
                    return (
                      <td key={c.key} className={cell}>
                        {href ? (
                          <Link href={href(r)} className={cn('block min-w-0', OVERLAY)}>
                            {body}
                          </Link>
                        ) : onOpen ? (
                          <button type="button" onClick={() => onOpen(r)} className={cn('block w-full min-w-0 text-left', OVERLAY)}>
                            {body}
                          </button>
                        ) : (
                          <div className="min-w-0">{body}</div>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-3 text-rm-muted">{(href || onOpen) && <ChevronRight size={18} aria-hidden="true" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
