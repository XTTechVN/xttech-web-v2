// Các nút/chức năng dùng để thử hàm can() theo từng role. Mã quyền lấy từ manifest của api.
export interface ActionDef {
  code: string;
  label: string;
}

export interface ActionGroup {
  title: string;
  actions: ActionDef[];
}

export const ACTION_GROUPS: ActionGroup[] = [
  {
    title: 'Khách hàng',
    actions: [
      { code: 'customer:read', label: 'Xem danh sách khách hàng' },
      { code: 'customer:create', label: 'Nút Thêm khách hàng' },
      { code: 'customer:update', label: 'Nút Sửa khách hàng' },
      { code: 'customer:delete', label: 'Nút Xoá khách hàng' },
    ],
  },
  {
    title: 'Dự án và báo giá',
    actions: [
      { code: 'project:create', label: 'Nút Thêm dự án' },
      { code: 'quotation:submit', label: 'Nút Trình duyệt báo giá' },
      { code: 'quotation:approve', label: 'Nút Duyệt báo giá' },
    ],
  },
  {
    title: 'Chấm công',
    actions: [
      { code: 'attendance:create', label: 'Nút Thêm công' },
      { code: 'attendance_report:close_period', label: 'Nút Chốt công' },
    ],
  },
  {
    title: 'Kho và sản xuất',
    actions: [
      { code: 'warehouse_receipt:create', label: 'Nút Lập phiếu kho' },
      { code: 'warehouse_receipt:approve', label: 'Nút Duyệt phiếu kho' },
      { code: 'door_progress:revert', label: 'Nút Lùi mốc tiến độ cửa' },
    ],
  },
  {
    title: 'Hệ thống',
    actions: [
      { code: 'user:create', label: 'Nút Thêm thành viên' },
      { code: 'role:assign_permission', label: 'Bật/tắt quyền của vai trò' },
    ],
  },
];
