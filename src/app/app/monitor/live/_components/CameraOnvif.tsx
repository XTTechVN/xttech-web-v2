'use client';

import { useLiveStore } from '@/stores/useLiveStore';

export default function CameraOnvif({}: {}) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 bg-primary">
        <p className="text-white text-sm font-medium">Cài đặt hiển thị</p>
      </div>

      {/* Content */}
      <div className="p-3 bg-gray-100 flex-1">
        <div className="grid grid-cols-2 gap-2"></div>
      </div>
    </div>
  );
}
