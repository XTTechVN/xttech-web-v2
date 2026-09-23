'use client';

import React, { useState } from 'react';
import {
  FrameShape,
  SashOpenType,
  SceneCellNode,
  FrameConfig,
  SashConfig,
  MullionInfo,
} from '../studio-types';
import { ToolboxLeft } from './toolbox-left';
import { CanvasCadView } from './canvas-cad-view';
import { CellInspector } from './cell-inspector';
import { BomSidebar } from '../bom-sidebar';
import { DoorCalculateResponse } from '@/types';

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
  onUpdateDimension: (target: 'w' | 'h' | 'cell', value: number, cellId?: string) => void;
  onUpdateSelectedCell: (updates: Partial<SceneCellNode>) => void;
  onSplitSelectedCell: (direction: 'vertical' | 'horizontal') => void;
  onMergeSelectedCell: () => void;
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
  onUpdateSelectedCell,
  onSplitSelectedCell,
  onMergeSelectedCell,
}) => {
  const [rightTab, setRightTab] = useState<'inspector' | 'bom'>('inspector');

  return (
    <div className="flex h-[80vh] -m-4 overflow-hidden divide-x divide-gray-200">
      {/* Left Toolbox */}
      <div className="w-[320px] shrink-0 h-full bg-slate-50/50">
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
        />
      </div>

      {/* Central CAD View */}
      <div className="flex-1 h-full min-w-0">
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
          onSelectCell={(id) => {
            onSelectCell(id);
            setRightTab('inspector');
          }}
          onUpdateDimension={onUpdateDimension}
        />
      </div>

      {/* Right Inspector & BOM */}
      <div className="w-[340px] shrink-0 h-full bg-white flex flex-col">
        <div className="h-10 px-3 border-b border-gray-200 flex items-center gap-2 bg-slate-50/60">
          <button
            type="button"
            onClick={() => setRightTab('inspector')}
            className={`text-xs font-bold pb-2 pt-2 border-b-2 transition-colors cursor-pointer ${
              rightTab === 'inspector'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            🔎 Thuộc tính ô
          </button>
          <button
            type="button"
            onClick={() => setRightTab('bom')}
            className={`text-xs font-bold pb-2 pt-2 border-b-2 transition-colors cursor-pointer ${
              rightTab === 'bom'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            📊 BOM Bóc tách
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {rightTab === 'inspector' ? (
            <CellInspector
              selectedCell={selectedCellNode}
              onUpdateCell={onUpdateSelectedCell}
              onSplitCell={onSplitSelectedCell}
              onMergeCell={onMergeSelectedCell}
              onDeselect={() => onSelectCell(null)}
            />
          ) : (
            <BomSidebar calcData={calcData} isLoading={isCalculating} />
          )}
        </div>
      </div>
    </div>
  );
};
