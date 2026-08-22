export const CUSTOMER_TYPE_OPTIONS = [
  { value: 'potential', label: 'Khách hàng tiềm năng' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Ngưng hoạt động' },
  { value: 'vip', label: 'Khách hàng thân thiết (VIP)' },
];

export const getCustomerTypeLabel = (type?: string | null) => {
  return CUSTOMER_TYPE_OPTIONS.find((opt) => opt.value === type)?.label || type || '—';
};
