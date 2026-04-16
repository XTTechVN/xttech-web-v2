export interface Worker {
  id: string;
  name: string;
  ip: string;
  port: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkerFormModalData {
  name: string;
  ip: string;
  port: number;
  isActive: boolean;
}
