'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Edit2, Plus, Store, Trash2 } from 'lucide-react';
import { getSupplierDoors, getWarehouseSuppliers } from '@/actions';
import { Badge, Button } from '@/components';
import { type ITableColumn, type ITableFilterProps, TableData } from '@/components/table';
import type { SupplierDoor } from '@/types';
import { getFileUrl } from '@/utils';
import {
  getSupplierDoorTypeLabel,
  SUPPLIER_DOOR_STATUS_FILTER_OPTIONS,
} from '../_constants/supplier-doors.constants';

interface SupplierDoorTableProps {
  onCreateClick: () => void;
  onEditClick: (door: SupplierDoor) => void;
  onDeleteClick: (door: SupplierDoor) => void;
}

const formatCostPerSqm = (value: number): string =>
  `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(value || 0)} VNĐ/m²`;

const resolvePrimaryImage = (door: SupplierDoor): string | null => {
  const primary = door.images?.find((img) => img.isPrimary)?.imageUrl ?? door.images?.[0]?.imageUrl ?? door.imagePath;
  return primary ? getFileUrl(primary) : null;
};

export function SupplierDoorTable({
  onCreateClick,
  onEditClick,
  onDeleteClick,
}: SupplierDoorTableProps) {
  const [search, setSearch] = useState('');
  const [supplierFilter, setSupplierFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const { data: suppliersData } = useQuery({
    queryKey: ['warehouse-suppliers', 'door_set'],
    queryFn: () => getWarehouseSuppliers({ supplier_type: 'door_set', limit: 200 }),
  });

  const filters: ITableFilterProps[] = useMemo(
    () => [
      {
        label: 'Nhà cung cấp',
        value: supplierFilter,
        onChange: setSupplierFilter,
        options: [
          { value: undefined, label: 'Tất cả NCC' },
          ...(suppliersData?.items ?? []).map((s) => ({
            value: String(s.id),
            label: s.name,
          })),
        ],
      },
      {
        label: 'Trạng thái',
        value: statusFilter,
        onChange: setStatusFilter,
        options: SUPPLIER_DOOR_STATUS_FILTER_OPTIONS,
      },
    ],
    [supplierFilter, statusFilter, suppliersData?.items],
  );

  const fetcher = async ({ offset, limit }: { offset: number; limit: number }) =>
    getSupplierDoors({
      offset,
      limit,
      search: search.trim() || undefined,
      supplierId: supplierFilter ? Number(supplierFilter) : undefined,
      isActive: statusFilter === undefined ? undefined : statusFilter === 'true',
    });

  const columns: ITableColumn<SupplierDoor>[] = [
    {
      key: 'preview',
      label: 'Ảnh & Mã mẫu',
      minWidth: '180px',
      cell: (row) => {
        const imgUrl = resolvePrimaryImage(row);
        return (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center">
              {imgUrl ? (
                <img src={imgUrl} alt={row.name} className="w-full h-full object-cover" />
              ) : (
                <Store className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-mono text-xs font-semibold text-primary truncate">{row.code}</p>
              <p className="text-xs text-slate-500 truncate">{getSupplierDoorTypeLabel(row.doorType)}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'name',
      label: 'Tên mẫu cửa & Quy cách',
      minWidth: '240px',
      cell: (row) => (
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{row.name}</p>
          {row.specification && (
            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{row.specification}</p>
          )}
        </div>
      ),
    },
    {
      key: 'supplier',
      label: 'Nhà cung cấp',
      minWidth: '180px',
      cell: (row) => (
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-800 truncate">{row.supplier?.name || '—'}</p>
          {row.supplier?.phone && <p className="text-xs text-slate-500 font-mono">{row.supplier.phone}</p>}
        </div>
      ),
    },
    {
      key: 'referenceCostPerSqm',
      label: 'Đơn giá tham khảo',
      minWidth: '150px',
      cell: (row) => (
        <div className="font-mono tabular-nums text-right font-semibold text-slate-900">
          {formatCostPerSqm(row.referenceCostPerSqm)}
        </div>
      ),
    },
    {
      key: 'isActive',
      label: 'Trạng thái',
      minWidth: '120px',
      cell: (row) => (
        <Badge variant={row.isActive ? 'success' : 'default'}>
          {row.isActive ? 'Đang sử dụng' : 'Tạm ngưng'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      minWidth: '110px',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEditClick(row)}
            aria-label={`Sửa ${row.code}`}
          >
            <Edit2 className="w-4 h-4 text-slate-600" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDeleteClick(row)}
            aria-label={`Xóa ${row.code}`}
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
          </Button>
        </div>
      ),
    },
  ];

  const renderCard = (row: SupplierDoor) => {
    const imgUrl = resolvePrimaryImage(row);
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2.5 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="w-14 h-14 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center">
            {imgUrl ? (
              <img src={imgUrl} alt={row.name} className="w-full h-full object-cover" />
            ) : (
              <Store className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs font-semibold text-primary">{row.code}</span>
              <Badge variant={row.isActive ? 'success' : 'default'}>
                {row.isActive ? 'Đang sử dụng' : 'Tạm ngưng'}
              </Badge>
            </div>
            <p className="text-sm font-semibold text-slate-900 truncate mt-0.5">{row.name}</p>
            <p className="text-xs text-slate-500 truncate">{row.supplier?.name || 'Chưa rõ NCC'}</p>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="font-mono tabular-nums text-xs font-semibold text-slate-900">
            {formatCostPerSqm(row.referenceCostPerSqm)}
          </span>
          <div className="flex items-center gap-1">
            <Button type="button" variant="outline" size="sm" onClick={() => onEditClick(row)}>
              Sửa
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => onDeleteClick(row)}>
              <Trash2 className="w-4 h-4 text-rose-600" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <TableData<SupplierDoor>
      queryKey={['supplier-doors', search, supplierFilter, statusFilter]}
      fetcher={fetcher}
      columns={columns}
      renderCard={renderCard}
      filters={filters}
      search={{
        placeholder: 'Tìm theo mã, tên mẫu cửa NCC...',
        value: search,
        onChange: setSearch,
        className: 'w-72',
      }}
      actions={
        <Button type="button" variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={onCreateClick}>
          Thêm mẫu cửa NCC
        </Button>
      }
      mobileActions={{
        primary: (
          <Button type="button" variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={onCreateClick}>
            Thêm mẫu NCC
          </Button>
        ),
      }}
    />
  );
}
