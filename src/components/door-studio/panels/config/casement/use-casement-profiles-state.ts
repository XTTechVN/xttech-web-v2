'use client';

import { useState } from 'react';
import { SashConfig, CasementVariants, SashVariantProfiles } from '../../../studio-types';
import { ProfileBar } from '@/types';
import {
  findStudioProfile,
  parseStudioProfileId,
  type StudioProfileId,
} from '../../../utils/profile-combine-utils';
import { buildSyncedRawVariants } from './casement-utils';

export interface UseCasementProfilesStateProps {
  config: SashConfig;
  onChangeConfig: (updates: Partial<SashConfig>) => void;
  profiles: ProfileBar[];
}

export function useCasementProfilesState({
  config,
  onChangeConfig,
  profiles,
}: UseCasementProfilesStateProps) {
  const [activeTab, setActiveTab] = useState<'outward' | 'inward'>('outward');

  const sashProfiles = profiles.filter((p) => p.barType === 'SASH' || p.barType === 'SCREEN_SASH');
  const mullionProfiles = profiles.filter((p) => p.barType === 'MULLION');
  const beadProfiles = profiles.filter((p) => p.barType === 'BEAD');
  const dynamicMullionProfiles = profiles.filter((p) => p.barType === 'DYNAMIC_MULLION');

  const sashOptions = sashProfiles.map((p) => ({ value: p.id, label: `${p.code} - ${p.name}` }));

  // Outward profiles fallback to legacy top-level config
  const currentOutward: SashVariantProfiles = {
    leftProfileId: config.casementVariants?.outward?.leftProfileId ?? config.leftProfileId,
    topProfileId: config.casementVariants?.outward?.topProfileId ?? config.topProfileId,
    rightProfileId: config.casementVariants?.outward?.rightProfileId ?? config.rightProfileId,
    bottomProfileId: config.casementVariants?.outward?.bottomProfileId ?? config.bottomProfileId,
  };

  const currentInward = config.casementVariants?.inward;
  const hasCustomInward = Boolean(currentInward && currentInward.leftProfileId);

  // Selected profile objects for previews
  const selectedLeftSash = findStudioProfile(profiles, currentOutward.leftProfileId);
  const selectedInwardLeftSash = findStudioProfile(profiles, currentInward?.leftProfileId);
  const selectedVoCucSash = findStudioProfile(profiles, config.voCucProfileId ?? config.leftProfileId);
  const selectedSashMullion = findStudioProfile(profiles, config.mullionProfileId);
  const selectedSashBead = findStudioProfile(profiles, config.beadProfileId);
  const selectedDynamicMullion = findStudioProfile(profiles, config.dynamicMullionProfileId);

  const inheritLabel = currentOutward.leftProfileId ? '↑ Kế thừa (Cạnh trái)' : 'Chọn profile...';
  const inheritOptions = [{ value: '', label: inheritLabel }, ...sashOptions];

  const inwardInheritLabel = currentInward?.leftProfileId
    ? '↑ Kế thừa (Cạnh trái mở vào)'
    : currentOutward.leftProfileId
    ? '↑ Kế thừa (Mở ra)'
    : 'Chọn profile...';
  const inwardInheritOptions = [{ value: '', label: inwardInheritLabel }, ...sashOptions];

  const handleOutwardLeftChange = (rawValue: string) => {
    const profileId = parseStudioProfileId(rawValue);
    const updatedVariants: CasementVariants = {
      ...(config.casementVariants || {}),
      outward: {
        leftProfileId: profileId,
        topProfileId: profileId,
        rightProfileId: profileId,
        bottomProfileId: profileId,
      },
    };

    onChangeConfig({
      profileId,
      leftProfileId: profileId,
      topProfileId: profileId,
      rightProfileId: profileId,
      bottomProfileId: profileId,
      bottomRailProfileId: profileId,
      casementVariants: updatedVariants,
      edges: { ...(config.edges || {}), bottom: { ...(config.edges?.bottom || {}), profileId, enabled: false } },
      rawVariants: buildSyncedRawVariants(config.rawVariants, profileId, profileId, profileId, profileId),
    });
  };

  const handleOutwardEdgeChange = (
    edgeKey: 'topProfileId' | 'rightProfileId' | 'bottomProfileId',
    rawValue: string
  ) => {
    const resolvedId = parseStudioProfileId(rawValue) ?? currentOutward.leftProfileId;
    const nextTopId = edgeKey === 'topProfileId' ? resolvedId : currentOutward.topProfileId;
    const nextRightId = edgeKey === 'rightProfileId' ? resolvedId : currentOutward.rightProfileId;
    const nextBottomId = edgeKey === 'bottomProfileId' ? resolvedId : currentOutward.bottomProfileId;

    const updatedVariants: CasementVariants = {
      ...(config.casementVariants || {}),
      outward: {
        leftProfileId: currentOutward.leftProfileId,
        topProfileId: nextTopId,
        rightProfileId: nextRightId,
        bottomProfileId: nextBottomId,
      },
    };

    const updates: Partial<SashConfig> = {
      [edgeKey]: resolvedId,
      casementVariants: updatedVariants,
      rawVariants: buildSyncedRawVariants(config.rawVariants, currentOutward.leftProfileId, nextTopId, nextRightId, nextBottomId),
    };
    if (edgeKey === 'bottomProfileId') {
      updates.bottomRailProfileId = resolvedId;
      updates.edges = {
        ...(config.edges || {}),
        bottom: { ...(config.edges?.bottom || {}), profileId: resolvedId, enabled: Boolean(resolvedId && resolvedId !== currentOutward.leftProfileId) },
      };
    }
    onChangeConfig(updates);
  };

  const handleToggleCustomInward = (enabled: boolean) => {
    if (!enabled) {
      const nextVariants: CasementVariants = { ...config.casementVariants };
      delete nextVariants.inward;
      onChangeConfig({ casementVariants: Object.keys(nextVariants).length > 0 ? nextVariants : undefined });
    } else {
      const defaultInward: SashVariantProfiles = {
        leftProfileId: currentOutward.leftProfileId,
        topProfileId: currentOutward.topProfileId,
        rightProfileId: currentOutward.rightProfileId,
        bottomProfileId: currentOutward.bottomProfileId,
      };
      onChangeConfig({
        casementVariants: {
          ...(config.casementVariants || {}),
          inward: defaultInward,
        },
      });
    }
  };

  const handleInwardLeftChange = (rawValue: string) => {
    const profileId = parseStudioProfileId(rawValue);
    const updatedInward: SashVariantProfiles = {
      leftProfileId: profileId,
      topProfileId: profileId,
      rightProfileId: profileId,
      bottomProfileId: profileId,
    };
    onChangeConfig({
      casementVariants: {
        ...(config.casementVariants || {}),
        inward: updatedInward,
      },
    });
  };

  const handleInwardEdgeChange = (
    edgeKey: 'topProfileId' | 'rightProfileId' | 'bottomProfileId',
    rawValue: string
  ) => {
    const resolvedId = parseStudioProfileId(rawValue) ?? currentInward?.leftProfileId ?? currentOutward.leftProfileId;
    const nextTopId = edgeKey === 'topProfileId' ? resolvedId : currentInward?.topProfileId;
    const nextRightId = edgeKey === 'rightProfileId' ? resolvedId : currentInward?.rightProfileId;
    const nextBottomId = edgeKey === 'bottomProfileId' ? resolvedId : currentInward?.bottomProfileId;

    onChangeConfig({
      casementVariants: {
        ...(config.casementVariants || {}),
        inward: {
          leftProfileId: currentInward?.leftProfileId,
          topProfileId: nextTopId,
          rightProfileId: nextRightId,
          bottomProfileId: nextBottomId,
        },
      },
    });
  };

  const handleVoCucChange = (nextId?: StudioProfileId) => {
    onChangeConfig({
      voCucProfileId: nextId,
      ...(config.leftProfileId ? {} : { profileId: nextId, leftProfileId: nextId }),
    });
  };

  return {
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
  };
}

