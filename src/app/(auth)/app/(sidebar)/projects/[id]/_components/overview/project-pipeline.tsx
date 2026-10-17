'use client';

import React from 'react';
import { 
  CheckCircle2, 
  Layers, 
  Calculator, 
  FileText, 
  Wrench, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface ProjectPipelineProps {
  currentStatus: string;
  onSelectTab: (tab: string) => void;
}

const STAGES = [
  { id: 'surveying', label: 'Khảo sát & Đo đạc', sub: 'Lấy số đo ô chờ', tab: 'overview', icon: CheckCircle2 },
  { id: 'positions', label: 'Thiết kế bóc tách', sub: '28 bộ cửa', tab: 'positions', icon: Layers },
  { id: 'quotations', label: 'Dự toán báo giá', sub: '2 phương án', tab: 'quotations', icon: Calculator },
  { id: 'contracts', label: 'Hợp đồng & Đặt cọc', sub: 'Chốt thương thảo', tab: 'contracts', icon: FileText },
  { id: 'production', label: 'Gia công sản xuất', sub: 'KCS xuất xưởng', tab: 'production', icon: Wrench },
];

export function ProjectPipeline({ currentStatus, onSelectTab }: ProjectPipelineProps) {
  // Xác định bước hiện tại
  let currentStepIdx = 1; // default thiết kế
  if (currentStatus === 'draft' || currentStatus === 'surveying') currentStepIdx = 0;
  else if (currentStatus === 'designing') currentStepIdx = 1;
  else if (currentStatus === 'quotation') currentStepIdx = 2;
  else if (currentStatus === 'contract') currentStepIdx = 3;
  else if (currentStatus === 'producing' || currentStatus === 'installing' || currentStatus === 'completed') currentStepIdx = 4;

  const progressPercent = Math.round(((currentStepIdx + 1) / STAGES.length) * 100);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 font-lexend flex items-center gap-2">
            Tiến trình nghiệp vụ dự án
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-primary border border-teal-200/60 font-sans">
              Bước {currentStepIdx + 1}/{STAGES.length} ({progressPercent}%)
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Quy trình chuẩn hóa từ khảo sát hiện trường đến sản xuất lắp đặt
          </p>
        </div>

        {/* Thanh progress bar thu nhỏ */}
        <div className="w-36 h-2 rounded-full bg-slate-100 overflow-hidden shrink-0">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500" 
            style={{ width: `${progressPercent}%` }} 
          />
        </div>
      </div>

      {/* 5 Bước kết nối */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
        {STAGES.map((stage, idx) => {
          const isDone = idx < currentStepIdx;
          const isCurrent = idx === currentStepIdx;
          const Icon = stage.icon;

          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => onSelectTab(stage.tab)}
              className={`p-3 rounded-xl border text-left transition-all relative group cursor-pointer ${
                isCurrent
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-primary/20'
                  : isDone
                  ? 'bg-teal-50/50 border-teal-200/70 text-slate-800 hover:bg-teal-50'
                  : 'bg-slate-50/60 border-slate-200/60 text-slate-600 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  isCurrent 
                    ? 'bg-white/10 text-teal-300' 
                    : isDone 
                    ? 'bg-teal-100 text-primary' 
                    : 'bg-white text-slate-400'
                }`}>
                  <Icon size={14} />
                </div>
                {isDone && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Đã hoàn thành" />
                )}
                {isCurrent && (
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" title="Đang thực hiện" />
                )}
              </div>

              <div className="min-w-0">
                <span className={`text-xs font-bold block truncate font-lexend ${
                  isCurrent ? 'text-white' : 'text-slate-900'
                }`}>
                  {stage.label}
                </span>
                <span className={`text-[10px] block mt-0.5 truncate ${
                  isCurrent ? 'text-slate-300' : 'text-slate-400'
                }`}>
                  {stage.sub}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
