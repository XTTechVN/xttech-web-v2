'use client';

import React from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  FolderTree,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components';
import type { AccessoryCategory } from '@/types';

export type CategorySortField = 'sortOrder' | 'code' | 'name' | 'status';
export type CategorySortOrder = 'asc' | 'desc';

function SortIcon({ active, order }: { active: boolean; order: CategorySortOrder }) {
  if (!active) {
    return (
      <ArrowUpDown
        size={12}
        className="text-slate-300 group-hover/th:text-slate-500 transition-colors shrink-0"
      />
    );
  }
  return order === 'asc' ? (
    <ArrowUp size={12} className="text-primary font-bold shrink-0" />
  ) : (
    <ArrowDown size={12} className="text-primary font-bold shrink-0" />
  );
}

interface AccessoryCategoryTableProps {
  categories: AccessoryCategory[];
  selectedCategoryId?: number | null;
  isLoading: boolean;
  search: string;
  sortField: CategorySortField;
  sortOrder: CategorySortOrder;
  onSearchChange: (val: string) => void;
  onSort: (field: CategorySortField) => void;
  onSelect: (cat: AccessoryCategory) => void;
  onDelete: (cat: AccessoryCategory) => void;
  onAddNew: () => void;
}

export function AccessoryCategoryTable({
  categories,
  selectedCategoryId,
  isLoading,
  search,
  sortField,
  sortOrder,
  onSearchChange,
  onSort,
  onSelect,
  onDelete,
  onAddNew,
}: AccessoryCategoryTableProps) {
  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm mã hoặc tên danh mục..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:bg-white transition"
          />
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onAddNew}
          leftIcon={<Plus size={16} />}
          className="font-semibold text-xs sm:text-sm h-9 px-4 shrink-0"
        >
          Thêm mới
        </Button>
      </div>

      <div className="w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse select-none">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th
                  onClick={() => onSort('sortOrder')}
                  className="py-3 px-4 w-20 text-center cursor-pointer group/th hover:text-slate-800 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Thứ tự</span>
                    <SortIcon active={sortField === 'sortOrder'} order={sortOrder} />
                  </div>
                </th>
                <th
                  onClick={() => onSort('code')}
                  className="py-3 px-4 w-40 cursor-pointer group/th hover:text-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Mã danh mục</span>
                    <SortIcon active={sortField === 'code'} order={sortOrder} />
                  </div>
                </th>
                <th
                  onClick={() => onSort('name')}
                  className="py-3 px-4 min-w-[200px] cursor-pointer group/th hover:text-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Tên danh mục</span>
                    <SortIcon active={sortField === 'name'} order={sortOrder} />
                  </div>
                </th>
                <th className="py-3 px-4 min-w-[160px]">Mô tả / Ghi chú</th>
                <th
                  onClick={() => onSort('status')}
                  className="py-3 px-4 text-center w-28 cursor-pointer group/th hover:text-slate-800 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Trạng thái</span>
                    <SortIcon active={sortField === 'status'} order={sortOrder} />
                  </div>
                </th>
                <th className="py-3 px-4 text-right w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse border-b border-slate-100 last:border-b-0">
                    <td className="py-4 px-4 text-center">
                      <div className="w-6 h-4 bg-slate-100 rounded mx-auto" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-slate-100 rounded w-24" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-slate-100 rounded w-36" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-slate-100 rounded w-28" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-5 bg-slate-100 rounded w-16 mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="h-5 bg-slate-100 rounded w-12 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <FolderTree size={22} />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">
                        {search ? 'Không tìm thấy danh mục phù hợp' : 'Chưa có danh mục phụ kiện nào'}
                      </p>
                      <p className="text-xs text-slate-400">
                        Sử dụng form bên trái để tạo danh mục phụ kiện đầu tiên.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                categories.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  return (
                    <tr
                      key={cat.id}
                      onClick={() => onSelect(cat)}
                      className={`hover:bg-slate-50/80 transition-colors group border-b border-slate-100 last:border-b-0 cursor-pointer ${
                        isSelected ? 'bg-primary/5' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 font-bold text-xs text-slate-600">
                          {cat.sortOrder ?? 0}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-xs text-slate-800">
                        {cat.code}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 group-hover:text-primary transition-colors">
                          {cat.name}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500 max-w-xs truncate">
                        {cat.description || '—'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border whitespace-nowrap ${
                            cat.isActive !== false
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {cat.isActive !== false ? 'Hoạt động' : 'Tạm ngưng'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => onSelect(cat)}
                            className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md transition-colors cursor-pointer"
                            title="Chỉnh sửa danh mục"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(cat)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="Xóa danh mục"
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

