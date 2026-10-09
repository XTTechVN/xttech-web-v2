import React from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { TableData, TableAction } from '@/components/table';
import { Button, Badge } from '@/components';
import { useQueryParam, usePermission } from '@/hooks';
import type { Project, Customer, ProjectStatus } from '@/types';
import { getProjects } from '@/actions';
import { showErrorToast } from '@/utils';
import { PROJECT_STATUS_MAP, PROJECT_STATUS_OPTIONS } from '@/config';

interface TableProps {
  customers?: Pick<Customer, 'id' | 'name'>[];
  onViewClick?: (project: Project) => void;
  onEditClick: (project: Project) => void;
  onDeleteClick: (project: Project) => void;
  onAddClick: () => void;
}

const Table = ({ customers = [], onViewClick, onEditClick, onDeleteClick, onAddClick }: TableProps) => {
  const [search, setSearch] = useQueryParam('search');
  const [statusFilter, setStatusFilter] = useQueryParam('status');

  const { user, isSaleOnly } = usePermission();

  // Fetcher gọi thẳng action, không qua store
  const fetcher = async ({ offset, limit }: { offset: number; limit: number }) => {
    const params: any = {
      offset,
      limit,
      search: search || undefined,
      status: (statusFilter as ProjectStatus) || undefined,
    };
    if (isSaleOnly && user?.id) {
      params.userId = user.id;
    }
    try {
      const res = await getProjects(params);
      if (!res) {
        showErrorToast(null, 'Lỗi khi tải danh sách dự án');
        throw new Error('Lỗi khi tải danh sách dự án');
      }
      return res;
    } catch (err) {
      showErrorToast(err, 'Lỗi khi tải danh sách dự án');
      throw err;
    }
  };

  // Cấu hình các cột cho Desktop
  const columns = [
    {
      key: 'code',
      label: 'Mã DA',
      minWidth: '130px',
      cell: (row: Project) => (
        <span className="font-mono text-xs font-bold text-primary bg-primary/5 px-2 py-1 rounded">
          {row.code || `DA-${row.id}`}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Tên dự án',
      minWidth: '220px',
      cell: (row: Project) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 cursor-pointer hover:text-primary transition-colors" onClick={() => onViewClick?.(row)}>
            {row.name}
          </span>
          <span className="text-xs text-gray-400 mt-0.5">{row.address || 'Chưa có địa chỉ'}</span>
        </div>
      ),
    },
    {
      key: 'customer',
      label: 'Khách hàng',
      minWidth: '160px',
      cell: (row: Project) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-800">{row.customer?.name || '—'}</span>
          {row.customer?.phone && <span className="text-xs text-gray-400">{row.customer.phone}</span>}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      minWidth: '140px',
      cell: (row: Project) => {
        const mapped = PROJECT_STATUS_MAP[row.status] || { label: row.status, variant: 'default' };
        return (
          <Badge variant={mapped.variant} size="sm">
            {mapped.label}
          </Badge>
        );
      },
    },
    {
      key: 'metrics',
      label: 'Quy mô (Cửa / Diện tích / Nhôm)',
      minWidth: '200px',
      cell: (row: Project) => (
        <div className="flex flex-col text-xs text-gray-600 gap-0.5">
          <span>
            <strong>{row.totalPositions ?? 0}</strong> bộ cửa
          </span>
          <span className="text-gray-400">
            {(row.totalAreaM2 ?? 0).toFixed(2)} m2 • {(row.totalAluminumKg ?? 0).toFixed(1)} kg
          </span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Ngày tạo',
      minWidth: '130px',
      cell: (row: Project) => (
        <span className="text-gray-500 text-xs">
          {new Date(row.createdAt).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Hành động',
      minWidth: '120px',
      cell: (row: Project) => (
        <TableAction
          onView={() => onViewClick?.(row)}
          onEdit={() => onEditClick(row)}
          onDelete={() => onDeleteClick(row)}
        />
      ),
    },
  ];

  // Cấu hình Card hiển thị trên thiết bị di động
  const renderCard = (row: Project, index: number) => {
    const mapped = PROJECT_STATUS_MAP[row.status] || { label: row.status, variant: 'default' };
    return (
      <div
        key={row.id || index}
        onClick={() => onViewClick?.(row)}
        className="p-4 rounded-xl border border-primary/10 bg-white flex flex-col gap-3 shadow-xs hover:shadow-md hover:border-primary/20 transition-all duration-300 cursor-pointer"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[11px] font-bold text-primary bg-primary/5 px-1.5 py-0.5 rounded">
                {row.code || `DA-${row.id}`}
              </span>
              <Badge variant={mapped.variant} size="sm">
                {mapped.label}
              </Badge>
            </div>
            <span className="font-semibold text-gray-900 break-words text-sm leading-snug">{row.name}</span>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
              <span>{row.customer?.name || 'Khách vãng lai'}</span>
              {row.address && <span>• {row.address}</span>}
            </div>
            <div className="mt-2 text-xs text-gray-400">
              {row.totalPositions ?? 0} bộ cửa • {(row.totalAreaM2 ?? 0).toFixed(2)} m2
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-gray-100/50 pt-2.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => onEditClick(row)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary/5 text-primary border border-primary/10 hover:bg-primary/10 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Pencil size={12} />
            Sửa
          </button>
          <button
            type="button"
            onClick={() => onDeleteClick(row)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50/50 text-red-600 border border-red-100 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Trash2 size={12} />
            Xóa
          </button>
        </div>
      </div>
    );
  };


  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center w-full pr-2 pt-2">
        <Button
          variant="primary"
          size="sm"
          className="h-7 px-2.5 text-xs md:h-9 md:px-3 md:text-sm shrink-0"
          leftIcon={<Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />}
          onClick={onAddClick}
        >
          Thêm dự án
        </Button>
      </div>
      <TableData<Project>
        queryKey={['projects', search, statusFilter]}
        fetcher={fetcher}
        columns={columns}
        renderCard={renderCard}
        select={false}
        search={{
          placeholder: 'Tìm kiếm theo tên, mã DA, địa chỉ...',
          value: search,
          onChange: setSearch,
          className: 'w-80',
        }}
        filters={[
          {
            label: 'Trạng thái',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'Tất cả trạng thái', value: '' },
              ...PROJECT_STATUS_OPTIONS,
            ],
          },
        ]}

      />
    </div>
  );
};

export default Table;

