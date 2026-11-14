'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Store } from 'lucide-react';
import { getSupplierDoors, getWarehouseSuppliers } from '@/actions';
import { Input, Select } from '@/components';
import type { SupplierDoor } from '@/types';
import { getFileUrl } from '@/utils';

interface SupplierDoorCatalogGridProps {
  onSelectCatalogDoor: (door: SupplierDoor) => void;
  onSelectCustomDoor: () => void;
}

const resolveDoorImage = (door: SupplierDoor): string | null => {
  const path = door.images?.find((img) => img.isPrimary)?.imageUrl ?? door.images?.[0]?.imageUrl ?? door.imagePath;
  return path ? getFileUrl(path) : null;
};

export function SupplierDoorCatalogGrid({
  onSelectCatalogDoor,
  onSelectCustomDoor,
}: SupplierDoorCatalogGridProps) {
  const [search, setSearch] = useState('');
  const [supplierId, setSupplierId] = useState<string>('');

  const { data: suppliersData } = useQuery({
    queryKey: ['warehouse-suppliers', 'door_set'],
    queryFn: () => getWarehouseSuppliers({ supplier_type: 'door_set', is_active: true, limit: 200 }),
  });

  const { data: doorsData, isLoading } = useQuery({
    queryKey: ['supplier-doors-picker', search, supplierId],
    queryFn: () =>
      getSupplierDoors({
        search: search.trim() || undefined,
        supplierId: supplierId ? Number(supplierId) : undefined,
        isActive: true,
        limit: 100,
      }),
  });

  const suppliers = suppliersData?.items ?? [];
  const doors = doorsData?.items ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã, tên mẫu cửa nhà cung cấp..."
            className="pl-9"
          />
        </div>
        <div className="sm:w-64">
          <Select
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            options={[
              { value: '', label: 'Tất cả nhà cung cấp' },
              ...suppliers.map((s) => ({ value: String(s.id), label: s.name })),
            ]}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onSelectCustomDoor}
        className="group w-full p-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary flex items-center justify-between gap-3 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5 text-left">
          <div className="w-8 h-8 rounded-lg bg-white border border-primary/20 flex items-center justify-center shrink-0">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold">Nhập cửa NCC trực tiếp (không cần chọn catalog)</p>
            <p className="text-[11px] text-primary/80">Dùng khi cửa đặc thù hoặc chưa khai báo mẫu cố định</p>
          </div>
        </div>
        <span className="inline-flex h-9 px-3 items-center justify-center rounded-md bg-primary text-sm font-medium text-white shrink-0 group-hover:bg-primary/90 transition-colors">
          Tạo mới
        </span>
      </button>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-36 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : doors.length === 0 ? (
        <div className="py-12 text-center border border-slate-200 rounded-xl text-slate-400 text-xs space-y-1">
          <Store className="w-7 h-7 mx-auto text-slate-300" />
          <p>Chưa có mẫu cửa NCC nào phù hợp bộ lọc.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[52vh] overflow-y-auto pr-1">
          {doors.map((door) => {
            const imgUrl = resolveDoorImage(door);
            return (
              <button
                key={door.id}
                type="button"
                onClick={() => onSelectCatalogDoor(door)}
                className="text-left rounded-xl border border-slate-200 hover:border-primary hover:shadow-sm bg-white p-3 transition-all flex flex-col justify-between gap-2.5 cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center">
                    {imgUrl ? (
                      <img src={imgUrl} alt={door.name} className="w-full h-full object-cover" />
                    ) : (
                      <Store className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-mono text-[11px] font-semibold text-primary block truncate">
                      {door.code}
                    </span>
                    <p className="text-xs font-bold text-slate-900 line-clamp-2 mt-0.5 group-hover:text-primary">
                      {door.name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {door.supplier?.name || 'NCC cửa nguyên bộ'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                  <span className="text-slate-500">Giá tham khảo</span>
                  <span className="font-mono tabular-nums font-bold text-slate-900">
                    {new Intl.NumberFormat('vi-VN').format(door.referenceCostPerSqm || 0)} VNĐ/m²
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
