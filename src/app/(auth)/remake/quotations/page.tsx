'use client';

import { useDeferredValue, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, FileText, Search } from 'lucide-react';
import { getQuotationOverview } from '@/actions';
import { QUOTATION_STATUS_MAP } from '@/config';
import type { QuotationOverviewItem, QuotationStatus } from '@/types';
import { formatCurrency } from '@/utils';
import { Badge, toneOf } from '../_components/badge';
import { INPUT } from '../_components/form';
import { PageHeader } from '../_components/page-header';
import { Select } from '../_components/select';
import { EmptyState, ErrorState, ListSkeleton } from '../_components/state-views';
import { QuotationSheet } from './_components/quotation-sheet';

// Thứ tự theo vòng duyệt: việc cần admin làm đứng đầu.
const FILTERS = [
  ['pending_approval', 'Chờ duyệt'],
  ['approved', 'Đã duyệt, chưa gửi'],
  ['sent', 'Chờ khách'],
  ['accepted', 'Khách đồng ý'],
  ['rejected', 'Khách từ chối'],
  ['draft', 'Nháp'],
  ['', 'Tất cả'],
] as const;

// Duyệt báo giá (API /quotations/overview): lọc theo trạng thái, xem nhanh, duyệt hoặc trả lại.
export default function RemakeQuotationsPage() {
  const [status, setStatus] = useState('pending_approval');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState<QuotationOverviewItem | null>(null);
  const q = useDeferredValue(search.trim());
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['quotation-overview', status, q],
    queryFn: () => getQuotationOverview({ status: (status || undefined) as QuotationStatus | undefined, search: q || undefined, limit: 100 }),
    placeholderData: (prev) => prev,
  });
  const items = data?.items ?? [];
  const counts = data?.statusCounts ?? {};

  return (
    <>
      <PageHeader title="Duyệt báo giá" description="Báo giá phải được duyệt trước khi gửi khách." />

      <div className="sticky top-0 z-10 -mx-rm-gutter mb-3 flex gap-2 bg-rm-bg px-rm-gutter pb-2">
        <div className="relative min-w-0 flex-1">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rm-muted" aria-hidden="true" />
          <input
            type="search"
            aria-label="Tìm báo giá"
            placeholder="Mã, dự án, khách"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${INPUT} pl-10`}
          />
        </div>
        <div className="w-40 flex-none">
          <Select
            id="qt-filter"
            label="Trạng thái"
            value={status}
            onChange={setStatus}
            options={FILTERS.map(([value, label]) => ({
              value,
              label: counts[value as QuotationStatus] ? `${label} (${counts[value as QuotationStatus]})` : label,
            }))}
          />
        </div>
      </div>

      {isLoading && <ListSkeleton />}
      {isError && (
        <ErrorState title="Không tải được báo giá" description="Kiểm tra kết nối rồi thử lại." actionLabel="Thử lại" onAction={() => refetch()} />
      )}
      {data && items.length === 0 && (
        <EmptyState title={q ? 'Không tìm thấy' : 'Không có báo giá'} description={q ? 'Thử từ khoá khác.' : 'Chưa có báo giá ở trạng thái này.'} />
      )}
      {items.length > 0 && (
        <ul className="divide-y divide-rm-line rounded-rm-xl border border-rm-edge bg-rm-surface">
          {items.map((item) => {
            const s = QUOTATION_STATUS_MAP[item.status];
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setOpen(item)}
                  className="flex min-h-rm-row w-full items-center gap-3 px-rm-gutter py-2 text-left active:bg-rm-bg md:hover:bg-rm-bg"
                >
                  <span className="flex size-10 flex-none items-center justify-center rounded-rm bg-rm-primary-soft text-rm-primary">
                    <FileText size={18} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="min-w-0 truncate text-sm font-medium">
                        {item.code} (v{item.version})
                      </span>
                      <Badge tone={toneOf(s?.variant)}>{s?.label ?? item.status}</Badge>
                    </span>
                    <span className="block truncate text-xs text-rm-muted">
                      {item.projectName}
                      {item.customerName && ` · ${item.customerName}`}
                    </span>
                    <span className="block truncate text-xs text-rm-muted">
                      {formatCurrency(item.totalAmount)} · Lãi {item.effectiveMarginPercent.toFixed(1)}%
                    </span>
                  </span>
                  <ChevronRight size={18} className="flex-none text-rm-muted" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <QuotationSheet key={open?.id ?? 'none'} target={open} onClose={() => setOpen(null)} />
    </>
  );
}
