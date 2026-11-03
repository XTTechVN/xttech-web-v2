'use client';

import React from 'react';
import { Check, Clock, FileEdit, Megaphone, XCircle } from 'lucide-react';
import { cn } from '@/utils';

interface DocumentWorkflowStepperProps {
  status?: string;
  approvalStatus?: string | null;
  className?: string;
}

const STEPS = [
  { key: 'draft', label: 'Soạn thảo', icon: FileEdit },
  { key: 'pending', label: 'Chờ phê duyệt', icon: Clock },
  { key: 'approved', label: 'Đã phê duyệt', icon: Check },
  { key: 'published', label: 'Đã ban hành', icon: Megaphone },
] as const;

export const DocumentWorkflowStepper: React.FC<DocumentWorkflowStepperProps> = ({
  status = 'draft',
  approvalStatus,
  className,
}) => {
  const isRejected = status === 'rejected' || approvalStatus === 'rejected';

  const activeIndex = (() => {
    if (status === 'published' || status === 'superseded' || status === 'expired') return 3;
    if (status === 'approved' || approvalStatus === 'approved') return 2;
    if (status === 'pending' || status === 'pending_approval' || approvalStatus === 'pending') return 1;
    return 0;
  })();

  return (
    <div
      className={cn(
        'px-3.5 py-2.5 rounded-xl bg-slate-50/90 border border-slate-200/80 flex items-center justify-between gap-2 overflow-x-auto',
        className,
      )}
    >
      {STEPS.map((step, index) => {
        const Icon = step.icon;
        const isCompleted = index < activeIndex || (index === 3 && activeIndex === 3);
        const isCurrent = index === activeIndex && !isRejected;
        const isRejectedStep = isRejected && index === 1;

        return (
          <React.Fragment key={step.key}>
            <div className="flex items-center gap-2 shrink-0">
              <div
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors shrink-0',
                  isRejectedStep
                    ? 'bg-rose-100 text-rose-700 border border-rose-300'
                    : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                        ? 'bg-primary text-white ring-3 ring-primary/15'
                        : 'bg-slate-200/80 text-slate-500',
                )}
              >
                {isRejectedStep ? (
                  <XCircle size={13} />
                ) : isCompleted ? (
                  <Check size={13} />
                ) : (
                  <Icon size={12} />
                )}
              </div>
              <span
                className={cn(
                  'text-xs whitespace-nowrap',
                  isRejectedStep
                    ? 'font-semibold text-rose-700'
                    : isCompleted
                      ? 'font-semibold text-emerald-700'
                      : isCurrent
                        ? 'font-bold text-primary'
                        : 'font-medium text-slate-400',
                )}
              >
                {isRejectedStep ? 'Bị từ chối' : step.label}
              </span>
            </div>

            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 min-w-[16px] rounded-full transition-colors',
                  index < activeIndex ? 'bg-emerald-500' : 'bg-slate-200',
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

