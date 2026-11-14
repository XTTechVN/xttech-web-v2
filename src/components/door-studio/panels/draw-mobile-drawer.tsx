'use client';

import React from 'react';
import { X } from 'lucide-react';
import type { DoorCalculateResponse, DoorSeries, Glass, ProfileBar } from '@/types';
import { BomSidebar } from '../bom-sidebar';
import { isNodeTouchingBottom } from '../cad-engine/cad-cell-config-resolver';
import type {
  ColorSwatch,
  FrameConfig,
  FrameShape,
  SashConfig,
  SashOpenType,
  SceneCellNode,
} from '../studio-types';
import type { EnclosingFrameUnitInfo } from '../utils/door-tree-utils';
import { CellInspector } from './cell-inspector';
import { ToolboxLeft } from './toolbox-left';

interface DrawMobileDrawerProps {
  mobileDrawer: 'toolbox' | 'inspector' | 'bom' | null;
  sketchMode?: boolean;
  onClose: () => void;
  onChangeDrawer: (next: 'toolbox' | 'inspector' | 'bom') => void;
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
  onSplitSashMullion?: (count: number, direction: 'vertical' | 'horizontal') => void;
  onDeleteSelected?: () => void;
  onChangeTab: (tab: 'frame' | 'sash') => void;
  onSelectCell: (id: string | null) => void;
  onUpdateDimension: (
    target: 'w' | 'h' | 'cell' | 'cell-w' | 'cell-h' | 'handleHeight',
    value: number,
    cellId?: string,
    isFinal?: boolean,
  ) => void;
  onUpdateSelectedCell: (updates: Partial<SceneCellNode>) => void;
  onSplitSelectedCell: (direction: 'vertical' | 'horizontal') => void;
  onMergeSelectedCell: () => void;
  onApplyGlassVisualToAll?: (patch: Partial<SceneCellNode>) => void;
  onOpenGrilleModal?: (cell: SceneCellNode) => void;
  availableGlasses?: Glass[];
  availableBeads?: ProfileBar[];
  availableProfiles?: ProfileBar[];
  defaultGlass?: Glass | null;
  aluminumColors?: ColorSwatch[];
  onChangeFrameConfig?: (updates: Partial<FrameConfig>) => void;
  onChangeSashConfig?: (updates: Partial<SashConfig>) => void;
  isInsideSash?: boolean;
  frameUnitInfo?: EnclosingFrameUnitInfo | null;
  onUpdateFrameUnit?: (updates: Partial<SceneCellNode>) => void;
  globalSeriesId?: number;
  availableSeries?: DoorSeries[];
  allBrandProfiles?: ProfileBar[];
}

export const DrawMobileDrawer: React.FC<DrawMobileDrawerProps> = ({
  mobileDrawer,
  sketchMode = false,
  onClose,
  onChangeDrawer,
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
  onSplitSashMullion,
  onDeleteSelected,
  onChangeTab,
  onSelectCell,
  onUpdateDimension,
  onUpdateSelectedCell,
  onSplitSelectedCell,
  onMergeSelectedCell,
  onApplyGlassVisualToAll,
  onOpenGrilleModal,
  availableGlasses,
  availableBeads,
  availableProfiles,
  defaultGlass,
  aluminumColors,
  onChangeFrameConfig,
  onChangeSashConfig,
  isInsideSash,
  frameUnitInfo,
  onUpdateFrameUnit,
  globalSeriesId,
  availableSeries,
  allBrandProfiles,
}) => {
  if (!mobileDrawer) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-40 flex flex-col justify-end pointer-events-none">
      <div className="absolute inset-0 bg-slate-900/35 backdrop-blur-2xs pointer-events-auto transition-opacity" onClick={onClose} />
      <div className="relative pointer-events-auto bg-white rounded-t-2xl shadow-2xl border-t border-slate-200/90 max-h-[62vh] h-[60vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
        <div className="px-3 pt-2 pb-1.5 border-b border-gray-100 bg-slate-50/90 shrink-0">
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-2" />
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1 bg-gray-200/70 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => onChangeDrawer('toolbox')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  mobileDrawer === 'toolbox' ? 'bg-white text-primary shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Vẽ cửa
              </button>
              <button
                type="button"
                onClick={() => onChangeDrawer('inspector')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  mobileDrawer === 'inspector' ? 'bg-white text-primary shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>Ô kính</span>
                {selectedCellId && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
              </button>
              {!sketchMode && (
                <button
                  type="button"
                  onClick={() => onChangeDrawer('bom')}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    mobileDrawer === 'bom' ? 'bg-white text-primary shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  BOM
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
              title="Đóng ngăn kéo"
            >
              <X size={16} />
            </button>
          </div>
        </div>

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
              isOpenBottom={frameConfig?.isOpenBottom}
              selectedCell={selectedCellNode}
              onUpdateCell={onUpdateSelectedCell}
              onSplitMullion={onSplitMullion}
              onCoupleFrame={onCoupleFrame}
              onSplitSashMullion={onSplitSashMullion}
              onDeleteSelected={onDeleteSelected}
              onChangeTab={onChangeTab}
              aluminumColors={aluminumColors}
              isInsideSash={isInsideSash}
              sashConfig={sashConfig}
              onChangeSashConfig={onChangeSashConfig}
            />
          )}

          {mobileDrawer === 'inspector' && (
            <CellInspector
              selectedCell={selectedCellNode}
              onUpdateCell={onUpdateSelectedCell}
              onSplitCell={onSplitSelectedCell}
              onMergeCell={onMergeSelectedCell}
              onApplyGlassVisualToAll={onApplyGlassVisualToAll}
              onOpenGrilleModal={onOpenGrilleModal}
              onDeselect={() => onSelectCell(null)}
              availableGlasses={availableGlasses}
              availableBeads={availableBeads}
              defaultGlass={defaultGlass}
              onUpdateDimension={(target, val, cellId) => onUpdateDimension(target, val, cellId)}
              frameShape={frameShape}
              frameConfig={frameConfig}
              doorW={w}
              doorH={h}
              isTouchingBottom={selectedCellNode ? isNodeTouchingBottom(rootCell, selectedCellNode.id) : false}
              availableProfiles={availableProfiles}
              sashConfig={sashConfig}
              onChangeFrameConfig={onChangeFrameConfig}
              frameUnitInfo={frameUnitInfo}
              onUpdateFrameUnit={onUpdateFrameUnit}
              globalSeriesId={globalSeriesId}
              availableSeries={availableSeries}
              allBrandProfiles={allBrandProfiles}
            />
          )}

          {!sketchMode && mobileDrawer === 'bom' && (
            <BomSidebar calcData={calcData} isLoading={isCalculating} />
          )}
        </div>
      </div>
    </div>
  );
};
