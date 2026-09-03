export interface LocationPingPayload {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  batteryLevel?: number;
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
  status: 'moving' | 'stationary' | 'offline';
  updatedAt: string;
}

export interface StaffRoutePoint {
  id?: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  recordedAt?: string;
  recorded_at?: string;
}

export interface StaffRouteResponse {
  userId?: string;
  user_id?: string;
  userName?: string;
  user_name?: string;
  date: string;
  totalDistanceKm?: number;
  total_distance_km?: number;
  points: StaffRoutePoint[];
}
