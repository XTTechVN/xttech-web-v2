'use client';

import { useDeferredValue, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { getCustomerProviders } from '@/actions';
import { useCan } from '@/hooks';
import type { CustomerProvider } from '@/types';
import { DataList } from '../_components/data-list';
import { INPUT } from '../_components/form';
import { PageHeader } from '../_components/page-header';
import { EmptyState, ErrorState, ListSkeleton } from '../_components/state-views';
import { SupplierSheet } from './_components/supplier-sheet';
import { SupplierCard, supplierColumns } from './_components/supplier-columns';

// Nhà cung cấp khách hàng (API /customer-providers): tìm kiếm, thêm / sửa / xoá.
export default function RemakeSuppliersPage() {
  const { can, isReady } = useCan();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState<CustomerProvider | 'new' | null>(null);
  const q = useDeferredValue(search.trim());
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['customer-providers', q],
    queryFn: () => getCustomerProviders({ limit: 100, search: q || undefined }),
    placeholderData: (prev) => prev,
    enabled: can('customer_provider:read'),
  });
  const items = data?.items ?? [];

  if (!isReady) return <ListSkeleton />;
  if (!can('customer_provider:read'))
    return <EmptyState title="Bạn chưa có quyền xem nhà cung cấp" description="Liên hệ quản trị viên để được cấp quyền." />;

  return (
    <>
      <PageHeader
        title="Nhà cung cấp"
        description="Nguồn cung cấp khách hàng."
        actionLabel={can('customer_provider:create') ? 'Thêm nhà cung cấp' : undefined}
        onAction={() => setOpen('new')}
      />

      <div className="sticky top-0 z-10 -mx-rm-gutter mb-3 bg-rm-bg px-rm-gutter pb-2">
        <div className="relative">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rm-muted" aria-hidden="true" />
          <input
            type="search"
            aria-label="Tìm nhà cung cấp"
            placeholder="Tìm theo tên hoặc mã"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${INPUT} pl-10`}
          />
        </div>
      </div>

      {isLoading && <ListSkeleton />}
      {isError && (
        <ErrorState
          title="Không tải được nhà cung cấp"
          description="Kiểm tra kết nối rồi thử lại."
          actionLabel="Thử lại"
          onAction={() => refetch()}
        />
      )}
      {data && items.length === 0 && (
        <EmptyState title={q ? 'Không tìm thấy' : 'Chưa có nhà cung cấp'} description={q ? 'Thử từ khoá khác.' : 'Thêm nhà cung cấp đầu tiên.'} />
      )}
      {items.length > 0 && (
        <DataList
          label="Danh sách nhà cung cấp"
          rows={items}
          rowKey={(p) => p.id}
          columns={supplierColumns}
          card={(p) => <SupplierCard p={p} />}
          onOpen={setOpen}
        />
      )}

      <SupplierSheet key={open === 'new' ? 'new' : (open?.id ?? 'none')} target={open} onClose={() => setOpen(null)} />
    </>
  );
}
