'use client';

import React from 'react';
import { SceneCellNode, GlassGrilleConfig } from '../../studio-types';
import { Sparkles, Check, SlidersHorizontal, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { GrilleLeftPanel } from './components/grille-left-panel';
import { GrilleCanvas } from './components/grille-canvas';
import { GrilleRightPanel } from './components/grille-right-panel';
import { GrilleDimDialog } from './components/grille-dim-dialog';
import { useGlassGrilleState } from './hooks/useGlassGrilleState';

interface GlassGrilleModalProps {
  isOpen: boolean;
  onClose: () => void;
  cell: SceneCellNode | null;
  totalSashesCount?: number;
  onApply: (config: GlassGrilleConfig, applyToAllSashes: boolean) => void;
}

export const GlassGrilleModal: React.FC<GlassGrilleModalProps> = ({
  isOpen,
  onClose,
  cell,
  totalSashesCount = 1,
  onApply,
}) => {
  const state = useGlassGrilleState({
    isOpen,
    onClose,
    cell,
    totalSashesCount,
    onApply,
  });
  const [mobileGrilleTab, setMobileGrilleTab] = React.useState<'control' | 'library' | null>(null);

  if (!isOpen || !cell) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-1.5 sm:p-3 select-none">
      <div className="relative w-full max-w-[1260px] h-[96vh] sm:h-[93vh] max-h-[900px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3.5 border-b border-gray-100 bg-white min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold shrink-0">
              <Sparkles size={16} />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-base font-bold text-gray-900 leading-tight truncate">
                Thiết kế Kính nan đồng
              </h2>
              <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">
                Click hoặc Kéo thả hoa văn vào giao điểm để thay thế · Kéo nan trực tiếp đối xứng
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer shrink-0"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={state.handleApply}
              className="px-3 sm:px-5 py-1.5 sm:py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
            >
              <Check size={14} />
              <span>Áp dụng</span>
            </button>
          </div>
        </div>

        {/* Main Layout: Desktop 3-column, Mobile Canvas Hero */}
        <div className="flex-1 flex overflow-hidden bg-slate-50/60 relative">
          {/* Cột trái (Desktop only) */}
          <div className="hidden lg:flex shrink-0">
            <GrilleLeftPanel
              glassW={state.glassW}
              glassH={state.glassH}
              barColor={state.barColor}
              setBarColor={state.setBarColor}
              barWidth={state.barWidth}
              setBarWidth={state.setBarWidth}
              isSymmetric={state.isSymmetric}
              setIsSymmetric={state.setIsSymmetric}
              totalM={state.totalM}
              estimatedTotalPrice={state.estimatedTotalPrice}
              totalSashesCount={totalSashesCount}
              applyToAll={state.applyToAll}
              setApplyToAll={state.setApplyToAll}
              hasGrid={state.hasGrid}
              setHasGrid={state.setHasGrid}
              hasBorder={state.hasBorder}
              setHasBorder={state.setHasBorder}
              hasCorner={state.hasCorner}
              setHasCorner={state.setHasCorner}
              cols={state.cols}
              rows={state.rows}
              onColsChange={state.handleColsChange}
              onRowsChange={state.handleRowsChange}
              unitPricePerM={state.unitPricePerM}
              setUnitPricePerM={state.setUnitPricePerM}
              motifUnitPrice={state.motifUnitPrice}
              setMotifUnitPrice={state.setMotifUnitPrice}
              selectedMotifId={state.selectedMotifId}
              setSelectedMotifId={state.setSelectedMotifId}
              motifs={state.motifs}
              onUpdateSelectedMotif={state.handleUpdateSelectedMotif}
              onAssignAccessoryToMotif={state.handleAssignAccessoryToMotif}
              onDeleteSelectedMotif={state.handleDeleteSelectedMotif}
              onClearAll={state.handleClearAll}
              accessories={state.accessories}
              selectedMotifCardRef={state.selectedMotifCardRef}
            />
          </div>

          {/* Vùng Canvas Vẽ Kính (Hero View trên mọi thiết bị) */}
          <div className="flex-1 h-full min-w-0 relative flex flex-col">
            <GrilleCanvas
              svgRef={state.svgRef}
              glassW={state.glassW}
              glassH={state.glassH}
              zoom={state.zoom}
              setZoom={state.setZoom}
              dragTarget={state.dragTarget}
              hasGrid={state.hasGrid}
              hasBorder={state.hasBorder}
              hasCorner={state.hasCorner}
              barWidth={state.barWidth}
              barColor={state.barColor}
              borderOffset={state.borderOffset}
              cornerSize={state.cornerSize}
              colPositions={state.colPositions}
              rowPositions={state.rowPositions}
              colSpans={state.colSpans}
              rowSpans={state.rowSpans}
              motifs={state.motifs}
              selectedMotifId={state.selectedMotifId}
              setSelectedMotifId={state.setSelectedMotifId}
              motifUnitPrice={state.motifUnitPrice}
              dragOverCell={state.dragOverCell}
              setDragOverCell={state.setDragOverCell}
              onMouseDownOnCol={state.handleMouseDownOnCol}
              onMouseDownOnRow={state.handleMouseDownOnRow}
              onMouseDownOnBorder={state.handleMouseDownOnBorder}
              onMouseDownOnCorner={state.handleMouseDownOnCorner}
              onAssignOrReplaceMotifAtCell={state.handleAssignOrReplaceMotifAtCell}
              onOpenEditDim={state.handleOpenEditDim}
              getSvgCoordinates={state.getSvgCoordinates}
              activeMotifTool={state.activeMotifTool}
            />

            {/* Floating Action Pill Bar trên Mobile/Tablet (< lg) */}
            <div className="lg:hidden absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 p-1 bg-slate-900/90 backdrop-blur-md text-white rounded-full shadow-2xl border border-slate-700/80 max-w-[94vw] select-none">
              <button
                type="button"
                onClick={() => setMobileGrilleTab((prev) => (prev === 'control' ? null : 'control'))}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  mobileGrilleTab === 'control'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <SlidersHorizontal size={13} />
                <span>Kích thước & Lưới nan</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileGrilleTab((prev) => (prev === 'library' ? null : 'library'))}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  mobileGrilleTab === 'library'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Sparkles size={13} />
                <span>Hoa văn ({state.motifs.length})</span>
              </button>
            </div>
          </div>

          {/* Cột phải (Desktop only) */}
          <div className="hidden lg:flex shrink-0">
            <GrilleRightPanel
              activeRightTab={state.activeRightTab}
              setActiveRightTab={state.setActiveRightTab}
              activeMotifTool={state.activeMotifTool}
              setActiveMotifTool={state.setActiveMotifTool}
              getMotifDefaultPrice={state.getMotifDefaultPrice}
              motifs={state.motifs}
              selectedMotifId={state.selectedMotifId}
              setSelectedMotifId={state.setSelectedMotifId}
              onDeleteSelectedMotif={state.handleDeleteSelectedMotif}
              motifUnitPrice={state.motifUnitPrice}
              templateName={state.templateName}
              setTemplateName={state.setTemplateName}
              onSaveTemplate={state.handleSaveTemplate}
              isSavingTemplate={state.createPatternMutation.isPending}
              patterns={state.patterns}
              isLoadingPatterns={state.isLoadingPatterns}
              onApplyTemplate={state.handleApplyTemplate}
              onDeleteTemplate={state.handleDeleteTemplate}
            />
          </div>

          {/* Mobile Bottom Sheet Drawer (< lg) */}
          {mobileGrilleTab && (
            <div className="lg:hidden fixed inset-0 z-40 flex flex-col justify-end pointer-events-none">
              <div
                className="absolute inset-0 bg-slate-900/35 backdrop-blur-2xs pointer-events-auto transition-opacity"
                onClick={() => setMobileGrilleTab(null)}
              />
              <div className="relative pointer-events-auto bg-white rounded-t-2xl shadow-2xl border-t border-slate-200/90 max-h-[62vh] h-[58vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
                <div className="px-3 pt-2 pb-1.5 border-b border-gray-100 bg-slate-50/90 shrink-0">
                  <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-2" />
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1 bg-gray-200/70 p-0.5 rounded-lg text-xs">
                      <button
                        type="button"
                        onClick={() => setMobileGrilleTab('control')}
                        className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                          mobileGrilleTab === 'control'
                            ? 'bg-white text-amber-600 shadow-xs'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        📐 Lưới nan & Viền
                      </button>
                      <button
                        type="button"
                        onClick={() => setMobileGrilleTab('library')}
                        className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                          mobileGrilleTab === 'library'
                            ? 'bg-white text-amber-600 shadow-xs'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        🌸 Hoa văn & Mẫu nan
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMobileGrilleTab(null)}
                      className="p-1 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                      title="Đóng ngăn kéo"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-white">
                  {mobileGrilleTab === 'control' && (
                    <GrilleLeftPanel
                      glassW={state.glassW}
                      glassH={state.glassH}
                      barColor={state.barColor}
                      setBarColor={state.setBarColor}
                      barWidth={state.barWidth}
                      setBarWidth={state.setBarWidth}
                      isSymmetric={state.isSymmetric}
                      setIsSymmetric={state.setIsSymmetric}
                      totalM={state.totalM}
                      estimatedTotalPrice={state.estimatedTotalPrice}
                      totalSashesCount={totalSashesCount}
                      applyToAll={state.applyToAll}
                      setApplyToAll={state.setApplyToAll}
                      hasGrid={state.hasGrid}
                      setHasGrid={state.setHasGrid}
                      hasBorder={state.hasBorder}
                      setHasBorder={state.setHasBorder}
                      hasCorner={state.hasCorner}
                      setHasCorner={state.setHasCorner}
                      cols={state.cols}
                      rows={state.rows}
                      onColsChange={state.handleColsChange}
                      onRowsChange={state.handleRowsChange}
                      unitPricePerM={state.unitPricePerM}
                      setUnitPricePerM={state.setUnitPricePerM}
                      motifUnitPrice={state.motifUnitPrice}
                      setMotifUnitPrice={state.setMotifUnitPrice}
                      selectedMotifId={state.selectedMotifId}
                      setSelectedMotifId={state.setSelectedMotifId}
                      motifs={state.motifs}
                      onUpdateSelectedMotif={state.handleUpdateSelectedMotif}
                      onAssignAccessoryToMotif={state.handleAssignAccessoryToMotif}
                      onDeleteSelectedMotif={state.handleDeleteSelectedMotif}
                      onClearAll={state.handleClearAll}
                      accessories={state.accessories}
                      selectedMotifCardRef={state.selectedMotifCardRef}
                    />
                  )}

                  {mobileGrilleTab === 'library' && (
                    <GrilleRightPanel
                      activeRightTab={state.activeRightTab}
                      setActiveRightTab={state.setActiveRightTab}
                      activeMotifTool={state.activeMotifTool}
                      setActiveMotifTool={state.setActiveMotifTool}
                      getMotifDefaultPrice={state.getMotifDefaultPrice}
                      motifs={state.motifs}
                      selectedMotifId={state.selectedMotifId}
                      setSelectedMotifId={state.setSelectedMotifId}
                      onDeleteSelectedMotif={state.handleDeleteSelectedMotif}
                      motifUnitPrice={state.motifUnitPrice}
                      templateName={state.templateName}
                      setTemplateName={state.setTemplateName}
                      onSaveTemplate={state.handleSaveTemplate}
                      isSavingTemplate={state.createPatternMutation.isPending}
                      patterns={state.patterns}
                      isLoadingPatterns={state.isLoadingPatterns}
                      onApplyTemplate={state.handleApplyTemplate}
                      onDeleteTemplate={state.handleDeleteTemplate}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Popover chỉnh sửa kích thước đường gióng CAD */}
        <GrilleDimDialog
          editingDim={state.editingDim}
          dimInputValue={state.dimInputValue}
          setDimInputValue={state.setDimInputValue}
          onClose={() => state.setEditingDim(null)}
          onSave={state.handleSaveEditedDimension}
        />
      </div>
    </div>
  );
};
