'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCan } from '@/hooks';
import type { Attendance } from '@/types';
import { cn } from '@/utils/cn';
import { PageHeader } from '../../_components/page-header';
import { EmptyState, ListSkeleton } from '../../_components/state-views';
import { AdjustmentSheet } from '../../adjustments/_components/adjustment-sheet';
import { AttendanceSheet } from './attendance-sheet';
import { DayView } from './day-view';
import { HistoryView } from './history-view';
import { ReportView } from './report-view';

type Tab = 'day' | 'history' | 'report';
const TAB_LABEL: Record<Tab, string> = { day: 'Theo ngày', history: 'Lịch sử', report: 'Thống kê' };
const today = () => new Date().toLocaleDateString('sv');

// Một trang Chấm công; tab và nút thêm hiện theo quyền của người dùng:
// Theo ngày = đọc phạm vi dept/org · Lịch sử = đọc chấm công · Thống kê = báo cáo chấm công · Thêm (hộ) = tạo chấm công.
export function AttendanceHub() {
  const { can, scopeOf, isReady } = useCan();
  const canRead = can('attendance:read');
  const tabs: Tab[] = [
    ...(canRead && scopeOf('attendance:read') !== 'own' ? (['day'] as const) : []),
    ...(canRead ? (['history'] as const) : []),
    ...(can('attendance_report:read') ? (['report'] as const) : []),
  ];
  // đường dẫn cũ /attendance-history, /attendance-reports chuyển về đây kèm ?tab=
  const fromUrl = useSearchParams().get('tab') as Tab | null;
  const [picked, setPicked] = useState<Tab | null>(null);
  const tab = [picked, fromUrl].find((t): t is Tab => !!t && tabs.includes(t)) ?? tabs[0];
  const [open, setOpen] = useState<Attendance | 'new' | null>(null);
  const [adj, setAdj] = useState<{ type: string; date: string } | null>(null);

  if (!isReady) return <ListSkeleton />;
  if (tabs.length === 0) return <EmptyState title="Bạn chưa có quyền xem chấm công" description="Liên hệ quản trị viên để được cấp quyền." />;

  const wide = scopeOf('attendance:read') !== 'own';
  return (
    <>
      <PageHeader
        title="Chấm công"
        description={wide ? 'Giờ vào, giờ ra, lịch sử và thống kê chấm công.' : 'Giờ vào, giờ ra của bạn theo tháng.'}
        actionLabel={can('attendance:create') ? 'Thêm chấm công' : undefined}
        onAction={() => setOpen('new')}
      />

      {tabs.length > 1 && (
        <div role="tablist" aria-label="Chấm công" className="-mx-rm-gutter mb-3 flex gap-1 overflow-x-auto border-b border-rm-line px-rm-gutter">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={t === tab}
              onClick={() => setPicked(t)}
              className={cn(
                'h-rm-tap flex-none border-b-2 px-3 text-sm font-medium md:h-rm-control',
                t === tab ? 'border-rm-primary text-rm-primary' : 'border-transparent text-rm-muted',
              )}
            >
              {TAB_LABEL[t]}
            </button>
          ))}
        </div>
      )}

      {tab === 'day' && <DayView onOpen={setOpen} onAdjust={(type, date) => setAdj({ type, date })} />}
      {tab === 'history' && <HistoryView onOpen={setOpen} />}
      {tab === 'report' && <ReportView />}

      <AdjustmentSheet
        key={adj ? `adj-${adj.type}-${adj.date}` : 'adj-none'}
        target={adj ? 'new' : null}
        defaultType={adj?.type}
        defaultDate={adj?.date}
        onClose={() => setAdj(null)}
      />
      <AttendanceSheet
        key={open === 'new' ? 'att-new' : `att-${open?.id ?? 'none'}`}
        target={open}
        date={open && open !== 'new' ? open.workDate : today()}
        onClose={() => setOpen(null)}
        onComplain={(d) => {
          setOpen(null);
          setAdj({ type: 'forgot_attendance', date: d });
        }}
      />
    </>
  );
}
