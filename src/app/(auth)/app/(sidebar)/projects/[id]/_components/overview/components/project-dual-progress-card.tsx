'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Factory, Lightbulb, Wallet } from 'lucide-react';
import { getProjectOverview } from '@/actions';
import { Skeleton } from '@/components';
import type { ProgressStepCode } from '@/types';

const formatVnd = (value: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

interface ProjectDualProgressCardProps {
  projectId: number;
  onSelectTab?: (tab: string) => void;
}

function ProgressBar({ percent, className }: { percent: number; className: string }) {
  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
      <div className={`h-2.5 rounded-full transition-all ${className}`} style={{ width: `${Math.min(percent, 100)}%` }} />
    </div>
  );
}

/** Hai tiến độ độc lập: SẢN XUẤT & THI CÔNG (theo cửa) và THANH TOÁN (theo hợp đồng). */
export function ProjectDualProgressCard({ projectId, onSelectTab }: ProjectDualProgressCardProps) {
  const { data: overview, isLoading } = useQuery({
    queryKey: ['project_overview', projectId],
    queryFn: () => getProjectOverview(projectId),
    enabled: !!projectId,
  });

  if (isLoading || !overview) return <Skeleton className="h-44 w-full rounded-md" />;

  const { production, payment, nextActions } = overview;
  const statusEntries = (Object.entries(production.statusCounts) as [ProgressStepCode, number][]).filter(
    ([, count]) => count > 0,
  );

  return (
    <div className="space-y-1.5">
      <h3 className="font-lexend block text-xs font-semibold text-slate-700">
        Tiến độ dự án <span className="font-normal text-slate-400">(sản xuất và thanh toán tính riêng)</span>
      </h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={() => onSelectTab?.('production')}
          className="cursor-pointer space-y-2 rounded-md border border-slate-200/80 bg-white p-3.5 text-left shadow-2xs hover:border-primary/40"
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Factory size={14} className="text-primary" /> Sản xuất & thi công
            </span>
            <span className="text-xl font-bold text-slate-900">{production.percent}%</span>
          </div>
          <ProgressBar percent={production.percent} className="bg-primary" />
          <div className="text-[11px] text-slate-500">
            Xong xưởng {production.factoryPercent}% · {production.totalPositions} cửa · {production.totalAreaM2} m²
          </div>
          <div className="flex flex-wrap gap-1">
            {statusEntries.map(([status, count]) => (
              <span
                key={status}
                className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
              >
                {production.statusLabels[status]}: {count}
              </span>
            ))}
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab?.('contracts')}
          className="cursor-pointer space-y-2 rounded-md border border-slate-200/80 bg-white p-3.5 text-left shadow-2xs hover:border-amber-400/60"
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Wallet size={14} className="text-amber-600" /> Thanh toán
            </span>
            <span className="text-xl font-bold text-slate-900">{payment.percent}%</span>
          </div>
          <ProgressBar percent={payment.percent} className="bg-amber-500" />
          <div className="text-[11px] text-slate-500">
            {payment.hasSignedContract
              ? `Đã thu ${formatVnd(payment.collected)} / ${formatVnd(payment.contractTotal)}`
              : 'Chưa có hợp đồng đã ký'}
          </div>
          <div className="text-[11px] font-semibold text-slate-700">
            {payment.isFullyPaid ? 'Đã thu đủ' : `Còn phải thu: ${formatVnd(payment.remaining)}`}
          </div>
        </button>
      </div>

      {nextActions.length > 0 && (
        <div className="space-y-1 rounded-md border border-amber-200 bg-amber-50/60 p-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800">
            <Lightbulb size={12} /> Việc cần làm tiếp
          </div>
          <ul className="list-inside list-disc space-y-0.5 text-[11px] text-amber-900">
            {nextActions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
