'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProductionOrderSheets } from '@/actions';
import type { ProductionOrder, ProductionSheet } from '@/types';
import { cn } from '@/utils/cn';
import { BTN_LINE } from '../../../_components/form';
import { Sheet } from '../../../_components/sheet';
import { ErrorState, ListSkeleton } from '../../../_components/state-views';

const esc = (s: unknown) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] as string);

const List = ({ title, rows }: { title: string; rows: string[] }) =>
  rows.length === 0 ? null : (
    <div>
      <p className="text-xs font-medium text-rm-muted">{title}</p>
      <ul className="mt-0.5 divide-y divide-rm-line text-sm">
        {rows.map((r, i) => (
          <li key={i} className="py-1 [overflow-wrap:anywhere]">
            {r}
          </li>
        ))}
      </ul>
    </div>
  );

const rowsOf = (s: ProductionSheet) => ({
  profiles: s.profiles.map(
    (p) =>
      `${p.profileCode} · ${p.profileName} — ${p.quantity} thanh × ${p.cutLengthMm} mm (${p.cutAngle})${p.weightKg ? ` · ${p.weightKg} kg` : ''}`,
  ),
  glasses: s.glasses.map((g) => `${g.glassName} — ${g.widthMm} × ${g.heightMm} mm × ${g.quantity}`),
  gaskets: s.gaskets.map((g) => `${g.name ?? g.code ?? ''}${g.lengthM ? ` — ${g.lengthM} m` : ''}`),
  accessories: s.accessories.map((a) => `${a.accessoryName} — ${a.quantity} ${a.unit}`),
  reinforcements: s.reinforcements.map((r) => `${r.accessoryName ?? r.name ?? r.accessoryCode ?? ''} — ${r.quantity ?? r.qty ?? ''} ${r.unit ?? ''}`),
});

// Thẻ sản xuất và lắp ráp từng cửa của một lệnh: nhôm cắt, kính, gioăng, phụ kiện, thép gia cường; chọn một cửa hoặc in tất cả.
export function ProductionSheets({ projectId, order, onClose }: { projectId: number; order: ProductionOrder | null; onClose: () => void }) {
  const [sel, setSel] = useState<number | 'all'>('all');
  const q = useQuery({
    queryKey: ['project', projectId, 'sheets', order?.id],
    queryFn: () => getProductionOrderSheets(projectId, order!.id),
    enabled: !!order,
  });
  const sheets = q.data ?? [];
  const shown = sel === 'all' ? sheets : sheets.filter((s) => s.positionId === sel);

  const print = () => {
    const w = window.open('', '_blank');
    if (!w || !order) return;
    const html = shown
      .map((s) => {
        const r = rowsOf(s);
        const part = (t: string, a: string[]) => (a.length ? `<h3>${t}</h3><ul>${a.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '');
        return `<section style="page-break-after:always"><h2>${esc(s.positionCode)} · ${esc(s.doorName)}</h2><p>${esc(s.floorName)} · ${s.width} × ${s.height} mm · ${s.areaM2} m² · ${esc([s.brandName, s.seriesName, s.colorName].filter(Boolean).join(' / '))}</p>${part('Thanh nhôm', r.profiles)}${part('Kính', r.glasses)}${part('Gioăng', r.gaskets)}${part('Phụ kiện', r.accessories)}${part('Thép gia cường', r.reinforcements)}</section>`;
      })
      .join('');
    w.document.write(
      `<html><head><title>${esc(order.code)}</title><style>body{font-family:sans-serif;padding:24px}li{margin:2px 0}</style></head><body>${html}</body></html>`,
    );
    w.document.close();
    w.onload = () => w.print();
  };

  return (
    <Sheet open={!!order} onClose={onClose} title={order ? `Thẻ sản xuất · ${order.code}` : 'Thẻ sản xuất'}>
      <div className="flex flex-col gap-3 p-rm-gutter">
        {q.isLoading && <ListSkeleton rows={3} />}
        {q.isError && (
          <ErrorState title="Không tải được thẻ sản xuất" description="Thử lại sau." actionLabel="Thử lại" onAction={() => q.refetch()} />
        )}
        {sheets.length > 0 && (
          <>
            <div role="group" aria-label="Chọn cửa" className="-mx-rm-gutter flex gap-1.5 overflow-x-auto px-rm-gutter pb-1">
              {[
                { id: 'all' as const, label: `Tất cả (${sheets.length})` },
                ...sheets.map((s, i) => ({ id: s.positionId, label: `${String(i + 1).padStart(2, '0')}. ${s.positionCode}` })),
              ].map((o) => (
                <button
                  key={o.id}
                  type="button"
                  aria-pressed={sel === o.id}
                  onClick={() => setSel(o.id)}
                  className={cn(
                    'h-9 flex-none rounded-rm border px-3 text-sm',
                    sel === o.id ? 'border-rm-primary bg-rm-primary-soft text-rm-primary' : 'border-rm-line',
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <button type="button" onClick={print} className={BTN_LINE}>
              In thẻ ({shown.length})
            </button>
            {shown.map((s) => {
              const r = rowsOf(s);
              return (
                <article key={s.positionId} className="flex flex-col gap-2 rounded-rm-xl border border-rm-edge bg-rm-surface p-rm-gutter">
                  <h3 className="text-sm font-semibold">
                    {s.positionCode} · {s.doorName}
                  </h3>
                  <p className="text-xs text-rm-muted">
                    {s.floorName} · {s.width} × {s.height} mm · {s.areaM2} m² · {s.totalWeightKg} kg{s.isEstimated ? ' (ước tính)' : ''}
                    <span className="block">{[s.brandName, s.seriesName, s.colorName].filter(Boolean).join(' / ')}</span>
                  </p>
                  <List title="Thanh nhôm" rows={r.profiles} />
                  <List title="Kính" rows={r.glasses} />
                  <List title="Gioăng" rows={r.gaskets} />
                  <List title="Phụ kiện" rows={r.accessories} />
                  <List title="Thép gia cường" rows={r.reinforcements} />
                </article>
              );
            })}
          </>
        )}
      </div>
    </Sheet>
  );
}
