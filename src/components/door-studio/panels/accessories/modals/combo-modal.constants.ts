import { formatCurrency } from '@/utils';
import {
  ACCESSORY_UNIT_MAP,
  COMBO_DOOR_TYPE_OPTIONS,
  type Accessory,
  type AccessoryCombo,
  type AccessoryComboCreate,
} from '@/types';
import type { ComboAccessoryOption } from './combo-items-editor';

export const DEFAULT_VALUES: AccessoryComboCreate = {
  code: '',
  name: '',
  doorTypeId: null,
  doorTypes: [],
  applyFor: 'khung',
  openingType: null,
  description: '',
  brandId: null,
  comboItems: [],
  totalComboPrice: 0,
  isDefault: false,
  isActive: true,
};

export const APPLY_FOR_OPTIONS = [
  { value: 'khung', label: 'Khung cửa' },
  { value: 'canh', label: 'Cánh cửa' },
  { value: 'huong_mo', label: 'Hướng mở' },
  { value: 'khac', label: 'Khác' },
];

export const DOOR_TYPE_OPTIONS = COMBO_DOOR_TYPE_OPTIONS;

export const OPENING_TYPE_OPTIONS = [
  { value: '', label: '-- Chọn kiểu mở --' },
  { value: 'vach_co_dinh', label: 'Vách cố định' },
  { value: '2_canh_mo', label: '2 cánh mở' },
  { value: '1_canh_quay_trai', label: '1 cánh quay (trái)' },
  { value: '1_canh_quay_phai', label: '1 cánh quay (phải)' },
  { value: 'mo_hat_khong_song', label: 'Mở hất (không song)' },
  { value: 'mo_lat_khong_song', label: 'Mở lật (không song)' },
  { value: 'lat_xuong', label: 'Lật xuống' },
  { value: 'quay_va_lat', label: 'Quay & Lật' },
  { value: 'canh_truot_luoi', label: 'Cánh trượt lưới' },
  { value: 'canh_truot_ngang', label: 'Cánh trượt ngang' },
];

export function cleanComboNote(
  note?: string | null,
  ...accessoryNames: (string | null | undefined)[]
): string {
  if (!note || !note.trim()) return '';
  const trimmed = note.trim();
  const lowered = trimmed.toLowerCase();
  if (lowered === 'món combo') return '';
  for (const name of accessoryNames) {
    if (name && name.trim() && lowered === name.trim().toLowerCase()) {
      return '';
    }
  }
  return trimmed;
}

export function resolveComboItemsForForm(
  items: AccessoryCombo['comboItems'] | undefined,
  accessories: Accessory[],
) {
  if (!items || items.length === 0) {
    return [{ accessoryId: 0, quantity: 1, note: '' }];
  }
  const byId = new Map<number, Accessory>();
  const byCode = new Map<string, Accessory>();
  const byName = new Map<string, Accessory>();
  for (const acc of accessories) {
    byId.set(acc.id, acc);
    if (acc.code) byCode.set(acc.code.trim().toLowerCase(), acc);
    if (acc.name) byName.set(acc.name.trim().toLowerCase(), acc);
  }

  return items.map((item) => {
    const rawId = Number(item.accessoryId) || 0;
    let matched = byId.get(rawId);
    if (!matched && item.accessoryCode) {
      matched = byCode.get(item.accessoryCode.trim().toLowerCase());
    }
    if (!matched && item.accessoryName) {
      matched = byName.get(item.accessoryName.trim().toLowerCase());
    }
    if (!matched && item.note) {
      matched = byName.get(item.note.trim().toLowerCase());
    }
    const finalAccessoryId = matched ? matched.id : rawId;
    return {
      accessoryId: finalAccessoryId,
      quantity: item.quantity || 1,
      note: cleanComboNote(item.note, item.accessoryName, matched?.name),
    };
  });
}

export function buildAccessoryPriceMap(
  accessories: Accessory[],
  combo?: AccessoryCombo | null,
): Map<number, number> {
  const map = new Map<number, number>();
  for (const acc of accessories) map.set(acc.id, acc.costPrice || 0);
  if (combo?.comboItems) {
    for (const item of combo.comboItems) {
      if (item.accessoryId > 0 && item.accessoryName && !map.has(item.accessoryId) && item.unitPrice) {
        map.set(item.accessoryId, Number(item.unitPrice));
      }
    }
  }
  return map;
}

export function buildAccessoryOptions(
  accessories: Accessory[],
  combo?: AccessoryCombo | null,
): ComboAccessoryOption[] {
  const map = new Map<number, ComboAccessoryOption>();
  for (const a of accessories) {
    const unitKey = a.unit ? a.unit.toLowerCase() : '';
    const unitLabel = ACCESSORY_UNIT_MAP[unitKey] || a.unit || 'cái';
    const subLabel = `${formatCurrency(a.costPrice || 0)}/${unitLabel}`;
    map.set(a.id, {
      value: a.id,
      name: a.name,
      code: a.code || 'N/A',
      subLabel,
      label: `${a.name} (${a.code || 'N/A'}) - ${formatCurrency(a.costPrice || 0)}`,
    });
  }
  if (combo?.comboItems) {
    for (const item of combo.comboItems) {
      if (item.accessoryId > 0 && item.accessoryName && !map.has(item.accessoryId)) {
        const unitKey = item.unit ? item.unit.toLowerCase() : '';
        const unitLabel = ACCESSORY_UNIT_MAP[unitKey] || item.unit || 'cái';
        const subLabel = item.unitPrice
          ? `${Number(item.unitPrice).toLocaleString('vi-VN')}đ/${unitLabel}`
          : undefined;
        const baseLabel = item.accessoryCode
          ? `${item.accessoryName} (${item.accessoryCode})`
          : item.accessoryName;
        map.set(item.accessoryId, {
          value: item.accessoryId,
          name: item.accessoryName,
          code: item.accessoryCode || undefined,
          label: subLabel ? `${baseLabel} - ${subLabel}` : baseLabel,
          subLabel,
        });
      }
    }
  }
  return Array.from(map.values());
}

export function buildComboSubmitPayload(
  data: AccessoryComboCreate,
  suggestedTotal: number,
  accessories: Accessory[],
  combo?: AccessoryCombo | null,
  brandId?: number | null,
): AccessoryComboCreate {
  let finalPrice = Number(data.totalComboPrice);
  if ((!finalPrice || finalPrice <= 0) && suggestedTotal > 0) finalPrice = suggestedTotal;
  const cleanedItems = (data.comboItems || [])
    .filter((item) => Number(item.accessoryId) > 0)
    .map((item) => {
      const accId = Number(item.accessoryId);
      const matchedAcc = accessories.find((a) => a.id === accId);
      const existingItem = combo?.comboItems?.find((i) => Number(i.accessoryId) === accId);
      const cleanedNote = cleanComboNote(
        item.note,
        item.accessoryName || matchedAcc?.name || existingItem?.accessoryName,
      );
      return {
        accessoryId: accId,
        quantity: Number(item.quantity || 1),
        note: cleanedNote || undefined,
      };
    });

  return {
    ...data,
    totalComboPrice: finalPrice,
    comboItems: cleanedItems,
    doorTypeId: data.doorTypeId ? Number(data.doorTypeId) : null,
    doorTypes: Array.isArray(data.doorTypes) ? data.doorTypes.filter(Boolean) : [],
    description: data.description?.trim() ? data.description.trim() : null,
    brandId: data.brandId ? Number(data.brandId) : brandId || combo?.brandId || null,
  };
}
