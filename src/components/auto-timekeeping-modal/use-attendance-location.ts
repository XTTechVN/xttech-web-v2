'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { reportTrackingDiagnostic } from '@/actions';
import {
  APP_VERSION,
  ATTENDANCE_GPS_FRESHNESS_TTL_MS,
  ATTENDANCE_GPS_STAGE3_COOLDOWN_MS,
} from '@/config';
import type {
  HybridLocationFailure,
  HybridLocationFix,
  TimekeepingType,
} from '@/types';
import {
  acquireHybridPosition,
  getClientPlatform,
  NativeTracking,
  openNativeAppSettings,
  openNativeLocationSettings,
  requestNativeLocationPermission,
  type DiagnosticEventDraft,
  type HybridAcquisitionController,
} from '@/utils';

export interface UseAttendanceLocationOptions {
  enabled: boolean;
  actionType: TimekeepingType;
  waitForCameraPrompt: () => Promise<void>;
}

export function useAttendanceLocation({
  enabled,
  actionType,
  waitForCameraPrompt,
}: UseAttendanceLocationOptions) {
  const [location, setLocation] = useState<HybridLocationFix | null>(null);
  const [locationFailure, setLocationFailure] = useState<HybridLocationFailure | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(() => enabled);

  if (!enabled && isLocating) {
    setIsLocating(false);
  }

  const controllerRef = useRef<HybridAcquisitionController | null>(null);
  const latestLocationRef = useRef<HybridLocationFix | null>(null);
  const latestFailureRef = useRef<HybridLocationFailure | null>(null);
  const wasPausedForExternalCaptureRef = useRef(false);
  const wasFailedBeforeBackgroundRef = useRef(false);
  const lastTriggerAtRef = useRef(0);
  const attemptCountRef = useRef(0);
  const reportedDiagKeysRef = useRef<Set<string>>(new Set());

  const emitDiagnostic = useCallback(
    (draft: DiagnosticEventDraft) => {
      const dedupKey = `${draft.event}:${draft.errorCode ?? 'none'}`;
      if (reportedDiagKeysRef.current.has(dedupKey)) {
        return;
      }
      reportedDiagKeysRef.current.add(dedupKey);

      reportTrackingDiagnostic({
        ...draft,
        actionType,
        platform: getClientPlatform(),
        appVersion: APP_VERSION,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      }).catch(() => {});
    },
    [actionType],
  );

  const launchAcquisition = useCallback(
    (opts?: { reportRecoveryOnFix?: boolean }) => {
      controllerRef.current?.cancel();
      attemptCountRef.current += 1;
      const attemptNumber = attemptCountRef.current;

      let recoveryReported = false;
      const shouldReportRecovery = Boolean(opts?.reportRecoveryOnFix);

      const controller = acquireHybridPosition(
        {
          onFix: (fix) => {
            latestLocationRef.current = fix;
            latestFailureRef.current = null;
            setLocation(fix);
            setLocationFailure(null);
            setIsLocating(false);

            if (shouldReportRecovery && !recoveryReported) {
              recoveryReported = true;
              wasFailedBeforeBackgroundRef.current = false;
              emitDiagnostic({
                event: 'attendance_gps_recovered',
                source: fix.source,
                accuracyMeters: fix.accuracy,
                authorizationStatus: fix.authorizationStatus,
                isPreciseLocation: fix.isPrecise,
                locationEnabled: fix.locationEnabled,
                isLowPowerMode: fix.isLowPowerMode,
                attemptNumber,
              });
            }
          },
          onError: (failure) => {
            latestFailureRef.current = failure;
            wasFailedBeforeBackgroundRef.current = true;
            setLocationFailure(failure);
            setIsLocating(false);
          },
          onDiagnostic: emitDiagnostic,
        },
        {
          waitForCameraPrompt,
          attemptNumber,
          allowBackgroundRefinement: true,
        },
      );

      controllerRef.current = controller;
    },
    [emitDiagnostic, waitForCameraPrompt],
  );

  const resumeFromBackgroundOrCapture = useCallback(() => {
    if (!enabled) return;

    const current = latestLocationRef.current;
    const failure = latestFailureRef.current;
    const now = Date.now();

    const isFresh =
      Boolean(current) &&
      !current!.isRefining &&
      !failure &&
      now - current!.timestamp <= ATTENDANCE_GPS_FRESHNESS_TTL_MS;

    if (isFresh) {
      wasPausedForExternalCaptureRef.current = false;
      return;
    }

    const isAcquiring = controllerRef.current?.isActive() ?? false;
    if (
      !wasPausedForExternalCaptureRef.current &&
      (isAcquiring || now - lastTriggerAtRef.current < ATTENDANCE_GPS_STAGE3_COOLDOWN_MS)
    ) {
      return;
    }

    const shouldReportRecovery = Boolean(failure) || wasFailedBeforeBackgroundRef.current;
    wasPausedForExternalCaptureRef.current = false;
    lastTriggerAtRef.current = now;

    if (!current) {
      setIsLocating(true);
      setLocationFailure(null);
    }
    launchAcquisition({ reportRecoveryOnFix: shouldReportRecovery });
  }, [enabled, launchAcquisition]);

  useEffect(() => {
    if (!enabled) {
      controllerRef.current?.cancel();
      controllerRef.current = null;
      return;
    }

    launchAcquisition({ reportRecoveryOnFix: false });

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        resumeFromBackgroundOrCapture();
      }
    };
    const handleWindowFocus = () => {
      resumeFromBackgroundOrCapture();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    let isPermCancelled = false;
    let permStatus: PermissionStatus | null = null;
    const handlePermissionChange = () => {
      if (isPermCancelled || !permStatus) return;
      if (permStatus.state === 'granted') {
        lastTriggerAtRef.current = Date.now();
        setIsLocating(true);
        setLocationFailure(null);
        launchAcquisition({
          reportRecoveryOnFix: Boolean(latestFailureRef.current) || wasFailedBeforeBackgroundRef.current,
        });
      } else if (permStatus.state === 'denied') {
        const deniedFailure: HybridLocationFailure = {
          errorCode: 'permission_denied',
          errorMessage: 'Quyền truy cập vị trí đã bị từ chối.',
          authorizationStatus: 'denied',
          locationEnabled: latestFailureRef.current?.locationEnabled ?? true,
          isLowPowerMode: latestFailureRef.current?.isLowPowerMode ?? false,
          isPrecise: false,
          canOpenSettings: Capacitor.isNativePlatform(),
          canOpenLocationSettings: Capacitor.isNativePlatform(),
          canRequestPermission: false,
        };
        latestFailureRef.current = deniedFailure;
        wasFailedBeforeBackgroundRef.current = true;
        setLocationFailure(deniedFailure);
        setIsLocating(false);
      }
    };

    if (typeof navigator !== 'undefined' && navigator.permissions) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((status) => {
          if (isPermCancelled) return;
          permStatus = status;
          status.addEventListener('change', handlePermissionChange);
        })
        .catch(() => {});
    }

    return () => {
      isPermCancelled = true;
      controllerRef.current?.cancel();
      controllerRef.current = null;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      if (permStatus) {
        permStatus.removeEventListener('change', handlePermissionChange);
      }
    };
  }, [enabled, launchAcquisition, resumeFromBackgroundOrCapture]);

  const retryLocation = useCallback(() => {
    if (!enabled) return;
    wasPausedForExternalCaptureRef.current = false;
    lastTriggerAtRef.current = Date.now();
    setIsLocating(true);
    setLocationFailure(null);
    launchAcquisition({
      reportRecoveryOnFix: Boolean(latestFailureRef.current) || wasFailedBeforeBackgroundRef.current,
    });
  }, [enabled, launchAcquisition]);

  const requestPermissionAndRetry = useCallback(async () => {
    await requestNativeLocationPermission();
    retryLocation();
  }, [retryLocation]);

  const openAppSettings = useCallback(async () => {
    await openNativeAppSettings();
  }, []);

  const openLocationSettings = useCallback(async () => {
    await openNativeLocationSettings();
  }, []);

  const upgradeToAlwaysPermission = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;
    if (NativeTracking.ensureAlwaysPermission) {
      try {
        await NativeTracking.ensureAlwaysPermission();
        return;
      } catch {
        // Fallback to App Settings below
      }
    }
    await openNativeAppSettings();
  }, []);

  const pauseForExternalCapture = useCallback(() => {
    wasPausedForExternalCaptureRef.current = true;
    controllerRef.current?.pauseForExternalCapture();
  }, []);

  const notifyExternalCaptureReturned = useCallback(() => {
    resumeFromBackgroundOrCapture();
  }, [resumeFromBackgroundOrCapture]);

  return {
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
  };
}
