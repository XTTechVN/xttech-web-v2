'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components';
import type { ProgressStepCode } from '@/types';
import { PROGRESS_STEP_LABEL } from '../utils';

interface DailyProgressActionBarProps {
  selectedCount: number;
  selectedStep: ProgressStepCode;
  nextStep: ProgressStepCode | null;
  isOutsourcedOnly: boolean;
  blockedHint: string | null;
  hideAdvanceButton: boolean;
  isPending: boolean;
  isAdmin: boolean;
  onAdvance: () => void;
  onOpenRevert: () => void;
  onClear: () => void;
}

export function DailyProgressActionBar({
  selectedCount,
  selectedStep,
  nextStep,
  isOutsourcedOnly,
  blockedHint,
  hideAdvanceButton,
  isPending,
  isAdmin,
  onAdvance,
  onOpenRevert,
  onClear,
}: DailyProgressActionBarProps) {
  const nextStepLabel = (() => {
    if (!nextStep) return '';
    if (isOutsourcedOnly && nextStep === 'producing') return 'Đang nhập hàng / đặt NCC';
    if (isOutsourcedOnly && nextStep === 'factory_done') return 'Hàng NCC sẵn sàng lắp đặt';
    return PROGRESS_STEP_LABEL[nextStep];
  })();

  const actionButtonLabel = (() => {
    if (isOutsourcedOnly && nextStep === 'producing') return 'Báo đang nhập NCC';
    if (isOutsourcedOnly && nextStep === 'factory_done') return 'Hàng NCC đã về';
    return 'Cập nhật tiến độ';
  })();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 fixed bottom-4 left-1/2 z-40 flex max-w-[95vw] flex-wrap -translate-x-1/2 items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-900/95 px-4 py-2.5 text-white shadow-xl backdrop-blur-md transition-all duration-200">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
        <span className="text-xs font-medium">
          Đã chọn <b className="font-mono tabular-nums text-emerald-400">{selectedCount}</b> cửa ở
          mốc{' '}
          <span className="font-semibold text-slate-200">
            {PROGRESS_STEP_LABEL[selectedStep] || selectedStep}
          </span>
        </span>
      </div>

      {nextStep ? (
        <div className="flex items-center gap-1.5 border-l border-slate-700 pl-3 text-xs text-slate-300">
          <span>Mốc tiếp theo:</span>
          <span className="flex items-center gap-1 font-bold text-emerald-400">
            <ChevronRight size={13} />
            {nextStepLabel}
          </span>
        </div>
      ) : selectedStep === 'installed' ? (
        <Link
          href="?tab=acceptance"
          className="border-l border-slate-700 pl-3 text-[11px] font-semibold text-emerald-300 hover:underline"
        >
          Lắp xong → lập biên bản nghiệm thu (2 bên ký) ở tab Nghiệm thu
        </Link>
      ) : (
        <span className="border-l border-slate-700 pl-3 text-[11px] text-amber-300">
          {blockedHint ??
            (selectedStep === 'accepted'
              ? '(Đã nghiệm thu)'
              : selectedStep === 'surveyed'
                ? '(Chờ lập lệnh sản xuất)'
                : '(Chưa thể cập nhật tại đây)')}
        </span>
      )}

      <div className="flex items-center gap-2 pl-2">
        {!hideAdvanceButton && (
          <Button
            variant="primary"
            size="sm"
            disabled={!nextStep || isPending}
            loading={isPending}
            onClick={onAdvance}
            className="gap-1.5 text-xs font-semibold shadow-xs"
          >
            <CheckCircle2 size={14} />
            {actionButtonLabel}
          </Button>
        )}

        {isAdmin && selectedStep !== 'draft' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenRevert}
            className="text-xs font-semibold text-amber-300 hover:bg-slate-800"
            title="Lùi mốc (admin, bắt buộc lý do)"
          >
            Lùi mốc
          </Button>
        )}

        <button
          type="button"
          onClick={onClear}
          className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white cursor-pointer"
          title="Bỏ chọn"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
