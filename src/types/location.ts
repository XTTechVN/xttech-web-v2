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
