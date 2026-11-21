'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { calculateDoor } from '@/actions';
import type { Door, DoorCalculateResponse } from '@/types';
import { cn } from '@/utils/cn';
import { Badge } from '../../_components/badge';
import { BTN_LINE, INPUT } from '../../_components/form';
import { ErrorState, ListSkeleton } from '../../_components/state-views';

type Key = 'bars' | 'beads' | 'glass' | 'joints' | 'grilles' | 'accessories';
const money = (n?: number | null) => `${Math.round(n ?? 0).toLocaleString('vi-VN')} đ`;

const Line = ({ a, b, c }: { a: string; b?: string; c?: string }) => (
  <li className="flex items-baseline gap-3 px-3 py-2 text-sm">
    <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">
      {a}
      {b && <span className="block text-xs text-rm-muted">{b}</span>}
    </span>
    {c && <span className="flex-none text-right tabular-nums">{c}</span>}
  </li>
);

// Bóc tách vật tư (BOM) của một mẫu cửa theo kích thước nhập: cắt nhôm, nẹp, kính, con ke, nan đồng, phụ kiện.
export function DoorBom({ door, onClose }: { door: Door | null; onClose: () => void }) {
  if (!door) return null;
  return <Content key={door.id} door={door} onClose={onClose} />;
}

function Content({ door, onClose }: { door: Door; onClose: () => void }) {
  const cfg = (door.systemConfig ?? {}) as { w?: number; h?: number; drawing?: { w?: number; h?: number } };
  const [w, setW] = useState(cfg.w ?? cfg.drawing?.w ?? 1400);
  const [h, setH] = useState(cfg.h ?? cfg.drawing?.h ?? 1600);
  const [tab, setTab] = useState<Key>('bars');
  const q = useQuery<DoorCalculateResponse>({
    queryKey: ['door-bom', door.id, w, h],
    queryFn: () => calculateDoor({ doorId: door.id, width: w, height: h }),
  });
  const b = q.data;
  const tabs: { key: Key; label: string; n: number; show?: boolean }[] = [
    { key: 'bars', label: 'Cắt nhôm', n: b?.groupedBars?.length ?? 0 },
    { key: 'beads', label: 'Nẹp kính', n: b?.groupedBeads?.length ?? 0 },
    { key: 'glass', label: 'Đặt kính', n: b?.cells?.length ?? 0 },
    { key: 'joints', label: 'Con ke', n: b?.cornerJoints?.length ?? 0 },
    { key: 'grilles', label: 'Nan đồng', n: b?.grilles?.length ?? 0, show: !!b?.grilles?.length },
    { key: 'accessories', label: 'Phụ kiện', n: b?.accessories?.length ?? 0 },
  ];

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={`BOM ${door.name}`} className="fixed inset-0 z-50 flex flex-col bg-rm-bg font-body text-rm-text">
      <header className="flex h-14 flex-none items-center gap-1 border-b border-rm-line bg-rm-surface px-1">
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="flex size-11 flex-none items-center justify-center rounded-full text-rm-muted active:bg-rm-line"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="min-w-0 flex-1 px-1">
          <h1 className="truncate text-sm font-medium">{door.name}</h1>
          <p className="truncate text-xs text-rm-muted">Bóc tách vật tư · {door.code ?? '–'}</p>
        </div>
      </header>
      <div className="flex flex-none flex-wrap items-center gap-2 border-b border-rm-line bg-rm-surface p-2">
        <label className="flex items-center gap-1 text-xs text-rm-muted">
          Rộng
          <input type="number" inputMode="numeric" value={w} onChange={(e) => setW(Number(e.target.value))} className={`${INPUT} w-24`} />
        </label>
        <label className="flex items-center gap-1 text-xs text-rm-muted">
          Cao
          <input type="number" inputMode="numeric" value={h} onChange={(e) => setH(Number(e.target.value))} className={`${INPUT} w-24`} />
        </label>
        <button type="button" disabled={q.isFetching} onClick={() => q.refetch()} className={`${BTN_LINE} px-4`}>
          <RefreshCw size={16} className={q.isFetching ? 'animate-spin' : ''} aria-hidden="true" />
          Tính lại
        </button>
        {b && (
          <p className="flex min-w-0 flex-wrap gap-1.5">
            <Badge tone="success">Nhôm {b.totalAluminumWeightKg} kg</Badge>
            <Badge tone="primary">Kính {b.totalGlassAreaM2} m²</Badge>
            {b.totalJointQty !== undefined && <Badge tone={b.hasUnconfiguredJoints ? 'warning' : 'neutral'}>Ke {b.totalJointQty}</Badge>}
            {!!b.totalAccessoryPrice && <Badge>PK {money(b.totalAccessoryPrice)}</Badge>}
          </p>
        )}
      </div>
      <div role="tablist" className="no-scrollbar flex flex-none gap-2 overflow-x-auto border-b border-rm-line bg-rm-surface px-2 py-2">
        {tabs
          .filter((t) => t.show !== false)
          .map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'h-9 flex-none rounded-rm border px-3 text-sm',
                tab === t.key ? 'border-rm-primary bg-rm-primary-soft text-rm-primary' : 'border-rm-line',
              )}
            >
              {t.label} ({t.n})
            </button>
          ))}
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-rm-gutter">
        {q.isLoading && <ListSkeleton />}
        {q.isError && (
          <ErrorState
            title="Không tính được BOM"
            description="Mẫu cửa chưa đủ cấu hình hoặc API lỗi."
            actionLabel="Thử lại"
            onAction={() => q.refetch()}
          />
        )}
        {b && (
          <ul className="divide-y divide-rm-line rounded-rm-xl border border-rm-edge bg-rm-surface">
            {tab === 'bars' &&
              b.groupedBars.map((x, i) => (
                <Line
                  key={i}
                  a={`${x.profileCode ?? ''} · ${x.name}`}
                  b={`${x.length.toLocaleString('vi-VN')} mm · góc ${x.goc1}°/${x.goc2}°${x.formula ? ` · ${x.formula}` : ''}`}
                  c={`× ${x.qty}`}
                />
              ))}
            {tab === 'beads' &&
              b.groupedBeads.map((x, i) => (
                <Line
                  key={i}
                  a={`${x.profileCode ?? ''} · ${x.name}`}
                  b={`${x.length.toLocaleString('vi-VN')} mm · dày ${x.thicknessMm} · góc ${x.goc1}°/${x.goc2}°`}
                  c={`× ${x.qty}`}
                />
              ))}
            {tab === 'glass' &&
              b.cells.map((x, i) => (
                <Line
                  key={i}
                  a={`${x.glassName ?? 'Kính'} · ${x.path}`}
                  b={`${x.glassW} × ${x.glassH} mm${x.openType ? ` · ${x.openType}` : ''}`}
                  c={`${x.areaM2.toFixed(2)} m²`}
                />
              ))}
            {tab === 'joints' &&
              (b.cornerJoints ?? []).map((x, i) => (
                <Line
                  key={i}
                  a={`${x.name}${x.isConfigured ? '' : ' · chưa cấu hình'}`}
                  b={`${x.position === 'frame' ? 'Khung' : 'Cánh'}${x.jointType ? ` · ${x.jointType}` : ''} · ${money(x.unitPrice)}`}
                  c={`× ${x.qty} = ${money(x.totalPrice)}`}
                />
              ))}
            {tab === 'grilles' &&
              (b.grilles ?? []).map((x, i) => (
                <Line
                  key={i}
                  a={`${x.cellPath} · nan ${x.barWidthMm} mm ${x.barColor}`}
                  b={`${x.totalBarLengthM.toFixed(2)} m · ${money(x.unitPricePerM)}/m · hoa văn ${x.motifQty}`}
                  c={money(x.totalPrice)}
                />
              ))}
            {tab === 'accessories' &&
              (b.accessories ?? []).map((x, i) => (
                <Line
                  key={i}
                  a={`${x.code ?? ''} · ${x.name}`}
                  b={`${x.comboName ?? x.brandName ?? ''} ${x.unit} · ${money(x.unitPrice)}`}
                  c={`× ${x.quantity} = ${money(x.totalPrice)}`}
                />
              ))}
          </ul>
        )}
      </div>
    </div>,
    document.body,
  );
}
