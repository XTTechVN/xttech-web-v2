'use client';

import React, { useState } from 'react';
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
  Wrench,
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
  if (!isOpen || !door) return null;

  return (
    <DoorBOMModalContent
      key={`bom-${door.id}`}
      door={door}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
};

interface DoorBOMModalContentProps {
  door: Door;
  isOpen: boolean;
  onClose: () => void;
}

const DoorBOMModalContent: React.FC<DoorBOMModalContentProps> = ({ door, isOpen, onClose }) => {
  const getDoorW = () => door.systemConfig?.w ?? door.systemConfig?.drawing?.w ?? 1400;
  const getDoorH = () => door.systemConfig?.h ?? door.systemConfig?.drawing?.h ?? 1600;

  const [w, setW] = useState<number>(getDoorW);
  const [h, setH] = useState<number>(getDoorH);
  const [activeTab, setActiveTab] = useState<'bars' | 'beads' | 'glass' | 'joints' | 'grilles'>('bars');

  const { data: bom, isLoading, refetch, isFetching } = useQuery<DoorCalculateResponse>({
    queryKey: ['door-bom', door.id, w, h],
    queryFn: async () => {
      return await calculateDoor({
        doorId: door.id,
        width: w,
        height: h,
      });
    },
    enabled: isOpen && !!door.id,
  });

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
            <div className="flex items-center gap-3 text-xs font-medium flex-wrap">
              <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
                Tổng nhôm: <strong className="font-bold">{bom.totalAluminumWeightKg} kg</strong>
              </div>
              <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                Tổng kính: <strong className="font-bold">{bom.totalGlassAreaM2} m²</strong>
              </div>
              {bom.totalJointQty !== undefined && (
                <div
                  className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${
                    bom.hasUnconfiguredJoints
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-purple-50 text-purple-700 border-purple-100'
                  }`}
                >
                  <Wrench size={13} />
                  <span>
                    Liên kết góc: <strong className="font-bold">{bom.totalJointQty} con ke</strong>
                  </span>
                  {bom.hasUnconfiguredJoints && (
                    <span className="text-[10px] font-semibold text-amber-700 underline">
                      (chưa cấu hình)
                    </span>
                  )}
                </div>
              )}
              {bom.totalGrillePrice !== undefined && bom.totalGrillePrice > 0 && (
                <div className="px-3 py-1.5 bg-amber-50 text-amber-800 rounded-lg border border-amber-200 font-medium">
                  Kính nan đồng: <strong className="font-bold">{bom.totalGrillePrice.toLocaleString('vi-VN')} đ</strong>
                </div>
              )}
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
              <button
                onClick={() => setActiveTab('joints')}
                className={`pb-2 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'joints'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Liên kết góc ({bom?.cornerJoints?.length || 0})</span>
                {bom?.hasUnconfiguredJoints && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Có vị trí chưa gán con ke" />
                )}
              </button>
              {bom?.grilles && bom.grilles.length > 0 && (
                <button
                  onClick={() => setActiveTab('grilles')}
                  className={`pb-2 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeTab === 'grilles'
                      ? 'border-amber-600 text-amber-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>Kính nan đồng ({bom.grilles.length})</span>
                </button>
              )}
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

                {/* Tab 4: Corner Joints */}
                {activeTab === 'joints' && (
                  <div className="space-y-3">
                    {bom.hasUnconfiguredJoints && (
                      <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                        <span className="text-base leading-none">⚠️</span>
                        <div className="space-y-0.5">
                          <p className="font-bold">Chưa cấu hình con ke cụ thể từ hãng</p>
                          <p className="text-[11px] text-amber-800">
                            Các vị trí liên kết góc đã được tính số lượng theo thiết kế, nhưng chưa được gán mã con ke trong gói phụ kiện để lấy đơn giá thật.
                          </p>
                        </div>
                      </div>
                    )}

                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                          <th className="py-2 px-2">Vị trí & Con ke</th>
                          <th className="py-2 px-2">Phương pháp</th>
                          <th className="py-2 px-2">Mã / Tên phụ kiện</th>
                          <th className="py-2 px-2 text-center">Số lượng</th>
                          <th className="py-2 px-2 text-right">Đơn giá</th>
                          <th className="py-2 px-2 text-right">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {(bom.cornerJoints || []).map((j, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 px-2">
                              <div className="font-bold text-slate-900">{j.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{j.formula}</div>
                            </td>
                            <td className="py-2.5 px-2">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  j.jointType === 'ke_vinh_cuu'
                                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}
                              >
                                {j.jointType === 'ke_vinh_cuu' ? 'Ke vĩnh cửu' : 'Ke ép góc'}
                              </span>
                            </td>
                            <td className="py-2.5 px-2">
                              {j.isConfigured ? (
                                <div>
                                  <span className="font-mono font-bold text-slate-900">
                                    {j.accessoryCode}
                                  </span>
                                  <span className="text-slate-500 block text-[11px]">
                                    {j.accessoryName}
                                  </span>
                                </div>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80">
                                  ⚠️ Chưa cấu hình
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-2 text-center">
                              <span className="inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-slate-100 font-bold text-slate-900 text-xs">
                                {j.qty} con
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono text-slate-600">
                              {j.unitPrice && j.unitPrice > 0
                                ? j.unitPrice.toLocaleString('vi-VN') + ' đ'
                                : '-'}
                            </td>
                            <td className="py-2.5 px-2 text-right font-bold font-mono text-slate-900">
                              {j.totalPrice && j.totalPrice > 0
                                ? j.totalPrice.toLocaleString('vi-VN') + ' đ'
                                : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {bom.totalJointPrice !== undefined && bom.totalJointPrice > 0 && (
                      <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs font-semibold text-slate-700">
                        <span>Tổng chi phí ke liên kết:</span>
                        <span className="font-bold text-sm text-blue-700 font-mono">
                          {bom.totalJointPrice.toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'grilles' && (
                  <div className="space-y-4">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                          <th className="py-2 px-2">Ô kính & Bóc tách</th>
                          <th className="py-2 px-2">Quy cách nan</th>
                          <th className="py-2 px-2 text-center">Bóc tách dài (m)</th>
                          <th className="py-2 px-2 text-center">Hoa văn</th>
                          <th className="py-2 px-2 text-right">Đơn giá / m</th>
                          <th className="py-2 px-2 text-right">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {(bom.grilles || []).map((g, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 px-2">
                              <div className="font-bold text-slate-900 font-mono">{g.cellPath}</div>
                              <div className="text-[10px] text-slate-400">
                                Lưới: {g.gridLengthM}m | Viền: {g.borderLengthM}m | Góc: {g.cornerLengthM}m
                              </div>
                            </td>
                            <td className="py-2.5 px-2">
                              <span className="font-semibold text-slate-800">
                                Bản {g.barWidthMm}mm ({g.barColor})
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-center font-bold font-mono text-amber-700">
                              {g.totalBarLengthM} m
                            </td>
                            <td className="py-2.5 px-2 text-center">
                              {g.motifQty > 0 ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  {g.motifQty} con
                                </span>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono text-slate-600">
                              {g.unitPricePerM.toLocaleString('vi-VN')} đ
                            </td>
                            <td className="py-2.5 px-2 text-right font-bold font-mono text-slate-900">
                              {g.totalPrice.toLocaleString('vi-VN')} đ
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {bom.totalGrillePrice !== undefined && bom.totalGrillePrice > 0 && (
                      <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl flex items-center justify-between text-xs font-semibold text-amber-900">
                        <span>Tổng chi phí gia công kính nan đồng:</span>
                        <span className="font-bold text-sm text-amber-700 font-mono">
                          {bom.totalGrillePrice.toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                    )}
                  </div>
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
