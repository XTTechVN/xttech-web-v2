import { DOOR_TYPE_LABELS } from '@/types';

export interface SupplierDoorTypeOption {
  value: string;
  label: string;
}

export const SUPPLIER_DOOR_TYPE_OPTIONS: SupplierDoorTypeOption[] = [
  { value: 'composite_wood', label: 'Cửa nhựa gỗ Composite' },
  { value: 'steel_wood', label: 'Cửa thép vân gỗ' },
  { value: 'abs_korean', label: 'Cửa nhựa ABS Hàn Quốc' },
  { value: 'fireproof', label: 'Cửa thép chống cháy' },
  { value: 'industrial_wood', label: 'Cửa gỗ công nghiệp (MDF/HDF)' },
  { value: 'rolling_door', label: 'Cửa cuốn' },
  { value: 'automatic_door', label: 'Cửa kính tự động' },
  { value: 'imported_aluminum', label: 'Cửa nhôm nhập nguyên bộ' },
  { value: 'casement_door', label: 'Cửa đi mở quay' },
  { value: 'sliding_door', label: 'Cửa đi lùa' },
  { value: 'other', label: 'Khác' },
];

export const SUPPLIER_DOOR_TYPE_LABEL_MAP: Record<string, string> = {
  ...DOOR_TYPE_LABELS,
  ...Object.fromEntries(SUPPLIER_DOOR_TYPE_OPTIONS.map((item) => [item.value, item.label])),
};

export const getSupplierDoorTypeLabel = (doorType?: string | null): string => {
  if (!doorType) return 'Chưa phân loại';
  return SUPPLIER_DOOR_TYPE_LABEL_MAP[doorType] ?? doorType;
};

export const SUPPLIER_DOOR_STATUS_FILTER_OPTIONS = [
  { value: undefined, label: 'Tất cả trạng thái' },
  { value: 'true', label: 'Đang sử dụng' },
  { value: 'false', label: 'Tạm ngưng' },
];
