'use client';

import { useCan } from '@/hooks';
import type { QuotationAccessoryMode } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { cn } from '@/utils/cn';
import { BTN_LINE } from '../../../_components/form';
import { ListSkeleton } from '../../../_components/state-views';
import { esc, printHtml } from '../../_components/print-html';
import { useQuotationSheet } from '../_quotes/use-quotation-sheet';

const MODES: [QuotationAccessoryMode, string][] = [
  ['combined', 'Gộp phụ kiện'],
  ['separated', 'Phụ kiện rời'],
];

// Bảng báo giá theo tầng như khách thấy; xuất Excel (cần quyền xuất) khi báo giá còn khớp dữ liệu cửa.
export function QuoteSheetView({ projectId, quotationId, mode }: { projectId: number; quotationId: number; mode: QuotationAccessoryMode }) {
  const { can } = useCan();
  const s = useQuotationSheet(projectId, quotationId, mode);
  const sheet = s.sheet;
  if (s.isLoading || !sheet) return <ListSkeleton rows={4} />;
  const blocked = sheet.isOutdated;
  const m = formatCurrency;
  const print = () =>
    printHtml(
      sheet.quotationCode,
      `<h1>BÁO GIÁ ${esc(sheet.quotationCode)}</h1><p>Khách hàng: <b>${esc(sheet.customerName)}</b> ${esc(sheet.customerPhone ?? '')}<br>Công trình: ${esc(sheet.siteAddress ?? '')}</p>` +
        sheet.floors
          .map(
            (f) =>
              `<h2>${esc(f.floorName)}</h2><table><tr><th>Vị trí</th><th>Mô tả</th><th>Kích thước</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr>${f.rows
                .map(
                  (r) =>
                    `<tr><td>${esc(r.positionCode)}</td><td>${esc(r.description)}</td><td>${r.width && r.height ? `${r.width} × ${r.height}` : ''}</td><td>${r.quantity} ${r.unit === 'm2' ? 'm²' : 'bộ'}</td><td class="n">${m(r.unitPrice)}</td><td class="n">${m(r.amount)}</td></tr>`,
                )
                .join('')}</table>`,
          )
          .join('') +
        sheet.extraRows.map((r) => `<p>${esc(r.description)}: <b>${m(r.amount)}</b></p>`).join('') +
        `<p>Tạm tính: ${m(sheet.subtotalAmount)}<br>Giảm giá (${sheet.discountPercent}%): -${m(sheet.discountAmount)}<br><b>Khách phải trả: ${m(sheet.payableAmount)}</b><br><i>${esc(sheet.payableInWords ?? '')}</i></p>`,
    );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Cách hiển thị phụ kiện" className="flex rounded-rm border border-rm-line">
          {MODES.map(([v, l]) => (
            <button
              key={v}
              type="button"
              aria-pressed={s.accessoryMode === v}
              onClick={() => s.setAccessoryMode(v)}
              className={cn('h-9 px-3 text-sm', s.accessoryMode === v ? 'bg-rm-primary-soft text-rm-primary' : 'text-rm-muted')}
            >
              {l}
            </button>
          ))}
        </div>
        <button type="button" onClick={print} className={`${BTN_LINE} ml-auto px-4`}>
          In báo giá
        </button>
        {can('quotation:export') && (
          <button
            type="button"
            disabled={blocked || s.isExporting}
            onClick={() => s.exportExcel(`${sheet.quotationCode}.xlsx`)}
            className={`${BTN_LINE} px-4`}
          >
            {s.isExporting ? 'Đang xuất…' : 'Xuất Excel'}
          </button>
        )}
      </div>
      {blocked && (
        <p className="rounded-rm bg-rm-warning-soft px-3 py-2 text-sm text-rm-warning">Báo giá đã cũ so với dữ liệu cửa, hãy đồng bộ để xuất.</p>
      )}

      <p className="rounded-rm-xl border border-rm-edge bg-rm-surface p-rm-gutter text-sm [overflow-wrap:anywhere]">
        <strong>{sheet.quotationCode}</strong> · {sheet.customerName}
        {sheet.customerPhone && ` · ${sheet.customerPhone}`}
        {sheet.siteAddress && <span className="block text-rm-muted">{sheet.siteAddress}</span>}
        {sheet.quotationNote && <span className="block text-rm-muted">{sheet.quotationNote}</span>}
      </p>

      {sheet.floors.map((f) => (
        <section key={f.floorId}>
          <h3 className="mb-2 flex items-center justify-between gap-2 text-sm font-semibold">
            <span className="min-w-0 truncate">{f.floorName}</span>
            <span className="flex-none text-xs font-normal text-rm-muted">
              {f.totalQuantity} bộ · {f.totalAreaM2.toFixed(2)} m² · {formatCurrency(f.totalAmount)}
            </span>
          </h3>
          <ul className="divide-y divide-rm-line rounded-rm-xl border border-rm-edge bg-rm-surface">
            {f.rows.map((r, i) => (
              <li key={`${r.positionCode}-${i}`} className="flex items-baseline gap-3 px-rm-gutter py-2 text-sm">
                <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">
                  {r.positionCode}
                  <span className="block text-xs text-rm-muted">
                    {r.description}
                    {r.width && r.height ? ` · ${r.width} × ${r.height}` : ''} · {r.quantity} {r.unit === 'm2' ? 'm²' : 'bộ'} ×{' '}
                    {formatCurrency(r.unitPrice)}
                  </span>
                </span>
                <span className="flex-none tabular-nums">{formatCurrency(r.amount)}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {sheet.extraRows.length > 0 && (
        <ul className="divide-y divide-rm-line rounded-rm-xl border border-rm-edge bg-rm-surface">
          {sheet.extraRows.map((r, i) => (
            <li key={i} className="flex items-baseline gap-3 px-rm-gutter py-2 text-sm">
              <span className="min-w-0 flex-1">{r.description}</span>
              <span className="flex-none tabular-nums">{formatCurrency(r.amount)}</span>
            </li>
          ))}
        </ul>
      )}
      <dl className="rounded-rm-xl border border-rm-edge bg-rm-surface p-rm-gutter text-sm">
        <div className="flex justify-between py-1">
          <dt className="text-rm-muted">Tạm tính</dt>
          <dd className="tabular-nums">{formatCurrency(sheet.subtotalAmount)}</dd>
        </div>
        <div className="flex justify-between py-1">
          <dt className="text-rm-muted">Giảm giá ({sheet.discountPercent}%)</dt>
          <dd className="tabular-nums">-{formatCurrency(sheet.discountAmount)}</dd>
        </div>
        <div className="flex justify-between py-1 font-semibold">
          <dt>Khách phải trả</dt>
          <dd className="tabular-nums">{formatCurrency(sheet.payableAmount)}</dd>
        </div>
        {sheet.payableInWords && <p className="mt-1 text-xs text-rm-muted">{sheet.payableInWords}</p>}
      </dl>
    </div>
  );
}
