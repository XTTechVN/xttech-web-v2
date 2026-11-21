'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getProjectActivities, getProjectOverview } from '@/actions';
import { useCan } from '@/hooks';
import type { ProjectDetail } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { cn } from '@/utils/cn';
import { BTN_LINE } from '../../../_components/form';
import { ErrorState, ListSkeleton } from '../../../_components/state-views';
import { OverviewMaterial } from './overview-material';
import { ProjectSheet } from '../../_components/project-sheet';
import { day } from './use-act';

const Block = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-4">
    <h2 className="mb-2 text-sm font-semibold">{title}</h2>
    <div className="rounded-rm-xl border border-rm-edge bg-rm-surface p-rm-gutter text-sm">{children}</div>
  </section>
);

const STEPS = [
  { id: 'overview', label: 'Khảo sát', perm: 'project:read' },
  { id: 'design', label: 'Thiết kế', perm: 'project_door_position:read' },
  { id: 'quotes', label: 'Báo giá', perm: 'quotation:read' },
  { id: 'contracts', label: 'Hợp đồng', perm: 'contract:read' },
  { id: 'production', label: 'Sản xuất', perm: 'production_order:read' },
];
const stepOf = (st: string) =>
  st === 'draft' || st === 'surveying'
    ? 0
    : st === 'designing'
      ? 1
      : st === 'quotation'
        ? 2
        : st === 'contract'
          ? 3
          : ['producing', 'installing', 'completed'].includes(st)
            ? 4
            : 1;

// Tab Thông tin: thông tin chung, tiến độ, thanh toán, bảo hành, việc tiếp theo và hoạt động gần đây.
export function TabOverview({ project: p }: { project: ProjectDetail }) {
  const { can } = useCan();
  const router = useRouter();
  const [edit, setEdit] = useState(false);
  const go = (tab: string) => router.replace(`/remake/projects/${p.id}?tab=${tab}`, { scroll: false });
  const cur = stepOf(p.status);
  const staff = p.customer?.staff as { fullName?: string; phoneNumber?: string } | null | undefined;
  const ov = useQuery({ queryKey: ['project', p.id, 'overview'], queryFn: () => getProjectOverview(p.id) });
  const act = useQuery({ queryKey: ['project', p.id, 'activities'], queryFn: () => getProjectActivities(p.id, { limit: 8, offset: 0 }) });
  const o = ov.data;
  const info = [
    ['Địa chỉ', p.address],
    ['Bắt đầu', day(p.startDate)],
    ['Dự kiến xong', day(p.targetDate)],
    ['Bàn giao', day(p.handoverDate)],
    ['Số cửa', `${p.totalPositions} · ${p.totalAreaM2.toFixed(1)} m²`],
    ['Ghi chú', p.note],
    ['Người tạo', p.user?.fullName],
    ['Kinh doanh', staff?.fullName],
    ['Đơn vị cung ứng', p.customer?.provider?.name],
  ] as const;

  return (
    <>
      <section className="mb-4" aria-label="Tiến trình dự án">
        <h2 className="mb-2 text-sm font-semibold">
          Tiến trình · bước {cur + 1}/{STEPS.length}
        </h2>
        <ol className="grid grid-cols-[repeat(5,minmax(0,1fr))] gap-1.5">
          {STEPS.map((st, i) => {
            const open = can(st.perm);
            return (
              <li key={st.id}>
                <button
                  type="button"
                  disabled={!open}
                  aria-current={i === cur ? 'step' : undefined}
                  onClick={() => go(st.id)}
                  className={cn(
                    'flex h-full min-h-rm-tap w-full flex-col items-center justify-center gap-1 rounded-rm border px-1 py-2 text-center text-xs',
                    i === cur
                      ? 'border-rm-primary bg-rm-primary-soft font-medium text-rm-primary'
                      : i < cur
                        ? 'border-rm-edge bg-rm-surface'
                        : 'border-rm-line text-rm-muted',
                    !open && 'opacity-60',
                  )}
                >
                  <span className="text-[11px] tabular-nums">{i < cur ? '✓' : i + 1}</span>
                  <span className="w-full truncate">{st.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      {o && (
        <section className="mb-4" aria-label="Chỉ số chính">
          <dl className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2 md:grid-cols-[repeat(4,minmax(0,1fr))]">
            {(
              [
                ['Cửa', `${o.production.totalPositions} · ${o.production.totalAreaM2} m²`, can('project_door_position:read'), 'design'],
                ['Báo giá', formatCurrency(o.quotation.totalAmount), can('quotation:read'), 'quotes'],
                ['Hợp đồng', formatCurrency(o.contract.totalAmount), can('contract:read'), 'contracts'],
                [
                  'Đã thu',
                  o.payment.isFullyPaid ? 'Đã thu đủ' : `${formatCurrency(o.payment.collected)} (${Math.round(o.payment.percent)}%)`,
                  can('payment:read'),
                  'contracts',
                ],
                ['Xong xưởng', `${Math.round(o.production.factoryPercent)}%`, can('production_order:read'), 'production'],
                ['Còn phải thu', formatCurrency(o.payment.remaining), can('payment:read'), 'contracts'],
              ] as const
            )
              .filter(([, , ok]) => ok)
              .map(([k, v, , tab]) => (
                <div key={k} className="min-w-0 rounded-rm-xl border border-rm-edge bg-rm-surface">
                  <button type="button" onClick={() => go(tab)} className="block min-h-rm-tap w-full px-3 py-2 text-left active:bg-rm-bg">
                    <dt className="text-xs text-rm-muted">{k}</dt>
                    <dd className="truncate font-heading text-sm font-semibold tabular-nums">{v}</dd>
                  </button>
                </div>
              ))}
          </dl>
        </section>
      )}

      <Block title="Thông tin chung">
        <dl className="divide-y divide-rm-line">
          {info.map(([k, v]) => (
            <div key={k} className="flex gap-3 py-1.5">
              <dt className="w-28 flex-none text-rm-muted">{k}</dt>
              <dd className="min-w-0 flex-1 [overflow-wrap:anywhere]">{v || '–'}</dd>
            </div>
          ))}
        </dl>
        {can('project:update') && (
          <button type="button" onClick={() => setEdit(true)} className={`${BTN_LINE} mt-3 w-full md:w-auto md:px-6`}>
            Sửa dự án
          </button>
        )}
      </Block>

      <OverviewMaterial project={p} />

      {ov.isLoading && <ListSkeleton rows={3} />}
      {ov.isError && <ErrorState title="Không tải được tổng quan" description="Thử lại sau." actionLabel="Thử lại" onAction={() => ov.refetch()} />}
      {o && (
        <>
          <Block title={`Sản xuất · ${Math.round(o.production.percent)}%`}>
            <div className="mb-3 h-2 overflow-hidden rounded-rm-sm bg-rm-line">
              <div className="h-full bg-rm-primary" style={{ width: `${Math.min(100, o.production.percent)}%` }} />
            </div>
            <ul className="flex flex-wrap gap-2 text-xs">
              {Object.entries(o.production.statusCounts)
                .filter(([, n]) => n > 0)
                .map(([k, n]) => (
                  <li key={k} className="rounded-rm bg-rm-bg px-2 py-1">
                    {o.production.statusLabels[k as keyof typeof o.production.statusLabels] ?? k}: {n}
                  </li>
                ))}
            </ul>
          </Block>
          {(can('payment:read') || can('contract:read')) && (
            <Block title={`Thanh toán · ${Math.round(o.payment.percent)}%`}>
              <p>
                Đã thu {formatCurrency(o.payment.collected)} / {formatCurrency(o.payment.contractTotal)}
              </p>
              <p className="text-rm-muted">Còn lại {formatCurrency(o.payment.remaining)}</p>
            </Block>
          )}
          {(can('quotation:read') || can('contract:read') || can('warranty:read')) && (
            <Block title="Báo giá, hợp đồng, bảo hành">
              <p>
                Báo giá: {o.quotation.code ?? '–'} · {formatCurrency(o.quotation.totalAmount)}
                {o.quotation.isOutdated && ' · đã lỗi thời'}
              </p>
              <p>
                Hợp đồng: {o.contract.code ?? '–'} · {formatCurrency(o.contract.totalAmount)}
              </p>
              <p>
                Bảo hành:{' '}
                {o.warranty.state === 'active'
                  ? `còn ${o.warranty.daysRemaining ?? 0} ngày`
                  : o.warranty.state === 'expired'
                    ? 'hết hạn'
                    : 'chưa bắt đầu'}
              </p>
            </Block>
          )}
          {o.nextActions.length > 0 && (
            <Block title="Việc tiếp theo">
              <ul className="list-disc pl-5">
                {o.nextActions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </Block>
          )}
        </>
      )}

      {(act.data?.items.length ?? 0) > 0 && (
        <Block title="Hoạt động gần đây">
          <ul className="divide-y divide-rm-line">
            {act.data!.items.map((a) => (
              <li key={a.id} className="py-1.5">
                <span className="block [overflow-wrap:anywhere]">{a.actionTitle}</span>
                <span className="block text-xs text-rm-muted">
                  {a.user?.fullName ?? 'Hệ thống'} · {day(a.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </Block>
      )}
      <ProjectSheet key={edit ? `p-${p.id}` : 'none'} target={edit ? p : null} onClose={() => setEdit(false)} />
    </>
  );
}
