import {
  POSITION_DOOR_TYPE_LABEL_MAP,
  SUPPLIER_DOOR_TYPE_OPTIONS,
  getPositionDoorTypeLabel,
  type SupplierDoorTypeOption,
} from '@/config';

export { SUPPLIER_DOOR_TYPE_OPTIONS, type SupplierDoorTypeOption };

export const SUPPLIER_DOOR_TYPE_LABEL_MAP: Record<string, string> = POSITION_DOOR_TYPE_LABEL_MAP;

export const getSupplierDoorTypeLabel = getPositionDoorTypeLabel;

export const SUPPLIER_DOOR_STATUS_FILTER_OPTIONS = [
  { value: undefined, label: 'Tất cả trạng thái' },
  { value: 'true', label: 'Đang sử dụng' },
  { value: 'false', label: 'Tạm ngưng' },
];
