'use client';

import React from 'react';
import { Camera, Maximize2 } from 'lucide-react';

export default function MonitorDisplay() {
  return (
    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden relative group">
      {/* Mockup Video Area */}
      <div className="w-full h-full flex items-center justify-center bg-gray-200/50">
        <Camera size={64} className="text-gray-300 animate-pulse" />
      </div>

      {/* Overlay: Camera Info */}
      <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm border border-gray-200 px-3 py-1.5 rounded shadow-sm">
        <p className="text-xs font-bold text-gray-800 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full" />
          Camera Cổng Chính - LIVE
        </p>
      </div>

      {/* Overlay: Fullscreen Toggle */}
      <button className="absolute bottom-4 right-4 p-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded shadow-sm hover:bg-white transition-colors opacity-0 group-hover:opacity-100">
        <Maximize2 size={16} className="text-gray-600" />
      </button>

      {/* Playback Time Overlay */}
      <div className="absolute top-4 right-4 bg-gray-900/40 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-mono text-white tracking-widest">
        00:00:23 / 01:24:55
      </div>
    </div>
  );
}
