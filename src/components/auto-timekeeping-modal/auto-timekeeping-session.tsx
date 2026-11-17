'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Camera, Clock, LogIn, LogOut, Navigation, RefreshCw } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { autoTimekeeping } from '@/actions';
import { Button } from '@/components';
import { BASE_API_URL } from '@/config';
import { useAuthStore } from '@/stores';
import type { TimekeepingType } from '@/types';
import { getClientPlatform, NativeTracking, showErrorToast } from '@/utils';
import {
  TimekeepingCameraBox,
  UNSUPPORTED_CAMERA_MESSAGE,
  useIsWebRtcSupported,
  type TimekeepingCameraBoxHandle,
  type TimekeepingStep,
} from './timekeeping-camera-box';
import { TimekeepingLocationCard } from './timekeeping-location-card';
import { useAttendanceLocation } from './use-attendance-location';

function subscribeClock(callback: () => void): () => void {
  const id = setInterval(callback, 1000);
  return () => clearInterval(id);
}

function getClockSecondSnapshot(): number {
  return Math.floor(Date.now() / 1000);
}

function getClockSecondServerSnapshot(): number {
  return 0;
}

export interface AutoTimekeepingSessionProps {
  isOpen: boolean;
  hasCheckedIn: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onSubmittingChange: (submitting: boolean) => void;
}

export function AutoTimekeepingSession({
  isOpen,
  hasCheckedIn,
  onClose,
  onSuccess,
  onSubmittingChange,
}: AutoTimekeepingSessionProps) {
  const queryClient = useQueryClient();
  const cameraBoxRef = useRef<TimekeepingCameraBoxHandle>(null);

  const [step, setStep] = useState<TimekeepingStep>('camera');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const isWebRtcSupported = useIsWebRtcSupported();
  const effectiveCameraError = !isWebRtcSupported ? UNSUPPORTED_CAMERA_MESSAGE : cameraError;

  const epochSeconds = useSyncExternalStore(
    subscribeClock,
    getClockSecondSnapshot,
    getClockSecondServerSnapshot,
  );

  const nowDate = epochSeconds > 0 ? new Date(epochSeconds * 1000) : null;
  const currentTime = nowDate
    ? nowDate.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '--:--:--';
  const currentDate = nowDate
    ? nowDate.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    : '';

  const cameraSettlementRef = useRef<{ promise: Promise<void>; resolve: () => void } | null>(null);
  const getCameraSettlement = useCallback(() => {
    if (!cameraSettlementRef.current) {
      let resolveFn = () => {};
      const promise = new Promise<void>((resolve) => {
        resolveFn = resolve;
      });
      cameraSettlementRef.current = { promise, resolve: resolveFn };
    }
    return cameraSettlementRef.current;
  }, []);

  const waitForCameraPrompt = useCallback(
    () => getCameraSettlement().promise,
    [getCameraSettlement],
  );
  const notifyCameraSettled = useCallback(() => {
    getCameraSettlement().resolve();
  }, [getCameraSettlement]);

  const actionType: TimekeepingType = hasCheckedIn ? 'check_out' : 'check_in';

  const {
    location,
    locationFailure,
    isLocating,
    retryLocation,
    requestPermissionAndRetry,
    openAppSettings,
    openLocationSettings,
    upgradeToAlwaysPermission,
    pauseForExternalCapture,
    notifyExternalCaptureReturned,
  } = useAttendanceLocation({
    enabled: isOpen,
    actionType,
    waitForCameraPrompt,
  });

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleCaptured = useCallback((file: File, nextPreviewUrl: string) => {
    setCapturedFile(file);
    setPreviewUrl(nextPreviewUrl);
    setStep('preview');
  }, []);

  const handleRetake = useCallback(() => {
    setPreviewUrl(null);
    setCapturedFile(null);
    setStep('camera');
    setCameraError(null);
    if (!isWebRtcSupported) {
      cameraBoxRef.current?.openNativeCamera();
    }
  }, [isWebRtcSupported]);

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
    onSubmittingChange(true);
    try {
      await autoTimekeeping(
        {
          latitude: location.lat,
          longitude: location.lng,
          accuracy: location.accuracy,
          locationSource: location.source,
          isPreciseLocation: location.isPrecise,
          note: note || undefined,
          type,
          platform: getClientPlatform(),
        },
        capturedFile,
      );

      if (Capacitor.isNativePlatform()) {
        try {
          if (type === 'check_in') {
            const authState = useAuthStore.getState();
            await NativeTracking.startTracking({
              token: authState.accessToken,
              refreshToken: authState.refreshToken,
              apiUrl: BASE_API_URL,
            });
          } else if (type === 'check_out') {
            await NativeTracking.stopTracking();
          }
        } catch (nativeErr: unknown) {
          console.warn('[AutoTimekeepingModal] Không thể cập nhật Native Tracking tức thời:', nativeErr);
        }
      }

      await queryClient.invalidateQueries({ queryKey: ['my-today-attendance'] });
      await queryClient.invalidateQueries({ queryKey: ['attendances'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });

      const label = type === 'check_in' ? 'Check-in' : 'Check-out';
      toast.success(`${label} thành công!`);
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      showErrorToast(err, 'Chấm công thất bại, vui lòng thử lại');
    } finally {
      setIsSubmitting(false);
      onSubmittingChange(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 flex flex-col space-y-3">
        <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-primary to-primary/90 px-3.5 py-2.5 text-white shadow-xs shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-white/15 p-2">
              <Clock size={16} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-white/75">
                Thời gian hiện tại
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-lg sm:text-xl font-bold tracking-tight font-mono tabular-nums">
                  {currentTime}
                </span>
                <span className="text-[10px] sm:text-xs text-white/80 capitalize hidden sm:inline">
                  {currentDate}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] sm:text-xs text-white/80 capitalize block sm:hidden">
              {currentDate}
            </span>
            <div className="flex items-center justify-end gap-1 text-[11px] font-medium text-white/90">
              <Navigation size={11} className={location ? 'text-teal-200' : 'text-white/60'} />
              <span>{location ? 'GPS Sẵn sàng' : isLocating ? 'Đang lấy GPS...' : 'Chưa có GPS'}</span>
            </div>
          </div>
        </div>

        <TimekeepingCameraBox
          ref={cameraBoxRef}
          isOpen={isOpen}
          step={step}
          previewUrl={previewUrl}
          isWebRtcSupported={isWebRtcSupported}
          cameraError={effectiveCameraError}
          location={location}
          isLocating={isLocating}
          onCameraErrorChange={setCameraError}
          onCaptured={handleCaptured}
          onCameraSettled={notifyCameraSettled}
          onBeforeExternalCapture={pauseForExternalCapture}
          onAfterExternalCapture={notifyExternalCaptureReturned}
        />

        <TimekeepingLocationCard
          location={location}
          locationFailure={locationFailure}
          isLocating={isLocating}
          onRetry={retryLocation}
          onRequestPermission={requestPermissionAndRetry}
          onOpenSettings={openAppSettings}
          onOpenLocationSettings={openLocationSettings}
          onUpgradeAlwaysPermission={upgradeToAlwaysPermission}
        />

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
      </div>

      <div className="flex items-center justify-end gap-3 p-3.5 sm:p-4 border-t border-gray-100 bg-gray-50/80 rounded-b-none md:rounded-b-xl shrink-0">
        {step === 'camera' ? (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() =>
              effectiveCameraError
                ? cameraBoxRef.current?.openNativeCamera()
                : cameraBoxRef.current?.captureFromVideo()
            }
            disabled={isSubmitting}
            leftIcon={<Camera size={18} />}
            className="py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base shadow-md shadow-primary/20 active:scale-[0.99] transition-all cursor-pointer"
          >
            {effectiveCameraError ? 'Mở Camera máy chụp ảnh' : 'Chụp ảnh chấm công'}
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
              onClick={() => handleSubmit(actionType)}
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
    </div>
  );
}
