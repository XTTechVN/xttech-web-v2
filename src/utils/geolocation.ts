import { Capacitor, registerPlugin } from '@capacitor/core';
import {
  ATTENDANCE_GPS_ACCEPTABLE_ACCURACY_METERS,
  ATTENDANCE_GPS_ASSIST_DELAY_MS,
  ATTENDANCE_GPS_COARSE_WARNING_METERS,
  ATTENDANCE_GPS_DESIRED_ACCURACY_METERS,
  ATTENDANCE_GPS_NATIVE_MAX_AGE_MS,
  ATTENDANCE_GPS_NATIVE_TIMEOUT_MS,
  ATTENDANCE_GPS_REFINE_BUDGET_MS,
  ATTENDANCE_GPS_WEBVIEW_BUDGET_MS,
  TRACKER_QUICK_PING_MAX_ACCURACY_METERS,
} from '@/config';
import type {
  DevicePlatform,
  DiagAuthStatus,
  DiagGpsErrorCode,
  DiagGpsSource,
  HybridLocationFailure,
  HybridLocationFix,
  NativeCurrentPositionResult,
  NativeTrackingPlugin,
  TrackingDiagEventPayload,
} from '@/types';

export const NativeTracking = registerPlugin<NativeTrackingPlugin>('NativeTracking');

let nativeGetCurrentPositionSupported: boolean | null = null;
let nativeCheckPermissionSupported: boolean | null = null;
let nativeRequestPermissionSupported: boolean | null = null;
let nativeOpenLocationSettingsSupported: boolean | null = null;

export function getClientPlatform(): DevicePlatform {
  const platform = Capacitor.getPlatform();
  if (platform === 'ios') return 'ios';
  if (platform === 'android') return 'android';
  return 'web';
}

export function isNativeGetCurrentPositionSupported(): boolean | null {
  return nativeGetCurrentPositionSupported;
}

export function isValidCoordinate(lat: number, lng: number): boolean {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return false;
  if (Math.abs(lat) < 1e-6 && Math.abs(lng) < 1e-6) return false;
  return true;
}

export function normalizeNativeAuthStatus(status?: string | null): DiagAuthStatus {
  switch (status) {
    case 'always':
      return 'always';
    case 'whenInUse':
    case 'when_in_use':
      return 'when_in_use';
    case 'denied':
      return 'denied';
    case 'restricted':
      return 'restricted';
    case 'notDetermined':
    case 'not_determined':
      return 'not_determined';
    default:
      return 'unknown';
  }
}

export function mapNativeToDiagGpsSource(provider?: string, source?: string): DiagGpsSource {
  if (source === 'cache' || source === 'service_cache' || provider === 'service_cache') {
    return 'native_cache';
  }
  switch (provider) {
    case 'fused':
      return 'native_fused';
    case 'gps':
      return 'native_gps';
    case 'network':
      return 'native_network';
    case 'passive':
      return 'native_passive';
    case 'corelocation':
      return 'native_corelocation';
    default:
      return 'native_unknown';
  }
}

export function mapGeolocationErrorCode(
  code: number | undefined,
  isLowPowerMode = false,
): DiagGpsErrorCode {
  if (code === 1) return 'permission_denied';
  if (code === 2) return isLowPowerMode ? 'battery_saver_restricted' : 'position_unavailable';
  if (code === 3) return isLowPowerMode ? 'battery_saver_restricted' : 'timeout';
  return 'unknown';
}

export function isCapacitorUnimplementedError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const candidate = err as { code?: unknown; message?: unknown };
  if (candidate.code === 'UNIMPLEMENTED' || candidate.code === 'UNAVAILABLE') {
    return true;
  }
  if (typeof candidate.message === 'string') {
    return /not implemented|unimplemented/i.test(candidate.message);
  }
  return false;
}

function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err) {
    const msg = (err as { message?: unknown }).message;
    if (typeof msg === 'string' && msg.trim().length > 0) return msg;
  }
  return 'Unknown geolocation error';
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface NativePermissionPreflight {
  authorizationStatus: DiagAuthStatus;
  isAlways: boolean;
  isPrecise: boolean;
  locationEnabled: boolean;
  isLowPowerMode: boolean;
  manufacturer?: string;
  isLegacyFallback: boolean;
}

export async function getNativePermissionPreflight(): Promise<NativePermissionPreflight | null> {
  if (!Capacitor.isNativePlatform()) return null;

  let manufacturer: string | undefined;
  if (Capacitor.getPlatform() === 'android' && NativeTracking.checkAndroidPermissions) {
    try {
      const androidPerms = await NativeTracking.checkAndroidPermissions();
      manufacturer = androidPerms.manufacturer;
      if (nativeCheckPermissionSupported === false) {
        return androidPerms.hasFineLocation
          ? {
              authorizationStatus: androidPerms.hasBackgroundLocation ? 'always' : 'when_in_use',
              isAlways: androidPerms.hasBackgroundLocation,
              isPrecise: true,
              locationEnabled: androidPerms.isLocationEnabled ?? true,
              isLowPowerMode: false,
              manufacturer,
              isLegacyFallback: true,
            }
          : {
              authorizationStatus: 'unknown',
              isAlways: false,
              isPrecise: false,
              locationEnabled: androidPerms.isLocationEnabled ?? true,
              isLowPowerMode: false,
              manufacturer,
              isLegacyFallback: true,
            };
      }
    } catch {
      // Ignore legacy checkAndroidPermissions errors and continue to checkPermission
    }
  }

  if (nativeCheckPermissionSupported !== false && NativeTracking.checkPermission) {
    try {
      const perm = await NativeTracking.checkPermission();
      nativeCheckPermissionSupported = true;
      return {
        authorizationStatus: normalizeNativeAuthStatus(perm.status),
        isAlways: Boolean(perm.isAlways),
        isPrecise: perm.isPrecise ?? true,
        locationEnabled: perm.locationEnabled ?? true,
        isLowPowerMode: Boolean(perm.isLowPowerMode),
        manufacturer,
        isLegacyFallback: false,
      };
    } catch (err: unknown) {
      if (isCapacitorUnimplementedError(err)) {
        nativeCheckPermissionSupported = false;
      }
    }
  }

  if (Capacitor.getPlatform() === 'android' && NativeTracking.checkAndroidPermissions) {
    try {
      const androidPerms = await NativeTracking.checkAndroidPermissions();
      return androidPerms.hasFineLocation
        ? {
            authorizationStatus: androidPerms.hasBackgroundLocation ? 'always' : 'when_in_use',
            isAlways: androidPerms.hasBackgroundLocation,
            isPrecise: true,
            locationEnabled: androidPerms.isLocationEnabled ?? true,
            isLowPowerMode: false,
            manufacturer: androidPerms.manufacturer,
            isLegacyFallback: true,
          }
        : {
            authorizationStatus: 'unknown',
            isAlways: false,
            isPrecise: false,
            locationEnabled: androidPerms.isLocationEnabled ?? true,
            isLowPowerMode: false,
            manufacturer: androidPerms.manufacturer,
            isLegacyFallback: true,
          };
    } catch {
      return null;
    }
  }

  return null;
}

export interface NativePermissionRequestOutcome {
  supported: boolean;
  granted?: boolean;
  authorizationStatus?: DiagAuthStatus;
  isPrecise?: boolean;
  locationEnabled?: boolean;
  canAskAgain?: boolean;
}

export async function requestNativeLocationPermission(): Promise<NativePermissionRequestOutcome> {
  if (!Capacitor.isNativePlatform() || nativeRequestPermissionSupported === false) {
    return { supported: false };
  }
  if (!NativeTracking.requestLocationPermission) {
    return { supported: false };
  }
  try {
    const res = await NativeTracking.requestLocationPermission();
    nativeRequestPermissionSupported = true;
    return {
      supported: true,
      granted: Boolean(res.granted),
      authorizationStatus: normalizeNativeAuthStatus(res.status),
      isPrecise: res.isPrecise ?? true,
      locationEnabled: res.locationEnabled ?? true,
      canAskAgain: Boolean(res.canAskAgain),
    };
  } catch (err: unknown) {
    if (isCapacitorUnimplementedError(err)) {
      nativeRequestPermissionSupported = false;
    }
    return { supported: false };
  }
}

export async function openNativeAppSettings(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  if (NativeTracking.openSettings) {
    try {
      const res = await NativeTracking.openSettings();
      return Boolean(res?.success);
    } catch {
      // Fallback below
    }
  }
  if (nativeOpenLocationSettingsSupported !== false && NativeTracking.openLocationSettings) {
    try {
      const res = await NativeTracking.openLocationSettings();
      nativeOpenLocationSettingsSupported = true;
      return Boolean(res?.success);
    } catch (err: unknown) {
      if (isCapacitorUnimplementedError(err)) {
        nativeOpenLocationSettingsSupported = false;
      }
    }
  }
  return false;
}

export async function openNativeLocationSettings(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  if (nativeOpenLocationSettingsSupported !== false && NativeTracking.openLocationSettings) {
    try {
      const res = await NativeTracking.openLocationSettings();
      nativeOpenLocationSettingsSupported = true;
      return Boolean(res?.success);
    } catch (err: unknown) {
      if (isCapacitorUnimplementedError(err)) {
        nativeOpenLocationSettingsSupported = false;
      }
    }
  }
  if (NativeTracking.openSettings) {
    try {
      const res = await NativeTracking.openSettings();
      return Boolean(res?.success);
    } catch {
      return false;
    }
  }
  return false;
}

export type DiagnosticEventDraft = Omit<TrackingDiagEventPayload, 'platform' | 'appVersion' | 'userAgent'>;

export interface AcquireHybridPositionCallbacks {
  onFix: (fix: HybridLocationFix) => void;
  onError: (failure: HybridLocationFailure) => void;
  onDiagnostic?: (event: DiagnosticEventDraft) => void;
}

export interface AcquireHybridPositionOptions {
  waitForCameraPrompt?: () => Promise<void>;
  attemptNumber?: number;
  allowBackgroundRefinement?: boolean;
}

export interface HybridAcquisitionController {
  cancel: () => void;
  pauseForExternalCapture: () => void;
  isActive: () => boolean;
}

export function acquireHybridPosition(
  callbacks: AcquireHybridPositionCallbacks,
  options: AcquireHybridPositionOptions = {},
): HybridAcquisitionController {
  const {
    waitForCameraPrompt,
    attemptNumber = 1,
    allowBackgroundRefinement = true,
  } = options;

  let cancelled = false;
  let settled = false;
  let watchId: number | null = null;
  const timers = new Set<ReturnType<typeof setTimeout>>();

  const clearTimers = () => {
    timers.forEach((id) => clearTimeout(id));
    timers.clear();
  };

  const clearWatch = () => {
    if (watchId !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
  };

  const cleanup = () => {
    clearTimers();
    clearWatch();
  };

  const registerTimeout = (fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
    return id;
  };

  const run = async () => {
    await Promise.resolve();
    if (cancelled) return;
    const startedAt = Date.now();
    const isNative = Capacitor.isNativePlatform();

    let statusMeta: {
      authorizationStatus: DiagAuthStatus;
      isPrecise: boolean;
      locationEnabled: boolean;
      isLowPowerMode: boolean;
      manufacturer?: string;
      canAskAgain: boolean;
    } = {
      authorizationStatus: 'unknown',
      isPrecise: true,
      locationEnabled: true,
      isLowPowerMode: false,
      canAskAgain: false,
    };

    const emitDiag = (draft: DiagnosticEventDraft) => {
      callbacks.onDiagnostic?.({
        isNativeBridgeAvailable: isNative,
        isGetCurrentPositionSupported: nativeGetCurrentPositionSupported ?? undefined,
        attemptNumber,
        ...draft,
      });
    };

    const failNow = (
      errorCode: DiagGpsErrorCode,
      errorMessage: string,
      extra?: { nativeErrorCode?: string; fallbackStage?: string },
    ) => {
      if (cancelled || settled) return;
      cleanup();
      settled = true;
      emitDiag({
        event: 'attendance_gps_failed',
        source: 'none',
        errorCode,
        nativeErrorCode: extra?.nativeErrorCode,
        errorMessage,
        authorizationStatus: statusMeta.authorizationStatus,
        isPreciseLocation: statusMeta.isPrecise,
        locationEnabled: statusMeta.locationEnabled,
        isLowPowerMode: statusMeta.isLowPowerMode,
        fallbackStage: extra?.fallbackStage,
        elapsedMs: Date.now() - startedAt,
      });
      callbacks.onError({
        errorCode,
        nativeErrorCode: extra?.nativeErrorCode,
        errorMessage,
        authorizationStatus: statusMeta.authorizationStatus,
        locationEnabled: statusMeta.locationEnabled,
        isLowPowerMode: statusMeta.isLowPowerMode,
        isPrecise: statusMeta.isPrecise,
        canOpenSettings: isNative,
        canOpenLocationSettings: isNative,
        canRequestPermission:
          isNative &&
          (statusMeta.authorizationStatus === 'not_determined' || statusMeta.canAskAgain),
        manufacturer: statusMeta.manufacturer,
      });
    };

    let hasRequestedPermission = false;
    const ensurePermissionAfterCamera = async (): Promise<boolean> => {
      if (hasRequestedPermission) return false;
      hasRequestedPermission = true;
      if (waitForCameraPrompt) {
        await Promise.race([waitForCameraPrompt(), sleep(4000)]);
        if (cancelled) return false;
      }
      const permRes = await requestNativeLocationPermission();
      if (cancelled) return false;
      if (!permRes.supported) return false;

      if (permRes.authorizationStatus) {
        statusMeta.authorizationStatus = permRes.authorizationStatus;
      }
      if (permRes.isPrecise !== undefined) {
        statusMeta.isPrecise = permRes.isPrecise;
      }
      if (permRes.locationEnabled !== undefined) {
        statusMeta.locationEnabled = permRes.locationEnabled;
      }
      if (permRes.canAskAgain !== undefined) {
        statusMeta.canAskAgain = permRes.canAskAgain;
      }

      if (!statusMeta.locationEnabled) {
        failNow(
          'location_services_disabled',
          'Định vị hệ thống (GPS) đang tắt.',
          { fallbackStage: 'stage0_permission_request' },
        );
        return false;
      }
      if (
        statusMeta.authorizationStatus === 'denied' ||
        statusMeta.authorizationStatus === 'restricted'
      ) {
        failNow('permission_denied', 'Quyền truy cập vị trí đã bị từ chối.', {
          fallbackStage: 'stage0_permission_request',
        });
        return false;
      }
      return Boolean(permRes.granted);
    };

    // Stage 0: Non-blocking pre-flight check (never hard-block on when_in_use)
    if (isNative) {
      const preflight = await getNativePermissionPreflight();
      if (cancelled) return;
      if (preflight) {
        statusMeta = {
          authorizationStatus: preflight.authorizationStatus,
          isPrecise: preflight.isPrecise,
          locationEnabled: preflight.locationEnabled,
          isLowPowerMode: preflight.isLowPowerMode,
          manufacturer: preflight.manufacturer,
          canAskAgain: false,
        };
        if (!preflight.isLegacyFallback) {
          if (!preflight.locationEnabled) {
            failNow('location_services_disabled', 'Định vị hệ thống (GPS) đang tắt.', {
              fallbackStage: 'stage0_preflight',
            });
            return;
          }
          if (
            preflight.authorizationStatus === 'denied' ||
            preflight.authorizationStatus === 'restricted'
          ) {
            failNow('permission_denied', 'Quyền truy cập vị trí đã bị từ chối.', {
              fallbackStage: 'stage0_preflight',
            });
            return;
          }
          if (preflight.authorizationStatus === 'not_determined') {
            await ensurePermissionAfterCamera();
            if (cancelled || settled) return;
          }
        }
      }
    }

    // Stage 1: Capacitor Native Bridge (GMS / CoreLocation)
    let initialBestFix: HybridLocationFix | null = null;

    if (
      isNative &&
      nativeGetCurrentPositionSupported !== false &&
      NativeTracking.getCurrentPosition
    ) {
      const invokeNativeGetPosition = async (): Promise<NativeCurrentPositionResult | null> => {
        try {
          const res = await NativeTracking.getCurrentPosition!({
            enableHighAccuracy: true,
            timeoutMs: ATTENDANCE_GPS_NATIVE_TIMEOUT_MS,
            maximumAgeMs: ATTENDANCE_GPS_NATIVE_MAX_AGE_MS,
            desiredAccuracyMeters: ATTENDANCE_GPS_DESIRED_ACCURACY_METERS,
            requestPermission: false,
          });
          nativeGetCurrentPositionSupported = true;
          return res;
        } catch (err: unknown) {
          if (isCapacitorUnimplementedError(err)) {
            nativeGetCurrentPositionSupported = false;
            emitDiag({
              event: 'native_method_unsupported',
              source: 'none',
              errorCode: 'native_unimplemented',
              errorMessage: getErrorMessage(err),
              authorizationStatus: statusMeta.authorizationStatus,
              isPreciseLocation: statusMeta.isPrecise,
              locationEnabled: statusMeta.locationEnabled,
              isLowPowerMode: statusMeta.isLowPowerMode,
              fallbackStage: 'stage1_to_stage2',
            });
          } else {
            emitDiag({
              event: 'attendance_gps_fallback',
              source: 'none',
              errorCode: 'unknown',
              errorMessage: getErrorMessage(err),
              authorizationStatus: statusMeta.authorizationStatus,
              isPreciseLocation: statusMeta.isPrecise,
              locationEnabled: statusMeta.locationEnabled,
              isLowPowerMode: statusMeta.isLowPowerMode,
              fallbackStage: 'stage1_exception_to_stage2',
            });
          }
          return null;
        }
      };

      let nativeResult = await invokeNativeGetPosition();
      if (cancelled) return;

      if (
        nativeResult &&
        !nativeResult.success &&
        nativeResult.errorCode === 'PERMISSION_NOT_DETERMINED'
      ) {
        statusMeta.authorizationStatus = normalizeNativeAuthStatus(
          nativeResult.authorizationStatus,
        );
        statusMeta.isPrecise = nativeResult.isPrecise;
        statusMeta.locationEnabled = nativeResult.locationEnabled;
        statusMeta.isLowPowerMode = nativeResult.isLowPowerMode;

        const granted = await ensurePermissionAfterCamera();
        if (cancelled || settled) return;
        if (granted) {
          nativeResult = await invokeNativeGetPosition();
          if (cancelled) return;
        }
      }

      if (nativeResult) {
        statusMeta.authorizationStatus = normalizeNativeAuthStatus(
          nativeResult.authorizationStatus,
        );
        statusMeta.isPrecise = nativeResult.isPrecise;
        statusMeta.locationEnabled = nativeResult.locationEnabled;
        statusMeta.isLowPowerMode = nativeResult.isLowPowerMode;

        if (nativeResult.success) {
          if (isValidCoordinate(nativeResult.latitude, nativeResult.longitude)) {
            const accuracy = Math.max(1, Math.round(nativeResult.accuracy));
            const source = mapNativeToDiagGpsSource(nativeResult.provider, nativeResult.source);
            const isCoarseWarning =
              !nativeResult.isPrecise || accuracy > ATTENDANCE_GPS_COARSE_WARNING_METERS;
            const needsRefinement =
              allowBackgroundRefinement &&
              nativeResult.isPrecise &&
              (accuracy > ATTENDANCE_GPS_DESIRED_ACCURACY_METERS ||
                nativeResult.source === 'cache' ||
                nativeResult.source === 'service_cache') &&
              !(
                accuracy <= ATTENDANCE_GPS_ACCEPTABLE_ACCURACY_METERS &&
                nativeResult.source === 'live'
              );

            const nativeFix: HybridLocationFix = {
              lat: nativeResult.latitude,
              lng: nativeResult.longitude,
              accuracy,
              timestamp: nativeResult.timestamp || Date.now(),
              source,
              isPrecise: nativeResult.isPrecise,
              isRefining: needsRefinement,
              isCoarseWarning,
              authorizationStatus: statusMeta.authorizationStatus,
              locationEnabled: statusMeta.locationEnabled,
              isLowPowerMode: statusMeta.isLowPowerMode,
            };

            callbacks.onFix(nativeFix);
            if (isCoarseWarning) {
              emitDiag({
                event: 'attendance_gps_coarse',
                source,
                errorCode: 'coarse_accuracy_only',
                accuracyMeters: accuracy,
                authorizationStatus: statusMeta.authorizationStatus,
                isPreciseLocation: statusMeta.isPrecise,
                locationEnabled: statusMeta.locationEnabled,
                isLowPowerMode: statusMeta.isLowPowerMode,
                elapsedMs: Date.now() - startedAt,
              });
            }

            if (!needsRefinement) {
              settled = true;
              return;
            }
            initialBestFix = nativeFix;
          }
        } else {
          if (nativeResult.errorCode === 'PERMISSION_DENIED') {
            failNow('permission_denied', nativeResult.errorMessage, {
              nativeErrorCode: nativeResult.errorCode,
              fallbackStage: 'stage1_native',
            });
            return;
          }
          if (nativeResult.errorCode === 'LOCATION_SERVICES_DISABLED') {
            failNow('location_services_disabled', nativeResult.errorMessage, {
              nativeErrorCode: nativeResult.errorCode,
              fallbackStage: 'stage1_native',
            });
            return;
          }
          if (nativeResult.errorCode !== 'PERMISSION_NOT_DETERMINED') {
            emitDiag({
              event: 'attendance_gps_fallback',
              source: 'none',
              errorCode:
                nativeResult.errorCode === 'TIMEOUT'
                  ? statusMeta.isLowPowerMode
                    ? 'battery_saver_restricted'
                    : 'timeout'
                  : 'position_unavailable',
              nativeErrorCode: nativeResult.errorCode,
              errorMessage: nativeResult.errorMessage,
              authorizationStatus: statusMeta.authorizationStatus,
              isPreciseLocation: statusMeta.isPrecise,
              locationEnabled: statusMeta.locationEnabled,
              isLowPowerMode: statusMeta.isLowPowerMode,
              fallbackStage: 'stage1_to_stage2',
              elapsedMs: Date.now() - startedAt,
            });
          }
        }
      }
    }

    // Stage 2: Upgraded WebView watchPosition + Progressive Refinement
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      if (initialBestFix) {
        settled = true;
        callbacks.onFix({ ...initialBestFix, isRefining: false });
        return;
      }
      failNow('unsupported', 'Thiết bị hoặc trình duyệt không hỗ trợ định vị GPS.', {
        fallbackStage: 'stage2_webview',
      });
      return;
    }

    let bestFix: HybridLocationFix | null = initialBestFix;
    let lastWebErrorCode: number | undefined;
    let lastWebErrorMessage = '';

    const shouldAcceptFix = (candidate: HybridLocationFix): boolean => {
      if (!bestFix) return true;
      if (candidate.accuracy < bestFix.accuracy) return true;
      if (candidate.accuracy <= 50 && candidate.timestamp - bestFix.timestamp > 5000) {
        return true;
      }
      return false;
    };

    const buildWebFix = (pos: GeolocationPosition, isAssist: boolean): HybridLocationFix | null => {
      if (!isValidCoordinate(pos.coords.latitude, pos.coords.longitude)) return null;
      const accuracy = Math.max(1, Math.round(pos.coords.accuracy || 999));
      const ts = pos.timestamp || Date.now();
      const ageMs = Math.max(0, Date.now() - ts);
      const source: DiagGpsSource =
        ageMs > 10000 ? 'webview_cached' : isAssist ? 'webview_low_accuracy' : 'webview_watch';
      const isCoarseWarning =
        !statusMeta.isPrecise || accuracy > ATTENDANCE_GPS_COARSE_WARNING_METERS;
      const isGoodEnough = accuracy <= ATTENDANCE_GPS_ACCEPTABLE_ACCURACY_METERS;
      return {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy,
        timestamp: ts,
        source,
        isPrecise: statusMeta.isPrecise,
        isRefining: !isGoodEnough,
        isCoarseWarning,
        authorizationStatus: statusMeta.authorizationStatus,
        locationEnabled: statusMeta.locationEnabled,
        isLowPowerMode: statusMeta.isLowPowerMode,
      };
    };

    const completeWithBest = (fix: HybridLocationFix) => {
      if (cancelled || settled) return;
      cleanup();
      settled = true;
      const finalFix: HybridLocationFix = { ...fix, isRefining: false };
      callbacks.onFix(finalFix);
      if (finalFix.isCoarseWarning) {
        emitDiag({
          event: 'attendance_gps_coarse',
          source: finalFix.source,
          errorCode: 'coarse_accuracy_only',
          accuracyMeters: finalFix.accuracy,
          authorizationStatus: statusMeta.authorizationStatus,
          isPreciseLocation: statusMeta.isPrecise,
          locationEnabled: statusMeta.locationEnabled,
          isLowPowerMode: statusMeta.isLowPowerMode,
          elapsedMs: Date.now() - startedAt,
        });
      }
    };

    const handleWebPosition = (pos: GeolocationPosition, isAssist: boolean) => {
      if (cancelled || settled) return;
      const fix = buildWebFix(pos, isAssist);
      if (!fix) return;
      if (shouldAcceptFix(fix)) {
        bestFix = fix;
        if (!fix.isRefining) {
          completeWithBest(fix);
        } else {
          callbacks.onFix(fix);
        }
      }
    };

    watchId = navigator.geolocation.watchPosition(
      (pos) => handleWebPosition(pos, false),
      (err) => {
        if (cancelled || settled) return;
        lastWebErrorCode = err?.code;
        lastWebErrorMessage = err?.message || '';
        // Numeric constant 1 = PERMISSION_DENIED
        if (err?.code === 1) {
          if (bestFix) {
            completeWithBest(bestFix);
            return;
          }
          statusMeta.authorizationStatus = 'denied';
          failNow('permission_denied', 'Quyền truy cập vị trí đã bị từ chối.', {
            nativeErrorCode: '1',
            fallbackStage: 'stage2_webview',
          });
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 15000,
        timeout: 15000,
      },
    );

    // Parallel low-accuracy assist at t = 4000ms if no fix arrived yet
    if (!bestFix) {
      registerTimeout(() => {
        if (cancelled || settled || bestFix) return;
        navigator.geolocation.getCurrentPosition(
          (assistPos) => handleWebPosition(assistPos, true),
          () => {},
          {
            enableHighAccuracy: false,
            maximumAge: 30000,
            timeout: 8000,
          },
        );
      }, ATTENDANCE_GPS_ASSIST_DELAY_MS);
    }

    const budgetMs = initialBestFix
      ? ATTENDANCE_GPS_REFINE_BUDGET_MS
      : ATTENDANCE_GPS_WEBVIEW_BUDGET_MS;

    registerTimeout(() => {
      if (cancelled || settled) return;
      if (bestFix) {
        completeWithBest(bestFix);
        return;
      }
      const mappedCode =
        lastWebErrorCode !== undefined
          ? mapGeolocationErrorCode(lastWebErrorCode, statusMeta.isLowPowerMode)
          : statusMeta.isLowPowerMode
            ? 'battery_saver_restricted'
            : 'timeout';
      failNow(
        mappedCode,
        lastWebErrorMessage || 'Không thể lấy tọa độ GPS trong thời gian cho phép.',
        {
          nativeErrorCode: lastWebErrorCode !== undefined ? String(lastWebErrorCode) : undefined,
          fallbackStage: 'stage2_webview_budget_expired',
        },
      );
    }, budgetMs);
  };

  void run();

  return {
    cancel: () => {
      cancelled = true;
      cleanup();
    },
    pauseForExternalCapture: () => {
      cancelled = true;
      cleanup();
    },
    isActive: () => !cancelled && !settled,
  };
}

export interface QuickWebPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
}

export async function acquireQuickWebPosition(options?: {
  maxAccuracyMeters?: number;
  timeoutMs?: number;
}): Promise<QuickWebPosition | null> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return null;
  }

  const maxAccuracyMeters = options?.maxAccuracyMeters ?? TRACKER_QUICK_PING_MAX_ACCURACY_METERS;
  const timeoutMs = options?.timeoutMs ?? 10000;

  const getPos = (posOptions: PositionOptions) =>
    new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, posOptions);
    });

  const extractValid = (pos: GeolocationPosition): QuickWebPosition | null => {
    const { latitude, longitude, accuracy, speed, heading } = pos.coords;
    if (!isValidCoordinate(latitude, longitude)) return null;
    if (Number.isFinite(accuracy) && accuracy > maxAccuracyMeters) return null;
    return {
      latitude,
      longitude,
      accuracy: Number.isFinite(accuracy) ? accuracy : undefined,
      speed: speed !== null && Number.isFinite(speed) ? speed : undefined,
      heading: heading !== null && Number.isFinite(heading) ? heading : undefined,
    };
  };

  try {
    const highAccPos = await getPos({
      enableHighAccuracy: true,
      timeout: Math.min(8000, timeoutMs),
      maximumAge: 10000,
    });
    const valid = extractValid(highAccPos);
    if (valid) return valid;
  } catch (err: unknown) {
    const code = (err as { code?: unknown } | null)?.code;
    if (code === 1) return null;
  }

  try {
    const lowAccPos = await getPos({
      enableHighAccuracy: false,
      timeout: timeoutMs,
      maximumAge: 30000,
    });
    return extractValid(lowAccPos);
  } catch {
    return null;
  }
}
