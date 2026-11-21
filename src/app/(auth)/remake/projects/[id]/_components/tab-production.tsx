'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cancelProductionOrder, createProductionOrder, getProductionOrders, getProjectPositions } from '@/actions';
import { useCan } from '@/hooks';
import type { ProductionOrder } from '@/types';
import { Badge, type Tone } from '../../../_components/badge';
import { BTN_LINE, BTN_PRIMARY, Field, INPUT } from '../../../_components/form';
import { Sheet } from '../../../_components/sheet';
import { EmptyState, ErrorState, ListSkeleton } from '../../../_components/state-views';
import { GlassOrdersTab } from '../../../warehouse/_components/glass-orders-tab';
import { ReasonSheet } from '../../_components/reason-sheet';
import { CuttingSheet } from './cutting-sheet';
import { ProductionSheets } from './production-sheets';
import { day, useAct } from './use-act';

const ST: Record<ProductionOrder['status'], { label: string; tone: Tone }> = {
  pending: { label: 'Chờ làm', tone: 'neutral' },
  in_progress: { label: 'Đang làm', tone: 'warning' },
  completed: { label: 'Hoàn tất', tone: 'success' },
  cancelled: { label: 'Đã huỷ', tone: 'danger' },
};

// Tab Sản xuất: lệnh sản xuất và tiến độ; tạo lệnh từ các cửa đã đo, huỷ lệnh.
export function TabProduction({ projectId }: { projectId: number }) {
  const { can } = useCan();
  const [open, setOpen] = useState(false);
  const [cut, setCut] = useState<ProductionOrder | null>(null);
  const [glassMake, setGlassMake] = useState(false);
  const [sheets, setSheets] = useState<ProductionOrder | null>(null);
  const [cancelling, setCancelling] = useState<ProductionOrder | null>(null);
  const q = useQuery({ queryKey: ['project', projectId, 'orders'], queryFn: () => getProductionOrders(projectId) });
  const cancel = useAct(
    projectId,
    (v: { id: number; note: string }) => cancelProductionOrder(projectId, v.id, v.note),
    'Đã huỷ lệnh sản xuất',
    () => setCancelling(null),
  );
  const canCreate = can('production_order:create');
  const canCancel = can('production_order:cancel');
  const items = q.data?.items ?? [];

  return (
    <>
      {canCreate && (
        <button type="button" onClick={() => setOpen(true)} className={`${BTN_PRIMARY} mb-3 w-full md:w-auto md:px-6`}>
          Tạo lệnh sản xuất
        </button>
      )}
      {q.isLoading && <ListSkeleton />}
      {q.isError && <ErrorState title="Không tải được lệnh sản xuất" description="Thử lại sau." actionLabel="Thử lại" onAction={() => q.refetch()} />}
      {q.data && items.length === 0 && <EmptyState title="Chưa có lệnh sản xuất" description="Chọn các cửa đã đo để tạo lệnh." />}
      {items.length > 0 && (
        <ul className="divide-y divide-rm-line rounded-rm-xl border border-rm-edge bg-rm-surface">
          {items.map((o) => (
            <li key={o.id} className="px-rm-gutter py-2">
              <p className="flex items-center gap-2">
                <span className="min-w-0 truncate text-sm font-medium">{o.name}</span>
                <Badge tone={ST[o.status].tone}>{ST[o.status].label}</Badge>
                {o.kind === 'rework' && <Badge tone="danger">Làm lại</Badge>}
              </p>
              <p className="truncate text-xs text-rm-muted">
                {o.code} · {o.completedItems}/{o.totalItems} cửa · hạn {day(o.dueDate)}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-rm-sm bg-rm-line">
                <div className="h-full bg-rm-primary" style={{ width: `${Math.min(100, o.progressPercent)}%` }} />
              </div>
              {o.status !== 'cancelled' && (
                <button type="button" onClick={() => setCut(o)} className={`${BTN_LINE} mt-2 w-full md:w-auto md:px-6`}>
                  Kế hoạch cắt
                </button>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {o.status !== 'cancelled' && (
                  <button type="button" onClick={() => setSheets(o)} className={`${BTN_LINE} flex-none px-3`}>
                    Thẻ sản xuất
                  </button>
                )}
                {canCancel && (o.status === 'pending' || o.status === 'in_progress') && (
                  <button type="button" onClick={() => setCancelling(o)} className="h-rm-tap flex-none px-2 text-sm text-rm-danger md:h-rm-control">
                    Huỷ lệnh
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {can('glass_order:read') && (
        <section className="mt-6" aria-label="Đơn đặt kính">
          <div className="mb-2 flex items-center gap-2">
            <h2 className="min-w-0 flex-1 truncate text-sm font-semibold">Đặt kính</h2>
            {can('glass_order:create') && (
              <button type="button" onClick={() => setGlassMake(true)} className={`${BTN_LINE} flex-none px-4`}>
                Tạo đơn kính
              </button>
            )}
          </div>
          <GlassOrdersTab fixedProjectId={projectId} makeOpen={glassMake} onMakeClose={() => setGlassMake(false)} />
        </section>
      )}
      <ProductionSheets key={sheets ? `ps-${sheets.id}` : 'ps-idle'} projectId={projectId} order={sheets} onClose={() => setSheets(null)} />
      <ReasonSheet
        key={cancelling ? `cx-${cancelling.id}` : 'cx-idle'}
        open={!!cancelling}
        title={cancelling ? `Huỷ lệnh ${cancelling.code}` : 'Huỷ lệnh'}
        label="Lý do huỷ lệnh"
        required
        confirm="Xác nhận huỷ"
        busy={cancel.isPending}
        onClose={() => setCancelling(null)}
        onConfirm={(note) => cancelling && cancel.mutate({ id: cancelling.id, note })}
      />
      <CuttingSheet key={`cut-${cut?.id ?? 'none'}`} projectId={projectId} order={cut} onClose={() => setCut(null)} />
      <OrderSheet key={open ? 'order-open' : 'order-none'} projectId={projectId} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function OrderSheet({ projectId, open, onClose }: { projectId: number; open: boolean; onClose: () => void }) {
  const [name, setName] = useState('');
  const [due, setDue] = useState('');
  const [picked, setPicked] = useState<number[]>([]);
  const [rework, setRework] = useState(false);
  const [reason, setReason] = useState('');
  const pos = useQuery({
    queryKey: ['project', projectId, 'positions', rework ? 'rework' : 'ready'],
    queryFn: () => getProjectPositions(projectId, rework ? { limit: 500 } : { status: 'surveyed', limit: 200 }),
    enabled: open,
  });
  const save = useAct(
    projectId,
    () =>
      createProductionOrder(projectId, {
        name: name.trim(),
        dueDate: due || undefined,
        positionIds: picked,
        kind: rework ? 'rework' : 'normal',
        reworkReason: rework ? reason.trim() : undefined,
      }),
    'Đã tạo lệnh sản xuất',
    onClose,
  );
  const items = (pos.data?.items ?? []).filter((p) => !rework || ['factory_done', 'installed'].includes(p.status ?? ''));
  const toggleRework = (v: boolean) => {
    setRework(v);
    setPicked([]);
  };

  return (
    <Sheet open={open} onClose={onClose} title="Tạo lệnh sản xuất">
      <form
        className="flex flex-col gap-4 p-rm-gutter"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <label className="flex min-h-rm-tap items-center gap-3 text-sm">
          <input type="checkbox" checked={rework} onChange={(e) => toggleRework(e.target.checked)} className="size-5 accent-[var(--rm-primary)]" />
          <span className="min-w-0">Lệnh làm lại (cửa đã làm xong nhưng lỗi, chưa nghiệm thu)</span>
        </label>
        {rework && (
          <Field label="Lý do làm lại (bắt buộc)" id="po-reason">
            <input id="po-reason" value={reason} onChange={(e) => setReason(e.target.value)} className={INPUT} />
          </Field>
        )}
        <Field label="Tên lệnh" id="po-name">
          <input id="po-name" value={name} onChange={(e) => setName(e.target.value)} className={INPUT} />
        </Field>
        <Field label="Hạn hoàn thành" id="po-due">
          <input id="po-due" type="date" value={due} onChange={(e) => setDue(e.target.value)} className={INPUT} />
        </Field>
        <fieldset>
          <legend className="mb-1 text-sm font-medium">
            {rework ? 'Cửa xong xưởng hoặc đã lắp' : 'Cửa đã đo, chờ sản xuất'} ({picked.length}/{items.length})
          </legend>
          {pos.isLoading && <ListSkeleton rows={2} />}
          {pos.data && items.length === 0 && (
            <p className="text-sm text-rm-muted">{rework ? 'Chưa có cửa nào đủ điều kiện làm lại.' : 'Chưa có cửa nào ở trạng thái chờ sản xuất.'}</p>
          )}
          <ul className="divide-y divide-rm-line rounded-rm border border-rm-line">
            {items.map((p) => (
              <li key={p.id}>
                <label className="flex min-h-rm-tap items-center gap-3 px-3 text-sm">
                  <input
                    type="checkbox"
                    checked={picked.includes(p.id)}
                    onChange={() => setPicked(picked.includes(p.id) ? picked.filter((x) => x !== p.id) : [...picked, p.id])}
                    className="size-5 accent-[var(--rm-primary)]"
                  />
                  <span className="min-w-0 flex-1 truncate">
                    {p.code} · {p.floor?.name ?? '–'} · {p.width}×{p.height}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
        <button
          type="submit"
          disabled={save.isPending || !name.trim() || picked.length === 0 || (rework && reason.trim().length < 3)}
          className={BTN_PRIMARY}
        >
          {save.isPending ? 'Đang tạo…' : 'Tạo lệnh'}
        </button>
      </form>
    </Sheet>
  );
}
