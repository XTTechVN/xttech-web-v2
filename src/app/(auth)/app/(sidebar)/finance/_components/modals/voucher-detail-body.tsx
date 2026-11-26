'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react';
import { Alert, Badge } from '@/components';
import { getMyFinancePermissions, getVoucherStatutoryImpact } from '@/actions';
import {
  getTaxDeductibleBadge,
  STATUTORY_FILING_STATUS_MAP,
  VAT_RATE_MAP,
} from '@/config/finance';
import { formatCurrency, readVietnameseNumber } from '@/utils/currency';
import { getFileUrl } from '@/utils/string';
import type { VoucherDetail } from '@/types';

export interface VoucherDetailBodyProps {
  voucher: VoucherDetail;
}

export function VoucherDetailBody({ voucher }: VoucherDetailBodyProps) {
  const { data: myPerm = null } = useQuery({
    queryKey: ['finance', 'permissions', 'me'],
    queryFn: getMyFinancePermissions,
    staleTime: 60_000,
  });

  const { data: statutoryImpacts = [] } = useQuery({
    queryKey: ['finance', 'statutory', 'voucher-impact', voucher.id],
    queryFn: () => getVoucherStatutoryImpact(voucher.id),
    enabled: voucher.status === 'posted' && Boolean(myPerm?.canViewStatutoryTax),
    staleTime: 30_000,
  });

  const taxBadge = getTaxDeductibleBadge(voucher.isTaxDeductible);
  const isCashVoucher =
    voucher.voucherType === 'cash_receipt' || voucher.voucherType === 'cash_payment';
  const fundOrBankLabel = isCashVoucher
    ? 'Quỹ Tiền mặt (TK 1111)'
    : voucher.bankAccountNumber
      ? `${voucher.bankName || ''} - ${voucher.bankAccountNumber}`
      : '---';

  return (
    <div className="space-y-4 text-xs">
      {voucher.nonCashWarning && (
        <Alert variant="warning" title="Cảnh báo thanh toán tiền mặt ≥ ngưỡng quy định">
          {voucher.nonCashWarningMessage ||
            'Chứng từ chi tiền mặt có giá trị lớn (hoặc cộng dồn trong ngày ≥ 5 triệu), cần lưu ý điều kiện thanh toán không dùng tiền mặt khi kê khai thuế.'}
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
        <div>
          <div className="text-slate-400">Ngày chứng từ / Ghi sổ</div>
          <div className="font-semibold text-slate-900 mt-0.5">
            {voucher.voucherDate} / {voucher.postingDate}
          </div>
        </div>
        <div>
          <div className="text-slate-400">Hóa đơn GTGT &amp; Thuế TNDN</div>
          <div className="flex flex-wrap gap-1 mt-0.5">
            <Badge variant={voucher.hasValidInvoice ? 'info' : 'default'} size="sm">
              {voucher.hasValidInvoice ? 'Có HĐ GTGT' : 'Không HĐ'}
            </Badge>
            <Badge variant={taxBadge.variant} size="sm">
              {taxBadge.shortLabel || taxBadge.label}
            </Badge>
          </div>
        </div>
        <div>
          <div className="text-slate-400">Quỹ / Tài khoản NH</div>
          <div className="font-semibold text-slate-900 mt-0.5">{fundOrBankLabel}</div>
        </div>
        <div>
          <div className="text-slate-400">Đối tượng / Công trình</div>
          <div className="font-semibold text-slate-900 mt-0.5 truncate">
            {voucher.partnerName || voucher.contactName || '---'}
            {voucher.projectName ? ` • ${voucher.projectName}` : ''}
          </div>
        </div>
        <div className="sm:col-span-2 lg:col-span-4 pt-2 border-t border-slate-200">
          <span className="text-slate-400">Diễn giải: </span>
          <span className="font-medium text-slate-800">{voucher.description}</span>
        </div>
        {(voucher.approvedById || voucher.cashierConfirmedById) && (
          <div className="sm:col-span-2 lg:col-span-4 flex flex-wrap gap-4 pt-2 border-t border-slate-200 text-[11px]">
            {voucher.approvedById && (
              <div>
                <span className="text-slate-400">Duyệt chi nội bộ: </span>
                <span className="font-semibold text-sky-700">
                  {voucher.approvedByName || 'Quản lý'}
                </span>
                {voucher.approvalNote ? ` (${voucher.approvalNote})` : ''}
              </div>
            )}
            {voucher.cashierConfirmedById && (
              <div>
                <span className="text-slate-400">Thủ quỹ xác nhận: </span>
                <span className="font-semibold text-emerald-700">
                  {voucher.cashierConfirmedByName || 'Thủ quỹ'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-2.5 w-10 text-center">#</th>
                <th className="p-2.5">Diễn giải</th>
                <th className="p-2.5 w-24 text-center">TK Nợ</th>
                <th className="p-2.5 w-24 text-center">TK Có</th>
                <th className="p-2.5">Đối tượng / Công trình / KMCP</th>
                <th className="p-2.5 w-28 text-center">Thuế (B4)</th>
                <th className="p-2.5 w-36 text-right">Số tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {voucher.lines.map((line, idx) => {
                const lineBadge = getTaxDeductibleBadge(line.isTaxDeductible);
                return (
                  <tr key={line.id} className="hover:bg-slate-50/70">
                    <td className="p-2.5 text-center text-slate-500">{idx + 1}</td>
                    <td className="p-2.5 text-slate-800 font-medium">{line.description}</td>
                    <td className="p-2.5 text-center font-mono font-bold text-primary">
                      {line.debitAccountCode || line.debitAccountId}
                    </td>
                    <td className="p-2.5 text-center font-mono font-bold text-slate-700">
                      {line.creditAccountCode || line.creditAccountId}
                    </td>
                    <td className="p-2.5 text-slate-600">
                      {[
                        line.projectCode || line.projectName,
                        line.costItemName,
                        line.customerName || line.supplierName || line.employeeName,
                      ]
                        .filter(Boolean)
                        .join(' • ') || '---'}
                    </td>
                    <td className="p-2.5 text-center">
                      <Badge variant={lineBadge.variant} size="sm">
                        {lineBadge.shortLabel || lineBadge.label}
                      </Badge>
                    </td>
                    <td className="p-2.5 font-mono tabular-nums text-right font-semibold text-slate-900">
                      {formatCurrency(line.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-primary/5 border-t border-primary/20">
              <tr>
                <td colSpan={6} className="p-2.5 text-right font-semibold text-primary">
                  Tổng cộng ({voucher.amountInWords || readVietnameseNumber(Math.round(voucher.totalAmount))}):
                </td>
                <td className="p-2.5 font-mono tabular-nums text-right font-bold text-primary text-sm">
                  {formatCurrency(voucher.totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {voucher.taxInvoices.length > 0 && (
        <div className="space-y-1.5">
          <div className="font-semibold text-slate-700">Hóa đơn GTGT liên kết:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {voucher.taxInvoices.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white"
              >
                <div>
                  <div className="font-mono font-bold text-slate-900">
                    {inv.invoiceSeries}/{inv.invoiceNumber} ({inv.invoiceDate})
                  </div>
                  <div className="text-slate-500 truncate">
                    {inv.partnerTaxCode} — {inv.partnerName}
                  </div>
                </div>
                <div className="text-right font-mono tabular-nums">
                  <div className="text-slate-500">
                    VAT {VAT_RATE_MAP[inv.vatRate]?.shortLabel}: {formatCurrency(inv.vatAmount)}
                  </div>
                  <div className="font-bold text-primary">{formatCurrency(inv.totalAmount)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {voucher.attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {voucher.attachments.map((att, idx) => (
            <a
              key={`${att.fileUrl}-${idx}`}
              href={getFileUrl(att.fileUrl)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-primary/40 text-primary font-medium"
            >
              <ExternalLink size={13} />
              <span>{att.fileName}</span>
            </a>
          ))}
        </div>
      )}

      {statutoryImpacts.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-primary/5 border border-primary/20">
          <span className="font-semibold text-primary">Đang được tổng hợp trên hồ sơ thuế / BCTC:</span>
          {statutoryImpacts.map((imp) => {
            const st = STATUTORY_FILING_STATUS_MAP[imp.status] ?? STATUTORY_FILING_STATUS_MAP.draft;
            return (
              <Badge key={imp.filingId} variant={st.variant} size="sm">
                {imp.formCode} ({imp.periodType === 'quarter' ? `Q${imp.periodIndex}` : `T${imp.periodIndex}`}/{imp.taxYear}) — {st.shortLabel}
              </Badge>
            );
          })}
        </div>
      )}

      {voucher.voidReason && (
        <Alert variant="danger" title="Chứng từ đã hủy">
          Lý do: {voucher.voidReason}
        </Alert>
      )}
    </div>
  );
}
