'use client';

import React from 'react';
import { DoorCustomExtraItem } from '../../studio-types';
import { ProfileBar } from '@/types';
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
      formulaLen: 'W',
      angle1: 90,
      angle2: 90,
      qty: 1,
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
            W, H = kích thước ô hiện tại; W0, H0 = kích thước tổng bộ cửa
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
                <div className="md:col-span-4 space-y-1">
                  <label className="text-[10px] text-slate-500 font-medium block">Profile:</label>
                  <select
                    value={row.profileId || ''}
                    onChange={(e) => handleProfileSelect(row.id, Number(e.target.value))}
                    className="w-full h-7 px-2 text-xs rounded border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Chọn profile thanh phụ...</option>
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} · {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Ghi chú */}
                <div className="md:col-span-3 space-y-1">
                  <label className="text-[10px] text-slate-500 font-medium block">Ghi chú:</label>
                  <input
                    type="text"
                    placeholder="Ghi chú..."
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
                    placeholder="vd: W-47.6"
                    value={row.formulaLen}
                    onChange={(e) => handleUpdateItem(row.id, { formulaLen: e.target.value })}
                    className="w-full h-7 px-2 text-xs font-mono font-bold rounded border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* 4. Góc T/P */}
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] text-slate-500 font-medium block text-center">Góc T/P:</label>
                  <div className="flex items-center gap-1 justify-center">
                    <input
                      type="number"
                      value={row.angle1}
                      onChange={(e) => handleUpdateItem(row.id, { angle1: Number(e.target.value) || 90 })}
                      className="w-12 h-7 px-1 text-center text-xs font-semibold rounded border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-slate-400">/</span>
                    <input
                      type="number"
                      value={row.angle2}
                      onChange={(e) => handleUpdateItem(row.id, { angle2: Number(e.target.value) || 90 })}
                      className="w-12 h-7 px-1 text-center text-xs font-semibold rounded border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* 5. Nút xóa */}
                <div className="md:col-span-1 flex justify-end items-end pt-4">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(row.id)}
                    title="Xóa phụ kiện tùy biến này"
                    className="w-7 h-7 rounded flex items-center justify-center text-red-500 hover:text-white hover:bg-red-500 transition-colors cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
