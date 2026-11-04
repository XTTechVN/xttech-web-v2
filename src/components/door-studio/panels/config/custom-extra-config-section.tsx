'use client';

import React, { useMemo } from 'react';
import { DoorCustomExtraItem } from '../../studio-types';
import { ProfileBar } from '@/types';
import { Select } from '@/components/select';
import { Plus, X } from 'lucide-react';

interface CustomExtraConfigSectionProps {
  items?: DoorCustomExtraItem[];
  onChangeItems: (items: DoorCustomExtraItem[]) => void;
  profiles: ProfileBar[];
  target: 'frame' | 'sash';
}

export const CustomExtraConfigSection: React.FC<CustomExtraConfigSectionProps> = ({
  items = [],
  onChangeItems,
  profiles = [],
  target,
}) => {
  const handleAddItem = () => {
    const defaultProfile = profiles[0];
    const newItem: DoorCustomExtraItem = {
      id: `extra_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      profileId: defaultProfile?.id,
      profileCode: defaultProfile?.code,
      profileName: defaultProfile?.name || '',
      note: '',
      formulaLen: target === 'frame' ? 'W' : 'Hs',
      angle1: 90,
      angle2: 90,
      qty: 1,
      fixedQty: target === 'frame',
      target,
    };
    onChangeItems([...items, newItem]);
  };

  const handleUpdateItem = (id: string, updates: Partial<DoorCustomExtraItem>) => {
    onChangeItems(
      items.map((item) => {
        if (item.id !== id) return item;
        return { ...item, ...updates };
      })
    );
  };

  const handleProfileSelect = (id: string, profileId: number) => {
    const selected = profiles.find((p) => p.id === profileId);
    handleUpdateItem(id, {
      profileId,
      profileCode: selected?.code,
      profileName: selected?.name || '',
    });
  };

  const handleRemoveItem = (id: string) => {
    onChangeItems(items.filter((item) => item.id !== id));
  };

  const profileOptions = useMemo(
    () =>
      profiles.map((p) => ({
        value: p.id,
        label: `${p.code} · ${p.name}`,
      })),
    [profiles]
  );

  const targetTitle = target === 'frame' ? 'Khung' : 'Cánh';

  return (
    <div className="space-y-3 p-4 rounded-lg bg-white border border-slate-200 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
            3
          </span>
          <span className="font-semibold text-xs text-slate-900">
            Phụ kiện tùy biến — {targetTitle}
          </span>
          <span className="text-[11px] text-slate-400 font-normal">
            {target === 'sash'
              ? 'Ws, Hs = kích thước cánh; W0, H0 = kích thước tổng bộ cửa'
              : 'W, H = kích thước ô hiện tại; W0, H0 = kích thước tổng bộ cửa'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleAddItem}
          className="px-2.5 py-1 rounded-md bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
        >
          <Plus size={13} />
          <span>Thêm</span>
        </button>
      </div>

      {/* Danh sách các dòng phụ kiện tùy biến */}
      {items.length === 0 ? (
        <div className="text-[11px] text-slate-400 italic py-2 text-center bg-slate-50 rounded-md border border-dashed border-slate-200">
          Chưa có phụ kiện tùy biến / thanh phụ cho {targetTitle.toLowerCase()}. Nhấn &quot;+ Thêm&quot; để thiết lập ray U, ốp ray, nẹp phụ...
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((row) => (
            <div
              key={row.id}
              className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/40 hover:bg-slate-50/80 transition-colors"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center text-xs">
                {/* 1. Profile */}
                <div className="md:col-span-3 space-y-1">
                  <label className="text-[10px] text-slate-500 font-medium block">Profile:</label>
                  <Select
                    searchable
                    fullWidth
                    options={profileOptions}
                    value={row.profileId || ''}
                    placeholder="Chọn profile thanh phụ..."
                    onChange={(e) => handleProfileSelect(row.id, Number(e.target.value))}
                    className="h-7 text-xs md:text-xs py-0 pl-2 pr-7 border-slate-300 focus:border-amber-500"
                  />
                </div>

                {/* 2. Ghi chú */}
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] text-slate-500 font-medium block">Ghi chú:</label>
                  <input
                    type="text"
                    placeholder="Hs-40..."
                    value={row.note || ''}
                    onChange={(e) => handleUpdateItem(row.id, { note: e.target.value })}
                    className="w-full h-7 px-2 text-xs rounded border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* 3. Công thức dài */}
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] text-slate-500 font-medium block">Công thức dài:</label>
                  <input
                    type="text"
                    placeholder="vd: W-47.6, Hs"
                    value={row.formulaLen}
                    onChange={(e) => handleUpdateItem(row.id, { formulaLen: e.target.value })}
                    className="w-full h-7 px-2 text-xs font-mono font-bold rounded border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* 4. Số lượng (SL) */}
                <div className="md:col-span-1 space-y-1">
                  <label className="text-[10px] text-slate-500 font-medium block text-center">SL:</label>
                  <input
                    type="number"
                    min={1}
                    value={row.qty ?? 1}
                    onChange={(e) => handleUpdateItem(row.id, { qty: Math.max(1, Number(e.target.value) || 1) })}
                    className="w-full h-7 px-1 text-center text-xs font-semibold rounded border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* 5. Cách tính (Cố định/bộ) */}
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] text-slate-500 font-medium block text-center">Cách tính:</label>
                  <label className="h-7 flex items-center justify-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={row.fixedQty ?? (target === 'frame')}
                      onChange={(e) => handleUpdateItem(row.id, { fixedQty: e.target.checked })}
                      className="w-3.5 h-3.5 rounded text-primary accent-primary cursor-pointer"
                    />
                    <span className="text-[11px] text-slate-600">Cố định/bộ</span>
                  </label>
                </div>

                {/* 6. Góc T/P & Nút xóa */}
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] text-slate-500 font-medium block text-center">Góc T/P:</label>
                  <div className="flex items-center gap-1 justify-center">
                    <input
                      type="number"
                      value={row.angle1}
                      onChange={(e) => handleUpdateItem(row.id, { angle1: Number(e.target.value) || 90 })}
                      className="w-11 h-7 px-1 text-center text-xs font-semibold rounded border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-slate-400">/</span>
                    <input
                      type="number"
                      value={row.angle2}
                      onChange={(e) => handleUpdateItem(row.id, { angle2: Number(e.target.value) || 90 })}
                      className="w-11 h-7 px-1 text-center text-xs font-semibold rounded border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(row.id)}
                      title="Xóa phụ kiện tùy biến này"
                      className="w-6 h-7 rounded flex items-center justify-center text-red-500 hover:text-white hover:bg-red-500 transition-colors cursor-pointer shrink-0"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
