'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ImageOff } from 'lucide-react';
import { bulkCreateProjectPositions, createProjectPosition, getBrands, getDoorSeriesList, getDoors } from '@/actions';
import { DoorThumbnail } from '@/components';
import { getDoorTypeConfig, normalizeDoorType, type Door, type ProjectDetail, type ProjectFloor } from '@/types';
import { cn } from '@/utils/cn';
import { BTN_PRIMARY, Field, INPUT } from '../../../_components/form';
import { Select } from '../../../_components/select';
import { Sheet } from '../../../_components/sheet';
import { useAct } from './use-act';

const TYPES: [string, string][] = [
  ['', 'Tất cả'],
  ['glass_wall', 'Vách kính'],
  ['casement_window', 'Cửa sổ mở quay'],
  ['sliding_window', 'Cửa sổ lùa'],
  ['casement_door', 'Cửa đi mở quay'],
  ['sliding_door', 'Cửa đi lùa'],
  ['folding_door', 'Cửa gấp xếp'],
  ['sliding_casement_door', 'Cửa trượt quay'],
  ['curtain_wall', 'Mặt dựng'],
  ['composite', 'Tổng hợp'],
];
const baseCode = (raw: string) =>
  raw
    .trim()
    .replace(/[-_]\d+$/, '')
    .replace(/[-_]+$/, '') || raw.trim();
const cfgNum = (d: Door, k: 'w' | 'h', fb: number) => Number((d.systemConfig as Record<string, unknown> | undefined)?.[k]) || fb;

interface Props {
  open: boolean;
  onClose: () => void;
  project: ProjectDetail;
  floors: ProjectFloor[];
  floorId: string;
}

// Chọn mẫu cửa từ danh mục (lọc hãng, hệ, loại, tìm tên) rồi nhập mã, tầng, kích thước, số lượng để thêm vào dự án.
export function DesignPickSheet({ open, onClose, project, floors, floorId }: Props) {
  const [brand, setBrand] = useState(project.defaultBrandId ? String(project.defaultBrandId) : '');
  const [series, setSeries] = useState('');
  const [type, setType] = useState('');
  const [q, setQ] = useState('');
  const [door, setDoor] = useState<Door | null>(null);
  const [f, setF] = useState({ code: '', floor: floorId || (floors[0] ? String(floors[0].id) : ''), w: '', h: '', qty: '1', desc: '' });

  const brands = useQuery({ queryKey: ['brands', 'aluminum'], queryFn: () => getBrands({ limit: 100, brandType: 'aluminum' }), enabled: open });
  const seriesQ = useQuery({
    queryKey: ['door-series', brand || 'all'],
    queryFn: () => getDoorSeriesList({ brandId: brand ? Number(brand) : undefined, limit: 500 }),
    enabled: open,
  });
  const doorsQ = useQuery({
    queryKey: ['doors-picker', brand || 'all'],
    queryFn: () => getDoors({ brandId: brand ? Number(brand) : undefined, limit: 1000 }),
    enabled: open,
  });

  const list = useMemo(() => {
    const k = q.trim().toLowerCase();
    return (doorsQ.data?.items ?? []).filter(
      (d) =>
        (!series || (d.doorSeriesId ?? d.doorSeries?.id) === Number(series)) &&
        (!type || (d.type && normalizeDoorType(d.type) === normalizeDoorType(type))) &&
        (!k || d.name.toLowerCase().includes(k) || (d.code ?? '').toLowerCase().includes(k)),
    );
  }, [doorsQ.data, series, type, q]);

  const done = () => {
    setDoor(null);
    onClose();
  };
  const qty = Math.max(1, Math.min(100, Number(f.qty) || 1));
  const add = useAct(
    project.id,
    async () => {
      const d = door!;
      const w = Number(f.w);
      const h = Number(f.h);
      const cfg = { ...structuredClone((d.systemConfig ?? {}) as Record<string, unknown>), w, h, width: w, height: h };
      const body = {
        projectId: project.id,
        floorId: f.floor ? Number(f.floor) : undefined,
        templateDoorId: d.id,
        description: f.desc.trim() || d.name,
        doorType: d.type || 'door',
        width: w,
        height: h,
        brandId: d.doorSeries?.brandId || undefined,
        doorSeriesId: d.doorSeriesId || undefined,
        systemConfig: cfg,
      };
      return qty === 1
        ? createProjectPosition(project.id, { ...body, code: f.code.trim() })
        : bulkCreateProjectPositions(project.id, { ...body, baseCode: baseCode(f.code), quantity: qty });
    },
    qty === 1 ? 'Đã thêm cửa vào dự án' : `Đã thêm ${qty} bộ cửa vào dự án`,
    done,
  );

  const pick = (d: Door) => {
    setDoor(d);
    setF({
      code: '',
      floor: floorId || (floors[0] ? String(floors[0].id) : ''),
      w: String(cfgNum(d, 'w', 1200)),
      h: String(cfgNum(d, 'h', 2200)),
      qty: '1',
      desc: d.name,
    });
  };
  const num = (v: string) => v.replace(/\D/g, '');
  const valid = f.code.trim() && Number(f.w) >= 100 && Number(f.h) >= 100 && qty >= 1;

  return (
    <Sheet open={open} onClose={done} title={door ? 'Thông tin cửa mới' : 'Chọn mẫu cửa'}>
      {door ? (
        <form
          className="flex flex-col gap-4 p-rm-gutter"
          onSubmit={(e) => {
            e.preventDefault();
            add.mutate();
          }}
        >
          <button type="button" onClick={() => setDoor(null)} className="flex h-rm-tap items-center gap-1 self-start text-sm text-rm-primary">
            <ArrowLeft size={16} aria-hidden="true" /> Chọn mẫu khác
          </button>
          <div className="flex items-center gap-3 rounded-rm-xl border border-rm-edge p-2">
            <span className="flex size-14 flex-none items-center justify-center rounded-rm bg-rm-bg p-1">
              {door.systemConfig?.rootCell ? (
                <DoorThumbnail
                  door={door}
                  systemConfig={{ ...door.systemConfig, w: Number(f.w) || 800, h: Number(f.h) || 1200 }}
                  hideDimensions
                  className="size-full"
                />
              ) : (
                <ImageOff size={20} className="text-rm-muted" aria-hidden="true" />
              )}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{door.name}</span>
              <span className="block truncate text-xs text-rm-muted">{door.code}</span>
            </span>
          </div>
          <Field label={qty > 1 ? 'Tiền tố mã cửa' : 'Mã cửa'} id="pk-code">
            <input
              id="pk-code"
              value={f.code}
              onChange={(e) => setF({ ...f, code: e.target.value })}
              placeholder={qty > 1 ? 'VD: D1' : 'VD: D1-01'}
              className={INPUT}
            />
          </Field>
          {qty > 1 && f.code.trim() && (
            <p className="-mt-2 text-xs text-rm-primary">
              Sinh {qty} mã: {baseCode(f.code)}-01 → {baseCode(f.code)}-{String(qty).padStart(2, '0')}
            </p>
          )}
          {floors.length > 0 && (
            <Field label="Tầng" id="pk-floor">
              <Select
                id="pk-floor"
                label="Tầng"
                value={f.floor}
                onChange={(v) => setF({ ...f, floor: v })}
                options={floors.map((x) => ({ value: String(x.id), label: x.name }))}
              />
            </Field>
          )}
          <div className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-3">
            <Field label="Rộng (mm)" id="pk-w">
              <input id="pk-w" inputMode="numeric" value={f.w} onChange={(e) => setF({ ...f, w: num(e.target.value) })} className={INPUT} />
            </Field>
            <Field label="Cao (mm)" id="pk-h">
              <input id="pk-h" inputMode="numeric" value={f.h} onChange={(e) => setF({ ...f, h: num(e.target.value) })} className={INPUT} />
            </Field>
            <Field label="Số bộ" id="pk-qty">
              <input
                id="pk-qty"
                inputMode="numeric"
                value={f.qty}
                onChange={(e) => setF({ ...f, qty: num(e.target.value).slice(0, 3) })}
                className={INPUT}
              />
            </Field>
          </div>
          <Field label="Mô tả" id="pk-desc">
            <input
              id="pk-desc"
              value={f.desc}
              onChange={(e) => setF({ ...f, desc: e.target.value })}
              placeholder="VD: Cửa đi phòng khách"
              className={INPUT}
            />
          </Field>
          <button type="submit" disabled={add.isPending || !valid} className={BTN_PRIMARY}>
            {add.isPending ? 'Đang thêm…' : qty > 1 ? `Thêm ${qty} bộ vào dự án` : 'Thêm vào dự án'}
          </button>
        </form>
      ) : (
        <div className="flex flex-col gap-3 p-rm-gutter">
          <div className="grid grid-cols-[minmax(0,1fr)] gap-3">
            <Select
              id="pk-brand"
              label="Hãng nhôm"
              value={brand}
              onChange={(v) => {
                setBrand(v);
                setSeries('');
              }}
              options={[{ value: '', label: 'Tất cả hãng' }, ...(brands.data?.items ?? []).map((b) => ({ value: String(b.id), label: b.name }))]}
            />
            <Select
              id="pk-series"
              label="Hệ nhôm"
              value={series}
              onChange={setSeries}
              options={[{ value: '', label: 'Tất cả hệ' }, ...(seriesQ.data?.items ?? []).map((s) => ({ value: String(s.id), label: s.name }))]}
            />
            <input
              type="search"
              aria-label="Tìm mẫu cửa"
              placeholder="Tìm theo tên hoặc mã mẫu"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className={INPUT}
            />
          </div>
          <div role="group" aria-label="Loại cửa" className="-mx-rm-gutter flex gap-1.5 overflow-x-auto px-rm-gutter pb-1">
            {TYPES.map(([v, l]) => (
              <button
                key={v}
                type="button"
                aria-pressed={type === v}
                onClick={() => setType(v)}
                className={cn(
                  'h-9 flex-none rounded-rm border px-3 text-sm',
                  type === v ? 'border-rm-primary bg-rm-primary-soft text-rm-primary' : 'border-rm-line',
                )}
              >
                {l}
              </button>
            ))}
          </div>
          <p className="text-xs text-rm-muted">{doorsQ.isLoading ? 'Đang tải mẫu…' : `${list.length} mẫu`}</p>
          {!doorsQ.isLoading && list.length === 0 && <p className="py-8 text-center text-sm text-rm-muted">Không có mẫu cửa phù hợp.</p>}
          <ul className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2.5">
            {list.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => pick(d)}
                  className="flex h-full w-full flex-col overflow-hidden rounded-rm-xl border border-rm-edge bg-rm-surface text-left active:bg-rm-bg"
                >
                  <span className="flex aspect-[4/3] items-center justify-center bg-rm-bg p-2">
                    {d.systemConfig?.rootCell ? (
                      <DoorThumbnail door={d} hideDimensions={false} className="size-full" />
                    ) : (
                      <ImageOff size={22} className="text-rm-muted" aria-hidden="true" />
                    )}
                  </span>
                  <span className="min-w-0 px-2 py-1.5">
                    <span className="block truncate text-xs text-rm-muted">{d.code || `#${d.id}`}</span>
                    <span className="block truncate text-sm font-medium">{d.name}</span>
                    <span className="block truncate text-xs text-rm-muted">{getDoorTypeConfig(d.type).label}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Sheet>
  );
}
