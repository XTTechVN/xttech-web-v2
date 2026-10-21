'use client';

import React from 'react';
import { CurrencyInput, Input, Select } from '@/components';
import {
  ACCESSORY_MODE_OPTIONS,
  LABOR_CALC_UNIT_OPTIONS,
  PRICING_MODE_OPTIONS,
  SCOPE_TYPE_OPTIONS,
} from '@/config';
import type { ProjectFloor, ProjectQuotationPreviewRequest } from '@/types';
import { Hint, PriceBlock } from './quotation-primitives';

interface QuotationConfigFormProps {
  config: ProjectQuotationPreviewRequest;
  patchConfig: (patch: Partial<ProjectQuotationPreviewRequest>) => void;
  toggleFloor: (floorId: number) => void;
  name: string;
  onNameChange: (value: string) => void;
  note: string;
  onNoteChange: (value: string) => void;
  floors: ProjectFloor[];
  isMissingFloors: boolean;
  isReadOnly: boolean;
}

type PercentField =
  | 'managementRatePercent'
  | 'markupPercent'
  | 'marginPercent'
  | 'discountPercent'
  | 'vatPercent';

export function QuotationConfigForm({
  config,
  patchConfig,
  toggleFloor,
  name,
  onNameChange,
  note,
  onNoteChange,
  floors,
  isMissingFloors,
  isReadOnly,
}: QuotationConfigFormProps) {
  const laborUnitLabel = config.laborCalcUnit === 'vnd_per_kg' ? 'đ/kg nhôm' : 'đ/m² cửa';

  const onPercentChange =
    (field: PercentField) => (e: React.ChangeEvent<HTMLInputElement>) =>
      patchConfig({ [field]: Number(e.target.value) });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <PriceBlock
        className="xl:col-span-2"
        title="1. Thông tin báo giá"
        description="Mỗi dự án chỉ có một báo giá hiện hành, cập nhật lại khi cấu hình hoặc cửa thay đổi"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Tên báo giá *"
            value={name}
            disabled={isReadOnly}
            onChange={(e) => onNameChange(e.target.value)}
            fullWidth
          />
          <Input
            label="Ghi chú cho khách (thời hạn báo giá, bảo hành...)"
            value={note}
            disabled={isReadOnly}
            onChange={(e) => onNoteChange(e.target.value)}
            fullWidth
          />
        </div>
      </PriceBlock>

      <PriceBlock
        title="2. Báo giá cho phần nào?"
        description="Chọn báo giá cho cả công trình hay chỉ một số tầng"
      >
        <div className="grid grid-cols-1 gap-4">
          <Select
            label="Báo giá cho"
            fullWidth
            disabled={isReadOnly}
            value={config.scopeType}
            onChange={(e) => patchConfig({ scopeType: e.target.value as 'all' | 'by_floor' })}
            options={SCOPE_TYPE_OPTIONS}
          />
          <Select
            label="Cách hiển thị phụ kiện"
            fullWidth
            disabled={isReadOnly}
            value={config.accessoryMode}
            onChange={(e) =>
              patchConfig({ accessoryMode: e.target.value as 'combined' | 'separated' })
            }
            options={ACCESSORY_MODE_OPTIONS}
          />
        </div>
        {config.scopeType === 'by_floor' && (
          <FloorPicker
            floors={floors}
            selectedIds={config.floorIds ?? []}
            isReadOnly={isReadOnly}
            isMissingFloors={isMissingFloors}
            onToggle={toggleFloor}
          />
        )}
      </PriceBlock>

      <PriceBlock
        title="3. Tiền công thợ"
        description="Tiền trả cho thợ làm cửa, lắp đặt và vệ sinh sau khi lắp"
      >
        <Select
          label="Tính tiền công theo"
          fullWidth
          disabled={isReadOnly}
          value={config.laborCalcUnit}
          onChange={(e) =>
            patchConfig({ laborCalcUnit: e.target.value as 'vnd_per_m2' | 'vnd_per_kg' })
          }
          options={LABOR_CALC_UNIT_OPTIONS}
        />
        <div className="grid grid-cols-1 gap-4">
          <CurrencyInput
            label={`Làm cửa (${laborUnitLabel})`}
            fullWidth
            disabled={isReadOnly}
            value={config.laborProductionRate}
            onChange={(v) => patchConfig({ laborProductionRate: v })}
          />
          <CurrencyInput
            label={`Lắp đặt (${laborUnitLabel})`}
            fullWidth
            disabled={isReadOnly}
            value={config.laborInstallRate}
            onChange={(v) => patchConfig({ laborInstallRate: v })}
          />
          <CurrencyInput
            label={`Vệ sinh (${laborUnitLabel})`}
            fullWidth
            disabled={isReadOnly}
            value={config.laborCleanRate}
            onChange={(v) => patchConfig({ laborCleanRate: v })}
          />
        </div>
      </PriceBlock>

      <PriceBlock title="4. Chi phí khác" description="Các khoản ngoài vật tư và tiền công">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <CurrencyInput
              label="Chi phí phát sinh (đ)"
              fullWidth
              disabled={isReadOnly}
              value={config.otherCost}
              onChange={(v) => patchConfig({ otherCost: v })}
            />
            <Hint>Ví dụ: thuê xe cẩu, tiền vận chuyển đến công trình.</Hint>
          </div>
          <div className="space-y-2">
            <CurrencyInput
              label="Số tiền thu của khách cho khoản này (đ)"
              fullWidth
              disabled={isReadOnly}
              value={config.otherSellingPrice ?? ''}
              onChange={(v) => patchConfig({ otherSellingPrice: v || undefined })}
            />
            <Hint>Để trống nếu thu đúng bằng chi phí phát sinh.</Hint>
          </div>
          <div className="space-y-2">
            <Input
              type="number"
              label="Chi phí chung của xưởng (%)"
              disabled={isReadOnly}
              value={config.managementRatePercent}
              onChange={onPercentChange('managementRatePercent')}
              fullWidth
            />
            <Hint>
              Điện, nước, mặt bằng, quản lý... Phần % này được cộng thêm vào chi phí làm ra mỗi bộ cửa.
            </Hint>
          </div>
        </div>
      </PriceBlock>

      <PriceBlock
        title="5. Tiền lãi, giảm giá và thuế"
        description="Quyết định giá bán cho khách và khoản lãi bạn muốn có"
      >
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Select
              label="Cách tính giá bán"
              fullWidth
              disabled={isReadOnly}
              value={config.pricingMode}
              onChange={(e) => patchConfig({ pricingMode: e.target.value as 'markup' | 'margin' })}
              options={PRICING_MODE_OPTIONS}
            />
            <Hint>
              {config.pricingMode === 'markup'
                ? 'Ví dụ: chi phí 100 đồng, cộng 45% lãi -> giá bán 145 đồng.'
                : 'Ví dụ: muốn lãi 30% trên giá bán -> giá bán = chi phí chia 0,7.'}
            </Hint>
          </div>
          {config.pricingMode === 'markup' ? (
            <Input
              type="number"
              label="% lãi cộng thêm vào chi phí"
              disabled={isReadOnly}
              value={config.markupPercent}
              onChange={onPercentChange('markupPercent')}
              fullWidth
            />
          ) : (
            <Input
              type="number"
              label="% lãi mong muốn trên giá bán"
              disabled={isReadOnly}
              value={config.marginPercent}
              onChange={onPercentChange('marginPercent')}
              fullWidth
            />
          )}
          <div className="space-y-2">
            <Input
              type="number"
              label="Giảm giá cho khách (%)"
              disabled={isReadOnly}
              value={config.discountPercent}
              onChange={onPercentChange('discountPercent')}
              fullWidth
            />
            <Hint>Phần giảm khi thương lượng với khách.</Hint>
          </div>
          <div className="space-y-2">
            <Input
              type="number"
              label="Thuế VAT (%)"
              disabled={isReadOnly}
              value={config.vatPercent}
              onChange={onPercentChange('vatPercent')}
              fullWidth
            />
            <Hint>Thuế giá trị gia tăng, thường là 10%.</Hint>
          </div>
        </div>
      </PriceBlock>
    </div>
  );
}

interface FloorPickerProps {
  floors: ProjectFloor[];
  selectedIds: number[];
  isReadOnly: boolean;
  isMissingFloors: boolean;
  onToggle: (floorId: number) => void;
}

function FloorPicker({ floors, selectedIds, isReadOnly, isMissingFloors, onToggle }: FloorPickerProps) {
  return (
    <div className="space-y-2">
      <span className="text-xs text-slate-500 block">Bấm để chọn các tầng cần báo giá:</span>
      <div className="flex flex-wrap gap-2">
        {floors.map((floor) => {
          const isActive = selectedIds.includes(floor.id);
          return (
            <button
              key={floor.id}
              type="button"
              disabled={isReadOnly}
              onClick={() => onToggle(floor.id)}
              className={`px-2.5 py-1 rounded-md text-xs border transition-colors disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer ${
                isActive
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-primary/40'
              }`}
            >
              {floor.name}
            </button>
          );
        })}
        {floors.length === 0 && (
          <span className="text-xs text-slate-400">Công trình chưa có tầng nào.</span>
        )}
      </div>
      {isMissingFloors && (
        <span className="text-[11px] text-amber-600 block">Hãy chọn ít nhất 1 tầng để xem giá.</span>
      )}
    </div>
  );
}
