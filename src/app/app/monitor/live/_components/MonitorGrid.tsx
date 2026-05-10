'use client';

import { useEffect, useState } from 'react';
import { GridCell } from '@/types/shared/monitor';
import { getGrid } from '@/utils/grid';
import { Plus } from 'lucide-react';

// Config để lấy class grid
const gridClass: Record<string, string> = {
  '1x1': 'grid-cols-1 grid-rows-1',
  '2x2': 'grid-cols-2 grid-rows-2',
  '3x3': 'grid-cols-3 grid-rows-3',
  '4x4': 'grid-cols-4 grid-rows-4',
};

export default function MonitorGrid({
  grid,
  onAddCamera,
}: {
  grid: Record<string, GridCell>;
  onAddCamera: (cell: GridCell, gridKey: string) => void;
}) {
  const gridKeys = Object.keys(grid);
  const gridValues = Object.values(grid);

  const viewMode = getGrid(gridValues.length);

  console.log(grid);

  // Render grid các màn hình
  return (
    <div className="flex flex-col w-full bg-[#111] text-white">
      {/* Camera grid */}
      <div className={`grid ${gridClass[viewMode]} flex-1 bg-[#2a2a2a]`}>
        {gridValues.map((cell, index) => (
          <MonitorCell
            key={gridKeys[index]}
            cell={cell}
            gridKey={gridKeys[index]}
            onAddCamera={onAddCamera}
          />
        ))}
      </div>
    </div>
  );
}

function MonitorCell({
  cell,
  gridKey,
  onAddCamera,
}: {
  cell: GridCell;
  gridKey: string;
  onAddCamera: (cell: GridCell, gridKey: string) => void;
}) {
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    if (!cell.workerIp || !cell.workerPort || !cell.cameraId) return;
    const ws = new WebSocket(`ws://${cell.workerIp}:${cell.workerPort}/live/${cell.cameraId}`);

    ws.onmessage = (event) => {
      setImageSrc(URL.createObjectURL(event.data));
    };

    return () => ws.close();
  }, [cell]);

  if (!cell.cameraId && !cell.workerIp && !cell.workerPort)
    return (
      <div
        onClick={() => {
          onAddCamera(cell, gridKey);
        }}
        className="relative flex flex-col bg-white border border-[#a2a2a2] overflow-hidden aspect-video"
      >
        {/* 1. Nếu không có cameraId, workerIp, workerPort thì hiển thị khung cho phép chọn add cam vào cell đó. */}
        {/* 2. Icon upload ở giữa cell */}
        {!cell.cameraId && !cell.workerIp && !cell.workerPort && (
          <div className="absolute inset-0 gap-2 cursor-pointer flex flex-col items-center justify-center z-10 text-xs font-medium select-none">
            <Plus size={40} color="#444" />
            <p className="text-[#444]">Thêm camera vào cell này</p>
          </div>
        )}
      </div>
    );

  return (
    <div
      onClick={() => {
        console.log(cell);
      }}
      className="relative flex flex-col bg-white border border-[#a2a2a2] overflow-hidden aspect-video"
    >
      {/* Camera label */}
      <div className="absolute top-2 left-2 z-10 text-xs text-white/70 font-medium select-none">
        {cell.cameraId || 'No Camera'}
      </div>

      {/* Stream placeholder */}
      <div className="flex-1 flex items-center justify-center text-[#444] text-sm">
        <img src={imageSrc == '' ? undefined : imageSrc} alt={cell.cameraId || 'No signal'} />
      </div>
    </div>
  );
}
