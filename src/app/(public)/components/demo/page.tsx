'use client';

import { useState } from 'react';
import { Sidebar, Header, TableData, ITableColumn, Badge } from '@/components';
import {
  LayoutDashboard,
  Wallet,
  FileText,
  Bell,
  MessageSquare,
  GitBranch,
  Menu,
} from 'lucide-react';

interface Activity {
  id: string;
  time: string;
  user: string;
  action: string;
  status: 'success' | 'warning' | 'failed';
  details: string;
}

const mockActivities: Activity[] = [
  {
    id: '1',
    time: '18:45',
    user: 'Nguyễn Văn Anh',
    action: 'Cập nhật trạng thái đơn hàng',
    status: 'success',
    details: 'Đơn hàng #DH-2026-0812',
  },
  {
    id: '2',
    time: '17:30',
    user: 'Trần Thị Bình',
    action: 'Thêm sản phẩm mới',
    status: 'success',
    details: 'Sản phẩm: Laptop ASUS Zenbook 14',
  },
  {
    id: '3',
    time: '16:15',
    user: 'Lê Hoàng Long',
    action: 'Yêu cầu hoàn tiền',
    status: 'warning',
    details: 'Khách hàng hoàn sản phẩm lỗi',
  },
  {
    id: '4',
    time: '15:00',
    user: 'Nguyễn Văn Anh',
    action: 'Đăng nhập hệ thống',
    status: 'success',
    details: 'IP: 192.168.1.15',
  },
  {
    id: '5',
    time: '14:20',
    user: 'Phạm Thanh Thảo',
    action: 'Xóa danh mục cũ',
    status: 'failed',
    details: 'Danh mục: Phụ kiện cũ (Không được phép xóa)',
  },
  {
    id: '6',
    time: '11:10',
    user: 'Trần Thị Bình',
    action: 'Cập nhật tồn kho',
    status: 'success',
    details: 'Cập nhật +50 tai nghe Sony WH-1000XM5',
  },
  {
    id: '7',
    time: '10:05',
    user: 'Lê Hoàng Long',
    action: 'Xuất báo cáo doanh thu',
    status: 'success',
    details: 'Báo cáo Q2_2026.xlsx',
  },
  {
    id: '8',
    time: '09:30',
    user: 'Hệ thống',
    action: 'Sao lưu cơ sở dữ liệu',
    status: 'success',
    details: 'Backup_db_prod_20260726.bak',
  },
  {
    id: '9',
    time: '08:45',
    user: 'Phạm Thanh Thảo',
    action: 'Cập nhật banner khuyến mãi',
    status: 'success',
    details: 'Chương trình Ngày Vàng',
  },
  {
    id: '10',
    time: '08:15',
    user: 'Nguyễn Văn Anh',
    action: 'Khởi tạo chiến dịch SMS',
    status: 'failed',
    details: 'Lỗi kết nối cổng gửi tin SMS',
  },
];

export default function DemoDashboardPage() {
  const [activeMenu, setActiveMenu] = useState('activity');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const user = {
    name: 'Nguyễn Văn Anh',
    role: 'Quản trị viên',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
  };

  const sections = [
    {
      title: 'Hệ thống',
      items: [
        { id: 'activity', label: 'Hoạt động', icon: <LayoutDashboard size={18} /> },
        { id: 'billing', label: 'Tài khoản & Chi phí', icon: <Wallet size={18} /> },
        { id: 'reports', label: 'Báo cáo', icon: <FileText size={18} /> },
        { id: 'notifications', label: 'Thông báo', icon: <Bell size={18} />, badge: 4 },
      ],
    },
    {
      title: 'Ứng dụng liên kết',
      items: [
        { id: 'slack', label: 'Slack Channel', icon: <MessageSquare size={18} /> },
        { id: 'github', label: 'GitHub Repo', icon: <GitBranch size={18} /> },
      ],
    },
  ];

  // Fetcher giả lập lấy dữ liệu và phân trang
  const fetcher = async ({ offset, limit }: { offset: number; limit: number }) => {
    // Giả lập độ trễ mạng
    await new Promise((resolve) => setTimeout(resolve, 300));

    let filtered = mockActivities;
    if (searchQuery) {
      filtered = mockActivities.filter(
        (act) =>
          act.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
          act.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
          act.details.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    const paginated = filtered.slice(offset, offset + limit);

    return {
      items: paginated,
      meta: {
        total: filtered.length,
        offset,
        limit,
        next: offset + limit < filtered.length,
      },
    };
  };

  // Cấu hình các cột cho Desktop View
  const columns: ITableColumn<Activity>[] = [
    {
      key: 'time',
      label: 'Thời gian',
      minWidth: '100px',
      cell: (row) => <span className="font-medium text-slate-500">{row.time}</span>,
    },
    {
      key: 'user',
      label: 'Người thực hiện',
      minWidth: '160px',
      cell: (row) => <span className="font-semibold text-slate-800">{row.user}</span>,
    },
    {
      key: 'action',
      label: 'Hoạt động',
      minWidth: '220px',
      cell: (row) => <span className="text-slate-700 font-medium">{row.action}</span>,
    },
    {
      key: 'details',
      label: 'Chi tiết',
      minWidth: '260px',
      cell: (row) => <span className="text-xs">{row.details}</span>,
    },
    {
      key: 'status',
      label: 'Trạng thái',
      minWidth: '120px',
      cell: (row) => {
        const variantMap = {
          success: 'success' as const,
          warning: 'warning' as const,
          failed: 'danger' as const,
        };
        const labelMap = {
          success: 'Thành công',
          warning: 'Cảnh báo',
          failed: 'Thất bại',
        };
        return <Badge variant={variantMap[row.status]}>{labelMap[row.status]}</Badge>;
      },
    },
  ];

  // Giao diện Card cho Mobile View
  const renderCard = (row: Activity, index: number) => {
    const variantMap = {
      success: 'success' as const,
      warning: 'warning' as const,
      failed: 'danger' as const,
    };
    const labelMap = {
      success: 'Thành công',
      warning: 'Cảnh báo',
      failed: 'Thất bại',
    };
    return (
      <div
        key={row.id || index}
        className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col gap-2.5 shadow-xs"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-slate-800 text-sm">{row.user}</span>
          <span className="text-xs text-slate-400">{row.time}</span>
        </div>
        <div className="text-sm text-slate-700 font-medium">{row.action}</div>
        <div className="text-xs text-slate-500 font-mono bg-slate-50 p-2 rounded-lg border border-slate-100">
          {row.details}
        </div>
        <div className="flex justify-end">
          <Badge variant={variantMap[row.status]} size="sm">
            {labelMap[row.status]}
          </Badge>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen w-screen bg-white relative overflow-hidden">
      {/* 1. Sidebar hiển thị mặc định trên Desktop */}
      <Sidebar
        sections={sections}
        activeId={activeMenu}
        variant="light"
        className="hidden md:flex h-full rounded-none border-y-0 border-l-0 border-r border-slate-200 shadow-none bg-white shrink-0"
        onItemSelect={(item) => setActiveMenu(item.id)}
        user={user}
      />

      {/* 2. Sidebar trên Mobile */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMobileOpen(false)}
          />
          <Sidebar
            sections={sections}
            activeId={activeMenu}
            variant="light"
            className="relative h-full w-72 rounded-none border-y-0 border-l-0 border-r border-slate-200 shadow-2xl bg-white z-10 animate-in slide-in-from-left duration-300"
            onItemSelect={(item) => {
              setActiveMenu(item.id);
              setIsMobileOpen(false);
            }}
            user={user}
          />
        </div>
      )}

      {/* 3. Vùng hiển thị nội dung chính */}
      <div className="flex-1 h-full  flex flex-col min-w-0">
        <Header
          className="border-x-0 border-t-0 bg-white"
          title={
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileOpen(true)}
                className="md:hidden p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer shadow-xs"
              >
                <Menu size={18} />
              </button>
              <h1 className="text-xl md:text-2xl font-bold text-primary tracking-tight">
                Hoạt động trong ngày
              </h1>
            </div>
          }
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          notificationBadge={4}
          messageBadge={1}
        />

        {/* Nội dung chính của trang */}
        <div className="flex-1 p-4">
          {activeMenu === 'activity' ? (
            <div className="space-y-4">
              <div className="">
                <TableData<Activity>
                  queryKey={['today-activities', searchQuery]}
                  fetcher={fetcher}
                  columns={columns}
                  search={{
                    placeholder: 'Tìm kiếm hoạt động',
                    value: searchQuery,
                    onChange: (value) => {
                      setSearchQuery(value);
                    },
                  }}
                  renderCard={renderCard}
                  select={false}
                  syncToUrl={false}
                />
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-xs">
              <p className="text-slate-500">
                Trang đang chọn: <span className="font-semibold text-slate-700">{activeMenu}</span>
              </p>
              <p className="text-sm text-slate-400 mt-2">
                Nội dung của trang này đang được cập nhật.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
