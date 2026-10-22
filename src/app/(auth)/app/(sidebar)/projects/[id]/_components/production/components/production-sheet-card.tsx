'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { ShieldAlert } from 'lucide-react';
import type { ProductionSheet } from '@/types';
import {
  DoorCadRenderer,
  DEFAULT_FRAME_CONFIG,
  DEFAULT_SASH_CONFIG,
  type SceneCellNode,
  type FrameShape,
  type FrameConfig,
  type SashConfig,
} from '@/components';
import { QUOTATION_TEMPLATE } from '@/config/quotation-template';
import { getFileUrl } from '@/utils';
import { buildCombinedSheetAccessories } from '../utils';
import {
  ProductionSheetLeftTables,
  ProductionSheetProfilesTable,
} from './production-sheet-tables';

interface ProductionSheetCardProps {
  sheet: ProductionSheet;
  index: number;
  printDate?: string;
  className?: string;
}

export function ProductionSheetCard({
  sheet,
  index,
  printDate = new Date().toLocaleDateString('vi-VN'),
  className = '',
}: ProductionSheetCardProps) {
  const sc = (sheet.systemConfig || {}) as Record<string, any>;
  const w: number = Number(sheet.width) || sc.w || 900;
  const h: number = Number(sheet.height) || sc.h || 1200;
  const aluminumColor: string = sc.aluminumColor || '#4A5568';
  const hardwareColor: string = sc.hardwareColor || '#1A202C';
  const frameShape: FrameShape = (sc.frameShape as FrameShape) || 'rect';

  const frameConfig: FrameConfig = sc.frameConfig
    ? {
        ...DEFAULT_FRAME_CONFIG,
        ...sc.frameConfig,
        leftEdge: { ...DEFAULT_FRAME_CONFIG.leftEdge, ...(sc.frameConfig.leftEdge || {}) },
        topEdge: { ...DEFAULT_FRAME_CONFIG.topEdge, ...(sc.frameConfig.topEdge || {}) },
        rightEdge: { ...DEFAULT_FRAME_CONFIG.rightEdge, ...(sc.frameConfig.rightEdge || {}) },
        bottomEdge: { ...DEFAULT_FRAME_CONFIG.bottomEdge, ...(sc.frameConfig.bottomEdge || {}) },
      }
    : DEFAULT_FRAME_CONFIG;

  const sashConfig: SashConfig = sc.sashConfig
    ? { ...DEFAULT_SASH_CONFIG, ...sc.sashConfig }
    : DEFAULT_SASH_CONFIG;

  const rootCell: SceneCellNode | null = sc.rootCell ?? null;

  const combinedAccessories = useMemo(() => buildCombinedSheetAccessories(sheet), [sheet]);
  const doorIndexText = String(index + 1).padStart(2, '0');

  return (
    <div
      className={`production-sheet-page relative mx-auto w-full max-w-[960px] min-h-[1050px] rounded-lg border border-slate-200 bg-white p-6 shadow-sm print:min-h-0 print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none ${className}`}
    >
      <div className="flex items-center gap-4 border-b border-slate-300 pb-3">
        <div className="relative h-14 w-28 shrink-0">
          <Image
            src={QUOTATION_TEMPLATE.logoUrl}
            alt="Xuân Tiệp Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="flex-1 border-l border-slate-300 pl-4 text-[11px] leading-tight text-slate-700">
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-900">
            XUÂN TIỆP WINDOW
          </h2>
          <p className="mt-0.5">
            Trụ sở: TDP Quý Kim 2, (tại nhà ông Bùi Đức Tiệp), phường Nam Đồ Sơn, Hải Phòng.
          </p>
          <p>Nhà máy sx: Số 507 TDP Nghĩa Sơn, phường Nam Đồ Sơn, Hải Phòng.</p>
          <p className="font-medium text-slate-800">
            ĐT: 0569669669 | Email: xuantiepwindow@gmail.com | MST: 0201263785
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg border border-amber-300 bg-amber-50/70 px-4 py-2.5 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <span className="text-amber-700">{doorIndexText} -</span>
          <span>{sheet.positionCode}</span>
          <span className="text-slate-400">|</span>
          <span>S={(sheet.areaM2 || 0).toFixed(1)} m²</span>
          <span className="text-slate-400">|</span>
          <span>{(sheet.totalWeightKg || 0).toFixed(1)} kg</span>
          {sheet.isEstimated && (
            <span className="flex items-center gap-1 rounded bg-amber-200 px-1.5 py-0.5 text-[10px] text-amber-900">
              <ShieldAlert size={11} /> Ước tính
            </span>
          )}
        </div>
        <div className="text-xs font-bold text-amber-800">
          Số lượng: <span className="text-sm text-amber-900">01</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-5">
        <div className="production-sheet-left-col col-span-12 space-y-4 md:col-span-5 print:col-span-5">
          <div className="flex min-h-[300px] items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-white p-2">
            {rootCell ? (
              <div className="h-[290px] w-full">
                <DoorCadRenderer
                  hideDimensions={false}
                  w={w}
                  h={h}
                  aluminumColor={aluminumColor}
                  hardwareColor={hardwareColor}
                  frameShape={frameShape}
                  rootCell={rootCell}
                  frameConfig={frameConfig}
                  sashConfig={sashConfig}
                  selectedCellId={null}
                  onSelectCell={() => {}}
                />
              </div>
            ) : sheet.imagePath ? (
              <div className="relative h-[280px] w-full">
                <Image
                  src={getFileUrl(sheet.imagePath)}
                  alt={sheet.positionCode}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                Chưa có bản vẽ CAD hoặc ảnh mẫu
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 rounded-md border border-slate-200 bg-slate-50 p-2 text-center text-[11px]">
            <div>
              <span className="block text-[10px] text-slate-400">Hãng nhôm:</span>
              <span className="font-bold text-slate-700">{sheet.brandName || 'FV'}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400">Màu nhôm:</span>
              <span className="font-bold text-slate-700">{sheet.colorName || 'Xám'}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400">Ký hiệu:</span>
              <span className="font-bold text-slate-700">{sheet.positionCode}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400">Số lượng:</span>
              <span className="font-bold text-slate-700">1</span>
            </div>
          </div>

          <ProductionSheetLeftTables sheet={sheet} combinedAccessories={combinedAccessories} />
        </div>

        <div className="production-sheet-right-col col-span-12 md:col-span-7 print:col-span-7">
          <ProductionSheetProfilesTable sheet={sheet} />
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-3 text-[11px] text-slate-400">
        <span className="italic font-medium text-slate-600">Thương hiệu cửa số 2 miền bắc</span>
        <span>Ngày xuất: {printDate}</span>
      </div>
    </div>
  );
}

