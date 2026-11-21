'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProjectQuotationMaterialAnalysis } from '@/actions';
import { QUOTATION_LABOR_ROW_LABEL_MAP, QUOTATION_MATERIAL_ROW_LABEL_MAP } from '@/config';
import { formatCurrency } from '@/utils/currency';
import { cn } from '@/utils/cn';
import { ErrorState, ListSkeleton } from '../../../_components/state-views';
import { quotationMaterialAnalysisKey } from '../_quotes/use-active-quotation';

const money = (n: number) => formatCurrency(n);
const Block = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-rm-xl border border-rm-edge bg-rm-surface p-rm-gutter">
    <h3 className="mb-2 text-sm font-semibold">{title}</h3>
    {children}
  </section>
);
const Line = ({ a, b, c }: { a: string; b?: string; c: string }) => (
  <li className="flex items-baseline gap-3 py-1.5 text-sm">
    <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">
      {a}
      {b && <span className="block text-xs text-rm-muted">{b}</span>}
    </span>
    <span className="flex-none tabular-nums">{c}</span>
  </li>
);

// Phân tích cấu thành giá sản xuất và thống kê vật tư (thanh nhôm, kính, gioăng - phụ kiện), toàn dự án hoặc từng bộ cửa.
export function QuoteAnalysis({ projectId, quotationId }: { projectId: number; quotationId: number }) {
  const [pos, setPos] = useState<number | null>(null);
  const q = useQuery({
    queryKey: [...quotationMaterialAnalysisKey(projectId), quotationId],
    queryFn: () => getProjectQuotationMaterialAnalysis(projectId, quotationId),
  });
  if (q.isLoading) return <ListSkeleton rows={3} />;
  if (q.isError || !q.data)
    return <ErrorState title="Không tải được phân tích vật tư" description="Thử lại sau." actionLabel="Thử lại" onAction={() => q.refetch()} />;
  const d = q.data;
  const cur = pos === null ? d.overall : (d.byPositions.find((p) => p.positionId === pos)?.breakdown ?? d.overall);
  const cb = cur.costBreakdown;

  return (
    <div className="flex flex-col gap-4">
      <div role="group" aria-label="Phạm vi" className="flex gap-1.5 overflow-x-auto pb-1">
        {[
          { id: null as number | null, label: `Tất cả (${d.totalPositions})` },
          ...d.byPositions.map((p) => ({ id: p.positionId as number | null, label: p.positionCode })),
        ].map((o) => (
          <button
            key={o.id ?? 'all'}
            type="button"
            aria-pressed={pos === o.id}
            onClick={() => setPos(o.id)}
            className={cn(
              'h-9 flex-none rounded-rm border px-3 text-sm',
              pos === o.id ? 'border-rm-primary bg-rm-primary-soft text-rm-primary' : 'border-rm-line',
            )}
          >
            {o.label}
          </button>
        ))}
      </div>

      <Block title={`Cấu thành giá sản xuất · ${money(cb.totalBaseCost)}`}>
        <p className="mb-1 text-xs text-rm-muted">
          {cb.totalAreaM2.toLocaleString('vi-VN')} m² · {cb.totalAluminumKg.toLocaleString('vi-VN')} kg nhôm · {money(cb.totalBaseCostPerM2)}/m²
        </p>
        <ul className="divide-y divide-rm-line">
          {cb.materialRows.map((r) => (
            <Line
              key={r.code}
              a={QUOTATION_MATERIAL_ROW_LABEL_MAP[r.code] ?? r.code}
              b={`${r.ratioPercent.toFixed(1)}% · ${money(r.unitCostPerM2)}/m²`}
              c={money(r.amount)}
            />
          ))}
          <Line a="Tổng vật tư" b={`${cb.materialRatioPercent.toFixed(1)}%`} c={money(cb.totalMaterialCost)} />
          {cb.laborRows.map((r) => (
            <Line
              key={r.code}
              a={QUOTATION_LABOR_ROW_LABEL_MAP[r.code] ?? r.code}
              b={`${r.quantity.toLocaleString('vi-VN')} ${r.unit === 'kg' ? 'kg' : 'm²'} × ${money(r.unitPrice)}`}
              c={money(r.amount)}
            />
          ))}
          <Line a="Tổng tiền công" b={`${cb.laborRatioPercent.toFixed(1)}%`} c={money(cb.totalLaborCost)} />
        </ul>
      </Block>

      <Block title={`Thanh nhôm · ${cur.totalProfileWeightKg.toLocaleString('vi-VN')} kg · ${money(cur.totalProfileCost)}`}>
        {cur.profiles.length === 0 ? (
          <p className="text-sm text-rm-muted">Không có dữ liệu.</p>
        ) : (
          <ul className="divide-y divide-rm-line">
            {cur.profiles.map((p, i) => (
              <Line
                key={`${p.profileCode}-${p.colorId}-${i}`}
                a={`${p.profileCode} · ${p.profileName}`}
                b={`${p.colorName} · ${p.quantity} thanh × ${p.lengthM} m · ${p.weightKg.toLocaleString('vi-VN')} kg`}
                c={money(p.totalPrice)}
              />
            ))}
          </ul>
        )}
      </Block>

      <Block title={`Kính · ${cur.totalGlassQuantity} tấm · ${money(cur.totalGlassCost)}`}>
        {cur.glasses.length === 0 ? (
          <p className="text-sm text-rm-muted">Không có dữ liệu.</p>
        ) : (
          <ul className="divide-y divide-rm-line">
            {cur.glasses.map((g, i) => (
              <Line key={`${g.glassName}-${i}`} a={g.glassName} b={`${g.widthMm} × ${g.heightMm} mm · ${g.quantity} tấm`} c={money(g.totalPrice)} />
            ))}
          </ul>
        )}
      </Block>

      <Block title={`Gioăng, phụ kiện, vật tư phụ · ${money(cur.totalAuxiliaryCost)}`}>
        {cur.auxiliaries.length === 0 ? (
          <p className="text-sm text-rm-muted">Không có dữ liệu.</p>
        ) : (
          <ul className="divide-y divide-rm-line">
            {cur.auxiliaries.map((a, i) => (
              <Line key={`${a.code}-${i}`} a={a.name} b={`${a.code} · ${a.quantity.toLocaleString('vi-VN')} ${a.unit}`} c={money(a.totalPrice)} />
            ))}
          </ul>
        )}
      </Block>
    </div>
  );
}
