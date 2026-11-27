'use client';

import { DataTable, Tag, type Column } from '@/components-remake';
import type { ProfileBar } from '@/types';
import { BAR_TYPE_MAP } from './profile-bar-config';
import { SystemTag } from '../../_components/shared-catalog';

export const barTypeLabel = (b: ProfileBar) => BAR_TYPE_MAP[b.barType?.toUpperCase()] || b.barType || '–';
export const mm = (v?: number | null) => (v && v > 0 ? String(v) : '–');
export const weight = (b: ProfileBar) => `${Number(b.weightPerM || 0).toFixed(3)} kg/m`;

export function SectionThumb({ bar }: { bar: ProfileBar }) {
  const s = bar.sectionLibrary;
  return (
    <span className="flex size-10 flex-none items-center justify-center rounded-control border border-slate-200 bg-slate-50 p-1.5" aria-hidden>
      {s && (
        <svg viewBox={s.viewBox || '0 0 100 100'} className="size-full fill-none stroke-slate-700" strokeWidth="1.5">
          <path d={s.svgPathData} />
        </svg>
      )}
    </span>
  );
}

function Flags({ bar }: { bar: ProfileBar }) {
  if (!bar.isFullCompanion && !bar.isVirtual) return null;
  return (
    <>
      {bar.isFullCompanion && <Tag tone="amber">Combine toàn phần</Tag>}
      {bar.isVirtual && <Tag tone="teal">Ảo</Tag>}
    </>
  );
}

const num = 'w-24 whitespace-nowrap text-right tabular-nums';

const COLUMNS: Column<ProfileBar>[] = [
  {
    key: 'bar',
    header: 'Thanh profile',
    className: 'max-w-0',
    render: (b) => (
      <div className="flex items-center gap-3">
        <SectionThumb bar={b} />
        <div className="min-w-0">
          <span className="block truncate text-sm font-semibold text-slate-900" title={b.name}>
            {b.name}
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-1.5">
            <Tag tone="blue">{b.code || '–'}</Tag>
            {b.isSystem && <SystemTag />}
            <Flags bar={b} />
          </span>
        </div>
      </div>
    ),
  },
  { key: 'type', header: 'Phân loại', className: 'w-44', render: (b) => <Tag tone="violet">{barTypeLabel(b)}</Tag> },
  { key: 'height', header: 'Cao (mm)', className: num, render: (b) => mm(b.sectionHeightMm) },
  { key: 'weight', header: 'Tỷ trọng', className: 'w-32 whitespace-nowrap text-right tabular-nums', render: weight },
  { key: 'sash', header: 'Trừ cánh', className: num, wide: true, render: (b) => mm(b.deductSashMm) },
  { key: 'mullion', header: 'Trừ đố', className: num, wide: true, render: (b) => mm(b.deductMullionMm) },
  { key: 'bead', header: 'Trừ nẹp', className: num, wide: true, render: (b) => mm(b.deductBeadMm) },
  { key: 'glass', header: 'Trừ kính', className: num, wide: true, render: (b) => mm(b.deductGlassMm) },
];

interface Props {
  rows: ProfileBar[];
  onOpen: (b: ProfileBar) => void;
}

export function ProfileBarList({ rows, onOpen }: Props) {
  return (
    <DataTable
      caption="Danh sách thanh profile của hãng đang chọn. Bấm vào một dòng để xem chi tiết."
      rows={rows}
      rowKey={(b) => b.id}
      columns={COLUMNS}
      onOpen={onOpen}
      card={(b) => (
        <div className="flex items-start gap-3">
          <SectionThumb bar={b} />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <p className="truncate text-sm font-semibold text-slate-900">{b.name}</p>
            <p className="flex flex-wrap items-center gap-1.5">
              <Tag tone="blue">{b.code || '–'}</Tag>
              {b.isSystem && <SystemTag />}
              <Tag tone="violet">{barTypeLabel(b)}</Tag>
              <Flags bar={b} />
            </p>
            <p className="text-xs text-slate-500">
              {b.sectionHeightMm ? `Cao ${b.sectionHeightMm} mm · ` : ''}
              {weight(b)}
            </p>
          </div>
        </div>
      )}
    />
  );
}
