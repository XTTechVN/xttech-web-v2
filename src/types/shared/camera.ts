export type Camera = {
  name: string;
  rtspUrl: string;
  address: string;
  workerId: string;
  lat: number;
  lng: number;
  id: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  worker?: {
    name: string;
    ip: string;
    port: number;
    isActive: boolean;
    id: string;
  };
};
