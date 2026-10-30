'use client';

import React, { useState, useMemo } from 'react';
import { Plus, Search, Phone, User, MapPin, Eye, Edit2, Trash2 } from 'lucide-react';
import { Button, Input, Select, type SelectOption } from '@/components';
import { WarehouseSupplier } from '@/types';
import { SUPPLIER_TYPE_MAP } from '@/config';

interface SuppliersTabProps {
  suppliers: WarehouseSupplier[];
  loading: boolean;
  onOpenAddSupplier: () => void;
  onEditSupplier: (supplier: WarehouseSupplier) => void;
  onDeleteSupplier: (supplier: WarehouseSupplier) => void;
  onViewSupplierDetail: (supplier: WarehouseSupplier) => void;
}

const SUPPLIER_FILTER_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'Tất cả loại đối tác' },
  ...Object.entries(SUPPLIER_TYPE_MAP).map(([key, label]) => ({
    value: key,
    label,
  })),
];

export function SuppliersTab({
  suppliers,
  loading,
  onOpenAddSupplier,
  onEditSupplier,
  onDeleteSupplier,
  onViewSupplierDetail,
}: SuppliersTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone.includes(searchTerm) ||
        (s.contactName && s.contactName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchType = filterType === 'all' || s.supplierType === filterType;
      return matchSearch && matchType;
    });
  }, [suppliers, searchTerm, filterType]);

  return (
    <div className="space-y-4">
      {/* Control bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, điện thoại, người liên hệ..."
              className="pl-9 text-xs"
            />
          </div>

          <div className="w-full sm:w-60">
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              options={SUPPLIER_FILTER_OPTIONS}
              className="text-xs"
            />
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onOpenAddSupplier}
          leftIcon={<Plus size={14} />}
          className="text-xs shrink-0"
        >
          Thêm Nhà Cung Cấp
        </Button>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3 w-28">Mã NCC</th>
                <th className="p-3 min-w-[200px]">Tên Nhà Cung Cấp</th>
                <th className="p-3">Phân Loại Cung Ứng</th>
                <th className="p-3">Số Điện Thoại</th>
                <th className="p-3">Người Liên Hệ</th>
                <th className="p-3">Mã Số Thuế</th>
                <th className="p-3 min-w-[180px]">Địa Chỉ Kho Xưởng</th>
                <th className="p-3 text-center">Trạng Thái</th>
                <th className="p-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    Đang tải danh bạ nhà cung cấp...
                  </td>
                </tr>
              ) : filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    Không tìm thấy nhà cung cấp nào.
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-mono font-medium text-slate-900">
                      {s.code}
                    </td>
                    <td className="p-3 font-semibold text-slate-800">
                      <div>{s.name}</div>
                      {s.bankAccount && (
                        <div className="text-[11px] font-normal text-slate-400 mt-0.5">
                          STK: {s.bankAccount}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-700">
                        {SUPPLIER_TYPE_MAP[s.supplierType] || s.supplierType}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-slate-800">
                      <span className="flex items-center gap-1.5">
                        <Phone size={12} className="text-slate-400" />
                        {s.phone}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">
                      {s.contactName ? (
                        <span className="flex items-center gap-1.5">
                          <User size={12} className="text-slate-400" />
                          {s.contactName}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-3 font-mono text-slate-600">
                      {s.taxCode || '-'}
                    </td>
                    <td className="p-3 text-slate-500">
                      {s.address ? (
                        <span className="flex items-start gap-1">
                          <MapPin size={12} className="text-slate-400 mt-0.5 shrink-0" />
                          <span>{s.address}</span>
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {s.isActive ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-700">
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
                          Ngừng liên kết
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onViewSupplierDetail(s)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          title="Xem mặt hàng & lịch sử nhập mua"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditSupplier(s)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                          title="Chỉnh sửa thông tin NCC"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteSupplier(s)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Xóa nhà cung cấp"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
