'use client';

import React from 'react';
import { Copy, Edit, ImageOff, QrCode, Ruler, Trash2 } from 'lucide-react';
import { Badge } from '@/components';
import { DOOR_STATUS_MAP } from '@/config';
import type { ProjectDoorPosition } from '@/types';
import { DoorThumbnail } from '../../../../configuration/door-templates/_components/door-thumbnail';

interface PositionCardProps {
  position: ProjectDoorPosition;
  isDuplicating: boolean;
  onOpenStudio: (pos: ProjectDoorPosition) => void;
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
  onEdit,
  onMeasure,
  onQrCode,
  onDuplicate,
  onDelete,
}: PositionCardProps) {
  const sc = (pos.systemConfig || {}) as Record<string, unknown>;
  const hasSvg = Boolean(sc.rootCell);
  const statusConfig = DOOR_STATUS_MAP[pos.status] || {
    label: pos.status,
    variant: 'default' as const,
  };
  const displayDesc = pos.description || (pos.doorType === 'window' ? 'Cửa sổ' : 'Cửa đi');

  return (
    <div className="group bg-white rounded-xl border border-slate-200 hover:border-primary hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
      <div className="p-2.5 bg-white border-b border-slate-100 flex items-center justify-between gap-2">
        <span className="font-semibold text-[11px] text-slate-700 truncate" title={pos.code}>
          {pos.code}
        </span>
        <Badge variant={statusConfig.variant} size="sm">
          {statusConfig.label}
        </Badge>
      </div>

      <div
        onClick={() => onOpenStudio(pos)}
        title="Nhấn để biên soạn bản vẽ CAD"
        className="aspect-[4/3] w-full p-2 bg-slate-50/40 flex items-center justify-center overflow-hidden relative cursor-pointer"
      >
        {hasSvg ? (
          <div className="w-full h-full p-1 group-hover:scale-105 transition-transform duration-300 pointer-events-none">
            <DoorThumbnail
              systemConfig={sc}
              hideDimensions={false}
              className="w-full h-full"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 text-slate-300">
            <ImageOff size={26} />
            <span className="text-[10px]">Chưa có bản vẽ CAD</span>
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
          <span className="font-medium">
            {pos.width} × {pos.height} mm
          </span>
          <span className="text-slate-400 text-[11px]">
            {(pos.areaM2 ?? 0).toFixed(2)} m²
          </span>
        </div>

        <div className="text-[11px] text-slate-400">
          <span className="truncate block">{pos.floor?.name || 'Tầng 1'}</span>
        </div>

        <div className="pt-2.5 border-t border-slate-100 grid grid-cols-5 gap-1.5">
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

