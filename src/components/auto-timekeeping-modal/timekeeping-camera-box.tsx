'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useSyncExternalStore,
} from 'react';
import { Camera, CheckCircle2, Navigation, RefreshCw } from 'lucide-react';
import { Button } from '@/components';
import type { HybridLocationFix } from '@/types';

export type TimekeepingStep = 'camera' | 'preview';

export const UNSUPPORTED_CAMERA_MESSAGE =
  'Thiết bị đang tắt luồng video trực tiếp. Hãy bấm nút "Mở Camera máy" bên dưới để chụp ảnh chấm công.';

type LegacyGetUserMediaFn = (
  constraints: MediaStreamConstraints,
  success: (stream: MediaStream) => void,
  error: (err: unknown) => void,
) => void;

interface NavigatorWithLegacyMedia extends Navigator {
  webkitGetUserMedia?: LegacyGetUserMediaFn;
  mozGetUserMedia?: LegacyGetUserMediaFn;
  getUserMedia?: LegacyGetUserMediaFn;
}

const emptySubscribe = () => () => {};

function getWebRtcSupportSnapshot(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as NavigatorWithLegacyMedia;
  return Boolean(
    navigator.mediaDevices?.getUserMedia ||
      nav.webkitGetUserMedia ||
      nav.mozGetUserMedia ||
      nav.getUserMedia,
  );
}

function getWebRtcSupportServerSnapshot(): boolean {
  return false;
}

export function useIsWebRtcSupported(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    getWebRtcSupportSnapshot,
    getWebRtcSupportServerSnapshot,
  );
}

async function requestMediaStream(constraints: MediaStreamConstraints): Promise<MediaStream> {
  if (typeof navigator === 'undefined') {
    throw new Error('NOT_SUPPORTED');
  }
  if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
    return navigator.mediaDevices.getUserMedia(constraints);
  }
  const nav = navigator as NavigatorWithLegacyMedia;
  const legacyGUM = nav.webkitGetUserMedia || nav.mozGetUserMedia || nav.getUserMedia;
  if (legacyGUM) {
    return new Promise<MediaStream>((resolve, reject) => {
      legacyGUM.call(navigator, constraints, resolve, reject);
    });
  }
  throw new Error('NOT_SUPPORTED');
}

function mapCameraErrorMessage(err: unknown): string {
  const error = err as { name?: string; message?: string } | null;
  const errName = error?.name || '';

  if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
    return 'Quyền truy cập Camera bị từ chối (NotAllowedError). Nếu bạn đang mở bằng App XTTECH, vui lòng vào "Cài đặt iPhone > XTTECH > Bật Camera". Nếu mở bằng Web, vui lòng cấp quyền cho trang web trong Safari/Chrome.';
  }
  if (errName === 'NotReadableError' || errName === 'TrackStartError') {
    return 'Camera đang bị ứng dụng khác chiếm dụng hoặc bị kẹt luồng (NotReadableError). Vui lòng đóng các ứng dụng chạy ngầm hoặc khởi động lại iPhone.';
  }
  if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
    return 'Không tìm thấy camera khả dụng trên thiết bị (NotFoundError).';
  }
  if (errName === 'OverconstrainedError') {
    return 'Phần cứng không đáp ứng thông số camera yêu cầu (OverconstrainedError).';
  }
  if (errName === 'SecurityError') {
    return 'Hệ điều hành iOS chặn quyền truy cập Camera do chính sách bảo mật (SecurityError).';
  }
  return `Không thể mở camera [${errName || 'Lỗi'}]: ${
    error?.message || 'Vui lòng kiểm tra quyền camera và thử lại.'
  }`;
}

export interface TimekeepingCameraBoxHandle {
  captureFromVideo: () => void;
  openNativeCamera: () => void;
}

export interface TimekeepingCameraBoxProps {
  isOpen: boolean;
  step: TimekeepingStep;
  previewUrl: string | null;
  isWebRtcSupported: boolean;
  cameraError: string | null;
  location: HybridLocationFix | null;
  isLocating: boolean;
  onCameraErrorChange: (message: string | null) => void;
  onCaptured: (file: File, previewUrl: string) => void;
  onCameraSettled: () => void;
  onBeforeExternalCapture: () => void;
  onAfterExternalCapture: () => void;
}

export const TimekeepingCameraBox = forwardRef<
  TimekeepingCameraBoxHandle,
  TimekeepingCameraBoxProps
>(function TimekeepingCameraBox(
  {
    isOpen,
    step,
    previewUrl,
    isWebRtcSupported,
    cameraError,
    location,
    isLocating,
    onCameraErrorChange,
    onCaptured,
    onCameraSettled,
    onBeforeExternalCapture,
    onAfterExternalCapture,
  },
  ref,
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestIdRef = useRef(0);

  const stopActiveStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startCameraStream = useCallback(async () => {
    if (!isWebRtcSupported) {
      onCameraSettled();
      return;
    }

    const requestId = ++requestIdRef.current;
    stopActiveStream();

    try {
      let stream: MediaStream | null = null;
      try {
        stream = await requestMediaStream({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
      } catch {
        try {
          stream = await requestMediaStream({
            video: { facingMode: 'user' },
            audio: false,
          });
        } catch {
          stream = await requestMediaStream({
            video: true,
            audio: false,
          });
        }
      }

      if (requestId !== requestIdRef.current) {
        stream?.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      onCameraErrorChange(null);
    } catch (err: unknown) {
      if (requestId !== requestIdRef.current) {
        return;
      }
      onCameraErrorChange(mapCameraErrorMessage(err));
    } finally {
      onCameraSettled();
    }
  }, [isWebRtcSupported, onCameraErrorChange, onCameraSettled, stopActiveStream]);

  useEffect(() => {
    if (!isOpen || step !== 'camera') {
      requestIdRef.current += 1;
      stopActiveStream();
      return;
    }

    if (!isWebRtcSupported) {
      onCameraSettled();
      return;
    }

    void startCameraStream();

    return () => {
      requestIdRef.current += 1;
      stopActiveStream();
    };
  }, [isOpen, isWebRtcSupported, onCameraSettled, startCameraStream, step, stopActiveStream]);

  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `timekeeping-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        requestIdRef.current += 1;
        stopActiveStream();
        onCameraErrorChange(null);
        onCaptured(file, url);
      },
      'image/jpeg',
      0.9,
    );
  }, [onCameraErrorChange, onCaptured, stopActiveStream]);

  const handleOpenNativeCamera = useCallback(() => {
    onBeforeExternalCapture();
    fileInputRef.current?.click();
  }, [onBeforeExternalCapture]);

  const handleRetryCamera = useCallback(() => {
    onCameraErrorChange(null);
    void startCameraStream();
  }, [onCameraErrorChange, startCameraStream]);

  const handleNativeFileCapture = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) {
        onAfterExternalCapture();
        return;
      }

      const url = URL.createObjectURL(file);
      requestIdRef.current += 1;
      stopActiveStream();
      onCameraErrorChange(null);
      onCaptured(file, url);
      onAfterExternalCapture();
    },
    [onAfterExternalCapture, onCameraErrorChange, onCaptured, stopActiveStream],
  );

  useImperativeHandle(
    ref,
    () => ({
      captureFromVideo: handleCapture,
      openNativeCamera: handleOpenNativeCamera,
    }),
    [handleCapture, handleOpenNativeCamera],
  );

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-slate-950 shadow-sm aspect-[4/3] w-full shrink-0 border border-slate-800">
        {step === 'camera' && !cameraError && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />
        )}
        {step === 'preview' && previewUrl && (
          <img src={previewUrl} alt="Ảnh chụp chấm công" className="h-full w-full object-cover" />
        )}

        {step === 'camera' && cameraError && (
          <div className="flex h-full flex-col items-center justify-center gap-2.5 p-4 text-center">
            <div className="rounded-full bg-teal-500/20 p-3.5 border border-teal-500/30">
              <Camera size={26} className="text-teal-400" />
            </div>
            <div className="space-y-1 max-w-xs">
              <p className="text-sm font-semibold text-white">Chế độ Camera máy (Native)</p>
              <p className="text-xs text-slate-300 leading-relaxed">{cameraError}</p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenNativeCamera}
                leftIcon={<Camera size={15} />}
                className="bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-md cursor-pointer active:scale-95"
              >
                Mở Camera máy
              </Button>
              {isWebRtcSupported && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetryCamera}
                  leftIcon={<RefreshCw size={12} />}
                  className="text-slate-300 border-white/20 hover:bg-white/10 rounded-xl cursor-pointer"
                >
                  Thử lại
                </Button>
              )}
            </div>
          </div>
        )}

        {step === 'camera' && !cameraError && (
          <>
            <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span className="text-[11px] font-medium tracking-wide">Trực tiếp</span>
            </div>

            <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/90 border border-white/10 shadow-xs text-[11px] font-mono">
              <Navigation
                size={11}
                className={
                  location
                    ? location.isCoarseWarning
                      ? 'text-amber-300'
                      : 'text-teal-300'
                    : 'text-amber-400'
                }
              />
              <span>
                {location ? `±${location.accuracy}m` : isLocating ? 'GPS...' : 'Mất GPS'}
              </span>
            </div>

            <div className="absolute inset-7 pointer-events-none border border-white/15 rounded-2xl flex flex-col justify-between p-2">
              <div className="flex justify-between">
                <div className="w-4 h-4 border-t-2 border-l-2 border-white/60 rounded-tl" />
                <div className="w-4 h-4 border-t-2 border-r-2 border-white/60 rounded-tr" />
              </div>
              <div className="flex justify-between">
                <div className="w-4 h-4 border-b-2 border-l-2 border-white/60 rounded-bl" />
                <div className="w-4 h-4 border-b-2 border-r-2 border-white/60 rounded-br" />
              </div>
            </div>
          </>
        )}

        {step === 'preview' && (
          <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-teal-300 border border-white/10 shadow-xs">
            <CheckCircle2 size={12} className="text-teal-400" />
            <span className="text-[11px] font-medium tracking-wide text-white">Ảnh đã sẵn sàng</span>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={handleNativeFileCapture}
      />
    </>
  );
});
