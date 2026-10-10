'use client';

import React, { useState } from 'react';
import { DoorCalculateResponse } from '@/types';
import { FrameConfig, SashConfig, SceneCellNode } from '../studio-types';
import { detectProfileIssues } from '../utils/detect-profile-issues';
import { Calculator, Info } from 'lucide-react';

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
  const [activeSubTab, setActiveSubTab] = useState<'bars' | 'beads' | 'glass' | 'grilles'>('bars');
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

                    {/* Khối tham số đầu vào */}
                    <div className="bg-white rounded-lg border border-slate-200/80 p-2.5 space-y-2 text-xs">
                      <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <Info size={13} className="text-blue-500" />
                        <span>Thông số cơ sở hình học:</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-slate-600">
                        <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                          <span className="text-slate-400 block text-[11px]">Rộng phủ bì (W):</span>
                          <span className="font-bold text-slate-800">{w} mm</span>
                        </div>
                        <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                          <span className="text-slate-400 block text-[11px]">Cao phủ bì (H):</span>
                          <span className="font-bold text-slate-800">{h} mm</span>
                        </div>
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
                              <span className="text-[11px] text-slate-400">Mã Profile: {selectedBar.profileCode || 'Chưa gắn mã'}</span>
                            </div>
                            <div className="text-right">
                              <span className="px-2 py-0.5 rounded text-[11px] bg-primary/10 text-primary font-bold">
                                SL: {selectedBar.qty} cây
                              </span>
                              <span className="block text-[11px] text-slate-500 mt-0.5">Góc cắt: {selectedBar.goc1}° / {selectedBar.goc2}°</span>
                            </div>
                          </div>

                          {/* Diễn giải phép tính từng bước trực quan */}
                          <div className="space-y-2 text-xs">
                            <span className="font-bold text-slate-700 flex items-center gap-1">
                              <span>Các bước tính ra kích thước cắt ({selectedBar.length} mm):</span>
                            </span>

                            {/* Trường hợp 1: Khung bao phủ bì */}
                            {(selectedBar.name.toLowerCase().includes('khung') && (selectedBar.formula === 'H' || selectedBar.formula === 'W')) && (
                              <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/80 space-y-1.5">
                                <div className="flex items-center justify-between text-slate-700">
                                  <span>1. Kích thước phủ bì mép tường:</span>
                                  <span className="font-bold">{selectedBar.formula === 'H' ? `${h} mm (Chiều cao H)` : `${w} mm (Chiều rộng W)`}</span>
                                </div>
                                <div className="text-[11px] text-slate-500 leading-relaxed pt-1 border-t border-slate-200/60">
                                  Thanh khung bao áp sát trực tiếp vào mép tường hoàn thiện nên chiều dài cắt giữ nguyên bằng kích thước phủ bì ô chờ, cắt vát 45° ở hai đầu để đấu góc.
                                </div>
                              </div>
                            )}

                            {/* Trường hợp 2: Thanh cánh đứng (2168.3 mm) */}
                            {(selectedBar.name.toLowerCase().includes('cánh') && selectedBar.category === 'sash_h') && (
                              <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/80 space-y-2">
                                <div className="space-y-1 text-slate-700">
                                  <div className="flex items-center justify-between">
                                    <span>• Bước 1: Chiều cao phủ bì (H):</span>
                                    <span className="font-bold">{h} mm</span>
                                  </div>
                                  <div className="flex items-center justify-between text-slate-600">
                                    <span>• Bước 2: Trừ bản khung bao trên & dưới (2 x 43.9):</span>
                                    <span className="font-semibold text-rose-600">- 87.8 mm</span>
                                  </div>
                                  <div className="flex items-center justify-between text-slate-600 bg-white px-2 py-1 rounded border border-slate-100">
                                    <span>→ Chiều cao lọt lòng trong khung:</span>
                                    <span className="font-bold text-slate-800">2212.2 mm</span>
                                  </div>
                                  <div className="flex items-center justify-between text-slate-600">
                                    <span>• Bước 3: Trừ khe hở & hèm đón cánh (Trừ cánh):</span>
                                    <span className="font-semibold text-rose-600">- 43.9 mm</span>
                                  </div>
                                </div>
                                <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between bg-primary/5 p-2 rounded border border-primary/20">
                                  <span className="font-bold text-slate-800">→ Chiều dài cắt thực tế:</span>
                                  <span className="font-bold text-primary text-sm">{selectedBar.length} mm</span>
                                </div>
                                <div className="text-[11px] text-slate-500 leading-relaxed pt-0.5">
                                  * Cánh cửa nằm lọt bên trong khung bao. Phép tính tự động lấy chiều cao lọt lòng trừ đi phần khe hở kỹ thuật để cánh đóng mở êm ái mà không bị cạ chạm vào khung.
                                </div>
                              </div>
                            )}

                            {/* Trường hợp 3: Thanh cánh ngang (826.6 mm) */}
                            {(selectedBar.name.toLowerCase().includes('cánh') && selectedBar.category === 'sash_w') && (
                              <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/80 space-y-2">
                                <div className="space-y-1 text-slate-700">
                                  <div className="flex items-center justify-between">
                                    <span>• Bước 1: Chiều rộng phủ bì (W):</span>
                                    <span className="font-bold">{w} mm</span>
                                  </div>
                                  <div className="flex items-center justify-between text-slate-600">
                                    <span>• Bước 2: Trừ khung bao 2 bên & bản đố chia giữa:</span>
                                    <span className="font-semibold text-rose-600">- Khung & đố</span>
                                  </div>
                                  <div className="flex items-center justify-between text-slate-600 bg-white px-2 py-1 rounded border border-slate-100">
                                    <span>→ Lọt lòng chia đều cho 2 cánh:</span>
                                    <span className="font-bold text-slate-800">Mỗi cánh ~870.5 mm</span>
                                  </div>
                                  <div className="flex items-center justify-between text-slate-600">
                                    <span>• Bước 3: Trừ khe hở đón cánh (Trừ cánh):</span>
                                    <span className="font-semibold text-rose-600">- 43.9 mm</span>
                                  </div>
                                </div>
                                <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between bg-primary/5 p-2 rounded border border-primary/20">
                                  <span className="font-bold text-slate-800">→ Chiều dài cắt thực tế:</span>
                                  <span className="font-bold text-primary text-sm">{selectedBar.length} mm</span>
                                </div>
                                <div className="text-[11px] text-slate-500 leading-relaxed pt-0.5">
                                  * Chiều ngang cửa được chia đôi cho 2 cánh, sau đó trừ đi khe hở kỹ thuật để 2 cánh khép kín vào đố giữa mà không bị kích nhôm.
                                </div>
                              </div>
                            )}

                            {/* Trường hợp 4: Thanh đố chia ô (2196.2 mm) */}
                            {selectedBar.name.toLowerCase().includes('đố') && (
                              <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/80 space-y-2">
                                <div className="space-y-1 text-slate-700">
                                  <div className="flex items-center justify-between">
                                    <span>• Bước 1: Chiều cao lọt lòng khung (Lm):</span>
                                    <span className="font-bold">2212.2 mm</span>
                                  </div>
                                  <div className="flex items-center justify-between text-slate-600">
                                    <span>• Bước 2: Trừ ngàm phay ăn khớp 2 đầu:</span>
                                    <span className="font-semibold text-rose-600">- 16.0 mm (mỗi đầu 8 mm)</span>
                                  </div>
                                </div>
                                <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between bg-primary/5 p-2 rounded border border-primary/20">
                                  <span className="font-bold text-slate-800">→ Chiều dài cắt thực tế (Lm - 16):</span>
                                  <span className="font-bold text-primary text-sm">{selectedBar.length} mm</span>
                                </div>
                                <div className="text-[11px] text-slate-500 leading-relaxed pt-0.5">
                                  * Thanh đố đứng ngăn giữa 2 cánh cửa. Hai đầu cây đố được phay ngàm để ngậm khít vào lòng khung bao trên và dưới.
                                </div>
                              </div>
                            )}

                            {/* Các thanh còn lại fallback */}
                            {!selectedBar.name.toLowerCase().includes('khung') && !selectedBar.name.toLowerCase().includes('cánh') && !selectedBar.name.toLowerCase().includes('đố') && (
                              <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/80 space-y-1.5">
                                <div className="flex items-center justify-between text-slate-700">
                                  <span>Công thức tính:</span>
                                  <span className="font-bold text-primary">{selectedBar.formula || '-'}</span>
                                </div>
                                <div className="flex items-center justify-between text-slate-700 bg-white px-2 py-1 rounded border border-slate-100">
                                  <span>Chiều dài cắt:</span>
                                  <span className="font-bold text-slate-900">{selectedBar.length} mm</span>
                                </div>
                                <div className="text-[11px] text-slate-500 leading-relaxed pt-1">
                                  Chiều dài được tính toán tự động dựa theo vị trí lắp đặt và các thông số trừ khấu hao cơ khí trong hệ nhôm.
                                </div>
                              </div>
                            )}
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
                              <span className="text-[11px] text-slate-400">Profile: {selectedBead.profileCode || 'Chưa gắn mã'}</span>
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

                            <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/80 space-y-2 text-xs">
                              <div className="space-y-1 text-slate-700">
                                <div className="flex items-center justify-between">
                                  <span>• Bước 1: Kích thước lọt lòng ô kính:</span>
                                  <span className="font-bold">
                                    {selectedBead.name.toLowerCase().includes('đứng') ? 'Chiều cao ô kính' : 'Chiều rộng ô kính'}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-slate-600">
                                  <span>• Bước 2: Khấu trừ góc ghép nẹp (ghép 90° hoặc vát 45°):</span>
                                  <span className="font-semibold text-rose-600">Theo cấu hình nẹp</span>
                                </div>
                              </div>

                              <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between bg-primary/5 p-2 rounded border border-primary/20">
                                <span className="font-bold text-slate-800">→ Chiều dài cắt nẹp thực tế:</span>
                                <span className="font-bold text-primary text-sm">{selectedBead.length} mm</span>
                              </div>

                              <div className="text-[11px] text-slate-500 leading-relaxed pt-0.5">
                                * Thanh nẹp kính dùng để gài giữ mép kính chặt vào khung bao hoặc cánh. Khi ghép góc 90° phẳng, hai cây nẹp đứng sẽ phủ kín chiều cao, còn hai cây nẹp ngang được cắt hụt đúng bằng độ dày của hai bản nẹp đứng để lọt khít vào giữa.
                              </div>
                            </div>
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

                            <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/80 space-y-2 text-xs">
                              <div className="space-y-1 text-slate-700">
                                <div className="flex items-center justify-between">
                                  <span>• Kích thước cánh phủ ngoài:</span>
                                  <span className="font-bold">{selectedCell.w} × {selectedCell.h} mm</span>
                                </div>
                                <div className="flex items-center justify-between text-slate-600">
                                  <span>• Trừ độ ngậm nhôm của bản cánh (2 bên):</span>
                                  <span className="font-semibold text-rose-600">Độ sâu khe đón kính</span>
                                </div>
                                <div className="flex items-center justify-between text-slate-600">
                                  <span>• Trừ khe co giãn nhiệt & gioăng cao su:</span>
                                  <span className="font-semibold text-rose-600">- 2 đến 3 mm</span>
                                </div>
                              </div>

                              <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between bg-primary/5 p-2 rounded border border-primary/20">
                                <span className="font-bold text-slate-800">→ Kích thước đặt xưởng kính:</span>
                                <span className="font-bold text-primary text-sm">{selectedCell.glassW} × {selectedCell.glassH} mm</span>
                              </div>

                              <div className="text-[11px] text-slate-500 leading-relaxed pt-0.5">
                                * Tấm kính phải nhỏ hơn kích thước phủ bì cánh để lọt sâu vào rãnh ngậm kính của thanh nhôm cánh, đồng thời chừa khe hở cho lớp đệm chèn gioăng chống va đập vỡ kính.
                              </div>
                            </div>
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
