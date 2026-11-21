'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { getDoorSeriesList } from '@/actions';
import type { DoorSeries } from '@/types';
import { Badge } from '../../_components/badge';
import { BTN_PRIMARY, INPUT } from '../../_components/form';
import { DataList } from '../../_components/data-list';
import { EmptyState, ErrorState, ListSkeleton } from '../../_components/state-views';

// Danh sách hệ nhôm, mỗi dòng kèm tên hãng.
export function SeriesList({ onOpen, onAdd }: { onOpen: (s: DoorSeries) => void; onAdd?: () => void }) {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['door-series', 'list'], queryFn: () => getDoorSeriesList({ limit: 200 }) });
  const [q, setQ] = useState('');
  const needle = q.trim().toLowerCase();
  const all = data?.items ?? [];
  const items = all.filter((s) => !needle || `${s.name} ${s.code} ${s.brand?.name ?? ''}`.toLowerCase().includes(needle));

  if (isLoading) return <ListSkeleton />;
  if (isError)
    return <ErrorState title="Không tải được hệ nhôm" description="Kiểm tra kết nối rồi thử lại." actionLabel="Thử lại" onAction={() => refetch()} />;
  if (all.length === 0) return <EmptyState title="Chưa có hệ nhôm" description="Thêm hệ nhôm đầu tiên." />;
  return (
    <>
      <div className="mb-3 flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rm-muted" aria-hidden="true" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Tìm hệ nhôm"
            placeholder="Tìm hệ nhôm hoặc hãng"
            className={`${INPUT} pl-9`}
          />
        </div>
        {onAdd && (
          <button type="button" onClick={onAdd} aria-label="Thêm hệ nhôm" className={`${BTN_PRIMARY} w-rm-tap px-0 md:w-auto md:px-4`}>
            <Plus size={18} aria-hidden="true" />
            <span className="hidden md:inline">Thêm hệ nhôm</span>
          </button>
        )}
      </div>
      {items.length === 0 ? (
        <EmptyState title="Không có kết quả" description="Thử từ khoá khác." />
      ) : (
        <DataList
          label="Danh sách hệ nhôm"
          rows={items}
          rowKey={(s) => s.id}
          onOpen={onOpen}
          columns={[
            { key: 'name', header: 'Hệ nhôm', cell: (s) => <span className="font-medium">{s.name}</span> },
            { key: 'code', header: 'Mã', fit: true, cell: (s) => s.code },
            { key: 'brand', header: 'Hãng', fit: true, cell: (s) => s.brand?.name ?? '–' },
            {
              key: 'thick',
              header: 'Độ dày',
              fit: true,
              align: 'right',
              wideOnly: true,
              cell: (s) => (s.aluminumThickness != null ? `${s.aluminumThickness} mm` : '–'),
            },
            { key: 'active', header: 'Trạng thái', fit: true, cell: (s) => (s.isActive ? 'Đang dùng' : <Badge>Ngừng</Badge>) },
          ]}
          card={(s) => (
            <>
              <span className="flex items-center gap-2">
                <span className="min-w-0 truncate text-sm font-medium">{s.name}</span>
                {!s.isActive && <Badge>Ngừng</Badge>}
              </span>
              <span className="block truncate text-xs text-rm-muted">
                {s.code}
                {s.brand?.name && ` · ${s.brand.name}`}
                {s.aluminumThickness != null && ` · dày ${s.aluminumThickness} mm`}
              </span>
            </>
          )}
        />
      )}
    </>
  );
}
