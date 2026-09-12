/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Button } from '@/components';
import { toast } from 'react-hot-toast';
import { autoTimekeeping } from '@/actions';
import { TimekeepingType } from '@/types';
import { Camera, RefreshCw, MapPin, Clock, LogIn, LogOut, Loader2, CheckCircle2, Navigation, Lock, } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { showErrorToast } from '@/utils';

export interface AutoTimekeepingModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  hasCheckedIn?: boolean;
}

type Step = 'camera' | 'preview';

interface GpsCoords {
  lat: number;
  lng: number;
  accuracy: number;
}

export default function AutoTimekeepingModal({ open, onClose, onSuccess, hasCheckedIn = false }: AutoTimekeepingModalProps) {
  const queryClient = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [step, setStep] = useState<Step>('camera');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [location, setLocation] = useState<GpsCoords | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [guidePlatform, setGuidePlatform] = useState<'android' | 'ios' | 'desktop'>('android');
  const [isLocating, setIsLocating] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [note, setNote] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Phát hiện thiết bị người dùng (Android / iOS / Desktop)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent || '';
      if (/iphone|ipad|ipod/i.test(ua)) {
        setGuidePlatform('ios');
      } else if (/android/i.test(ua)) {
        setGuidePlatform('android');
      } else {
        setGuidePlatform('desktop');
      }
    }
  }, []);

  // Đồng hồ thời gian thực
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      );
      setCurrentDate(
        now.toLocaleDateString('vi-VN', {
          weekday: 'long',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }),
      );
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Bật camera
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCameraError('Không thể truy cập camera. Vui lòng cấp quyền camera và thử lại.');
    }
  }, []);

  // Lấy GPS với fallback 2 tầng (High Accuracy -> Standard Network)
  const fetchLocation = useCallback(() => {
    setIsLocating(true);
    setLocationError(null);
    setPermissionDenied(false);

    if (!navigator.geolocation) {
      setLocationError('Trình duyệt không hỗ trợ định vị GPS.');
      setIsLocating(false);
      return;
    }

    const requestPosition = (enableHighAccuracy: boolean, isRetry = false) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
          });
          setLocationError(null);
          setPermissionDenied(false);
          setIsLocating(false);
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            setPermissionDenied(true);
            setLocationError('Quyền truy cập vị trí đã bị từ chối.');
            setIsLocating(false);
          } else if (!isRetry && (err.code === err.TIMEOUT || err.code === err.POSITION_UNAVAILABLE)) {
            // Thử lại tầng 2 với độ chính xác mạng nếu GPS yếu
            requestPosition(false, true);
          } else {
            setPermissionDenied(false);
            setLocationError(
              err.code === err.TIMEOUT
                ? 'Quá thời gian lấy vị trí GPS. Hãy kiểm tra kết nối mạng và thử lại.'
                : 'Không thể xác định vị trí. Hãy bật GPS trên thiết bị và thử lại.',
            );
            setIsLocating(false);
          }
        },
        {
          enableHighAccuracy,
          timeout: enableHighAccuracy ? 8000 : 12000,
          maximumAge: 0,
        },
      );
    };

    requestPosition(true, false);
  }, []);

  // Tự động lắng nghe khi người dùng bật lại quyền trên thanh địa chỉ URL
  useEffect(() => {
    if (!open || typeof navigator === 'undefined' || !navigator.permissions) return;

    let permStatus: PermissionStatus | null = null;
    navigator.permissions
      .query({ name: 'geolocation' as PermissionName })
      .then((status) => {
        permStatus = status;
        const handlePermissionChange = () => {
          if (status.state === 'granted') {
            setPermissionDenied(false);
            fetchLocation();
          } else if (status.state === 'denied') {
            setPermissionDenied(true);
          }
        };
        status.addEventListener('change', handlePermissionChange);
      })
      .catch(() => {});

    return () => {
      if (permStatus) {
        permStatus.onchange = null;
      }
    };
  }, [open, fetchLocation]);

  // Khởi động khi modal mở
  useEffect(() => {
    if (open) {
      setStep('camera');
      setPreviewUrl(null);
      setCapturedFile(null);
      setNote('');
      setIsSubmitting(false);
      startCamera();
      fetchLocation();
    } else {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, [open, startCamera, fetchLocation]);

  // Chụp ảnh từ video
  const handleCapture = () => {
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
        const timestamp = Date.now();
        const file = new File([blob], `timekeeping-${timestamp}.jpg`, { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        setCapturedFile(file);
        setPreviewUrl(url);
        setStep('preview');
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      },
      'image/jpeg',
      0.9,
    );
  };

  // Chụp lại
  const handleRetake = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCapturedFile(null);
    setStep('camera');
    startCamera();
  };

  // Gửi chấm công
  const handleSubmit = async (type: TimekeepingType) => {
    if (!capturedFile) {
      toast.error('Vui lòng chụp ảnh trước khi chấm công.');
      return;
    }
    if (!location) {
      toast.error('Chưa lấy được vị trí GPS. Vui lòng thử lại.');
      return;
    }

    setIsSubmitting(true);
    try {
      await autoTimekeeping(
        {
          latitude: location.lat,
          longitude: location.lng,
          note: note || undefined,
          type,
        },
        capturedFile,
      );

      await queryClient.invalidateQueries({ queryKey: ['my-today-attendance'] });
      await queryClient.invalidateQueries({ queryKey: ['attendances'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });

      const label = type === 'check_in' ? 'Check-in' : 'Check-out';
      toast.success(`${label} thành công! 🎉`);
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      showErrorToast(err, 'Chấm công thất bại, vui lòng thử lại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const mapsEmbedUrl = location ? `https://maps.google.com/maps?q=${location.lat},${location.lng}&z=16&output=embed` : null;
  const mapsLinkUrl = location ? `https://www.google.com/maps?q=${location.lat},${location.lng}` : null;

  return (
    <Modal
      isOpen={open}
      onClose={() => {
        if (!isSubmitting) onClose();
      }}
      title={
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
          <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {hasCheckedIn ? 'Chấm công Tan ca' : 'Chấm công Vào ca'}
          </span>
        </div>
      }
      size="md"
      className="max-md:!m-0 max-md:!my-0 max-md:!h-dvh max-md:!max-h-dvh max-md:!w-full max-md:!rounded-none max-md:!border-none md:max-w-lg"
      bodyClassName="!p-3 sm:!p-4 flex flex-col space-y-3 overflow-y-auto max-h-[calc(100dvh-135px)] md:max-h-[70vh]"
      footer={
        <div className="w-full">
          {step === 'camera' ? (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleCapture}
              disabled={!!cameraError || isSubmitting}
              leftIcon={<Camera size={18} />}
              className="py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base shadow-md shadow-primary/20 active:scale-[0.99] transition-all cursor-pointer"
            >
            Chụp ảnh chấm công
            </Button>
          ) : (
            <div className="flex items-center gap-2.5 w-full">
              <Button
                variant="outline"
                size="lg"
                onClick={handleRetake}
                disabled={isSubmitting}
                leftIcon={<RefreshCw size={15} />}
                className="px-4 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-semibold border-slate-200 text-slate-700 hover:bg-slate-100 shrink-0 cursor-pointer"
              >
                Chụp lại
              </Button>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                id={hasCheckedIn ? 'btn-check-out' : 'btn-check-in'}
                onClick={() => handleSubmit(hasCheckedIn ? 'check_out' : 'check_in')}
                disabled={!location || isSubmitting}
                loading={isSubmitting}
                leftIcon={hasCheckedIn ? <LogOut size={18} /> : <LogIn size={18} />}
                className="py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base shadow-md shadow-primary/20 active:scale-[0.99] transition-all flex-1 cursor-pointer"
              >
                {hasCheckedIn ? 'Xác nhận Check-out' : 'Xác nhận Check-in'}
              </Button>
            </div>
          )}
        </div>
      }
    >
      {/* 1. Banner Thời gian thực */}
      <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-primary to-primary/90 px-3.5 py-2.5 text-white shadow-xs shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-white/15 p-2">
            <Clock size={16} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-white/75">Thời gian hiện tại</p>
            <div className="flex items-baseline gap-2">
              <span className="text-lg sm:text-xl font-bold tracking-tight">{currentTime}</span>
              <span className="text-[10px] sm:text-xs text-white/80 capitalize hidden sm:inline">{currentDate}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] sm:text-xs text-white/80 capitalize block sm:hidden">{currentDate}</span>
          <div className="flex items-center justify-end gap-1 text-[11px] font-medium text-white/90">
            <Navigation size={11} className={location ? 'text-teal-200' : 'text-white/60'} />
            <span>{location ? 'GPS Sẵn sàng' : isLocating ? 'Đang lấy GPS...' : 'Chưa có GPS'}</span>
          </div>
        </div>
      </div>

      {/* 2. Khung Camera / Ảnh chụp với Dark Semi-Transparent Badges */}
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

        {/* Lỗi camera */}
        {cameraError && (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
            <div className="rounded-full bg-red-500/20 p-3">
              <Camera size={24} className="text-red-400" />
            </div>
            <p className="text-xs text-slate-300">{cameraError}</p>
            <Button
              variant="outline"
              size="xs"
              onClick={startCamera}
              leftIcon={<RefreshCw size={12} />}
              className="mt-1 text-white border-white/20 hover:bg-white/10 hover:text-white"
            >
              Thử lại
            </Button>
          </div>
        )}

        {/* Overlay Badges (Nền đen bán trong suốt rgba(0,0,0,0.6)) */}
        {step === 'camera' && !cameraError && (
          <>
            {/* Live Indicator với red dot nhấp nháy */}
            <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span className="text-[11px] font-medium tracking-wide">Trực tiếp</span>
            </div>

            {/* GPS Status Badge trên camera */}
            <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/90 border border-white/10 shadow-xs text-[11px] font-mono">
              <Navigation size={11} className={location ? 'text-teal-300' : 'text-amber-400'} />
              <span>{location ? `±${location.accuracy}m` : isLocating ? 'GPS...' : 'Mất GPS'}</span>
            </div>

            {/* 4 Góc khung ngắm khuôn mặt (Face ID Reticle) */}
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

      {/* 3. Card UI: Toạ độ + Bản đồ */}
      <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3 space-y-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center text-primary">
              <MapPin size={13} />
            </div>
            <span className="text-xs font-semibold text-slate-800">Toạ độ & Vị trí hiện tại</span>
          </div>

          {location && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md font-mono">
                ±{location.accuracy}m
              </span>
              {mapsLinkUrl && (
                <a
                  href={mapsLinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-medium text-primary hover:underline inline-flex items-center gap-0.5"
                >
                  <span>Maps</span>
                  <span className="text-[10px]">↗</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Khung bản đồ mini hoặc hướng dẫn quyền */}
        <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-white h-24 sm:h-28 w-full">
          {mapsEmbedUrl ? (
            <iframe
              src={mapsEmbedUrl}
              title="Vị trí hiện tại"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full w-full"
            />
          ) : permissionDenied ? (
            <div className="flex h-full flex-col justify-between p-2.5 bg-gradient-to-b from-amber-50/90 to-white text-slate-800 text-left overflow-y-auto">
              <div>
                <div className="flex items-center justify-between pb-1 border-b border-amber-200">
                  <div className="flex items-center gap-1.5">
                    <div className="p-0.5 bg-amber-500 text-white rounded">
                      <Lock size={11} />
                    </div>
                    <span className="font-bold text-[11px] text-amber-900">Quyền vị trí bị từ chối</span>
                  </div>
                  <div className="flex bg-slate-200/80 p-0.5 rounded text-[9px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setGuidePlatform('android')}
                      className={`px-1.5 py-0.5 rounded transition ${
                        guidePlatform === 'android' ? 'bg-white text-primary shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      Android
                    </button>
                    <button
                      type="button"
                      onClick={() => setGuidePlatform('ios')}
                      className={`px-1.5 py-0.5 rounded transition ${
                        guidePlatform === 'ios' ? 'bg-white text-primary shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      iPhone
                    </button>
                    <button
                      type="button"
                      onClick={() => setGuidePlatform('desktop')}
                      className={`px-1.5 py-0.5 rounded transition ${
                        guidePlatform === 'desktop' ? 'bg-white text-primary shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      PC
                    </button>
                  </div>
                </div>
                <div className="mt-1 text-[10px] text-slate-700 leading-tight">
                  {guidePlatform === 'android' && <p>Cài đặt &rarr; Ứng dụng &rarr; XTTech &rarr; Bật Quyền Vị trí.</p>}
                  {guidePlatform === 'ios' && <p>Cài đặt iPhone &rarr; Quyền riêng tư &rarr; Định vị &rarr; Bật Khi dùng app.</p>}
                  {guidePlatform === 'desktop' && <p>Bấm biểu tượng Ổ khóa bên trái URL &rarr; Bật Cho phép Vị trí.</p>}
                </div>
              </div>
              <div className="pt-1 flex justify-end">
                <Button
                  variant="primary"
                  size="xs"
                  onClick={fetchLocation}
                  disabled={isLocating}
                  leftIcon={<RefreshCw size={10} className={isLocating ? 'animate-spin' : ''} />}
                  className="px-2 py-0.5 text-[10px]"
                >
                  {isLocating ? 'Đang lấy...' : 'Thử lại'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1 p-2 text-center">
              <MapPin size={18} className="text-slate-400" />
              {isLocating ? (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Loader2 size={12} className="animate-spin" />
                  <span>Đang kết nối GPS vệ tinh...</span>
                </div>
              ) : locationError ? (
                <div className="space-y-1">
                  <p className="text-[10px] text-red-500">{locationError}</p>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={fetchLocation}
                    leftIcon={<RefreshCw size={10} />}
                    className="text-[10px] py-0.5 px-2"
                  >
                    Thử lại
                  </Button>
                </div>
              ) : (
                <p className="text-[10px] text-slate-400">Đang đồng bộ tọa độ GPS...</p>
              )}
            </div>
          )}
        </div>

        {/* Thông số tọa độ */}
        {location && (
          <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono bg-white rounded-lg px-2.5 py-1.5 border border-slate-200/80">
            <span>Lat: {location.lat.toFixed(5)}</span>
            <span>Lng: {location.lng.toFixed(5)}</span>
            <span className="text-primary font-semibold">Độ chính xác: ±{location.accuracy}m</span>
          </div>
        )}
      </div>

      {/* 4. Card UI: Ghi chú */}
      <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3 space-y-1.5 shrink-0">
        <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
          <span>Ghi chú chấm công</span>
          <span className="text-[10px] font-normal text-slate-400">Không bắt buộc</span>
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Nhập ghi chú nếu đi công tác, làm việc ngoài văn phòng..."
          rows={2}
          disabled={isSubmitting}
          className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition resize-none leading-relaxed"
        />
      </div>
    </Modal>
  );
}
