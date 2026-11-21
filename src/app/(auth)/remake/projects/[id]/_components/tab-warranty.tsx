'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cancelWarrantyVisit, getProjectWarranty, startWarrantyVisit, updateWarrantySettings } from '@/actions';
import { WARRANTY_STATE_MAP } from '@/config';
import { useCan } from '@/hooks';
import type { WarrantyVisit } from '@/types';
import { Badge, toneOf } from '../../../_components/badge';
import { BTN_LINE, BTN_PRIMARY, INPUT } from '../../../_components/form';
import { Sheet } from '../../../_components/sheet';
import { EmptyState, ErrorState, ListSkeleton } from '../../../_components/state-views';
import { ReasonSheet } from '../../_components/reason-sheet';
import { WarrantyCard } from '../../_components/warranty-card';
import { CompleteSheet, VisitFormSheet } from '../../_components/warranty-sheets';
import { day, useAct } from './use-act';

// Tab Bảo hành: thời hạn, tiến độ, lịch bảo hành; tạo yêu cầu (warranty:create), bắt đầu - hoàn thành - sửa - huỷ - đổi thời hạn (warranty:update).
export function TabWarranty({ projectId }: { projectId: number }) {
  const { can } = useCan();
  const q = useQuery({ queryKey: ['project', projectId, 'warranty'], queryFn: () => getProjectWarranty(projectId) });
  const [form, setForm] = useState<'new' | WarrantyVisit | null>(null);
  const [complete, setComplete] = useState<WarrantyVisit | null>(null);
  const [cancel, setCancel] = useState<WarrantyVisit | null>(null);
  const [video, setVideo] = useState('');
  const [months, setMonths] = useState('');
  const settings = useAct(
    projectId,
    () => updateWarrantySettings(projectId, Number(months)),
    'Đã đổi thời hạn bảo hành',
    () => setMonths(''),
  );
  const start = useAct(projectId, (v: WarrantyVisit) => startWarrantyVisit(projectId, v.id), 'Đã bắt đầu kiểm tra bảo hành');
  const cancelIt = useAct(
    projectId,
    (v: { id: number; reason: string }) => cancelWarrantyVisit(projectId, v.id, v.reason),
    'Đã huỷ đợt bảo hành',
    () => setCancel(null),
  );
  const manage = can('warranty:update');
  const w = q.data;

  if (q.isLoading) return <ListSkeleton />;
  if (q.isError || !w)
    return <ErrorState title="Không tải được bảo hành" description="Thử lại sau." actionLabel="Thử lại" onAction={() => q.refetch()} />;
  const st = WARRANTY_STATE_MAP[w.state];
  const started = w.state !== 'not_started';

  return (
    <>
      <section className="mb-4 rounded-rm-xl border border-rm-edge bg-rm-surface p-rm-gutter text-sm">
        <p className="flex flex-wrap items-center gap-2 font-medium">
          Bảo hành {w.warrantyMonths} tháng <Badge tone={toneOf(st?.variant)}>{st?.label ?? w.state}</Badge>
        </p>
        {started && (
          <>
            <dl className="mt-2 grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2 text-xs md:grid-cols-[repeat(4,minmax(0,1fr))]">
              {[
                ['Bắt đầu', day(w.startDate)],
                ['Hết hạn', day(w.endDate)],
                ['Còn lại', `${w.daysRemaining ?? 0} ngày`],
                ['Đợt đã xong', `${w.doneVisits}/${w.totalVisits}`],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-rm-muted">{k}</dt>
                  <dd className="font-medium tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
            <div
              className="mt-2 h-2 overflow-hidden rounded-rm-sm bg-rm-line"
              role="progressbar"
              aria-valuenow={w.elapsedPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Thời gian bảo hành đã qua"
            >
              <div className="h-full bg-rm-primary" style={{ width: `${Math.min(100, w.elapsedPercent)}%` }} />
            </div>
            {w.overdueVisits > 0 && (
              <p className="mt-2 rounded-rm bg-rm-danger-soft px-3 py-2 text-rm-danger">{w.overdueVisits} đợt bảo hành đã quá hạn chưa thực hiện.</p>
            )}
          </>
        )}
        {manage && (
          <div className="mt-3 flex gap-2">
            <input
              aria-label="Số tháng bảo hành"
              inputMode="numeric"
              placeholder="Số tháng mới"
              value={months}
              onChange={(e) => setMonths(e.target.value.replace(/\D/g, ''))}
              className={INPUT}
            />
            <button type="button" disabled={!months || settings.isPending} onClick={() => settings.mutate()} className={`${BTN_LINE} flex-none px-4`}>
              Đổi
            </button>
          </div>
        )}
      </section>

      <div className="mb-2 flex items-center gap-2">
        <h2 className="flex-1 text-sm font-semibold">Lịch bảo hành · {w.visits.length}</h2>
        {can('warranty:create') && (
          <button type="button" onClick={() => setForm('new')} className={`${BTN_PRIMARY} flex-none px-4`}>
            Tạo yêu cầu
          </button>
        )}
      </div>
      {w.visits.length === 0 && <EmptyState title="Chưa có phiếu bảo hành" description="Hẹn lịch định kỳ hoặc ghi yêu cầu của khách." />}
      <ul className="flex flex-col gap-3">
        {w.visits.map((v) => (
          <WarrantyCard
            key={v.id}
            v={v}
            manage={manage}
            onStart={() => start.mutate(v)}
            onComplete={() => setComplete(v)}
            onEdit={() => setForm(v)}
            onCancel={() => setCancel(v)}
            onVideo={setVideo}
          />
        ))}
      </ul>

      <VisitFormSheet
        key={form === 'new' ? 'v-new' : form ? `v-${form.id}` : 'v-idle'}
        projectId={projectId}
        open={!!form}
        visit={form && form !== 'new' ? form : null}
        onClose={() => setForm(null)}
      />
      <CompleteSheet key={complete ? `c-${complete.id}` : 'c-idle'} visit={complete} onClose={() => setComplete(null)} />
      <ReasonSheet
        key={cancel ? `x-${cancel.id}` : 'x-idle'}
        open={!!cancel}
        title="Huỷ đợt bảo hành"
        label="Lý do huỷ"
        required
        confirm="Xác nhận huỷ"
        busy={cancelIt.isPending}
        onClose={() => setCancel(null)}
        onConfirm={(reason) => cancel && cancelIt.mutate({ id: cancel.id, reason })}
      />
      <Sheet open={!!video} onClose={() => setVideo('')} title="Video bảo hành">
        {video && <video src={video} controls autoPlay className="max-h-[70dvh] w-full bg-black" />}
      </Sheet>
    </>
  );
}
