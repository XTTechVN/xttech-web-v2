'use client';

import React from 'react';

// Icons thư viện lucide-react
import * as LucideIcons from 'lucide-react';

// Thành phần dùng chung cho toàn bộ trang
import { TableData } from '@/components/table';
import { Heading } from '@/components';

// Kiểu dữ liệu phòng ban
import { Department } from '@/types';

// Store
import { useDapartmentStore } from '@/stores';

// toast
import toast from 'react-hot-toast';

// Component hiển thị Badge Icon đẹp mắt
const IconBadge = ({ iconName, color }: { iconName: string; color: string }) => {
  const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Building2;
  return (
    <div
      className="w-9 h-9 rounded-lg flex items-center justify-center border transition-all duration-200 hover:scale-105"
      style={{
        backgroundColor: `${color}15`,
        borderColor: `${color}30`,
        color: color,
      }}
    >
      <IconComponent size={18} />
    </div>
  );
};

const Table = () => {
  // Lấy action fetch danh sách phòng ban từ store
  const fetchDepartments = useDapartmentStore((state) => state.fetchDepartments);

  // Hàm fetcher gọi API thực tế từ Store
  const fetcher = async ({ offset, limit }: { offset: number; limit: number }) => {
    const res = await fetchDepartments({ offset, limit });
    if (!res) {
      toast.error('Lỗi khi tải danh sách phòng ban');
      throw new Error('Lỗi khi tải danh sách phòng ban');
    }
    toast.success('Tải danh sách phòng ban thành công');
    return res;
  };

  // Cấu hình các cột cho Desktop
  const columns = [
    {
      key: 'icon',
      label: 'Biểu tượng',
      minWidth: '100px',
      cell: (row: Department) => <IconBadge iconName={row.mainIcon} color={row.mainColor} />,
    },
    {
      key: 'name',
      label: 'Tên phòng ban',
      minWidth: '250px',
      cell: (row: Department) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{row.name}</span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Ngày tạo',
      minWidth: '180px',
      cell: (row: Department) => (
        <span className="text-gray-600 text-sm">
          {new Date(row.createdAt).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Hành động',
      minWidth: '150px',
      cell: (row: Department) => (
        <div className="flex gap-2">
          <button className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all border border-transparent hover:border-primary/10">
            <LucideIcons.Pencil size={18} />
          </button>

          <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100">
            <LucideIcons.Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  // Cấu hình Card hiển thị trên thiết bị di động
  const renderCard = (row: Department, index: number) => (
    <div
      key={row.id || index}
      className="p-4 rounded-xl border border-gray-150 bg-white flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-center gap-3">
        <IconBadge iconName={row.mainIcon} color={row.mainColor} />
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{row.name}</span>
          <span className="text-xs text-gray-400">ID: {row.id}</span>
          <span className="text-xs text-gray-500 mt-1">
            Ngày tạo:{' '}
            {new Date(row.createdAt).toLocaleDateString('vi-VN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })}
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => alert(`Sửa phòng ban: ${row.name}`)}
          className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all border border-transparent hover:border-primary/10"
        >
          <LucideIcons.Pencil size={18} />
        </button>

        <button
          onClick={() => alert(`Xóa phòng ban: ${row.name}`)}
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
        >
          <LucideIcons.Trash2 size={18} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      <Heading className="text-primary pr-2 pt-2 text-2xl" size="h1">
        Danh sách phòng ban
      </Heading>
      <TableData<Department> queryKey={['departments']} fetcher={fetcher} columns={columns} renderCard={renderCard} select={false} />
    </div>
  );
};

export default Table;
