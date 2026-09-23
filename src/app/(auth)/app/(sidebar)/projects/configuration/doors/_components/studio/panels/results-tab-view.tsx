'use client';

import React, { useState } from 'react';
import { DoorCalculateResponse } from '@/types';
import { Layers, Scissors, CheckCircle, Scale, Maximize2, Loader2 } from 'lucide-react';

interface ResultsTabViewProps {
  calcData: DoorCalculateResponse | null;
  isCalculating: boolean;
}

export const ResultsTabView: React.FC<ResultsTabViewProps> = ({
  calcData,
  isCalculating,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'bars' | 'beads' | 'glass'>('bars');

  if (isCalculating && !calcData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-gray-500 space-y-3">
        <Loader2 size={28} className="animate-spin text-blue-600" />
        <p className="text-xs font-semibold">Đang bóc tách khối lượng vật tư...</p>
      </div>
    );
  }

  if (!calcData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-gray-400 space-y-2">
        <Layers size={32} />
        <p className="text-xs">Chưa có dữ liệu tính toán. Hãy cấu hình kích thước và kiểu cửa.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 flex justify-center">
      <div className="max-w-4xl w-full space-y-5 text-xs text-gray-800">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-1">
            <div className="flex items-center gap-2 text-gray-500 font-medium text-[11px]">
              <Scale size={14} className="text-blue-600" />
              <span>Tổng khối lượng nhôm</span>
            </div>
            <div className="text-xl font-bold font-mono text-gray-900">
              {calcData.totalAluminumWeightKg?.toFixed(2) || '0.00'}{' '}
              <span className="text-xs font-normal text-gray-500">kg</span>
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-1">
            <div className="flex items-center gap-2 text-gray-500 font-medium text-[11px]">
              <Maximize2 size={14} className="text-emerald-600" />
              <span>Tổng diện tích kính</span>
            </div>
            <div className="text-xl font-bold font-mono text-emerald-700">
              {calcData.totalGlassAreaM2?.toFixed(2) || '0.00'}{' '}
              <span className="text-xs font-normal text-gray-500">m²</span>
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-1">
            <div className="flex items-center gap-2 text-gray-500 font-medium text-[11px]">
              <Scissors size={14} className="text-amber-600" />
              <span>Tổng thanh cắt xưởng</span>
            </div>
            <div className="text-xl font-bold font-mono text-gray-900">
              {(calcData.bars?.length || 0) + (calcData.beads?.length || 0)}{' '}
              <span className="text-xs font-normal text-gray-500">thanh</span>
            </div>
          </div>
        </div>

        {/* Sub-tab Navigation */}
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
                  {(calcData.groupedBars || calcData.bars).map((bar, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="py-2.5 px-3 font-sans font-medium text-gray-800">{bar.name}</td>
                      <td className="py-2.5 px-3 text-blue-600">{bar.profileCode || '-'}</td>
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
                  {(calcData.groupedBeads || calcData.beads).map((bead, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="py-2.5 px-3 font-sans font-medium text-gray-800">{bead.name}</td>
                      <td className="py-2.5 px-3 text-purple-600">{bead.profileCode || '-'}</td>
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
      </div>
    </div>
  );
};
