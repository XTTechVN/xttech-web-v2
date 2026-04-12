'use client';

import { Camera, Maximize2 } from 'lucide-react';

interface MonitorDisplayProps {
  filename?: string;
}

export default function MonitorDisplay({ filename }: MonitorDisplayProps) {
  return (
    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden relative group">
      {/* Video Area */}
      <div className="w-full h-full flex items-center justify-center bg-gray-200/50">
        {filename ? (
          <video
            src={`http://157.66.100.182:9000/ai-data/video/${filename}.mp4`}
            autoPlay
            controls
            loop
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-4 text-gray-400">
            <Camera size={64} className="animate-pulse" />
            <span className="text-xs font-medium uppercase tracking-widest">No Signal</span>
          </div>
        )}
      </div>

      {/* Overlay: Camera Info */}
      {/* <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm border border-gray-200 px-3 py-1.5 rounded shadow-sm z-10">
        <p className="text-xs font-bold text-gray-800 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full" />
          Camera Cổng Chính - LIVE
        </p>
      </div> */}

      {/* Overlay: Fullscreen Toggle */}
      {/* <button className="absolute bottom-4 right-4 p-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded shadow-sm hover:bg-white transition-colors opacity-0 group-hover:opacity-100 z-10 focus:opacity-100 outline-none">
        <Maximize2 size={16} className="text-gray-600" />
      </button> */}

      {/* Playback Time Overlay */}
      {/* <div className="absolute top-4 right-4 bg-gray-900/40 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-mono text-white tracking-widest z-10">
        00:00:23 / 01:24:55
      </div> */}
    </div>
  );
}
