'use client';

import React, { useState } from 'react';
import {
  FrameShape,
  SashOpenType,
  SceneCellNode,
  FrameConfig,
  SashConfig,
  MullionInfo,
  ColorSwatch,
} from '../studio-types';
import { ToolboxLeft } from './toolbox-left';
import { CanvasCadView } from './canvas-cad-view';
import { CellInspector } from './cell-inspector';
import { BomSidebar } from '../bom-sidebar';
import { DoorCalculateResponse, Glass, ProfileBar } from '@/types';
import { Undo2, Redo2, PenTool, Sliders, BarChart3, X } from 'lucide-react';

interface DrawTabViewProps {
  w: number;
  h: number;
  aluminumColor: string;
  hardwareColor: string;
  frameShape: FrameShape;
  frameConfig: FrameConfig;
  sashConfig?: SashConfig;
  rootCell: SceneCellNode;
  selectedCellId: string | null;
  selectedCellNode: SceneCellNode | null;
  activeLeftTab: 'frame' | 'sash';
  currentSashType: SashOpenType;
  historyIdx: number;
  historyLength: number;
  calcData: DoorCalculateResponse | null;
  isCalculating: boolean;
  selectedMullionId?: string | null;
  onSelectMullion?: (mullion: MullionInfo) => void;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onChangeDimension: (w: number, h: number) => void;
  onSelectAluminumColor: (color: string) => void;
  onSelectHardwareColor: (color: string) => void;
  onSelectFrameShape: (shape: FrameShape) => void;
  onSelectSashType: (type: SashOpenType) => void;
  onSplitMullion: (count: number, direction: 'vertical' | 'horizontal') => void;
  onCoupleFrame: (direction: 'vertical' | 'horizontal') => void;
  onChangeTab: (tab: 'frame' | 'sash') => void;
  onSelectCell: (id: string | null) => void;
  onUpdateDimension: (target: 'w' | 'h' | 'cell' | 'cell-w' | 'cell-h' | 'handleHeight', value: number, cellId?: string) => void;
  onResizeSplit?: (params: import('../cad-engine/door-cad-renderer').ResizeSplitParams) => void;
  onUpdateSelectedCell: (updates: Partial<SceneCellNode>) => void;
  onSplitSelectedCell: (direction: 'vertical' | 'horizontal') => void;
  onMergeSelectedCell: () => void;
  onOpenGrilleModal?: (cell: SceneCellNode) => void;
  availableGlasses?: Glass[];
  availableBeads?: ProfileBar[];
  defaultGlass?: Glass | null;
  aluminumColors?: ColorSwatch[];
  onChangeFrameConfig?: (updates: Partial<FrameConfig>) => void;
}

export const DrawTabView: React.FC<DrawTabViewProps> = ({
  w,
  h,
  aluminumColor,
  hardwareColor,
  frameShape,
  frameConfig,
  sashConfig,
  rootCell,
  selectedCellId,
  selectedCellNode,
  activeLeftTab,
  currentSashType,
  historyIdx,
  historyLength,
  calcData,
  isCalculating,
  selectedMullionId,
  onSelectMullion,
  onUndo,
  onRedo,
  onReset,
  onChangeDimension,
  onSelectAluminumColor,
  onSelectHardwareColor,
  onSelectFrameShape,
  onSelectSashType,
  onSplitMullion,
  onCoupleFrame,
  onChangeTab,
  onSelectCell,
  onUpdateDimension,
  onResizeSplit,
  onUpdateSelectedCell,
  onSplitSelectedCell,
  onMergeSelectedCell,
  onOpenGrilleModal,
  availableGlasses,
  availableBeads,
  defaultGlass,
  aluminumColors,
  onChangeFrameConfig,
}) => {
  const [rightTab, setRightTab] = useState<'inspector' | 'bom'>('inspector');
  const [mobileDrawer, setMobileDrawer] = useState<'toolbox' | 'inspector' | 'bom' | null>(null);

  const handleCanvasSelectCell = (id: string | null) => {
    onSelectCell(id);
    setRightTab('inspector');
    // Khi chạm chọn ô trên mobile/tablet (< 1024px), tự động mở Bottom Sheet inspector
    if (id && typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileDrawer('inspector');
    }
  };

  return (
    <div className="relative w-full h-full flex overflow-hidden divide-x divide-gray-200">
      {/* 1. Left Toolbox (Desktop lg+) */}
      <div className="w-[300px] xl:w-[320px] shrink-0 h-full bg-slate-50/50 hidden lg:block overflow-y-auto">
        <ToolboxLeft
          w={w}
          h={h}
          aluminumColor={aluminumColor}
          hardwareColor={hardwareColor}
          frameShape={frameShape}
          currentSashType={currentSashType}
          activeTab={activeLeftTab}
          canUndo={historyIdx > 0}
          canRedo={historyIdx < historyLength - 1}
          onUndo={onUndo}
          onRedo={onRedo}
          onReset={onReset}
          onChangeDimension={onChangeDimension}
          onSelectAluminumColor={onSelectAluminumColor}
          onSelectHardwareColor={onSelectHardwareColor}
          onSelectFrameShape={onSelectFrameShape}
          selectedCellId={selectedCellId}
          onSelectSashType={onSelectSashType}
          onSplitMullion={onSplitMullion}
          onCoupleFrame={onCoupleFrame}
          onChangeTab={onChangeTab}
          aluminumColors={aluminumColors}
        />
      </div>

      {/* 2. Central CAD View (Hero View on all devices) */}
      <div className="flex-1 h-full min-w-0 relative flex flex-col">
        <CanvasCadView
          w={w}
          h={h}
          aluminumColor={aluminumColor}
          hardwareColor={hardwareColor}
          frameShape={frameShape}
          frameConfig={frameConfig}
          sashConfig={sashConfig}
          rootCell={rootCell}
          selectedCellId={selectedCellId}
          selectedMullionId={selectedMullionId}
          onSelectMullion={onSelectMullion}
          onSelectCell={handleCanvasSelectCell}
          onUpdateDimension={onUpdateDimension}
          onResizeSplit={onResizeSplit}
        />

        {/* Floating Action Pill Bar trên Mobile & Tablet (< lg) */}
        <div className="lg:hidden absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 p-1 bg-slate-900/90 backdrop-blur-md text-white rounded-full shadow-2xl border border-slate-700/80 max-w-[94vw] select-none">
          {/* Nút Hoàn tác & Làm lại */}
          <button
            type="button"
            onClick={onUndo}
            disabled={historyIdx <= 0}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all text-slate-200 cursor-pointer"
            title="Hoàn tác"
          >
            <Undo2 size={13} />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={historyIdx >= historyLength - 1}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all text-slate-200 cursor-pointer"
            title="Làm lại"
          >
            <Redo2 size={13} />
          </button>

          <div className="w-px h-4 bg-slate-700/90 mx-0.5" />

          {/* 3 Nút Drawer chính */}
          <button
            type="button"
            onClick={() => setMobileDrawer((prev) => (prev === 'toolbox' ? null : 'toolbox'))}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              mobileDrawer === 'toolbox'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <PenTool size={13} />
            <span>Vẽ cửa</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileDrawer((prev) => (prev === 'inspector' ? null : 'inspector'))}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer relative ${
              mobileDrawer === 'inspector'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Sliders size={13} />
            <span>Ô kính</span>
            {selectedCellId && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileDrawer((prev) => (prev === 'bom' ? null : 'bom'))}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              mobileDrawer === 'bom'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <BarChart3 size={13} />
            <span>BOM</span>
          </button>
        </div>
      </div>

      {/* 3. Right Inspector & BOM (Desktop lg+) */}
      <div className="w-[320px] xl:w-[340px] shrink-0 h-full bg-white hidden lg:flex flex-col border-l border-slate-200">
        <div className="p-2 border-b border-slate-200 flex items-center bg-slate-50/70 shrink-0">
          <div className="grid grid-cols-2 gap-1 w-full p-1 bg-slate-100 rounded-lg border border-slate-200/80">
            <button
              type="button"
              onClick={() => setRightTab('inspector')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                rightTab === 'inspector'
                  ? 'bg-primary text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Sliders size={13} />
              <span>Thuộc tính ô</span>
            </button>
            <button
              type="button"
              onClick={() => setRightTab('bom')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                rightTab === 'bom'
                  ? 'bg-primary text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <BarChart3 size={13} />
              <span>Bóc tách BOM</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {rightTab === 'inspector' ? (
            <CellInspector
              selectedCell={selectedCellNode}
              onUpdateCell={onUpdateSelectedCell}
              onSplitCell={onSplitSelectedCell}
              onMergeCell={onMergeSelectedCell}
              onOpenGrilleModal={onOpenGrilleModal}
              onDeselect={() => onSelectCell(null)}
              availableGlasses={availableGlasses}
              availableBeads={availableBeads}
              defaultGlass={defaultGlass}
              onUpdateDimension={(target, val, cellId) => onUpdateDimension(target, val, cellId)}
              frameShape={frameShape}
              frameConfig={frameConfig}
              doorW={w}
              onChangeFrameConfig={onChangeFrameConfig}
            />
          ) : (
            <BomSidebar calcData={calcData} isLoading={isCalculating} />
          )}
        </div>
      </div>

      {/* 4. Mobile Bottom Sheet Drawer (< lg) */}
      {mobileDrawer && (
        <div className="lg:hidden fixed inset-0 z-40 flex flex-col justify-end pointer-events-none">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/35 backdrop-blur-2xs pointer-events-auto transition-opacity"
            onClick={() => setMobileDrawer(null)}
          />

          {/* Drawer Sheet Container */}
          <div className="relative pointer-events-auto bg-white rounded-t-2xl shadow-2xl border-t border-slate-200/90 max-h-[62vh] h-[60vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Header with Drag Handle & Sub-tab Switcher */}
            <div className="px-3 pt-2 pb-1.5 border-b border-gray-100 bg-slate-50/90 shrink-0">
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-2" />
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1 bg-gray-200/70 p-0.5 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setMobileDrawer('toolbox')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      mobileDrawer === 'toolbox'
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    🛠️ Vẽ cửa
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileDrawer('inspector')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      mobileDrawer === 'inspector'
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span>🔍 Ô kính</span>
                    {selectedCellId && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileDrawer('bom')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      mobileDrawer === 'bom'
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    📊 BOM
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileDrawer(null)}
                  className="p-1 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                  title="Đóng ngăn kéo"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Sheet Body Scrollable */}
            <div className="flex-1 overflow-y-auto bg-white">
              {mobileDrawer === 'toolbox' && (
                <ToolboxLeft
                  w={w}
                  h={h}
                  aluminumColor={aluminumColor}
                  hardwareColor={hardwareColor}
                  frameShape={frameShape}
                  currentSashType={currentSashType}
                  activeTab={activeLeftTab}
                  canUndo={historyIdx > 0}
                  canRedo={historyIdx < historyLength - 1}
                  onUndo={onUndo}
                  onRedo={onRedo}
                  onReset={onReset}
                  onChangeDimension={onChangeDimension}
                  onSelectAluminumColor={onSelectAluminumColor}
                  onSelectHardwareColor={onSelectHardwareColor}
                  onSelectFrameShape={onSelectFrameShape}
                  selectedCellId={selectedCellId}
                  onSelectSashType={onSelectSashType}
                  onSplitMullion={onSplitMullion}
                  onCoupleFrame={onCoupleFrame}
                  onChangeTab={onChangeTab}
                  aluminumColors={aluminumColors}
                />
              )}

              {mobileDrawer === 'inspector' && (
                <CellInspector
                  selectedCell={selectedCellNode}
                  onUpdateCell={onUpdateSelectedCell}
                  onSplitCell={onSplitSelectedCell}
                  onMergeCell={onMergeSelectedCell}
                  onOpenGrilleModal={onOpenGrilleModal}
                  onDeselect={() => onSelectCell(null)}
                  availableGlasses={availableGlasses}
                  availableBeads={availableBeads}
                  defaultGlass={defaultGlass}
                  onUpdateDimension={(target, val, cellId) => onUpdateDimension(target, val, cellId)}
                  frameShape={frameShape}
                  frameConfig={frameConfig}
                  doorW={w}
                  onChangeFrameConfig={onChangeFrameConfig}
                />
              )}

              {mobileDrawer === 'bom' && (
                <BomSidebar calcData={calcData} isLoading={isCalculating} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
