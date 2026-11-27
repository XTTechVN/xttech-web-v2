'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { deleteBrandColor, getBrandColors } from '@/actions';
import { ConfirmDelete, SearchField, SectionAdd, TabState, Tag } from '@/components-remake';
import { useCan } from '@/hooks';
import type { Brand, BrandColor } from '@/types';
import { formatCurrency, showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import ColorFormDrawer from './color-form-drawer';
import { surfaceLabel } from './format';

// Hệ màu và đơn giá sơn theo kg của một hãng nhôm
export function BrandColors({ brand }: { brand: Brand }) {
  const { can } = useCan();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<BrandColor | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<BrandColor | null>(null);

  const query = useQuery({
    queryKey: ['brand-colors', brand.id],
    queryFn: () => getBrandColors({ brandId: brand.id, limit: 1000, offset: 0 }),
  });
  const colors = useMemo(() => query.data?.items ?? [], [query.data]);
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return colors.filter((c) => !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
  }, [colors, search]);

  const remove = useMutation({
    mutationFn: (id: number) => deleteBrandColor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-colors'] });
      toast.success('Đã xóa màu');
      setDeleting(null);
      setEditing(null);
    },
    onError: (e) => showErrorToast(e, 'Không thể xóa màu'),
  });

  const canUpdate = can('catalog:update') && !brand.isSystem;
  const canDelete = can('catalog:delete') && !brand.isSystem;

  return (
    <div className="flex flex-col gap-3 pt-2">
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <SearchField label="Tìm màu" placeholder="Tìm mã hoặc tên màu" value={search} onChange={setSearch} />
        </div>
        {can('catalog:create') && !brand.isSystem && <SectionAdd label="Thêm màu" onClick={() => setAdding(true)} />}
      </div>

      <TabState
        loading={query.isLoading}
        error={query.isError}
        onRetry={() => query.refetch()}
        empty={rows.length === 0}
        emptyText={colors.length ? 'Không có màu phù hợp.' : 'Hãng này chưa có hệ màu nào.'}
      >
        <ul className="divide-y divide-slate-100 rounded-block border border-slate-200/80">
          {rows.map((c) => {
            const body = (
              <span className="flex items-center gap-3">
                <span
                  style={{ backgroundColor: c.colorHex || '#cccccc' }}
                  aria-hidden="true"
                  className="size-9 flex-none rounded-control border border-slate-300"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-900">{c.name}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Tag tone="blue">{c.code}</Tag>
                    <Tag tone="violet">{surfaceLabel(c.surfaceType)}</Tag>
                    {c.isDefault && <Tag tone="green">Mặc định</Tag>}
                    {c.isActive === false && <Tag>Tạm ngưng</Tag>}
                  </span>
                </span>
                <span className="flex-none text-right text-xs tabular-nums text-slate-600">
                  {formatCurrency(c.pricePerKg || 0)}
                  <span className="block text-slate-500">× {c.priceMultiplier ?? 1}</span>
                </span>
              </span>
            );
            return (
              <li key={c.id}>
                {canUpdate ? (
                  <button type="button" onClick={() => setEditing(c)} className="block w-full cursor-pointer px-3 py-3 text-left active:bg-slate-50">
                    {body}
                  </button>
                ) : (
                  <div className="px-3 py-3">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      </TabState>

      <ColorFormDrawer
        brandId={brand.id}
        isOpen={adding || !!editing}
        color={editing}
        onClose={() => {
          setAdding(false);
          setEditing(null);
        }}
        onDelete={
          canDelete
            ? (c) => {
                // Hộp xác nhận nằm dưới drawer con, nên đóng drawer con trước
                setEditing(null);
                setDeleting(c);
              }
            : undefined
        }
      />
      <ConfirmDelete
        isOpen={!!deleting}
        title="Xóa màu"
        pending={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
      >
        Bạn muốn xóa màu <strong>{deleting?.name}</strong>?
      </ConfirmDelete>
    </div>
  );
}
