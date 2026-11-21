'use client';

import { useDeferredValue, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Search } from 'lucide-react';
import { exportCustomersExcel, getCustomers } from '@/actions';
import { CUSTOMER_TYPE_OPTIONS, getCustomerTypeLabel } from '@/config';
import { useCan } from '@/hooks';
import type { Customer } from '@/types';
import type { Tone } from '../_components/badge';
import { Badge } from '../_components/badge';
import { DataList } from '../_components/data-list';
import { INPUT } from '../_components/form';
import { Select } from '../_components/select';
import { PageHeader } from '../_components/page-header';
import { EmptyState, ErrorState, ListSkeleton } from '../_components/state-views';
import { CustomerSheet } from './_components/customer-sheet';

const PAGE = 20;
const TYPE_TONE: Record<string, Tone> = { potential: 'primary', active: 'success', inactive: 'neutral', vip: 'warning' };
const initials = (n: string) =>
  n
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
const Avatar = ({ name }: { name: string }) => (
  <span className="flex size-10 flex-none items-center justify-center rounded-rm bg-rm-primary-soft text-xs font-semibold text-rm-primary">
    {initials(name) || '–'}
  </span>
);

// Khách hàng (API /customers): tìm kiếm, lọc theo phân loại, thêm / sửa / xoá.
export default function RemakeCustomersPage() {
  const { can, isReady } = useCan();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const [open, setOpen] = useState<Customer | 'new' | null>(null);
  const q = useDeferredValue(search.trim());
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['customers', q, type, limit],
    queryFn: () => getCustomers({ limit, offset: 0, search: q || undefined, type: type || undefined }),
    placeholderData: (prev) => prev,
    enabled: can('customer:read'),
  });
  const items = data?.items ?? [];
  const filtered = !!q || !!type;

  if (!isReady) return <ListSkeleton />;
  if (!can('customer:read')) return <EmptyState title="Bạn chưa có quyền xem khách hàng" description="Liên hệ quản trị viên để được cấp quyền." />;

  return (
    <>
      <PageHeader
        title="Khách hàng"
        description="Danh sách khách hàng và người phụ trách."
        actionLabel={can('customer:create') ? 'Thêm khách hàng' : undefined}
        onAction={() => setOpen('new')}
      />

      <div className="sticky top-0 z-10 -mx-rm-gutter mb-3 flex gap-2 bg-rm-bg px-rm-gutter pb-2">
        <div className="relative min-w-0 flex-1">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rm-muted" aria-hidden="true" />
          <input
            type="search"
            aria-label="Tìm khách hàng"
            placeholder="Tên, SĐT hoặc email"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setLimit(PAGE);
            }}
            className={`${INPUT} pl-10`}
          />
        </div>
        <button
          type="button"
          aria-label="Xuất Excel"
          onClick={() => exportCustomersExcel({})}
          className="flex h-rm-tap min-w-rm-tap flex-none items-center justify-center rounded-rm border border-rm-line bg-rm-surface md:h-rm-control"
        >
          <Download size={18} aria-hidden="true" />
        </button>
        <div className="w-36 flex-none">
          <Select
            id="cu-filter"
            label="Phân loại"
            value={type}
            onChange={(v) => {
              setType(v);
              setLimit(PAGE);
            }}
            options={[{ value: '', label: 'Tất cả' }, ...CUSTOMER_TYPE_OPTIONS]}
          />
        </div>
      </div>

      {isLoading && <ListSkeleton />}
      {isError && (
        <ErrorState title="Không tải được khách hàng" description="Kiểm tra kết nối rồi thử lại." actionLabel="Thử lại" onAction={() => refetch()} />
      )}
      {data && items.length === 0 && (
        <EmptyState
          title={filtered ? 'Không tìm thấy' : 'Chưa có khách hàng'}
          description={filtered ? 'Thử từ khoá hoặc phân loại khác.' : 'Thêm khách hàng đầu tiên.'}
        />
      )}
      {items.length > 0 && (
        <DataList
          label="Danh sách khách hàng"
          rows={items}
          rowKey={(c) => c.id}
          href={(c) => `/remake/customers/${c.id}`}
          columns={[
            {
              key: 'name',
              header: 'Khách hàng',

              cell: (c) => (
                <span className="flex items-center gap-3">
                  <Avatar name={c.name} />
                  <span className="min-w-0 truncate font-medium">{c.name}</span>
                </span>
              ),
            },
            { key: 'type', header: 'Phân loại', fit: true, cell: (c) => <Badge tone={TYPE_TONE[c.type]}>{getCustomerTypeLabel(c.type)}</Badge> },
            { key: 'phone', header: 'Điện thoại', fit: true, cell: (c) => c.phone || '–' },
            { key: 'email', header: 'Email', wideOnly: true, cell: (c) => c.email || '–' },
            { key: 'staff', header: 'Phụ trách', fit: true, cell: (c) => c.staff?.fullName || '–' },
          ]}
          card={(c) => (
            <span className="flex items-center gap-3">
              <Avatar name={c.name} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{c.name}</span>
                <span className="mt-1 flex items-center gap-2">
                  <Badge tone={TYPE_TONE[c.type]}>{getCustomerTypeLabel(c.type)}</Badge>
                  <span className="min-w-0 truncate text-xs text-rm-muted">{c.phone || 'Chưa có số điện thoại'}</span>
                </span>
                {c.staff?.fullName && <span className="mt-1 block truncate text-xs text-rm-muted">Phụ trách: {c.staff.fullName}</span>}
              </span>
            </span>
          )}
        />
      )}
      {data?.meta.next && (
        <button
          type="button"
          disabled={isFetching}
          onClick={() => setLimit((l) => l + PAGE)}
          className="mt-3 h-rm-tap w-full rounded-rm border border-rm-line bg-rm-surface text-sm font-medium active:bg-rm-bg md:h-rm-control"
        >
          {isFetching ? 'Đang tải…' : `Xem thêm (${items.length}/${data.meta.total})`}
        </button>
      )}

      <CustomerSheet key={open === 'new' ? 'new' : (open?.id ?? 'none')} target={open} onClose={() => setOpen(null)} />
    </>
  );
}
