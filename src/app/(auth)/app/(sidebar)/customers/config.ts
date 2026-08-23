export const CUSTOMER_TYPE_OPTIONS = [
  { value: 'potential', label: 'Khách hàng tiềm năng' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Ngưng hoạt động' },
  { value: 'vip', label: 'Khách hàng thân thiết (VIP)' },
];

export const getCustomerTypeLabel = (type?: string | null) => {
  return CUSTOMER_TYPE_OPTIONS.find((opt) => opt.value === type)?.label || type || '—';
};

export const CUSTOMER_LOG_CHANNEL_OPTIONS = [
  { value: 'call', label: 'Gọi điện thoại trực tiếp' },
  { value: 'zalo', label: 'Nhắn tin / Gọi qua Zalo' },
  { value: 'meeting', label: 'Gặp mặt trực tiếp / Khảo sát tại công trình' },
  { value: 'email', label: 'Gửi email trao đổi / Báo giá' },
  { value: 'facebook', label: 'Nhắn tin qua Fanpage / Messenger' },
  { value: 'other', label: 'Kênh khác' },
];

export const getCustomerLogChannelLabel = (channel?: string | null) => {
  return CUSTOMER_LOG_CHANNEL_OPTIONS.find((opt) => opt.value === channel)?.label || channel || '—';
};

export const CUSTOMER_LOG_TYPE_OPTIONS = [
  { value: 'pending', label: 'Chưa đánh giá / Đang chờ phản hồi' },
  { value: 'potential', label: 'Khách hàng tiềm năng (rất quan tâm)' },
  { value: 'non_potential', label: 'Ít tiềm năng (cân nhắc thêm về giá/thời gian)' },
  { value: 'no_demand', label: 'Không có nhu cầu' },
];

export const getCustomerLogTypeLabel = (type?: string | null) => {
  return CUSTOMER_LOG_TYPE_OPTIONS.find((opt) => opt.value === type)?.label || type || '—';
};

export const CUSTOMER_LOG_STATUS_OPTIONS = [
  { value: 'completed', label: 'Thành công (đã kết nối, tư vấn hoặc gặp thành công)' },
  { value: 'pending', label: 'Đang hẹn lại / Chờ gửi tài liệu' },
  { value: 'failed', label: 'Thất bại (thuê bao, không nghe máy, khách hủy hẹn)' },
];

export const getCustomerLogStatusLabel = (status?: string | null) => {
  return CUSTOMER_LOG_STATUS_OPTIONS.find((opt) => opt.value === status)?.label || status || '—';
};

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
