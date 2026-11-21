'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProjectProgressMatrix } from '@/actions';
import { useCan } from '@/hooks';
import type { ProgressMatrixItem, ProgressStepCode } from '@/types';
import { Badge, type Tone } from '../../../_components/badge';
import { BTN_LINE, BTN_PRIMARY } from '../../../_components/form';
import { EmptyState, ErrorState, ListSkeleton } from '../../../_components/state-views';
import { ProgressSheet, type ProgressMode } from './progress-sheet';

export const STEP_LABEL: Record<ProgressStepCode, string> = {
  draft: 'Đang thiết kế',
  awaiting_measure: 'Chờ đo',
  surveyed: 'Chờ sản xuất',
  producing: 'Đang sản xuất',
  factory_done: 'Xong xưởng',
  installed: 'Đã lắp',
  accepted: 'Đã nghiệm thu',
};
const STEP_TONE: Record<ProgressStepCode, Tone> = {
  draft: 'neutral',
  awaiting_measure: 'warning',
  surveyed: 'neutral',
  producing: 'primary',
  factory_done: 'warning',
  installed: 'primary',
  accepted: 'success',
};
// Mốc kế tiếp thao tác được hằng ngày; sản xuất do lệnh sản xuất tạo, nghiệm thu lập biên bản ở tab Nghiệm thu.
export const NEXT_STEP: Partial<Record<ProgressStepCode, ProgressStepCode>> = { producing: 'factory_done', factory_done: 'installed' };
export const ADVANCE_LABEL: Partial<Record<ProgressStepCode, string>> = { factory_done: 'Báo sản xuất xong', installed: 'Báo đã lắp xong' };

// Tab Tiến độ: tiến độ từng cửa; chọn nhiều cửa cùng mốc để báo mốc kế tiếp (kèm ảnh) hoặc lùi mốc.
export function TabProgress({ projectId }: { projectId: number }) {
  const { can } = useCan();
  const [sel, setSel] = useState<number[]>([]);
  const [mode, setMode] = useState<ProgressMode | null>(null);
  const q = useQuery({ queryKey: ['project', projectId, 'progress'], queryFn: () => getProjectProgressMatrix(projectId) });

  if (q.isLoading) return <ListSkeleton />;
  if (q.isError || !q.data)
    return <ErrorState title="Không tải được tiến độ" description="Thử lại sau." actionLabel="Thử lại" onAction={() => q.refetch()} />;
  const { items, factoryProgressPercent, overallWeightedProgressPercent } = q.data;
  if (items.length === 0) return <EmptyState title="Chưa có cửa nào" description="Cửa xuất hiện khi dự án có vị trí cửa đã chốt." />;

  const canRevert = can('door_progress:revert');
  const next = (i: ProgressMatrixItem) => {
    const n = NEXT_STEP[i.currentStatus];
    return n && can(`door_progress:set_status:${n}`) ? n : undefined;
  };
  const picked = items.filter((i) => sel.includes(i.positionId));
  const status = picked[0]?.currentStatus;
  const target = picked[0] && next(picked[0]);
  const selectable = (i: ProgressMatrixItem) => (!status || i.currentStatus === status) && (!!next(i) || (canRevert && i.currentStatus !== 'draft'));
  const toggle = (id: number) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <>
      <dl className="mb-3 grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3">
        {[
          ['Xưởng', factoryProgressPercent],
          ['Toàn dự án', overallWeightedProgressPercent],
        ].map(([label, v]) => (
          <div key={label} className="rounded-rm-xl border border-rm-edge bg-rm-surface p-3">
            <dt className="text-xs text-rm-muted">{label}</dt>
            <dd className="font-heading text-2xl font-semibold">{Math.round(Number(v))}%</dd>
          </div>
        ))}
      </dl>

      <ul className="divide-y divide-rm-line rounded-rm-xl border border-rm-edge bg-rm-surface">
        {items.map((i) => {
          const ok = selectable(i);
          return (
            <li key={i.positionId}>
              <label className={`flex min-h-rm-row items-center gap-3 px-rm-gutter py-2 ${ok ? 'cursor-pointer active:bg-rm-bg' : 'opacity-70'}`}>
                <input
                  type="checkbox"
                  checked={sel.includes(i.positionId)}
                  disabled={!ok}
                  onChange={() => toggle(i.positionId)}
                  aria-label={`Chọn ${i.positionCode}`}
                  className="size-5 flex-none accent-[var(--rm-primary)]"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="min-w-0 truncate text-sm font-medium">{i.positionCode}</span>
                    <Badge tone={STEP_TONE[i.currentStatus]}>{STEP_LABEL[i.currentStatus]}</Badge>
                  </span>
                  <span className="block truncate text-xs text-rm-muted">
                    {[i.doorName, i.floorName, `${i.width}×${i.height}`].filter(Boolean).join(' · ')}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      {picked.length > 0 && (
        <div className="sticky bottom-[calc(var(--rm-tabbar,4rem)+env(safe-area-inset-bottom))] z-10 mt-3 flex gap-2 rounded-rm-xl border border-rm-edge bg-rm-surface p-2 md:bottom-2">
          <button type="button" onClick={() => setSel([])} className={`${BTN_LINE} flex-none px-4`}>
            Bỏ chọn
          </button>
          {canRevert && (
            <button type="button" onClick={() => setMode('revert')} className={`${BTN_LINE} min-w-0 flex-1`}>
              Lùi mốc ({picked.length})
            </button>
          )}
          {target && (
            <button type="button" onClick={() => setMode('advance')} className={`${BTN_PRIMARY} min-w-0 flex-1`}>
              {ADVANCE_LABEL[target]} ({picked.length})
            </button>
          )}
        </div>
      )}

      {mode && status && (
        <ProgressSheet
          key={mode}
          projectId={projectId}
          mode={mode}
          current={status}
          target={mode === 'advance' ? target : undefined}
          ids={sel}
          onClose={() => setMode(null)}
          onDone={() => {
            setMode(null);
            setSel([]);
          }}
        />
      )}
    </>
  );
}
