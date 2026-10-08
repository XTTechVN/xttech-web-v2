'use client';

import React from 'react';
import { Modal, Button } from '@/components';
import { ArrowUp, ArrowDown, Pencil, Trash2, Plus, Layers } from 'lucide-react';
import type { GlassCategory } from '@/types';

interface GlassCategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: GlassCategory[];
  onAddCategory: () => void;
  onEditCategory: (category: GlassCategory) => void;
  onDeleteCategory: (category: GlassCategory) => void;
  onSwapOrder: (current: GlassCategory, target: GlassCategory) => void;
  isSwapping?: boolean;
}

export function GlassCategoryManagerModal({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onSwapOrder,
  isSwapping = false,
}: GlassCategoryManagerModalProps) {
  const sortedCategories = [...categories].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quản lý Nhóm chủng loại vật tư tấm"
      size="lg"
      footer={
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <p className="text-xs text-slate-500">
            Sắp xếp thứ tự ưu tiên hoặc chỉnh sửa định danh các nhóm quy cách kính, panel, lưới muỗi.
          </p>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={onAddCategory}
          >
            Thêm nhóm mới
          </Button>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-hidden max-h-[460px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold sticky top-0 z-1">
              <tr>
                <th className="py-2.5 px-3 w-16 text-center">Thứ tự</th>
                <th className="py-2.5 px-3 w-32">Mã nhóm</th>
                <th className="py-2.5 px-3">Tên nhóm chủng loại & Mô tả</th>
                <th className="py-2.5 px-3 w-28 text-center">Trạng thái</th>
                <th className="py-2.5 px-3 w-24 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedCategories.map((cat, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === sortedCategories.length - 1;

                return (
                  <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Cột Thứ tự */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="font-bold text-slate-700">#{idx + 1}</span>
                        <div className="flex flex-col ml-1">
                          <button
                            type="button"
                            disabled={isFirst || isSwapping}
                            onClick={() => onSwapOrder(cat, sortedCategories[idx - 1])}
                            className={`p-0.5 rounded transition cursor-pointer ${
                              isFirst || isSwapping
                                ? 'text-slate-200 cursor-not-allowed'
                                : 'text-slate-500 hover:text-primary hover:bg-slate-100'
                            }`}
                            title="Di chuyển lên trên"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            type="button"
                            disabled={isLast || isSwapping}
                            onClick={() => onSwapOrder(cat, sortedCategories[idx + 1])}
                            className={`p-0.5 rounded transition cursor-pointer ${
                              isLast || isSwapping
                                ? 'text-slate-200 cursor-not-allowed'
                                : 'text-slate-500 hover:text-primary hover:bg-slate-100'
                            }`}
                            title="Di chuyển xuống dưới"
                          >
                            <ArrowDown size={12} />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Cột Mã nhóm */}
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                      {cat.code}
                    </td>

                    {/* Cột Tên nhóm & Mô tả */}
                    <td className="py-2.5 px-3">
                      <div>
                        <span className="font-semibold text-slate-900">{cat.name}</span>
                        {cat.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-1">{cat.description}</p>
                        )}
                      </div>
                    </td>

                    {/* Cột Trạng thái */}
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          cat.isActive !== false
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {cat.isActive !== false ? 'Áp dụng' : 'Khóa'}
                      </span>
                    </td>

                    {/* Cột Thao tác */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onEditCategory(cat)}
                          className="p-1 text-slate-400 hover:text-primary hover:bg-primary/10 rounded transition cursor-pointer"
                          title="Sửa nhóm"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteCategory(cat)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                          title="Xóa nhóm"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}
