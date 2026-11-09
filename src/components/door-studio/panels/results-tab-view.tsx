'use client';

import React, { useState } from 'react';
import { CalculationStep, DoorCalculateResponse } from '@/types';
import { FrameConfig, SashConfig, SceneCellNode } from '../studio-types';
import { detectProfileIssues } from '../utils/detect-profile-issues';
import { Calculator, Info, MapPin } from 'lucide-react';

export { detectProfileIssues };

const CORNER_JOINT_LABEL_MAP: Record<string, string> = {
  '45': 'Ghép 45°',
  '90_horiz': '90° Ngang phủ',
  '90_vert': '90° Dọc phủ',
  '45_top_90_bot': '45° trên - 90° dưới',
  '63': 'Góc 63° (gấp xếp)',
};

interface CalculationStepsBreakdownProps {
  steps?: CalculationStep[];
  note?: string | null;
  positions?: string[];
  fallbackFormula?: string | null;
  fallbackResultLabel: string;
  fallbackResultValue: string;
  fallbackNote: string;
}

const CalculationStepsBreakdown: React.FC<CalculationStepsBreakdownProps> = ({
  steps,
  note,
  positions,
  fallbackFormula,
  fallbackResultLabel,
  fallbackResultValue,
  fallbackNote,
}) => {
  const hasSteps = Boolean(steps && steps.length > 0);
  const regularSteps = hasSteps ? steps!.filter((s) => s.tone !== 'result') : [];
  const resultSteps = hasSteps ? steps!.filter((s) => s.tone === 'result') : [];

  return (
    <div className="space-y-2 text-xs">
      {positions && positions.length > 0 && (
        <div className="flex items-start gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80 text-[11px] text-slate-600">
          <MapPin size={12} className="text-primary shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-700">Vị trí lắp đặt: </span>
            <span>{positions.join(', ')}</span>
          </div>
        </div>
      )}

      <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/80 space-y-2">
        {hasSteps ? (
          <>
            <div className="space-y-1.5 text-slate-700">
              {regularSteps.map((step, idx) => {
                if (step.tone === 'subtotal') {
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 text-slate-700 bg-white px-2 py-1 rounded border border-slate-100"
                    >
                      <span className="flex items-center flex-wrap gap-1">
                        <span>{step.label}</span>
                        {step.formula && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] font-medium">
                            {step.formula}
                          </span>
                        )}
                      </span>
                      <span className="font-bold text-slate-800 font-mono shrink-0">{step.value}</span>
                    </div>
                  );
                }

                const valueToneClass =
                  step.tone === 'deduct'
                    ? 'text-rose-600 font-semibold'
                    : step.tone === 'add'
                      ? 'text-emerald-600 font-semibold'
                      : 'text-slate-800 font-bold';

                return (
                  <div key={idx} className="flex items-center justify-between gap-2">
                    <span className="text-slate-600 flex items-center flex-wrap gap-1">
                      <span>{step.label}</span>
                      {step.formula && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-600 font-mono text-[10px] font-medium">
                          {step.formula}
                        </span>
                      )}
                    </span>
                    <span className={`${valueToneClass} font-mono shrink-0`}>{step.value}</span>
                  </div>
                );
              })}
            </div>

            {resultSteps.map((resStep, rIdx) => (
              <div
                key={rIdx}
                className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between gap-2 bg-primary/5 p-2 rounded border border-primary/20"
              >
                <span className="font-bold text-slate-800 flex items-center flex-wrap gap-1">
                  <span>{resStep.label}</span>
                  {resStep.formula && (
                    <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono text-[10px] font-semibold">
                      {resStep.formula}
                    </span>
                  )}
                </span>
                <span className="font-bold text-primary text-sm font-mono shrink-0">{resStep.value}</span>
              </div>
            ))}
          </>
        ) : (
          <>
            {fallbackFormula && (
              <div className="flex items-center justify-between text-slate-700">
                <span>Công thức áp dụng:</span>
                <span className="font-bold text-primary font-mono">{fallbackFormula}</span>
              </div>
            )}
            <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between bg-primary/5 p-2 rounded border border-primary/20">
              <span className="font-bold text-slate-800">{fallbackResultLabel}</span>
              <span className="font-bold text-primary text-sm font-mono">{fallbackResultValue}</span>
            </div>
          </>
        )}

        <div className="text-[11px] text-slate-500 leading-relaxed pt-0.5">
          * {note || fallbackNote}
        </div>
      </div>
    </div>
  );
};

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
  const [activeSubTab, setActiveSubTab] = useState<'bars' | 'beads' | 'glass' | 'grilles' | 'gaskets'>('bars');
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [selectedBeadIndex, setSelectedBeadIndex] = useState<number | null>(null);
  const [selectedGlassIndex, setSelectedGlassIndex] = useState<number | null>(null);

  const barsList = calcData?.groupedBars ?? calcData?.bars ?? [];
  const selectedBar = selectedBarIndex !== null ? barsList[selectedBarIndex] : null;

  const beadsList = calcData?.groupedBeads ?? calcData?.beads ?? [];
  const selectedBead = selectedBeadIndex !== null ? beadsList[selectedBeadIndex] : null;

  const cellsList = calcData?.cells ?? [];
  const selectedCell = selectedGlassIndex !== null ? cellsList[selectedGlassIndex] : null;

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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs flex flex-col justify-between">
            <span className="text-xs font-medium text-slate-400">Kích thước cửa (W×H)</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-bold text-xs text-slate-900">{w}×{h}</span>
              <span className="text-xs text-slate-400">mm</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs flex flex-col justify-between">
            <span className="text-xs font-medium text-slate-400">Diện tích cửa</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-bold text-xs text-slate-900">{doorAreaM2.toFixed(2)}</span>
              <span className="text-xs text-slate-400">m²</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs flex flex-col justify-between">
            <span className="text-xs font-medium text-slate-400">Khối lượng nhôm</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-bold text-xs text-primary">{totalWeight.toFixed(2)}</span>
              <span className="text-xs text-slate-400">kg</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs flex flex-col justify-between">
            <span className="text-xs font-medium text-slate-400">Diện tích kính</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-bold text-xs text-emerald-600">{totalGlassArea.toFixed(2)}</span>
              <span className="text-xs text-slate-400">m²</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs flex flex-col justify-between col-span-2 sm:col-span-1">
            <span className="text-xs font-medium text-slate-400">Tổng thanh cắt</span>
            <div className="flex items-baseline justify-between mt-1">
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-xs text-slate-900">{totalCutBars}</span>
                <span className="text-xs text-slate-400">thanh</span>
              </div>
              {doorAreaM2 > 0 && totalWeight > 0 && (
                <span className="text-xs text-slate-400">
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
                <div className="flex items-center gap-2 text-xs">
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

            <ul className="space-y-0.5 text-xs text-amber-800/90 pl-4 list-disc">
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
              {calcData.gaskets && calcData.gaskets.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveSubTab('gaskets')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    activeSubTab === 'gaskets'
                      ? 'bg-pink-600/10 text-pink-700 border border-pink-500/25 font-bold shadow-2xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  5. Roan gắn kính ({calcData.gaskets.length})
                </button>
              )}
            </div>

            {/* Table Content */}
            <div className="p-3 sm:p-4 overflow-x-auto">
              {activeSubTab === 'bars' && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                  {/* Cột trái (7 cols): Bảng danh sách thanh cắt */}
                  <div className="xl:col-span-7 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 text-gray-500 font-semibold text-xs">
                          <th className="py-2.5 px-3">Tên thanh</th>
                          <th className="py-2.5 px-3">Mã Profile</th>
                          <th className="py-2.5 px-3 text-right">Chiều dài (mm)</th>
                          <th className="py-2.5 px-3 text-center">Góc cắt</th>
                          <th className="py-2.5 px-3 text-center">Số lượng</th>
                          <th className="py-2.5 px-3">Công thức</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-xs">
                        {(calcData.groupedBars ?? calcData.bars ?? []).map((bar, idx) => {
                          const isSelected = selectedBarIndex === idx;
                          return (
                            <tr
                              key={idx}
                              onClick={() => setSelectedBarIndex(isSelected ? null : idx)}
                              className={`transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-primary/10 hover:bg-primary/15'
                                  : 'hover:bg-gray-50/80'
                              }`}
                            >
                              <td className="py-2.5 px-3 font-medium text-gray-800">
                                <div className="flex items-center gap-1.5">
                                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-primary' : 'bg-slate-300'}`} />
                                  <span>{bar.name}</span>
                                </div>
                              </td>
                              <td className="py-2.5 px-3">
                                {bar.profileCode ? (
                                  <span className="text-gray-900 font-semibold">{bar.profileCode}</span>
                                ) : (
                                  <span className="text-gray-400 text-xs">Chưa chọn profile</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-gray-900">{bar.length}</td>
                              <td className="py-2.5 px-3 text-center text-gray-600">{bar.goc1}° / {bar.goc2}°</td>
                              <td className="py-2.5 px-3 text-center font-bold text-gray-900">{bar.qty}</td>
                              <td className="py-2.5 px-3 text-gray-500 text-xs">{bar.formula || '-'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Cột phải (5 cols): Panel Diễn giải công thức chi tiết */}
                  <div className="xl:col-span-5 bg-slate-50/90 border border-slate-200/90 rounded-xl p-3.5 flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Calculator size={15} className="text-primary" />
                        <span className="font-semibold text-slate-800 text-xs">
                          {selectedBar
                            ? `Chi tiết: ${selectedBar.name}`
                            : 'Diễn giải công thức tính cắt'}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {w} x {h} mm
                      </span>
                    </div>

                    {/* Khối tham số đầu vào & Cấu hình cơ khí đang áp dụng */}
                    <div className="bg-white rounded-lg border border-slate-200/80 p-2.5 space-y-2 text-xs">
                      <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <Info size={13} className="text-blue-500" />
                        <span>Thông số cơ sở hình học & cấu hình:</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-slate-600">
                        <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                          <span className="text-slate-400 block text-[11px]">Rộng phủ bì (W):</span>
                          <span className="font-bold text-slate-800 font-mono">{w} mm</span>
                        </div>
                        <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                          <span className="text-slate-400 block text-[11px]">Cao phủ bì (H):</span>
                          <span className="font-bold text-slate-800 font-mono">{h} mm</span>
                        </div>
                        {sashConfig && (
                          <>
                            <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                              <span className="text-slate-400 block text-[11px]">Ngậm ngang / Ngậm dọc:</span>
                              <span className="font-semibold text-slate-800 font-mono">
                                {sashConfig.ngamNgangMm} / {sashConfig.ngamDocMm} mm
                              </span>
                            </div>
                            <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                              <span className="text-slate-400 block text-[11px]">Trừ đố động / Hở nền:</span>
                              <span className="font-semibold text-slate-800 font-mono">
                                {sashConfig.truDoDongMm} / {sashConfig.hoNenMm} mm
                              </span>
                            </div>
                          </>
                        )}
                        {(frameConfig || sashConfig) && (
                          <div className="col-span-2 bg-slate-50 p-1.5 rounded border border-slate-100 flex items-center justify-between">
                            <span className="text-slate-400 text-[11px]">Góc ghép Khung / Cánh:</span>
                            <span className="font-semibold text-slate-700 text-[11px]">
                              {CORNER_JOINT_LABEL_MAP[frameConfig?.cornerJoint || '45'] || frameConfig?.cornerJoint || 'Ghép 45°'}
                              {' / '}
                              {CORNER_JOINT_LABEL_MAP[sashConfig?.cornerJoint || '45'] || sashConfig?.cornerJoint || 'Ghép 45°'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Nội dung diễn giải theo thanh được chọn hoặc toàn bộ */}
                    <div className="space-y-2 overflow-y-auto max-h-[380px] pr-1">
                      {selectedBar ? (
                        <div className="bg-white rounded-lg border border-primary/30 p-3.5 space-y-3 shadow-2xs">
                          {/* Tiêu đề & thẻ số lượng */}
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <div>
                              <span className="font-bold text-slate-800 text-xs block">{selectedBar.name}</span>
                              <span className="text-[11px] text-slate-400">
                                Mã Profile: {selectedBar.profileCode || 'Chưa gắn mã'}
                                {selectedBar.profileName ? ` (${selectedBar.profileName})` : ''}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="px-2 py-0.5 rounded text-[11px] bg-primary/10 text-primary font-bold">
                                SL: {selectedBar.qty} cây
                              </span>
                              <span className="block text-[11px] text-slate-500 mt-0.5">
                                Góc cắt: {selectedBar.goc1}° / {selectedBar.goc2}°
                              </span>
                            </div>
                          </div>

                          {/* Diễn giải phép tính từng bước trực quan (100% động từ Backend) */}
                          <div className="space-y-2 text-xs">
                            <span className="font-bold text-slate-700 flex items-center gap-1">
                              <span>Các bước tính ra kích thước cắt ({selectedBar.length} mm):</span>
                            </span>

                            <CalculationStepsBreakdown
                              steps={selectedBar.calcSteps}
                              note={selectedBar.calcNote}
                              positions={selectedBar.positions}
                              fallbackFormula={selectedBar.formula}
                              fallbackResultLabel="→ Chiều dài cắt thực tế:"
                              fallbackResultValue={`${selectedBar.length} mm`}
                              fallbackNote="Chiều dài được tính toán tự động dựa theo vị trí lắp đặt và các thông số trừ khấu hao cơ khí trong hệ nhôm."
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-[11px] text-slate-500 italic">
                            * Nhấp vào một thanh bất kỳ ở bảng bên trái để xem diễn giải chi tiết cho thanh đó, hoặc xem tóm lược các quy tắc bên dưới:
                          </p>
                          {(calcData.groupedBars ?? calcData.bars ?? []).map((bar, bIdx) => (
                            <div
                              key={bIdx}
                              onClick={() => setSelectedBarIndex(bIdx)}
                              className="bg-white rounded-lg border border-slate-200/80 p-2.5 text-xs hover:border-primary/50 transition cursor-pointer space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-800">{bar.name}</span>
                                <span className="font-bold text-slate-900">{bar.length} mm</span>
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                                <span className="text-primary font-medium">{bar.formula || '-'}</span>
                                <span>Góc: {bar.goc1}°/{bar.goc2}° | SL: {bar.qty}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeSubTab === 'beads' && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                  {/* Cột trái (7 cols): Bảng danh sách nẹp */}
                  <div className="xl:col-span-7 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 text-gray-500 font-semibold text-xs">
                          <th className="py-2.5 px-3">Tên nẹp kính</th>
                          <th className="py-2.5 px-3">Mã Profile</th>
                          <th className="py-2.5 px-3 text-right">Chiều dài (mm)</th>
                          <th className="py-2.5 px-3 text-center">Góc cắt</th>
                          <th className="py-2.5 px-3 text-center">Số lượng</th>
                          <th className="py-2.5 px-3">Độ dày kính</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-xs">
                        {beadsList.map((bead, idx) => {
                          const isSelected = selectedBeadIndex === idx;
                          return (
                            <tr
                              key={idx}
                              onClick={() => setSelectedBeadIndex(isSelected ? null : idx)}
                              className={`transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-primary/10 hover:bg-primary/15'
                                  : 'hover:bg-gray-50/80'
                              }`}
                            >
                              <td className="py-2.5 px-3 font-medium text-gray-800">
                                <div className="flex items-center gap-1.5">
                                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-primary' : 'bg-slate-300'}`} />
                                  <span>{bead.name}</span>
                                </div>
                              </td>
                              <td className="py-2.5 px-3">
                                {bead.profileCode ? (
                                  <span className="text-gray-900 font-semibold">{bead.profileCode}</span>
                                ) : (
                                  <span className="text-gray-400 text-xs">Chưa chọn profile</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-gray-900">{bead.length}</td>
                              <td className="py-2.5 px-3 text-center text-gray-600">{bead.goc1}° / {bead.goc2}°</td>
                              <td className="py-2.5 px-3 text-center font-bold text-gray-900">{bead.qty}</td>
                              <td className="py-2.5 px-3 text-gray-500">{bead.thicknessMm} mm</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Cột phải (5 cols): Panel Diễn giải nẹp kính */}
                  <div className="xl:col-span-5 bg-slate-50/90 border border-slate-200/90 rounded-xl p-3.5 flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Calculator size={15} className="text-primary" />
                        <span className="font-semibold text-slate-800 text-xs">
                          {selectedBead
                            ? `Chi tiết: ${selectedBead.name}`
                            : 'Diễn giải công thức cắt nẹp kính'}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        Góc cắt: {selectedBead ? `${selectedBead.goc1}°/${selectedBead.goc2}°` : '90°/90°'}
                      </span>
                    </div>

                    <div className="space-y-2 overflow-y-auto max-h-[380px] pr-1">
                      {selectedBead ? (
                        <div className="bg-white rounded-lg border border-primary/30 p-3.5 space-y-3 shadow-2xs">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <div>
                              <span className="font-bold text-slate-800 text-xs block">{selectedBead.name}</span>
                              <span className="text-[11px] text-slate-400">
                                Profile: {selectedBead.profileCode || 'Chưa gắn mã'}
                                {selectedBead.profileName ? ` (${selectedBead.profileName})` : ''}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="px-2 py-0.5 rounded text-[11px] bg-primary/10 text-primary font-bold">
                                SL: {selectedBead.qty} cây
                              </span>
                              <span className="block text-[11px] text-slate-500 mt-0.5">Dày khe kính: {selectedBead.thicknessMm} mm</span>
                            </div>
                          </div>

                          <div className="space-y-2 text-xs">
                            <span className="font-bold text-slate-700 flex items-center gap-1">
                              <span>Các bước tính chiều dài nẹp ({selectedBead.length} mm):</span>
                            </span>

                            <CalculationStepsBreakdown
                              steps={selectedBead.calcSteps}
                              note={selectedBead.calcNote}
                              positions={selectedBead.positions}
                              fallbackFormula={selectedBead.formula}
                              fallbackResultLabel="→ Chiều dài cắt nẹp thực tế:"
                              fallbackResultValue={`${selectedBead.length} mm`}
                              fallbackNote="Thanh nẹp kính dùng để gài giữ mép kính chặt vào khung bao hoặc cánh theo cấu hình góc ghép nẹp đã chọn."
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-[11px] text-slate-500 italic">
                            * Nhấp vào một thanh nẹp bất kỳ ở bảng bên trái để xem diễn giải cách cắt, hoặc xem tóm lược bên dưới:
                          </p>
                          {beadsList.map((bead, bIdx) => (
                            <div
                              key={bIdx}
                              onClick={() => setSelectedBeadIndex(bIdx)}
                              className="bg-white rounded-lg border border-slate-200/80 p-2.5 text-xs hover:border-primary/50 transition cursor-pointer space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-800">{bead.name}</span>
                                <span className="font-bold text-slate-900">{bead.length} mm</span>
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                                <span>Góc cắt: {bead.goc1}° / {bead.goc2}°</span>
                                <span>SL: {bead.qty} cây | Dày kính: {bead.thicknessMm}mm</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeSubTab === 'glass' && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                  {/* Cột trái (7 cols): Bảng kích thước kính */}
                  <div className="xl:col-span-7 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 text-gray-500 font-semibold text-xs">
                          <th className="py-2.5 px-3">Vị trí ô</th>
                          <th className="py-2.5 px-3">Chủng loại kính</th>
                          <th className="py-2.5 px-3 text-right">Rộng x Cao cắt (mm)</th>
                          <th className="py-2.5 px-3 text-right">Diện tích (m²)</th>
                          <th className="py-2.5 px-3 text-right">Đơn giá</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-xs">
                        {cellsList.map((cell, idx) => {
                          const isSelected = selectedGlassIndex === idx;
                          return (
                            <tr
                              key={idx}
                              onClick={() => setSelectedGlassIndex(isSelected ? null : idx)}
                              className={`transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-primary/10 hover:bg-primary/15'
                                  : 'hover:bg-gray-50/80'
                              }`}
                            >
                              <td className="py-2.5 px-3 font-medium text-gray-800">
                                <div className="flex items-center gap-1.5">
                                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-primary' : 'bg-slate-300'}`} />
                                  <span>{cell.path}</span>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-gray-600">{cell.glassName || 'Kính cường lực'}</td>
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
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Cột phải (5 cols): Panel Diễn giải kích thước kính */}
                  <div className="xl:col-span-5 bg-slate-50/90 border border-slate-200/90 rounded-xl p-3.5 flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Calculator size={15} className="text-primary" />
                        <span className="font-semibold text-slate-800 text-xs">
                          {selectedCell
                            ? `Chi tiết: Ô ${selectedCell.path}`
                            : 'Diễn giải công thức đặt kính'}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {selectedCell ? `${selectedCell.glassW} x ${selectedCell.glassH} mm` : ''}
                      </span>
                    </div>

                    <div className="space-y-2 overflow-y-auto max-h-[380px] pr-1">
                      {selectedCell ? (
                        <div className="bg-white rounded-lg border border-primary/30 p-3.5 space-y-3 shadow-2xs">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <div>
                              <span className="font-bold text-slate-800 text-xs block">Vị trí: {selectedCell.path}</span>
                              <span className="text-[11px] text-slate-400">Chủng loại: {selectedCell.glassName || 'Kính cường lực'}</span>
                            </div>
                            <div className="text-right">
                              <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                                DT: {selectedCell.areaM2?.toFixed(2)} m²
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2 text-xs">
                            <span className="font-bold text-slate-700 flex items-center gap-1">
                              <span>Các bước tính kích thước cắt kính ({selectedCell.glassW} × {selectedCell.glassH} mm):</span>
                            </span>

                            <CalculationStepsBreakdown
                              steps={selectedCell.calcSteps}
                              note={selectedCell.calcNote}
                              fallbackResultLabel="→ Kích thước đặt xưởng kính:"
                              fallbackResultValue={`${selectedCell.glassW} × ${selectedCell.glassH} mm`}
                              fallbackNote="Tấm kính được tính toán từ kích thước lọt lòng cộng độ ngậm kính mỗi cạnh và trừ khe hở chèn gioăng."
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-[11px] text-slate-500 italic">
                            * Nhấp vào một ô kính bất kỳ ở bảng bên trái để xem kích thước cắt chi tiết, hoặc xem danh sách bên dưới:
                          </p>
                          {cellsList.map((cell, cIdx) => (
                            <div
                              key={cIdx}
                              onClick={() => setSelectedGlassIndex(cIdx)}
                              className="bg-white rounded-lg border border-slate-200/80 p-2.5 text-xs hover:border-primary/50 transition cursor-pointer space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-800">Ô {cell.path}</span>
                                <span className="font-bold text-slate-900">{cell.glassW} × {cell.glassH} mm</span>
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                                <span>{cell.glassName || 'Kính cường lực'}</span>
                                <span>Diện tích: {cell.areaM2?.toFixed(2)} m²</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeSubTab === 'grilles' && (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 font-semibold text-xs">
                      <th className="py-2.5 px-3">Vị trí ô kính</th>
                      <th className="py-2.5 px-3">Bản nan & Màu</th>
                      <th className="py-2.5 px-3 text-right">Nan chia lưới (m)</th>
                      <th className="py-2.5 px-3 text-right">Nan viền (m)</th>
                      <th className="py-2.5 px-3 text-right">Nan góc (m)</th>
                      <th className="py-2.5 px-3 text-center">Tổng mét dài</th>
                      <th className="py-2.5 px-3 text-center">Hoa văn</th>
                      <th className="py-2.5 px-3 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {calcData.grilles?.map((g, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-gray-800">{g.cellPath}</td>
                        <td className="py-2.5 px-3 text-gray-700">
                          Nan {g.barWidthMm}mm ({g.barColor})
                        </td>
                        <td className="py-2.5 px-3 text-right text-gray-600">{g.gridLengthM}</td>
                        <td className="py-2.5 px-3 text-right text-gray-600">{g.borderLengthM}</td>
                        <td className="py-2.5 px-3 text-right text-gray-600">{g.cornerLengthM}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-gray-900">{g.totalBarLengthM} m</td>
                        <td className="py-2.5 px-3 text-center">
                          {g.motifQty > 0 ? (
                            <span className="font-medium text-gray-900 text-xs">
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

              {activeSubTab === 'gaskets' && (
                <div className="space-y-3">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-500 font-semibold text-xs bg-slate-50/50">
                        <th className="py-2.5 px-3">Tên vật tư roan</th>
                        <th className="py-2.5 px-3 text-center">Vị trí</th>
                        <th className="py-2.5 px-3">Cách tính</th>
                        <th className="py-2.5 px-3 text-right">Chiều dài (m)</th>
                        <th className="py-2.5 px-3 text-center">ĐVT</th>
                        <th className="py-2.5 px-3 text-right">Đơn giá (đ)</th>
                        <th className="py-2.5 px-3 text-right">Thành tiền (đ)</th>
                        <th className="py-2.5 px-3">Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs">
                      {calcData.gaskets?.map((g, idx) => {
                        const measureMap: Record<string, string> = {
                          bead: g.target === 'frame' ? 'Theo nẹp kính ô fix' : 'Theo nẹp kính cánh',
                          glass_perimeter: g.target === 'frame' ? 'Theo chu vi kính ô fix' : 'Theo chu vi kính cánh',
                          glass_width: g.target === 'frame' ? 'Theo chiều rộng kính ô fix' : 'Theo chiều rộng kính cánh',
                          glass_height: g.target === 'frame' ? 'Theo chiều cao kính ô fix' : 'Theo chiều cao kính cánh',
                          frame_perimeter: 'Theo chu vi khung bao',
                          frame_width: 'Theo chiều rộng khung bao',
                          frame_height: 'Theo chiều cao khung bao',
                          sash_perimeter: 'Theo chu vi cánh',
                          sash_width: 'Theo chiều rộng cánh',
                          sash_height: 'Theo chiều cao cánh',
                        };
                        return (
                          <tr key={idx} className="hover:bg-pink-50/20 transition-colors">
                            <td className="py-2.5 px-3 font-medium text-gray-900">
                              {g.name}
                              {g.code && <span className="text-[11px] text-slate-400 block font-mono">{g.code}</span>}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  g.target === 'frame'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}
                              >
                                {g.target === 'frame' ? 'Khung' : 'Cánh'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-gray-600">
                              {measureMap[g.measure] || g.measure}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-gray-900">
                              {g.lengthM}
                            </td>
                            <td className="py-2.5 px-3 text-center text-gray-600">{g.unit || 'm'}</td>
                            <td className="py-2.5 px-3 text-right text-gray-700">
                              {g.unitPrice ? g.unitPrice.toLocaleString('vi-VN') : '0'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-pink-700">
                              {g.totalPrice ? g.totalPrice.toLocaleString('vi-VN') : '0'} đ
                            </td>
                            <td className="py-2.5 px-3 text-gray-500 text-[11px]">{g.note || '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Tổng kết roan */}
                  <div className="flex justify-end items-center gap-6 pt-3 border-t border-slate-200 text-xs font-semibold">
                    <div className="text-slate-600">
                      Tổng chiều dài roan:{' '}
                      <span className="text-slate-900 font-bold">
                        {calcData.totalGasketLengthM ||
                          calcData.gaskets?.reduce((sum, it) => sum + it.lengthM, 0).toFixed(2)}{' '}
                        m
                      </span>
                    </div>
                    <div className="text-slate-600">
                      Tổng chi phí roan:{' '}
                      <span className="text-pink-700 font-bold text-sm">
                        {(
                          calcData.totalGasketPrice ||
                          calcData.gaskets?.reduce((sum, it) => sum + it.totalPrice, 0) ||
                          0
                        ).toLocaleString('vi-VN')}{' '}
                        đ
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
