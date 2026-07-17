export interface Worker {
  id: string;
  name: string;
  socket: string;
  port: number;
  macId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkerFormModalData {
  macId: string;
  name: string;
  socket: string;
  port: number;
  isActive: boolean;
}
