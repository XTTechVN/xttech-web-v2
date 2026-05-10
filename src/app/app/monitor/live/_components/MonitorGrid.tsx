'use client';

import { useEffect, useRef, useState } from 'react';
// @ts-ignore
import JSMpeg from '@cycjimmy/jsmpeg-player';
import { GridCell } from '@/types/shared/monitor';
import { getGrid } from '@/utils/grid';
import { Plus } from 'lucide-react';

import useMonitorStore from '@/stores/useMonitorStore';

// Config để lấy class grid
const gridClass: Record<string, string> = {
  '1x1': 'grid-cols-1 grid-rows-1',
  '2x2': 'grid-cols-2 grid-rows-2',
  '3x3': 'grid-cols-3 grid-rows-3',
  '4x4': 'grid-cols-4 grid-rows-4',
};

export default function MonitorGrid() {
  const { monitor } = useMonitorStore();

  if (!monitor) return null;

  const grid = monitor.grid;
  const gridKeys = Object.keys(grid);
  const gridValues = Object.values(grid);

  const viewMode = getGrid(gridValues.length);

  // Render grid các màn hình
  return (
    <div className="flex flex-col w-full bg-[#111] text-white">
      {/* Camera grid */}
      <div className={`grid ${gridClass[viewMode]} flex-1 bg-[#2a2a2a]`}>
        {gridValues.map((cell, index) => (
          <MonitorCell key={gridKeys[index]} cell={cell} gridKey={gridKeys[index]} />
        ))}
      </div>
    </div>
  );
}

function MonitorCell({ cell, gridKey }: { cell: GridCell; gridKey: string }) {
  const { setIsAdding, setIsRemoving, setGridKey } = useMonitorStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [status, setStatus] = useState<'connecting' | 'playing' | 'error'>('connecting');
  const lastTimeRef = useRef<number>(-1);
  const stallTimerRef = useRef<number>(0);

  useEffect(() => {
    if (!cell.workerIp || !cell.workerPort || !cell.cameraId) return;

    setStatus('connecting');
    lastTimeRef.current = -1;
    stallTimerRef.current = 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let player: any = null;
    let checkInterval: NodeJS.Timeout;

    if (canvasRef.current) {
      const url = `ws://${cell.workerIp}:${cell.workerPort}/${cell.cameraId}`;

      player = new JSMpeg.Player(url, {
        canvas: canvasRef.current,
        autoplay: true,
        audio: false, // Tắt audio nếu không cần thiết
      });

      // Theo dõi tiến độ decode của JSMpeg để phát hiện mất tín hiệu
      checkInterval = setInterval(() => {
        if (!player) return;

        const currentTime = player.currentTime;
        if (currentTime === lastTimeRef.current) {
          stallTimerRef.current += 1;
          // Nếu 3 giây liên tục không có frame mới -> Mất tín hiệu
          if (stallTimerRef.current >= 3) {
            setStatus('error');
          }
        } else {
          lastTimeRef.current = currentTime;
          stallTimerRef.current = 0;
          setStatus('playing');
        }
      }, 1000);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (player) {
        player.destroy();
      }
    };
  }, [cell]);

  if (!cell.cameraId && !cell.workerIp && !cell.workerPort)
    return (
      <div
        onClick={() => {
          setGridKey(gridKey);
          setIsAdding(true);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          setGridKey(gridKey);
          setIsRemoving(true);
        }}
        className="relative flex flex-col bg-white border border-[#a2a2a2] overflow-hidden aspect-video"
      >
        {/* 1. Nếu không có cameraId, workerIp, workerPort thì hiển thị khung cho phép chọn add cam vào cell đó. */}
        {/* 2. Icon upload ở giữa cell */}
        {!cell.cameraId && !cell.workerIp && !cell.workerPort && (
          <div className="absolute inset-0 gap-2 cursor-pointer flex flex-col items-center justify-center z-10 text-xs font-medium select-none">
            <Plus size={40} color="#444" />
            <p className="text-[#444]">Thêm camera vào ô trống này</p>
          </div>
        )}
      </div>
    );

  return (
    <div
      onClick={() => {
        console.log(cell);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        setGridKey(gridKey);
        setIsRemoving(true);
      }}
      className="relative flex flex-col bg-white border border-[#a2a2a2] overflow-hidden aspect-video group"
    >
      {/* Stream placeholder */}
      <div className="flex-1 flex items-center justify-center bg-black relative">
        <canvas
          ref={canvasRef}
          className={`w-full h-full object-contain transition-opacity duration-300 ${status === 'playing' ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Lớp phủ trạng thái (Loading / Error) */}
        {status !== 'playing' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70 text-sm bg-black/80 z-10">
            {status === 'connecting' && (
              <>
                <div className="w-6 h-6 border-2 border-white/20 border-t-white/80 rounded-full animate-spin mb-2" />
                <p>Đang kết nối...</p>
              </>
            )}
            {status === 'error' && <p className="text-white font-medium">Không có tín hiệu</p>}
          </div>
        )}
      </div>

      {/* Hiển thị ID camera khi hover vào góc */}
      {/* <div className="absolute top-2 left-2 z-20 text-xs text-white/70 font-medium select-none bg-black/40 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
        {cell.cameraId}
      </div> */}
    </div>
  );
}
