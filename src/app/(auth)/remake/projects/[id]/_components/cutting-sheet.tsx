'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { checkProjectMaterialShortage, createCuttingPlan, getCuttingPlan, issueCuttingPlan, returnCuttingOffcuts } from '@/actions';
import { useCan } from '@/hooks';
import type { CuttingBar, CuttingPlanStatus, ProductionOrder } from '@/types';
import { Badge, type Tone } from '../../../_components/badge';
import { BTN_LINE, BTN_PRIMARY, messageOf } from '../../../_components/form';
import { Sheet } from '../../../_components/sheet';
import { ErrorState, ListSkeleton } from '../../../_components/state-views';
import { ShortageReceiptSheet } from './shortage-receipt-sheet';
import { esc, printHtml } from '../../_components/print-html';

const ST: Record<CuttingPlanStatus, { label: string; tone: Tone }> = {
  draft: { label: 'Bản nháp', tone: 'neutral' },
  issued: { label: 'Đã xuất vật tư', tone: 'success' },
  cancelled: { label: 'Đã huỷ', tone: 'danger' },
};
const mm = (n: number) => `${n.toLocaleString('vi-VN')} mm`;

interface Props {
  projectId: number;
  order: ProductionOrder | null;
  onClose: () => void;
}

// Kế hoạch cắt thanh nhôm của một lệnh sản xuất: lập, xem từng thanh, xuất vật tư, trả đầu thừa về kho.
export function CuttingSheet({ projectId, order, onClose }: Props) {
  const { can } = useCan();
  const qc = useQueryClient();
  const [back, setBack] = useState<number[]>([]);
  const [buy, setBuy] = useState(false);
  const key = ['project', projectId, 'cutting', order?.id];
  const q = useQuery({ queryKey: key, queryFn: () => getCuttingPlan(projectId, order!.id), enabled: !!order });
  const plan = q.data;
  const short = useQuery({
    queryKey: ['order_shortage', projectId, order?.id],
    queryFn: () => checkProjectMaterialShortage(projectId, order!.id),
    enabled: !!order && !!plan && plan.status === 'draft' && can('warehouse_item:read'),
    staleTime: 0,
  });
  const shortages = short.data?.shortages ?? [];
  const print = () =>
    plan &&
    printHtml(
      `Kế hoạch cắt ${order?.code ?? ''}`,
      `<h1>KẾ HOẠCH CẮT ${esc(order?.code)}</h1><p>Bản ${plan.version} · mạch cắt ${plan.kerfMm} mm · ${plan.summary.totalBars} thanh · hao phí ${plan.summary.wastePercent.toFixed(1)}%</p><table><tr><th>Thanh</th><th>Màu</th><th>Nguồn</th><th>Dùng / dài (mm)</th><th>Các đoạn cắt</th></tr>${plan.bars
        .map(
          (b) =>
            `<tr><td>${esc(b.profileCode)}</td><td>${esc(b.colorName ?? '')}</td><td>${b.sourceType === 'offcut' ? 'Đầu thừa' : 'Thanh mới'}</td><td>${b.usedMm} / ${b.stockLengthMm}</td><td>${b.pieces.map((p) => `${p.lengthMm}${p.positionCode ? ` (${esc(p.positionCode)})` : ''}`).join(' · ')}</td></tr>`,
        )
        .join('')}</table>`,
    );
  const done = (msg: string) => {
    toast.success(msg);
    qc.invalidateQueries({ queryKey: key });
  };
  const fail = (e: unknown) => toast.error(messageOf(e));
  const create = useMutation({
    mutationFn: () => createCuttingPlan(projectId, order!.id),
    onSuccess: () => done('Đã lập kế hoạch cắt'),
    onError: fail,
  });
  const issue = useMutation({
    mutationFn: () => issueCuttingPlan(projectId, order!.id),
    onSuccess: () => done('Đã xuất vật tư theo kế hoạch'),
    onError: fail,
  });
  const giveBack = useMutation({
    mutationFn: () => returnCuttingOffcuts(projectId, order!.id, back),
    onSuccess: (r) => {
      done(`Đã trả ${r.returnedCount} đầu thừa về kho`);
      setBack([]);
    },
    onError: fail,
  });
  const canPlan = can('production_order:update');
  const canIssue = can('production_order:issue_material');
  const returnable = (b: CuttingBar) => b.isOffcutReturnSuggested && !b.isOffcutReturned;

  return (
    <Sheet open={!!order} onClose={onClose} title={`Kế hoạch cắt${order ? ` · ${order.code}` : ''}`}>
      <div className="flex flex-col gap-4 p-rm-gutter">
        {q.isLoading && <ListSkeleton rows={3} />}
        {q.isError && (
          <ErrorState title="Không tải được kế hoạch cắt" description="Thử lại sau." actionLabel="Thử lại" onAction={() => q.refetch()} />
        )}
        {q.isSuccess && !plan && (
          <>
            <p className="text-sm text-rm-muted">
              Lệnh này chưa có kế hoạch cắt. Hệ thống xếp các đoạn cắt vào thanh tiêu chuẩn và đầu thừa trong kho để ít hao nhất.
            </p>
            {canPlan ? (
              <button type="button" disabled={create.isPending} onClick={() => create.mutate()} className={BTN_PRIMARY}>
                {create.isPending ? 'Đang lập…' : 'Lập kế hoạch cắt'}
              </button>
            ) : (
              <p className="text-sm text-rm-muted">Bạn không có quyền lập kế hoạch cắt.</p>
            )}
          </>
        )}
        {plan && (
          <>
            <p className="flex flex-wrap items-center gap-2 text-sm text-rm-muted">
              <Badge tone={ST[plan.status].tone}>{ST[plan.status].label}</Badge>
              <span>
                Bản {plan.version} · mạch cắt {plan.kerfMm} mm
              </span>
              {plan.isEstimated && <Badge tone="warning">Ước tính</Badge>}
            </p>
            <dl className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-2 text-center">
              {[
                ['Thanh', plan.summary.totalBars],
                ['Đoạn cắt', plan.summary.totalPieces],
                ['Hao phí', `${plan.summary.wastePercent.toFixed(1)}%`],
              ].map(([l, v]) => (
                <div key={l} className="rounded-rm bg-rm-bg px-1 py-2">
                  <dd className="font-heading text-lg font-semibold">{v}</dd>
                  <dt className="text-xs text-rm-muted">{l}</dt>
                </div>
              ))}
            </dl>
            <p className="text-xs text-rm-muted">
              {plan.summary.standardBars} thanh mới · {plan.summary.offcutBars} đầu thừa tái dùng
            </p>

            {plan.status === 'draft' && short.isSuccess && (
              <div
                role="status"
                className={`rounded-rm-xl px-3 py-2 text-sm ${shortages.length ? 'bg-rm-danger-soft text-rm-danger' : 'bg-rm-success-soft text-rm-success'}`}
              >
                {shortages.length === 0 ? (
                  'Kho đủ vật tư cho lệnh này.'
                ) : (
                  <>
                    <p className="font-medium">Thiếu {shortages.length} mặt hàng vật tư</p>
                    <ul className="mt-1 space-y-0.5 text-xs">
                      {shortages.map((x) => (
                        <li key={`${x.itemCode}-${x.colorId ?? ''}`} className="flex gap-2">
                          <span className="min-w-0 flex-1 truncate">
                            {x.itemCode} · {x.itemName}
                            {x.colorName ? ` (${x.colorName})` : ''}
                            {!x.itemId || x.isConfigured === false ? ' · chưa khai báo' : ''}
                          </span>
                          <span className="flex-none tabular-nums">+{x.shortageQty.toLocaleString('vi-VN')}</span>
                        </li>
                      ))}
                    </ul>
                    {can('warehouse_receipt:create') && (
                      <button type="button" onClick={() => setBuy(true)} className="mt-2 text-xs font-medium underline">
                        Lập phiếu nhập mua bù
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            <button type="button" onClick={print} className={BTN_LINE}>
              In kế hoạch cắt
            </button>

            <ul className="divide-y divide-rm-line rounded-rm-xl border border-rm-edge">
              {plan.bars.map((b) => (
                <li key={b.id} className="flex items-start gap-3 px-3 py-2">
                  {canIssue && returnable(b) && plan.status === 'issued' ? (
                    <input
                      type="checkbox"
                      aria-label={`Trả đầu thừa thanh ${b.profileCode}`}
                      checked={back.includes(b.id)}
                      onChange={() => setBack(back.includes(b.id) ? back.filter((x) => x !== b.id) : [...back, b.id])}
                      className="mt-1 size-5 flex-none accent-[var(--rm-primary)]"
                    />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <span className="min-w-0 truncate">{b.profileCode}</span>
                      {b.colorName && <Badge>{b.colorName}</Badge>}
                      {b.sourceType === 'offcut' && <Badge tone="primary">Đầu thừa</Badge>}
                    </p>
                    <p className="truncate text-xs text-rm-muted">
                      {mm(b.usedMm)} / {mm(b.stockLengthMm)} · thừa {mm(b.wasteMm)}
                      {b.isOffcutReturned ? ' · đã trả kho' : b.isOffcutReturnSuggested ? ' · nên trả kho' : ''}
                    </p>
                    <p className="text-xs text-rm-muted [overflow-wrap:anywhere]">
                      {b.pieces.map((p) => `${p.lengthMm}${p.positionCode ? ` (${p.positionCode})` : ''}`).join(' · ')}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            {plan.status === 'draft' && (
              <div className="flex gap-2">
                {canPlan && (
                  <button type="button" disabled={create.isPending} onClick={() => create.mutate()} className={`${BTN_LINE} min-w-0 flex-1`}>
                    Lập lại
                  </button>
                )}
                {canIssue && (
                  <button
                    type="button"
                    disabled={issue.isPending}
                    onClick={() => window.confirm('Xuất vật tư khỏi kho theo kế hoạch này?') && issue.mutate()}
                    className={`${BTN_PRIMARY} min-w-0 flex-1`}
                  >
                    {issue.isPending ? 'Đang xuất…' : 'Xuất vật tư'}
                  </button>
                )}
              </div>
            )}
            {plan.status === 'issued' && canIssue && plan.summary.suggestedOffcutReturns > 0 && (
              <button type="button" disabled={giveBack.isPending || back.length === 0} onClick={() => giveBack.mutate()} className={BTN_PRIMARY}>
                {giveBack.isPending ? 'Đang trả…' : `Trả đầu thừa về kho (${back.length})`}
              </button>
            )}
          </>
        )}
      </div>
      {order && (
        <ShortageReceiptSheet
          key={buy ? 'b' : 'i'}
          open={buy}
          onClose={() => setBuy(false)}
          projectId={projectId}
          orderId={order.id}
          shortages={shortages}
        />
      )}
    </Sheet>
  );
}
