'use client';

import React from 'react';
import { AlertCircle, Info, Smartphone } from 'lucide-react';
import { StaffDeviceDiagnostics } from '@/types';
import {
  buildDiagnosticSignals,
  DiagnosticSeverity,
  formatDeviceSummary,
} from './diagnostic-signals';

interface StaffDiagnosticsProps {
  diagnostics?: StaffDeviceDiagnostics;
  /** Giới hạn số tín hiệu hiển thị (dùng cho danh sách rút gọn) */
  maxSignals?: number;
  /** Ẩn dòng thông tin phiên bản app / thiết bị */
  hideDeviceSummary?: boolean;
}

const SEVERITY_CLASS_MAP: Record<DiagnosticSeverity, string> = {
  danger: 'bg-rose-50 text-rose-700 border-rose-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  info: 'bg-sky-50 text-sky-700 border-sky-200',
};

/** Hiển thị tín hiệu chẩn đoán thiết bị giúp admin xác định nguyên nhân nhân viên mất tín hiệu */
export function StaffDiagnostics({ diagnostics, maxSignals, hideDeviceSummary = false }: StaffDiagnosticsProps) {
  const signals = buildDiagnosticSignals(diagnostics);
  const visibleSignals = maxSignals ? signals.slice(0, maxSignals) : signals;
  const hiddenCount = signals.length - visibleSignals.length;
  const deviceSummary = hideDeviceSummary ? null : formatDeviceSummary(diagnostics);

  if (!diagnostics || (visibleSignals.length === 0 && !deviceSummary)) return null;

  return (
    <div className="space-y-1" data-testid="staff-diagnostics">
      {deviceSummary && (
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <Smartphone size={10} className="shrink-0" />
          <span className="truncate">{deviceSummary}</span>
        </div>
      )}

      {visibleSignals.map((signal) => (
        <div
          key={signal.id}
          className={`flex items-start gap-1 rounded-md border px-1.5 py-0.5 text-[10px] leading-snug ${SEVERITY_CLASS_MAP[signal.severity]}`}
        >
          {signal.severity === 'info' ? (
            <Info size={10} className="mt-px shrink-0" />
          ) : (
            <AlertCircle size={10} className="mt-px shrink-0" />
          )}
          <span>{signal.label}</span>
        </div>
      ))}

      {hiddenCount > 0 && (
        <div className="text-[10px] text-slate-400">+{hiddenCount} tín hiệu khác (chọn nhân viên để xem đầy đủ)</div>
      )}
    </div>
  );
}
