'use client';

import React from 'react';
import { Grid2X2, Ruler, Wrench } from 'lucide-react';
import { QUOTATION_BOM_UNIT_MAP } from '@/config';
import type { QuotationAuxiliaryStatItem, QuotationMaterialBreakdown } from '@/types';

interface QuotationBomTablesProps {
  breakdown: QuotationMaterialBreakdown;
}

const TH_CLASS =
  'py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap';
const TD_CLASS = 'py-2 px-3 text-slate-700 whitespace-nowrap';
const TD_NUM_CLASS = 'py-2 px-3 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap';
const TD_PRICE_CLASS =
  'py-2 px-3 text-right font-mono tabular-nums text-primary font-bold whitespace-nowrap';
const TFOOT_ROW_CLASS = 'bg-primary/5 border-t border-primary/20 font-bold text-primary';

function formatAuxQuantity(item: QuotationAuxiliaryStatItem): string | number {
  if (item.unit === 'meter') return item.quantity.toFixed(2);
  return Number.isInteger(item.quantity) ? item.quantity : item.quantity.toFixed(2);
}

export function QuotationBomTables({ breakdown }: QuotationBomTablesProps) {
  return (
    <div className="space-y-4">
      {/* Khối 2: THỐNG KÊ PROFILE */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200/80 bg-slate-50/40">
          <Ruler size={16} className="text-primary shrink-0" />
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-800">
            THỐNG KÊ PROFILE
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/60">
                <th className={TH_CLASS}>MÃ PROFILE</th>
                <th className={TH_CLASS}>MÀU SẮC</th>
                <th className={TH_CLASS}>TÊN PROFILE</th>
                <th className={`${TH_CLASS} text-right`}>DÀI (M)</th>
                <th className={`${TH_CLASS} text-right`}>TỶ TRỌNG</th>
                <th className={`${TH_CLASS} text-right`}>SỐ LƯỢNG</th>
                <th className={`${TH_CLASS} text-right`}>CÂN NẶNG (KG)</th>
                <th className={`${TH_CLASS} text-right`}>ĐƠN GIÁ (VNĐ)</th>
                <th className={`${TH_CLASS} text-right`}>THÀNH TIỀN (VNĐ)</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.profiles.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-slate-400">
                    Chưa có dữ liệu thống kê thanh nhôm profile.
                  </td>
                </tr>
              ) : (
                breakdown.profiles.map((item, idx) => (
                  <tr
                    key={`${item.profileCode}-${item.colorId ?? 'none'}-${item.lengthM}-${idx}`}
                    className="border-b border-slate-100 hover:bg-slate-50/50"
                  >
                    <td className={`${TD_CLASS} font-mono font-semibold text-slate-800`}>
                      {item.profileCode}
                    </td>
                    <td className={TD_CLASS}>
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full shrink-0 border border-slate-300"
                          style={{ backgroundColor: item.colorHex || '#cbd5e1' }}
                        />
                        <span>{item.colorName}</span>
                      </span>
                    </td>
                    <td className={TD_CLASS}>{item.profileName}</td>
                    <td className={TD_NUM_CLASS}>{item.lengthM.toFixed(3)}</td>
                    <td className={TD_NUM_CLASS}>{item.weightPerM.toFixed(2)}</td>
                    <td className={`${TD_NUM_CLASS} font-bold text-slate-800`}>{item.quantity}</td>
                    <td className={TD_NUM_CLASS}>{item.weightKg.toFixed(2)}</td>
                    <td className={TD_NUM_CLASS}>{item.unitPrice.toLocaleString('vi-VN')}</td>
                    <td className={TD_PRICE_CLASS}>{item.totalPrice.toLocaleString('vi-VN')}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className={TFOOT_ROW_CLASS}>
                <td colSpan={6} className="py-2.5 px-3 text-left uppercase">
                  TỔNG CỘNG PROFILE:
                </td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                  {breakdown.totalProfileWeightKg.toFixed(2)}
                </td>
                <td className="py-2.5 px-3" />
                <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                  {breakdown.totalProfileCost.toLocaleString('vi-VN')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Khối 3: THỐNG KÊ KÍNH */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200/80 bg-slate-50/40">
          <Grid2X2 size={16} className="text-primary shrink-0" />
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-800">
            THỐNG KÊ KÍNH
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/60">
                <th className={TH_CLASS}>LOẠI KÍNH</th>
                <th className={`${TH_CLASS} text-center`}>KÍCH THƯỚC</th>
                <th className={`${TH_CLASS} text-right`}>SỐ LƯỢNG</th>
                <th className={`${TH_CLASS} text-right`}>DIỆN TÍCH (M²)</th>
                <th className={`${TH_CLASS} text-right`}>ĐƠN GIÁ (Đ/M²)</th>
                <th className={`${TH_CLASS} text-right`}>THÀNH TIỀN (VNĐ)</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.glasses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    Chưa có dữ liệu thống kê kính.
                  </td>
                </tr>
              ) : (
                breakdown.glasses.map((item, idx) => (
                  <tr
                    key={`${item.glassName}-${item.widthMm}-${item.heightMm}-${idx}`}
                    className="border-b border-slate-100 hover:bg-slate-50/50"
                  >
                    <td className={`${TD_CLASS} font-medium text-slate-800`}>{item.glassName}</td>
                    <td className={`${TD_CLASS} text-center font-mono tabular-nums text-slate-600`}>
                      {item.widthMm}×{item.heightMm}
                    </td>
                    <td className={`${TD_NUM_CLASS} font-bold text-slate-800`}>{item.quantity}</td>
                    <td className={TD_NUM_CLASS}>{item.areaM2.toFixed(2)}</td>
                    <td className={TD_NUM_CLASS}>{item.unitPrice.toLocaleString('vi-VN')}</td>
                    <td className={TD_PRICE_CLASS}>{item.totalPrice.toLocaleString('vi-VN')}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className={TFOOT_ROW_CLASS}>
                <td colSpan={3} className="py-2.5 px-3 text-left uppercase">
                  TỔNG CỘNG KÍNH:
                </td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                  {breakdown.totalGlassAreaM2.toFixed(2)}
                </td>
                <td className="py-2.5 px-3" />
                <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                  {breakdown.totalGlassCost.toLocaleString('vi-VN')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Khối 4: ROAN, VẬT TƯ PHỤ & PHỤ KIỆN */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200/80 bg-slate-50/40">
          <Wrench size={16} className="text-primary shrink-0" />
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-800">
            ROAN, VẬT TƯ PHỤ &amp; PHỤ KIỆN
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/60">
                <th className={TH_CLASS}>MÃ VẬT TƯ</th>
                <th className={TH_CLASS}>TÊN VẬT TƯ</th>
                <th className={`${TH_CLASS} text-center`}>ĐVT</th>
                <th className={`${TH_CLASS} text-right`}>SỐ LƯỢNG</th>
                <th className={`${TH_CLASS} text-right`}>ĐƠN GIÁ (VNĐ)</th>
                <th className={`${TH_CLASS} text-right`}>THÀNH TIỀN (VNĐ)</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.auxiliaries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    Chưa có dữ liệu roan, vật tư phụ &amp; phụ kiện.
                  </td>
                </tr>
              ) : (
                breakdown.auxiliaries.map((item, idx) => (
                  <tr
                    key={`${item.itemType}-${item.code}-${idx}`}
                    className="border-b border-slate-100 hover:bg-slate-50/50"
                  >
                    <td className={`${TD_CLASS} font-mono font-semibold text-slate-800`}>
                      {item.code}
                    </td>
                    <td className={TD_CLASS}>{item.name}</td>
                    <td className={`${TD_CLASS} text-center text-slate-500 font-medium`}>
                      {QUOTATION_BOM_UNIT_MAP[item.unit] || item.unit.toUpperCase()}
                    </td>
                    <td className={`${TD_NUM_CLASS} font-bold text-slate-800`}>
                      {formatAuxQuantity(item)}
                    </td>
                    <td className={TD_NUM_CLASS}>{item.unitPrice.toLocaleString('vi-VN')}</td>
                    <td className={TD_PRICE_CLASS}>{item.totalPrice.toLocaleString('vi-VN')}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className={TFOOT_ROW_CLASS}>
                <td colSpan={5} className="py-2.5 px-3 text-left uppercase">
                  TỔNG VẬT TƯ &amp; PHỤ KIỆN:
                </td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                  {breakdown.totalAuxiliaryCost.toLocaleString('vi-VN')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

