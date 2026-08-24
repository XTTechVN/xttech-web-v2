'use client';

import { User, Pencil, Trash2, Eye } from 'lucide-react';

import { TableData, TableAction } from '@/components/table';

import { Button } from '@/components';
import { Plus } from 'lucide-react';
import { useQueryParam } from '@/hooks';
import type { Customer } from '@/types';
import { getCustomerTypeLabel, getCustomerTypeColor } from '../config';
import { getCustomers, getUsers } from '@/actions';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores';

interface TableProps {
  onEditClick: (customer: Customer) => void;
  onDeleteClick: (customer: Customer) => void;
  onAddClick: () => void;
}

const Table = ({ onEditClick, onDeleteClick, onAddClick }: TableProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const offset = Number(searchParams.get('offset') || 0);
  const [search, setSearch] = useQueryParam('search');
  const user = useAuthStore((state) => state.user);

  const { data: usersData } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: () => getUsers({ limit: 1000 }),
  });

  const fetcher = async ({ offset, limit }: { offset: number; limit: number }) => {
    const hasFullViewRole = user?.roles?.some((role) => ['admin', 'super', 'hr'].includes(role.code || ''));
    const staffId = !hasFullViewRole && user ? user.id : undefined;

    const res = await getCustomers({ offset, limit, search: search || undefined, staffId });
    if (!res) {
      toast.error('Lỗi khi tải danh sách khách hàng');
      throw new Error('Lỗi khi tải danh sách khách hàng');
    }
    return res;
  };

  // Các cột trong bảng khách hàng
  const columns = [
    {
      key: 'name',
      label: 'Tên khách hàng',
      minWidth: '220px',
      cell: (row: Customer) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/5 text-primary">
            <User size={16} />
          </div>
          <span className="font-semibold text-gray-900">{row.name}</span>
        </div>
      ),
    },
    {
      key: 'identifyCode',
      label: 'Mã định danh',
      minWidth: '150px',
      cell: (row: Customer) => <span className="text-gray-600 text-sm">{row.identifyCode || '—'}</span>,
    },
    {
      key: 'phone',
      label: 'Số điện thoại',
      minWidth: '150px',
      cell: (row: Customer) => <span className="text-gray-65 text-sm">{row.phone || '—'}</span>,
    },
    {
      key: 'email',
      label: 'Email',
      minWidth: '200px',
      cell: (row: Customer) => <span className="text-gray-500 text-sm">{row.email || '—'}</span>,
    },
    {
      key: 'address',
      label: 'Địa chỉ',
      minWidth: '200px',
      cell: (row: Customer) => <span className="text-gray-500 text-sm truncate max-w-50 block">{row.address || '—'}</span>,
    },
    {
      key: 'staff',
      label: 'Nhân viên phụ trách',
      minWidth: '180px',
      cell: (row: Customer) => {
        const staffName = usersData?.items?.find((u: any) => u.id === row.staffId)?.fullName || (row as any).staff?.fullName || (row as any).staff?.username || row.staffId || '—';
        return <span className="text-gray-600 text-sm">{staffName}</span>;
      },
    },
    {
      key: 'type',
      label: 'Loại KH',
      minWidth: '120px',
      cell: (row: Customer) => {
        return (
          <span className={`text-xs font-medium px-2 py-1 rounded-md border whitespace-nowrap ${getCustomerTypeColor(row.type)}`}>
            {getCustomerTypeLabel(row.type)}
          </span>
        );
      },
    },

    {
      key: 'actions',
      label: 'Hành động',
      minWidth: '120px',
      cell: (row: Customer) => (
        <TableAction
          onView={() => router.push(`/app/customers/${row.id}/customer-logs`)}
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
          onClick={() => router.push(`/app/customers/${row.id}/customer-logs`)}
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
      <div className="flex justify-end items-center w-full pr-2 pt-2">
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
        queryKey={['customers', search, offset]}
        fetcher={fetcher}
        columns={columns}
        renderCard={renderCard}
        select={false}
        search={{
          placeholder: 'Tìm kiếm khách hàng...',
          value: search,
          onChange: setSearch,
          className: 'w-80',
        }}
      />
    </div>
  );
};

export default Table;
