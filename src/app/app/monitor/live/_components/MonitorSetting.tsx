'use client';

import { Plus, Minus } from 'lucide-react';
import useMonitorStore from '@/stores/useMonitorStore';

export default function MonitorSetting({}) {
  const { monitor, increaseMonitorGridSize, decreaseMonitorGridSize } = useMonitorStore();

  return (
    <div className="bg-gray-50 rounded-lg min-h-[80vh] overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-primary">
        <p className="text-white text-sm font-medium">Cài đặt hiển thị</p>
      </div>

      {/* Content */}
      <div className="p-3 bg-gray-100 flex-1">
        <div className="grid grid-cols-2 gap-2">
          {/* Buttons tăng giảm kích thước grid */}
          <button
            className="bg-primary/80 hover:bg-primary text-white text-sm p-2 rounded"
            onClick={() => monitor && increaseMonitorGridSize(monitor)}
          >
            <Plus size={20} />
          </button>
          <button
            className="bg-primary/80 hover:bg-primary text-white text-sm p-2 rounded"
            onClick={() => monitor && decreaseMonitorGridSize(monitor)}
          >
            <Minus size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
