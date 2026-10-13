'use client';

import React from 'react';
import { Layers, Package } from 'lucide-react';
import { Select } from '@/components';
import { WarehouseItemType, Brand, BrandColor, ProfileBar, Accessory } from '@/types';

interface ItemLibrarySelectorProps {
  itemType: WarehouseItemType;
  brands: Brand[];
  selectedBrandId?: number;
  onSelectBrandId: (id: number) => void;
  profiles: ProfileBar[];
  selectedProfileId?: number;
  onSelectProfileId: (id: number) => void;
  colors: BrandColor[];
  selectedColorId?: number;
  onSelectColorId: (id: number) => void;
  accessories: Accessory[];
  selectedAccessoryId?: number;
  onSelectAccessoryId: (id: number) => void;
}

export const ItemLibrarySelector: React.FC<ItemLibrarySelectorProps> = ({
  itemType,
  brands,
  selectedBrandId,
  onSelectBrandId,
  profiles,
  selectedProfileId,
  onSelectProfileId,
  colors,
  selectedColorId,
  onSelectColorId,
  accessories,
  selectedAccessoryId,
  onSelectAccessoryId,
}) => {
  if (itemType === 'profile') {
    return (
      <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-3">
        <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-xs uppercase tracking-wider">
          <Layers size={14} className="text-indigo-600" />
          Tra cứu Profile & Màu Hãng
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-slate-700 font-medium mb-1">1. Hãng nhôm</label>
            <Select
              value={selectedBrandId || ''}
              onChange={(e) => onSelectBrandId(Number(e.target.value))}
              options={brands.map((b) => ({ value: b.id, label: b.name }))}
            />
          </div>
          <div>
            <label className="block text-slate-700 font-medium mb-1">2. Thanh Profile</label>
            <Select
              value={selectedProfileId || ''}
              onChange={(e) => onSelectProfileId(Number(e.target.value))}
              options={profiles.map((p) => ({
                value: p.id,
                label: `[${p.code}] ${p.name} (${p.weightPerM || 0}kg/m)`,
              }))}
            />
          </div>
          <div>
            <label className="block text-slate-700 font-medium mb-1">3. Màu sắc</label>
            <Select
              value={selectedColorId || ''}
              onChange={(e) => onSelectColorId(Number(e.target.value))}
              options={colors.map((c) => ({
                value: c.id,
                label: `${c.name} ${c.isDefault ? '(Mặc định)' : ''}`,
              }))}
            />
          </div>
        </div>
      </div>
    );
  }

  if (itemType === 'accessory') {
    return (
      <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-2">
        <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs uppercase tracking-wider">
          <Package size={14} className="text-emerald-600" />
          Tra cứu Phụ Kiện Kim Khí
        </div>
        <div>
          <label className="block text-slate-700 font-medium mb-1">Chọn Phụ kiện</label>
          <Select
            value={selectedAccessoryId || ''}
            onChange={(e) => onSelectAccessoryId(Number(e.target.value))}
            options={accessories.map((a) => ({
              value: a.id,
              label: `[${a.code || 'ACC'}] ${a.name} (${(a.costPrice || a.unitPrice || 0).toLocaleString('vi-VN')}đ)`,
            }))}
          />
        </div>
      </div>
    );
  }

  return null;
};
