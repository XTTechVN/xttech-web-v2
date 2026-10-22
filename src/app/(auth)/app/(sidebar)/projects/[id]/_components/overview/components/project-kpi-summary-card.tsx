'use client';

import React from 'react';
import { ArrowUpRight, Calculator, FileSignature, Wallet, } from 'lucide-react';
import type {
  ProgressStepCode,
  ProjectLedgerSummary,
  ProjectProgressMatrix,
  ProjectQuotationItem,
} from '@/types';

interface ProjectKpiSummaryCardProps {
  activeQuotation: ProjectQuotationItem | null;
  quotationsCount: number;
  activeContractsCount: number;
  ledgerSummary?: ProjectLedgerSummary;
  progressMatrix?: ProjectProgressMatrix;
  stepCounts: Record<ProgressStepCode, number>;
  fallbackTotalPositions: number;
  onSelectTab?: (tab: string) => void;
}

const formatCurrency = (value?: number | null): string =>
  `${Math.round(value ?? 0).toLocaleString('vi-VN')} đ`;

export function ProjectKpiSummaryCard({
  activeQuotation,
  quotationsCount,
  activeContractsCount,
  ledgerSummary,
  onSelectTab,
}: ProjectKpiSummaryCardProps) {
  const totalContractValue = ledgerSummary?.totalContractValue ?? 0;
  const totalCollected = ledgerSummary?.totalCollected ?? 0;
  const remainingDebt = ledgerSummary?.remainingDebt ?? 0;
  const collectionRate =
    totalContractValue > 0 ? Math.min(100, Math.round((totalCollected / totalContractValue) * 100)) : 0;


  return (
    <div className="space-y-5">
      {/* 1. Khối Tài chính: Báo giá - Hợp đồng - Sổ cái thanh toán */}
      <div className="space-y-1.5">
        <h3 className="text-xs font-semibold text-slate-700 font-lexend">
          Tài chính &amp; Hợp đồng
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Card Báo giá */}
          <button
            type="button"
            onClick={() => onSelectTab?.('quotations')}
            className="group rounded-md border border-slate-200/80 bg-white p-3.5 text-left shadow-2xs transition-all hover:border-primary/40 cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                <Calculator size={13} className="text-primary" />
                Dự toán báo giá
              </span>
              <ArrowUpRight
                size={13}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
              />
            </div>
            <div className="mt-2 font-mono text-base font-bold text-slate-900">
              {activeQuotation ? formatCurrency(activeQuotation.totalAmount) : 'Chưa lập'}
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
              <span>
                {activeQuotation
                  ? `${activeQuotation.code} (${activeQuotation.isSelected ? 'Đang chọn' : 'Bản nháp'})`
                  : 'Chưa có phương án'}
              </span>
              <span className="font-semibold text-slate-600">{quotationsCount} bản</span>
            </div>
          </button>

          {/* Card Hợp đồng */}
          <button
            type="button"
            onClick={() => onSelectTab?.('contracts')}
            className="group rounded-md border border-slate-200/80 bg-white p-3.5 text-left shadow-2xs transition-all hover:border-primary/40 cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                <FileSignature size={13} className="text-indigo-600" />
                Giá trị hợp đồng
              </span>
              <ArrowUpRight
                size={13}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
              />
            </div>
            <div className="mt-2 font-mono text-base font-bold text-slate-900">
              {formatCurrency(totalContractValue)}
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
              <span>Hợp đồng hiệu lực</span>
              <span className="font-semibold text-slate-600">{activeContractsCount} hợp đồng</span>
            </div>
          </button>

          {/* Card Thanh toán & Công nợ */}
          <button
            type="button"
            onClick={() => onSelectTab?.('contracts')}
            className="group rounded-md border border-slate-200/80 bg-white p-3.5 text-left shadow-2xs transition-all hover:border-primary/40 cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                <Wallet size={13} className="text-emerald-600" />
                Đã thu / Công nợ
              </span>
              <span className="font-mono text-[11px] font-bold text-emerald-600">
                {collectionRate}%
              </span>
            </div>
            <div className="mt-2 font-mono text-base font-bold text-emerald-600">
              {formatCurrency(totalCollected)}
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
              <span>Còn phải thu:</span>
              <span className="font-mono font-semibold text-amber-600">
                {formatCurrency(remainingDebt)}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
