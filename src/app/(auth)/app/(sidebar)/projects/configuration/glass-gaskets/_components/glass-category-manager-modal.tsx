'use client';

import React from 'react';
import { Modal, Button } from '@/components';
import { Pencil, Trash2, Plus, Layers } from 'lucide-react';
import type { GlassCategory } from '@/types';
import { getCategoryMaterialType } from './glass-category-sidebar';

interface GlassCategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: GlassCategory[];
  onAddCategory: () => void;
  onEditCategory: (category: GlassCategory) => void;
  onDeleteCategory: (category: GlassCategory) => void;
}

export function GlassCategoryManagerModal({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}: GlassCategoryManagerModalProps) {
  // Tab hiện tại trong modal: 'glass' | 'panel' | 'screen_mesh'
  const [activeTab, setActiveTab] = React.useState<'glass' | 'panel' | 'screen_mesh'>('glass');

  // Lọc và sắp xếp category theo tab đang chọn (theo tên A-Z)
  const categoriesByTab = React.useMemo(() => {
    const list = categories.filter((c) => getCategoryMaterialType(c) === activeTab);
    return list.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'vi', { sensitivity: 'base' }));
  }, [categories, activeTab]);

  // Thống kê số lượng từng tab
  const counts = React.useMemo(() => {
    let glass = 0;
    let panel = 0;
    let screen_mesh = 0;
    categories.forEach((c) => {
      const t = getCategoryMaterialType(c);
      if (t === 'panel') panel++;
      else if (t === 'screen_mesh') screen_mesh++;
      else glass++;
    });
    return { glass, panel, screen_mesh };
  }, [categories]);

  const TABS: Array<{ id: 'glass' | 'panel' | 'screen_mesh'; label: string; count: number }> = [
    { id: 'glass', label: 'Kính', count: counts.glass },
    { id: 'panel', label: 'Tấm', count: counts.panel },
    { id: 'screen_mesh', label: 'Lưới', count: counts.screen_mesh },
  ];

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
      <div className="flex flex-col gap-3.5">
        {/* Thanh chuyển đổi 3 Tabs chính và nút Thêm */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${isActive
                      ? 'bg-white text-primary shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isActive ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-500'
                      }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

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
                <th className="py-2.5 px-3 w-12 text-center">STT</th>
                <th className="py-2.5 px-3 w-36">Mã nhóm</th>
                <th className="py-2.5 px-3">Tên nhóm chủng loại & Mô tả</th>
                <th className="py-2.5 px-3 w-24 text-center">Trạng thái</th>
                <th className="py-2.5 px-3 w-20 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categoriesByTab.map((cat, idx) => {
                return (
                  <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Cột STT */}
                    <td className="py-2.5 px-3 text-center font-bold text-slate-500">
                      {idx + 1}
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
                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${cat.isActive !== false
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

              {categoriesByTab.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                    Chưa có nhóm chủng loại nào trong tab này.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}
