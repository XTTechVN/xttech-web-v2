'use client';

import React, { useMemo } from 'react';
import { CheckCircle2, Eye, Printer, RotateCcw, Trash2 } from 'lucide-react';
import { Badge, Button } from '@/components';
import {
  getTaxDeductibleBadge,
  VOUCHER_STATUS_MAP,
  VOUCHER_TYPE_MAP,
} from '@/config/finance';
import type { VoucherSummary } from '@/types';
import { formatCurrency } from '@/utils';

interface JournalVouchersTableProps {
  vouchers: VoucherSummary[];
  busyId: number | null;
  onOpenVoucherDetail: (voucherId: number) => void;
  onPrint: (voucherId: number) => void;
  onPost: (voucherId: number) => void;
  onUnpost: (voucherId: number) => void;
  onDelete: (voucher: VoucherSummary) => void;
}

export function JournalVouchersTable({
  vouchers,
  busyId,
  onOpenVoucherDetail,
  onPrint,
  onPost,
  onUnpost,
  onDelete,
}: JournalVouchersTableProps) {
  const totalAmount = useMemo(
    () => vouchers.reduce((sum, v) => sum + v.totalAmount, 0),
    [vouchers],
  );

  return (
    <>
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">Số chứng từ</th>
                <th className="p-3">Ngày CT</th>
                <th className="p-3">Loại CT</th>
                <th className="p-3">Diễn giải &amp; Công trình</th>
                <th className="p-3">Tính hợp lệ thuế (B4)</th>
                <th className="p-3 text-right">Tổng tiền</th>
                <th className="p-3 text-center">Trạng thái</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vouchers.map((v) => {
                const typeMeta = VOUCHER_TYPE_MAP[v.voucherType];
                const statusMeta = VOUCHER_STATUS_MAP[v.status];
                const deductibleMeta = getTaxDeductibleBadge(v.isTaxDeductible);

                return (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onOpenVoucherDetail(v.id)}
                        className="font-mono font-bold text-primary hover:underline cursor-pointer"
                      >
                        {v.voucherNo}
                      </button>
                    </td>
                    <td className="p-3 font-mono whitespace-nowrap">{v.voucherDate.slice(0, 10)}</td>
                    <td className="p-3">
                      <Badge variant={typeMeta?.variant || 'default'} size="sm">
                        {typeMeta?.shortLabel || v.voucherType}
                      </Badge>
                    </td>
                    <td className="p-3 max-w-xs">
                      <div className="text-slate-900 font-medium line-clamp-2">{v.description}</div>
                      {v.projectName && (
                        <div className="text-[11px] text-primary mt-0.5">
                          CT: {v.projectCode ? `${v.projectCode} - ` : ''}
                          {v.projectName}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <Badge variant={deductibleMeta.variant} size="sm">
                        {deductibleMeta.shortLabel || deductibleMeta.label}
                      </Badge>
                      {!v.hasValidInvoice && (
                        <div className="text-[10px] text-slate-400 mt-0.5">Không có HĐ GTGT</div>
                      )}
                    </td>
                    <td className="p-3 font-mono tabular-nums text-right font-bold text-slate-900">
                      {formatCurrency(v.totalAmount)}
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant={statusMeta?.variant || 'default'} size="sm">
                        {statusMeta?.shortLabel || v.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="xs" onClick={() => onOpenVoucherDetail(v.id)} title="Xem chi tiết">
                          <Eye size={14} />
                        </Button>
                        <Button variant="ghost" size="xs" onClick={() => onPrint(v.id)} title="In chứng từ">
                          <Printer size={14} />
                        </Button>
                        {v.status === 'draft' && (
                          <>
                            <Button
                              variant="ghost"
                              size="xs"
                              disabled={busyId === v.id}
                              onClick={() => onPost(v.id)}
                              title="Ghi sổ cái"
                              className="text-emerald-700"
                            >
                              <CheckCircle2 size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="xs"
                              disabled={busyId === v.id}
                              onClick={() => onDelete(v)}
                              title="Xóa chứng từ nháp"
                              className="text-rose-600"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </>
                        )}
                        {v.status === 'posted' && (
                          <Button
                            variant="ghost"
                            size="xs"
                            disabled={busyId === v.id}
                            onClick={() => onUnpost(v.id)}
                            title="Hủy ghi sổ"
                            className="text-amber-700"
                          >
                            <RotateCcw size={14} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-primary/5 text-primary font-bold border-t-2 border-primary/20">
              <tr>
                <td colSpan={5} className="p-3 text-right uppercase">
                  Tổng cộng ({vouchers.length} chứng từ)
                </td>
                <td className="p-3 font-mono tabular-nums text-right text-sm">
                  {formatCurrency(totalAmount)}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {vouchers.map((v) => {
          const statusMeta = VOUCHER_STATUS_MAP[v.status];
          return (
            <div key={v.id} className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <button
                    type="button"
                    onClick={() => onOpenVoucherDetail(v.id)}
                    className="font-mono font-bold text-sm text-primary hover:underline cursor-pointer"
                  >
                    {v.voucherNo}
                  </button>
                  <div className="text-[11px] text-slate-500">{v.voucherDate.slice(0, 10)}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono tabular-nums font-bold text-slate-900">
                    {formatCurrency(v.totalAmount)}
                  </div>
                  <Badge variant={statusMeta?.variant || 'default'} size="sm">
                    {statusMeta?.shortLabel || v.status}
                  </Badge>
                </div>
              </div>
              <div className="text-xs text-slate-700 line-clamp-2">{v.description}</div>
              <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100">
                <Button variant="outline" size="xs" onClick={() => onOpenVoucherDetail(v.id)}>
                  Chi tiết
                </Button>
                {v.status === 'draft' && (
                  <Button variant="primary" size="xs" disabled={busyId === v.id} onClick={() => onPost(v.id)}>
                    Ghi sổ
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
