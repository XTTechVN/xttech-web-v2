'use client';

import React from 'react';
import { BookCheck, Edit3, Eye, Printer, RotateCcw, XCircle } from 'lucide-react';
import { Badge } from '@/components';
import { getTaxDeductibleBadge, VOUCHER_STATUS_MAP } from '@/config/finance';
import { formatCurrency } from '@/utils/currency';
import type { VoucherSummary } from '@/types';

export interface BankVouchersTableProps {
  vouchers: VoucherSummary[];
  isLoading: boolean;
  busyId: number | null;
  totalIn: number;
  totalOut: number;
  onOpenVoucherDetail: (voucherId: number) => void;
  onPrint: (voucher: VoucherSummary) => void;
  onEditVoucher: (voucher: VoucherSummary) => void;
  onPostVoucher: (voucher: VoucherSummary) => void;
  onUnpostVoucher: (voucher: VoucherSummary) => void;
  onVoidVoucher: (voucher: VoucherSummary) => void;
}

export function BankVouchersTable({
  vouchers,
  isLoading,
  busyId,
  totalIn,
  totalOut,
  onOpenVoucherDetail,
  onPrint,
  onEditVoucher,
  onPostVoucher,
  onUnpostVoucher,
  onVoidVoucher,
}: BankVouchersTableProps) {
  return (
    <>
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Số CT</th>
                <th className="p-3">Ngày CT</th>
                <th className="p-3">TK Ngân hàng</th>
                <th className="p-3">Đối tượng / Nội dung</th>
                <th className="p-3">Hóa đơn &amp; Thuế (B4)</th>
                <th className="p-3 text-right">Báo Có (+ Thu)</th>
                <th className="p-3 text-right">UNC (- Chi)</th>
                <th className="p-3 text-center">Trạng thái</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    Đang tải chứng từ ngân hàng...
                  </td>
                </tr>
              ) : vouchers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    Chưa có chứng từ Báo Có / Ủy nhiệm chi nào.
                  </td>
                </tr>
              ) : (
                vouchers.map((v) => {
                  const statusMeta = VOUCHER_STATUS_MAP[v.status];
                  const taxBadge = getTaxDeductibleBadge(v.isTaxDeductible);
                  const isReceipt = v.voucherType === 'bank_receipt';
                  return (
                    <tr key={v.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {v.voucherNo}
                      </td>
                      <td className="p-3 whitespace-nowrap">{v.voucherDate}</td>
                      <td className="p-3">
                        <Badge variant={isReceipt ? 'success' : 'warning'} size="sm">
                          {isReceipt ? 'Báo Có' : 'UNC'}
                        </Badge>
                        {v.bankAccountNumber && (
                          <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                            {v.bankName} - {v.bankAccountNumber}
                          </div>
                        )}
                      </td>
                      <td className="p-3 max-w-[240px]">
                        <div className="font-semibold text-slate-800 truncate">{v.description}</div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {v.partnerName || v.contactName || '---'}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          <Badge variant={v.hasValidInvoice ? 'info' : 'default'} size="sm">
                            {v.hasValidInvoice ? 'Có HĐ' : 'Không HĐ'}
                          </Badge>
                          <Badge variant={taxBadge.variant} size="sm">
                            {taxBadge.shortLabel || taxBadge.label}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-3 font-mono tabular-nums text-right font-semibold text-emerald-700 whitespace-nowrap">
                        {isReceipt ? formatCurrency(v.totalAmount) : '-'}
                      </td>
                      <td className="p-3 font-mono tabular-nums text-right font-semibold text-rose-600 whitespace-nowrap">
                        {!isReceipt ? formatCurrency(v.totalAmount) : '-'}
                      </td>
                      <td className="p-3 text-center">
                        {statusMeta && (
                          <Badge variant={statusMeta.variant} size="sm">
                            {statusMeta.shortLabel}
                          </Badge>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onOpenVoucherDetail(v.id)}
                            className="p-1.5 text-slate-500 hover:text-primary rounded cursor-pointer"
                            title="Chi tiết"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            disabled={busyId === v.id}
                            onClick={() => onPrint(v)}
                            className="p-1.5 text-slate-500 hover:text-primary rounded cursor-pointer"
                            title="In UNC / Báo Có"
                          >
                            <Printer size={14} />
                          </button>
                          {v.status === 'draft' && (
                            <>
                              <button
                                type="button"
                                onClick={() => onEditVoucher(v)}
                                className="p-1.5 text-slate-500 hover:text-sky-600 rounded cursor-pointer"
                                title="Sửa"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => onPostVoucher(v)}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                                title="Ghi sổ cái"
                              >
                                <BookCheck size={14} />
                              </button>
                            </>
                          )}
                          {v.status === 'posted' && (
                            <button
                              type="button"
                              onClick={() => onUnpostVoucher(v)}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded cursor-pointer"
                              title="Bỏ ghi sổ"
                            >
                              <RotateCcw size={14} />
                            </button>
                          )}
                          {v.status !== 'voided' && (
                            <button
                              type="button"
                              onClick={() => onVoidVoucher(v)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                              title="Hủy phiếu"
                            >
                              <XCircle size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot className="bg-primary/5 border-t border-primary/20">
              <tr>
                <td colSpan={5} className="p-3 text-right font-bold text-primary">
                  TỔNG PHÁT SINH NGÂN HÀNG:
                </td>
                <td className="p-3 font-mono tabular-nums text-right font-bold text-primary">
                  {formatCurrency(totalIn)}
                </td>
                <td className="p-3 font-mono tabular-nums text-right font-bold text-primary">
                  {formatCurrency(totalOut)}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-2.5">
        {vouchers.map((v) => {
          const isReceipt = v.voucherType === 'bank_receipt';
          const statusMeta = VOUCHER_STATUS_MAP[v.status];
          const taxBadge = getTaxDeductibleBadge(v.isTaxDeductible);
          return (
            <div
              key={v.id}
              onClick={() => onOpenVoucherDetail(v.id)}
              className="p-3 rounded-xl bg-white border border-slate-200 space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-xs text-slate-900">{v.voucherNo}</span>
                <div className="flex items-center gap-1">
                  <Badge variant={taxBadge.variant} size="sm">
                    {taxBadge.shortLabel}
                  </Badge>
                  {statusMeta && (
                    <Badge variant={statusMeta.variant} size="sm">
                      {statusMeta.shortLabel}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-xs font-medium text-slate-800">{v.description}</div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                <span className="text-slate-500">
                  {v.voucherDate} • {v.bankAccountNumber || 'NH'}
                </span>
                <span
                  className={`font-mono tabular-nums font-bold ${
                    isReceipt ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {isReceipt ? '+' : '-'}
                  {formatCurrency(v.totalAmount)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
