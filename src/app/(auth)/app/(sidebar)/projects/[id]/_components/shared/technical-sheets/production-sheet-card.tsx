'use client';

import React, { useId, useMemo } from 'react';
import { ShieldAlert } from 'lucide-react';
import { DoorCadRenderer } from '@/components';
import { QUOTATION_TEMPLATE } from '@/config/quotation-template';
import type { ProductionSheet } from '@/types';
import { cn, resolvePositionVisual } from '@/utils';
import { OutsourcedSheetSpecPanel } from './outsourced-sheet-spec-panel';
import {
  ProductionSheetLeftTables,
  ProductionSheetProfilesTable,
} from './production-sheet-tables';
import {
  buildCombinedSheetAccessories,
  buildNormalizedSheetGaskets,
  extractSheetCadProps,
} from './technical-sheets.utils';

interface ProductionSheetCardProps {
  sheet: ProductionSheet;
  index: number;
  printDate?: string;
  className?: string;
  compactHeader?: boolean;
}

export function ProductionSheetCard({
  sheet,
  index,
  printDate = new Date().toLocaleDateString('vi-VN'),
  className = '',
  compactHeader = false,
}: ProductionSheetCardProps) {
  const svgId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const isOutsourced = sheet.fulfillmentType === 'outsourced';
  const qty = Math.max(1, Number(sheet.quantity) || 1);
  const qtyText = String(qty).padStart(2, '0');
  const doorIndexText = String(index + 1).padStart(2, '0');

  const visual = resolvePositionVisual({
    visualMode: sheet.visualMode ?? 'cad',
    customImagePath: sheet.customImagePath,
    catalogImagePath: sheet.catalogImagePath ?? sheet.imagePath,
    imagePath: sheet.imagePath,
    systemConfig: sheet.systemConfig ?? null,
  });

  const cadProps = useMemo(
    () => extractSheetCadProps(sheet, visual.systemConfig),
    [sheet, visual.systemConfig],
  );
  const combinedAccessories = useMemo(() => buildCombinedSheetAccessories(sheet), [sheet]);
  const normalizedSheet = useMemo(
    () => ({ ...sheet, gaskets: buildNormalizedSheetGaskets(sheet) }),
    [sheet],
  );

  return (
    <div
      className={cn(
        'production-sheet-page relative mx-auto w-full max-w-[960px] rounded-control border border-slate-200 bg-white p-6 shadow-sm print:min-h-0 print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none',
        !compactHeader && 'min-h-[1050px]',
        className,
      )}
    >
      <div
        className={cn(
          'production-sheet-letterhead items-center gap-4 border-b border-slate-300 pb-3',
          compactHeader ? 'hidden print:flex' : 'flex',
        )}
      >
        <img
          src={QUOTATION_TEMPLATE.logoUrl}
          alt="Xuân Tiệp Logo"
          loading="eager"
          className="h-14 w-28 shrink-0 object-contain"
        />
        <div className="flex-1 border-l border-slate-300 pl-4 text-[11px] leading-tight text-slate-700">
          <h2 className="text-sm font-extrabold tracking-wide text-slate-900">
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

      <div
        className={cn(
          'flex flex-wrap items-center justify-between gap-2 rounded-control border px-4 py-2.5 text-xs',
          compactHeader
            ? 'border-primary/25 bg-primary/5 print:mt-4'
            : 'mt-4 border-amber-300 bg-amber-50/70',
        )}
      >
        <div className="flex flex-wrap items-center gap-2 font-bold text-slate-800">
          <span className={compactHeader ? 'text-primary' : 'text-amber-700'}>
            {doorIndexText} -
          </span>
          <span>{sheet.positionCode}</span>
          {sheet.floorName && (
            <>
              <span className="text-slate-400">|</span>
              <span className="font-semibold text-slate-600">{sheet.floorName}</span>
            </>
          )}
          <span className="text-slate-400">|</span>
          <span className="tabular-nums">S={(sheet.areaM2 || 0).toFixed(2)} m²</span>
          {!isOutsourced && (
            <>
              <span className="text-slate-400">|</span>
              <span className="tabular-nums">
                {(sheet.totalWeightKg || 0).toFixed(1)} kg
              </span>
            </>
          )}
          {isOutsourced && (
            <span className="rounded border border-primary/25 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
              Nhập NCC
            </span>
          )}
          {sheet.isEstimated && (
            <span className="flex items-center gap-1 rounded bg-amber-200 px-1.5 py-0.5 text-[10px] text-amber-900">
              <ShieldAlert size={11} /> Ước tính
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              'rounded-full border px-2 py-0.5 text-[10px] font-semibold',
              compactHeader
                ? 'border-primary/25 bg-white text-primary'
                : 'border-amber-300 bg-white text-amber-800',
            )}
          >
            Định mức / 1 bộ
          </span>
          <div
            className={cn(
              'text-xs font-bold',
              compactHeader ? 'text-primary' : 'text-amber-800',
            )}
          >
            Số lượng:{' '}
            <span
              className={cn(
                'tabular-nums text-sm',
                compactHeader ? 'text-primary' : 'text-amber-900',
              )}
            >
              {qtyText}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-5">
        <div className="production-sheet-left-col col-span-12 space-y-4 md:col-span-5 print:col-span-5">
          <div className="flex min-h-[300px] items-center justify-center overflow-hidden rounded-control border border-slate-200 bg-white p-2">
            {visual.systemConfig && cadProps.rootCell ? (
              <div className="h-[290px] w-full">
                <DoorCadRenderer
                  id={svgId}
                  hideDimensions={false}
                  w={cadProps.w}
                  h={cadProps.h}
                  aluminumColor={cadProps.aluminumColor}
                  hardwareColor={cadProps.hardwareColor}
                  frameShape={cadProps.frameShape}
                  rootCell={cadProps.rootCell}
                  frameConfig={cadProps.frameConfig}
                  sashConfig={cadProps.sashConfig}
                  selectedCellId={null}
                  onSelectCell={() => {}}
                />
              </div>
            ) : visual.imageUrl ? (
              <img
                src={visual.imageUrl}
                alt={sheet.positionCode}
                loading="eager"
                className="h-[280px] w-full object-contain"
              />
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                Chưa có bản vẽ CAD hoặc ảnh mẫu
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 rounded-control border border-slate-200 bg-slate-50 p-2 text-center text-[11px]">
            {isOutsourced ? (
              <>
                <div>
                  <span className="block text-[10px] text-slate-400">Nhà cung cấp:</span>
                  <span className="font-bold text-slate-700">{sheet.supplierName || '—'}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400">Nguồn cửa:</span>
                  <span className="font-bold text-primary">Nhập NCC</span>
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className="block text-[10px] text-slate-400">Hãng nhôm:</span>
                  <span className="font-bold text-slate-700">{sheet.brandName || '—'}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400">Màu nhôm:</span>
                  <span className="font-bold text-slate-700">{sheet.colorName || '—'}</span>
                </div>
              </>
            )}
            <div>
              <span className="block text-[10px] text-slate-400">Ký hiệu:</span>
              <span className="font-bold text-slate-700">{sheet.positionCode}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400">Số lượng:</span>
              <span className="tabular-nums font-bold text-slate-700">{qty}</span>
            </div>
          </div>

          {!isOutsourced && (
            <ProductionSheetLeftTables
              sheet={normalizedSheet}
              combinedAccessories={combinedAccessories}
            />
          )}
        </div>

        <div className="production-sheet-right-col col-span-12 md:col-span-7 print:col-span-7">
          {isOutsourced ? (
            <OutsourcedSheetSpecPanel sheet={sheet} />
          ) : (
            <div className="space-y-3">
              <ProductionSheetProfilesTable sheet={sheet} />
              {sheet.measureNote && (
                <div className="rounded-control border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs text-slate-700">
                  <span className="font-semibold text-slate-800">Ghi chú đo đạc: </span>
                  <span className="whitespace-pre-line">{sheet.measureNote}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div
        className={cn(
          'production-sheet-footer mt-8 items-center justify-between border-t border-slate-200 pt-3 text-[11px] text-slate-400',
          compactHeader ? 'hidden print:flex' : 'flex',
        )}
      >
        <span className="italic font-medium text-slate-600">Thương hiệu cửa số 2 miền bắc</span>
        <span>Ngày xuất: {printDate}</span>
      </div>
    </div>
  );
}
