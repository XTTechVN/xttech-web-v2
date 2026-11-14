'use client';

import React from 'react';
import type { ProfileBar } from '@/types';
import { DoorCadRenderer } from '../cad-engine/door-cad-renderer';
import type { FrameConfig, FrameShape, SashConfig, SceneCellNode } from '../studio-types';

interface StudioHiddenExportProps {
  w: number;
  h: number;
  aluminumColor: string;
  hardwareColor: string;
  frameShape: FrameShape;
  rootCell: SceneCellNode;
  frameConfig: FrameConfig;
  sashConfig: SashConfig;
  availableProfiles: ProfileBar[];
}

export const StudioHiddenExport: React.FC<StudioHiddenExportProps> = ({
  w,
  h,
  aluminumColor,
  hardwareColor,
  frameShape,
  rootCell,
  frameConfig,
  sashConfig,
  availableProfiles,
}) => (
  <div className="sr-only pointer-events-none absolute -top-[9999px] -left-[9999px] w-[400px] h-[400px] opacity-0" aria-hidden="true">
    <DoorCadRenderer
      id="studio-export-cad-svg"
      hideDimensions={true}
      w={w}
      h={h}
      aluminumColor={aluminumColor}
      hardwareColor={hardwareColor}
      frameShape={frameShape}
      rootCell={rootCell}
      frameConfig={frameConfig}
      sashConfig={sashConfig}
      availableProfiles={availableProfiles}
      selectedCellId={null}
      onSelectCell={() => {}}
    />
  </div>
);
