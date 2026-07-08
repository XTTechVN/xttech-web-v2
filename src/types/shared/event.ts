import { Camera } from './camera';

export interface Record {
  id: string;
  cameraId: string;
  type: 'continuous' | 'event';
  name: string;
  description?: string | null;
  aiProcessedLevel: number;
  videoId?: string | null;
  thumbnailId?: string | null;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
  camera?: Camera | null;
}
