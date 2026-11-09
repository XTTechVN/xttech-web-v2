'use client';

import React, { useId } from 'react';
import { DoorCadRenderer } from './cad-engine/door-cad-renderer';
import { ensureRootCellDimensions } from './utils/door-tree-utils';
import {
  DEFAULT_FRAME_CONFIG,
  DEFAULT_SASH_CONFIG,
  type SceneCellNode,
  type FrameShape,
  type FrameConfig,
  type SashConfig,
} from './studio-types';

export interface DoorThumbnailProps {
  door?: { systemConfig?: Record<string, unknown> | null } | null;
  systemConfig?: Record<string, unknown> | null;
  hideDimensions?: boolean;
  className?: string;
}

interface RawDoorSystemConfig {
  w?: number;
  h?: number;
  aluminumColor?: string;
  hardwareColor?: string;
  frameShape?: FrameShape;
  frameConfig?: Partial<FrameConfig>;
  sashConfig?: Partial<SashConfig>;
  rootCell?: SceneCellNode | null;
}

export interface ParsedDoorSystemConfig {
  w: number;
  h: number;
  aluminumColor: string;
  hardwareColor: string;
  frameShape: FrameShape;
  frameConfig: FrameConfig;
  sashConfig: SashConfig;
  rootCell: SceneCellNode | null;
}

export function parseDoorSystemConfig(
  rawConfig?: Record<string, unknown> | null,
  fallbackW = 800,
  fallbackH = 1200,
): ParsedDoorSystemConfig {
  const sc = (rawConfig || {}) as RawDoorSystemConfig;
  const w: number = Number(sc.w) || fallbackW;
  const h: number = Number(sc.h) || fallbackH;
  const aluminumColor: string = sc.aluminumColor || '#C6A869';
  const hardwareColor: string = sc.hardwareColor || '#1E293B';
  const frameShape: FrameShape = sc.frameShape || 'rect';

  const frameConfig: FrameConfig = sc.frameConfig
    ? {
        ...DEFAULT_FRAME_CONFIG,
        ...sc.frameConfig,
        leftEdge: { ...DEFAULT_FRAME_CONFIG.leftEdge, ...(sc.frameConfig.leftEdge || {}) },
        topEdge: { ...DEFAULT_FRAME_CONFIG.topEdge, ...(sc.frameConfig.topEdge || {}) },
        rightEdge: { ...DEFAULT_FRAME_CONFIG.rightEdge, ...(sc.frameConfig.rightEdge || {}) },
        bottomEdge: { ...DEFAULT_FRAME_CONFIG.bottomEdge, ...(sc.frameConfig.bottomEdge || {}) },
      }
    : DEFAULT_FRAME_CONFIG;

  const sashConfig: SashConfig = sc.sashConfig
    ? { ...DEFAULT_SASH_CONFIG, ...sc.sashConfig }
    : DEFAULT_SASH_CONFIG;

  const rootCell: SceneCellNode | null = sc.rootCell
    ? ensureRootCellDimensions(sc.rootCell, w, h)
    : null;

  return {
    w,
    h,
    aluminumColor,
    hardwareColor,
    frameShape,
    frameConfig,
    sashConfig,
    rootCell,
  };
}

/**
 * Đọc systemConfig của door hoặc config truyền trực tiếp và render SVG thumbnail bằng DoorCadRenderer.
 */
export function DoorThumbnail({
  door,
  systemConfig: directConfig,
  hideDimensions = true,
  className = '',
}: DoorThumbnailProps) {
  const svgId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const { w, h, aluminumColor, hardwareColor, frameShape, frameConfig, sashConfig, rootCell } =
    parseDoorSystemConfig(directConfig || door?.systemConfig);

  if (!rootCell) {
    return (
      <div className={`flex items-center justify-center text-slate-300 text-[11px] ${className}`}>
        Chưa có bản vẽ
      </div>
    );
  }

  return (
    <div className={`w-full h-full ${className}`}>
      <DoorCadRenderer
        id={svgId}
        hideDimensions={hideDimensions}
        w={w}
        h={h}
        aluminumColor={aluminumColor}
        hardwareColor={hardwareColor}
        frameShape={frameShape}
        rootCell={rootCell}
        frameConfig={frameConfig}
        sashConfig={sashConfig}
        selectedCellId={null}
        onSelectCell={() => {}}
      />
    </div>
  );
}
