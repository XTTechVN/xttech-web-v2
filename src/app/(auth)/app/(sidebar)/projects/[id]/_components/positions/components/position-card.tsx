'use client';

import React from 'react';
import { BadgeDollarSign, Copy, Edit, ImageOff, PenTool, QrCode, Ruler, Trash2 } from 'lucide-react';
import { Badge, DoorThumbnail } from '@/components';
import { DOOR_FULFILLMENT_TYPE_MAP, DOOR_STATUS_MAP, POSITION_COST_STATUS_MAP } from '@/config';
import type { ProjectDoorPosition } from '@/types';
import { resolvePositionVisual } from '@/utils';

interface PositionCardProps {
  position: ProjectDoorPosition;
  isDuplicating: boolean;
  onOpenStudio: (pos: ProjectDoorPosition) => void;
  onOpenSupplierQuote: (pos: ProjectDoorPosition) => void;
  onEdit: (pos: ProjectDoorPosition) => void;
  onMeasure: (pos: ProjectDoorPosition) => void;
  onQrCode: (pos: ProjectDoorPosition) => void;
  onDuplicate: (pos: ProjectDoorPosition) => void;
  onDelete: (pos: ProjectDoorPosition) => void;
}

export function PositionCard({
  position: pos,
  isDuplicating,
  onOpenStudio,
  onOpenSupplierQuote,
  onEdit,
  onMeasure,
  onQrCode,
  onDuplicate,
  onDelete,
}: PositionCardProps) {
  const sc = (pos.systemConfig || {}) as Record<string, unknown>;
  const isOutsourced = pos.fulfillmentType === 'outsourced';
  const resolvedVisual = resolvePositionVisual({
    visualMode: pos.visualMode,
    customImagePath: pos.customImagePath,
    catalogImagePath: pos.supplierDoor?.imagePath ?? null,
    systemConfig: sc,
  });

  const statusConfig = DOOR_STATUS_MAP[pos.status] || {
    label: pos.status,
    variant: 'default' as const,
  };
  const costConfig = POSITION_COST_STATUS_MAP[pos.costStatus] ?? POSITION_COST_STATUS_MAP.estimated;
  const displayDesc = pos.description || pos.supplierDoor?.name || (pos.doorType === 'window' ? 'Cửa sổ' : 'Cửa đi');

  return (
    <div className="group bg-white rounded-xl border border-slate-200 hover:border-primary hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
      <div className="p-2.5 bg-white border-b border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-semibold text-[11px] text-slate-700 truncate" title={pos.code}>
            {pos.code}
          </span>
          {isOutsourced && (
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0 ${DOOR_FULFILLMENT_TYPE_MAP.outsourced.badgeClass}`}>
              {DOOR_FULFILLMENT_TYPE_MAP.outsourced.shortLabel}
            </span>
          )}
        </div>
        {pos.designOptionId ? (
          <Badge variant="info" size="sm" title="Cửa thuộc phương án thiết kế khách chưa chọn">
            Phương án
          </Badge>
        ) : (
          <Badge variant={statusConfig.variant} size="sm">
            {statusConfig.label}
          </Badge>
        )}
      </div>

      <div
        onClick={() => onOpenStudio(pos)}
        title={isOutsourced ? 'Nhấn để phác thảo mặt đứng 2D' : 'Nhấn để biên soạn bản vẽ CAD'}
        className="aspect-[4/3] w-full p-2 bg-slate-50/40 flex items-center justify-center overflow-hidden relative cursor-pointer"
      >
        {resolvedVisual.imageUrl ? (
          <img
            src={resolvedVisual.imageUrl}
            alt={pos.code}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 rounded"
          />
        ) : resolvedVisual.systemConfig ? (
          <div className="w-full h-full p-1 group-hover:scale-105 transition-transform duration-300 pointer-events-none">
            <DoorThumbnail systemConfig={resolvedVisual.systemConfig} hideDimensions={false} className="w-full h-full" />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 text-slate-300">
            <ImageOff size={26} />
            <span className="text-[10px]">{isOutsourced ? 'Chưa có ảnh / phác thảo 2D' : 'Chưa có bản vẽ CAD'}</span>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-slate-100 space-y-1.5 bg-white">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-800 truncate" title={displayDesc}>
            {displayDesc}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-mono font-medium tabular-nums">
            {pos.width} × {pos.height} mm
          </span>
          <span className="font-mono text-slate-400 text-[11px] tabular-nums">
            {(pos.areaM2 ?? 0).toFixed(2)} m²
          </span>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center justify-between gap-2">
          <span className="truncate">{pos.floor?.name || 'Tầng 1'}</span>
          {isOutsourced && pos.supplier?.name && (
            <span className="truncate text-primary font-medium" title={pos.supplier.name}>
              {pos.supplier.name}
            </span>
          )}
        </div>

        {isOutsourced && (
          <div className="pt-1 flex items-center justify-between gap-1.5">
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${costConfig.badgeClass}`}>
              {costConfig.shortLabel}
            </span>
            <span className="font-mono text-[11px] font-bold text-slate-800 tabular-nums">
              {new Intl.NumberFormat('vi-VN').format(pos.supplierCostPrice || 0)} đ/bộ
            </span>
          </div>
        )}

        {pos.measureNote && (
          <p className="text-[11px] text-slate-500 break-words leading-tight">
            <span className="font-medium text-slate-600">Ghi chú:</span> {pos.measureNote}
          </p>
        )}

        {isOutsourced && (
          <div className="pt-1.5 grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => onOpenStudio(pos)}
              className="h-7 px-2 flex items-center justify-center gap-1 rounded-md border border-slate-200 text-[11px] font-semibold text-slate-700 hover:border-primary/40 hover:text-primary hover:bg-primary/5 cursor-pointer transition-colors"
            >
              <PenTool size={12} />
              <span className="truncate">Phác thảo 2D</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenSupplierQuote(pos)}
              className="h-7 px-2 flex items-center justify-center gap-1 rounded-md border border-primary/30 bg-primary/5 text-[11px] font-semibold text-primary hover:bg-primary/10 cursor-pointer transition-colors"
            >
              <BadgeDollarSign size={12} />
              <span className="truncate">Báo giá NCC</span>
            </button>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 grid grid-cols-5 gap-1.5">
          <button
            type="button"
            title="Chỉnh sửa thông tin cửa"
            onClick={() => onEdit(pos)}
            className="h-7 flex items-center justify-center border border-slate-200 text-slate-600 hover:text-primary hover:border-primary/40 hover:bg-primary/5 rounded-md cursor-pointer transition-colors"
          >
            <Edit size={13} />
          </button>
          <button
            type="button"
            title="Đo đạc ô chờ thực tế"
            onClick={() => onMeasure(pos)}
            className="h-7 flex items-center justify-center border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-md cursor-pointer transition-colors"
          >
            <Ruler size={13} />
          </button>
          <button
            type="button"
            title="Xem mã QR"
            onClick={() => onQrCode(pos)}
            className="h-7 flex items-center justify-center border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-md cursor-pointer transition-colors"
          >
            <QrCode size={13} />
          </button>
          <button
            type="button"
            title="Nhân bản bộ cửa"
            disabled={isDuplicating}
            onClick={() => onDuplicate(pos)}
            className="h-7 flex items-center justify-center border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-md cursor-pointer transition-colors disabled:opacity-50"
          >
            <Copy size={13} />
          </button>
          <button
            type="button"
            title="Xóa bộ cửa"
            onClick={() => onDelete(pos)}
            className="h-7 flex items-center justify-center border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 rounded-md cursor-pointer transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
