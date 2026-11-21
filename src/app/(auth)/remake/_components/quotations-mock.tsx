'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { useCan } from '@/hooks/use-can';
import { cn } from '@/utils/cn';
import { formatVnd, MOCK_QUOTATIONS, type MockQuotation } from '../_mock/mock-quotations';
import { PageHeader } from './page-header';
import { QuotationRow } from './quotation-row';
import { QuotationSheet } from './quotation-sheet';
import { EmptyState, ErrorState, ListSkeleton } from './state-views';

type View = 'data' | 'loading' | 'empty' | 'error';

const TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'pending', label: 'Chờ duyệt' },
  { id: 'approved', label: 'Đã duyệt' },
] as const;

const VIEWS: { id: View; label: string }[] = [
  { id: 'data', label: 'Có dữ liệu' },
  { id: 'loading', label: 'Đang tải' },
  { id: 'empty', label: 'Trống' },
  { id: 'error', label: 'Lỗi' },
];

export function QuotationsMock() {
  const { can } = useCan();
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('all');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<View>('data');
  const [selected, setSelected] = useState<MockQuotation | null>(null);

  const q = search.trim().toLowerCase();
  const rows = MOCK_QUOTATIONS.filter(
    (r) => (tab === 'all' || r.status === tab) && (!q || r.customer.toLowerCase().includes(q) || r.code.toLowerCase().includes(q)),
  );
  const total = MOCK_QUOTATIONS.filter((r) => r.status === 'approved').reduce((sum, r) => sum + r.total, 0);

  return (
    <>
      <PageHeader
        title="Báo giá"
        description="Trang mẫu: dữ liệu giả để xem khung và thành phần."
        actionLabel={can('quotation:create') ? 'Thêm' : undefined}
      />

      <dl className="mb-4 grid grid-cols-[repeat(2,minmax(0,1fr))] divide-x divide-rm-line rounded-rm-xl border border-rm-edge bg-rm-surface">
        <div className="min-w-0 p-3">
          <dt className="truncate text-xs text-rm-muted">Đã duyệt tháng này</dt>
          <dd className="truncate font-heading text-lg font-semibold text-rm-text">{formatVnd(total)}</dd>
        </div>
        <div className="min-w-0 p-3">
          <dt className="truncate text-xs text-rm-muted">Chờ duyệt</dt>
          <dd className="truncate font-heading text-lg font-semibold text-rm-text">{MOCK_QUOTATIONS.filter((r) => r.status === 'pending').length}</dd>
        </div>
      </dl>

      <div role="tablist" aria-label="Lọc báo giá" className="mb-3 flex gap-1 overflow-x-auto border-b border-rm-line">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'relative min-h-rm-tap flex-none px-3 text-sm transition-colors duration-(--rm-dur-fast) after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:origin-left after:rounded-full after:bg-rm-primary after:transition-transform after:duration-(--rm-dur) after:ease-rm',
              tab === t.id ? 'font-medium text-rm-primary after:scale-x-100' : 'text-rm-muted after:scale-x-0',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="sticky top-14 z-10 mb-3 bg-rm-bg py-1 md:top-0">
        <label className="relative block">
          <span className="sr-only">Tìm theo tên khách hoặc mã báo giá</span>
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rm-muted" />
          <input
            type="search"
            inputMode="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm khách hàng, mã báo giá"
            className="h-12 w-full rounded-rm border border-rm-line bg-rm-surface pl-10 pr-3 text-base text-rm-text outline-none placeholder:text-rm-muted focus-visible:border-rm-primary md:h-rm-control md:text-sm"
          />
        </label>
      </div>

      <section aria-label="Danh sách báo giá" className="overflow-hidden rounded-rm-xl border border-rm-edge bg-rm-surface">
        {view === 'loading' && <ListSkeleton />}
        {view === 'error' && (
          <ErrorState
            title="Không tải được dữ liệu"
            description="Kiểm tra mạng rồi thử lại."
            actionLabel="Thử lại"
            onAction={() => setView('data')}
          />
        )}
        {view === 'empty' && <EmptyState title="Chưa có báo giá" description="Báo giá tạo ra sẽ hiện ở đây." actionLabel="Thêm báo giá" />}
        {view === 'data' &&
          (rows.length === 0 ? (
            <EmptyState
              title="Không có kết quả"
              description="Thử đổi từ khoá hoặc bộ lọc."
              actionLabel="Xoá bộ lọc"
              onAction={() => {
                setSearch('');
                setTab('all');
              }}
            />
          ) : (
            <ul className="divide-y divide-rm-line">
              {rows.map((r, i) => (
                <QuotationRow key={r.id} item={r} index={i} onOpen={() => setSelected(r)} />
              ))}
            </ul>
          ))}
      </section>

      <div className="mt-6" role="group" aria-label="Xem thử trạng thái (chỉ có ở trang mẫu)">
        <p className="mb-2 text-xs text-rm-muted">Xem thử trạng thái (chỉ có ở trang mẫu)</p>
        <div className="flex gap-2 overflow-x-auto">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              aria-pressed={view === v.id}
              onClick={() => setView(v.id)}
              className={cn(
                'min-h-rm-tap flex-none rounded-rm border px-3 text-sm transition-[background-color,transform] duration-(--rm-dur-fast) active:scale-95',
                view === v.id ? 'border-rm-primary bg-rm-primary-soft font-medium text-rm-primary' : 'border-rm-line bg-rm-surface text-rm-muted',
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <QuotationSheet item={selected} onClose={() => setSelected(null)} />
    </>
  );
}
