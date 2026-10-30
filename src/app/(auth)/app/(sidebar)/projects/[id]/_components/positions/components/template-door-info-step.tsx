'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button, Input } from '@/components';
import type { Door, ProjectFloor } from '@/types';
import { DoorThumbnail } from '../../../../configuration/door-templates/_components/door-thumbnail';

export const normalizeBulkBaseCode = (raw: string): string => {
  const trimmed = raw.trim();
  return trimmed.replace(/[-_]\d+$/, '').replace(/[-_]+$/, '') || trimmed;
};

export interface TemplateDoorInfoStepProps {
  selectedDoor: Door | null;
  newCode: string;
  onChangeCode: (value: string) => void;
  targetFloorId: number;
  onChangeFloorId: (value: number) => void;
  floors: ProjectFloor[];
  width: number;
  onChangeWidth: (value: number) => void;
  height: number;
  onChangeHeight: (value: number) => void;
  quantity: number;
  onChangeQuantity: (value: number) => void;
  description: string;
  onChangeDescription: (value: string) => void;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
}

export function TemplateDoorInfoStep({
  selectedDoor,
  newCode,
  onChangeCode,
  targetFloorId,
  onChangeFloorId,
  floors,
  width,
  onChangeWidth,
  height,
  onChangeHeight,
  quantity,
  onChangeQuantity,
  description,
  onChangeDescription,
  isSubmitting,
  onBack,
  onSubmit,
}: TemplateDoorInfoStepProps) {
  const isBulk = quantity > 1;
  const trimmedCode = newCode.trim();
  const basePrefix = normalizeBulkBaseCode(newCode);
  const isValid = Boolean(trimmedCode) && width > 0 && height > 0 && quantity >= 1 && quantity <= 100;

  return (
    <div className="flex flex-col">
      <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-primary font-medium cursor-pointer transition-colors"
        >
          <ArrowLeft size={14} /> Chọn mẫu khác
        </button>
      </div>

      <div className="p-4 space-y-3.5">
        <div className="flex items-center gap-3 p-2.5 bg-slate-50/70 border border-slate-200/80 rounded-lg">
          <div className="w-14 h-14 bg-white border border-slate-200 rounded shrink-0 flex items-center justify-center overflow-hidden p-1">
            {selectedDoor && (
              <DoorThumbnail
                door={selectedDoor}
                systemConfig={
                  selectedDoor.systemConfig
                    ? { ...selectedDoor.systemConfig, w: width || 800, h: height || 1200 }
                    : undefined
                }
                hideDimensions
                className="w-full h-full"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-800 truncate">{selectedDoor?.name}</h4>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              Mẫu: {selectedDoor?.code} • Kích thước thiết kế: {width || 0} × {height || 0} mm
            </p>
          </div>
        </div>

        <div className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
            <div className="space-y-1">
              <Input
                label={isBulk ? 'Tiền tố mã cửa (Base Code) *' : 'Mã cửa (Code) *'}
                placeholder={isBulk ? 'Nhập tiền tố (VD: D1)' : 'Nhập mã cửa (VD: D1-01)'}
                value={newCode}
                onChange={(e) => onChangeCode(e.target.value)}
                autoFocus
                fullWidth
              />
              {isBulk && basePrefix && (
                <p className="text-[11px] text-primary font-medium">
                  Tự động sinh {quantity} mã: {basePrefix}-01 → {basePrefix}-
                  {String(quantity).padStart(2, '0')}
                </p>
              )}
            </div>

            {floors.length > 0 && (
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-semibold text-gray-700 select-none">Tầng bố trí *</label>
                <select
                  value={targetFloorId}
                  onChange={(e) => onChangeFloorId(Number(e.target.value))}
                  className="w-full h-10 px-3 text-base md:text-sm bg-white border border-gray-200 rounded-md outline-none hover:border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-900 transition-all duration-200"
                >
                  {floors.map((fl) => (
                    <option key={fl.id} value={fl.id}>
                      {fl.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 items-start">
            <Input
              type="number"
              label="Rộng (mm) *"
              min={100}
              value={width || ''}
              onChange={(e) => onChangeWidth(Number(e.target.value))}
              fullWidth
            />
            <Input
              type="number"
              label="Cao (mm) *"
              min={100}
              value={height || ''}
              onChange={(e) => onChangeHeight(Number(e.target.value))}
              fullWidth
            />
            <Input
              type="number"
              label="Số lượng bộ *"
              min={1}
              max={100}
              value={quantity || ''}
              onChange={(e) => {
                const raw = e.target.value;
                onChangeQuantity(raw === '' ? 0 : Math.min(100, Math.max(0, Math.floor(Number(raw)))));
              }}
              fullWidth
            />
          </div>

          <Input
            label="Mô tả"
            placeholder="VD: Cửa đi phòng khách"
            value={description}
            onChange={(e) => onChangeDescription(e.target.value)}
            fullWidth
          />
        </div>
      </div>

      <div className="p-3 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/50">
        <Button variant="outline" size="sm" onClick={onBack} disabled={isSubmitting}>
          Quay lại
        </Button>
        <Button
          variant="primary"
          size="sm"
          disabled={!isValid || isSubmitting}
          loading={isSubmitting}
          onClick={onSubmit}
        >
          {isBulk ? `Thêm ${quantity} bộ vào dự án` : 'Thêm vào dự án'}
        </Button>
      </div>
    </div>
  );
}
