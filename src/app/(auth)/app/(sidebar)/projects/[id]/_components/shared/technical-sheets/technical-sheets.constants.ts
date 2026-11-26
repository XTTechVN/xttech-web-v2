import type { FulfillmentFilter } from './technical-sheets.types';

export interface FulfillmentFilterOption {
  value: FulfillmentFilter;
  label: string;
}

export const FULFILLMENT_FILTER_OPTIONS: FulfillmentFilterOption[] = [
  { value: 'all', label: 'Tất cả nguồn' },
  { value: 'in_house', label: 'Tự sản xuất' },
  { value: 'outsourced', label: 'Nhập nguyên bộ (NCC)' },
];
