'use client';

import React from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  Info,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { Badge, StatsCard } from '@/components';
import { formatCurrency } from '@/utils/currency';
import type { FinanceDashboard, FinanceTabKey } from '@/types';

export interface OverviewKpiGridProps {
  dashboard: FinanceDashboard;
  onNavigateTab: (tab: FinanceTabKey) => void;
}

export function OverviewKpiGrid({ dashboard, onNavigateTab }: OverviewKpiGridProps) {
  const hasTaxImpact =
    dashboard.nonDeductibleExpenseTotal > 0 ||
    dashboard.nonDeductibleInventoryWipTotal > 0 ||
    dashboard.taxSavingsLostEstimate > 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatsCard
          title="Quỹ Tiền mặt (TK 1111)"
          value={formatCurrency(dashboard.cashBalance)}
          icon={<Wallet size={18} />}
          onClick={() => onNavigateTab('cash')}
        />
        <StatsCard
          title="Tiền gửi Ngân hàng (112)"
          value={formatCurrency(dashboard.totalBankBalance)}
          icon={<Building2 size={18} />}
          onClick={() => onNavigateTab('bank')}
        />
        <StatsCard
          title="Doanh thu kỳ"
          value={formatCurrency(dashboard.revenueTotal)}
          icon={<TrendingUp size={18} />}
          onClick={() => onNavigateTab('reports')}
        />
        <StatsCard
          title="Chi phí kỳ"
          value={formatCurrency(dashboard.expenseTotal)}
          icon={<ArrowUpRight size={18} />}
          onClick={() => onNavigateTab('reports')}
        />
        <StatsCard
          title="Phải thu KH (TK 131)"
          value={formatCurrency(dashboard.totalReceivable)}
          icon={<ArrowDownLeft size={18} />}
          onClick={() => onNavigateTab('ar_ap')}
        />
        <StatsCard
          title="Phải trả NCC (TK 331)"
          value={formatCurrency(dashboard.totalPayable)}
          icon={<ArrowUpRight size={18} />}
          onClick={() => onNavigateTab('ar_ap')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Quỹ Tiền mặt TK 1111 &amp; Ngân hàng
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigateTab('cash')}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                Sổ Quỹ →
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('bank')}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                Ngân hàng →
              </button>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900">Quỹ Tiền mặt (TK 1111)</span>
                {dashboard.pendingCashDraftCount > 0 && (
                  <Badge variant="warning" size="sm">
                    {dashboard.pendingCashDraftCount} nháp ({formatCurrency(dashboard.pendingCashDraftAmount)})
                  </Badge>
                )}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Tổng vốn bằng tiền (1111 + 112):{' '}
                <strong className="font-mono tabular-nums text-slate-800">
                  {formatCurrency(dashboard.totalLiquidFunds)}
                </strong>
              </div>
            </div>
            <div className="text-right font-mono tabular-nums shrink-0">
              <div className="text-sm font-bold text-primary">
                {formatCurrency(dashboard.cashBalance)}
              </div>
              <div className="text-[10px] text-slate-500">Số dư đã ghi sổ</div>
            </div>
          </div>

          {dashboard.bankAccountsSummary.length === 0 ? (
            <div className="text-xs text-slate-400 py-1">Chưa có tài khoản ngân hàng nào.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {dashboard.bankAccountsSummary.map((bank) => (
                <div
                  key={bank.id}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                >
                  <Badge variant="info" size="sm">
                    {bank.code}
                  </Badge>
                  <span className="font-medium text-slate-700">
                    {bank.bankName} ({bank.accountNumber})
                  </span>
                  <span className="font-mono tabular-nums font-bold text-primary">
                    {formatCurrency(bank.bookBalance)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Lãi / Lỗ Kế toán &amp; Dự toán Thuế TNDN
            </span>
            <button
              type="button"
              onClick={() => onNavigateTab('tax')}
              className="text-xs font-semibold text-primary hover:underline cursor-pointer shrink-0"
            >
              Chi tiết B4 / TNDN →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[11px] text-slate-500">Lợi nhuận kế toán</div>
              <div
                className={`font-mono tabular-nums text-right font-bold mt-0.5 ${
                  dashboard.accountingProfit >= 0 ? 'text-primary' : 'text-rose-600'
                }`}
              >
                {formatCurrency(dashboard.accountingProfit)}
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200">
              <div className="text-[11px] text-amber-800">CP không trừ B4</div>
              <div className="font-mono tabular-nums text-right font-bold text-amber-700 mt-0.5">
                {formatCurrency(dashboard.nonDeductibleExpenseTotal)}
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
              <div className="text-[11px] text-slate-500">Thuế TNDN ước tính</div>
              <div className="font-mono tabular-nums text-right font-bold text-slate-900 mt-0.5">
                {formatCurrency(dashboard.estimatedCitAmount)}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-xs">
            <div className="flex items-start gap-1.5 text-slate-700">
              <Info size={14} className="text-primary shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div>
                  Thu nhập chịu thuế:{' '}
                  <strong className="font-mono tabular-nums text-slate-900">
                    {formatCurrency(dashboard.taxableIncome)}
                  </strong>
                  {' • '}NVL/Dở dang không HĐ:{' '}
                  <strong className="font-mono tabular-nums text-amber-700">
                    {formatCurrency(dashboard.nonDeductibleInventoryWipTotal)}
                  </strong>
                </div>
                <div className="text-[11px] text-slate-500">
                  Chi phí thiếu hóa đơn hoặc chi tiền mặt ≥ 5tr bị cộng ngược vào thu nhập tính thuế (Chỉ tiêu B4).
                </div>
              </div>
            </div>
            <Badge variant={hasTaxImpact ? 'warning' : 'success'} size="sm">
              Thuế mất khấu trừ ước tính: {formatCurrency(dashboard.taxSavingsLostEstimate)}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
