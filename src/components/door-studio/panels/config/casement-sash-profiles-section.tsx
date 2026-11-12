'use client';

import React from 'react';
import { SashConfig } from '../../studio-types';
import { ProfileBar } from '@/types';
import {
  CasementOutwardTab,
  CasementInwardTab,
  CasementSharedProfiles,
  CasementSlimSection,
  useCasementProfilesState,
} from './casement';

interface CasementSashProfilesSectionProps {
  config: SashConfig;
  onChangeConfig: (updates: Partial<SashConfig>) => void;
  profiles: ProfileBar[];
}

export const CasementSashProfilesSection: React.FC<CasementSashProfilesSectionProps> = ({
  config,
  onChangeConfig,
  profiles,
}) => {
  const {
    activeTab,
    setActiveTab,
    sashOptions,
    mullionProfiles,
    beadProfiles,
    dynamicMullionProfiles,
    currentOutward,
    currentInward,
    hasCustomInward,
    selectedLeftSash,
    selectedInwardLeftSash,
    selectedVoCucSash,
    selectedSashMullion,
    selectedSashBead,
    selectedDynamicMullion,
    inheritLabel,
    inheritOptions,
    inwardInheritLabel,
    inwardInheritOptions,
    handleOutwardLeftChange,
    handleOutwardEdgeChange,
    handleToggleCustomInward,
    handleInwardLeftChange,
    handleInwardEdgeChange,
    handleVoCucChange,
  } = useCasementProfilesState({ config, onChangeConfig, profiles });

  if (config.sashStyle === 'slim') {
    const voCucId = config.voCucProfileId ?? config.leftProfileId ?? '';
    return (
      <CasementSlimSection
        voCucId={voCucId}
        selectedVoCucSash={selectedVoCucSash}
        sashOptions={sashOptions}
        onVoCucChange={handleVoCucChange}
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* Tab selection: Mở ra vs Mở vào */}
      <div className="flex rounded-lg bg-slate-100 p-1 text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveTab('outward')}
          className={`flex-1 py-1.5 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'outward'
              ? 'bg-white text-emerald-700 shadow-sm font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Mở quay ngoài (Mặc định)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('inward')}
          className={`flex-1 py-1.5 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'inward'
              ? 'bg-white text-indigo-700 shadow-sm font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          <span>Mở quay trong</span>
          {hasCustomInward && (
            <span className="ml-1 px-1.5 py-0.2 bg-indigo-100 text-indigo-700 text-[10px] rounded-full">
              Riêng
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'outward' ? (
        <CasementOutwardTab
          leftProfileId={currentOutward.leftProfileId}
          topProfileId={currentOutward.topProfileId}
          rightProfileId={currentOutward.rightProfileId}
          bottomProfileId={currentOutward.bottomProfileId}
          selectedLeftSash={selectedLeftSash}
          sashOptions={sashOptions}
          inheritOptions={inheritOptions}
          inheritLabel={inheritLabel}
          onLeftChange={handleOutwardLeftChange}
          onEdgeChange={handleOutwardEdgeChange}
        />
      ) : (
        <CasementInwardTab
          hasCustomInward={hasCustomInward}
          currentInward={currentInward}
          selectedLeftSash={selectedInwardLeftSash || selectedLeftSash}
          sashOptions={sashOptions}
          inwardInheritOptions={inwardInheritOptions}
          inwardInheritLabel={inwardInheritLabel}
          onToggleCustomInward={handleToggleCustomInward}
          onLeftChange={handleInwardLeftChange}
          onEdgeChange={handleInwardEdgeChange}
        />
      )}

      {/* Shared Mullion, Bead, Dynamic Mullion */}
      <CasementSharedProfiles
        mullionProfileId={config.mullionProfileId}
        beadProfileId={config.beadProfileId}
        dynamicMullionProfileId={config.dynamicMullionProfileId}
        mullionProfiles={mullionProfiles}
        beadProfiles={beadProfiles}
        dynamicMullionProfiles={dynamicMullionProfiles}
        selectedSashMullion={selectedSashMullion}
        selectedSashBead={selectedSashBead}
        selectedDynamicMullion={selectedDynamicMullion}
        onChangeMullion={(id) => onChangeConfig({ mullionProfileId: id })}
        onChangeBead={(id) => onChangeConfig({ beadProfileId: id })}
        onChangeDynamicMullion={(id) => onChangeConfig({ dynamicMullionProfileId: id })}
      />
    </div>
  );
};
