'use client';

import React from 'react';
import {
  Calculator,
  CheckCircle2,
  FileText,
  Layers,
  Wrench,
} from 'lucide-react';
import type { ProjectDetail } from '@/types';

interface ProjectPipelineCardProps {
  project: ProjectDetail;
  quotationsCount: number;
  activeContractsCount: number;
  factoryProgressPercent: number;
  onSelectTab?: (tab: string) => void;
}

function getCurrentStepIndex(status: string): number {
  if (status === 'draft' || status === 'surveying') return 0;
  if (status === 'designing') return 1;
  if (status === 'quotation') return 2;
  if (status === 'contract') return 3;
  if (status === 'producing' || status === 'installing' || status === 'completed') return 4;
  return 1;
}

export function ProjectPipelineCard({
  project,
  quotationsCount,
  activeContractsCount,
  factoryProgressPercent,
  onSelectTab,
}: ProjectPipelineCardProps) {
  const currentStepIdx = getCurrentStepIndex(project.status);
  const stages = [
    {
      id: 'surveying',
      label: 'Khảo sát & Đo đạc',
      sub: project.address || 'Thông tin công trình',
      tab: 'overview',
      icon: CheckCircle2,
    },
    {
      id: 'positions',
      label: 'Thiết kế bóc tách',
      sub: `${project.totalPositions ?? 0} bộ cửa · ${project.floors?.length ?? 0} tầng`,
      tab: 'positions',
      icon: Layers,
    },
    {
      id: 'quotations',
      label: 'Dự toán báo giá',
      sub: quotationsCount > 0 ? `${quotationsCount} phương án` : 'Chưa lập báo giá',
      tab: 'quotations',
      icon: Calculator,
    },
    {
      id: 'contracts',
      label: 'Hợp đồng & Đặt cọc',
      sub: activeContractsCount > 0 ? `${activeContractsCount} hợp đồng` : 'Chờ ký kết',
      tab: 'contracts',
      icon: FileText,
    },
    {
      id: 'production',
      label: 'Gia công & Lắp đặt',
      sub: `${factoryProgressPercent.toFixed(0)}% tiến độ xưởng`,
      tab: 'production',
      icon: Wrench,
    },
  ];

  const progressPercent = Math.round(((currentStepIdx + 1) / stages.length) * 100);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-700 font-lexend">
          Tiến trình nghiệp vụ dự án
        </h3>
        <span className="text-[11px] font-semibold text-primary">
          Bước {currentStepIdx + 1}/{stages.length} ({progressPercent}%)
        </span>
      </div>

      <div className="rounded-md border border-slate-200/80 bg-white p-3.5 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          {stages.map((stage, idx) => {
            const isDone = idx < currentStepIdx;
            const isCurrent = idx === currentStepIdx;
            const Icon = stage.icon;

            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => onSelectTab?.(stage.tab)}
                className={`group relative rounded-lg border p-2.5 text-left transition-all cursor-pointer ${
                  isCurrent
                    ? 'border-primary bg-primary/[0.04] text-slate-900 ring-1 ring-primary/25 shadow-2xs'
                    : isDone
                      ? 'border-emerald-200/70 bg-emerald-50/40 text-slate-800 hover:bg-emerald-50/80'
                      : 'border-slate-200/60 bg-slate-50/50 text-slate-600 hover:bg-slate-100/70'
                }`}
              >
                <div className="mb-1.5 flex items-center justify-between">
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                      isCurrent
                        ? 'bg-primary text-white'
                        : isDone
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-white text-slate-400 border border-slate-200/60'
                    }`}
                  >
                    <Icon size={13} />
                  </div>
                  {isDone && (
                    <span className="h-2 w-2 rounded-full bg-emerald-500" title="Đã hoàn thành" />
                  )}
                  {isCurrent && (
                    <span
                      className="h-2 w-2 animate-pulse rounded-full bg-primary"
                      title="Đang thực hiện"
                    />
                  )}
                </div>

                <div className="min-w-0">
                  <span
                    className={`block truncate text-xs font-bold ${
                      isCurrent ? 'text-primary' : 'text-slate-800'
                    }`}
                  >
                    {stage.label}
                  </span>
                  <span className="mt-0.5 block truncate text-[10px] text-slate-500" title={stage.sub}>
                    {stage.sub}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

