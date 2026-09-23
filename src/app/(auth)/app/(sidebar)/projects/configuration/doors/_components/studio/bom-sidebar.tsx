'use client';

import React, { useState } from 'react';
import { DoorCalculateResponse } from '@/types';
import { Weight, Maximize2, Scissors, Loader2, Sparkles } from 'lucide-react';

interface BomSidebarProps {
  calcData: DoorCalculateResponse | null;
  isLoading: boolean;
}

export const BomSidebar: React.FC<BomSidebarProps> = ({ calcData, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'bars' | 'glass'>('bars');

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
          <span>Thanh nhôm ({calcData?.bars?.length ?? 0})</span>
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
          <span>Kính & Nẹp ({calcData?.cells?.length ?? 0})</span>
        </button>
      </div>

      {/* Content List */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'bars' && (
          <div className="space-y-1.5">
            {calcData?.bars && calcData.bars.length > 0 ? (
              calcData.bars.map((bar, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-lg border border-gray-200/70 bg-gray-50/50 hover:bg-gray-100/60 transition-colors flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-gray-800 text-xs truncate">{bar.name}</div>
                    <div className="text-[11px] text-gray-400 flex items-center gap-2 mt-0.5 font-mono">
                      <span>Mã: {bar.profileCode || '—'}</span>
                      <span>•</span>
                      <span>Góc: {bar.goc1}° / {bar.goc2}°</span>
                    </div>
                  </div>
                  <div className="text-right pl-2">
                    <div className="font-bold text-primary font-mono text-xs">
                      {bar.length.toFixed(1)} mm
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">SL: {bar.qty}</div>
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
              <div className="text-[11px] font-bold text-gray-700 uppercase mb-1.5">Tấm kính</div>
              <div className="space-y-1.5">
                {calcData?.cells && calcData.cells.length > 0 ? (
                  calcData.cells.map((cell, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg border border-blue-100 bg-blue-50/40 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-gray-800 text-xs">
                          {cell.glassName || `Kính ô ${idx + 1}`}
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono">
                          Diện tích: {cell.areaM2.toFixed(3)} m²
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-700 font-mono text-xs">
                          {cell.glassW.toFixed(1)} × {cell.glassH.toFixed(1)}
                        </div>
                        <div className="text-[10px] text-gray-400">mm</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-400">Chưa có kính</div>
                )}
              </div>
            </div>

            {/* Beads list */}
            {calcData?.beads && calcData.beads.length > 0 && (
              <div>
                <div className="text-[11px] font-bold text-gray-700 uppercase mb-1.5">Nẹp kính</div>
                <div className="space-y-1">
                  {calcData.beads.map((bead, idx) => (
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
      </div>
    </div>
  );
};
