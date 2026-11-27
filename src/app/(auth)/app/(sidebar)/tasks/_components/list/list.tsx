'use client';

import { ChevronRight } from 'lucide-react';
import { Tag } from '@/components-remake';
import type { StaffTask } from '@/types';
import { categoryLabel, deadlineOf, fmtDateTime, isOpenTask, isUrgent, priorityOf, remaining } from './format';

const TH = 'px-4 py-3 text-left text-xs font-medium text-slate-500';

function Badges({ row }: { row: StaffTask }) {
  const d = deadlineOf(row);
  const p = priorityOf(row);
  return (
    <span className="flex flex-wrap items-center gap-1">
      <Tag tone={d.tone}>{d.label}</Tag>
      {isUrgent(row) && <Tag tone={p.tone}>{p.label}</Tag>}
    </span>
  );
}

const titleClass = (t: StaffTask) => (t.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-900');
const projectLine = (t: StaffTask) => (t.projectCode ? `${t.projectCode} · ${t.projectName ?? ''}` : '');

interface Props {
  rows: StaffTask[];
  /** Chế độ quản lý: hiện nhân sự thực hiện; "Việc của tôi" thì ẩn */
  showUser: boolean;
  onOpen: (t: StaffTask) => void;
}

// Từ 1024px: bảng thật, cả dòng bấm được; dưới đó: thẻ gọn. Phân loại và nhân sự từ 1280px.
export function TaskList({ rows, showUser, onOpen }: Props) {
  return (
    <div className="overflow-hidden rounded-block border border-slate-200/80 bg-white">
      <table className="hidden w-full lg:table">
        <caption className="sr-only">Danh sách công việc. Bấm vào một dòng để xem chi tiết.</caption>
        <thead className="border-b border-slate-200/80 bg-slate-50">
          <tr>
            <th scope="col" className={TH}>
              Công việc
            </th>
            <th scope="col" className={`${TH} hidden w-44 xl:table-cell`}>
              Phân loại
            </th>
            {showUser && (
              <th scope="col" className={`${TH} hidden w-44 xl:table-cell`}>
                Nhân sự
              </th>
            )}
            <th scope="col" className={`${TH} w-40`}>
              Hạn hoàn thành
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
          {rows.map((t) => (
            <tr key={t.id} onClick={() => onOpen(t)} className="cursor-pointer hover:bg-slate-50/60">
              <td className="max-w-0 px-4 py-3">
                <button
                  type="button"
                  className="block w-full cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <span className={`block truncate text-sm font-semibold ${titleClass(t)}`} title={t.title}>
                    {t.title}
                  </span>
                </button>
                <span className="block truncate text-xs text-slate-500">{[t.code, projectLine(t)].filter(Boolean).join(' · ')}</span>
              </td>
              <td className="hidden max-w-0 px-4 py-3 text-sm text-slate-600 xl:table-cell">
                <span className="block truncate">{categoryLabel(t)}</span>
              </td>
              {showUser && (
                <td className="hidden max-w-0 px-4 py-3 text-sm text-slate-600 xl:table-cell">
                  <span className="block truncate">{t.assigneeName || '–'}</span>
                  {t.departmentName && <span className="block truncate text-xs text-slate-500">{t.departmentName}</span>}
                </td>
              )}
              <td className="px-4 py-3 text-sm tabular-nums text-slate-600">
                <span className="block whitespace-nowrap">{fmtDateTime(t.dueAt)}</span>
                {isOpenTask(t) && <span className="block text-xs text-slate-500">{remaining(t.dueAt)}</span>}
              </td>
              <td className="px-4 py-3">
                <Badges row={t} />
              </td>
              <td className="pr-3 text-slate-400">
                <ChevronRight size={16} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-slate-100 lg:hidden">
        {rows.map((t) => (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => onOpen(t)}
              className="flex w-full cursor-pointer flex-col gap-1.5 px-3 py-3 text-left active:bg-slate-50"
            >
              <p className={`line-clamp-2 text-sm font-semibold [overflow-wrap:anywhere] ${titleClass(t)}`}>{t.title}</p>
              <Badges row={t} />
              <p className="truncate text-xs text-slate-500">{[t.code, showUser ? t.assigneeName : '', t.projectCode].filter(Boolean).join(' · ')}</p>
              <p className="text-xs tabular-nums text-slate-600">
                Hạn {fmtDateTime(t.dueAt)}
                {isOpenTask(t) && ` · ${remaining(t.dueAt)}`}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
