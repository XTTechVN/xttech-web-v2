import {
  DEFAULT_FRAME_CONFIG,
  DEFAULT_SASH_CONFIG,
  type FrameConfig,
  type FrameShape,
  type SashConfig,
  type SceneCellNode,
} from '@/components';
import type { ProductionSheet, ProductionSheetGasketItem } from '@/types';
import type { CombinedSheetAccessory, SheetCadProps } from './technical-sheets.types';

interface RawSheetSystemConfig {
  w?: unknown;
  h?: unknown;
  aluminumColor?: unknown;
  hardwareColor?: unknown;
  frameShape?: unknown;
  frameConfig?: unknown;
  sashConfig?: unknown;
  rootCell?: unknown;
}

const isRecord = (val: unknown): val is Record<string, unknown> =>
  typeof val === 'object' && val !== null && !Array.isArray(val);

const isSceneCellNode = (val: unknown): val is SceneCellNode =>
  isRecord(val) && ('id' in val || 'w' in val || 'sashType' in val || 'children' in val);

export function extractSheetCadProps(
  sheet: ProductionSheet,
  configOverride?: Record<string, unknown> | null,
): SheetCadProps {
  const raw = (configOverride ?? sheet.systemConfig ?? {}) as RawSheetSystemConfig;
  const scW = typeof raw.w === 'number' && Number.isFinite(raw.w) ? raw.w : 0;
  const scH = typeof raw.h === 'number' && Number.isFinite(raw.h) ? raw.h : 0;
  const w = Number(sheet.width) || scW || 900;
  const h = Number(sheet.height) || scH || 1200;

  const aluminumColor =
    typeof raw.aluminumColor === 'string' && raw.aluminumColor ? raw.aluminumColor : '#4A5568';
  const hardwareColor =
    typeof raw.hardwareColor === 'string' && raw.hardwareColor ? raw.hardwareColor : '#1A202C';
  const frameShape = (
    typeof raw.frameShape === 'string' && raw.frameShape ? raw.frameShape : 'rect'
  ) as FrameShape;

  const rawFrame = isRecord(raw.frameConfig) ? (raw.frameConfig as Partial<FrameConfig>) : null;
  const frameConfig: FrameConfig = rawFrame
    ? {
        ...DEFAULT_FRAME_CONFIG,
        ...rawFrame,
        leftEdge: { ...DEFAULT_FRAME_CONFIG.leftEdge, ...(rawFrame.leftEdge ?? {}) },
        topEdge: { ...DEFAULT_FRAME_CONFIG.topEdge, ...(rawFrame.topEdge ?? {}) },
        rightEdge: { ...DEFAULT_FRAME_CONFIG.rightEdge, ...(rawFrame.rightEdge ?? {}) },
        bottomEdge: { ...DEFAULT_FRAME_CONFIG.bottomEdge, ...(rawFrame.bottomEdge ?? {}) },
      }
    : DEFAULT_FRAME_CONFIG;

  const rawSash = isRecord(raw.sashConfig) ? (raw.sashConfig as Partial<SashConfig>) : null;
  const sashConfig: SashConfig = rawSash
    ? { ...DEFAULT_SASH_CONFIG, ...rawSash }
    : DEFAULT_SASH_CONFIG;

  const rootCell: SceneCellNode | null = isSceneCellNode(raw.rootCell) ? raw.rootCell : null;

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

export function buildCombinedSheetAccessories(sheet: ProductionSheet): CombinedSheetAccessory[] {
  const combinedMap = new Map<string, CombinedSheetAccessory>();
  const addAcc = (code: string, name: string, qty: number, unit: string) => {
    if (!qty || qty <= 0) return;
    const normalizedUnit = unit || 'pcs';
    const key =
      (code && code !== '—' ? code.trim().toUpperCase() : name.trim().toLowerCase()) +
      '_' +
      normalizedUnit;
    const existing = combinedMap.get(key);
    if (!existing) {
      combinedMap.set(key, { code, name, quantity: qty, unit: normalizedUnit });
    } else {
      existing.quantity += qty;
    }
  };
  sheet.accessories.forEach((acc) =>
    addAcc(acc.accessoryCode || '—', acc.accessoryName, acc.quantity, acc.unit),
  );
  sheet.reinforcements.forEach((rf) =>
    addAcc(
      rf.accessoryCode || '—',
      rf.accessoryName || rf.name || 'Ke góc',
      rf.quantity ?? rf.qty ?? 0,
      rf.unit || 'pcs',
    ),
  );
  return Array.from(combinedMap.values());
}

function recoverLegacyGasketLengthM(sheet: ProductionSheet, name: string): number {
  const nameLower = (name || '').toLowerCase();
  if (nameLower.includes('cánh') || nameLower.includes('sash')) {
    const beadProfiles = (sheet.profiles || []).filter(
      (p) =>
        (p.barType || '').toUpperCase() === 'BEAD' ||
        (p.profileName || '').toLowerCase().includes('nẹp'),
    );
    const beadMm = beadProfiles.reduce(
      (sum, b) => sum + (Number(b.cutLengthMm) || 0) * (Number(b.quantity) || 1),
      0,
    );
    if (beadMm > 0) {
      return Math.round(((beadMm * 1.03) / 1000) * 100) / 100;
    }
    const glassMm = (sheet.glasses || []).reduce(
      (sum, g) =>
        sum +
        2 * ((Number(g.widthMm) || 0) + (Number(g.heightMm) || 0)) * (Number(g.quantity) || 1),
      0,
    );
    if (glassMm > 0) {
      return Math.round(((glassMm * 1.03) / 1000) * 100) / 100;
    }
  }
  const w = Number(sheet.width) || 1000;
  const h = Number(sheet.height) || 2000;
  return Math.round(((2 * (w + h) * 1.03) / 1000) * 100) / 100;
}

export function buildNormalizedSheetGaskets(sheet: ProductionSheet): ProductionSheetGasketItem[] {
  const rawGaskets = sheet.gaskets || [];
  const positiveKeys = new Set(
    rawGaskets
      .filter((g) => (Number(g.lengthM) || 0) > 0)
      .map((g) => `${(g.code || '').trim().toLowerCase()}_${(g.name || '').trim().toLowerCase()}`),
  );

  const grouped = new Map<string, ProductionSheetGasketItem>();
  for (const gasket of rawGaskets) {
    const code = gasket.code || '';
    const name = gasket.name || '';
    const unit = gasket.unit || 'meter';
    const itemKey = `${code.trim().toLowerCase()}_${name.trim().toLowerCase()}`;
    let lengthM = Math.round((Number(gasket.lengthM) || 0) * 100) / 100;

    if (lengthM <= 0 && !positiveKeys.has(itemKey)) {
      lengthM = recoverLegacyGasketLengthM(sheet, name);
    }
    if (lengthM <= 0) {
      continue;
    }

    const groupKey = `${code}_${name}_${unit}`;
    const existing = grouped.get(groupKey);
    if (!existing) {
      grouped.set(groupKey, { code: gasket.code, name: gasket.name, lengthM, unit });
    } else {
      existing.lengthM = Math.round(((existing.lengthM || 0) + lengthM) * 100) / 100;
    }
  }

  return Array.from(grouped.values());
}
