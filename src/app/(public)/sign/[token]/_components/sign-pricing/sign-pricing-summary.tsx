import { SIGN_ACCESSORY_MODE_LABEL } from '@/config';
import type { PublicMilestone, PublicPricingSummary } from '@/types';
import { formatNumber, formatVnd } from '@/utils/public-signing';

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={strong ? 'flex justify-between gap-3 font-bold text-white' : 'flex justify-between gap-3 text-white/90'}>
      <dt>{label}</dt>
      <dd className="text-right font-mono tabular-nums">{value}</dd>
    </div>
  );
}

export function SignPricingSummary({ pricing }: { pricing: PublicPricingSummary }) {
  const hasDiscount = (pricing.discountAmount ?? 0) > 0;
  return (
    <section aria-label="Tổng hợp giá" className="space-y-2 rounded-2xl bg-primary p-4 text-xs text-white shadow-md">
      <h2 className="text-xs font-bold uppercase tracking-wider text-white/80">Tổng hợp giá trị</h2>
      <dl className="space-y-1.5">
        <Row label="Tổng số bộ" value={formatNumber(pricing.totalQuantity, 0)} />
        <Row label="Tổng diện tích" value={`${formatNumber(pricing.totalAreaM2)} m²`} />
        {pricing.subtotalAmount != null && <Row label="Cộng hạng mục" value={formatVnd(pricing.subtotalAmount)} />}
        {(pricing.otherAmount ?? 0) > 0 && <Row label="Chi phí khác" value={formatVnd(pricing.otherAmount)} />}
        {hasDiscount && (
          <Row
            label={`Chiết khấu${pricing.discountPercent ? ` (${formatNumber(pricing.discountPercent)}%)` : ''}`}
            value={`-${formatVnd(pricing.discountAmount)}`}
          />
        )}
        {pricing.amountBeforeVat != null && <Row label="Thành tiền trước VAT" value={formatVnd(pricing.amountBeforeVat)} />}
        {pricing.vatAmount != null && (
          <Row label={`VAT${pricing.vatPercent != null ? ` (${formatNumber(pricing.vatPercent)}%)` : ''}`} value={formatVnd(pricing.vatAmount)} />
        )}
        {pricing.totalAmount != null && (
          <div className="border-t border-white/30 pt-2 text-base">
            <Row label="Tổng cộng" value={formatVnd(pricing.totalAmount)} strong />
          </div>
        )}
      </dl>
      {SIGN_ACCESSORY_MODE_LABEL[pricing.accessoryMode] && (
        <p className="text-[11px] text-white/80">{SIGN_ACCESSORY_MODE_LABEL[pricing.accessoryMode]}</p>
      )}
    </section>
  );
}

export function SignMilestones({ milestones }: { milestones: PublicMilestone[] }) {
  if (milestones.length === 0) return null;
  return (
    <section aria-label="Mốc thanh toán" className="space-y-2 rounded-xl border border-stone-200 bg-white p-3 text-xs shadow-sm">
      <h2 className="text-xs font-bold uppercase tracking-wider text-primary">Mốc thanh toán</h2>
      <ul className="divide-y divide-stone-100">
        {milestones.map((m) => (
          <li key={m.name} className="flex justify-between gap-3 py-1.5 text-stone-800">
            <span>
              {m.name}
              {m.percentage != null && <span className="text-stone-500"> ({formatNumber(m.percentage)}%)</span>}
            </span>
            <span className="font-mono font-semibold tabular-nums">{m.amount != null ? formatVnd(m.amount) : '—'}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
