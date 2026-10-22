import type { ProductionSheet } from '@/types';
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

