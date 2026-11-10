import React from 'react';
import { flushSync } from 'react-dom';
import { createRoot, Root } from 'react-dom/client';
import { DoorCadRenderer } from '@/components/door-studio/cad-engine/door-cad-renderer';
import {
  DEFAULT_FRAME_CONFIG,
  DEFAULT_SASH_CONFIG,
  FrameConfig,
  FrameShape,
  SashConfig,
  SceneCellNode,
} from '@/components/door-studio/studio-types';
import { GlassOrderPositionVisual } from '@/types';
import { DoorGlassSection, ExcelImageAsset } from './glass-excel-types';
import { dataUrlToPngBytes } from './glass-pane-canvas';

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

function isSceneCellNode(val: unknown): val is SceneCellNode {
  if (!isRecord(val)) return false;
  return typeof val.id === 'string' || typeof val.sashType === 'string' || Array.isArray(val.children);
}

function asNum(val: unknown, fallback: number): number {
  const n = Number(val);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function asStr(val: unknown, fallback: string): string {
  return typeof val === 'string' && val.trim().length > 0 ? val : fallback;
}

function resolveFrameConfig(raw: unknown): FrameConfig {
  if (!isRecord(raw)) return DEFAULT_FRAME_CONFIG;
  return {
    ...DEFAULT_FRAME_CONFIG,
    ...(raw as Partial<FrameConfig>),
    leftEdge: { ...DEFAULT_FRAME_CONFIG.leftEdge, ...(isRecord(raw.leftEdge) ? raw.leftEdge : {}) },
    topEdge: { ...DEFAULT_FRAME_CONFIG.topEdge, ...(isRecord(raw.topEdge) ? raw.topEdge : {}) },
    rightEdge: { ...DEFAULT_FRAME_CONFIG.rightEdge, ...(isRecord(raw.rightEdge) ? raw.rightEdge : {}) },
    bottomEdge: { ...DEFAULT_FRAME_CONFIG.bottomEdge, ...(isRecord(raw.bottomEdge) ? raw.bottomEdge : {}) },
  };
}

function resolveSashConfig(raw: unknown): SashConfig {
  return isRecord(raw) ? { ...DEFAULT_SASH_CONFIG, ...(raw as Partial<SashConfig>) } : DEFAULT_SASH_CONFIG;
}

function parseSvgViewBox(svgEl: SVGSVGElement): { vbW: number; vbH: number } {
  const parts = (svgEl.getAttribute('viewBox') || '').trim().split(/[\s,]+/).map(Number);
  if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) return { vbW: parts[2], vbH: parts[3] };
  return { vbW: 540, vbH: 500 };
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('SVG rasterize failed'));
    img.src = src;
  });
}

function renderFallbackDoorPng(
  code: string,
  doorName: string,
  widthMm: number,
  heightMm: number,
): { bytes: Uint8Array; widthPx: number; heightPx: number } {
  const widthPx = 420;
  const heightPx = 420;
  const canvas = document.createElement('canvas');
  canvas.width = widthPx;
  canvas.height = heightPx;

  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) return { bytes: new Uint8Array(), widthPx, heightPx };
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, widthPx, heightPx);

    const safeW = widthMm > 0 ? widthMm : 900;
    const safeH = heightMm > 0 ? heightMm : 1200;
    const scale = Math.min(270 / safeW, 270 / safeH);
    const fw = Math.max(90, Math.round(safeW * scale));
    const fh = Math.max(90, Math.round(safeH * scale));
    const ox = Math.round((widthPx - fw) / 2);
    const oy = Math.round((heightPx - fh) / 2) - 8;
    const frameT = 10;

    ctx.fillStyle = '#475569';
    ctx.fillRect(ox, oy, fw, fh);
    ctx.fillStyle = '#E0F2FE';
    ctx.fillRect(ox + frameT, oy + frameT, fw - frameT * 2, fh - frameT * 2);
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(ox, oy, fw, fh);
    ctx.strokeRect(ox + frameT, oy + frameT, fw - frameT * 2, fh - frameT * 2);

    ctx.fillStyle = '#045863';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(code, ox + fw / 2, oy + fh / 2 - 10);
    ctx.fillStyle = '#334155';
    ctx.font = '12px Arial, sans-serif';
    ctx.fillText(doorName.slice(0, 28), ox + fw / 2, oy + fh / 2 + 12);

    ctx.fillStyle = '#045863';
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.fillText(
      widthMm > 0 ? `Phủ bì: ${Math.round(safeW)} × ${Math.round(safeH)} mm` : 'Bản vẽ tham chiếu',
      widthPx / 2,
      oy + fh + 26,
    );
    return { bytes: dataUrlToPngBytes(canvas.toDataURL('image/png')), widthPx, heightPx };
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}

export async function captureDoorPositionCadPng(
  visual: GlassOrderPositionVisual | null,
  fallbackCode: string,
  fallbackName: string,
): Promise<{ bytes: Uint8Array; widthPx: number; heightPx: number }> {
  const sc = visual?.systemConfig;
  if (!visual || !isRecord(sc) || !isSceneCellNode(sc.rootCell)) {
    return renderFallbackDoorPng(
      visual?.positionCode || fallbackCode,
      visual?.doorName || fallbackName,
      visual?.width || 0,
      visual?.height || 0,
    );
  }

  let container: HTMLDivElement | null = null;
  let root: Root | null = null;
  let objectUrl: string | null = null;
  let canvas: HTMLCanvasElement | null = null;

  try {
    const w = visual.width > 0 ? visual.width : asNum(sc.w, 900);
    const h = visual.height > 0 ? visual.height : asNum(sc.h, 1200);
    container = document.createElement('div');
    container.style.cssText =
      'position:fixed;left:-10000px;top:0;width:580px;height:580px;pointer-events:none;opacity:0;overflow:hidden;background:#ffffff;';
    document.body.appendChild(container);

    root = createRoot(container);
    flushSync(() => {
      root?.render(
        React.createElement(DoorCadRenderer, {
          id: `excel-door-cad-${visual.positionId}`,
          hideDimensions: false,
          w,
          h,
          aluminumColor: visual.aluminumColor || asStr(sc.aluminumColor, '#4A5568'),
          hardwareColor: asStr(sc.hardwareColor, '#1A202C'),
          frameShape: asStr(sc.frameShape, 'rect') as FrameShape,
          rootCell: sc.rootCell as SceneCellNode,
          frameConfig: resolveFrameConfig(sc.frameConfig),
          sashConfig: resolveSashConfig(sc.sashConfig),
          selectedCellId: null,
          onSelectCell: () => {},
        }),
      );
    });

    const svgEl = container.querySelector('svg');
    if (!svgEl) return renderFallbackDoorPng(visual.positionCode, visual.doorName, w, h);

    const { vbW, vbH } = parseSvgViewBox(svgEl);
    const targetW = Math.round(vbW * 1.15);
    const targetH = Math.round(vbH * 1.15);
    svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgEl.setAttribute('width', String(targetW));
    svgEl.setAttribute('height', String(targetH));

    const serialized = new XMLSerializer().serializeToString(svgEl);
    objectUrl = URL.createObjectURL(new Blob([serialized], { type: 'image/svg+xml;charset=utf-8' }));
    const img = await loadImageElement(objectUrl);

    canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return renderFallbackDoorPng(visual.positionCode, visual.doorName, w, h);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetW, targetH);
    ctx.drawImage(img, 0, 0, targetW, targetH);

    return { bytes: dataUrlToPngBytes(canvas.toDataURL('image/png')), widthPx: targetW, heightPx: targetH };
  } catch {
    return renderFallbackDoorPng(
      visual.positionCode || fallbackCode,
      visual.doorName || fallbackName,
      visual.width,
      visual.height,
    );
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    if (canvas) {
      canvas.width = 0;
      canvas.height = 0;
    }
    if (root) root.unmount();
    if (container && container.parentNode) container.remove();
  }
}

export async function captureAllDoorSectionAssets(
  sections: DoorGlassSection[],
  startFileIndex: number,
): Promise<Map<string, ExcelImageAsset>> {
  const assetMap = new Map<string, ExcelImageAsset>();
  let fileIdx = startFileIndex;
  for (const sec of sections) {
    if (sec.isManualGroup) continue;
    const snap = await captureDoorPositionCadPng(sec.visual, sec.positionCode, sec.doorName);
    if (snap.bytes.length > 0) {
      assetMap.set(sec.sectionKey, {
        id: `door_${fileIdx}`,
        fileName: `image${fileIdx}.png`,
        bytes: snap.bytes,
        widthPx: snap.widthPx,
        heightPx: snap.heightPx,
      });
      fileIdx += 1;
    }
  }
  return assetMap;
}
