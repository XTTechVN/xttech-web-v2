'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  X,
  Layers,
  Ruler,
  Maximize2,
  Minimize2,
  RefreshCw,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components';
import { calculateDoor } from '@/actions';
import type { Door, DoorCalculateResponse } from '@/types';

interface DoorBOMModalProps {
  door: Door | null;
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_MAP: Record<string, string> = {
  frame: 'Khung bao',
  sash_h: 'Cánh đứng',
  sash_w: 'Cánh ngang',
  dodong: 'Đố động',
  bead: 'Nẹp kính',
};

export const DoorBOMModal: React.FC<DoorBOMModalProps> = ({ door, isOpen, onClose }) => {
  const getDoorW = () => door?.systemConfig?.w ?? door?.systemConfig?.drawing?.w ?? 1400;
  const getDoorH = () => door?.systemConfig?.h ?? door?.systemConfig?.drawing?.h ?? 1600;

  const [w, setW] = useState<number>(getDoorW);
  const [h, setH] = useState<number>(getDoorH);
  const [activeTab, setActiveTab] = useState<'bars' | 'beads' | 'glass'>('bars');

  useEffect(() => {
    if (door && isOpen) {
      setW(getDoorW());
      setH(getDoorH());
    }
  }, [door?.id, isOpen]);

  const { data: bom, isLoading, refetch, isFetching } = useQuery<DoorCalculateResponse>({
    queryKey: ['door-bom', door?.id, w, h],
    queryFn: async () => {
      if (!door?.id) throw new Error('Chưa chọn mẫu cửa');
      return await calculateDoor({
        doorId: door.id,
        width: w,
        height: h,
      });
    },
    enabled: isOpen && !!door?.id,
  });

  if (!isOpen || !door) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{door.name}</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                  {door.code || 'CS_MẪU'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Bóc tách kỹ thuật cắt nhôm & kính chuẩn xưởng (Parametric BOM Engine)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dimension Toolbar */}
        <div className="px-6 py-3 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Ruler className="w-4 h-4 text-slate-400" />
              Kích thước thiết kế:
            </span>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500 font-medium">W (mm):</label>
              <input
                type="number"
                value={w}
                onChange={(e) => setW(Number(e.target.value))}
                className="w-24 px-2.5 py-1 text-sm font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-900"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500 font-medium">H (mm):</label>
              <input
                type="number"
                value={h}
                onChange={(e) => setH(Number(e.target.value))}
                className="w-24 px-2.5 py-1 text-sm font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-900"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-1.5 text-xs font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              Tính lại
            </Button>
          </div>

          {/* Quick Metrics */}
          {bom && (
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
                Tổng nhôm: <strong className="font-bold">{bom.totalAluminumWeightKg} kg</strong>
              </div>
              <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                Tổng kính: <strong className="font-bold">{bom.totalGlassAreaM2} m²</strong>
              </div>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: 2D Vector Drawing */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Bản vẽ kỹ thuật 2D Vector
            </h4>
            <div className="w-full aspect-[4/4.5] rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-center p-3 overflow-hidden shadow-inner">
              {door.imageB64 ? (
                <img
                  src={door.imageB64}
                  alt={door.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center text-slate-400 text-xs">
                  Chưa có bản vẽ vector cho mẫu này
                </div>
              )}
            </div>
            <div className="text-[11px] text-slate-400 italic text-center">
              * Kích thước trên bản vẽ tự động cập nhật theo Scene Graph và góc khấu trừ profile.
            </div>
          </div>

          {/* Right Column: BOM Tables */}
          <div className="lg:col-span-7 flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-4 gap-2">
              <button
                onClick={() => setActiveTab('bars')}
                className={`pb-2 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                  activeTab === 'bars'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Cắt nhôm ({bom?.groupedBars?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('beads')}
                className={`pb-2 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                  activeTab === 'beads'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Cắt nẹp kính ({bom?.groupedBeads?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('glass')}
                className={`pb-2 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                  activeTab === 'glass'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Đặt kính ({bom?.cells?.length || 0})
              </button>
            </div>

            {/* Loading */}
            {isLoading ? (
              <div className="py-16 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Đang tính toán bảng bóc tách...
              </div>
            ) : !bom ? (
              <div className="py-16 text-center text-slate-400 text-sm">
                Không thể tải dữ liệu bóc tách
              </div>
            ) : (
              <div className="flex-1 overflow-x-auto">
                {/* Tab 1: Bars */}
                {activeTab === 'bars' && (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                        <th className="py-2 px-2">Mã nhôm</th>
                        <th className="py-2 px-2">Tên vị trí thanh</th>
                        <th className="py-2 px-2 text-right">Dài (mm)</th>
                        <th className="py-2 px-2 text-center">Góc cắt</th>
                        <th className="py-2 px-2 text-center">SL</th>
                        <th className="py-2 px-2 text-right">Trừ lọt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {bom.groupedBars.map((bar, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2 px-2 font-mono font-bold text-slate-900">
                            {bar.profileCode || '—'}
                          </td>
                          <td className="py-2 px-2 font-medium">
                            {bar.name}
                            <span className="block text-[10px] text-slate-400 font-normal">
                              {CATEGORY_MAP[bar.category] || bar.category}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-right font-bold text-blue-600">
                            {bar.length.toLocaleString('vi-VN')}
                          </td>
                          <td className="py-2 px-2 text-center font-mono text-[11px] text-slate-600">
                            {bar.goc1}° / {bar.goc2}°
                          </td>
                          <td className="py-2 px-2 text-center">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 font-bold text-slate-900 text-xs">
                              {bar.qty}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-right text-slate-500 font-mono text-[11px]">
                            {bar.formula || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Tab 2: Beads */}
                {activeTab === 'beads' && (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                        <th className="py-2 px-2">Vị trí nẹp</th>
                        <th className="py-2 px-2 text-right">Chiều dài (mm)</th>
                        <th className="py-2 px-2 text-center">Góc cắt</th>
                        <th className="py-2 px-2 text-center">Số lượng</th>
                        <th className="py-2 px-2 text-right">Độ dày kính</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {bom.groupedBeads.map((b, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2 px-2 font-medium text-slate-900">{b.name}</td>
                          <td className="py-2 px-2 text-right font-bold text-blue-600">
                            {b.length.toLocaleString('vi-VN')}
                          </td>
                          <td className="py-2 px-2 text-center font-mono text-[11px] text-slate-600">
                            {b.goc1}° / {b.goc2}°
                          </td>
                          <td className="py-2 px-2 text-center">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 font-bold text-slate-900 text-xs">
                              {b.qty}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-right text-slate-600">
                            {b.thicknessMm} mm
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Tab 3: Glass */}
                {activeTab === 'glass' && (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                        <th className="py-2 px-2">Vị trí ô</th>
                        <th className="py-2 px-2">Quy cách kính</th>
                        <th className="py-2 px-2 text-right">Rộng x Cao (mm)</th>
                        <th className="py-2 px-2 text-right">Diện tích (m²)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {bom.cells.map((c, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2 px-2 font-mono font-bold text-slate-900">
                            {c.path}
                          </td>
                          <td className="py-2 px-2 font-medium text-slate-700">
                            {c.glassName || 'Kính hộp 5-6-5mm'}
                          </td>
                          <td className="py-2 px-2 text-right font-bold text-emerald-600 font-mono">
                            {c.glassW} × {c.glassH}
                          </td>
                          <td className="py-2 px-2 text-right font-semibold text-slate-900">
                            {c.areaM2.toFixed(4)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Thuật toán bóc tách tự động đồng bộ theo hệ nhôm {door.systemConfig?.sash?.family || 'tiêu chuẩn'}.</span>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};
