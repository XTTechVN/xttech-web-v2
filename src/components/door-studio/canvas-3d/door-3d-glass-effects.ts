import { GlassVisualEffect } from '../studio-types';
import { createRainDrops } from '../utils/glass-visual-utils';
import { Door3DMeshCollector, hexToRgb01, Vec3 } from './door-3d-math';

interface GlassAppearance {
  color: Vec3;
  alpha: number;
}

interface GlassPaneRect3D {
  x1: number;
  x2: number;
  yTop: number;
  yBot: number;
  zF: number;
  zB: number;
}

const SPLIT_LINE_COLOR: Vec3 = [0.05, 0.65, 0.91];
const EFFECT_LINE_OFFSET_M = 0.0006;
const STRIPE_SPACING_M = 0.045;
const MAX_STRIPES = 24;

/** Màu & độ trong suốt nền kính theo hiệu ứng; 'clear' trả về null để giữ nguyên cách dựng cũ */
export const resolveGlassEffectAppearance = (
  effect: GlassVisualEffect | undefined,
  visualColorHex: string | undefined
): GlassAppearance | null => {
  switch (effect) {
    case 'tinted':
      return { color: hexToRgb01(visualColorHex || '#72b7d8', [0.45, 0.72, 0.85]), alpha: 0.52 };
    case 'frosted':
      return { color: [0.86, 0.93, 0.96], alpha: 0.68 };
    case 'striped':
      return { color: [0.68, 0.86, 0.94], alpha: 0.42 };
    case 'rain':
      return { color: [0.64, 0.84, 0.93], alpha: 0.4 };
    case 'pattern':
      return { color: [0.66, 0.85, 0.94], alpha: 0.42 };
    default:
      return null;
  }
};

const addDiagonalGrid = (collector: Door3DMeshCollector, rect: GlassPaneRect3D, color: Vec3): void => {
  const { x1, x2, yTop, yBot, zF } = rect;
  const pw = Math.abs(x2 - x1);
  const ph = Math.abs(yTop - yBot);
  const step = Math.max(0.06, (pw + ph) / 16);
  for (const direction of [1, -1]) {
    for (let sx = x1 - ph; sx <= x2 + ph; sx += step) {
      // Đường chéo từ đáy lên đỉnh, cắt theo biên ngang của kính
      const startX = direction === 1 ? sx : sx + ph;
      const t0 = Math.max(0, direction === 1 ? (x1 - sx) / ph : (startX - x2) / ph);
      const t1 = Math.min(1, direction === 1 ? (x2 - sx) / ph : (startX - x1) / ph);
      if (t0 >= t1) continue;
      collector.addLine(
        [startX + direction * ph * t0, yBot + (yTop - yBot) * t0, zF + EFFECT_LINE_OFFSET_M],
        [startX + direction * ph * t1, yBot + (yTop - yBot) * t1, zF + EFFECT_LINE_OFFSET_M],
        color,
        0.3
      );
    }
  }
};

/** Vẽ chi tiết hiệu ứng (sọc, giọt mưa, caro chéo) trên mặt trước kính và đường chia kính ngang */
export const addGlassEffectDetails3D = (
  collector: Door3DMeshCollector,
  rect: GlassPaneRect3D,
  effect: GlassVisualEffect | undefined,
  splitCount: number | null | undefined,
  seedKey: string
): void => {
  const { x1, x2, yTop, yBot, zF, zB } = rect;
  const pw = Math.abs(x2 - x1);
  const ph = Math.abs(yTop - yBot);
  const lineColor: Vec3 = [0.35, 0.62, 0.74];
  const zLine = zF + EFFECT_LINE_OFFSET_M;

  if (effect === 'striped') {
    const stripeCount = Math.min(MAX_STRIPES, Math.floor(pw / STRIPE_SPACING_M));
    for (let idx = 1; idx <= stripeCount; idx++) {
      const sx = x1 + (pw * idx) / (stripeCount + 1);
      collector.addLine([sx, yBot, zLine], [sx, yTop, zLine], lineColor, 0.55);
    }
  } else if (effect === 'rain') {
    for (const drop of createRainDrops(seedKey, 18)) {
      const dx = x1 + (pw * drop.x) / 120;
      const dy = yBot + (ph * drop.y) / 120;
      collector.addLine([dx, dy, zLine], [dx, Math.min(yTop, dy + 0.012 + drop.ry * 0.003), zLine], lineColor, 0.6);
    }
  } else if (effect === 'pattern') {
    addDiagonalGrid(collector, rect, lineColor);
  }

  const splitLineCount = Math.max(0, Math.floor(splitCount ?? 1) - 1);
  for (let idx = 1; idx <= splitLineCount; idx++) {
    const sy = yBot + (ph * idx) / (splitLineCount + 1);
    collector.addLine([x1, sy, zF + EFFECT_LINE_OFFSET_M], [x2, sy, zF + EFFECT_LINE_OFFSET_M], SPLIT_LINE_COLOR, 0.9);
    collector.addLine([x1, sy, zB - EFFECT_LINE_OFFSET_M], [x2, sy, zB - EFFECT_LINE_OFFSET_M], SPLIT_LINE_COLOR, 0.9);
  }
};
