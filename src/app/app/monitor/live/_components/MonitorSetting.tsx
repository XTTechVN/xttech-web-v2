'use client';

import { useLiveStore } from '@/stores/useLiveStore';
import { ViewMode } from '@/types/shared/view';

export default function MonitorSetting({
  setViewMode,
  setPortView,
}: {
  setViewMode: (viewMode: ViewMode) => void;
  setPortView: (portView: number | null) => void;
}) {
  const { viewMode } = useLiveStore();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 bg-primary">
        <p className="text-white text-base font-medium">Cài đặt chế độ xem</p>
      </div>

      {/* Content */}
      <div className="p-4 bg-gray-100 flex-1">
        <div className="grid grid-cols-2 gap-2">
          <button
            className={`bg-primary text-white p-2 rounded ${viewMode === '1x1' ? 'bg-primary/50' : ''}`}
            onClick={() => {
              setViewMode('1x1');
              setPortView(null);
            }}
          >
            1x1
          </button>
          <button
            className={`bg-primary text-white p-2 rounded ${viewMode === '2x2' ? 'bg-primary/50' : ''}`}
            onClick={() => {
              setViewMode('2x2');
              setPortView(null);
            }}
          >
            2x2
          </button>
          <button
            className={`bg-primary text-white p-2 rounded ${viewMode === '3x3' ? 'bg-primary/50' : ''}`}
            onClick={() => {
              setViewMode('3x3');
              setPortView(null);
            }}
          >
            3x3
          </button>
          <button
            className={`bg-primary text-white p-2 rounded ${viewMode === '4x4' ? 'bg-primary/50' : ''}`}
            onClick={() => {
              setViewMode('4x4');
              setPortView(null);
            }}
          >
            4x4
          </button>
        </div>
      </div>
    </div>
  );
}
