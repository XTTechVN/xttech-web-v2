'use client';

import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { formatAccessoryUnit, type HardwareWarningItem, type HardwareWarningSeverity } from '@/types';
import { HARDWARE_WARNING_SEVERITY_STYLES, HARDWARE_WARNING_TARGET_MAP } from '@/config';
import { cn } from '@/utils';

interface HardwareWarningsBannerProps {
  warnings?: HardwareWarningItem[] | null;
  fallbackUnconfigured?: boolean;
  compact?: boolean;
  className?: string;
}

export const HardwareWarningsBanner: React.FC<HardwareWarningsBannerProps> = ({
  warnings,
  fallbackUnconfigured = false,
  compact = false,
  className,
}) => {
  const list = warnings ?? [];

  if (list.length > 0) {
    const primarySeverity: HardwareWarningSeverity = list.some((w) => w.severity === 'warning')
      ? 'warning'
      : 'info';
    const styles = HARDWARE_WARNING_SEVERITY_STYLES[primarySeverity];
    const HeaderIcon = primarySeverity === 'warning' ? AlertTriangle : Info;

    return (
      <div
        className={cn(
          'rounded-xl border text-xs shadow-2xs',
          compact ? 'p-2.5 space-y-1.5' : 'p-3.5 space-y-2',
          styles.containerClass,
          className
        )}
      >
        <div className="flex items-center gap-1.5 font-bold">
          <HeaderIcon size={compact ? 14 : 15} className={cn('shrink-0', styles.iconClass)} />
          <span>Cảnh báo thiếu vật tư theo kết cấu cửa ({list.length})</span>
        </div>

        <ul className="space-y-1.5">
          {list.map((w, idx) => {
            const itemStyles = HARDWARE_WARNING_SEVERITY_STYLES[w.severity] || styles;
            const targetLabel = HARDWARE_WARNING_TARGET_MAP[w.target] || w.target;
            const unitLabel = formatAccessoryUnit(w.unit) || w.unit;
            const tooltip = w.requiredQty > 0
              ? `Cần: ${w.requiredQty} · Đã chọn: ${w.selectedQty} · Thiếu: ${w.shortageQty} ${unitLabel}`
              : undefined;
            return (
              <li key={`${w.code}-${idx}`} title={tooltip} className="flex items-start gap-2 text-[11px] leading-relaxed">
                <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-semibold border shrink-0 mt-0.5 whitespace-nowrap', itemStyles.badgeClass)}>
                  {targetLabel}
                </span>
                <span className={itemStyles.textClass}>{w.message}</span>
              </li>
            );
          })}
        </ul>

        <p className={cn('text-[10px] italic opacity-85 pt-0.5', styles.textClass)}>
          Hệ thống giữ nguyên vật tư và đơn giá gốc của gói combo bạn đã chọn.
        </p>
      </div>
    );
  }

  if (!fallbackUnconfigured) return null;

  const styles = HARDWARE_WARNING_SEVERITY_STYLES.warning;
  return (
    <div className={cn('rounded-xl border text-xs flex items-start gap-2', compact ? 'p-2.5' : 'p-3', styles.containerClass, className)}>
      <AlertTriangle size={15} className={cn('shrink-0 mt-0.5', styles.iconClass)} />
      <div className="space-y-0.5">
        <p className="font-bold">Chưa cấu hình con ke cụ thể từ hãng</p>
        <p className={cn('text-[11px]', styles.textClass)}>
          Các vị trí liên kết góc chưa được gán đủ mã con ke trong gói phụ kiện để lấy đơn giá thật.
        </p>
      </div>
    </div>
  );
};
