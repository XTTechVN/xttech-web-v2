'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';
import {
  QUOTATION_LABOR_ROW_LABEL_MAP,
  QUOTATION_LABOR_UNIT_LABEL_MAP,
  QUOTATION_MATERIAL_ROW_LABEL_MAP,
} from '@/config';
import type { QuotationProductionCostBreakdown } from '@/types';

interface QuotationProductionCostCardProps {
  costBreakdown: QuotationProductionCostBreakdown;
  accessoryMode: 'combined' | 'separated';
}

const TH_CLASS = 'py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider';
const TD_LABEL_CLASS = 'py-2 px-3 text-slate-600 pl-6';
const TD_NUM_CLASS = 'py-2 px-3 text-right font-mono tabular-nums text-slate-700';

export function QuotationProductionCostCard({
  costBreakdown,
  accessoryMode,
}: QuotationProductionCostCardProps) {
  const getMaterialLabel = (code: keyof typeof QUOTATION_MATERIAL_ROW_LABEL_MAP) => {
    if (code === 'accessory') {
      return accessoryMode === 'separated' ? 'Phụ kiện (tách rời)' : 'Phụ kiện (gộp)';
    }
    return QUOTATION_MATERIAL_ROW_LABEL_MAP[code] || code;
  };

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-slate-200/80 bg-slate-50/40">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} className="text-primary shrink-0" />
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-800">
            PHÂN TÍCH CẤU THÀNH GIÁ SẢN XUẤT
          </h3>
        </div>
        <div className="text-xs text-slate-500 font-medium tabular-nums">
          Diện tích:{' '}
          <span className="font-bold text-slate-700">{costBreakdown.totalAreaM2.toFixed(2)} m²</span>
          {' · '}KL nhôm:{' '}
          <span className="font-bold text-slate-700">
            {costBreakdown.totalAluminumKg.toFixed(2)} kg
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/60">
              <th className={TH_CLASS}>KHOẢN MỤC CHI PHÍ</th>
              <th className={`${TH_CLASS} text-right`}>THÀNH TIỀN (VNĐ)</th>
              <th className={`${TH_CLASS} text-right`}>TỶ LỆ</th>
              <th className={`${TH_CLASS} text-right`}>ĐƠN GIÁ/M²</th>
            </tr>
          </thead>
          <tbody>
            {/* Nhóm 1: VẬT TƯ */}
            <tr className="bg-slate-50/90 border-b border-slate-200/60">
              <td colSpan={4} className="py-2 px-3 font-bold text-slate-800">
                1. VẬT TƯ
              </td>
            </tr>
            {costBreakdown.materialRows.map((row) => (
              <tr key={row.code} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className={TD_LABEL_CLASS}>{getMaterialLabel(row.code)}</td>
                <td className={TD_NUM_CLASS}>{row.amount.toLocaleString('vi-VN')}</td>
                <td className={`${TD_NUM_CLASS} text-slate-500`}>{row.ratioPercent.toFixed(1)}%</td>
                <td className={TD_NUM_CLASS}>{row.unitCostPerM2.toLocaleString('vi-VN')}</td>
              </tr>
            ))}
            <tr className="border-b border-slate-200/80 bg-slate-50/40 font-bold text-slate-800">
              <td className="py-2 px-3 pl-6">CỘNG VẬT TƯ</td>
              <td className="py-2 px-3 text-right font-mono tabular-nums">
                {costBreakdown.totalMaterialCost.toLocaleString('vi-VN')}
              </td>
              <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-600">
                {costBreakdown.materialRatioPercent.toFixed(1)}%
              </td>
              <td className="py-2 px-3 text-right font-mono tabular-nums">
                {costBreakdown.materialCostPerM2.toLocaleString('vi-VN')}
              </td>
            </tr>

            {/* Nhóm 2: SẢN XUẤT & LẮP ĐẶT */}
            <tr className="bg-slate-50/90 border-b border-slate-200/60">
              <td colSpan={4} className="py-2 px-3 font-bold text-slate-800">
                2. SẢN XUẤT &amp; LẮP ĐẶT
              </td>
            </tr>
            {costBreakdown.laborRows.map((row) => {
              const unitMeta = QUOTATION_LABOR_UNIT_LABEL_MAP[row.unit] ?? {
                unitLabel: row.unit,
                rateSuffix: `đ/${row.unit}`,
              };
              return (
                <tr key={row.code} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className={TD_LABEL_CLASS}>
                    {QUOTATION_LABOR_ROW_LABEL_MAP[row.code] || row.code}
                  </td>
                  <td className={`${TD_NUM_CLASS} text-slate-500`}>
                    {row.quantity.toFixed(2)} {unitMeta.unitLabel}
                  </td>
                  <td className={`${TD_NUM_CLASS} text-slate-500`}>
                    {row.unitPrice.toLocaleString('vi-VN')} {unitMeta.rateSuffix}
                  </td>
                  <td className={TD_NUM_CLASS}>{row.amount.toLocaleString('vi-VN')}</td>
                </tr>
              );
            })}
            <tr className="border-b border-slate-200/80 bg-slate-50/40 font-bold text-slate-800">
              <td className="py-2 px-3 pl-6">CỘNG NHÂN CÔNG</td>
              <td className="py-2 px-3 text-right font-mono tabular-nums">
                {costBreakdown.totalLaborCost.toLocaleString('vi-VN')}
              </td>
              <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-600">
                {costBreakdown.laborRatioPercent.toFixed(1)}%
              </td>
              <td className="py-2 px-3 text-right font-mono tabular-nums">
                {costBreakdown.laborCostPerM2.toLocaleString('vi-VN')}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="bg-primary/5 border-t-2 border-primary/40 text-primary font-bold">
              <td className="py-2.5 px-3">TỔNG GIÁ GỐC DỰ TOÁN</td>
              <td className="py-2.5 px-3 text-right font-mono tabular-nums text-sm">
                {costBreakdown.totalBaseCost.toLocaleString('vi-VN')}
              </td>
              <td className="py-2.5 px-3 text-right font-mono tabular-nums">100%</td>
              <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                {costBreakdown.totalBaseCostPerM2.toLocaleString('vi-VN')} /m²
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

