'use client';

import { ChevronRight } from 'lucide-react';
import { Avatar } from '@/components';
import { Tag } from '@/components-remake';
import { getRequestTypeLabel, type AttendanceAdjustmentRequest } from '@/types';
import { getFileUrl } from '@/utils';
import { changeText, fmtDate, personName, statusOf } from './format';

const TH = 'px-4 py-3 text-left text-xs font-medium text-slate-500';

function Person({ row }: { row: AttendanceAdjustmentRequest }) {
  const name = personName(row.user);
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar src={getFileUrl(row.user?.avatar) || undefined} name={name} size="sm" />
      <p className="min-w-0 truncate text-sm font-semibold text-slate-900" title={name}>
        {name}
      </p>
    </div>
  );
}

function Status({ row }: { row: AttendanceAdjustmentRequest }) {
  const s = statusOf(row.status);
  return <Tag tone={s.tone}>{s.label}</Tag>;
}

interface Props {
  rows: AttendanceAdjustmentRequest[];
  /** Chế độ quản lý: hiện tên người; "Của tôi" thì ẩn */
  showUser: boolean;
  onOpen: (r: AttendanceAdjustmentRequest) => void;
}

// Từ 1024px: bảng thật, cả dòng bấm được; dưới đó: thẻ gọn. Lý do chỉ hiện từ 1280px.
export function AdjustmentList({ rows, showUser, onOpen }: Props) {
  return (
    <div className="overflow-hidden rounded-block border border-slate-200/80 bg-white">
      <table className="hidden w-full lg:table">
        <caption className="sr-only">Danh sách khiếu nại chấm công. Bấm vào một dòng để xem chi tiết.</caption>
        <thead className="border-b border-slate-200/80 bg-slate-50">
          <tr>
            <th scope="col" className={`${TH} w-32`}>
              Ngày
            </th>
            {showUser && (
              <th scope="col" className={TH}>
                Nhân sự
              </th>
            )}
            <th scope="col" className={`${TH} w-44`}>
              Loại
            </th>
            <th scope="col" className={`${TH} w-60`}>
              Đề nghị
            </th>
            <th scope="col" className={`${TH} hidden xl:table-cell`}>
              Lý do
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
              <td className="whitespace-nowrap px-4 py-3 text-sm tabular-nums text-slate-600">
                <button type="button" className="cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                  {fmtDate(r.workDate)}
                </button>
              </td>
              {showUser && (
                <td className="max-w-0 px-4 py-3">
                  <Person row={r} />
                </td>
              )}
              <td className="px-4 py-3">
                <Tag tone="blue">{getRequestTypeLabel(r.requestType)}</Tag>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm tabular-nums text-slate-900">{changeText(r)}</td>
              <td className="hidden max-w-0 px-4 py-3 text-sm text-slate-600 xl:table-cell">
                <span className="block truncate" title={r.reason}>
                  {r.reason || '–'}
                </span>
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
                {showUser ? <Person row={r} /> : <p className="text-sm font-semibold tabular-nums text-slate-900">{fmtDate(r.workDate)}</p>}
                <span className="flex-none">
                  <Status row={r} />
                </span>
              </div>
              <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                <Tag tone="blue">{getRequestTypeLabel(r.requestType)}</Tag>
                <span className="tabular-nums">
                  {showUser && `${fmtDate(r.workDate)} · `}
                  {changeText(r)}
                </span>
              </p>
              {r.reason && <p className="line-clamp-1 text-xs text-slate-600 [overflow-wrap:anywhere]">{r.reason}</p>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
