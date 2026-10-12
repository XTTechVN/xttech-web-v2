'use client';

import React from 'react';
import {
  DoorCadRenderer,
  DEFAULT_FRAME_CONFIG,
  DEFAULT_SASH_CONFIG,
  type SceneCellNode,
  type FrameShape,
  type FrameConfig,
  type SashConfig,
} from '@/components';
import type { Door } from '@/types';

interface DoorThumbnailProps {
  door?: { systemConfig?: any } | null;
  systemConfig?: Record<string, any> | null;
  hideDimensions?: boolean;
  className?: string;
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
  const sc = (directConfig || door?.systemConfig || {}) as Record<string, any>;

  const w: number = sc.w || 800;
  const h: number = sc.h || 1200;
  const aluminumColor: string = sc.aluminumColor || sc.surface_color || '#C6A869';
  const hardwareColor: string = sc.hardwareColor || sc.accessory_color || '#1E293B';
  const frameShape: FrameShape = (sc.frameShape as FrameShape) || 'rect';

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

  // rootCell từ systemConfig — đây là SceneCellNode đã được lưu sẵn
  const rootCell: SceneCellNode | null = sc.rootCell ?? null;

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
