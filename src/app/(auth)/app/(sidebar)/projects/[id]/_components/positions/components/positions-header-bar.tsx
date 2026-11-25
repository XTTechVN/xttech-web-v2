'use client';

import React from 'react';
import { FileSpreadsheet, PenTool, Plus, Store } from 'lucide-react';
import { Button } from '@/components';

interface PositionsHeaderBarProps {
  positionsCount: number;
  currentFloorName: string;
  hasOutsourcedDoors: boolean;
  onOpenDrawInit: () => void;
  onOpenTemplatePicker: () => void;
  onOpenSupplierPicker: () => void;
  onOpenRfqModal: () => void;
}

export function PositionsHeaderBar({
  positionsCount,
  currentFloorName,
  hasOutsourcedDoors,
  onOpenDrawInit,
  onOpenTemplatePicker,
  onOpenSupplierPicker,
  onOpenRfqModal,
}: PositionsHeaderBarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
      <div>
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <span>{positionsCount} vị trí cửa</span>
          <span className="text-xs text-slate-400 font-normal">({currentFloorName})</span>
        </h3>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {hasOutsourcedDoors && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<FileSpreadsheet size={14} />}
            onClick={onOpenRfqModal}
            className="h-8 text-xs font-semibold border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          >
            Xuất RFQ NCC
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Store size={14} />}
          onClick={onOpenSupplierPicker}
          className="h-8 text-xs font-semibold border-primary/30 text-primary hover:bg-primary/5"
        >
          Thêm cửa NCC
        </Button>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<PenTool size={14} />}
          onClick={onOpenDrawInit}
          className="h-8 text-xs font-semibold border-primary/30 text-primary hover:bg-primary/5"
        >
          Vẽ cửa
        </Button>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus size={14} />}
          onClick={onOpenTemplatePicker}
          className="h-8 text-xs font-semibold"
        >
          Mẫu cửa
        </Button>
      </div>
    </div>
  );
}
