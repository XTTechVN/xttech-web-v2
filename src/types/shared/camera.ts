export type Camera = {
  status: 'stopped' | 'streaming' | 'recording_continuous' | 'recording_event';
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
  onvif: boolean;
  worker?: {
    name: string;
    ip: string;
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
}

export interface CameraEditFormData {
  name: string;
  rtspUrl: string;
  address: string;
  workerId: string;
  lat: number;
  lng: number;
  status: 'stopped' | 'streaming' | 'recording_continuous' | 'recording_event';
  rtspType: 'pull' | 'push';
  onvif: boolean;
  port: number;
}
