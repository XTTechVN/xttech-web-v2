export interface LocationPingPayload {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  battery_level?: number;
}

export interface StaffLiveLocation {
  user_id: string;
  user_name: string;
  avatar?: string;
  department_name?: string;
  position_name?: string;
  attendance_id?: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  battery_level?: number;
  check_in_time?: string;
  status: 'moving' | 'stationary' | 'offline';
  updated_at: string;
}

export interface StaffRoutePoint {
  id?: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  recorded_at: string;
}

export interface StaffRouteResponse {
  user_id: string;
  user_name: string;
  date: string;
  total_distance_km: number;
  points: StaffRoutePoint[];
}
