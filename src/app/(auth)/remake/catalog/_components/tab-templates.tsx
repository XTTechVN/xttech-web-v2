'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Copy, ImageOff, Layers, PenTool, Search, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { deleteDoor, getBrands, getDoors } from '@/actions';
import { DoorStudioModal, DoorThumbnail } from '@/components';
import { useCan } from '@/hooks';
import { BASE_MINIO_URL } from '@/config';
import { DOOR_TYPE_LABELS, type Door } from '@/types';
import { BTN_PRIMARY, INPUT, messageOf } from '../../_components/form';
import { Select } from '../../_components/select';
import { DoorBom } from './door-bom';
import { EmptyState, ErrorState, ListSkeleton } from '../../_components/state-views';

const imageOf = (d: Door) => {
  const path = d.images?.find((i) => i.isPrimary)?.imagePath ?? d.imagePath;
  if (!path) return null;
  return path.startsWith('http') ? path : `${BASE_MINIO_URL}/${path.replace(/^\//, '')}`;
};

// Mẫu cửa: lưới bản vẽ (vẽ lại từ cấu hình như trong trình vẽ) theo hãng; mở trình vẽ, xem BOM, nhân bản, xoá theo quyền danh mục.
export function TabTemplates() {
  const { can } = useCan();
  const qc = useQueryClient();
  const [studio, setStudio] = useState<{ door: Door | null } | null>(null);
  const [bom, setBom] = useState<Door | null>(null);
  const del = useMutation({
    mutationFn: (d: Door) => deleteDoor(d.id),
    onSuccess: () => {
      toast.success('Đã xoá mẫu cửa');
      qc.invalidateQueries({ queryKey: ['doors'] });
    },
    onError: (e) => toast.error(messageOf(e)),
  });
  const copy = (d: Door) =>
    setStudio({
      door: {
        ...d,
        id: 0,
        name: `${d.name}_COPY`,
        code: `${d.code || d.name}_COPY`,
        systemConfig: d.systemConfig ? (structuredClone(d.systemConfig) as Record<string, unknown>) : undefined,
      },
    });
  const ICON = 'flex size-11 flex-none items-center justify-center text-rm-muted active:bg-rm-bg md:size-9';
  const [q, setQ] = useState('');
  const [brandId, setBrandId] = useState<number | null>(null);
  const { data: brands } = useQuery({ queryKey: ['brands', 'all'], queryFn: () => getBrands({ limit: 200 }) });
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['doors', 'templates', brandId],
    queryFn: () => getDoors({ limit: 200, brandId: brandId ?? undefined }),
  });
  const needle = q.trim().toLowerCase();
  const items = (data?.items ?? []).filter((d) => !needle || `${d.name} ${d.code ?? ''}`.toLowerCase().includes(needle));

  return (
    <>
      <div className="mb-3 flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rm-muted" aria-hidden="true" />
          <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Tìm mẫu cửa" placeholder="Tìm mẫu cửa" className={`${INPUT} pl-9`} />
        </div>
        <div className="w-40 flex-none md:w-56">
          <Select
            id="tpl-brand"
            label="Hãng"
            value={brandId ? String(brandId) : ''}
            onChange={(v) => setBrandId(v ? Number(v) : null)}
            options={[{ value: '', label: 'Tất cả hãng' }, ...(brands?.items ?? []).map((b) => ({ value: String(b.id), label: b.name }))]}
          />
        </div>
        {can('catalog:create') && (
          <button
            type="button"
            onClick={() => setStudio({ door: null })}
            aria-label="Vẽ mẫu cửa mới"
            className={`${BTN_PRIMARY} w-rm-tap flex-none px-0 md:w-auto md:px-4`}
          >
            <PenTool size={18} aria-hidden="true" />
            <span className="hidden md:inline">Vẽ mẫu mới</span>
          </button>
        )}
      </div>
      {items.length > 0 && <p className="mb-2 text-sm text-rm-muted">{items.length} mẫu cửa</p>}
      {isLoading && <ListSkeleton />}
      {isError && (
        <ErrorState title="Không tải được mẫu cửa" description="Kiểm tra kết nối rồi thử lại." actionLabel="Thử lại" onAction={() => refetch()} />
      )}
      {!isLoading && !isError && items.length === 0 && (
        <EmptyState
          title={needle ? 'Không có kết quả' : 'Chưa có mẫu cửa'}
          description={needle ? 'Thử từ khoá khác.' : 'Bấm "Vẽ mẫu mới" để tạo mẫu đầu tiên.'}
        />
      )}
      <ul className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3 md:grid-cols-[repeat(4,minmax(0,1fr))]">
        {items.map((d) => {
          const src = imageOf(d);
          return (
            <li key={d.id} className="min-w-0 overflow-hidden rounded-rm-xl border border-rm-edge bg-rm-surface">
              <div className="flex aspect-square items-center justify-center bg-rm-bg text-rm-muted">
                {(d.systemConfig as Record<string, unknown> | undefined)?.rootCell ? (
                  <div className="size-full p-2">
                    <DoorThumbnail door={d} />
                  </div>
                ) : src ? (
                  <Image src={src} alt={d.name} width={240} height={240} unoptimized className="size-full object-contain" />
                ) : (
                  <ImageOff size={28} aria-hidden="true" />
                )}
              </div>
              <div className="p-2">
                <p className="truncate text-sm font-medium">{d.name}</p>
                <p className="truncate text-xs text-rm-muted">{d.type ? (DOOR_TYPE_LABELS[d.type] ?? d.type) : '–'}</p>
              </div>
              <div className="flex border-t border-rm-line">
                {can('catalog:update') && (
                  <button type="button" aria-label={`Mở trình vẽ ${d.name}`} className={ICON} onClick={() => setStudio({ door: d })}>
                    <PenTool size={16} />
                  </button>
                )}
                <button type="button" aria-label={`Xem BOM ${d.name}`} className={ICON} onClick={() => setBom(d)}>
                  <Layers size={16} />
                </button>
                {can('catalog:create') && (
                  <button type="button" aria-label={`Nhân bản ${d.name}`} className={ICON} onClick={() => copy(d)}>
                    <Copy size={16} />
                  </button>
                )}
                {can('catalog:delete') && (
                  <button
                    type="button"
                    aria-label={`Xoá ${d.name}`}
                    disabled={del.isPending}
                    className={`${ICON} ml-auto text-rm-danger`}
                    onClick={() => window.confirm(`Xoá mẫu cửa "${d.name}"? Không thể hoàn tác.`) && del.mutate(d)}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {studio && (
        <DoorStudioModal
          key={`${studio.door?.id ?? 'new'}-${studio.door?.code ?? ''}`}
          isOpen
          door={studio.door}
          defaultBrandId={brandId}
          onClose={() => setStudio(null)}
          onSaveSuccess={() => qc.invalidateQueries({ queryKey: ['doors'] })}
        />
      )}
      <DoorBom door={bom} onClose={() => setBom(null)} />
    </>
  );
}
