'use client';

import { useEffect, useRef } from 'react';
import { AlertCircle, BatteryMedium } from 'lucide-react';
import { STAFF_LIVE_STATUS_MAP, isStaffSignalLost, type StaffLiveLocation } from '@/types';
import { getFileUrl } from '@/utils';
import { cn } from '@/utils/cn';
import { buildDiagnosticSignals } from '../../../app/(sidebar)/live-map/_components/diagnostic-signals';

const DOT = { danger: 'bg-rm-danger', success: 'bg-rm-success', primary: 'bg-rm-primary' };
const dot = (p: StaffLiveLocation) => (isStaffSignalLost(p.status) ? DOT.danger : p.status === 'moving' ? DOT.success : DOT.primary);
const hhmm = (s: string) => new Date(s).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

interface Props {
  items: StaffLiveLocation[];
  selId: string | null;
  onPick: (p: StaffLiveLocation) => void;
}

// Điện thoại: dải thẻ cuộn ngang nổi ở đáy bản đồ. Từ 1280px: danh sách dọc ở cột phải. Cùng một markup.
export function StaffStrip({ items, selId, onPick }: Props) {
  const ref = useRef<HTMLUListElement>(null);
  useEffect(() => {
    ref.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [selId]);

  if (items.length === 0)
    return (
      <p className="rounded-rm-xl border border-rm-edge bg-rm-surface px-rm-gutter py-4 text-center text-sm text-rm-muted shadow-sm xl:shadow-none">
        Không có ai ở mục này
      </p>
    );

  return (
    <ul
      ref={ref}
      className="flex gap-2 overflow-x-auto [scrollbar-width:none] xl:max-h-full [&::-webkit-scrollbar]:hidden xl:flex-col xl:overflow-y-auto"
    >
      {items.map((p) => {
        const sig = buildDiagnosticSignals(p.diagnostics, { awaitingFirstPing: p.awaitingFirstPing }).length;
        const low = p.batteryLevel != null && p.batteryLevel < 20;
        const on = p.userId === selId;
        return (
          <li key={p.userId} className="w-56 flex-none xl:w-auto">
            <button
              type="button"
              onClick={() => onPick(p)}
              aria-current={on}
              className={cn(
                'flex min-h-rm-tap w-full items-center gap-3 rounded-rm-xl border bg-rm-surface p-2 text-left shadow-sm active:bg-rm-bg xl:shadow-none xl:hover:bg-rm-bg',
                on ? 'border-rm-primary ring-1 ring-rm-primary' : 'border-rm-line',
              )}
            >
              <span className="relative flex size-10 flex-none items-center justify-center rounded-full bg-rm-primary-soft text-sm font-semibold text-rm-primary">
                {p.avatar ? (
                  <img src={getFileUrl(p.avatar)} alt="" className="size-full rounded-full object-cover" />
                ) : (
                  (p.userName || 'N').trim().charAt(0).toUpperCase()
                )}
                <span className={cn('absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-rm-surface', dot(p))} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{p.userName}</span>
                <span className="block truncate text-xs text-rm-muted">
                  {STAFF_LIVE_STATUS_MAP[p.status]} · {hhmm(p.updatedAt)}
                </span>
              </span>
              {sig > 0 && <AlertCircle size={16} className="flex-none text-rm-warning" aria-label={`${sig} cảnh báo thiết bị`} />}
              {p.batteryLevel != null && (
                <span className={cn('flex flex-none items-center gap-0.5 text-xs', low ? 'font-medium text-rm-danger' : 'text-rm-muted')}>
                  <BatteryMedium size={16} aria-hidden="true" />
                  {Math.round(p.batteryLevel)}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
