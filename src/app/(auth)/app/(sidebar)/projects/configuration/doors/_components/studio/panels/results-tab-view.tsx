'use client';

import React, { useState } from 'react';
import { DoorCalculateResponse } from '@/types';
import { FrameConfig, SashConfig, SceneCellNode } from '../studio-types';
import { Layers, Scissors, CheckCircle, Scale, Maximize2, Loader2, ArrowRight } from 'lucide-react';

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

export const detectProfileIssues = ({
  rootCell,
  frameConfig,
  sashConfig,
  seriesId,
  calcData,
}: {
  rootCell?: SceneCellNode;
  frameConfig?: FrameConfig;
  sashConfig?: SashConfig;
  seriesId?: number;
  calcData?: DoorCalculateResponse | null;
}): string[] => {
  const issues: string[] = [];

  // 1. Kiểm tra Hệ nhôm
  if (!seriesId) {
    issues.push('Chưa chọn Hệ nhôm (Series) cho bộ cửa');
  }

  // 2. Kiểm tra Cánh (Sashes)
  let hasSash = false;
  let hasDoubleSash = false;
  let hasMullion = false;

  const checkNodes = (node?: SceneCellNode) => {
    if (!node) return;
    if (node.sashType && node.sashType !== 'fixed') {
      hasSash = true;
      if (node.sashType === 'swing_double') {
        hasDoubleSash = true;
      }
    }
    if (node.children && node.children.length > 0) {
      if (node.splitType !== 'coupling' && node.splitType !== 'sash_pair') {
        hasMullion = true;
      }
      for (const c of node.children) {
        checkNodes(c);
      }
    }
  };
  checkNodes(rootCell);

  if (hasSash) {
    if (!sashConfig?.leftProfileId) {
      issues.push('Thiếu profile bao cánh: cạnh trái');
    }
    if (!sashConfig?.topProfileId) {
      issues.push('Thiếu profile bao cánh: cạnh trên');
    }
    if (!sashConfig?.rightProfileId) {
      issues.push('Thiếu profile bao cánh: cạnh phải');
    }
    if (!sashConfig?.bottomProfileId) {
      issues.push('Thiếu profile bao cánh: cạnh dưới');
    }
    if (hasDoubleSash && !sashConfig?.mullionProfileId) {
      issues.push('Thiếu profile đố động giữa 2 cánh');
    }
    if (!sashConfig?.beadProfileId) {
      issues.push('Thiếu profile nẹp kính cánh');
    }
  }

  // 3. Kiểm tra Khung bao (Frame)
  const leftEdge = frameConfig?.leftEdge;
  const topEdge = frameConfig?.topEdge;
  const rightEdge = frameConfig?.rightEdge;
  const bottomEdge = frameConfig?.bottomEdge;
  const isOpenBottom = frameConfig?.isOpenBottom ?? false;

  if (!leftEdge?.profileId) {
    issues.push('Thanh "Đứng trái" thiếu profile');
  }
  if (!topEdge?.profileId) {
    issues.push('Thanh "Ngang trên" thiếu profile');
  }
  if (!rightEdge?.profileId) {
    issues.push('Thanh "Đứng phải" thiếu profile');
  }
  if (!isOpenBottom && !bottomEdge?.profileId) {
    issues.push('Thanh "Ngang dưới" thiếu profile');
  }

  // 4. Kiểm tra Đố (Mullions)
  if (hasMullion) {
    const checkMullionProfiles = (node?: SceneCellNode) => {
      if (!node || !node.children) return;
      if (node.splitType !== 'coupling' && node.splitType !== 'sash_pair') {
        node.children.forEach((c: SceneCellNode, idx: number) => {
          if (idx < node.children!.length - 1 && !c.mullionProfileId && !node.mullionProfileId) {
            issues.push(`Thanh đố (${node.splitDirection === 'vertical' ? 'Đố đứng' : 'Đố ngang'} #${idx + 1}) thiếu profile`);
          }
        });
      }
      node.children.forEach(checkMullionProfiles);
    };
    checkMullionProfiles(rootCell);
  }

  // 5. Kiểm tra từ calcData
  if (calcData?.bars) {
    for (const b of calcData.bars) {
      if (!b.profileId && !issues.some((iss) => iss.includes(b.name))) {
        issues.push(`Thanh "${b.name}" thiếu profile`);
      }
    }
  }

  return issues;
};

export const ResultsTabView: React.FC<ResultsTabViewProps> = ({
  calcData,
  isCalculating,
  w = 1600,
  h = 2300,
  rootCell,
  frameConfig,
  sashConfig,
  seriesId,
  onNavigateTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'bars' | 'beads' | 'glass'>('bars');

  const issues = detectProfileIssues({
    rootCell,
    frameConfig,
    sashConfig,
    seriesId,
    calcData,
  });

  const doorW = w || calcData?.w || 1600;
  const doorH = h || calcData?.h || 2300;
  const doorAreaM2 = (doorW * doorH) / 1000000;
  const totalWeight = calcData?.totalAluminumWeightKg || 0;
  const totalGlassArea = calcData?.totalGlassAreaM2 || 0;

  if (isCalculating && !calcData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-gray-500 space-y-3">
        <Loader2 size={28} className="animate-spin text-blue-600" />
        <p className="text-xs font-semibold">Đang bóc tách khối lượng vật tư...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 flex justify-center">
      <div className="max-w-4xl w-full space-y-4 text-xs text-gray-800">
        {/* 1. Header Banner kiểu CAD chuẩn (Dark Slate Banner) */}
        <div className="bg-[#1e293b] text-white rounded-2xl px-5 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 font-bold text-xs tracking-wide">
              <span>📐</span>
              <span>Kết quả tính mẫu</span>
            </div>
            <span className="bg-slate-700/80 text-slate-200 px-2.5 py-0.5 rounded-md font-mono text-[11px] font-semibold border border-slate-600">
              W={doorW} × H={doorH} mm
            </span>
          </div>

          <div className="flex items-center gap-5 text-xs font-mono text-slate-300">
            <div>
              <span>Kính: </span>
              <strong className="text-white font-bold">{totalGlassArea.toFixed(3)}</strong> m²
            </div>
            <div>
              <span>Cân nặng: </span>
              <strong className="text-white font-bold">{totalWeight.toFixed(2)}</strong> kg
            </div>
            <div>
              <span>KL/m²: </span>
              <strong className="text-white font-bold">
                {doorAreaM2 > 0 ? (totalWeight / doorAreaM2).toFixed(2) : '0.00'}
              </strong>{' '}
              kg/m²
            </div>
          </div>
        </div>

        {/* 2. Warning Alert Box: Hiển thị khi phát hiện thiếu profile hoặc chưa cấu hình xong */}
        {issues.length > 0 && (
          <div className="bg-[#fffbeb] border border-[#fde68a] rounded-2xl p-4 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="font-bold text-xs text-[#b45309] flex items-center gap-1.5">
                <span className="text-sm">⚠️</span>
                <span>Phát hiện {issues.length} vấn đề profile — kiểm tra lại:</span>
              </div>
              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('config')}
                  className="text-[11px] font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300 px-3 py-1 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>⚙️ Đến Cấu hình</span>
                  <ArrowRight size={12} />
                </button>
              )}
            </div>

            <ul className="space-y-1 text-xs text-[#92400e] pl-1 font-medium">
              {issues.map((msg, idx) => (
                <li key={idx} className="flex items-center gap-1.5">
                  <span className="text-[#d97706] text-[11px]">⚠️</span>
                  <span>{msg}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 3. KPI Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-1">
            <div className="flex items-center gap-2 text-gray-500 font-medium text-[11px]">
              <Scale size={14} className="text-blue-600" />
              <span>Tổng khối lượng nhôm</span>
            </div>
            <div className="text-xl font-bold font-mono text-gray-900">
              {totalWeight.toFixed(2)}{' '}
              <span className="text-xs font-normal text-gray-500">kg</span>
              {totalWeight === 0 && (
                <span className="block text-[10px] font-sans font-medium text-amber-600 mt-0.5">
                  (Cần chọn profile để tính)
                </span>
              )}
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-1">
            <div className="flex items-center gap-2 text-gray-500 font-medium text-[11px]">
              <Maximize2 size={14} className="text-emerald-600" />
              <span>Tổng diện tích kính</span>
            </div>
            <div className="text-xl font-bold font-mono text-emerald-700">
              {totalGlassArea.toFixed(2)}{' '}
              <span className="text-xs font-normal text-gray-500">m²</span>
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-1">
            <div className="flex items-center gap-2 text-gray-500 font-medium text-[11px]">
              <Scissors size={14} className="text-amber-600" />
              <span>Tổng thanh cắt xưởng</span>
            </div>
            <div className="text-xl font-bold font-mono text-gray-900">
              {(calcData?.bars?.length || 0) + (calcData?.beads?.length || 0)}{' '}
              <span className="text-xs font-normal text-gray-500">thanh</span>
            </div>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        {!calcData ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-500 space-y-2 shadow-2xs">
            <Layers size={36} className="mx-auto text-amber-500 opacity-60 mb-2" />
            <p className="font-semibold text-xs text-gray-700">Chưa có kết quả bóc tách vật tư</p>
            <p className="text-[11px] text-gray-500">
              Vui lòng hoàn tất cấu hình thanh profile ở tab &ldquo;Cấu hình&rdquo; để hệ thống tự động tính toán.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-4 pt-3 flex items-center gap-2 bg-gray-50/60">
              <button
                type="button"
                onClick={() => setActiveSubTab('bars')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeSubTab === 'bars'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                1. Cắt thanh nhôm ({calcData.groupedBars?.length || calcData.bars?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('beads')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeSubTab === 'beads'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                2. Cắt nẹp kính ({calcData.groupedBeads?.length || calcData.beads?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('glass')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeSubTab === 'glass'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                3. Kích thước đặt kính ({calcData.cells?.length || 0})
              </button>
            </div>

            {/* Table Content */}
            <div className="p-4 overflow-x-auto">
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
                            <span className="text-blue-600 font-semibold">{bar.profileCode}</span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              Chưa chọn profile
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-gray-900">{bar.length}</td>
                        <td className="py-2.5 px-3 text-center text-gray-600">{bar.goc1}° / {bar.goc2}°</td>
                        <td className="py-2.5 px-3 text-center font-bold text-amber-700">{bar.qty}</td>
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
                            <span className="text-purple-600 font-semibold">{bead.profileCode}</span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              Chưa chọn profile
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-gray-900">{bead.length}</td>
                        <td className="py-2.5 px-3 text-center text-gray-600">{bead.goc1}° / {bead.goc2}°</td>
                        <td className="py-2.5 px-3 text-center font-bold text-amber-700">{bead.qty}</td>
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
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-800">
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
