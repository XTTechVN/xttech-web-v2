export type Space = {
  id: string;
  spaceId: string;
  name: string;
  parentId?: string | null;
  level: number;
  meta?: Record<string, any> | null;
  createdAt?: string;
  updatedAt?: string;
  children?: Space[];
};
