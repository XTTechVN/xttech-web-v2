'use client';

import { useMemo, useState } from 'react';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteCustomerProvider, getCustomerProviders } from '@/actions';
import { Skeleton } from '@/components';
import { Button, ConfirmDelete, SearchField } from '@/components-remake';
import { useCan, useDebounce } from '@/hooks';
import type { CustomerProvider } from '@/types';
import { showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import { ProviderDrawer } from './detail-drawer';
import ProviderFormDrawer from './form-drawer';
import { ProviderList } from './list';

const PAGE = 20;

export default function ProviderTable() {
  const { can } = useCan();

  // Giữ chữ đang gõ trong state cục bộ, trễ 300ms mới gọi API (tránh mất dấu tiếng Việt)
  const [search, setSearch] = useState('');
  const keyword = useDebounce(search.trim(), 300);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<CustomerProvider | null>(null);

  const list = useInfiniteQuery({
    queryKey: ['customer-providers', keyword],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => getCustomerProviders({ offset: pageParam, limit: PAGE, search: keyword || undefined }),
    getNextPageParam: (last) => (last?.meta?.next ? (last.meta.offset ?? 0) + (last.meta.limit ?? PAGE) : undefined),
  });
  const rows = useMemo(() => list.data?.pages.flatMap((p) => p?.items ?? []) ?? [], [list.data]);
  const total = list.data?.pages[0]?.meta?.total ?? rows.length;
  const selected = useMemo(() => rows.find((r) => r.id === selectedId) ?? null, [rows, selectedId]);

  const { mutate: remove, isPending } = useMutation({
    mutationFn: (id: number) => deleteCustomerProvider(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-providers'] });
      toast.success('Đã xóa nhà cung cấp');
      setDeleting(null);
      setSelectedId(null);
    },
    onError: (e) => showErrorToast(e, 'Không thể xóa nhà cung cấp'),
  });

  let body;
  if (list.isLoading) {
    body = (
      <div className="flex flex-col gap-2" aria-busy="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-block" />
        ))}
      </div>
    );
  } else if (list.isError) {
    body = (
      <div className="flex flex-col items-center gap-3 rounded-block border border-slate-200/80 bg-white py-12 text-center">
        <p className="text-sm text-slate-600">Không tải được danh sách nhà cung cấp.</p>
        <Button variant="outline" onClick={() => list.refetch()}>
          Thử lại
        </Button>
      </div>
    );
  } else if (rows.length === 0) {
    body = (
      <div className="flex flex-col items-center gap-3 rounded-block border border-slate-200/80 bg-white py-12 text-center">
        <p className="text-sm text-slate-600">{keyword ? 'Không có nhà cung cấp khớp từ khóa.' : 'Chưa có nhà cung cấp.'}</p>
        {!keyword && can('customer_provider:create') && (
          <Button icon={<Plus size={18} />} onClick={() => setAdding(true)}>
            Thêm nhà cung cấp
          </Button>
        )}
      </div>
    );
  } else {
    body = (
      <>
        <ProviderList rows={rows} onOpen={(r) => setSelectedId(r.id)} />
        {list.hasNextPage && (
          <div className="flex flex-col items-center gap-1 pt-1">
            <Button variant="outline" loading={list.isFetchingNextPage} onClick={() => list.fetchNextPage()}>
              {`Xem thêm (${total - rows.length})`}
            </Button>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <SearchField value={search} onChange={setSearch} label="Tìm nhà cung cấp" placeholder="Tìm theo mã, tên nhà cung cấp..." />
        {can('customer_provider:create') && (
          <Button className="ml-auto" icon={<Plus size={18} />} iconOnly="mobile" onClick={() => setAdding(true)}>
            Thêm nhà cung cấp
          </Button>
        )}
      </div>

      {body}

      <ProviderDrawer
        provider={selected}
        canEdit={can('customer_provider:update')}
        canDelete={can('customer_provider:delete')}
        onClose={() => setSelectedId(null)}
        onDelete={setDeleting}
      />
      <ProviderFormDrawer isOpen={adding} onClose={() => setAdding(false)} />
      <ConfirmDelete
        isOpen={!!deleting}
        title="Xác nhận xóa nhà cung cấp"
        pending={isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove(deleting.id)}
      >
        Xóa nhà cung cấp <strong className="font-semibold text-slate-900 [overflow-wrap:anywhere]">{deleting?.name}</strong> khỏi danh mục lựa chọn?
      </ConfirmDelete>
    </div>
  );
}
