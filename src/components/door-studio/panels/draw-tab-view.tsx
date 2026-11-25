'use client';

import React, { useState } from 'react';
import type { DrawTabViewProps } from './draw-tab-types';
import { CanvasCadView } from './canvas-cad-view';
import { DrawMobileDrawer } from './draw-mobile-drawer';
import { DrawMobileToolbar } from './draw-mobile-toolbar';
import { DrawRightPanel } from './draw-right-panel';
import { ToolboxLeft } from './toolbox-left';

export const DrawTabView: React.FC<DrawTabViewProps> = ({
  sketchMode = false,
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
  onSplitSashMullion,
  onDeleteSelected,
  onChangeTab,
  onSelectCell,
  onUpdateDimension,
  onResizeSplit,
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
  const [rightTab, setRightTab] = useState<'inspector' | 'bom'>('inspector');
  const [mobileDrawer, setMobileDrawer] = useState<'toolbox' | 'inspector' | 'bom' | null>(null);

  const handleCanvasSelectCell = (id: string | null) => {
    onSelectCell(id);
    setRightTab('inspector');
    if (id && typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileDrawer('inspector');
    }
  };

  const activeRightTab = sketchMode ? 'inspector' : rightTab;

  return (
    <div className="relative w-full h-full flex overflow-hidden divide-x divide-gray-200">
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
          isOpenBottom={frameConfig?.isOpenBottom}
          onChangeSashConfig={onChangeSashConfig}
        />
      </div>

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
          availableProfiles={allBrandProfiles ?? availableProfiles}
        />

        <DrawMobileToolbar
          sketchMode={sketchMode}
          historyIdx={historyIdx}
          historyLength={historyLength}
          selectedCellId={selectedCellId}
          mobileDrawer={mobileDrawer}
          onUndo={onUndo}
          onRedo={onRedo}
          onToggleDrawer={(drawer) => setMobileDrawer((prev) => (prev === drawer ? null : drawer))}
        />
      </div>

      <DrawRightPanel
        sketchMode={sketchMode}
        activeRightTab={activeRightTab}
        onChangeRightTab={setRightTab}
        selectedCellNode={selectedCellNode}
        rootCell={rootCell}
        w={w}
        h={h}
        frameShape={frameShape}
        frameConfig={frameConfig}
        sashConfig={sashConfig}
        calcData={calcData}
        isCalculating={isCalculating}
        onUpdateSelectedCell={onUpdateSelectedCell}
        onSplitSelectedCell={onSplitSelectedCell}
        onMergeSelectedCell={onMergeSelectedCell}
        onApplyGlassVisualToAll={onApplyGlassVisualToAll}
        onOpenGrilleModal={onOpenGrilleModal}
        onDeselectCell={() => onSelectCell(null)}
        onUpdateDimension={onUpdateDimension}
        onChangeFrameConfig={onChangeFrameConfig}
        frameUnitInfo={frameUnitInfo}
        onUpdateFrameUnit={onUpdateFrameUnit}
        globalSeriesId={globalSeriesId}
        availableSeries={availableSeries}
        availableGlasses={availableGlasses}
        availableBeads={availableBeads}
        availableProfiles={availableProfiles}
        defaultGlass={defaultGlass}
        allBrandProfiles={allBrandProfiles}
      />

      <DrawMobileDrawer
        mobileDrawer={mobileDrawer}
        sketchMode={sketchMode}
        onClose={() => setMobileDrawer(null)}
        onChangeDrawer={setMobileDrawer}
        w={w}
        h={h}
        aluminumColor={aluminumColor}
        hardwareColor={hardwareColor}
        frameShape={frameShape}
        frameConfig={frameConfig}
        sashConfig={sashConfig}
        rootCell={rootCell}
        selectedCellId={selectedCellId}
        selectedCellNode={selectedCellNode}
        activeLeftTab={activeLeftTab}
        currentSashType={currentSashType}
        historyIdx={historyIdx}
        historyLength={historyLength}
        calcData={calcData}
        isCalculating={isCalculating}
        onUndo={onUndo}
        onRedo={onRedo}
        onReset={onReset}
        onChangeDimension={onChangeDimension}
        onSelectAluminumColor={onSelectAluminumColor}
        onSelectHardwareColor={onSelectHardwareColor}
        onSelectFrameShape={onSelectFrameShape}
        onSelectSashType={onSelectSashType}
        onSplitMullion={onSplitMullion}
        onCoupleFrame={onCoupleFrame}
        onSplitSashMullion={onSplitSashMullion}
        onDeleteSelected={onDeleteSelected}
        onChangeTab={onChangeTab}
        onSelectCell={onSelectCell}
        onUpdateDimension={onUpdateDimension}
        onUpdateSelectedCell={onUpdateSelectedCell}
        onSplitSelectedCell={onSplitSelectedCell}
        onMergeSelectedCell={onMergeSelectedCell}
        onApplyGlassVisualToAll={onApplyGlassVisualToAll}
        onOpenGrilleModal={onOpenGrilleModal}
        availableGlasses={availableGlasses}
        availableBeads={availableBeads}
        availableProfiles={availableProfiles}
        defaultGlass={defaultGlass}
        aluminumColors={aluminumColors}
        onChangeFrameConfig={onChangeFrameConfig}
        onChangeSashConfig={onChangeSashConfig}
        isInsideSash={isInsideSash}
        frameUnitInfo={frameUnitInfo}
        onUpdateFrameUnit={onUpdateFrameUnit}
        globalSeriesId={globalSeriesId}
        availableSeries={availableSeries}
        allBrandProfiles={allBrandProfiles}
      />
    </div>
  );
};
