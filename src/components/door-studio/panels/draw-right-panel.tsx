'use client';

import React from 'react';
import { BarChart3, Sliders } from 'lucide-react';
import type { DoorCalculateResponse, DoorSeries, Glass, ProfileBar } from '@/types';
import { BomSidebar } from '../bom-sidebar';
import { isNodeTouchingBottom } from '../cad-engine/cad-cell-config-resolver';
import type { FrameConfig, FrameShape, SashConfig, SceneCellNode } from '../studio-types';
import type { EnclosingFrameUnitInfo } from '../utils/door-tree-utils';
import { CellInspector } from './cell-inspector';

interface DrawRightPanelProps {
  sketchMode: boolean;
  activeRightTab: 'inspector' | 'bom';
  onChangeRightTab: (tab: 'inspector' | 'bom') => void;
  selectedCellNode: SceneCellNode | null;
  rootCell: SceneCellNode;
  w: number;
  h: number;
  frameShape: FrameShape;
  frameConfig: FrameConfig;
  sashConfig?: SashConfig;
  calcData: DoorCalculateResponse | null;
  isCalculating: boolean;
  onUpdateSelectedCell: (updates: Partial<SceneCellNode>) => void;
  onSplitSelectedCell: (direction: 'vertical' | 'horizontal') => void;
  onMergeSelectedCell: () => void;
  onApplyGlassVisualToAll?: (patch: Partial<SceneCellNode>) => void;
  onOpenGrilleModal?: (cell: SceneCellNode) => void;
  onDeselectCell: () => void;
  onUpdateDimension: (
    target: 'w' | 'h' | 'cell' | 'cell-w' | 'cell-h' | 'handleHeight',
    value: number,
    cellId?: string,
    isFinal?: boolean,
  ) => void;
  onChangeFrameConfig?: (updates: Partial<FrameConfig>) => void;
  frameUnitInfo?: EnclosingFrameUnitInfo | null;
  onUpdateFrameUnit?: (updates: Partial<SceneCellNode>) => void;
  globalSeriesId?: number;
  availableSeries?: DoorSeries[];
  availableGlasses?: Glass[];
  availableBeads?: ProfileBar[];
  availableProfiles?: ProfileBar[];
  defaultGlass?: Glass | null;
  allBrandProfiles?: ProfileBar[];
}

export function DrawRightPanel({
  sketchMode,
  activeRightTab,
  onChangeRightTab,
  selectedCellNode,
  rootCell,
  w,
  h,
  frameShape,
  frameConfig,
  sashConfig,
  calcData,
  isCalculating,
  onUpdateSelectedCell,
  onSplitSelectedCell,
  onMergeSelectedCell,
  onApplyGlassVisualToAll,
  onOpenGrilleModal,
  onDeselectCell,
  onUpdateDimension,
  onChangeFrameConfig,
  frameUnitInfo,
  onUpdateFrameUnit,
  globalSeriesId,
  availableSeries,
  availableGlasses,
  availableBeads,
  availableProfiles,
  defaultGlass,
  allBrandProfiles,
}: DrawRightPanelProps) {
  return (
    <div className="w-[320px] xl:w-[340px] shrink-0 h-full bg-white hidden lg:flex flex-col border-l border-slate-200">
      {!sketchMode ? (
        <div className="p-2 border-b border-slate-200 flex items-center bg-slate-50/70 shrink-0">
          <div className="grid grid-cols-2 gap-1 w-full p-1 bg-slate-100 rounded-lg border border-slate-200/80">
            <button
              type="button"
              onClick={() => onChangeRightTab('inspector')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeRightTab === 'inspector'
                  ? 'bg-primary text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Sliders size={13} />
              <span>Thuộc tính ô</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeRightTab('bom')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeRightTab === 'bom'
                  ? 'bg-primary text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <BarChart3 size={13} />
              <span>Bóc tách BOM</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="px-3 py-2.5 border-b border-slate-200 bg-slate-50/70 flex items-center gap-2 shrink-0">
          <Sliders size={14} className="text-primary" />
          <span className="text-xs font-semibold text-slate-800">Thuộc tính ô phác thảo</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {activeRightTab === 'inspector' ? (
          <CellInspector
            selectedCell={selectedCellNode}
            onUpdateCell={onUpdateSelectedCell}
            onSplitCell={onSplitSelectedCell}
            onMergeCell={onMergeSelectedCell}
            onApplyGlassVisualToAll={onApplyGlassVisualToAll}
            onOpenGrilleModal={onOpenGrilleModal}
            onDeselect={onDeselectCell}
            availableGlasses={availableGlasses}
            availableBeads={availableBeads}
            defaultGlass={defaultGlass}
            onUpdateDimension={(target, val, cellId) => onUpdateDimension(target, val, cellId)}
            frameShape={frameShape}
            frameConfig={frameConfig}
            doorW={w}
            doorH={h}
            isTouchingBottom={
              selectedCellNode ? isNodeTouchingBottom(rootCell, selectedCellNode.id) : false
            }
            availableProfiles={availableProfiles}
            sashConfig={sashConfig}
            onChangeFrameConfig={onChangeFrameConfig}
            frameUnitInfo={frameUnitInfo}
            onUpdateFrameUnit={onUpdateFrameUnit}
            globalSeriesId={globalSeriesId}
            availableSeries={availableSeries}
            allBrandProfiles={allBrandProfiles}
          />
        ) : (
          <BomSidebar calcData={calcData} isLoading={isCalculating} />
        )}
      </div>
    </div>
  );
}
