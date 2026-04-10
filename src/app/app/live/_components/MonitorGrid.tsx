'use client';

import { useEffect, useState } from 'react';
import { useAIServerStore } from '@/stores/useAIServerStore';
import { ViewMode } from '@/types/shared/view';

// Config để lấy class grid
const gridClass: Record<string, string> = {
  '1x1': 'grid-cols-1 grid-rows-1',
  '2x2': 'grid-cols-2 grid-rows-2',
  '3x3': 'grid-cols-3 grid-rows-3',
  '4x4': 'grid-cols-4 grid-rows-4',
};

export default function MonitorGrid({
  viewMode,
  total,
  portView,
  setPortView,
}: {
  viewMode: ViewMode;
  total: number;
  portView: number | null;
  setPortView: (portView: number | null) => void;
}) {
  // Tạo danh sách camera
  const cameras = Array.from({ length: total }, (_, i) => ({
    id: i + 1,
    label: `Camera ${i + 1}`,
    port: 9901 + i,
  }));

  // Nếu có portView thì hiển thị 1 camera tràn viền
  if (portView !== null) {
    const camera = cameras.find((camera) => camera.port === portView);

    return (
      <div className="flex flex-col w-full bg-[#111] text-white">
        {/* Camera grid */}
        <div className={``}>
          <MonitorCell camera={camera} setPortView={setPortView} />
        </div>
      </div>
    );
  }

  // Render grid các màn hình
  return (
    <div className="flex flex-col w-full bg-[#111] text-white">
      {/* Camera grid */}
      <div className={`grid ${gridClass[viewMode]} flex-1 bg-[#2a2a2a]`}>
        {cameras.map((camera) => (
          <MonitorCell key={camera.id} camera={camera} setPortView={setPortView} />
        ))}
      </div>
    </div>
  );
}

function MonitorCell({
  camera,
  setPortView,
}: {
  camera: any;
  setPortView: (portView: number) => void;
}) {
  const [imageSrc, setImageSrc] = useState('');
  const { serverIp } = useAIServerStore();

  useEffect(() => {
    const ws = new WebSocket(`${serverIp}:${camera.port}`);

    ws.onmessage = (event) => {
      setImageSrc(URL.createObjectURL(event.data));
    };

    return () => ws.close();
  }, [camera.port]);

  return (
    <div
      className="relative flex flex-col bg-white border border-[#a2a2a2] overflow-hidden aspect-video"
      onClick={() => setPortView(camera.port)}
    >
      {/* Camera label */}
      <div className="absolute top-2 left-2 z-10 text-xs text-white/70 font-medium select-none">
        {camera.label} - Port {camera.port}
      </div>

      {/* Stream placeholder */}
      <div className="flex-1 flex items-center justify-center text-[#444] text-sm">
        <img src={imageSrc == '' ? undefined : imageSrc} alt={camera.label} />
      </div>
    </div>
  );
}
