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

// Config màu loại khách hàng
export const getCustomerTypeColor = (type?: string | null) => {
  switch (type) {
    case 'potential':
      return 'text-primary bg-primary/10 border-primary/20  ';
    case 'active':
      return 'text-success bg-success/10 border-success/20';
    case 'inactive':
      return 'text-gray-500 bg-gray-50 border-gray-200';
    case 'vip':
      return 'text-danger bg-danger/10 border-danger/20';
    default:
      return 'text-gray-500 bg-gray-50 border-gray-200';
  }
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
      return 'text-success bg-success/10 border-success/20';
    case 'pending':
      return 'text-warning bg-warning/10 border-warning/20';
    case 'failed':
      return 'text-danger bg-danger/10 border-danger/20';
    default:
      return 'text-gray-500 bg-gray-50 border-gray-200';
  }
};
