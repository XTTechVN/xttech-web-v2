import api from '@/utils/api';
import type { BaseResponseWithPagination } from '@/components';
import type {
  DoorSeries,
  DoorSeriesCreate,
  DoorSeriesUpdate,
  DoorSeriesQueryParams,
} from '@/types';

export const getDoorSeriesList = async (
  params?: DoorSeriesQueryParams,
): Promise<BaseResponseWithPagination<DoorSeries>> => {
  try {
    const response = await api.get('/api/v1/door-series', { params });
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
  } catch (error) {
    console.warn('API error getDoorSeriesList', error);
    throw error;
  }
};

export const getDoorSeries = async (id: number): Promise<DoorSeries> => {
  try {
    const response = await api.get(`/api/v1/door-series/${id}`);
    return response.data;
  } catch (error) {
    console.warn('API error getDoorSeries', error);
    throw error;
  }
};

export const createDoorSeries = async (data: DoorSeriesCreate): Promise<DoorSeries> => {
  try {
    const response = await api.post('/api/v1/door-series', data);
    return response.data;
  } catch (error) {
    console.warn('API error createDoorSeries', error);
    throw error;
  }
};

export const updateDoorSeries = async (id: number, data: DoorSeriesUpdate): Promise<DoorSeries> => {
  try {
    const response = await api.put(`/api/v1/door-series/${id}`, data);
    return response.data;
  } catch (error) {
    console.warn('API error updateDoorSeries', error);
    throw error;
  }
};

export const deleteDoorSeries = async (id: number): Promise<DoorSeries> => {
  try {
    const response = await api.delete(`/api/v1/door-series/${id}`);
    return response.data;
  } catch (error) {
    console.warn('API error deleteDoorSeries', error);
    throw error;
  }
};
