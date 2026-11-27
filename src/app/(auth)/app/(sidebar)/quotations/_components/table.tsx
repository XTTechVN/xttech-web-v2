'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getQuotationOverview } from '@/actions';
import { Skeleton } from '@/components';
import { Button, SearchField, Tabs } from '@/components-remake';
import { useCan, useDebounce } from '@/hooks';
import type { QuotationStatus } from '@/types';
import { QuotationDrawer } from './detail-drawer';
import { STATUSES } from './format';
import { QuotationList } from './list';

type Filter = QuotationStatus | 'all';

export default function QuotationTable() {
  const { can } = useCan();
  const [status, setStatus] = useState<Filter>('pending_approval');
  // Giữ chữ đang gõ trong state cục bộ, trễ 300ms mới gọi API (tránh mất dấu tiếng Việt)
  const [search, setSearch] = useState('');
  const keyword = useDebounce(search.trim(), 300);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const list = useQuery({
    queryKey: ['quotation_overview', status, keyword],
    queryFn: () => getQuotationOverview({ status: status === 'all' ? undefined : status, search: keyword || undefined, limit: 200 }),
  });
  const rows = useMemo(() => list.data?.items ?? [], [list.data]);
  const selected = useMemo(() => rows.find((r) => r.id === selectedId) ?? null, [rows, selectedId]);
  const counts = list.data?.statusCounts ?? {};

  const tabs = STATUSES.map((s) => {
    const n = s.value === 'all' ? 0 : (counts[s.value] ?? 0);
    return { value: s.value, label: n ? `${s.label} (${n})` : s.label };
  });

  let body;
  if (list.isLoading) {
    body = (
      <div className="flex flex-col gap-2" aria-busy="true">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-block" />
        ))}
      </div>
    );
  } else if (list.isError) {
    body = (
      <div className="flex flex-col items-center gap-3 rounded-block border border-slate-200/80 bg-white py-12 text-center">
        <p className="text-sm text-slate-600">Không tải được danh sách báo giá.</p>
        <Button variant="outline" onClick={() => list.refetch()}>
          Thử lại
        </Button>
      </div>
    );
  } else if (rows.length === 0) {
    body = (
      <p className="rounded-block border border-slate-200/80 bg-white py-12 text-center text-sm text-slate-600">
        {keyword || status !== 'all' ? 'Không có báo giá khớp bộ lọc.' : 'Chưa có báo giá.'}
      </p>
    );
  } else {
    body = <QuotationList rows={rows} onOpen={(r) => setSelectedId(r.id)} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Tabs tabs={tabs} value={status} onChange={setStatus} label="Trạng thái báo giá" className="px-0" />
        <div className="flex items-center gap-2">
          <SearchField value={search} onChange={setSearch} label="Tìm báo giá" placeholder="Tìm mã báo giá, dự án, khách hàng..." />
        </div>
      </div>

      {body}

      <QuotationDrawer quotation={selected} canApprove={can('quotation:approve')} onClose={() => setSelectedId(null)} />
    </div>
  );
}
