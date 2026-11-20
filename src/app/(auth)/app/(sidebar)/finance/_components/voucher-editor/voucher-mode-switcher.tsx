'use client';

import React from 'react';
import { cn } from '@/utils/cn';
import {
  VOUCHER_EDITOR_MODES,
  type VoucherEditorMode,
} from './voucher-editor.constants';

export interface VoucherModeSwitcherProps {
  mode: VoucherEditorMode;
  onChange: (mode: VoucherEditorMode) => void;
  disabled?: boolean;
}

export function VoucherModeSwitcher({
  mode,
  onChange,
  disabled = false,
}: VoucherModeSwitcherProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
      {VOUCHER_EDITOR_MODES.map((item) => {
        const Icon = item.icon;
        const isActive = mode === item.value;
        return (
          <button
            key={item.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(item.value)}
            className={cn(
              'flex items-start gap-3 p-3 rounded-lg text-left transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
              isActive
                ? 'bg-white text-primary shadow-sm ring-1 ring-primary/25'
                : 'text-slate-600 hover:bg-white/60 hover:text-slate-900',
            )}
          >
            <div
              className={cn(
                'p-2 rounded-lg shrink-0',
                isActive ? 'bg-primary text-white' : 'bg-slate-200/70 text-slate-600',
              )}
            >
              <Icon size={17} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold leading-tight">{item.label}</div>
              <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                {item.subtitle}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
