'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ListFilter, Plus, Search } from 'lucide-react';
import { getBrands } from '@/actions';
import type { Brand } from '@/types';
import { Badge } from '../../_components/badge';
import { BTN_LINE, BTN_PRIMARY, INPUT } from '../../_components/form';
import { Sheet } from '../../_components/sheet';
import { cn } from '@/utils/cn';
import { DataList } from '../../_components/data-list';
import { EmptyState, ErrorState, ListSkeleton } from '../../_components/state-views';
import { BRAND_TYPES } from './brand-sheet';

// Danh sách hãng cung cấp (sắp theo thứ tự rồi tên).
export function BrandList({ onOpen, onAdd }: { onOpen: (b: Brand) => void; onAdd?: () => void }) {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['brands', 'list'], queryFn: () => getBrands({ limit: 200 }) });
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [filtering, setFiltering] = useState(false);
  const needle = q.trim().toLowerCase();
  const all = [...(data?.items ?? [])].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'vi'));
  const items = all.filter(
    (b) => (!type || b.brandType === type) && (!needle || `${b.name} ${b.code} ${b.originCountry ?? ''}`.toLowerCase().includes(needle)),
  );

  if (isLoading) return <ListSkeleton />;
  if (isError)
    return <ErrorState title="Không tải được hãng" description="Kiểm tra kết nối rồi thử lại." actionLabel="Thử lại" onAction={() => refetch()} />;
  const toolbar = (
    <div className="mb-3 flex items-center gap-2">
      <div className="relative min-w-0 flex-1">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rm-muted" aria-hidden="true" />
        <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Tìm hãng" placeholder="Tìm hãng" className={`${INPUT} pl-9`} />
      </div>
      <button
        type="button"
        onClick={() => setFiltering(true)}
        aria-label="Lọc theo loại hãng"
        className={cn(`${BTN_LINE} relative w-rm-tap px-0 md:w-auto md:px-4`, type && 'border-rm-primary text-rm-primary')}
      >
        <ListFilter size={18} aria-hidden="true" />
        <span className="hidden md:inline">{type ? (BRAND_TYPES.find((t) => t.value === type)?.label ?? 'Lọc') : 'Lọc'}</span>
      </button>
      {onAdd && (
        <button type="button" onClick={onAdd} aria-label="Thêm hãng" className={`${BTN_PRIMARY} w-rm-tap px-0 md:w-auto md:px-4`}>
          <Plus size={18} aria-hidden="true" />
          <span className="hidden md:inline">Thêm hãng</span>
        </button>
      )}
      <Sheet open={filtering} onClose={() => setFiltering(false)} title="Lọc hãng">
        <div role="group" aria-label="Loại hãng" className="flex flex-col p-rm-gutter">
          {[{ value: '', label: 'Tất cả hãng' }, ...BRAND_TYPES].map((t) => (
            <button
              key={t.value}
              type="button"
              aria-pressed={type === t.value}
              onClick={() => {
                setType(t.value);
                setFiltering(false);
              }}
              className={cn(
                'flex min-h-rm-tap items-center justify-between rounded-rm px-3 text-left text-sm active:bg-rm-bg',
                type === t.value && 'bg-rm-primary-soft font-medium text-rm-primary',
              )}
            >
              {t.label}
              <span className="text-xs text-rm-muted">{all.filter((b) => !t.value || b.brandType === t.value).length}</span>
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  );
  if (all.length === 0) return <EmptyState title="Chưa có hãng" description="Thêm hãng cung cấp đầu tiên." />;
  return (
    <>
      {toolbar}
      {items.length === 0 ? (
        <EmptyState title="Không có kết quả" description="Thử từ khoá hoặc bộ lọc khác." />
      ) : (
        <DataList
          label="Danh sách hãng cung cấp"
          rows={items}
          rowKey={(b) => b.id}
          onOpen={onOpen}
          columns={[
            { key: 'name', header: 'Hãng', cell: (b) => <span className="font-medium">{b.name}</span> },
            { key: 'code', header: 'Mã', fit: true, cell: (b) => b.code },
            { key: 'type', header: 'Loại', fit: true, cell: typeBadge },
            { key: 'country', header: 'Xuất xứ', fit: true, wideOnly: true, cell: (b) => b.originCountry ?? '–' },
            { key: 'active', header: 'Trạng thái', fit: true, cell: (b) => (b.isActive ? 'Đang dùng' : <Badge>Ngừng</Badge>) },
          ]}
          card={(b) => (
            <>
              <span className="block truncate text-sm font-medium">{b.name}</span>
              <span className="flex items-center gap-2">
                {typeBadge(b)}
                {!b.isActive && <Badge>Ngừng</Badge>}
              </span>
              <span className="block truncate text-xs text-rm-muted">
                {b.code}
                {b.originCountry && ` · ${b.originCountry}`}
              </span>
            </>
          )}
        />
      )}
    </>
  );
}

const typeBadge = (b: Brand) => <Badge tone="primary">{BRAND_TYPES.find((t) => t.value === b.brandType)?.label ?? b.brandType}</Badge>;
