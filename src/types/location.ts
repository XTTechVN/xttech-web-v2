export type DevicePlatform = 'ios' | 'android' | 'web';

export const DEVICE_PLATFORM_MAP: Record<DevicePlatform, string> = {
  ios: 'iOS',
  android: 'Android',
  web: 'Web App',
};

export interface LocationPingPayload {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  batteryLevel?: number;
  platform?: DevicePlatform;
}

export type StaffLiveStatus = 'moving' | 'stationary' | 'app_closed' | 'offline';

export const STAFF_LIVE_STATUS_MAP: Record<StaffLiveStatus, string> = {
  moving: 'Di chuyển',
  stationary: 'Đứng yên',
  app_closed: 'Đã tắt app',
  offline: 'Ngoại tuyến',
};

/** Mất tín hiệu định vị: ngoại tuyến hoặc nhân viên đã vuốt tắt ứng dụng */
export const isStaffSignalLost = (status: StaffLiveStatus): boolean =>
  status === 'offline' || status === 'app_closed';

/** Chẩn đoán thiết bị native (iOS) gửi kèm ping; mọi giá trị trạng thái là mã tiếng Anh từ Backend */
export interface StaffDeviceDiagnostics {
  appVersion?: string;
  appBuild?: string;
  osVersion?: string;
  deviceModel?: string;
  launchId?: string;
  /** user_or_other | system_location */
  launchReason?: string;
  /** user_terminated | foreground_kill_suspected | background_kill_suspected | device_rebooted | app_updated */
  previousExit?: string;
  /** active | inactive | background */
  appState?: string;
  /** always | when_in_use | denied | restricted | not_determined | unknown */
  authorizationStatus?: string;
  isPreciseLocation?: boolean;
  isLowPowerMode?: boolean;
  /** available | denied | restricted | unknown */
  backgroundRefreshStatus?: string;
  lastPingHttpStatus?: number;
  consecutiveFailures?: number;
  lastFailureReason?: string;
  receivedLocationCount?: number;
  filteredLocationCount?: number;
  lastLocationAgeSec?: number;
  lastLocationErrorCode?: number;
  exitMetrics?: Record<string, number>;
}

export interface StaffLiveLocation {
  userId: string;
  userName: string;
  avatar?: string;
  departmentName?: string;
  positionName?: string;
  attendanceId?: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  batteryLevel?: number;
  checkInTime?: string;
  platform?: DevicePlatform;
  status: StaffLiveStatus;
  updatedAt: string;
  diagnostics?: StaffDeviceDiagnostics;
  /** Đã check-in nhưng thiết bị chưa gửi ping nào lên server (bản ghi live mới chỉ có mốc xuất phát) */
  awaitingFirstPing?: boolean;
}

export interface StaffRoutePoint {
  id?: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  recordedAt?: string;
}

export interface StaffRouteResponse {
  userId?: string;
  user_id?: string;
  userName?: string;
  user_name?: string;
  date: string;
  attendanceId?: number;
  attendance_id?: number;
  totalDistanceKm?: number;
  total_distance_km?: number;
  points: StaffRoutePoint[];
}

// =================================================
// NATIVE TRACKING BRIDGE CONTRACT
// =================================================

export type NativeLocationAuthStatus =
  | 'always'
  | 'whenInUse'
  | 'denied'
  | 'restricted'
  | 'notDetermined';

export type NativeLocationErrorCode =
  | 'PERMISSION_DENIED'
  | 'PERMISSION_NOT_DETERMINED'
  | 'LOCATION_SERVICES_DISABLED'
  | 'TIMEOUT'
  | 'POSITION_UNAVAILABLE'
  | 'CONTEXT_UNAVAILABLE';

export type NativeLocationProvider =
  | 'fused'
  | 'gps'
  | 'network'
  | 'passive'
  | 'corelocation'
  | 'service_cache'
  | 'unknown';

export type NativeLocationSource = 'live' | 'cache' | 'service_cache';

export interface NativeGetCurrentPositionOptions {
  enableHighAccuracy?: boolean;
  timeoutMs?: number;
  maximumAgeMs?: number;
  desiredAccuracyMeters?: number;
  requestPermission?: boolean;
}

export interface NativeLocationStatusMeta {
  isPrecise: boolean;
  authorizationStatus: NativeLocationAuthStatus;
  locationEnabled: boolean;
  isLowPowerMode: boolean;
  gmsAvailable?: boolean;
}

export type NativeCurrentPositionResult =
  | (NativeLocationStatusMeta & {
      success: true;
      latitude: number;
      longitude: number;
      accuracy: number;
      altitude?: number;
      speed?: number;
      heading?: number;
      timestamp: number;
      provider: NativeLocationProvider;
      source: NativeLocationSource;
      ageMs: number;
    })
  | (NativeLocationStatusMeta & {
      success: false;
      errorCode: NativeLocationErrorCode;
      errorMessage: string;
      provider?: NativeLocationProvider;
      osErrorCode?: number;
    });

export interface NativePermissionStatusResult {
  status: NativeLocationAuthStatus;
  isAlways: boolean;
  isWhenInUse?: boolean;
  isPrecise: boolean;
  locationEnabled?: boolean;
  isLowPowerMode?: boolean;
}

export interface NativeRequestLocationPermissionResult {
  granted: boolean;
  status: NativeLocationAuthStatus;
  isAlways: boolean;
  isWhenInUse: boolean;
  isPrecise: boolean;
  locationEnabled: boolean;
  canAskAgain: boolean;
}

export interface NativeAndroidPermissionsResult {
  isIgnoringBatteryOptimizations: boolean;
  hasFineLocation: boolean;
  hasCoarseLocation?: boolean;
  hasBackgroundLocation: boolean;
  isLocationEnabled?: boolean;
  gmsAvailable?: boolean;
  manufacturer: string;
}

export interface NativePluginListenerHandle {
  remove: () => Promise<void> | void;
}

export interface NativeTrackingPlugin {
  startTracking(options: { token: string; refreshToken?: string; apiUrl: string }): Promise<{ success: boolean }>;
  updateToken(options: { token: string; refreshToken?: string }): Promise<{ success: boolean }>;
  stopTracking(): Promise<{ success: boolean }>;
  getCurrentPosition?(options?: NativeGetCurrentPositionOptions): Promise<NativeCurrentPositionResult>;
  checkPermission?(): Promise<NativePermissionStatusResult>;
  requestLocationPermission?(): Promise<NativeRequestLocationPermissionResult>;
  openLocationSettings?(): Promise<{ success: boolean }>;
  openSettings?(): Promise<{ success: boolean }>;
  ensureAlwaysPermission?(): Promise<{
    isAlways: boolean;
    action: string;
    status?: NativeLocationAuthStatus;
    isPrecise?: boolean;
  }>;
  checkAndroidPermissions?(): Promise<NativeAndroidPermissionsResult>;
  requestIgnoreBatteryOptimization?(): Promise<{ success: boolean }>;
  requestBackgroundLocation?(): Promise<{ success: boolean }>;
  openAutoStartSettings?(): Promise<{ success: boolean; manufacturer?: string }>;
  getBatteryLevel?(): Promise<{ level: number }>;
  addListener?(
    eventName: 'locationUpdate',
    listenerFunc: (data: { timestamp?: number }) => void,
  ): Promise<NativePluginListenerHandle>;
  addListener?(
    eventName: 'authError',
    listenerFunc: (err: { message?: string; status?: number }) => void,
  ): Promise<NativePluginListenerHandle>;
  addListener?(
    eventName: 'permissionChanged',
    listenerFunc: (perm: { status: NativeLocationAuthStatus; isAlways: boolean }) => void,
  ): Promise<NativePluginListenerHandle>;
}

// =================================================
// ATTENDANCE GPS DIAGNOSTICS & TELEMETRY
// =================================================

export type DiagEventType =
  | 'attendance_gps_failed'
  | 'attendance_gps_coarse'
  | 'attendance_gps_fallback'
  | 'attendance_gps_recovered'
  | 'native_method_unsupported';

export type DiagGpsErrorCode =
  | 'permission_denied'
  | 'location_services_disabled'
  | 'coarse_accuracy_only'
  | 'timeout'
  | 'position_unavailable'
  | 'battery_saver_restricted'
  | 'unsupported'
  | 'native_unimplemented'
  | 'unknown';

export type DiagGpsSource =
  | 'native_fused'
  | 'native_gps'
  | 'native_network'
  | 'native_passive'
  | 'native_corelocation'
  | 'native_cache'
  | 'native_unknown'
  | 'webview_watch'
  | 'webview_low_accuracy'
  | 'webview_cached'
  | 'none';

export type DiagAuthStatus =
  | 'always'
  | 'when_in_use'
  | 'denied'
  | 'restricted'
  | 'not_determined'
  | 'unknown';

export interface TrackingDiagEventPayload {
  event: DiagEventType;
  actionType?: 'check_in' | 'check_out';
  platform: DevicePlatform;
  source?: DiagGpsSource;
  errorCode?: DiagGpsErrorCode;
  nativeErrorCode?: string;
  errorMessage?: string;
  authorizationStatus?: DiagAuthStatus;
  isPreciseLocation?: boolean;
  locationEnabled?: boolean;
  isLowPowerMode?: boolean;
  isNativeBridgeAvailable?: boolean;
  isGetCurrentPositionSupported?: boolean;
  fallbackStage?: string;
  accuracyMeters?: number;
  elapsedMs?: number;
  attemptNumber?: number;
  appVersion?: string;
  osVersion?: string;
  deviceModel?: string;
  userAgent?: string;
}

export interface TrackingDiagEventAck {
  accepted: boolean;
  event: string;
  ts: string;
  reason?: string;
}

export interface TrackingDiagLogItem {
  event: string;
  userId: string;
  userName?: string;
  ts: string;
  actionType?: 'check_in' | 'check_out';
  platform?: DevicePlatform | string;
  source?: DiagGpsSource | string;
  errorCode?: DiagGpsErrorCode | string;
  nativeErrorCode?: string;
  errorMessage?: string;
  authorizationStatus?: DiagAuthStatus | string;
  isPreciseLocation?: boolean;
  locationEnabled?: boolean;
  isLowPowerMode?: boolean;
  isNativeBridgeAvailable?: boolean;
  isGetCurrentPositionSupported?: boolean;
  fallbackStage?: string;
  accuracyMeters?: number;
  elapsedMs?: number;
  attemptNumber?: number;
  appVersion?: string;
  osVersion?: string;
  deviceModel?: string;
  userAgent?: string;
  attendanceId?: number;
  launchReason?: string;
  previousExit?: string;
  auth?: string;
  lowPower?: boolean;
  bgRefresh?: string;
  build?: string;
  os?: string;
  model?: string;
  exitMetrics?: Record<string, number>;
  failures?: number;
  lastReason?: string;
  lastHttpStatus?: number;
  appState?: string;
  workDate?: string;
  accuracy?: number;
}

export interface HybridLocationFix {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
  source: DiagGpsSource;
  isPrecise: boolean;
  isRefining: boolean;
  isCoarseWarning: boolean;
  authorizationStatus: DiagAuthStatus;
  locationEnabled: boolean;
  isLowPowerMode: boolean;
}

export interface HybridLocationFailure {
  errorCode: DiagGpsErrorCode;
  nativeErrorCode?: string;
  errorMessage: string;
  authorizationStatus: DiagAuthStatus;
  locationEnabled: boolean;
  isLowPowerMode: boolean;
  isPrecise: boolean;
  canOpenSettings: boolean;
  canOpenLocationSettings: boolean;
  canRequestPermission: boolean;
  manufacturer?: string;
}
