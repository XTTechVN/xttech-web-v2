'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { getBrandColors, getBrands, getDoorSeriesList, updateProject } from '@/actions';
import { useCan } from '@/hooks';
import type { ProjectDetail, ProjectUpdate } from '@/types';
import { messageOf } from '../../../_components/form';
import { Select } from '../../../_components/select';

const SURFACE: Record<string, string> = { powder_coat: 'Sơn tĩnh điện', anodize: 'Anodize', wood_grain: 'Vân gỗ', pvdf: 'Sơn PVDF' };

// Tiêu chuẩn vật tư của dự án (hãng - hệ - màu nhôm): người có quyền sửa đổi được ngay, lưu tức thì.
export function OverviewMaterial({ project: p }: { project: ProjectDetail }) {
  const { can } = useCan();
  const qc = useQueryClient();
  const editable = can('project:update');
  const brandId = p.defaultBrandId ?? p.defaultBrand?.id ?? null;
  const brands = useQuery({ queryKey: ['brands', 'aluminum'], queryFn: () => getBrands({ limit: 100, brandType: 'aluminum' }), enabled: editable });
  const series = useQuery({
    queryKey: ['door-series', brandId],
    queryFn: () => getDoorSeriesList({ limit: 100, brandId: brandId! }),
    enabled: editable && !!brandId,
  });
  const colors = useQuery({
    queryKey: ['brand-colors', brandId],
    queryFn: () => getBrandColors({ limit: 100, brandId: brandId! }),
    enabled: editable && !!brandId,
  });
  const save = useMutation({
    mutationFn: (body: ProjectUpdate) => updateProject(p.id, body),
    onSuccess: () => {
      toast.success('Đã cập nhật tiêu chuẩn vật tư');
      qc.invalidateQueries({ queryKey: ['project', p.id] });
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (e) => toast.error(messageOf(e)),
  });
  const opt = (items?: { id: number; name?: string | null }[], extra?: (x: never) => string) => [
    { value: '', label: 'Chưa chọn' },
    ...(items ?? []).map((x) => ({ value: String(x.id), label: `${x.name ?? ''}${extra?.(x as never) ?? ''}` })),
  ];
  const rows = [
    ['Hãng nhôm', p.defaultBrand?.name],
    ['Hệ nhôm', p.defaultSeries?.name],
    [
      'Màu nhôm',
      p.defaultColor
        ? `${p.defaultColor.name}${p.defaultColor.surfaceType ? ` (${SURFACE[p.defaultColor.surfaceType] ?? p.defaultColor.surfaceType})` : ''}`
        : null,
    ],
  ] as const;

  return (
    <section className="mb-4">
      <h2 className="mb-2 text-sm font-semibold">Tiêu chuẩn vật tư</h2>
      <div className="rounded-rm-xl border border-rm-edge bg-rm-surface p-rm-gutter text-sm">
        {editable ? (
          <div className="grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-[repeat(3,minmax(0,1fr))]">
            <Select
              id="ov-brand"
              label="Hãng nhôm"
              value={brandId ? String(brandId) : ''}
              onChange={(v) => save.mutate({ defaultBrandId: v ? Number(v) : null, defaultSeriesId: null, defaultColorId: null })}
              options={opt(brands.data?.items)}
              disabled={save.isPending}
            />
            {brandId && (
              <>
                <Select
                  id="ov-series"
                  label="Hệ nhôm"
                  value={p.defaultSeriesId ? String(p.defaultSeriesId) : ''}
                  onChange={(v) => save.mutate({ defaultSeriesId: v ? Number(v) : null })}
                  options={opt(series.data?.items)}
                  disabled={save.isPending}
                />
                <Select
                  id="ov-color"
                  label="Màu nhôm"
                  value={p.defaultColorId ? String(p.defaultColorId) : ''}
                  onChange={(v) => save.mutate({ defaultColorId: v ? Number(v) : null })}
                  options={opt(colors.data?.items)}
                  disabled={save.isPending}
                />
              </>
            )}
          </div>
        ) : (
          <dl className="divide-y divide-rm-line">
            {rows.map(([k, v]) => (
              <div key={k} className="flex gap-3 py-1.5">
                <dt className="w-28 flex-none text-rm-muted">{k}</dt>
                <dd className="min-w-0 flex-1">{v || '–'}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
