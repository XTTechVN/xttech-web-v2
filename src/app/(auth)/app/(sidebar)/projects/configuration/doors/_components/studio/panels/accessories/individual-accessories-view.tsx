'use client';

import React, { useState, useMemo } from 'react';
import { Accessory, SelectedAccessoryItem } from '@/types';
import { ACCESSORY_UNIT_CONFIG } from '@/types/accessory';
import { Search, Plus, Minus, Package } from 'lucide-react';

interface IndividualAccessoriesViewProps {
  accessories: Accessory[];
  selectedAccessories: SelectedAccessoryItem[];
  onUpdateAccessoryQty: (accessoryId: number, delta: number) => void;
  onSetAccessoryQty: (accessoryId: number, qty: number) => void;
}

export const IndividualAccessoriesView: React.FC<IndividualAccessoriesViewProps> = ({
  accessories,
  selectedAccessories,
  onUpdateAccessoryQty,
  onSetAccessoryQty,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const selectedMap = useMemo(() => {
    const map = new Map<number, number>();
    for (const item of selectedAccessories) {
      map.set(item.accessoryId, item.quantity);
    }
    return map;
  }, [selectedAccessories]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    accessories.forEach((a) => {
      if (a.category?.name) set.add(a.category.name);
    });
    return Array.from(set);
  }, [accessories]);

  const filtered = useMemo(() => {
    return accessories.filter((a) => {
      if (selectedCategory !== 'all' && a.category?.name !== selectedCategory) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = a.name.toLowerCase().includes(q);
        const matchCode = a.code ? a.code.toLowerCase().includes(q) : false;
        const matchSpec = a.specification ? a.specification.toLowerCase().includes(q) : false;
        if (!matchName && !matchCode && !matchSpec) return false;
      }
      return true;
    });
  }, [accessories, selectedCategory, search]);

  return (
    <div className="space-y-3">
      {/* Search & Categories */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm phụ kiện theo tên, mã (bản lề, khóa, ke góc, chốt...)"
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {categories.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto max-h-72 overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[500px]">
            <thead className="sticky top-0 bg-gray-50/90 backdrop-blur-xs z-10">
              <tr className="border-b border-gray-200 text-gray-500 font-semibold text-[11px]">
                <th className="py-2 px-3">Mã & Tên phụ kiện</th>
                <th className="py-2 px-2">Phân loại</th>
                <th className="py-2 px-2 text-center">ĐVT</th>
                <th className="py-2 px-2 text-right">Đơn giá</th>
                <th className="py-2 px-3 text-center w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filtered.map((acc) => {
                const qty = selectedMap.get(acc.id) || 0;
                const isSelected = qty > 0;
                const price = acc.salePrice || acc.retailPrice || acc.costPrice || 0;
                const unitCfg = acc.unit ? ACCESSORY_UNIT_CONFIG[acc.unit] : null;

                return (
                  <tr
                    key={acc.id}
                    className={`transition-colors ${
                      isSelected ? 'bg-blue-50/30 hover:bg-blue-50/50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="py-2 px-3">
                      <div className="font-semibold text-gray-900">{acc.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {acc.code || '---'} {acc.specification && `| ${acc.specification}`}
                      </div>
                    </td>
                    <td className="py-2 px-2 text-[11px] text-gray-500">
                      {acc.category?.name || 'Phụ kiện lẻ'}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-mono">
                        {unitCfg ? unitCfg.label : acc.unit || 'Cái'}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right font-mono font-semibold text-gray-900">
                      {price > 0 ? `${price.toLocaleString('vi-VN')} đ` : '-'}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {isSelected ? (
                        <div className="inline-flex items-center gap-1 border border-blue-300 rounded-lg p-0.5 bg-white">
                          <button
                            type="button"
                            onClick={() => onUpdateAccessoryQty(acc.id, -1)}
                            className="w-5 h-5 rounded flex items-center justify-center hover:bg-gray-100 text-gray-700 cursor-pointer"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="w-6 text-center font-bold font-mono text-xs text-blue-700">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateAccessoryQty(acc.id, 1)}
                            className="w-5 h-5 rounded flex items-center justify-center hover:bg-gray-100 text-blue-700 cursor-pointer"
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onUpdateAccessoryQty(acc.id, 1)}
                          className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-amber-500 hover:text-white text-gray-700 font-semibold text-[11px] transition-all cursor-pointer flex items-center gap-1 mx-auto"
                        >
                          <Plus size={11} />
                          <span>Thêm</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-8 text-center text-gray-400 space-y-1">
            <Package size={24} className="mx-auto text-gray-300" />
            <p className="text-xs">Không tìm thấy phụ kiện nào phù hợp</p>
          </div>
        )}
      </div>
    </div>
  );
};
