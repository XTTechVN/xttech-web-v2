'use client';

import React from 'react';
import { ArrowLeft, PenTool, RotateCcw, Store } from 'lucide-react';
import { Button, Input, Select, Switch } from '@/components';
import { POSITION_COST_STATUS_MAP } from '@/config';
import type { PositionCostStatus, ProjectFloor, SupplierDoor, WarehouseSupplier } from '@/types';
import { getFileUrl } from '@/utils';

interface SupplierDoorInfoStepProps {
  selectedDoor: SupplierDoor | null;
  suppliers: WarehouseSupplier[];
  floors: ProjectFloor[];
  supplierId: string;
  onChangeSupplierId: (value: string) => void;
  code: string;
  onChangeCode: (value: string) => void;
  floorId: string;
  onChangeFloorId: (value: string) => void;
  width: number;
  onChangeWidth: (value: number) => void;
  height: number;
  onChangeHeight: (value: number) => void;
  quantity: number;
  onChangeQuantity: (value: number) => void;
  description: string;
  onChangeDescription: (value: string) => void;
  supplierCostValue: string;
  isCostOverridden: boolean;
  onChangeSupplierCost: (value: string) => void;
  onResetAutoCost: () => void;
  costStatus: PositionCostStatus;
  onChangeCostStatus: (value: PositionCostStatus) => void;
  isInstallationIncluded: boolean;
  onChangeInstallationIncluded: (value: boolean) => void;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: (openSketchAfter: boolean) => void;
}

export function SupplierDoorInfoStep({
  selectedDoor,
  suppliers,
  floors,
  supplierId,
  onChangeSupplierId,
  code,
  onChangeCode,
  floorId,
  onChangeFloorId,
  width,
  onChangeWidth,
  height,
  onChangeHeight,
  quantity,
  onChangeQuantity,
  description,
  onChangeDescription,
  supplierCostValue,
  isCostOverridden,
  onChangeSupplierCost,
  onResetAutoCost,
  costStatus,
  onChangeCostStatus,
  isInstallationIncluded,
  onChangeInstallationIncluded,
  isSubmitting,
  onBack,
  onSubmit,
}: SupplierDoorInfoStepProps) {
  const areaM2 = (Math.max(0, width) * Math.max(0, height)) / 1_000_000;
  const isBulk = quantity > 1;
  const imgRaw =
    selectedDoor?.images?.find((img) => img.isPrimary)?.imageUrl ??
    selectedDoor?.images?.[0]?.imageUrl ??
    selectedDoor?.imagePath ??
    null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-primary font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại chọn mẫu NCC</span>
        </button>
        <span className="font-mono text-xs text-slate-500 tabular-nums">Diện tích: {areaM2.toFixed(2)} m²</span>
      </div>

      {selectedDoor && (
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-primary/5 border border-primary/20">
          <div className="w-12 h-12 rounded-lg border border-slate-200 bg-white overflow-hidden shrink-0 flex items-center justify-center">
            {imgRaw ? (
              <img src={getFileUrl(imgRaw)} alt={selectedDoor.name} className="w-full h-full object-cover" />
            ) : (
              <Store className="w-5 h-5 text-primary" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 truncate">
              {selectedDoor.code} — {selectedDoor.name}
            </p>
            <p className="text-[11px] text-slate-600 truncate">
              {selectedDoor.supplier?.name || 'NCC'} • Tham khảo:{' '}
              <span className="font-mono font-semibold">
                {new Intl.NumberFormat('vi-VN').format(selectedDoor.referenceCostPerSqm || 0)} VNĐ/m²
              </span>
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Input
          label={isBulk ? 'Tiền tố mã cửa *' : 'Mã vị trí cửa *'}
          value={code}
          onChange={(e) => onChangeCode(e.target.value)}
          placeholder={isBulk ? 'VD: CN' : 'VD: D1-01'}
          required
        />

        <Select
          label="Tầng / Khu vực"
          value={floorId}
          onChange={(e) => onChangeFloorId(e.target.value)}
          options={floors.map((f) => ({ value: String(f.id), label: f.name }))}
        />

        <div className="sm:col-span-2">
          <Select
            label="Nhà cung cấp cửa nguyên bộ *"
            value={supplierId}
            onChange={(e) => onChangeSupplierId(e.target.value)}
            disabled={Boolean(selectedDoor)}
            options={[
              { value: '', label: '-- Chọn nhà cung cấp --' },
              ...suppliers.map((s) => ({ value: String(s.id), label: `${s.name}${s.phone ? ` (${s.phone})` : ''}` })),
            ]}
          />
        </div>

        <Input
          label="Chiều rộng (mm) *"
          type="number"
          min={100}
          value={width || ''}
          onChange={(e) => onChangeWidth(Number(e.target.value) || 0)}
          className="font-mono tabular-nums text-right"
        />

        <Input
          label="Chiều cao (mm) *"
          type="number"
          min={100}
          value={height || ''}
          onChange={(e) => onChangeHeight(Number(e.target.value) || 0)}
          className="font-mono tabular-nums text-right"
        />

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700">Giá vốn NCC (VNĐ/bộ)</label>
            {selectedDoor && isCostOverridden && (
              <button
                type="button"
                onClick={onResetAutoCost}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Tính lại theo m²</span>
              </button>
            )}
          </div>
          <Input
            type="number"
            min={0}
            value={supplierCostValue}
            onChange={(e) => onChangeSupplierCost(e.target.value)}
            className="font-mono tabular-nums text-right"
          />
        </div>

        <Input
          label="Số lượng bộ (1 - 100)"
          type="number"
          min={1}
          max={100}
          value={quantity}
          onChange={(e) => onChangeQuantity(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
          className="font-mono tabular-nums text-right"
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Trạng thái giá vốn</label>
          <div className="grid grid-cols-2 gap-2">
            {(['estimated', 'confirmed'] as PositionCostStatus[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => onChangeCostStatus(key)}
                className={`px-2.5 py-2 rounded-lg border text-xs font-semibold cursor-pointer ${
                  costStatus === key
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-primary/40'
                }`}
              >
                {POSITION_COST_STATUS_MAP[key].shortLabel}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 bg-slate-50/70">
          <div>
            <p className="text-xs font-semibold text-slate-700">NCC đã bao gồm lắp đặt</p>
            <p className="text-[11px] text-slate-500">Không tính thêm công lắp nội bộ</p>
          </div>
          <Switch
            checked={isInstallationIncluded}
            onChange={(e) => onChangeInstallationIncluded(e.target.checked)}
          />
        </div>

        <div className="sm:col-span-2">
          <Input
            label="Tên vị trí / Ghi chú quy cách"
            value={description}
            onChange={(e) => onChangeDescription(e.target.value)}
            placeholder="VD: Cửa phòng ngủ Master"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-100">
        {!isBulk && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            loading={isSubmitting}
            leftIcon={<PenTool className="w-4 h-4" />}
            onClick={() => onSubmit(true)}
          >
            Lưu &amp; Phác thảo 2D
          </Button>
        )}
        <Button type="button" variant="primary" size="sm" loading={isSubmitting} onClick={() => onSubmit(false)}>
          {isBulk ? `Thêm ${quantity} bộ cửa NCC` : 'Thêm cửa NCC'}
        </Button>
      </div>
    </div>
  );
}
