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

class CustomSource {
  destination: any = null;
  completed = false;
  established = true;
  progress = 1;
  constructor(options?: any) {}
  connect(destination: any) {
    this.destination = destination;
  }
  start() {}
  resume() {}
  destroy() {}
  feed(arrayBuffer: ArrayBuffer) {
    if (this.destination) {
      this.destination.write(arrayBuffer);
    }
  }
}

const CLASS_COLORS = {
  person: { stroke: '#4ade80', fill: 'rgba(74,222,128,0.1)' },
  car: { stroke: '#fb923c', fill: 'rgba(251,146,60,0.1)' },
  moto: { stroke: '#a78bfa', fill: 'rgba(167,139,250,0.1)' },
  bus: { stroke: '#fbbf24', fill: 'rgba(251,191,36,0.1)' },
  truck: { stroke: '#f87171', fill: 'rgba(248,113,113,0.1)' },
};

function MonitorCell({ cell, gridKey }: { cell: GridCell; gridKey: string }) {
  const { setIsAdding, setIsRemoving, setGridKey } = useMonitorStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  const [status, setStatus] = useState<'connecting' | 'playing' | 'error'>('connecting');
  const lastTimeRef = useRef<number>(-1);
  const stallTimerRef = useRef<number>(0);

  const lastDetectionsRef = useRef<any[]>([]);
  const lastDetectTimeRef = useRef<number>(0);

  // Xử lý hiển thị stream khi có workerIp, workerPort, cameraId
  useEffect(() => {
    if (!cell.workerIp || !cell.workerPort || !cell.cameraId) return;

    setStatus('connecting');
    lastTimeRef.current = -1;
    stallTimerRef.current = 0;
    lastDetectionsRef.current = [];
    lastDetectTimeRef.current = 0;

    let ws: WebSocket | null = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let player: any = null;
    let customSourceInstance: CustomSource | null = null;
    let checkInterval: NodeJS.Timeout;
    let latencyCheckInterval: NodeJS.Timeout;
    let animationFrameId: number;

    customSourceInstance = new CustomSource();

    if (canvasRef.current) {
      // 1. Khởi tạo player jsmpeg với CustomSource để ép buffer cực thấp
      player = new JSMpeg.Player(null, {
        canvas: canvasRef.current,
        source: function () {
          return customSourceInstance;
        },
        autoplay: true,
        audio: false,
        disableGl: false,
        videoBufferSize: 256 * 1024,
        pauseWhenHidden: false,
      });

      // 2. Khởi tạo WebSocket kết nối thủ công
      const url = `ws://${cell.workerIp}:${cell.workerPort}/${cell.cameraId}`;
      ws = new WebSocket(url);
      ws.binaryType = 'arraybuffer';

      ws.onopen = () => {
        setStatus('playing');

        // 3. THUẬT TOÁN ĐỒNG BỘ THỜI GIAN THỰC (CATCH-UP LAYER)
        // Cứ mỗi 500ms, kiểm tra độ lệch thời gian và bộ đệm của trình phát JSMpeg
        latencyCheckInterval = setInterval(() => {
          if (player && player.video) {
            const internalBuffered = player.video.demuxer ? player.video.demuxer.buffer.length : 0;

            // Nếu phát hiện trễ (> 64KB dữ liệu ứ đọng), buộc JSMpeg xóa sạch bộ nhớ đệm cũ và nạp lại frame mới nhất
            if (internalBuffered > 64 * 1024) {
              player.video.demuxer.buffer.evict(internalBuffered - 16 * 1024);
            }

            // Giải pháp: Tự động chạy tiếp nếu hình ảnh đứng im hoặc bị lệch giây
            if (player.video.source && player.video.source.destination) {
              if (player.video.currentTime > 0 && player.video.paused) {
                player.play();
              }
            }
          }
        }, 500);
      };

      ws.onmessage = (event) => {
        if (typeof event.data === 'string') {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'detections') {
              lastDetectionsRef.current = msg.detections || [];
              lastDetectTimeRef.current = Date.now();
            }
          } catch (e) {
            console.error('Lỗi phân tích JSON metadata:', e);
          }
        } else {
          if (customSourceInstance) {
            customSourceInstance.feed(event.data);
          }
        }
      };

      ws.onerror = () => {
        setStatus('error');
      };

      ws.onclose = () => {
        setStatus('error');
      };

      // 4. Theo dõi tiến độ decode của JSMpeg để phát hiện mất tín hiệu
      checkInterval = setInterval(() => {
        if (!player) return;

        const currentTime = player.currentTime;
        if (currentTime === lastTimeRef.current) {
          stallTimerRef.current += 1;
          // Nếu 4 giây liên tục không có frame mới -> Mất tín hiệu
          if (stallTimerRef.current >= 4) {
            setStatus('error');
          }
        } else {
          lastTimeRef.current = currentTime;
          stallTimerRef.current = 0;
          setStatus('playing');
        }
      }, 1000);

      // 5. Khởi chạy luồng vẽ đè overlay YOLO
      const drawOverlayLoop = () => {
        const overlayCanvas = overlayCanvasRef.current;
        if (!overlayCanvas) return;
        const ctx = overlayCanvas.getContext('2d');
        if (!ctx) return;
        const container = overlayCanvas.parentElement;
        if (!container) return;

        overlayCanvas.width = container.clientWidth;
        overlayCanvas.height = container.clientHeight;
        ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

        // Quá timeout 1.2s mà không có dữ liệu YOLO mới -> xóa khung vẽ
        if (Date.now() - lastDetectTimeRef.current > 1200) {
          lastDetectionsRef.current = [];
        }

        if (lastDetectionsRef.current.length > 0) {
          // Scale tọa độ từ độ phân giải gốc của AI Backend (720x480) sang kích thước hiển thị thực tế
          const scaleX = overlayCanvas.width / 720;
          const scaleY = overlayCanvas.height / 480;

          lastDetectionsRef.current.forEach((d: any) => {
            const [x1, y1, x2, y2] = d.bbox;
            const sx1 = x1 * scaleX,
              sy1 = y1 * scaleY;
            const sw = (x2 - x1) * scaleX;
            const sh = (y2 - y1) * scaleY;

            const color = CLASS_COLORS[d.class as keyof typeof CLASS_COLORS] || {
              stroke: '#3b82f6',
              fill: 'rgba(59,130,246,0.1)',
            };

            ctx.globalAlpha = 1.0;
            ctx.fillStyle = color.fill;
            ctx.fillRect(sx1, sy1, sw, sh);

            ctx.strokeStyle = color.stroke;
            ctx.lineWidth = 2;
            ctx.strokeRect(sx1, sy1, sw, sh);

            const label = `${d.class} ${Math.round(d.confidence * 100)}%`;
            ctx.font = 'bold 11px monospace';
            const textWidth = ctx.measureText(label).width + 6;
            const textHeight = 16;

            ctx.fillStyle = color.stroke;
            ctx.fillRect(sx1, sy1 - textHeight, textWidth, textHeight);

            ctx.fillStyle = '#000';
            ctx.fillText(label, sx1 + 3, sy1 - 4);
          });
        }
        animationFrameId = requestAnimationFrame(drawOverlayLoop);
      };

      animationFrameId = requestAnimationFrame(drawOverlayLoop);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (latencyCheckInterval) clearInterval(latencyCheckInterval);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
      if (player) {
        player.destroy();
      }
      customSourceInstance = null;
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
        <canvas
          ref={overlayCanvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
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
