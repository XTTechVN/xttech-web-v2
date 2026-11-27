'use client';

import { ChevronRight } from 'lucide-react';
import { Avatar } from '@/components';
import { Tag } from '@/components-remake';
import { getAttendanceStatusLabel, type Attendance } from '@/types';
import { getFileUrl } from '@/utils';
import { fmtDate, hhmm, personName, statusTone } from './format';

const TH = 'px-4 py-3 text-left text-xs font-medium text-slate-500';

function Person({ row }: { row: Attendance }) {
  const name = personName(row);
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar src={getFileUrl(row.user?.avatar) || undefined} name={name} size="sm" />
      <p className="min-w-0 truncate text-sm font-semibold text-slate-900" title={name}>
        {name}
      </p>
    </div>
  );
}

function Time({ value, note }: { value?: string | null; note?: string | null }) {
  return (
    <div className="whitespace-nowrap tabular-nums">
      <span className="text-sm text-slate-900">{hhmm(value)}</span>
      {note && <span className="block text-xs text-amber-700">{note}</span>}
    </div>
  );
}

const late = (r: Attendance) => (r.isLate ? `Muộn ${r.lateMinutes ?? 0} phút` : null);
const early = (r: Attendance) => (r.isEarlyLeave ? `Sớm ${r.earlyLeaveMinutes ?? 0} phút` : null);

interface Props {
  rows: Attendance[];
  /** Chế độ quản lý: hiện tên người; phạm vi own thì ẩn */
  showUser: boolean;
  onOpen: (a: Attendance) => void;
}

// Từ 1024px (thanh menu trái chiếm chỗ nên 768px chưa đủ rộng cho bảng): bảng thật, cả dòng bấm được; dưới đó: thẻ gọn. Tổng giờ và ghi chú từ 1280px.
export function AttendanceList({ rows, showUser, onOpen }: Props) {
  return (
    <div className="overflow-hidden rounded-block border border-slate-200/80 bg-white">
      <table className="hidden w-full lg:table">
        <caption className="sr-only">Danh sách chấm công. Bấm vào một dòng để xem chi tiết.</caption>
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
            <th scope="col" className={`${TH} w-32`}>
              Vào ca
            </th>
            <th scope="col" className={`${TH} w-32`}>
              Ra ca
            </th>
            <th scope="col" className={`${TH} hidden w-24 xl:table-cell`}>
              Tổng giờ
            </th>
            <th scope="col" className={`${TH} hidden xl:table-cell`}>
              Ghi chú
            </th>
            <th scope="col" className={`${TH} w-40`}>
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
                <Time value={r.checkIn} note={late(r)} />
              </td>
              <td className="px-4 py-3">
                <Time value={r.checkOut} note={early(r)} />
              </td>
              <td className="hidden whitespace-nowrap px-4 py-3 text-sm tabular-nums text-slate-900 xl:table-cell">{r.totalHours ?? 0} giờ</td>
              <td className="hidden max-w-0 px-4 py-3 text-sm text-slate-600 xl:table-cell">
                <span className="block truncate" title={r.note || undefined}>
                  {r.note || '–'}
                </span>
              </td>
              <td className="px-4 py-3">
                <Tag tone={statusTone(r.status)}>{getAttendanceStatusLabel(r.status)}</Tag>
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
              className="flex w-full cursor-pointer flex-col gap-2 px-3 py-3 text-left active:bg-slate-50"
            >
              <div className="flex items-center justify-between gap-2">
                {showUser ? <Person row={r} /> : <p className="text-sm font-semibold text-slate-900">{fmtDate(r.workDate)}</p>}
                <span className="flex-none">
                  <Tag tone={statusTone(r.status)}>{getAttendanceStatusLabel(r.status)}</Tag>
                </span>
              </div>
              <p className="text-xs tabular-nums text-slate-500">
                {showUser && `${fmtDate(r.workDate)} · `}
                {r.checkIn || r.checkOut ? `${hhmm(r.checkIn)} – ${hhmm(r.checkOut)} · ${r.totalHours ?? 0} giờ` : 'Chưa chấm công'}
                {(late(r) || early(r)) && <span className="text-amber-700"> · {[late(r), early(r)].filter(Boolean).join(', ')}</span>}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
