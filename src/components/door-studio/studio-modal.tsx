'use client';

import React from 'react';
import { Modal } from '@/components';
import { Door } from '@/types';
import { DrawTabView } from './panels/draw-tab-view';
import { InfoTabView } from './panels/info-tab-view';
import { ConfigTabView } from './panels/config/config-tab-view';
import { ResultsTabView } from './panels/results-tab-view';
import { AccessoriesTabView } from './panels/accessories-tab-view';
import { MullionInspectorModal } from './panels/mullion-inspector-modal';
import { GlassGrilleModal } from './panels/glass-grille-modal';
import { DoorCadRenderer } from './cad-engine/door-cad-renderer';
import { updateNode } from './utils/door-tree-utils';
import { useDoorStudioState } from './hooks/useDoorStudioState';
import { Save, Loader2, FileText, PenTool, Sliders, BarChart3, Wrench } from 'lucide-react';

interface DoorStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  door?: Door | null;
  defaultBrandId?: number | null;
}

const NAV_TABS = [
  { id: 'info' as const, label: 'Thông tin', icon: FileText },
  { id: 'draw' as const, label: 'Vẽ cửa', icon: PenTool },
  { id: 'config' as const, label: 'Cấu hình', icon: Sliders },
  { id: 'bom' as const, label: 'Kết quả', icon: BarChart3 },
  { id: 'accessories' as const, label: 'Phụ kiện', icon: Wrench },
];

export const DoorStudioModal: React.FC<DoorStudioModalProps> = ({ isOpen, onClose, door, defaultBrandId }) => {
  const state = useDoorStudioState({ isOpen, onClose, door, defaultBrandId });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      bodyClassName="p-0 overflow-hidden flex flex-col h-full"
      title={
        <div className="flex items-center w-full min-w-0 pr-2">
          {/* Segmented Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/70 overflow-x-auto no-scrollbar shrink-0">
            {NAV_TABS.map((t) => {
              const Icon = t.icon;
              const isActive = state.activeMainTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => state.setActiveMainTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-primary text-white shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Icon size={14} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      }
      size="full"
      footer={
        <div className="flex items-center justify-between w-full px-2 py-1">
          <div className="text-xs text-slate-500 hidden sm:block truncate pr-2">
            Bản vẽ CAD vector và bảng bóc tách tự động cập nhật
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0 cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={() => state.saveMutation()}
              disabled={state.isSaving}
              className="px-4.5 py-2 text-xs font-bold rounded-lg bg-primary hover:bg-primary/90 text-white shadow-2xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
            >
              {state.isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              <span>Lưu thiết kế</span>
            </button>
          </div>
        </div>
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
            onChangeField={(field, val) => {
              if (field === 'w') state.setW(val);
              else if (field === 'h') state.setH(val);
              else if (field === 'name') state.setName(val);
              else if (field === 'code') state.setCode(val);
              else if (field === 'type') {
                state.setType(val);
                const isDoor = val === 'casement_door' || val === 'sliding_door' || val === 'folding_door' || val === 'sliding_casement_door' || val === 'cd';
                const isWindow = val === 'casement_window' || val === 'sliding_window' || val === 'cs';
                if (isDoor && state.sashConfig.family === 'Cửa sổ mở quay/Hất') {
                  state.setSashConfig((prev) => ({ ...prev, family: 'Cửa đi mở quay' }));
                } else if (isWindow && state.sashConfig.family === 'Cửa đi mở quay') {
                  state.setSashConfig((prev) => ({ ...prev, family: 'Cửa sổ mở quay/Hất' }));
                }
              }
              else if (field === 'brandId') {
                state.setSelectedBrandId(val ?? null);
                // Tìm series thuộc brand mới và gán mặc định
                const nextSeries = state.allAvailableSeries.filter((s) => !val || s.brandId === val);
                state.setSeriesId(nextSeries[0]?.id || undefined);
              }
              else if (field === 'aluminumColor') state.setAluminumColor(val);
              else if (field === 'hardwareColor') state.setHardwareColor(val);
              else if (field === 'seriesId') state.setSeriesId(val);
            }}
          />
        </div>
      )}

      {state.activeMainTab === 'draw' && (
        <DrawTabView
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
          onChangeTab={state.setActiveLeftTab}
          onSelectCell={state.setSelectedCellId}
          onUpdateDimension={state.handleUpdateDimension}
          onResizeSplit={state.handleResizeSplit}
          onUpdateSelectedCell={state.handleUpdateSelectedCell}
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
        />
      )}

      {state.activeMainTab === 'config' && (
        <div className="flex-1 h-full overflow-y-auto">
          <ConfigTabView
            frameConfig={state.frameConfig}
            sashConfig={state.sashConfig}
            onChangeFrameConfig={(updates) => state.setFrameConfig((prev) => ({ ...prev, ...updates }))}
            onChangeSashConfig={(updates) => state.setSashConfig((prev) => ({ ...prev, ...updates }))}
            profiles={state.availableProfiles}
          />
        </div>
      )}

      {state.activeMainTab === 'bom' && (
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

      {state.activeMainTab === 'accessories' && (
        <div className="flex-1 h-full overflow-y-auto">
          <AccessoriesTabView
            combos={state.availableCombos}
            selectedComboIds={state.selectedComboIds}
            onToggleCombo={state.handleToggleCombo}
            accessories={state.availableAccessories}
            brands={state.availableBrands}
            selectedAccessories={state.selectedAccessories}
            onUpdateAccessoryQty={state.handleUpdateAccessoryQty}
            onSetAccessoryQty={state.handleSetAccessoryQty}
            onClearAll={state.handleClearAllAccessories}
            hardwareColor={state.hardwareColor}
            onChangeHardwareColor={state.setHardwareColor}
          />
        </div>
      )}

      <MullionInspectorModal
        isOpen={state.isMullionModalOpen}
        onClose={() => {
          state.setIsMullionModalOpen(false);
          state.setSelectedMullion(null);
        }}
        mullion={state.selectedMullion}
        profileBars={state.availableProfiles}
        onSave={state.handleSaveMullion}
        onDeleteMullion={state.handleDeleteMullion}
      />

      <GlassGrilleModal
        isOpen={state.isGrilleModalOpen}
        onClose={() => {
          state.setIsGrilleModalOpen(false);
          state.setGrilleEditingCell(null);
        }}
        cell={state.grilleEditingCell}
        onApply={state.handleSaveGrille}
      />

      {/* Hidden CAD Renderer for clean SVG Thumbnail Export */}
      <div className="sr-only pointer-events-none absolute -top-[9999px] -left-[9999px] w-[400px] h-[400px] opacity-0" aria-hidden="true">
        <DoorCadRenderer
          id="studio-export-cad-svg"
          hideDimensions={true}
          w={state.w}
          h={state.h}
          aluminumColor={state.aluminumColor}
          hardwareColor={state.hardwareColor}
          frameShape={state.frameShape}
          rootCell={state.rootCell}
          frameConfig={state.frameConfig}
          sashConfig={state.sashConfig}
          selectedCellId={null}
          onSelectCell={() => {}}
        />
      </div>
    </Modal>
  );
};
