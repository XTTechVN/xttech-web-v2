'use client';

import React, { useState } from 'react';
import { DoorCalculateResponse } from '@/types';
import { Weight, Maximize2, Scissors, Loader2, Sparkles } from 'lucide-react';

interface BomSidebarProps {
  calcData: DoorCalculateResponse | null;
  isLoading: boolean;
}

export const BomSidebar: React.FC<BomSidebarProps> = ({ calcData, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'bars' | 'glass' | 'grilles'>('bars');

  // Dữ liệu bóc tách gom nhóm 100% từ Backend (Pure View - Single Source of Truth)
  const displayBars = calcData?.groupedBars || [];
  const displayGlasses = calcData?.groupedCells || [];
  const displayBeads = calcData?.groupedBeads || [];

  // Tổng số lượng chi tiết thực tế
  const totalBarCount = displayBars.reduce((sum, b) => sum + (b.qty || 1), 0);
  const totalGlassCount = displayGlasses.reduce((sum, g) => sum + (g.qty || 1), 0);
  const totalBeadCount = displayBeads.reduce((sum, b) => sum + (b.qty || 1), 0);

  return (
    <div className="flex flex-col h-full bg-white text-xs select-none">
      {/* Header */}
      <div className="h-11 px-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-bold text-gray-800 uppercase tracking-wide">
          <Sparkles size={14} className="text-amber-500" />
          <span>Bóc tách BOM Realtime</span>
        </div>
        {isLoading && (
          <div className="flex items-center gap-1 text-primary text-[11px] font-medium">
            <Loader2 size={12} className="animate-spin" />
            <span>Đang tính...</span>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="p-3 grid grid-cols-2 gap-2 bg-gray-50/70 border-b border-gray-200">
        <div className="bg-white p-2.5 rounded-xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center gap-1.5 text-gray-500 text-[11px] font-medium">
            <Weight size={13} className="text-emerald-600" />
            <span>Khối lượng nhôm</span>
          </div>
          <div className="text-base font-bold text-emerald-700 font-mono mt-1">
            {calcData?.totalAluminumWeightKg?.toFixed(2) ?? '—'} <span className="text-xs font-normal">kg</span>
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center gap-1.5 text-gray-500 text-[11px] font-medium">
            <Maximize2 size={13} className="text-blue-600" />
            <span>Diện tích kính</span>
          </div>
          <div className="text-base font-bold text-blue-700 font-mono mt-1">
            {calcData?.totalGlassAreaM2?.toFixed(3) ?? '—'} <span className="text-xs font-normal">m²</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 px-3 pt-2 gap-2 bg-gray-50/40">
        <button
          type="button"
          onClick={() => setActiveTab('bars')}
          className={`pb-2 px-2 font-semibold text-xs border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'bars'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Scissors size={13} />
          <span>Thanh nhôm ({totalBarCount})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('glass')}
          className={`pb-2 px-2 font-semibold text-xs border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'glass'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Maximize2 size={13} />
          <span>Kính & Nẹp ({totalGlassCount})</span>
        </button>
        {calcData?.grilles && calcData.grilles.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab('grilles')}
            className={`pb-2 px-2 font-semibold text-xs border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'grilles'
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Sparkles size={13} />
            <span>Nan đồng ({calcData.grilles.length})</span>
          </button>
        )}
      </div>

      {/* Content List */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'bars' && (
          <div className="space-y-1.5">
            {displayBars.length > 0 ? (
              displayBars.map((bar, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg border border-gray-200/80 bg-gray-50/50 hover:bg-gray-100/60 transition-colors flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="font-semibold text-gray-800 text-xs truncate flex items-center gap-1.5">
                      <span>{bar.profileName || bar.name}</span>
                      {bar.positions && bar.positions.length > 1 && (
                        <span className="text-[10px] font-normal text-gray-400 bg-gray-200/60 px-1.5 py-0.5 rounded font-sans">
                          {bar.positions.length} vị trí
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-0.5 font-mono">
                      <span>Mã: {bar.profileCode || '—'}</span>
                      <span>•</span>
                      <span>Góc: {bar.goc1}° / {bar.goc2}°</span>
                    </div>
                    {bar.positions && bar.positions.length > 0 && (
                      <div className="text-[10px] text-gray-400 mt-0.5 truncate" title={bar.positions.join(', ')}>
                        {bar.positions.join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-primary font-mono text-xs">
                      {bar.length.toFixed(1)} mm
                    </div>
                    <div className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[11px] font-mono">
                      {bar.qty} cây
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">Chưa có thông tin bóc tách</div>
            )}
          </div>
        )}

        {activeTab === 'glass' && (
          <div className="space-y-3">
            {/* Glass panels */}
            <div>
              <div className="text-[11px] font-bold text-gray-700 uppercase mb-1.5 flex items-center justify-between">
                <span>Tấm kính</span>
                {displayGlasses.length > 0 && (
                  <span className="text-[10px] text-gray-400 font-normal font-mono lowercase">
                    {totalGlassCount} tấm
                  </span>
                )}
              </div>
              <div className="space-y-1.5">
                {displayGlasses.length > 0 ? (
                  displayGlasses.map((glass, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg border border-blue-100 bg-blue-50/40 flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold text-gray-800 text-xs truncate">
                          {glass.glassName}
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                          Diện tích: {glass.areaM2.toFixed(3)} m²
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-blue-700 font-mono text-xs">
                          {glass.glassW.toFixed(1)} × {glass.glassH.toFixed(1)} <span className="text-[10px] font-normal text-gray-400">mm</span>
                        </div>
                        <div className="text-[11px] font-semibold text-blue-800 font-mono mt-0.5">
                          {glass.qty} tấm
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-400">Chưa có kính</div>
                )}
              </div>
            </div>

            {/* Beads list */}
            {displayBeads.length > 0 && (
              <div>
                <div className="text-[11px] font-bold text-gray-700 uppercase mb-1.5 flex items-center justify-between">
                  <span>Nẹp kính</span>
                  <span className="text-[10px] text-gray-400 font-normal font-mono lowercase">
                    {totalBeadCount} cây
                  </span>
                </div>
                <div className="space-y-1">
                  {displayBeads.map((bead, idx) => (
                    <div
                      key={idx}
                      className="p-1.5 rounded-lg border border-gray-200/60 bg-white flex items-center justify-between text-[11px]"
                    >
                      <span className="text-gray-700 truncate">{bead.name}</span>
                      <span className="font-mono text-gray-900 font-medium">
                        {bead.length.toFixed(1)} mm ({bead.qty} cây)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'grilles' && (
          <div className="space-y-2">
            {calcData?.grilles && calcData.grilles.length > 0 ? (
              calcData.grilles.map((g, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg border border-amber-200/80 bg-amber-50/40 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 font-mono text-[11px]">{g.cellPath}</span>
                    <span className="font-bold font-mono text-amber-800 text-xs">
                      {g.totalBarLengthM} m
                    </span>
                  </div>
                  <div className="text-[11px] text-amber-800/80 flex items-center justify-between">
                    <span>Nan {g.barWidthMm}mm ({g.barColor})</span>
                    <span>{g.motifQty > 0 ? `${g.motifQty} hoa văn` : 'Không hoa văn'}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between pt-1 border-t border-amber-200/40">
                    <span>Thành tiền:</span>
                    <span className="font-bold text-amber-900">{g.totalPrice.toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-400">Không có kính nan đồng</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
