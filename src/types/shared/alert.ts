import { UUID } from 'crypto';

export interface Alert {
  id: UUID;
  name: string;
  description?: string;
  camera_id: UUID;
  camera_name?: string; // Expecting backend to provide this
  video_id?: UUID;
  thumbnail_id?: UUID;
  created_at: string;
  updated_at: string;
}
