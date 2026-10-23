'use client';

import React from 'react';
import type { ProjectDetail, ProjectUpdate } from '@/types';
import { CompactSelect, type CompactSelectOption } from '../compact-select';
import { formatSurfaceType } from '../hooks/use-overview-materials';

interface MaterialStandardCardProps {
  project: ProjectDetail;
  currentBrandId?: number | null;
  updatingField: string | null;
  isLoadingBrands: boolean;
  isLoadingSeries: boolean;
  isLoadingColors: boolean;
  brandOptions: CompactSelectOption[];
  seriesOptions: CompactSelectOption[];
  colorOptions: CompactSelectOption[];
  onEnableCatalogs?: () => void;
  onUpdate: (field: string, payload: Partial<ProjectUpdate>) => void;
}

export function MaterialStandardCard({
  project,
  currentBrandId,
  updatingField,
  isLoadingBrands,
  isLoadingSeries,
  isLoadingColors,
  brandOptions,
  seriesOptions,
  colorOptions,
  onEnableCatalogs,
  onUpdate,
}: MaterialStandardCardProps) {
  const brand = project.defaultBrand;
  const series = project.defaultSeries;
  const color = project.defaultColor;

  const brandText = brand?.name
    ? `${brand.name}${brand.originCountry ? ` (${brand.originCountry})` : ''}`
    : 'Chưa thiết lập';

  const seriesText = series?.name
    ? `${series.name}${series.aluminumThickness ? ` - Dày ${series.aluminumThickness} mm` : ''}`
    : 'Chưa chọn hệ';

  const surfaceLabel = formatSurfaceType(color?.surfaceType);
  const colorText = color?.name
    ? `${color.name}${surfaceLabel ? ` (${surfaceLabel})` : ''}`
    : 'Tiêu chuẩn';

  const colorHex = color?.colorHex || '#B79B69';

  return (
    <div className="space-y-1.5">
      <h3 className="text-xs font-semibold text-slate-700 font-lexend block">
        Tiêu chuẩn vật tư
      </h3>

      <div className="bg-white rounded-md border border-slate-200/80 p-3.5 shadow-2xs space-y-2.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Hãng nhôm mặc định</span>
          <CompactSelect
            value={project.defaultBrandId || brand?.id}
            displayLabel={brandText}
            options={brandOptions}
            isLoading={updatingField === 'brand' || isLoadingBrands}
            placeholder="Chọn hãng nhôm"
            onOpen={onEnableCatalogs}
            onChange={(val) => {
              onUpdate('brand', {
                defaultBrandId: Number(val),
                defaultSeriesId: null,
                defaultColorId: null,
              });
            }}
          />
        </div>

        {brand?.barLengthMm && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-2">
            <span className="text-slate-500">Quy cách thanh</span>
            <span className="text-slate-700 font-medium">{(brand.barLengthMm / 1000).toFixed(2)} m/thanh</span>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 pt-2">
          <span className="text-slate-500">Hệ nhôm mặc định</span>
          <CompactSelect
            value={project.defaultSeriesId || series?.id}
            displayLabel={<span className="truncate max-w-[170px]" title={seriesText}>{seriesText}</span>}
            options={seriesOptions}
            isLoading={updatingField === 'series' || isLoadingSeries}
            placeholder={currentBrandId ? 'Chọn hệ nhôm' : 'Cần chọn hãng trước'}
            disabled={!currentBrandId}
            emptyText={currentBrandId ? 'Hãng này chưa có hệ nhôm' : 'Vui lòng chọn hãng nhôm'}
            onOpen={onEnableCatalogs}
            onChange={(val) => {
              onUpdate('series', { defaultSeriesId: Number(val) });
            }}
          />
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-2">
          <span className="text-slate-500">Màu sơn mặc định</span>
          <CompactSelect
            value={project.defaultColorId || color?.id}
            displayLabel={
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <span
                  className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                  style={{ backgroundColor: colorHex }}
                />
                <span className="truncate max-w-[150px]">{colorText}</span>
              </div>
            }
            options={colorOptions}
            isLoading={updatingField === 'color' || isLoadingColors}
            placeholder={currentBrandId ? 'Chọn màu sơn' : 'Cần chọn hãng trước'}
            disabled={!currentBrandId}
            emptyText={currentBrandId ? 'Hãng này chưa có màu sơn' : 'Vui lòng chọn hãng nhôm'}
            onOpen={onEnableCatalogs}
            onChange={(val) => {
              onUpdate('color', { defaultColorId: Number(val) });
            }}
          />
        </div>

        {color?.pricePerKg && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-2">
            <span className="text-slate-500">Đơn giá nhôm màu</span>
            <span className="font-medium text-slate-700">
              {color.pricePerKg.toLocaleString('vi-VN')} đ/kg
            </span>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 pt-2">
          <span className="text-slate-500">Số lượng cửa</span>
          <span className="font-semibold text-slate-800">
            {project.totalPositions ?? 0} bộ
            {project.floors?.length ? ` (${project.floors.length} tầng)` : ''}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-2">
          <span className="text-slate-500">Khối lượng nhôm</span>
          <span className="font-semibold text-slate-800">
            {(project.totalAluminumKg ?? 0).toLocaleString('vi-VN')} kg
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-2">
          <span className="text-slate-500">Diện tích kính</span>
          <span className="font-semibold text-slate-800">
            {(project.totalAreaM2 ?? 0).toFixed(1)} m²
          </span>
        </div>
      </div>
    </div>
  );
}

