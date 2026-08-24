// Config loại khách hàng
export const CUSTOMER_TYPE_OPTIONS = [
  { value: 'potential', label: 'Tiềm năng' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Ngưng hoạt động' },
  { value: 'vip', label: 'VIP' },
];

export const getCustomerTypeLabel = (type?: string | null) => {
  return CUSTOMER_TYPE_OPTIONS.find((opt) => opt.value === type)?.label || type || '—';
};

// Config kênh tương tác
export const CUSTOMER_LOG_CHANNEL_OPTIONS = [
  { value: 'call', label: 'Gọi điện' },
  { value: 'zalo', label: 'Zalo' },
  { value: 'meeting', label: 'Gặp mặt' },
  { value: 'email', label: 'Email' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'other', label: 'Khác' },
];

export const getCustomerLogChannelLabel = (channel?: string | null) => {
  return CUSTOMER_LOG_CHANNEL_OPTIONS.find((opt) => opt.value === channel)?.label || channel || '—';
};

// Config trạng thái tương tác
export const CUSTOMER_LOG_TYPE_OPTIONS = [
  { value: 'pending', label: 'Chưa đánh giá' },
  { value: 'potential', label: 'Tiềm năng' },
  { value: 'non_potential', label: 'Ít tiềm năng' },
  { value: 'no_demand', label: 'Không có nhu cầu' },
];

export const getCustomerLogTypeLabel = (type?: string | null) => {
  return CUSTOMER_LOG_TYPE_OPTIONS.find((opt) => opt.value === type)?.label || type || '—';
};

// Config trạng thái 
export const CUSTOMER_LOG_STATUS_OPTIONS = [
  { value: 'completed', label: 'Thành công' },
  { value: 'pending', label: 'Đang chờ' },
  { value: 'failed', label: 'Thất bại' },
];

export const getCustomerLogStatusLabel = (status?: string | null) => {
  return CUSTOMER_LOG_STATUS_OPTIONS.find((opt) => opt.value === status)?.label || status || '—';
};

// Config màu trạng thái tương tác
export const getCustomerLogStatusColor = (status?: string | null) => {
  switch (status) {
    case 'completed':
      return 'text-green-700 bg-green-50 border-green-200';
    case 'pending':
      return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'failed':
      return 'text-red-700 bg-red-50 border-red-200';
    default:
      return 'text-gray-700 bg-gray-50 border-gray-200';
  }
};
