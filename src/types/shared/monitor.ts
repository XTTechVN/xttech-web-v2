export interface GridCell {
  cameraId: string | null;
  cameraName: string | null;
  workerIp: string | null;
  workerPort: number | null;
}

export interface Monitor {
  id: string;
  name: string;
  grid: Record<string, GridCell>;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export enum GridMode {}
