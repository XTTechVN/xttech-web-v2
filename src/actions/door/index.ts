import api from '@/utils/api';
import type { BaseResponseWithPagination } from '@/components';
import type {
  Accessory,
  AccessoryQueryParams,
  Door,
  DoorAssignAccessories,
  DoorCreate,
  DoorQueryParams,
  DoorUnassignAccessories,
  DoorUpdate,
} from '@/types';

export const getDoors = async (
  params?: DoorQueryParams,
): Promise<BaseResponseWithPagination<Door>> => {
  try {
    const response = await api.get('/api/v1/doors', { params });
    const { items, meta } = response.data;
    return {
      items: items || [],
      meta: {
        total: meta?.total ?? 0,
        offset: meta?.offset ?? 0,
        limit: meta?.limit ?? 10,
        next: meta?.next ?? false,
      },
    };
  } catch (error: unknown) {
    console.warn('API error getDoors', error);
    throw error;
  }
};

export const getDoor = async (id: number): Promise<Door> => {
  try {
    const response = await api.get(`/api/v1/doors/${id}`);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error getDoor', error);
    throw error;
  }
};

export const createDoor = async (payload: { data: DoorCreate; file?: File }): Promise<Door> => {
  try {
    const formData = new FormData();
    formData.append('data', JSON.stringify(payload.data));
    if (payload.file) {
      formData.append('file', payload.file);
    }
    const response = await api.post('/api/v1/doors', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: unknown) {
    console.warn('API error createDoor', error);
    throw error;
  }
};

export const updateDoor = async (
  id: number,
  payload: { data: DoorUpdate; file?: File },
): Promise<Door> => {
  try {
    const formData = new FormData();
    formData.append('data', JSON.stringify(payload.data));
    if (payload.file) {
      formData.append('file', payload.file);
    }
    const response = await api.put(`/api/v1/doors/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: unknown) {
    console.warn('API error updateDoor', error);
    throw error;
  }
};

export const deleteDoor = async (id: number): Promise<Door> => {
  try {
    const response = await api.delete(`/api/v1/doors/${id}`);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error deleteDoor', error);
    throw error;
  }
};

// --- Sub-resource: Accessories ---

export const getDoorAccessories = async (
  doorId: number,
  params?: AccessoryQueryParams,
): Promise<BaseResponseWithPagination<Accessory>> => {
  try {
    const response = await api.get(`/api/v1/doors/${doorId}/accessories`, { params });
    const { items, meta } = response.data;
    return {
      items: items || [],
      meta: {
        total: meta?.total ?? 0,
        offset: meta?.offset ?? 0,
        limit: meta?.limit ?? 10,
        next: meta?.next ?? false,
      },
    };
  } catch (error: unknown) {
    console.warn('API error getDoorAccessories', error);
    throw error;
  }
};

export const assignDoorAccessories = async (
  doorId: number,
  payload: DoorAssignAccessories,
): Promise<Accessory[]> => {
  try {
    const response = await api.post(`/api/v1/doors/${doorId}/accessories`, payload);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error assignDoorAccessories', error);
    throw error;
  }
};

export const revokeDoorAccessories = async (
  doorId: number,
  payload: DoorUnassignAccessories,
): Promise<Accessory[]> => {
  try {
    const response = await api.delete(`/api/v1/doors/${doorId}/accessories`, { data: payload });
    return response.data;
  } catch (error: unknown) {
    console.warn('API error revokeDoorAccessories', error);
    throw error;
  }
};
