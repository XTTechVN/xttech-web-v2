export interface LocationPingPayload {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  batteryLevel?: number;
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
  status: StaffLiveStatus;
  updatedAt: string;
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
