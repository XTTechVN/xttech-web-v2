import React from 'react';
import type { ProjectProgressMatrix } from '@/types';

interface ProductionSummaryCardsProps {
  matrix?: ProjectProgressMatrix;
  fallbackTotal: number;
}

interface ProgressCardProps {
  label: string;
  value: number;
  textClass: string;
  barClass: string;
}

function ProgressCard({ label, value, textClass, barClass }: ProgressCardProps) {
  return (
    <div className="rounded-xl border border-slate-200/60 bg-white p-4 shadow-xs">
      <span className={`block text-[10px] font-bold uppercase ${textClass}`}>{label}</span>
      <span className={`mt-1 block font-mono text-2xl font-bold ${textClass}`}>
        {value.toFixed(1)}%
      </span>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barClass}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function ProductionSummaryCards({ matrix, fallbackTotal }: ProductionSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-xl border border-slate-200/60 bg-white p-4 shadow-xs">
        <span className="block text-[10px] font-bold uppercase text-slate-400">
          TỔNG SỐ BỘ CỬA
        </span>
        <span className="mt-1 block font-mono text-2xl font-bold text-slate-800">
          {matrix?.totalPositions ?? fallbackTotal} bộ
        </span>
        <span className="mt-1 block text-[11px] text-slate-400">Quy mô công trình</span>
      </div>
      <ProgressCard
        label="TIẾN ĐỘ SẢN XUẤT (XƯỞNG)"
        value={matrix?.factoryProgressPercent ?? 0}
        textClass="text-primary"
        barClass="bg-primary"
      />
      <ProgressCard
        label="TIẾN ĐỘ TỔNG THỂ (M² TRỌNG SỐ)"
        value={matrix?.overallWeightedProgressPercent ?? 0}
        textClass="text-emerald-600"
        barClass="bg-emerald-500"
      />
    </div>
  );
}

