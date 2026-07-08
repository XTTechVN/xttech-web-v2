import { Camera } from './camera';

export interface Record {
  id: string;
  eventId: string;
  videoId?: string | null;
  thumbnailId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  cameraId: string;
  aiProcessedLevel: number;
  createdAt: string;
  updatedAt: string;
  camera?: Camera | null;
  record?: Record | null;
}
