'use client';

import { Plus, Minus, Save, Loader2 } from 'lucide-react';

import { getGrid } from '@/utils/grid';
import { useState } from 'react';
import useMonitorStore from '@/stores/useMonitorStore';

const buttonClass =
  'rounded px-2 py-1 bg-white border border-primary cursor-pointer text-primary hover:bg-primary hover:text-white transition-all ease-in-out duration-300';
const labelClass = 'text-sm font-medium';
const titleClass = 'text-sm font-semibold';

export default function MonitorSetting() {
  const {
    monitor,
    isUpdating,
    getMonitorGridSize,
    increaseMonitorGridSize,
    decreaseMonitorGridSize,
    updateMonitor,
  } = useMonitorStore();

  const [name, setName] = useState(monitor?.name);
  const monitorGridSize = getGrid(getMonitorGridSize()); // trả về kích thước grid (ví dụ: 2x2, 3x3)

  const handleUpdateMonitorName = () => {
    if (!monitor) return;
    if (!name) return;
    updateMonitor({ ...monitor, name });
  };

  return (
    <div className="bg-gray-100 rounded-lg h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-primary">
        <p className="text-white text-sm font-medium">Cài đặt màn hình</p>
      </div>

      {/* Monitor info */}
      <div className="px-4 py-3">
        {/* Tiêu đề */}
        <p className={`${titleClass} mb-2`}>Thông tin chung</p>

        <div className="px-2 space-y-2">
          {/* Tên màn hình */}
          <div className="flex items-center gap-4">
            <div className="w-full flex items-center gap-2">
              <p className={`${labelClass} shrink-0`}>Tên màn hình</p>
              <input
                type="text"
                className="border-b-2 border-b-gray-200 focus:border-b-gray-500 p-1 w-full text-sm outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUpdateMonitorName();
                }}
                disabled={isUpdating}
              />
            </div>
            <button className={buttonClass} onClick={handleUpdateMonitorName} disabled={isUpdating}>
              {isUpdating ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            </button>
          </div>

          {/* Kích thước grid */}
          <div className="flex items-center gap-2">
            <p className={`${labelClass} shrink-0`}>Kích thước màn hình:</p>
            <p className="text-sm font-medium">{monitorGridSize}</p>
          </div>
        </div>
      </div>

      {/* Monitor actions */}
      <div className="px-4 py-3">
        {/* Tiêu đề */}
        <p className={`${titleClass} mb-2`}>Thao tác</p>

        <div className="px-2 space-y-2">
          {/* Tăng kích thước (1 ô) */}
          <div className="flex items-center gap-2 justify-between">
            <p className={`${labelClass} shrink-0`}>Tăng kích thước (1 ô):</p>
            <button
              className={buttonClass}
              onClick={() => monitor && increaseMonitorGridSize(monitor)}
            >
              <Plus size={20} />
            </button>
          </div>

          {/* Giảm kích thước (1 ô) */}
          <div className="flex items-center gap-2 justify-between">
            <p className={`${labelClass} shrink-0`}>Giảm kích thước (1 ô):</p>
            <button
              className={buttonClass}
              onClick={() => monitor && decreaseMonitorGridSize(monitor)}
            >
              <Minus size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
