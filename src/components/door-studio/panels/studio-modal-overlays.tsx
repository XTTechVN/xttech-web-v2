'use client';

import React from 'react';
import type { ProfileBar } from '@/types';
import type {
  FrameConfig,
  FrameShape,
  MullionInfo,
  SashConfig,
  SceneCellNode,
} from '../studio-types';
import { GlassGrilleModal } from './glass-grille-modal';
import { MullionInspectorModal } from './mullion-inspector-modal';
import { StudioHiddenExport } from './studio-hidden-export';

interface StudioModalOverlaysProps {
  isMullionModalOpen: boolean;
  selectedMullion: MullionInfo | null;
  availableProfiles: ProfileBar[];
  allBrandProfiles: ProfileBar[];
  onCloseMullionModal: () => void;
  onSaveMullion: React.ComponentProps<typeof MullionInspectorModal>['onSave'];
  onDeleteMullion: React.ComponentProps<typeof MullionInspectorModal>['onDeleteMullion'];
  onLocalTransposeMullion: React.ComponentProps<typeof MullionInspectorModal>['onLocalTranspose'];
  isGrilleModalOpen: boolean;
  grilleEditingCell: SceneCellNode | null;
  onCloseGrilleModal: () => void;
  onSaveGrille: React.ComponentProps<typeof GlassGrilleModal>['onApply'];
  w: number;
  h: number;
  aluminumColor: string;
  hardwareColor: string;
  frameShape: FrameShape;
  rootCell: SceneCellNode;
  frameConfig: FrameConfig;
  sashConfig: SashConfig;
}

export function StudioModalOverlays({
  isMullionModalOpen,
  selectedMullion,
  availableProfiles,
  allBrandProfiles,
  onCloseMullionModal,
  onSaveMullion,
  onDeleteMullion,
  onLocalTransposeMullion,
  isGrilleModalOpen,
  grilleEditingCell,
  onCloseGrilleModal,
  onSaveGrille,
  w,
  h,
  aluminumColor,
  hardwareColor,
  frameShape,
  rootCell,
  frameConfig,
  sashConfig,
}: StudioModalOverlaysProps) {
  return (
    <>
      <MullionInspectorModal
        isOpen={isMullionModalOpen}
        onClose={onCloseMullionModal}
        mullion={selectedMullion}
        profileBars={availableProfiles}
        onSave={onSaveMullion}
        onDeleteMullion={onDeleteMullion}
        onLocalTranspose={onLocalTransposeMullion}
      />

      <GlassGrilleModal
        isOpen={isGrilleModalOpen}
        onClose={onCloseGrilleModal}
        cell={grilleEditingCell}
        onApply={onSaveGrille}
      />

      <StudioHiddenExport
        w={w}
        h={h}
        aluminumColor={aluminumColor}
        hardwareColor={hardwareColor}
        frameShape={frameShape}
        rootCell={rootCell}
        frameConfig={frameConfig}
        sashConfig={sashConfig}
        availableProfiles={allBrandProfiles}
      />
    </>
  );
}
