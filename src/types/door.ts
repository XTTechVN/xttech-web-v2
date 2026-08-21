import { DOOR_TYPE_MAP } from './formula';

export const formatDoorType = (type: string | null | undefined): string => {
  if (!type) return '';
  return (DOOR_TYPE_MAP as Record<string, string>)[type.toLowerCase()] || type;
};

export interface Door {
  id: number;
  type: string | null;
  code: string | null;
  name: string;
  imagePath: string | null;
  specification: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DoorCreate {
  name: string;
  type?: string;
  code?: string;
  imagePath?: string;
  specification?: string;
}

export interface DoorUpdate {
  name?: string;
  type?: string;
  code?: string;
  imagePath?: string;
  specification?: string;
}

export interface DoorQueryParams {
  search?: string;
  type?: string;
  code?: string;
  offset?: number;
  limit?: number;
}

export interface DoorAssignAccessories {
  accessoryIds: number[];
}

export interface DoorUnassignAccessories {
  accessoryIds: number[];
}
