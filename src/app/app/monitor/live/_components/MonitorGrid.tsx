'use client';

import { useEffect, useRef, useState } from 'react';
// @ts-ignore
import JSMpeg from '@cycjimmy/jsmpeg-player';
import { GridCell } from '@/types/shared/monitor';
import { getGridClass } from '@/utils/grid';
import { Plus } from 'lucide-react';

import useMonitorStore from '@/stores/useMonitorStore';
import { useRouter } from 'next/navigation';

export default function MonitorGrid() {
  const router = useRouter();
  const { monitor } = useMonitorStore();

  if (!monitor) return null;

  const grid = monitor.grid;
  const gridKeys = Object.keys(grid);
  const gridValues = Object.values(grid);

  const gridClass = getGridClass(gridValues.length);

  // Render grid các màn hình
  return (
    <div className="flex flex-col w-full bg-[#111] text-white">
      {/* Camera grid */}
      <div className={`grid ${gridClass} flex-1 bg-[#2a2a2a]`}>
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
  const router = useRouter();

  const [status, setStatus] = useState<'connecting' | 'playing' | 'error'>('connecting');
  const lastTimeRef = useRef<number>(-1);
  const stallTimerRef = useRef<number>(0);

  // Xử lý hiển thị stream khi có workerIp, workerPort, cameraId
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

  // Xử lý hiển thị cell khi không có workerIp, workerPort, cameraId
  // 1. Click vào cell để thêm camera vào cell đó (chuyển sang trang chọn camera)
  // 2. Right click vào cell để xóa camera khỏi cell đó (chuyển sang trang xóa camera)
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
      {/* Khi click vào video thì chuyển hướng sang trang stream của ID này -> trang điều khiển cam */}
      <div
        onClick={() => {
          router.push(`/app/camera/${cell.cameraId}/stream`);
        }}
        className="flex-1 flex items-center justify-center bg-black relative cursor-pointer"
      >
        <canvas
          ref={canvasRef}
          className={`w-full h-full object-fill transition-opacity duration-300 ${status === 'playing' ? 'opacity-100' : 'opacity-0'}`}
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

      {/* Hiển thị Tên camera bên góc trên bên trái */}
      <div className="absolute top-2 left-2 z-20 text-xs text-primary px-2 py-1 font-semibold rounded-md bg-white shadow select-none">
        {cell.cameraName || 'Chưa có tên, vui lòng đặt lại'}
      </div>
    </div>
  );
}
