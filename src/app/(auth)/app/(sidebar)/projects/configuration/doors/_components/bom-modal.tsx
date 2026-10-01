'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  X,
  Layers,
  Ruler,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components';
import { calculateDoor } from '@/actions';
import type { Door, DoorCalculateResponse } from '@/types';
import { getFileUrl } from '@/utils';
import { DoorCadRenderer } from './studio/cad-engine/door-cad-renderer';
import {
  BomBarsTable,
  BomBeadsTable,
  BomGlassTable,
  BomJointsTable,
  BomGrillesTable,
  BomAccessoriesTable,
} from './bom';

interface DoorBOMModalProps {
  door: Door | null;
  isOpen: boolean;
  onClose: () => void;
}

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
  const [activeTab, setActiveTab] = useState<'bars' | 'beads' | 'glass' | 'joints' | 'grilles' | 'accessories'>('bars');
  const [mobileView, setMobileView] = useState<'drawing' | 'bom'>('bom');

  const hasStudioDesign = Boolean(door.systemConfig?.rootCell);
  const primaryImgPath = door.images?.find((img) => img.isPrimary)?.imagePath || door.imagePath;
  const imgSrc = door.imageB64 || (primaryImgPath ? getFileUrl(primaryImgPath) : null);

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-100 flex flex-col h-[100dvh] sm:h-auto sm:max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold shrink-0">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate max-w-[200px] sm:max-w-md">
                  {door.name}
                </h3>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 shrink-0">
                  {door.code || 'CS_MẪU'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate hidden sm:block">
                Bóc tách kỹ thuật cắt nhôm & kính chuẩn xưởng (Parametric BOM Engine)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dimension Toolbar & Quick Metrics */}
        <div className="px-4 py-2 sm:px-6 sm:py-3 bg-white border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-2 sm:gap-4 shrink-0">
          <div className="flex items-center justify-between sm:justify-start gap-2 text-xs sm:text-sm">
            <span className="font-semibold text-slate-700 flex items-center gap-1 shrink-0 whitespace-nowrap">
              <Ruler className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Kích thước thiết kế:</span>
              <span className="sm:hidden">KT:</span>
            </span>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                <span className="text-[10px] sm:text-xs text-slate-400 font-medium mr-1">W:</span>
                <input
                  type="number"
                  value={w}
                  onChange={(e) => setW(Number(e.target.value))}
                  className="w-13 sm:w-18 bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none"
                />
              </div>
              <span className="text-slate-400 text-xs">×</span>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                <span className="text-[10px] sm:text-xs text-slate-400 font-medium mr-1">H:</span>
                <input
                  type="number"
                  value={h}
                  onChange={(e) => setH(Number(e.target.value))}
                  className="w-13 sm:w-18 bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none"
                />
              </div>
              <span className="text-[10px] sm:text-xs text-slate-400 font-medium">mm</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="gap-1 text-xs font-semibold px-2 py-1 h-7 ml-1 shrink-0"
              >
                <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Tính lại</span>
              </Button>
            </div>
          </div>

          {/* Quick Metrics */}
          {bom && (
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-medium overflow-x-auto no-scrollbar py-0.5">
              <div className="px-2 sm:px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100 whitespace-nowrap shrink-0">
                Nhôm: <strong className="font-bold">{bom.totalAluminumWeightKg} kg</strong>
              </div>
              <div className="px-2 sm:px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100 whitespace-nowrap shrink-0">
                Kính: <strong className="font-bold">{bom.totalGlassAreaM2} m²</strong>
              </div>
              {bom.totalJointQty !== undefined && (
                <div
                  className={`px-2 sm:px-2.5 py-1 rounded-md border flex items-center gap-1 whitespace-nowrap shrink-0 ${
                    bom.hasUnconfiguredJoints
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-purple-50 text-purple-700 border-purple-100'
                  }`}
                >
                  <Wrench size={11} />
                  <span>
                    Ke: <strong className="font-bold">{bom.totalJointQty} con</strong>
                  </span>
                  {bom.hasUnconfiguredJoints && (
                    <span className="text-[9px] font-semibold text-amber-700 underline">
                      (!)
                    </span>
                  )}
                </div>
              )}
              {bom.totalGrillePrice !== undefined && bom.totalGrillePrice > 0 && (
                <div className="px-2 sm:px-2.5 py-1 bg-amber-50 text-amber-800 rounded-md border border-amber-200 font-medium whitespace-nowrap shrink-0">
                  Nan: <strong className="font-bold">{bom.totalGrillePrice.toLocaleString('vi-VN')} đ</strong>
                </div>
              )}
              {bom.totalAccessoryPrice !== undefined && bom.totalAccessoryPrice > 0 && (
                <div className="px-2 sm:px-2.5 py-1 bg-purple-50 text-purple-800 rounded-md border border-purple-200 font-medium whitespace-nowrap shrink-0">
                  PK: <strong className="font-bold">{bom.totalAccessoryPrice.toLocaleString('vi-VN')} đ</strong>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile View Switcher (Only visible on mobile/tablet < lg) */}
        <div className="lg:hidden px-4 pt-2.5 pb-1 bg-white border-b border-slate-100 shrink-0">
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMobileView('bom')}
              className={`py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                mobileView === 'bom'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              <span>Bóc tách BOM ({bom?.groupedBars?.length || 0})</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileView('drawing')}
              className={`py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                mobileView === 'drawing'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Bản vẽ 2D Vector</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-10 sm:pb-8 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 min-h-0">
          {/* 2D Vector Drawing Column */}
          <div
            className={`flex flex-col gap-2.5 ${
              mobileView === 'drawing' ? 'flex' : 'hidden lg:flex'
            } lg:col-span-5`}
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Bản vẽ kỹ thuật 2D Vector
            </h4>
            <div className="w-full aspect-[4/4.5] max-h-[60vh] lg:max-h-none rounded-xl border border-slate-200/80 bg-white flex items-center justify-center p-2 overflow-hidden shadow-inner relative">
              {hasStudioDesign ? (
                <div className="w-full h-full flex items-center justify-center pointer-events-none">
                  <DoorCadRenderer
                    hideDimensions={false}
                    w={w > 0 ? w : (door.systemConfig?.w || 1400)}
                    h={h > 0 ? h : (door.systemConfig?.h || 1600)}
                    aluminumColor={door.systemConfig?.aluminumColor || '#334155'}
                    hardwareColor={door.systemConfig?.hardwareColor || '#0f172a'}
                    frameShape={door.systemConfig?.frameShape || 'rectangular'}
                    rootCell={door.systemConfig!.rootCell}
                    frameConfig={door.systemConfig?.frameConfig}
                    sashConfig={door.systemConfig?.sashConfig}
                    selectedCellId={null}
                    onSelectCell={() => {}}
                  />
                </div>
              ) : imgSrc ? (
                <img
                  src={imgSrc}
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

          {/* BOM Tables Column */}
          <div
            className={`flex flex-col flex-1 min-w-0 ${
              mobileView === 'bom' ? 'flex' : 'hidden lg:flex'
            } lg:col-span-7`}
          >
            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-3 gap-1 sm:gap-2 overflow-x-auto no-scrollbar shrink-0">
              <button
                onClick={() => setActiveTab('bars')}
                className={`pb-2 px-2 sm:px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'bars'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Cắt nhôm ({bom?.groupedBars?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('beads')}
                className={`pb-2 px-2 sm:px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'beads'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Nẹp kính ({bom?.groupedBeads?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('glass')}
                className={`pb-2 px-2 sm:px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'glass'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Đặt kính ({bom?.cells?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('joints')}
                className={`pb-2 px-2 sm:px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 ${
                  activeTab === 'joints'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Con ke ({bom?.cornerJoints?.length || 0})</span>
                {bom?.hasUnconfiguredJoints && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Có vị trí chưa gán con ke" />
                )}
              </button>
              {bom?.grilles && bom.grilles.length > 0 && (
                <button
                  onClick={() => setActiveTab('grilles')}
                  className={`pb-2 px-2 sm:px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 ${
                    activeTab === 'grilles'
                      ? 'border-amber-600 text-amber-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>Nan đồng ({bom.grilles.length})</span>
                </button>
              )}
              <button
                onClick={() => setActiveTab('accessories')}
                className={`pb-2 px-2 sm:px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 ${
                  activeTab === 'accessories'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Phụ kiện ({bom?.accessories?.length || 0})</span>
              </button>
            </div>

            {/* Loading / Error / Data Content */}
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
              <div className="flex-1 overflow-x-auto min-w-0">
                {activeTab === 'bars' && <BomBarsTable bars={bom.groupedBars} />}
                {activeTab === 'beads' && <BomBeadsTable beads={bom.groupedBeads} />}
                {activeTab === 'glass' && <BomGlassTable cells={bom.cells} />}
                {activeTab === 'joints' && (
                  <BomJointsTable
                    joints={bom.cornerJoints}
                    hasUnconfiguredJoints={bom.hasUnconfiguredJoints}
                    totalJointPrice={bom.totalJointPrice}
                  />
                )}
                {activeTab === 'grilles' && (
                  <BomGrillesTable
                    grilles={bom.grilles}
                    totalGrillePrice={bom.totalGrillePrice}
                  />
                )}
                {activeTab === 'accessories' && (
                  <BomAccessoriesTable
                    accessories={bom.accessories}
                    totalAccessoryQty={bom.totalAccessoryQty}
                    totalAccessoryPrice={bom.totalAccessoryPrice}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 sm:px-6 sm:py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5 min-w-0 pr-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="truncate">
              Bóc tách tự động hệ nhôm {door.systemConfig?.sash?.family || 'chuẩn'}.
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={onClose} className="h-8 px-3 shrink-0">
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};
