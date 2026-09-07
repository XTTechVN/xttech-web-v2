'use client';

import { useState, useMemo } from 'react';

// Icons trong lucide react
import { User, Pencil, Trash2, Eye, Plus, MapPin, FileSpreadsheet } from 'lucide-react';

// Thành phần dùng chung trong hệ thống
import { TableData, TableAction, ITableFilterProps } from '@/components';
import { Button } from '@/components';
import { useRouter } from 'next/navigation';

import { useQueryParam, usePermission } from '@/hooks';

import type { Customer } from '@/types';

import { getCustomerTypeLabel, getCustomerTypeColor, CUSTOMER_TYPE_OPTIONS } from '../config';

import { getCustomers, getUsers } from '@/actions';

import { useQuery } from '@tanstack/react-query';

import toast from 'react-hot-toast';


// Định nghĩa props cho component Table
interface TableProps {
  onEditClick: (customer: Customer) => void;
  onDeleteClick: (customer: Customer) => void;
  onAddClick: () => void;
  onExportClick?: () => void;
}

const Table = ({ onEditClick, onDeleteClick, onAddClick, onExportClick }: TableProps) => {

  const router = useRouter();
  const [search, setSearch] = useQueryParam('search');

  const [filterType, setFilterType] = useState<string | undefined>();
  const [filterStaffId, setFilterStaffId] = useState<string | undefined>();
  const { user, canViewAll } = usePermission();

  // Lấy danh sách nhân viên
  const { data: usersData } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: () => getUsers({ limit: 1000 }),
  });

  // Options cho filter loại khách hàng
  const typeOptions = useMemo(() => {
    return [{ label: 'Tất cả loại khách hàng', value: undefined }, ...CUSTOMER_TYPE_OPTIONS];
  }, []);

  // Options cho filter nhân viên phụ trách
  const staffOptions = useMemo(() => {
    const list = (usersData?.items || [])
      .filter((u: any) => u.roles?.some((r: any) => r.code === 'sale'))
      .map((u: any) => ({
        label: u.fullName || u.username || u.email,
        value: u.id,
      }));
    return [{ label: 'Tất cả nhân viên', value: undefined }, ...list];
  }, [usersData]);

  // Cấu hình các bộ lọc cho bảng khách hàng
  const tableFilters = useMemo(() => {
    // Mặc định luôn có bộ lọc "Loại khách hàng"
    const filters: ITableFilterProps[] = [
      {
        label: 'Loại khách hàng',
        value: filterType,
        options: typeOptions,
        onChange: (val: string | undefined) => setFilterType(val),
      },
    ];

    // Chỉ hiển thị bộ lọc "Nhân viên phụ trách" nếu user có quyền quản lý cấp cao
    if (canViewAll) {
      filters.push({
        label: 'Nhân viên phụ trách',
        value: filterStaffId,
        options: staffOptions,
        onChange: (val: string | undefined) => setFilterStaffId(val),
      });
    }

    return filters;
  }, [filterType, filterStaffId, typeOptions, staffOptions, canViewAll]);

  // Fetch dữ liệu bảng khách hàng
  const fetcher = async ({ offset, limit }: { offset: number; limit: number }) => {
    const staffId = !canViewAll && user ? user.id : (filterStaffId || undefined);

    const res = await getCustomers({
      offset,
      limit,
      search: search || undefined,
      staffId,
      type: filterType || undefined,
    });
    if (!res) {
      toast.error('Lỗi khi tải danh sách khách hàng');
      throw new Error('Lỗi khi tải danh sách khách hàng');
    }
    return res;
  };

  // Các cột trong bảng khách hàng (Tối ưu 5 cột gom nhóm thông minh)
  const columns = [
    {
      key: 'customer',
      label: 'Khách hàng',
      minWidth: '240px',
      cell: (row: Customer) => (
        <div className="flex flex-col gap-1 py-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 leading-tight">{row.name}</span>
            {row.type && (
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap leading-none ${getCustomerTypeColor(row.type)}`}
              >
                {getCustomerTypeLabel(row.type)}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400">
            {row.identifyCode ? `Mã: ${row.identifyCode}` : 'Chưa có mã ĐD'}
          </span>
        </div>
      ),
    },
    {
      key: 'contact',
      label: 'Liên hệ',
      minWidth: '180px',
      cell: (row: Customer) => (
        <div className="flex flex-col gap-0.5 py-1">
          <span className="text-sm font-medium text-gray-800">
            {row.phone || '—'}
          </span>
          {row.email && (
            <span className="text-xs text-gray-400 truncate max-w-45" title={row.email}>
              {row.email}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'address',
      label: 'Địa chỉ & Vị trí',
      minWidth: '220px',
      cell: (row: Customer) => {
        const hasCoordinates =
          row.latitude !== null &&
          row.latitude !== undefined &&
          row.longitude !== null &&
          row.longitude !== undefined;

        return (
          <div className="flex flex-col gap-1 py-1">
            <span className="text-sm text-gray-700 truncate max-w-55" title={row.address || ''}>
              {row.address || '—'}
            </span>
            {hasCoordinates && (
              <a
                href={`https://www.google.com/maps?q=${row.latitude},${row.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700 hover:underline w-fit"
              >
                <MapPin size={12} className="shrink-0" />
                <span>Xem vị trí Google Maps</span>
              </a>
            )}
          </div>
        );
      },
    },
    {
      key: 'staff',
      label: 'Phụ trách',
      minWidth: '160px',
      cell: (row: Customer) => {
        const staffName =
          usersData?.items?.find((u: any) => u.id === row.staffId)?.fullName ||
          (row as any).staff?.fullName ||
          (row as any).staff?.username ||
          row.staffId ||
          '—';
        return <span className="text-sm text-gray-700">{staffName}</span>;
      },
    },
    {
      key: 'actions',
      label: 'Hành động',
      minWidth: '120px',
      cell: (row: Customer) => (
        <TableAction
          onView={() => router.push(`/app/customers/${row.id}`)}
          onEdit={() => onEditClick(row)}
          onDelete={() => onDeleteClick(row)}
        />
      ),
    },
  ];

  //  Card dùng cho mobile
  const renderCard = (row: Customer, index: number) => (
    <div
      key={row.id || index}
      className="p-4 rounded-xl border border-primary/10 bg-white flex flex-col gap-3 shadow-xs hover:shadow-md hover:border-primary/20 transition-all duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-primary/5 text-primary border border-primary/10 shrink-0 mt-0.5">
          <User size={18} />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="font-semibold text-gray-900 wrap-break-word text-sm sm:text-base leading-snug">{row.name}</span>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-gray-400 font-medium">Code: {row.identifyCode || '—'}</span>
            {row.phone && <span className="text-xs text-gray-300 select-none">•</span>}
            {row.phone && <span className="text-xs text-gray-500 truncate">{row.phone}</span>}
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {row.type && <span className={`text-xs font-medium px-2 py-1 rounded- md border whitespace-nowrap ${getCustomerTypeColor(row.type)}`}>
              {getCustomerTypeLabel(row.type)}
            </span>}
            <span className="text-xs text-gray-500 font-medium ml-1">
              • Phụ trách: {usersData?.items?.find((u: any) => u.id === row.staffId)?.fullName || (row as any).staff?.fullName || (row as any).staff?.username || row.staffId || '—'}
            </span>
          </div>
          {row.images && row.images.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-500 font-medium">Đính kèm:</span>
              <div className="flex items-center gap-1">
                {row.images.slice(0, 3).map((img: any, idx: number) => {
                  const src = typeof img === 'string' ? img : img?.path || img?.url;
                  if (!src) return null;
                  return (
                    <div key={idx} className="w-6 h-6 rounded overflow-hidden border border-gray-200">
                      <img src={src} alt="img" className="w-full h-full object-cover" />
                    </div>
                  );
                })}
                {row.images.length > 3 && (
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">+{row.images.length - 3}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-gray-100/50 pt-2.5">
        <button
          type="button"
          onClick={() => router.push(`/app/customers/${row.id}`)}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Eye size={12} />
          Xem
        </button>
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

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center gap-2 w-full pr-2 pt-2">
        {onExportClick && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2.5 text-xs md:h-9 md:px-3 md:text-sm shrink-0 border-emerald-600 text-emerald-700 hover:bg-emerald-50"
            leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-600" />}
            onClick={onExportClick}
          >
            Xuất Excel
          </Button>
        )}
        <Button
          variant="primary"
          size="sm"
          className="h-7 px-2.5 text-xs md:h-9 md:px-3 md:text-sm shrink-0"
          leftIcon={<Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />}
          onClick={onAddClick}
        >
          Thêm khách hàng
        </Button>
      </div>

      <TableData<Customer>
        queryKey={['customers', search, filterType, filterStaffId]}
        fetcher={fetcher}
        columns={columns}
        filters={tableFilters}
        renderCard={renderCard}
        select={false}
        search={{
          placeholder: 'Tìm kiếm theo tên, SĐT, mã ĐD, email...',
          value: search,
          onChange: setSearch,
          className: 'w-80',
        }}
      />
    </div>
  );
};

export default Table;
