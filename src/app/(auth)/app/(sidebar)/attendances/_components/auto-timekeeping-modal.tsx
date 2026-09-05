'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Button, Textarea, Badge } from '@/components';
import { toast } from 'react-hot-toast';
import { autoTimekeeping, sendLocationPing } from '@/actions';
import { TimekeepingType } from '@/types';
import { Camera, RefreshCw, MapPin, Clock, LogIn, LogOut, Loader2, AlertCircle, CheckCircle2, Navigation } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface Props {
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

export default function AutoTimekeepingModal({ open, onClose, onSuccess, hasCheckedIn = false }: Props) {
  const queryClient = useQueryClient()
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [step, setStep] = useState<Step>('camera');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [location, setLocation] = useState<GpsCoords | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [note, setNote] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Đồng hồ thời gian thực
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
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

  // Lấy GPS với cơ chế Fallback thông minh 2 tầng
  const fetchLocation = useCallback(() => {
    setIsLocating(true);
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError('Trình duyệt không hỗ trợ định vị GPS.');
      setIsLocating(false);
      return;
    }

    // Tầng 1: Thử GPS độ chính xác cao trong 5 giây
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
        });
        setIsLocating(false);
      },
      () => {
        // Tầng 2: Tự động fallback sang định vị WiFi / IP mạng với timeout 15s và chấp nhận cache
        navigator.geolocation.getCurrentPosition(
          (fallbackPos) => {
            setLocation({
              lat: fallbackPos.coords.latitude,
              lng: fallbackPos.coords.longitude,
              accuracy: Math.round(fallbackPos.coords.accuracy),
            });
            setIsLocating(false);
          },
          (fallbackErr) => {
            console.warn('[AutoTimekeeping] Fallback geolocation failed:', fallbackErr);
            setLocationError('Không lấy được vị trí GPS/WiFi. Vui lòng kiểm tra lại quyền truy cập vị trí trên Windows/Trình duyệt.');
            setIsLocating(false);
          },
          { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 },
        );
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 },
    );
  }, []);

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
      // Kích hoạt ngay 1 ping định vị tức thì lên Live Map khi Check-in
      if (type === 'check_in') {
        sendLocationPing({
          latitude: location.lat,
          longitude: location.lng,
          accuracy: location.accuracy || undefined,
        }).catch((err) => console.warn('[AutoTimekeeping] Init ping error:', err));
      }

      const label = type === 'check_in' ? 'Check-in' : 'Check-out';
      toast.success(`${label} thành công! 🎉`);
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr?.response?.data?.message || 'Chấm công thất bại. Vui lòng thử lại.');
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
      title="Chấm công tự động"
      size="xl"
    >
      <div className="flex flex-col gap-5 py-2">
        {/* Đồng hồ & GPS header */}
        <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-primary to-primary/85 px-5 py-4 text-white shadow-md">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/20 p-2.5">
              <Clock size={22} className="text-white" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/70">Thời gian hiện tại</p>
              <p className="text-2xl font-bold tracking-normal">{currentTime}</p>
              <p className="mt-0.5 text-xs capitalize text-white/80">{currentDate}</p>
            </div>
          </div>
          <div className="text-right">
            {location ? (
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1.5 text-xs text-white/90">
                  <Navigation size={12} />
                  <span className="font-semibold">GPS đã kết nối</span>
                </div>
                <p className="font-mono text-[11px] text-white/70">
                  {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                </p>
                <p className="text-[10px] text-white/60">±{location.accuracy}m</p>
              </div>
            ) : isLocating ? (
              <div className="flex items-center gap-1.5 text-xs text-white/80">
                <Loader2 size={13} className="animate-spin" />
                <span>Đang định vị...</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-red-200">
                <AlertCircle size={13} />
                <span>Chưa có GPS</span>
              </div>
            )}
          </div>
        </div>

        {/* Camera/Preview + Map */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Camera / Preview */}
          <div className="flex flex-col gap-3">
            <div className="relative overflow-hidden rounded-2xl bg-slate-900 shadow-lg" style={{ aspectRatio: '4/3' }}>
              {step === 'camera' && !cameraError && (
                <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" style={{ transform: 'scaleX(-1)' }} />
              )}
              {step === 'preview' && previewUrl && <img src={previewUrl} alt="Ảnh chụp chấm công" className="h-full w-full object-cover" />}
              {cameraError && (
                <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
                  <div className="rounded-full bg-red-500/20 p-4">
                    <Camera size={32} className="text-red-400" />
                  </div>
                  <p className="text-sm text-slate-300">{cameraError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={startCamera}
                    leftIcon={<RefreshCw size={13} />}
                    className="mt-1 text-white border-white/20 hover:bg-white/10 hover:text-white"
                  >
                    Thử lại
                  </Button>
                </div>
              )}
              {step === 'camera' && !cameraError && (
                <div className="absolute left-3 top-3">
                  <Badge variant="danger" pill size="sm" className="gap-1.5 shadow">
                    <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-red-700" />
                    LIVE
                  </Badge>
                </div>
              )}
              {step === 'preview' && (
                <div className="absolute left-3 top-3">
                  <Badge variant="success" pill size="sm" className="gap-1 shadow">
                    <CheckCircle2 size={11} /> ẢNH ĐÃ CHỤP
                  </Badge>
                </div>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />

            <div className="flex gap-2">
              {step === 'camera' && (
                <Button variant="primary" onClick={handleCapture} disabled={!!cameraError || isSubmitting} leftIcon={<Camera size={16} />} fullWidth>
                  Chụp ảnh
                </Button>
              )}
              {step === 'preview' && (
                <Button variant="outline" onClick={handleRetake} disabled={isSubmitting} leftIcon={<RefreshCw size={15} />} fullWidth>
                  Chụp lại
                </Button>
              )}
            </div>
          </div>

          {/* Map GPS */}
          <div className="flex flex-col gap-3">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow" style={{ aspectRatio: '4/3' }}>
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
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
                  <div className="rounded-full bg-slate-200 p-4">
                    <MapPin size={28} className="text-slate-400" />
                  </div>
                  {isLocating ? (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Loader2 size={16} className="animate-spin" />
                      Đang lấy vị trí GPS...
                    </div>
                  ) : locationError ? (
                    <div className="space-y-2">
                      <p className="text-xs text-red-500">{locationError}</p>
                      <Button variant="outline" size="xs" onClick={fetchLocation} leftIcon={<RefreshCw size={12} />}>
                        Thử lại
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">Đang chờ tín hiệu GPS...</p>
                  )}
                </div>
              )}
            </div>
            {location && (
              <a
                href={mapsLinkUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-600 shadow-xs hover:border-primary/50 hover:text-primary transition"
              >
                <MapPin size={14} className="shrink-0 text-primary" />
                <span className="truncate font-mono">
                  {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </span>
                <span className="ml-auto shrink-0 text-[12px] text-slate-400">Mở Maps ↗</span>
              </a>
            )}
          </div>
        </div>

        {/* Ghi chú */}
        <div>
          <Textarea
            label="Ghi chú (tuỳ chọn)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="VD: Làm việc ngoài văn phòng, công tác..."
            rows={2}
            disabled={isSubmitting}
            fullWidth
          />
        </div>

        {/* Nút Check-in / Check-out */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="primary"
            size="lg"
            id={hasCheckedIn ? 'btn-check-out' : 'btn-check-in'}
            onClick={() => handleSubmit(hasCheckedIn ? 'check_out' : 'check_in')}
            disabled={step !== 'preview' || !location || isSubmitting}
            loading={isSubmitting}
            leftIcon={hasCheckedIn ? <LogOut size={17} /> : <LogIn size={17} />}
            fullWidth
            className="py-3 font-bold shadow-md shadow-primary/20"
          >
            {hasCheckedIn ? 'Check-out' : 'Check-in'}
          </Button>
        </div>

        {step !== 'preview' && (
          <p className="text-center text-xs text-slate-400">⬆ Chụp ảnh trước để kích hoạt nút {hasCheckedIn ? 'Check-out' : 'Check-in'}</p>
        )}
      </div>
    </Modal>
  );
}
