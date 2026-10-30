'use client';

import React, { useState, useEffect } from 'react';
import { DoorGasketConfigItem, GasketMeasureType } from '../../studio-types';
import { getGaskets } from '@/actions/gasket';
import { Gasket } from '@/types';
import { Plus, X } from 'lucide-react';

interface GasketConfigSectionProps {
  items?: DoorGasketConfigItem[];
  onChangeItems: (items: DoorGasketConfigItem[]) => void;
  target: 'frame' | 'sash';
}

const MEASURE_OPTIONS: { id: GasketMeasureType; label: string }[] = [
  { id: 'bead', label: 'Theo nẹp kính' },
  { id: 'glass_perimeter', label: 'Theo chu vi kính' },
  { id: 'glass_width', label: 'Theo chiều rộng kính' },
  { id: 'glass_height', label: 'Theo chiều cao kính' },
  { id: 'frame_perimeter', label: 'Theo chu vi khung' },
  { id: 'frame_width', label: 'Theo chiều rộng khung' },
  { id: 'frame_height', label: 'Theo chiều cao khung' },
];

export const GasketConfigSection: React.FC<GasketConfigSectionProps> = ({
  items = [],
  onChangeItems,
  target,
}) => {
  const [gasketList, setGasketList] = useState<Gasket[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    getGaskets({ limit: 100 })
      .then((res) => {
        if (isMounted && res && res.items) {
          setGasketList(res.items);
        }
      })
      .catch((err) => {
        console.error('Lỗi tải danh mục roan:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddItem = () => {
    const defaultGasket = gasketList[0];
    const newItem: DoorGasketConfigItem = {
      id: `gasket_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      gasketId: defaultGasket?.id,
      gasketCode: defaultGasket?.code,
      gasketName: defaultGasket?.name || '',
      measure: 'bead',
      countPerCell: 1,
      target,
    };
    onChangeItems([...items, newItem]);
  };

  const handleUpdateItem = (id: string, updates: Partial<DoorGasketConfigItem>) => {
    onChangeItems(
      items.map((item) => {
        if (item.id !== id) return item;
        return { ...item, ...updates };
      })
    );
  };

  const handleGasketSelect = (id: string, selectedGasketId: number) => {
    const selected = gasketList.find((g) => g.id === selectedGasketId);
    handleUpdateItem(id, {
      gasketId: selectedGasketId,
      gasketCode: selected?.code,
      gasketName: selected?.name || '',
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
          <span className="w-5 h-5 rounded-full bg-pink-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
            2
          </span>
          <span className="font-semibold text-xs text-slate-900">
            Roan gắn kính — {targetTitle}
          </span>
          <span className="text-[11px] text-slate-400 font-normal">
            tính theo nẹp hoặc chu vi kính
          </span>
        </div>

        <button
          type="button"
          onClick={handleAddItem}
          className="px-2.5 py-1 rounded-md bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
        >
          <Plus size={13} />
          <span>Thêm</span>
        </button>
      </div>

      {/* Danh sách các dòng roan */}
      {items.length === 0 ? (
        <div className="text-[11px] text-slate-400 italic py-2 text-center bg-slate-50 rounded-md border border-dashed border-slate-200">
          Chưa cấu hình roan cho {targetTitle.toLowerCase()}. Nhấn &quot;+ Thêm&quot; để thiết lập roan gắn kính.
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((row) => (
            <div
              key={row.id}
              className="p-2.5 rounded-lg border border-pink-200 bg-pink-50/20 hover:bg-pink-50/40 transition-colors"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center text-xs">
                {/* 1. Loại roan */}
                <div className="md:col-span-4 space-y-1">
                  <label className="text-[10px] text-slate-500 font-medium block">Loại roan:</label>
                  <select
                    value={row.gasketId || ''}
                    onChange={(e) => handleGasketSelect(row.id, Number(e.target.value))}
                    className="w-full h-7 px-2 text-xs rounded border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-pink-500"
                  >
                    <option value="">{isLoading ? 'Đang tải...' : 'Chọn roan...'}</option>
                    {gasketList.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.code} - {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Tên hiển thị */}
                <div className="md:col-span-3 space-y-1">
                  <label className="text-[10px] text-slate-500 font-medium block">Tên:</label>
                  <input
                    type="text"
                    placeholder="Tên hiển thị..."
                    value={row.gasketName || ''}
                    onChange={(e) => handleUpdateItem(row.id, { gasketName: e.target.value })}
                    className="w-full h-7 px-2 text-xs rounded border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-pink-500"
                  />
                </div>

                {/* 3. Cách tính */}
                <div className="md:col-span-3 space-y-1">
                  <label className="text-[10px] text-slate-500 font-medium block">Cách tính:</label>
                  <select
                    value={row.measure}
                    onChange={(e) => handleUpdateItem(row.id, { measure: e.target.value as GasketMeasureType })}
                    className="w-full h-7 px-2 text-xs rounded border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-pink-500"
                  >
                    {MEASURE_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Số lần / ô */}
                <div className="md:col-span-1 space-y-1">
                  <label className="text-[10px] text-slate-500 font-medium block">Số lần/ô:</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={row.countPerCell}
                    onChange={(e) =>
                      handleUpdateItem(row.id, { countPerCell: Math.max(1, Number(e.target.value) || 1) })
                    }
                    className="w-full h-7 px-1.5 text-center text-xs font-bold rounded border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-pink-500"
                  />
                </div>

                {/* 5. Nút xóa */}
                <div className="md:col-span-1 flex justify-end items-end pt-4">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(row.id)}
                    title="Xóa roan này"
                    className="w-7 h-7 rounded flex items-center justify-center text-pink-600 hover:text-white hover:bg-pink-600 transition-colors cursor-pointer"
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
