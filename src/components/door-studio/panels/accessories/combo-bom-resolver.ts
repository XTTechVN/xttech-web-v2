import type { AccessoryCombo, DoorCalculateResponse } from '@/types';
import { detectComboCategory, type ResolvedComboItemBom } from './types';

/**
 * Pure View Lookup: Đối chiếu các vật tư trong gói Combo với kết quả bóc tách BOM thực tế từ Backend (`calcData`).
 * Tuyệt đối không tự tính toán lại hình học trên Frontend.
 */
export function resolveComboItemsBom(
  combo: AccessoryCombo,
  calcData?: DoorCalculateResponse | null
): ResolvedComboItemBom[] {
  const items = combo.comboItems || [];
  if (items.length === 0) return [];

  if (!calcData) {
    return items.map((item) => {
      const unitPrice = item.unitPrice || 0;
      return {
        accessoryId: item.accessoryId,
        accessoryName: item.accessoryName,
        accessoryCode: item.accessoryCode,
        baseQty: item.quantity,
        resolvedQty: item.quantity,
        isScaled: false,
        formula: null,
        unit: item.unit || 'pcs',
        unitPrice,
        resolvedTotalPrice: unitPrice * item.quantity,
      };
    });
  }

  const joints = calcData.cornerJoints || [];
  const accessories = calcData.accessories || [];
  const hasComboInBom =
    joints.some((j) => j.comboId === combo.id) ||
    accessories.some((a) => a.comboId === combo.id);
  const totalSashes = Object.values(calcData.sashCounts || {}).reduce((sum, n) => sum + n, 0);
  const isZeroSashCombo = !hasComboInBom && detectComboCategory(combo) === 'sash' && totalSashes === 0;

  return items.map((item) => {
    const itemCodeNorm = (item.accessoryCode || '').trim().toLowerCase();

    const matchedJoints = joints.filter((j) => {
      if (j.comboId != null && j.comboId !== combo.id) return false;
      if (!hasComboInBom && j.comboId == null) return false;
      if (item.accessoryId && j.accessoryId != null) return j.accessoryId === item.accessoryId;
      if (itemCodeNorm && j.accessoryCode) {
        return j.accessoryCode.trim().toLowerCase() === itemCodeNorm;
      }
      return false;
    });

    if (matchedJoints.length > 0) {
      const resolvedQty = matchedJoints.reduce((sum, j) => sum + (j.qty || 0), 0);
      const resolvedTotalPrice = matchedJoints.reduce((sum, j) => sum + (j.totalPrice || 0), 0);
      const firstJoint = matchedJoints[0];
      const formulas = Array.from(
        new Set(matchedJoints.map((j) => j.formula).filter((f): f is string => Boolean(f)))
      );
      return {
        accessoryId: item.accessoryId,
        accessoryName: item.accessoryName || firstJoint.accessoryName || firstJoint.name,
        accessoryCode: item.accessoryCode || firstJoint.accessoryCode,
        baseQty: item.quantity,
        resolvedQty,
        isScaled: resolvedQty !== item.quantity,
        formula: formulas.join(' + ') || null,
        unit: firstJoint.unit || item.unit || 'pcs',
        unitPrice: firstJoint.unitPrice || item.unitPrice || 0,
        resolvedTotalPrice,
      };
    }

    const matchedAcc = accessories.find((a) => {
      if (a.comboId != null && a.comboId !== combo.id) return false;
      if (!hasComboInBom && a.comboId == null) return false;
      if (item.accessoryId && a.accessoryId != null) return a.accessoryId === item.accessoryId;
      if (itemCodeNorm && a.code) {
        return a.code.trim().toLowerCase() === itemCodeNorm;
      }
      return false;
    });

    if (matchedAcc) {
      const resolvedQty = matchedAcc.quantity;
      return {
        accessoryId: item.accessoryId,
        accessoryName: item.accessoryName || matchedAcc.name,
        accessoryCode: item.accessoryCode || matchedAcc.code,
        baseQty: item.quantity,
        resolvedQty,
        isScaled: resolvedQty !== item.quantity,
        formula: matchedAcc.scaleFormula || null,
        unit: matchedAcc.unit || item.unit || 'pcs',
        unitPrice: matchedAcc.unitPrice || item.unitPrice || 0,
        resolvedTotalPrice: matchedAcc.totalPrice,
      };
    }

    if (hasComboInBom || isZeroSashCombo) {
      return {
        accessoryId: item.accessoryId,
        accessoryName: item.accessoryName,
        accessoryCode: item.accessoryCode,
        baseQty: item.quantity,
        resolvedQty: 0,
        isScaled: item.quantity !== 0,
        formula: isZeroSashCombo ? 'Cửa không có cánh mở' : null,
        unit: item.unit || 'pcs',
        unitPrice: item.unitPrice || 0,
        resolvedTotalPrice: 0,
      };
    }

    const fallbackUnitPrice = item.unitPrice || 0;
    return {
      accessoryId: item.accessoryId,
      accessoryName: item.accessoryName,
      accessoryCode: item.accessoryCode,
      baseQty: item.quantity,
      resolvedQty: item.quantity,
      isScaled: false,
      formula: null,
      unit: item.unit || 'pcs',
      unitPrice: fallbackUnitPrice,
      resolvedTotalPrice: fallbackUnitPrice * item.quantity,
    };
  });
}

export function resolveSelectedComboTotalPrice(
  combo: AccessoryCombo,
  calcData?: DoorCalculateResponse | null
): number {
  if (!calcData) return combo.totalComboPrice || 0;
  const resolvedItems = resolveComboItemsBom(combo, calcData);
  if (resolvedItems.length === 0) return combo.totalComboPrice || 0;
  return resolvedItems.reduce((sum, item) => sum + item.resolvedTotalPrice, 0);
}
