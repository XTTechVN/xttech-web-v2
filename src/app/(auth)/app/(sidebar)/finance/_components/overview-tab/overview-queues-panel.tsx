'use client';

import React from 'react';
import {
  BookCheck,
  Clock,
  Eye,
  Inbox,
  ShieldAlert,
} from 'lucide-react';
import { Alert, Badge } from '@/components';
import {
  getTaxDeductibleBadge,
  VOUCHER_STATUS_MAP,
  VOUCHER_TYPE_MAP,
} from '@/config/finance';
import { formatCurrency } from '@/utils/currency';
import type { FinanceDashboard, FinanceTabKey } from '@/types';

export interface OverviewQueuesPanelProps {
  dashboard: FinanceDashboard;
  onOpenVoucherDetail: (voucherId: number) => void;
  onNavigateTab: (tab: FinanceTabKey) => void;
}

export function OverviewQueuesPanel({
  dashboard,
  onOpenVoucherDetail,
  onNavigateTab,
}: OverviewQueuesPanelProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-5 space-y-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">
            Hàng chờ xử lý &amp; Cảnh báo Thuế
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => onNavigateTab('cash')}
              className="flex items-center justify-between p-3 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-50 transition text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Clock size={16} className="text-amber-600 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-slate-900">
                    Phiếu Tiền mặt Nháp chờ ghi sổ
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                    Tổng giá trị: {formatCurrency(dashboard.pendingCashDraftAmount)}
                  </div>
                </div>
              </div>
              <Badge variant="warning" size="md" pill>
                {dashboard.pendingCashDraftCount}
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('cash')}
              className="flex items-center justify-between p-3 rounded-xl border border-sky-200 bg-sky-50/60 hover:bg-sky-50 transition text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <BookCheck size={16} className="text-sky-600 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-slate-900">
                    Chứng từ Nháp chờ Kế toán ghi sổ
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Kiểm tra hóa đơn GTGT &amp; ghi Sổ cái
                  </div>
                </div>
              </div>
              <Badge variant="info" size="md" pill>
                {dashboard.pendingPostCount}
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('ar_ap')}
              className="flex items-center justify-between p-3 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Inbox size={16} className="text-primary shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-slate-900">
                    Hàng chờ bán tự động (HĐ / Kho / Kính)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Nhấn để nạp nhanh thành phiếu nháp
                  </div>
                </div>
              </div>
              <Badge variant="primary" size="md" pill>
                {dashboard.pendingSourceQueueCount}
              </Badge>
            </button>
          </div>

          {dashboard.nonCashWarningCount > 0 ? (
            <Alert variant="danger" title={`Cảnh báo ${dashboard.nonCashWarningCount} phiếu chi tiền mặt lớn`}>
              Có chứng từ chi tiền mặt đạt hoặc vượt ngưỡng thanh toán không dùng tiền mặt (5 triệu đồng). Kiểm tra tại tab Thuế &amp; HĐĐT để xử lý chỉ tiêu B4 kịp thời.
            </Alert>
          ) : (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
              <ShieldAlert size={15} className="text-emerald-600 shrink-0" />
              <span>Không có chứng từ chi tiền mặt vượt ngưỡng rủi ro thuế.</span>
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-7 p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Chứng từ phát sinh gần đây</h3>
          <button
            type="button"
            onClick={() => onNavigateTab('cash')}
            className="text-xs font-semibold text-primary hover:underline cursor-pointer"
          >
            Xem tất cả →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Số CT</th>
                <th className="p-2.5">Ngày</th>
                <th className="p-2.5">Loại / Diễn giải</th>
                <th className="p-2.5">HĐ &amp; Thuế</th>
                <th className="p-2.5 text-right">Số tiền</th>
                <th className="p-2.5 text-center">Trạng thái</th>
                <th className="p-2.5 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dashboard.recentVouchers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400">
                    Chưa có chứng từ nào trong kỳ.
                  </td>
                </tr>
              ) : (
                dashboard.recentVouchers.map((v) => {
                  const typeMeta = VOUCHER_TYPE_MAP[v.voucherType];
                  const statusMeta = VOUCHER_STATUS_MAP[v.status];
                  const taxBadge = getTaxDeductibleBadge(v.isTaxDeductible);
                  return (
                    <tr
                      key={v.id}
                      onClick={() => onOpenVoucherDetail(v.id)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="p-2.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {v.voucherNo}
                      </td>
                      <td className="p-2.5 text-slate-500 whitespace-nowrap">{v.voucherDate}</td>
                      <td className="p-2.5 max-w-[220px]">
                        <div className="font-semibold text-slate-800 truncate">{v.description}</div>
                        <div className="text-[11px] text-slate-400">
                          {typeMeta?.shortLabel || v.voucherType}
                          {v.partnerName || v.contactName ? ` • ${v.partnerName || v.contactName}` : ''}
                        </div>
                      </td>
                      <td className="p-2.5">
                        <div className="flex flex-wrap gap-1">
                          <Badge variant={v.hasValidInvoice ? 'info' : 'default'} size="sm">
                            {v.hasValidInvoice ? 'Có HĐ' : 'Không HĐ'}
                          </Badge>
                          <Badge variant={taxBadge.variant} size="sm">
                            {taxBadge.shortLabel || taxBadge.label}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-2.5 font-mono tabular-nums text-right font-bold text-primary whitespace-nowrap">
                        {formatCurrency(v.totalAmount)}
                      </td>
                      <td className="p-2.5 text-center">
                        {statusMeta && (
                          <Badge variant={statusMeta.variant} size="sm">
                            {statusMeta.shortLabel}
                          </Badge>
                        )}
                      </td>
                      <td className="p-2.5 text-right text-slate-400">
                        <Eye size={14} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
