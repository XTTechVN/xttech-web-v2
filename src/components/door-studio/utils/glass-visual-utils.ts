import { Glass } from '@/types';
import { GlassVisualEffect, SceneCellNode } from '../studio-types';

export const DEFAULT_GLASS_VISUAL_COLOR = '#72b7d8';

export const GLASS_VISUAL_EFFECT_OPTIONS: ReadonlyArray<{ id: GlassVisualEffect; label: string }> = [
  { id: 'clear', label: 'Kính trong' },
  { id: 'tinted', label: 'Kính màu' },
  { id: 'frosted', label: 'Kính mờ' },
  { id: 'striped', label: 'Kính sọc' },
  { id: 'rain', label: 'Kính hạt mưa' },
  { id: 'pattern', label: 'Kính hoa văn' },
];

const VALID_EFFECT_IDS = new Set<string>(GLASS_VISUAL_EFFECT_OPTIONS.map((option) => option.id));
const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;
const MAX_RAIN_CACHE = 200;

export const normalizeGlassVisualEffect = (value?: string | null): GlassVisualEffect =>
  value && VALID_EFFECT_IDS.has(value) ? (value as GlassVisualEffect) : 'clear';

export const normalizeHexColor = (value?: string | null, fallback = DEFAULT_GLASS_VISUAL_COLOR): string =>
  value && HEX_COLOR_PATTERN.test(value) ? value : fallback;

interface InferredGlassVisual {
  effect: GlassVisualEffect;
  color: string;
}

const hasAnyKeyword = (text: string, keywords: string[]): boolean => keywords.some((keyword) => text.includes(keyword));

/** Suy hiệu ứng mặc định từ tên / loại vật liệu kính (không phân biệt hoa thường) */
export const inferDefaultGlassVisual = (glass?: Glass | null, glassName?: string): InferredGlassVisual => {
  const text = `${glass?.name || glassName || ''} ${glass?.glassType || ''}`.toLowerCase();
  if (hasAnyKeyword(text, ['mờ', 'đục', 'phun cát', 'acid'])) return { effect: 'frosted', color: DEFAULT_GLASS_VISUAL_COLOR };
  if (hasAnyKeyword(text, ['sọc', 'sóng'])) return { effect: 'striped', color: DEFAULT_GLASS_VISUAL_COLOR };
  if (text.includes('hạt mưa')) return { effect: 'rain', color: DEFAULT_GLASS_VISUAL_COLOR };
  if (hasAnyKeyword(text, ['hoa văn', 'bông'])) return { effect: 'pattern', color: DEFAULT_GLASS_VISUAL_COLOR };
  if (text.includes('trà')) return { effect: 'tinted', color: '#8b6f4e' };
  if (hasAnyKeyword(text, ['xám khói', 'đen'])) return { effect: 'tinted', color: '#5c6f7e' };
  if (hasAnyKeyword(text, ['xanh', 'màu'])) return { effect: 'tinted', color: DEFAULT_GLASS_VISUAL_COLOR };
  return { effect: 'clear', color: DEFAULT_GLASS_VISUAL_COLOR };
};

export interface ResolvedCellGlassVisual {
  selectedGlass: Glass | null;
  activeGlass: Glass | null;
  effectiveEffect: GlassVisualEffect;
  effectiveColor: string;
  hasEffectOverride: boolean;
  defaultEffect: GlassVisualEffect;
  defaultColor: string;
}

export const resolveCellGlassVisual = (
  cell: SceneCellNode,
  availableGlasses?: Glass[],
  defaultGlass?: Glass | null
): ResolvedCellGlassVisual => {
  const selectedGlass =
    availableGlasses?.find((glass) => (cell.glassId != null ? glass.id === cell.glassId : glass.name === cell.glassName)) ??
    null;
  const activeGlass = selectedGlass || defaultGlass || null;
  const inferred = inferDefaultGlassVisual(activeGlass, cell.glassName);
  const hasEffectOverride = Boolean(cell.glassVisualEffectOverride);
  const effectiveEffect = hasEffectOverride
    ? normalizeGlassVisualEffect(cell.glassVisualEffect)
    : normalizeGlassVisualEffect(cell.glassVisualEffect || inferred.effect);
  const effectiveColor = hasEffectOverride
    ? normalizeHexColor(cell.glassVisualColor, inferred.color)
    : normalizeHexColor(cell.glassVisualColor || inferred.color);
  return {
    selectedGlass,
    activeGlass,
    effectiveEffect,
    effectiveColor,
    hasEffectOverride,
    defaultEffect: inferred.effect,
    defaultColor: inferred.color,
  };
};

export interface RainDrop {
  x: number;
  y: number;
  rx: number;
  ry: number;
}

const rainDropCache = new Map<string, RainDrop[]>();

/** Giọt mưa giả ngẫu nhiên ổn định theo seedKey (FNV-1a + LCG), có cache để zoom/pan không tính lại */
export const createRainDrops = (seedKey: string, count = 18): RainDrop[] => {
  const cacheKey = `${seedKey}|${count}`;
  const cached = rainDropCache.get(cacheKey);
  if (cached) return cached;

  let hash = 2166136261;
  for (let idx = 0; idx < seedKey.length; idx++) {
    hash ^= seedKey.charCodeAt(idx);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  let state = hash;
  const nextRandom = (): number => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const drops: RainDrop[] = Array.from({ length: count }, () => ({
    x: 6 + nextRandom() * 108,
    y: 6 + nextRandom() * 108,
    rx: 2.2 + nextRandom() * 2.4,
    ry: 3.4 + nextRandom() * 3.6,
  }));

  if (rainDropCache.size >= MAX_RAIN_CACHE) {
    const oldestKey = rainDropCache.keys().next().value;
    if (oldestKey !== undefined) rainDropCache.delete(oldestKey);
  }
  rainDropCache.set(cacheKey, drops);
  return drops;
};

/** Áp patch hiệu ứng kính cho mọi ô lá kính (paneType 'glass') trong cây */
export const applyGlassVisualToTree = (node: SceneCellNode, patch: Partial<SceneCellNode>): SceneCellNode => {
  if (node.children && node.children.length > 0) {
    return { ...node, children: node.children.map((child) => applyGlassVisualToTree(child, patch)) };
  }
  if ((node.paneType ?? 'glass') !== 'glass') return node;
  return { ...node, ...patch };
};
