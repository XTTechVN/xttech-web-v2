'use client';

import React, { useState } from 'react';
import { DoorCalculateResponse } from '@/types';
import { FrameConfig, SashConfig, SceneCellNode } from '../studio-types';
import { detectProfileIssues } from '../utils/detect-profile-issues';

export { detectProfileIssues };

interface ResultsTabViewProps {
  calcData: DoorCalculateResponse | null;
  isCalculating: boolean;
  w?: number;
  h?: number;
  rootCell?: SceneCellNode;
  frameConfig?: FrameConfig;
  sashConfig?: SashConfig;
  seriesId?: number;
  onNavigateTab?: (tab: 'info' | 'draw' | 'config' | 'bom' | 'accessories') => void;
}

export const ResultsTabView: React.FC<ResultsTabViewProps> = ({
  calcData,
  isCalculating,
  w = 1400,
  h = 1600,
  rootCell,
  frameConfig,
  sashConfig,
  seriesId,
  onNavigateTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'bars' | 'beads' | 'glass' | 'grilles' | 'accessories'>('bars');

  const totalWeight = calcData?.totalAluminumWeightKg ?? 0;
  const totalGlassArea = calcData?.totalGlassAreaM2 ?? 0;
  const doorAreaM2 = (w * h) / 1000000;
  const totalCutBars = (calcData?.bars?.length || 0) + (calcData?.beads?.length || 0);

  const issues = detectProfileIssues({
    rootCell,
    frameConfig,
    sashConfig,
    seriesId,
    calcData,
  });

  return (
    <div className="p-4 sm:p-6 bg-slate-50/60 min-h-full">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Technical Stats: KPI Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs flex flex-col justify-between">
            <span className="text-[11px] font-medium text-slate-400">Kích thước cửa (W×H)</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-mono font-bold text-base text-slate-900">{w}×{h}</span>
              <span className="text-[10px] text-slate-400 font-sans">mm</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs flex flex-col justify-between">
            <span className="text-[11px] font-medium text-slate-400">Diện tích cửa</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-mono font-bold text-base text-slate-900">{doorAreaM2.toFixed(2)}</span>
              <span className="text-[10px] text-slate-400 font-sans">m²</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs flex flex-col justify-between">
            <span className="text-[11px] font-medium text-slate-400">Khối lượng nhôm</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-mono font-bold text-base text-primary">{totalWeight.toFixed(2)}</span>
              <span className="text-[10px] text-slate-400 font-sans">kg</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs flex flex-col justify-between">
            <span className="text-[11px] font-medium text-slate-400">Diện tích kính</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-mono font-bold text-base text-emerald-600">{totalGlassArea.toFixed(2)}</span>
              <span className="text-[10px] text-slate-400 font-sans">m²</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs flex flex-col justify-between col-span-2 sm:col-span-1">
            <span className="text-[11px] font-medium text-slate-400">Tổng thanh cắt</span>
            <div className="flex items-baseline justify-between mt-1">
              <div className="flex items-baseline gap-1">
                <span className="font-mono font-bold text-base text-slate-900">{totalCutBars}</span>
                <span className="text-[10px] text-slate-400 font-sans">thanh</span>
              </div>
              {doorAreaM2 > 0 && totalWeight > 0 && (
                <span className="text-[10px] text-slate-400 font-mono">
                  {(totalWeight / doorAreaM2).toFixed(1)} kg/m²
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Minimalist Issue Alert */}
        {issues.length > 0 && (
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 space-y-1.5 text-xs text-amber-900 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Lưu ý cấu hình ({issues.length} mục cần kiểm tra lại):
              </span>
              {onNavigateTab && (
                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => onNavigateTab('config')}
                    className="hover:underline text-amber-900 font-bold cursor-pointer"
                  >
                    Cấu hình nhôm →
                  </button>
                  <span className="text-amber-300">|</span>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('accessories')}
                    className="hover:underline text-blue-700 font-bold cursor-pointer"
                  >
                    Chọn phụ kiện & ke →
                  </button>
                </div>
              )}
            </div>

            <ul className="space-y-0.5 text-[11px] text-amber-800/90 pl-4 list-disc">
              {issues.map((msg, idx) => (
                <li key={idx}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Sub-tab Navigation */}
        {!calcData ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 space-y-2 shadow-2xs">
            <p className="font-bold text-sm text-slate-700">Chưa có kết quả bóc tách vật tư</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Vui lòng hoàn tất cấu hình thanh profile ở tab Cấu hình để hệ thống tự động bóc tách cắt nhôm, nẹp kính và kính.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="border-b border-slate-200/80 px-4 pt-3 pb-2 flex items-center gap-1.5 bg-slate-50/50 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveSubTab('bars')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  activeSubTab === 'bars'
                    ? 'bg-primary/10 text-primary border border-primary/25 font-bold shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70 hover:text-slate-900'
                }`}
              >
                1. Cắt thanh nhôm ({calcData.groupedBars?.length || calcData.bars?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('beads')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  activeSubTab === 'beads'
                    ? 'bg-primary/10 text-primary border border-primary/25 font-bold shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70 hover:text-slate-900'
                }`}
              >
                2. Cắt nẹp kính ({calcData.groupedBeads?.length || calcData.beads?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('glass')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  activeSubTab === 'glass'
                    ? 'bg-primary/10 text-primary border border-primary/25 font-bold shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70 hover:text-slate-900'
                }`}
              >
                3. Kích thước đặt kính ({calcData.cells?.length || 0})
              </button>
              {calcData.grilles && calcData.grilles.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveSubTab('grilles')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    activeSubTab === 'grilles'
                      ? 'bg-primary/10 text-primary border border-primary/25 font-bold shadow-2xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  4. Kính nan đồng ({calcData.grilles.length})
                </button>
              )}
              {calcData.accessories && calcData.accessories.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveSubTab('accessories')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    activeSubTab === 'accessories'
                      ? 'bg-primary/10 text-primary border border-primary/25 font-bold shadow-2xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  5. Phụ kiện ({calcData.accessories.length})
                </button>
              )}
            </div>

            {/* Table Content */}
            <div className="p-3 sm:p-4 overflow-x-auto">
              {activeSubTab === 'bars' && (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 font-semibold text-[11px]">
                      <th className="py-2 px-3">Tên thanh</th>
                      <th className="py-2 px-3">Mã Profile</th>
                      <th className="py-2 px-3 text-right">Chiều dài (mm)</th>
                      <th className="py-2 px-3 text-center">Góc cắt</th>
                      <th className="py-2 px-3 text-center">Số lượng</th>
                      <th className="py-2 px-3">Công thức</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-mono text-xs">
                    {(calcData.groupedBars ?? calcData.bars ?? []).map((bar, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="py-2.5 px-3 font-sans font-medium text-gray-800">{bar.name}</td>
                        <td className="py-2.5 px-3">
                          {bar.profileCode ? (
                            <span className="text-gray-900 font-semibold">{bar.profileCode}</span>
                          ) : (
                            <span className="text-gray-400 text-[11px] font-sans">
                              Chưa chọn profile
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-gray-900">{bar.length}</td>
                        <td className="py-2.5 px-3 text-center text-gray-600">{bar.goc1}° / {bar.goc2}°</td>
                        <td className="py-2.5 px-3 text-center font-bold text-gray-900">{bar.qty}</td>
                        <td className="py-2.5 px-3 text-gray-400 font-sans text-[11px]">{bar.formula || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeSubTab === 'beads' && (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 font-semibold text-[11px]">
                      <th className="py-2 px-3">Tên nẹp kính</th>
                      <th className="py-2 px-3">Mã Profile</th>
                      <th className="py-2 px-3 text-right">Chiều dài (mm)</th>
                      <th className="py-2 px-3 text-center">Góc cắt</th>
                      <th className="py-2 px-3 text-center">Số lượng</th>
                      <th className="py-2 px-3">Độ dày kính</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-mono text-xs">
                    {(calcData.groupedBeads ?? calcData.beads ?? []).map((bead, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="py-2.5 px-3 font-sans font-medium text-gray-800">{bead.name}</td>
                        <td className="py-2.5 px-3">
                          {bead.profileCode ? (
                            <span className="text-gray-900 font-semibold">{bead.profileCode}</span>
                          ) : (
                            <span className="text-gray-400 text-[11px] font-sans">
                              Chưa chọn profile
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-gray-900">{bead.length}</td>
                        <td className="py-2.5 px-3 text-center text-gray-600">{bead.goc1}° / {bead.goc2}°</td>
                        <td className="py-2.5 px-3 text-center font-bold text-gray-900">{bead.qty}</td>
                        <td className="py-2.5 px-3 text-gray-500">{bead.thicknessMm} mm</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeSubTab === 'glass' && (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 font-semibold text-[11px]">
                      <th className="py-2 px-3">Vị trí ô</th>
                      <th className="py-2 px-3">Chủng loại kính</th>
                      <th className="py-2 px-3 text-right">Rộng x Cao cắt (mm)</th>
                      <th className="py-2 px-3 text-right">Diện tích (m²)</th>
                      <th className="py-2 px-3 text-right">Đơn giá</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-mono text-xs">
                    {calcData.cells?.map((cell, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="py-2.5 px-3 font-sans font-medium text-gray-800">{cell.path}</td>
                        <td className="py-2.5 px-3 text-gray-600 font-sans">{cell.glassName || 'Kính cường lực'}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-gray-900">
                          {cell.glassW} × {cell.glassH}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-gray-900">
                          {cell.areaM2?.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-gray-600">
                          {cell.glassPrice ? cell.glassPrice.toLocaleString('vi-VN') + ' đ' : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeSubTab === 'grilles' && (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 font-semibold text-[11px]">
                      <th className="py-2 px-3">Vị trí ô kính</th>
                      <th className="py-2 px-3">Bản nan & Màu</th>
                      <th className="py-2 px-3 text-right">Nan chia lưới (m)</th>
                      <th className="py-2 px-3 text-right">Nan viền (m)</th>
                      <th className="py-2 px-3 text-right">Nan góc (m)</th>
                      <th className="py-2 px-3 text-center">Tổng mét dài</th>
                      <th className="py-2 px-3 text-center">Hoa văn</th>
                      <th className="py-2 px-3 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-mono text-xs">
                    {calcData.grilles?.map((g, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="py-2.5 px-3 font-sans font-medium text-gray-800">{g.cellPath}</td>
                        <td className="py-2.5 px-3 font-sans text-gray-700">
                          Nan {g.barWidthMm}mm ({g.barColor})
                        </td>
                        <td className="py-2.5 px-3 text-right text-gray-600">{g.gridLengthM}</td>
                        <td className="py-2.5 px-3 text-right text-gray-600">{g.borderLengthM}</td>
                        <td className="py-2.5 px-3 text-right text-gray-600">{g.cornerLengthM}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-gray-900">{g.totalBarLengthM} m</td>
                        <td className="py-2.5 px-3 text-center">
                          {g.motifQty > 0 ? (
                            <span className="font-sans font-medium text-gray-900 text-xs">
                              {g.motifQty} con
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-gray-900">
                          {g.totalPrice.toLocaleString('vi-VN')} đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeSubTab === 'accessories' && (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 font-semibold text-[11px]">
                      <th className="py-2 px-3">Phụ kiện & Mã vật tư</th>
                      <th className="py-2 px-3">Gói nguồn</th>
                      <th className="py-2 px-3 text-center">ĐVT</th>
                      <th className="py-2 px-3 text-center">Số lượng</th>
                      <th className="py-2 px-3 text-right">Đơn giá</th>
                      <th className="py-2 px-3 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {calcData.accessories?.map((acc, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-gray-900">{acc.name}</div>
                          {acc.code && <div className="text-[10px] text-gray-400 font-mono">{acc.code}</div>}
                        </td>
                        <td className="py-2.5 px-3 text-gray-600 text-[11px]">{acc.comboName || 'Phụ kiện lẻ'}</td>
                        <td className="py-2.5 px-3 text-center text-gray-600">{acc.unit || 'cái'}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-gray-900 font-mono">{acc.quantity}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-gray-600">
                          {acc.unitPrice > 0 ? `${acc.unitPrice.toLocaleString('vi-VN')} đ` : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-blue-700 font-mono">
                          {acc.totalPrice > 0 ? `${acc.totalPrice.toLocaleString('vi-VN')} đ` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
