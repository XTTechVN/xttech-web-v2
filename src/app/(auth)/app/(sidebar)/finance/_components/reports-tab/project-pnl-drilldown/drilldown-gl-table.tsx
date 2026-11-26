'use client';

import React from 'react';
import { Eye } from 'lucide-react';
import { Badge } from '@/components';
import {
  getTaxDeductibleBadge,
  PROJECT_PNL_COST_BUCKET_LABELS,
  VOUCHER_TYPE_MAP,
} from '@/config/finance';
import type { ProjectPnlDrilldownItem } from '@/types';
import { cn, formatCurrency } from '@/utils';

interface DrilldownGlTableProps {
  items: ProjectPnlDrilldownItem[];
  filteredTotal: number;
  overallTotal: number;
  hasSearch: boolean;
  onOpenVoucherDetail: (voucherId: number) => void;
}

export function DrilldownGlTable({
  items,
  filteredTotal,
  overallTotal,
  hasSearch,
  onOpenVoucherDetail,
}: DrilldownGlTableProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-3 whitespace-nowrap">Ngày GS</th>
              <th className="p-3 whitespace-nowrap">Số CT</th>
              <th className="p-3 whitespace-nowrap">TK / TK ĐƯ</th>
              <th className="p-3">Nhóm CP / Khoản mục</th>
              <th className="p-3">Diễn giải &amp; Đối tượng</th>
              <th className="p-3 text-center whitespace-nowrap">Thuế (B4)</th>
              <th className="p-3 text-right whitespace-nowrap">Số tiền (VNĐ)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  Không có bút toán chứng từ phù hợp.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const voucherMeta = item.voucherType
                  ? VOUCHER_TYPE_MAP[item.voucherType]
                  : undefined;
                const deductibleMeta = getTaxDeductibleBadge(
                  Boolean(item.isTaxDeductible),
                );
                const bucketLabel = item.costBucket
                  ? PROJECT_PNL_COST_BUCKET_LABELS[item.costBucket] || item.costBucket
                  : null;
                return (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono whitespace-nowrap">
                      {item.entryDate.slice(0, 10)}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {item.voucherId ? (
                        <button
                          type="button"
                          onClick={() => onOpenVoucherDetail(item.voucherId!)}
                          className="inline-flex items-center gap-1 font-mono font-bold text-primary hover:underline cursor-pointer"
                          title="Mở chi tiết chứng từ"
                        >
                          <Eye size={12} />
                          {item.documentNo}
                        </button>
                      ) : (
                        <span className="font-mono font-bold text-slate-900">
                          {item.documentNo}
                        </span>
                      )}
                      {voucherMeta && (
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {voucherMeta.shortLabel || voucherMeta.label}
                        </div>
                      )}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 font-mono">
                        <span className="font-bold text-slate-900">
                          {item.accountCode || '--'}
                        </span>
                        <span className="text-slate-400">/</span>
                        <Badge variant="default" size="sm">
                          {item.contraAccountCode || '--'}
                        </Badge>
                      </div>
                      {item.accountName && (
                        <div
                          className="text-[10px] text-slate-400 max-w-[160px] truncate mt-0.5"
                          title={item.accountName}
                        >
                          {item.accountName}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      {bucketLabel && (
                        <div className="font-medium text-slate-800">{bucketLabel}</div>
                      )}
                      {item.costItemName && (
                        <div className="text-[11px] text-slate-500">
                          {item.costItemName}
                        </div>
                      )}
                      {!bucketLabel && !item.costItemName && (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="p-3 max-w-xs">
                      <div className="text-slate-900 font-medium line-clamp-2">
                        {item.description}
                      </div>
                      {item.partnerName && (
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {item.partnerName}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <Badge variant={deductibleMeta.variant} size="sm">
                        {deductibleMeta.shortLabel || deductibleMeta.label}
                      </Badge>
                    </td>
                    <td
                      className={cn(
                        'p-3 font-mono tabular-nums text-right font-bold whitespace-nowrap',
                        item.amount < 0 ? 'text-rose-700' : 'text-slate-900',
                      )}
                    >
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot className="bg-primary/5 text-primary font-bold border-t-2 border-primary/20">
            <tr>
              <td colSpan={6} className="p-3 text-right uppercase">
                {hasSearch
                  ? `Tổng theo bộ lọc (${items.length} dòng — Tổng gốc ${formatCurrency(overallTotal)})`
                  : `Tổng cộng (${items.length} bút toán)`}
              </td>
              <td className="p-3 font-mono tabular-nums text-right text-sm whitespace-nowrap">
                {formatCurrency(filteredTotal)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
