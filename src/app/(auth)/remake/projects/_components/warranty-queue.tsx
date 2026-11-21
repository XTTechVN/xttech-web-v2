'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cancelWarrantyVisit, getGlobalWarrantyQueue, startWarrantyVisit } from '@/actions';
import { useCan } from '@/hooks';
import type { WarrantyQueueQueryParams, WarrantyVisit } from '@/types';
import { cn } from '@/utils/cn';
import { INPUT } from '../../_components/form';
import { Sheet } from '../../_components/sheet';
import { EmptyState, ErrorState, ListSkeleton } from '../../_components/state-views';
import { useAct } from '../[id]/_components/use-act';
import { ReasonSheet } from './reason-sheet';
import { WarrantyCard } from './warranty-card';
import { CompleteSheet, VisitFormSheet } from './warranty-sheets';

type Quick = 'open' | 'new_claims' | 'in_progress' | 'overdue' | 'chargeable' | 'done';
const TABS: [Quick, string][] = [
  ['open', 'Đang mở'],
  ['new_claims', 'Khách báo'],
  ['in_progress', 'Đang xử lý'],
  ['overdue', 'Quá hạn'],
  ['chargeable', 'Tính phí'],
  ['done', 'Đã xong'],
];

const paramsOf = (quick: Quick, search: string): WarrantyQueueQueryParams => ({
  search: search.trim() || undefined,
  openOnly: quick === 'open' ? true : undefined,
  kind: quick === 'new_claims' ? 'claim' : undefined,
  status: quick === 'new_claims' ? 'scheduled' : quick === 'in_progress' ? 'in_progress' : quick === 'done' ? 'done' : undefined,
  overdueOnly: quick === 'overdue' ? true : undefined,
  isChargeable: quick === 'chargeable' ? true : undefined,
  limit: 50,
});

// Hàng đợi bảo hành và sửa chữa của mọi dự án: lọc nhanh, tìm, xử lý ngay từng phiếu (cần warranty:update), mở dự án tương ứng.
export function WarrantyQueue() {
  const { can } = useCan();
  const [quick, setQuick] = useState<Quick>('open');
  const [search, setSearch] = useState('');
  const [edit, setEdit] = useState<WarrantyVisit | null>(null);
  const [complete, setComplete] = useState<WarrantyVisit | null>(null);
  const [cancel, setCancel] = useState<WarrantyVisit | null>(null);
  const [video, setVideo] = useState('');
  const params = paramsOf(quick, search);
  const q = useQuery({ queryKey: ['global_warranty_queue', params], queryFn: () => getGlobalWarrantyQueue(params) });
  const start = useAct(0, (v: WarrantyVisit) => startWarrantyVisit(v.projectId, v.id), 'Đã bắt đầu kiểm tra bảo hành');
  const cancelIt = useAct(
    0,
    (v: { visit: WarrantyVisit; reason: string }) => cancelWarrantyVisit(v.visit.projectId, v.visit.id, v.reason),
    'Đã huỷ phiếu bảo hành',
    () => setCancel(null),
  );
  const stats = q.data?.stats;
  const manage = can('warranty:update');

  return (
    <>
      {stats && (
        <dl className="mb-3 grid grid-cols-[repeat(4,minmax(0,1fr))] gap-2 text-center">
          {[
            ['Khách báo', stats.newClaims],
            ['Đang xử lý', stats.inProgressCount],
            ['Quá hạn', stats.overdueCount],
            ['Đã xong', stats.doneCount],
          ].map(([k, v]) => (
            <div key={k as string} className="rounded-rm-xl border border-rm-edge bg-rm-surface px-1 py-2">
              <dd className="text-lg font-semibold tabular-nums">{v}</dd>
              <dt className="truncate text-xs text-rm-muted">{k}</dt>
            </div>
          ))}
        </dl>
      )}
      <input
        type="search"
        aria-label="Tìm phiếu bảo hành"
        placeholder="Mã phiếu, tên khách, SĐT, công trình"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={`${INPUT} mb-2`}
      />
      <div role="group" aria-label="Lọc phiếu" className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
        {TABS.map(([v, l]) => (
          <button
            key={v}
            type="button"
            aria-pressed={quick === v}
            onClick={() => setQuick(v)}
            className={cn(
              'h-9 flex-none rounded-rm border px-3 text-sm',
              quick === v ? 'border-rm-primary bg-rm-primary-soft text-rm-primary' : 'border-rm-line',
            )}
          >
            {l}
          </button>
        ))}
      </div>

      {q.isLoading && <ListSkeleton />}
      {q.isError && (
        <ErrorState title="Không tải được hàng đợi bảo hành" description="Thử lại sau." actionLabel="Thử lại" onAction={() => q.refetch()} />
      )}
      {q.data && q.data.items.length === 0 && (
        <EmptyState title="Không có phiếu nào" description="Không có phiếu bảo hành hoặc sửa chữa khớp bộ lọc." />
      )}
      <ul className="flex flex-col gap-4">
        {q.data?.items.map((v) => (
          <li key={v.id}>
            <p className="mb-1 flex items-center gap-2 text-sm">
              <span className="min-w-0 flex-1 truncate">
                <strong>{v.projectCode}</strong> · {v.projectName}
              </span>
              {can('project:read') && (
                <Link href={`/remake/projects/${v.projectId}?tab=warranty`} className="flex-none text-rm-primary">
                  Mở dự án
                </Link>
              )}
            </p>
            <ul>
              <WarrantyCard
                v={v}
                manage={manage}
                onStart={() => start.mutate(v)}
                onComplete={() => setComplete(v)}
                onEdit={() => setEdit(v)}
                onCancel={() => setCancel(v)}
                onVideo={setVideo}
              />
            </ul>
          </li>
        ))}
      </ul>

      <VisitFormSheet
        key={edit ? `e-${edit.id}` : 'e-idle'}
        projectId={edit?.projectId ?? 0}
        open={!!edit}
        visit={edit}
        onClose={() => setEdit(null)}
      />
      <CompleteSheet key={complete ? `c-${complete.id}` : 'c-idle'} visit={complete} onClose={() => setComplete(null)} />
      <ReasonSheet
        key={cancel ? `x-${cancel.id}` : 'x-idle'}
        open={!!cancel}
        title="Huỷ phiếu bảo hành"
        label="Lý do huỷ"
        required
        confirm="Xác nhận huỷ"
        busy={cancelIt.isPending}
        onClose={() => setCancel(null)}
        onConfirm={(reason) => cancel && cancelIt.mutate({ visit: cancel, reason })}
      />
      <Sheet open={!!video} onClose={() => setVideo('')} title="Video bảo hành">
        {video && <video src={video} controls autoPlay className="max-h-[70dvh] w-full bg-black" />}
      </Sheet>
    </>
  );
}
