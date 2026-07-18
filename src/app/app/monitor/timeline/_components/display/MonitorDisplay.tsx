'use client';

import { Camera, Maximize2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { MEDIA_BASE_URL } from '@/config/app';

interface MonitorDisplayProps {
  videoId?: string | null;
  seekSeconds?: number;
  onDetail?: () => void;
}

export default function MonitorDisplay({ videoId, seekSeconds, onDetail }: MonitorDisplayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Seek đến đúng thời điểm khi seekSeconds thay đổi (cho chế độ continuous)
  useEffect(() => {
    if (videoRef.current && seekSeconds !== undefined && seekSeconds > 0) {
      const handleCanPlay = () => {
        if (videoRef.current) {
          videoRef.current.currentTime = seekSeconds;
          videoRef.current.play();
        }
      };
      videoRef.current.addEventListener('canplay', handleCanPlay, { once: true });
      return () => videoRef.current?.removeEventListener('canplay', handleCanPlay);
    }
  }, [videoId, seekSeconds]);

  return (
    <div className="flex-1 bg-gray-100 border border-gray-200 rounded-lg overflow-hidden relative group">
      {/* Video Area */}
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        {videoId ? (
          <video
            ref={videoRef}
            src={`${MEDIA_BASE_URL}/ai-data/${videoId}`}
            autoPlay
            controls
            loop
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-4 text-gray-400">
            <Camera size={64} className="animate-pulse" />
            <span className="text-xs font-medium uppercase tracking-widest">Chưa có video</span>
          </div>
        )}
      </div>

      {/* Overlay: Xem chi tiết AI */}
      <div
        onClick={onDetail}
        className="absolute top-4 right-4 bg-gray-900/40 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-white tracking-widest z-10 cursor-pointer"
      >
        Xem chi tiết AI
      </div>
    </div>
  );
}
