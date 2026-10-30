'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  AlertTriangle,
  Plus,
  ShoppingCart,
  Layers,
  MapPin,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Button, Input, Select, Badge } from '@/components';
import { WarehouseItem } from '@/types';
import { WAREHOUSE_ITEM_TYPE_MAP } from '@/config';
import { toDisplayUnit } from '../_utils/unit-mapping';

interface StockTabProps {
  items: WarehouseItem[];
  loading: boolean;
  onOpenAddItem: () => void;
  onOpenShortageChecker: () => void;
  onEditItem?: (item: WarehouseItem) => void;
  onDeleteItem?: (item: WarehouseItem) => void;
}

export function StockTab({
  items,
  loading,
  onOpenAddItem,
  onOpenShortageChecker,
  onEditItem,
  onDeleteItem,
}: StockTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [onlyLowStock, setOnlyLowStock] = useState<boolean>(false);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchType = selectedType === 'all' || item.itemType === selectedType;
      const matchLowStock = !onlyLowStock || item.isLowStock || item.availableStock <= item.minStockLevel;

      return matchSearch && matchType && matchLowStock;
    });
  }, [items, searchTerm, selectedType, onlyLowStock]);

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
              placeholder="Tìm theo mã, tên, vị trí..."
              className="pl-9 text-xs"
            />
          </div>

          <div className="w-full sm:w-56">
            <Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              options={[
                { value: 'all', label: 'Tất cả phân loại' },
                ...Object.entries(WAREHOUSE_ITEM_TYPE_MAP).map(([k, label]) => ({
                  value: k,
                  label,
                })),
              ]}
              className="text-xs"
            />
          </div>

          <button
            type="button"
            onClick={() => setOnlyLowStock(!onlyLowStock)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              onlyLowStock
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle size={14} className={onlyLowStock ? 'text-red-600' : 'text-slate-400'} />
            Chỉ hiện sắp hết hàng
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenShortageChecker}
            leftIcon={<AlertTriangle size={14} />}
            className="text-xs text-amber-700 border-amber-300 hover:bg-amber-50"
          >
            Kiểm tra thiếu hụt JIT
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenAddItem}
            leftIcon={<Plus size={14} />}
            className="text-xs"
          >
            Thêm Vật Tư Mới
          </Button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3 w-28">Mã VT</th>
                <th className="p-3 min-w-[180px]">Tên Quy Cách Vật Tư</th>
                <th className="p-3">Hãng</th>
                <th className="p-3">Màu sắc</th>
                <th className="p-3">Phân loại</th>
                <th className="p-3 text-center">ĐVT</th>
                <th className="p-3 text-right">Tồn thực tế</th>
                <th className="p-3 text-right text-amber-600">Đã giữ chỗ</th>
                <th className="p-3 text-right font-bold text-indigo-700">Khả dụng</th>
                <th className="p-3 text-right">Định mức an toàn</th>
                <th className="p-3 text-right">Giá vốn (đ)</th>
                <th className="p-3">Vị trí kho</th>
                <th className="p-3 text-center">Trạng thái</th>
                <th className="p-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={14} className="p-8 text-center text-slate-400">
                    Đang tải dữ liệu tồn kho...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={14} className="p-8 text-center text-slate-400">
                    Không tìm thấy mặt hàng nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isLow = item.isLowStock || item.availableStock <= item.minStockLevel;
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isLow ? 'bg-red-50/20' : ''
                      }`}
                    >
                      <td className="p-3 font-mono font-medium text-slate-900">
                        {item.itemCode}
                      </td>
                      <td className="p-3 font-medium text-slate-800">
                        <div>{item.itemName}</div>
                        {item.standardLengthMm > 0 && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Dài tiêu chuẩn: {item.standardLengthMm}mm (6.0m)
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        {item.brandName ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 whitespace-nowrap">
                            {item.brandName}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="p-3">
                        {item.colorName ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap">
                            {item.colorName}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-600">
                        <span className="px-2 py-0.5 rounded-full text-[11px] bg-slate-100 font-medium text-slate-700 whitespace-nowrap">
                          {WAREHOUSE_ITEM_TYPE_MAP[item.itemType] || item.itemType}
                        </span>
                      </td>
                      <td className="p-3 text-center font-medium whitespace-nowrap">
                        {toDisplayUnit(item.unit)}
                      </td>
                      <td className="p-3 text-right font-semibold text-slate-800">
                        {item.currentStock.toLocaleString('vi-VN')}
                      </td>
                      <td className="p-3 text-right font-medium text-amber-600">
                        {item.reservedQty.toLocaleString('vi-VN')}
                      </td>
                      <td className="p-3 text-right font-bold text-indigo-700 bg-indigo-50/20">
                        {item.availableStock.toLocaleString('vi-VN')}
                      </td>
                      <td className="p-3 text-right text-slate-500">
                        {item.minStockLevel.toLocaleString('vi-VN')}
                      </td>
                      <td className="p-3 text-right text-slate-600">
                        {item.costPrice.toLocaleString('vi-VN')}
                      </td>
                      <td className="p-3 text-slate-500">
                        {item.location ? (
                          <span className="flex items-center gap-1">
                            <MapPin size={12} className="text-slate-400" />
                            {item.location}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-700">
                            <AlertTriangle size={11} />
                            Sắp hết hàng
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-700">
                            Đủ tồn kho
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEditItem?.(item)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                            title="Chỉnh sửa thông tin cơ bản"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteItem?.(item)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Xóa mặt hàng khỏi kho"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
