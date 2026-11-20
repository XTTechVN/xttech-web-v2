'use client';

import React from 'react';
import { Eye } from 'lucide-react';
import { Badge, Button } from '@/components';
import { VOUCHER_STATUS_MAP, VOUCHER_TYPE_MAP } from '@/config/finance';
import type { VoucherSummary } from '@/types';
import { formatCurrency } from '@/utils';

interface EmployeeAdvanceVoucherListProps {
  vouchers: VoucherSummary[];
  onOpenVoucherDetail: (voucherId: number) => void;
}

export function EmployeeAdvanceVoucherList({
  vouchers,
  onOpenVoucherDetail,
}: EmployeeAdvanceVoucherListProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
        <h4 className="text-sm font-bold text-slate-900">
          Chứng từ Tạm ứng / Thanh toán của Nhân viên ({vouchers.length})
        </h4>
      </div>
      {vouchers.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500">
          Chưa có phiếu thu/chi gắn đối tượng nhân viên.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
          {vouchers.map((v) => {
            const statusMeta = VOUCHER_STATUS_MAP[v.status];
            const typeMeta = VOUCHER_TYPE_MAP[v.voucherType];
            return (
              <div key={v.id} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs text-slate-900">
                      {v.voucherNo}
                    </span>
                    <Badge variant={typeMeta?.variant || 'default'} size="sm">
                      {typeMeta?.shortLabel || v.voucherType}
                    </Badge>
                    <Badge variant={statusMeta?.variant || 'default'} size="sm">
                      {statusMeta?.shortLabel || v.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-700 truncate">
                    {v.contactName || v.partnerName || 'Nhân viên'} — {v.description}
                  </div>
                  <div className="text-[11px] text-slate-400">{v.voucherDate.slice(0, 10)}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono tabular-nums font-bold text-xs text-slate-900">
                    {formatCurrency(v.totalAmount)}
                  </span>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => onOpenVoucherDetail(v.id)}
                    leftIcon={<Eye size={13} />}
                  >
                    Xem
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
