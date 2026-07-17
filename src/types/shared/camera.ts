export type Camera = {
  status: 'stopped' | 'streaming' | 'recording_continuous' | 'recording_event' | 'recording_continuous_event';
  name: string;
  rtspUrl: string;
  rtspType: string;
  address: string;
  workerId: string;
  lat: number;
  lng: number;
  id: string;
  createdAt: string;
  updatedAt: string;
  ptz?: boolean;
  onvifIp?: string;
  onvifPort?: number;
  onvifUsername?: string;
  onvifPassword?: string;
  spaceId?: string;
  worker?: {
    name: string;
    socket: string;
    port: number;
    isActive: boolean;
    id: string;
  };
};

export interface CameraAddFormData {
  name: string;
  rtspUrl: string;
  address: string;
  workerId: string;
  lat: number;
  lng: number;
  spaceId?: string;
}

export interface CameraEditFormData {
  name: string;
  rtspUrl: string;
  address: string;
  workerId: string;
  lat: number;
  lng: number;
  status: 'stopped' | 'streaming' | 'recording_continuous' | 'recording_event' | 'recording_continuous_event';
  rtspType: 'pull' | 'push';
  onvif: boolean;
  port: number;
  ptz?: boolean;
  onvifIp?: string;
  onvifPort?: number;
  onvifUsername?: string;
  onvifPassword?: string;
  spaceId?: string;
}
