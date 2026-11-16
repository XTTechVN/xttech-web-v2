'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Modal } from '@/components';
import { useDoorStudioState } from './hooks/useDoorStudioState';
import { AccessoriesTabView } from './panels/accessories-tab-view';
import { ConfigTabView } from './panels/config/config-tab-view';
import { DrawTabView } from './panels/draw-tab-view';
import { InfoTabView } from './panels/info-tab-view';
import { ResultsTabView } from './panels/results-tab-view';
import { StudioModalFooter } from './panels/studio-modal-footer';
import { StudioModalHeader } from './panels/studio-modal-header';
import { StudioModalOverlays } from './panels/studio-modal-overlays';
import { FAMILY_TO_TYPE_MAP, TYPE_TO_FAMILY_MAP } from './studio-constants';
import type { DoorStudioModalProps, DoorStudioModalSaveData } from './studio-modal-types';
import type { SashConfig } from './studio-types';
import { updateNode } from './utils/door-tree-utils';

export type { DoorStudioModalProps, DoorStudioModalSaveData };

const Door3DViewer = dynamic(() => import('./canvas-3d/door-3d-viewer'), { ssr: false });

export const DoorStudioModal: React.FC<DoorStudioModalProps> = ({
  isOpen,
  onClose,
  door,
  defaultBrandId,
  initialTab,
  sketchMode = false,
  templateDoorName,
  onOpenTemplatePicker,
  onSaveSuccess,
  onCustomSave,
}) => {
  const state = useDoorStudioState({
    isOpen,
    onClose,
    door,
    defaultBrandId,
    initialTab,
    sketchMode,
    onSaveSuccess,
    onCustomSave,
  });

  const handleSashConfigChange = (updates: Partial<SashConfig>) => {
    state.setSashConfig((prev) => ({ ...prev, ...updates }));
    if (updates.family) {
      const nextType = FAMILY_TO_TYPE_MAP[updates.family];
      if (nextType && nextType !== state.type) state.setType(nextType);
    }
  };

  const handleInfoFieldChange = (field: string, val: string | number | undefined) => {
    if (field === 'w' && typeof val === 'number') state.setW(val);
    else if (field === 'h' && typeof val === 'number') state.setH(val);
    else if (field === 'name') state.setName(String(val ?? ''));
    else if (field === 'code') state.setCode(String(val ?? ''));
    else if (field === 'type') {
      const nextType = String(val ?? '');
      state.setType(nextType);
      const mappedFamily = TYPE_TO_FAMILY_MAP[nextType];
      if (mappedFamily && mappedFamily !== state.sashConfig.family) {
        state.setSashConfig((prev) => ({ ...prev, family: mappedFamily }));
      }
    } else if (field === 'brandId') {
      const nextBrandId = typeof val === 'number' ? val : null;
      state.setSelectedBrandId(nextBrandId);
      const nextSeries = state.allAvailableSeries.filter((s) => !nextBrandId || s.brandId === nextBrandId);
      state.setSeriesId(nextSeries[0]?.id || undefined);
    } else if (field === 'aluminumColor') state.setAluminumColor(String(val ?? ''));
    else if (field === 'hardwareColor') state.setHardwareColor(String(val ?? ''));
    else if (field === 'seriesId') state.setSeriesId(typeof val === 'number' ? val : undefined);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      bodyClassName="p-0 overflow-hidden flex flex-col h-full"
      size="full"
      title={
        <StudioModalHeader
          visibleNavTabs={state.visibleNavTabs}
          activeMainTab={state.activeMainTab}
          onSelectTab={state.setActiveMainTab}
          templateDoorName={templateDoorName}
          fallbackName={state.name}
          onOpenTemplatePicker={onOpenTemplatePicker}
          sketchMode={sketchMode}
        />
      }
      footer={
        <StudioModalFooter
          sketchMode={sketchMode}
          isSaving={state.isSaving}
          onClose={onClose}
          onSave={() => state.saveMutation()}
        />
      }
    >
      {state.activeMainTab === 'info' && (
        <div className="flex-1 h-full overflow-y-auto">
          <InfoTabView
            name={state.name}
            code={state.code}
            type={state.type}
            brandId={state.selectedBrandId ?? undefined}
            brandsList={state.availableBrands}
            seriesId={state.seriesId}
            specification={`${state.w}×${state.h}mm, ${state.frameShape}`}
            w={state.w}
            h={state.h}
            glassPrice={350000}
            aluminumColor={state.aluminumColor}
            hardwareColor={state.hardwareColor}
            doorSeriesList={state.availableSeries}
            aluminumColors={state.dynamicAluminumColors}
            sketchMode={sketchMode}
            onChangeField={handleInfoFieldChange}
          />
        </div>
      )}

      {state.activeMainTab === 'draw' && (
        <DrawTabView
          sketchMode={sketchMode}
          w={state.w}
          h={state.h}
          aluminumColor={state.aluminumColor}
          hardwareColor={state.hardwareColor}
          frameShape={state.frameShape}
          frameConfig={state.frameConfig}
          sashConfig={state.sashConfig}
          rootCell={state.rootCell}
          selectedCellId={state.selectedCellId}
          selectedCellNode={state.selectedCellNode}
          selectedMullionId={state.selectedMullion?.id}
          onSelectMullion={state.handleSelectMullion}
          activeLeftTab={state.activeLeftTab}
          currentSashType={state.effectiveSashType}
          historyIdx={state.historyIdx}
          historyLength={state.history.length}
          calcData={state.calcData}
          isCalculating={state.isCalculating}
          onUndo={state.handleUndo}
          onRedo={state.handleRedo}
          onReset={state.handleReset}
          onChangeDimension={state.handleChangeDimension}
          onSelectAluminumColor={state.setAluminumColor}
          onSelectHardwareColor={state.setHardwareColor}
          onSelectFrameShape={state.setFrameShape}
          onSelectSashType={state.handleSelectSashType}
          onSplitMullion={state.handleSplitMullion}
          onCoupleFrame={state.handleCoupleFrame}
          onSplitSashMullion={state.handleSplitSashMullion}
          onDeleteSelected={state.handleDeleteSelected}
          onChangeTab={state.setActiveLeftTab}
          onSelectCell={state.setSelectedCellId}
          onUpdateDimension={state.handleUpdateDimension}
          onResizeSplit={state.handleResizeSplit}
          onUpdateSelectedCell={state.handleUpdateSelectedCell}
          onApplyGlassVisualToAll={state.handleApplyGlassVisualToAll}
          onSplitSelectedCell={(dir) => state.handleSplitMullion(2, dir)}
          onMergeSelectedCell={() => {
            if (!state.selectedCellId) return;
            state.pushState(updateNode(state.rootCell, state.selectedCellId, { children: [] }));
          }}
          onOpenGrilleModal={(cell) => {
            state.setGrilleEditingCell(cell);
            state.setIsGrilleModalOpen(true);
          }}
          availableGlasses={state.availableGlasses}
          availableBeads={state.availableBeads}
          defaultGlass={state.defaultGlass}
          aluminumColors={state.dynamicAluminumColors}
          onChangeFrameConfig={(updates) => state.setFrameConfig((prev) => ({ ...prev, ...updates }))}
          onChangeSashConfig={handleSashConfigChange}
          isInsideSash={state.isSelectedInsideSash}
          availableProfiles={state.availableProfiles}
          frameUnitInfo={state.selectedFrameUnitInfo}
          onUpdateFrameUnit={state.handleUpdateSelectedFrameUnit}
          globalSeriesId={state.seriesId}
          availableSeries={state.availableSeries}
          allBrandProfiles={state.allBrandProfiles}
        />
      )}

      {!sketchMode && state.activeMainTab === 'config' && (
        <div className="flex-1 h-full overflow-y-auto">
          <ConfigTabView
            frameConfig={state.frameConfig}
            sashConfig={state.sashConfig}
            onChangeFrameConfig={(updates) => state.setFrameConfig((prev) => ({ ...prev, ...updates }))}
            onChangeSashConfig={handleSashConfigChange}
            profiles={state.availableProfiles}
          />
        </div>
      )}

      {!sketchMode && state.activeMainTab === 'bom' && (
        <div className="flex-1 h-full overflow-y-auto">
          <ResultsTabView
            calcData={state.calcData}
            isCalculating={state.isCalculating}
            w={state.w}
            h={state.h}
            rootCell={state.rootCell}
            frameConfig={state.frameConfig}
            sashConfig={state.sashConfig}
            seriesId={state.seriesId}
            onNavigateTab={state.setActiveMainTab}
          />
        </div>
      )}

      {!sketchMode && state.activeMainTab === 'accessories' && (
        <div className="flex-1 h-full overflow-y-auto">
          <AccessoriesTabView
            combos={state.availableCombos}
            selectedComboIds={state.selectedComboIds}
            onToggleCombo={state.handleToggleCombo}
            accessories={state.availableAccessories}
            brands={state.availableAccessoryBrands}
            selectedAccessories={state.selectedAccessories}
            onUpdateAccessoryQty={state.handleUpdateAccessoryQty}
            onSetAccessoryQty={state.handleSetAccessoryQty}
            onClearAll={state.handleClearAllAccessories}
            hardwareColor={state.hardwareColor}
            onChangeHardwareColor={state.setHardwareColor}
            calcData={state.calcData}
            isCalculating={state.isCalculating}
          />
        </div>
      )}

      {state.activeMainTab === 'view3d' && (
        <div className="flex-1 h-full overflow-hidden flex flex-col">
          <Door3DViewer
            w={state.w}
            h={state.h}
            aluminumColor={state.aluminumColor}
            hardwareColor={state.hardwareColor}
            frameShape={state.frameShape}
            rootCell={state.rootCell}
            frameConfig={state.frameConfig}
            sashConfig={state.sashConfig}
            availableProfiles={state.allBrandProfiles}
            aluminumColors={state.dynamicAluminumColors}
            onSelectAluminumColor={state.setAluminumColor}
            onSelectHardwareColor={state.setHardwareColor}
          />
        </div>
      )}

      <StudioModalOverlays
        isMullionModalOpen={state.isMullionModalOpen}
        selectedMullion={state.selectedMullion}
        availableProfiles={state.availableProfiles}
        allBrandProfiles={state.allBrandProfiles}
        onCloseMullionModal={() => {
          state.setIsMullionModalOpen(false);
          state.setSelectedMullion(null);
        }}
        onSaveMullion={state.handleSaveMullion}
        onDeleteMullion={state.handleDeleteMullion}
        onLocalTransposeMullion={state.handleLocalTransposeMullion}
        isGrilleModalOpen={state.isGrilleModalOpen}
        grilleEditingCell={state.grilleEditingCell}
        onCloseGrilleModal={() => {
          state.setIsGrilleModalOpen(false);
          state.setGrilleEditingCell(null);
        }}
        onSaveGrille={state.handleSaveGrille}
        w={state.w}
        h={state.h}
        aluminumColor={state.aluminumColor}
        hardwareColor={state.hardwareColor}
        frameShape={state.frameShape}
        rootCell={state.rootCell}
        frameConfig={state.frameConfig}
        sashConfig={state.sashConfig}
      />
    </Modal>
  );
};
