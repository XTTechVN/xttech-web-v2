'use client';

import React from 'react';
import { Layers, Printer } from 'lucide-react';
import { Button, Select } from '@/components';
import type { ProductionSheet, ProjectFloor } from '@/types';
import {
  FULFILLMENT_FILTER_OPTIONS,
  type FulfillmentFilter,
} from '../../shared/technical-sheets';

interface QuotationTechnicalSheetsToolbarProps {
  floors: ProjectFloor[];
  selectableSheets: ProductionSheet[];
  displayedCount: number;
  floorId: number | 'all';
  fulfillmentFilter: FulfillmentFilter;
  selectedPositionId: number | 'all';
  isPrinting: boolean;
  isLoading: boolean;
  onFloorChange: (floorId: number | 'all') => void;
  onFulfillmentChange: (filter: FulfillmentFilter) => void;
  onSelectPosition: (positionId: number | 'all') => void;
  onPrint: () => void;
}

export function QuotationTechnicalSheetsToolbar({
  floors,
  selectableSheets,
  displayedCount,
  floorId,
  fulfillmentFilter,
  selectedPositionId,
  isPrinting,
  isLoading,
  onFloorChange,
  onFulfillmentChange,
  onSelectPosition,
  onPrint,
}: QuotationTechnicalSheetsToolbarProps) {
  const floorOptions = [
    { value: 'all', label: 'Tất cả tầng' },
    ...floors.map((floor) => ({ value: String(floor.id), label: floor.name })),
  ];

  return (
    <div className="space-y-3 rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Layers size={15} className="shrink-0 text-primary" />
            <span>Hồ sơ kỹ thuật định mức 1 bộ:</span>
          </div>

          <div className="min-w-[165px]">
            <Select
              value={floorId === 'all' ? 'all' : String(floorId)}
              onChange={(e) =>
                onFloorChange(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              options={floorOptions}
              className="h-8 text-xs"
              fullWidth
            />
          </div>

          <div className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            {FULFILLMENT_FILTER_OPTIONS.map((option) => {
              const isActive = fulfillmentFilter === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onFulfillmentChange(option.value)}
                  className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-primary font-semibold text-white shadow-xs'
                      : 'text-slate-600 hover:bg-white hover:text-slate-900'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          leftIcon={<Printer size={14} />}
          loading={isPrinting}
          disabled={isLoading || displayedCount === 0}
          onClick={onPrint}
          className="h-8 shrink-0 text-xs font-semibold"
        >
          In Thẻ A4 ({displayedCount})
        </Button>
      </div>

      {selectableSheets.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2.5">
          <button
            type="button"
            onClick={() => onSelectPosition('all')}
            className={`cursor-pointer rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
              selectedPositionId === 'all'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            Tất cả ({selectableSheets.length})
          </button>

          {selectableSheets.map((sheet, idx) => {
            const isActive = selectedPositionId === sheet.positionId;
            return (
              <button
                key={sheet.positionId}
                type="button"
                onClick={() => onSelectPosition(sheet.positionId)}
                title={`${sheet.positionCode} · ${sheet.doorName} (${Math.round(sheet.width)}×${Math.round(sheet.height)} mm - ${sheet.floorName})`}
                className={`cursor-pointer rounded-lg px-2.5 py-1 font-mono text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-primary font-semibold text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {String(idx + 1).padStart(2, '0')}. {sheet.positionCode}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
