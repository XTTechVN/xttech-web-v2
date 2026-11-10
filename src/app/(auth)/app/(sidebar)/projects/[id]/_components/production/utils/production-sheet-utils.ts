import type { ProductionSheet, ProductionSheetGasketItem } from '@/types';
import type { CombinedSheetAccessory } from '../types';

export function buildCombinedSheetAccessories(sheet: ProductionSheet): CombinedSheetAccessory[] {
  const combinedMap = new Map<string, CombinedSheetAccessory>();
  const addAcc = (code: string, name: string, qty: number, unit: string) => {
    const key = `${code}_${name}`;
    const existing = combinedMap.get(key);
    if (!existing) {
      combinedMap.set(key, { code, name, quantity: qty, unit });
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
      rf.quantity ?? rf.qty ?? 4,
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


