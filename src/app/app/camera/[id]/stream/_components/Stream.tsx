import { Camera } from '@/types/shared/camera';

// @ts-ignore
import JSMpeg from '@cycjimmy/jsmpeg-player';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface Props {
  camera: Camera;
}

export default function Stream({ camera }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  const [status, setStatus] = useState<'connecting' | 'playing' | 'error'>('connecting');
  const lastTimeRef = useRef<number>(-1);
  const stallTimerRef = useRef<number>(0);

  useEffect(() => {
    if (!camera.worker?.ip || !camera.worker?.port || !camera.id) return;

    setStatus('connecting');
    lastTimeRef.current = -1;
    stallTimerRef.current = 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let player: any = null;
    let checkInterval: NodeJS.Timeout;

    if (canvasRef.current) {
      const url = `ws://${camera.worker.ip}:${camera.worker.port}/${camera.id}`;

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
