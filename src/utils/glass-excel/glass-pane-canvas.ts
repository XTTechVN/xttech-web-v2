import { computeArchMetrics } from '@/components/door-studio/cad-engine/cad-geometry';
import { ArchConfig, FrameShape } from '@/components/door-studio/studio-types';
import { ExcelImageAsset, GroupedSpecPane } from './glass-excel-types';

const PANE_CANVAS_W = 320;
const PANE_CANVAS_H = 220;

interface BoxRect { x: number; y: number; w: number; h: number }
interface ArchOverlayMeta { legMm: number; archMm: number; radiusMm: number; ySpringPx: number }

export function dataUrlToPngBytes(dataUrl: string): Uint8Array {
  const commaIdx = dataUrl.indexOf(',');
  const binary = atob(commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function traceArchOutline(
  ctx: CanvasRenderingContext2D, box: BoxRect, wMm: number, hMm: number, shape: FrameShape, archConfig: ArchConfig | null,
): ArchOverlayMeta {
  const m = computeArchMetrics(shape, wMm, hMm, 0, archConfig || undefined);
  const isPointed = shape === 'arch_pointed' || shape === 'arch_pointed_leg';
  const halfW = wMm / 2;
  const rRaw = Math.max(halfW, m.rOuter);
  const sagitta = rRaw - Math.sqrt(Math.max(0, rRaw * rRaw - halfW * halfW));
  const archMm = isPointed ? Math.max(1, Math.min(hMm, m.archH)) : (sagitta <= hMm ? sagitta : hMm);
  const legMm = Math.max(0, hMm - archMm);
  const archPx = Math.max(8, (archMm / Math.max(1, hMm)) * box.h);
  const ySpring = box.y + archPx;

  ctx.beginPath();
  ctx.moveTo(box.x, box.y + box.h);
  ctx.lineTo(box.x, ySpring);
  if (isPointed) {
    const rPx = box.w / 4 + (archPx * archPx) / Math.max(1, box.w);
    const dx = Math.max(0.01, rPx - box.w / 2);
    const theta = Math.atan2(archPx, dx);
    ctx.arc(box.x + box.w / 2 + dx, ySpring, rPx, Math.PI, Math.PI + theta, false);
    ctx.arc(box.x + box.w / 2 - dx, ySpring, rPx, -theta, 0, false);
    ctx.lineTo(box.x + box.w, box.y + box.h);
    ctx.closePath();
    return { legMm, archMm, radiusMm: Math.round(wMm / 4 + (archMm * archMm) / Math.max(1, wMm)), ySpringPx: ySpring };
  }
  const halfWPx = box.w / 2;
  const rPx = archPx / 2 + (halfWPx * halfWPx) / (2 * Math.max(1, archPx));
  const cy = box.y + rPx;
  ctx.arc(box.x + halfWPx, cy, rPx, Math.atan2(ySpring - cy, -halfWPx), Math.atan2(ySpring - cy, halfWPx), false);
  ctx.lineTo(box.x + box.w, box.y + box.h);
  ctx.closePath();
  return { legMm, archMm, radiusMm: Math.round(sagitta <= hMm ? rRaw : hMm / 2 + (wMm * wMm) / (8 * Math.max(1, hMm))), ySpringPx: ySpring };
}

function traceRoundedShape(
  ctx: CanvasRenderingContext2D, box: BoxRect, wMm: number, hMm: number, shape: FrameShape, archConfig: ArchConfig | null,
): number {
  if (shape === 'quad_circle') {
    ctx.beginPath();
    ctx.moveTo(box.x, box.y + box.h);
    ctx.lineTo(box.x, box.y);
    ctx.quadraticCurveTo(box.x + box.w, box.y, box.x + box.w, box.y + box.h);
    ctx.closePath();
    return Math.round(Math.min(wMm, hMm));
  }
  const [minMm, minPx] = [Math.min(wMm, hMm), Math.min(box.w, box.h)];
  const rMm = Math.min(minMm * 0.45, archConfig?.radiusMm || Math.round(minMm * 0.2));
  const rPx = Math.min(minPx * 0.42, Math.max(8, (rMm / Math.max(1, minMm)) * minPx));
  const [rTL, rBottom] = [shape === 'round_top_right' ? 0 : rPx, shape === 'round_4_corner' ? rPx : 0];

  ctx.beginPath();
  ctx.moveTo(box.x + rTL, box.y);
  ctx.lineTo(box.x + box.w - rPx, box.y);
  ctx.quadraticCurveTo(box.x + box.w, box.y, box.x + box.w, box.y + rPx);
  ctx.lineTo(box.x + box.w, box.y + box.h - rBottom);
  if (rBottom > 0) ctx.quadraticCurveTo(box.x + box.w, box.y + box.h, box.x + box.w - rBottom, box.y + box.h);
  ctx.lineTo(box.x + rBottom, box.y + box.h);
  if (rBottom > 0) ctx.quadraticCurveTo(box.x, box.y + box.h, box.x, box.y + box.h - rBottom);
  ctx.lineTo(box.x, box.y + rTL);
  if (rTL > 0) ctx.quadraticCurveTo(box.x, box.y, box.x + rTL, box.y);
  ctx.closePath();
  return Math.round(rMm);
}

function drawArrow(ctx: CanvasRenderingContext2D, x: number, y: number, dx: number, dy: number): void {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - dx * 4.5 - dy * 2.5, y - dy * 4.5 + dx * 2.5);
  ctx.lineTo(x - dx * 4.5 + dy * 2.5, y - dy * 4.5 - dx * 2.5);
  ctx.closePath();
  ctx.fill();
}

function drawPaneDimensions(ctx: CanvasRenderingContext2D, box: BoxRect, wMm: number, hMm: number): void {
  ctx.strokeStyle = '#045863';
  ctx.fillStyle = '#045863';
  ctx.lineWidth = 1.1;
  ctx.setLineDash([]);

  const yDim = box.y + box.h + 17;
  ctx.beginPath();
  ctx.moveTo(box.x, box.y + box.h + 3); ctx.lineTo(box.x, yDim + 5);
  ctx.moveTo(box.x + box.w, box.y + box.h + 3); ctx.lineTo(box.x + box.w, yDim + 5);
  ctx.moveTo(box.x, yDim); ctx.lineTo(box.x + box.w, yDim);
  ctx.stroke();
  drawArrow(ctx, box.x, yDim, -1, 0);
  drawArrow(ctx, box.x + box.w, yDim, 1, 0);

  ctx.font = 'bold 11px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(`Rộng: ${Math.round(wMm)} mm`, box.x + box.w / 2, yDim + 4);

  const xDim = box.x + box.w + 17;
  ctx.beginPath();
  ctx.moveTo(box.x + box.w + 3, box.y); ctx.lineTo(xDim + 5, box.y);
  ctx.moveTo(box.x + box.w + 3, box.y + box.h); ctx.lineTo(xDim + 5, box.y + box.h);
  ctx.moveTo(xDim, box.y); ctx.lineTo(xDim, box.y + box.h);
  ctx.stroke();
  drawArrow(ctx, xDim, box.y, 0, -1);
  drawArrow(ctx, xDim, box.y + box.h, 0, 1);

  ctx.save();
  ctx.translate(xDim + 13, box.y + box.h / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textBaseline = 'middle';
  ctx.fillText(`Cao: ${Math.round(hMm)} mm`, 0, 0);
  ctx.restore();
}

export function renderGlassPanePng(
  widthMm: number, heightMm: number, frameShape: FrameShape, archConfig: ArchConfig | null,
): { bytes: Uint8Array; widthPx: number; heightPx: number } {
  const canvas = document.createElement('canvas');
  canvas.width = PANE_CANVAS_W;
  canvas.height = PANE_CANVAS_H;

  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) return { bytes: new Uint8Array(), widthPx: PANE_CANVAS_W, heightPx: PANE_CANVAS_H };
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, PANE_CANVAS_W, PANE_CANVAS_H);

    const [safeW, safeH] = [Math.max(50, widthMm), Math.max(50, heightMm)];
    const scale = Math.min(196 / safeW, 136 / safeH);
    const [drawW, drawH] = [Math.max(48, Math.min(196, Math.round(safeW * scale))), Math.max(42, Math.min(136, Math.round(safeH * scale)))];
    const box: BoxRect = { x: Math.round((PANE_CANVAS_W - 38 - drawW) / 2) + 8, y: Math.round((PANE_CANVAS_H - 36 - drawH) / 2) + 8, w: drawW, h: drawH };

    let archMeta: ArchOverlayMeta | null = null;
    let badge = '';
    if (frameShape === 'circle' || frameShape === 'ellipse') {
      ctx.beginPath();
      ctx.ellipse(box.x + box.w / 2, box.y + box.h / 2, box.w / 2, box.h / 2, 0, 0, Math.PI * 2);
      ctx.closePath();
      if (frameShape === 'circle') badge = `Ø=${Math.round(Math.min(safeW, safeH))} mm`;
    } else if (frameShape.startsWith('arch_') || frameShape === 'round_top_open') {
      archMeta = traceArchOutline(ctx, box, safeW, safeH, frameShape, archConfig);
      badge = `R=${archMeta.radiusMm} mm`;
    } else if (frameShape.startsWith('round_') || frameShape === 'quad_circle') {
      badge = `R=${traceRoundedShape(ctx, box, safeW, safeH, frameShape, archConfig)} mm`;
    } else {
      ctx.beginPath();
      ctx.rect(box.x, box.y, box.w, box.h);
      ctx.closePath();
    }

    ctx.fillStyle = '#E0F2FE';
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.strokeStyle = '#BAE6FD';
    ctx.lineWidth = 1.5;
    const [cx, cy] = [box.x + box.w / 2, box.y + box.h / 2];
    ctx.beginPath();
    ctx.moveTo(cx - 18, cy + 14); ctx.lineTo(cx + 8, cy - 16);
    ctx.moveTo(cx - 6, cy + 18); ctx.lineTo(cx + 18, cy - 10);
    ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (archMeta && archMeta.legMm > 1) {
      ctx.save();
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = '#0369A1';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(box.x, archMeta.ySpringPx);
      ctx.lineTo(box.x + box.w, archMeta.ySpringPx);
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = '#0369A1';
      ctx.font = 'bold 9.5px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`H_chân:${Math.round(archMeta.legMm)} | H_vòm:${Math.round(archMeta.archMm)}`, cx, Math.min(box.y + box.h - 4, archMeta.ySpringPx + 13));
    }
    if (badge) {
      ctx.fillStyle = '#0369A1';
      ctx.font = 'bold 10px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(badge, cx, 4);
    }

    drawPaneDimensions(ctx, box, safeW, safeH);
    return { bytes: dataUrlToPngBytes(canvas.toDataURL('image/png')), widthPx: PANE_CANVAS_W, heightPx: PANE_CANVAS_H };
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}

export function renderAllPaneAssets(specGroups: GroupedSpecPane[]): Map<string, ExcelImageAsset> {
  const assetMap = new Map<string, ExcelImageAsset>();
  let nextIdx = 1;
  for (const group of specGroups) {
    if (assetMap.has(group.geometryKey)) continue;
    const rendered = renderGlassPanePng(group.widthMm, group.heightMm, group.frameShape, group.archConfig);
    if (rendered.bytes.length > 0) {
      assetMap.set(group.geometryKey, { id: `pane_${nextIdx}`, fileName: `image${nextIdx}.png`, ...rendered });
      nextIdx += 1;
    }
  }
  return assetMap;
}
