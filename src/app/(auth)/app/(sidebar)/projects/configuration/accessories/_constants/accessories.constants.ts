export type SortField =
  | 'code'
  | 'name'
  | 'category'
  | 'specification'
  | 'unit'
  | 'color'
  | 'price'
  | 'status';

export type SortOrder = 'asc' | 'desc';

export interface AccessoryColumn {
  field: SortField;
  label: string;
  align: 'left' | 'center' | 'right';
  width: string;
}

export const ACCESSORY_TABLE_COLUMNS: AccessoryColumn[] = [
  { field: 'name', label: 'Tên phụ kiện', align: 'left', width: 'min-w-[260px]' },
  { field: 'specification', label: 'Quy cách', align: 'left', width: 'min-w-[200px] max-w-[340px]' },
  { field: 'unit', label: 'ĐVT', align: 'center', width: 'w-20' },
  { field: 'color', label: 'Màu sắc', align: 'center', width: 'w-28' },
  { field: 'price', label: 'Giá nhập', align: 'right', width: 'w-32' },
  { field: 'status', label: 'Trạng thái', align: 'center', width: 'w-28' },
];
