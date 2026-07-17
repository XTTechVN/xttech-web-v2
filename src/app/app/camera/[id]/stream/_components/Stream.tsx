import { Camera } from '@/types/shared/camera';

// @ts-ignore
import JSMpeg from '@cycjimmy/jsmpeg-player';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface Props {
  camera: Camera;
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

export default function Stream({ camera }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  const [status, setStatus] = useState<'connecting' | 'playing' | 'error'>('connecting');
  const lastTimeRef = useRef<number>(-1);
  const stallTimerRef = useRef<number>(0);

  const lastDetectionsRef = useRef<any[]>([]);
  const lastDetectTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!camera.worker?.socket || !camera.id) return;

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
      // 1. Khởi tạo player jsmpeg với CustomSource
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
      let socketUrl = camera.worker.socket;
      if (window.location.protocol === 'https:') {
        socketUrl = socketUrl.replace(/^ws:\/\//i, 'wss://');
      } else if (window.location.protocol === 'http:') {
        socketUrl = socketUrl.replace(/^wss:\/\//i, 'ws://');
      }
      if (socketUrl && !socketUrl.startsWith('ws://') && !socketUrl.startsWith('wss://')) {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        socketUrl = `${protocol}//${socketUrl}`;
      }
      const baseSocket = socketUrl.replace(/\/$/, '');
      const url = `${baseSocket}/${camera.id}`;
      ws = new WebSocket(url);
      ws.binaryType = 'arraybuffer';

      ws.onopen = () => {
        setStatus('playing');

        // 3. THUẬT TOÁN ĐỒNG BỘ THỜI GIAN THỰC (CATCH-UP LAYER)
        latencyCheckInterval = setInterval(() => {
          if (player && player.video) {
            const internalBuffered = player.video.demuxer ? player.video.demuxer.buffer.length : 0;

            if (internalBuffered > 64 * 1024) {
              player.video.demuxer.buffer.evict(internalBuffered - 16 * 1024);
            }

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

        if (Date.now() - lastDetectTimeRef.current > 1200) {
          lastDetectionsRef.current = [];
        }

        if (lastDetectionsRef.current.length > 0) {
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
  }, [camera]);

  return (
    <div className="relative flex flex-col bg-white border border-[#a2a2a2] overflow-hidden aspect-video group">
      {/* Stream placeholder */}
      {/* Khi click vào video thì chuyển hướng sang trang stream của ID này -> trang điều khiển cam */}
      <div className="flex-1 flex items-center justify-center bg-black relative">
        <canvas
          ref={canvasRef}
          className={`w-full h-full object-contain transition-opacity duration-300 ${status === 'playing' ? 'opacity-100' : 'opacity-0'}`}
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
    </div>
  );
}
