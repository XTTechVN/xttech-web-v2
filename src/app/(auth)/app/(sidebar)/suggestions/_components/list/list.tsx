'use client';

import { ChevronRight } from 'lucide-react';
import { Tag } from '@/components-remake';
import type { Suggestion } from '@/types';
import { fmtDate, senderName, statusOf, typeOf } from './format';

const TH = 'px-4 py-3 text-left text-xs font-medium text-slate-500';

function Status({ row }: { row: Suggestion }) {
  const s = statusOf(row.status);
  return <Tag tone={s.tone}>{s.label}</Tag>;
}

function Type({ row }: { row: Suggestion }) {
  const t = typeOf(row.type);
  return <Tag tone={t.tone}>{t.label}</Tag>;
}

interface Props {
  rows: Suggestion[];
  /** Chế độ quản lý: hiện người gửi; "Của tôi" thì ẩn */
  showUser: boolean;
  onOpen: (s: Suggestion) => void;
}

// Từ 1024px: bảng thật, cả dòng bấm được; dưới đó: thẻ gọn. Người gửi và ngày gửi từ 1280px.
export function SuggestionList({ rows, showUser, onOpen }: Props) {
  return (
    <div className="overflow-hidden rounded-block border border-slate-200/80 bg-white">
      <table className="hidden w-full lg:table">
        <caption className="sr-only">Danh sách đề xuất. Bấm vào một dòng để xem chi tiết.</caption>
        <thead className="border-b border-slate-200/80 bg-slate-50">
          <tr>
            <th scope="col" className={TH}>
              Đề xuất
            </th>
            <th scope="col" className={`${TH} w-48`}>
              Loại
            </th>
            {showUser && (
              <th scope="col" className={`${TH} hidden w-48 xl:table-cell`}>
                Người gửi
              </th>
            )}
            <th scope="col" className={`${TH} hidden w-28 xl:table-cell`}>
              Ngày gửi
            </th>
            <th scope="col" className={`${TH} w-32`}>
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
                  <span className="block truncate text-sm font-semibold text-slate-900" title={r.title}>
                    {r.title}
                  </span>
                </button>
                <span className="block truncate text-xs text-slate-500">{r.content}</span>
              </td>
              <td className="px-4 py-3">
                <Type row={r} />
              </td>
              {showUser && (
                <td className="hidden max-w-0 px-4 py-3 text-sm text-slate-600 xl:table-cell">
                  <span className="block truncate">{senderName(r)}</span>
                </td>
              )}
              <td className="hidden whitespace-nowrap px-4 py-3 text-sm tabular-nums text-slate-600 xl:table-cell">{fmtDate(r.createdAt)}</td>
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
                <p className="min-w-0 truncate text-sm font-semibold text-slate-900">{r.title}</p>
                <span className="flex-none">
                  <Status row={r} />
                </span>
              </div>
              <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                <Type row={r} />
                <span>
                  {showUser && `${senderName(r)} · `}
                  {fmtDate(r.createdAt)}
                </span>
              </p>
              <p className="line-clamp-1 text-xs text-slate-600 [overflow-wrap:anywhere]">{r.content}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
