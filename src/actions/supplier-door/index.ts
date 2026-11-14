import { BaseResponseWithPagination } from '@/components';
import type {
  SupplierDoor,
  SupplierDoorCreatePayload,
  SupplierDoorQueryParams,
  SupplierDoorUpdatePayload,
} from '@/types';
import { api } from '@/utils';

export const getSupplierDoors = async (
  params?: SupplierDoorQueryParams,
): Promise<BaseResponseWithPagination<SupplierDoor>> => {
  try {
    const response = await api.get('/api/v1/supplier-doors', { params });
    return response.data;
  } catch (error: unknown) {
    console.warn('API error getSupplierDoors', error);
    throw error;
  }
};

export const getSupplierDoor = async (supplierDoorId: number): Promise<SupplierDoor> => {
  try {
    const response = await api.get(`/api/v1/supplier-doors/${supplierDoorId}`);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error getSupplierDoor', error);
    throw error;
  }
};

export const createSupplierDoor = async (payload: {
  data: SupplierDoorCreatePayload;
  file?: File;
  files?: File[];
}): Promise<SupplierDoor> => {
  try {
    const formData = new FormData();
    formData.append('data', JSON.stringify(payload.data));
    if (payload.file) {
      formData.append('file', payload.file);
    }
    if (payload.files && payload.files.length > 0) {
      payload.files.forEach((file) => {
        formData.append('files', file);
      });
    }
    const response = await api.post('/api/v1/supplier-doors', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: unknown) {
    console.warn('API error createSupplierDoor', error);
    throw error;
  }
};

export const updateSupplierDoor = async (
  supplierDoorId: number,
  payload: {
    data: SupplierDoorUpdatePayload;
    file?: File;
    files?: File[];
    deletedImageIds?: number[];
    promoteUploadedPrimary?: boolean;
  },
): Promise<SupplierDoor> => {
  try {
    const formData = new FormData();
    formData.append('data', JSON.stringify(payload.data));
    if (payload.file) {
      formData.append('file', payload.file);
    }
    if (payload.files && payload.files.length > 0) {
      payload.files.forEach((file) => {
        formData.append('files', file);
      });
    }
    if (payload.deletedImageIds && payload.deletedImageIds.length > 0) {
      formData.append('deleted_image_ids', JSON.stringify(payload.deletedImageIds));
    }
    if (payload.promoteUploadedPrimary) {
      formData.append('promote_uploaded_primary', 'true');
    }
    const response = await api.put(`/api/v1/supplier-doors/${supplierDoorId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: unknown) {
    console.warn('API error updateSupplierDoor', error);
    throw error;
  }
};

export const setPrimarySupplierDoorImage = async (
  supplierDoorId: number,
  imageId: number,
): Promise<void> => {
  try {
    await api.patch(`/api/v1/supplier-doors/${supplierDoorId}/images/${imageId}`);
  } catch (error: unknown) {
    console.warn('API error setPrimarySupplierDoorImage', error);
    throw error;
  }
};

export const deleteSupplierDoorImage = async (
  supplierDoorId: number,
  imageId: number,
): Promise<void> => {
  try {
    await api.delete(`/api/v1/supplier-doors/${supplierDoorId}/images/${imageId}`);
  } catch (error: unknown) {
    console.warn('API error deleteSupplierDoorImage', error);
    throw error;
  }
};

export const deleteSupplierDoor = async (supplierDoorId: number): Promise<void> => {
  try {
    await api.delete(`/api/v1/supplier-doors/${supplierDoorId}`);
  } catch (error: unknown) {
    console.warn('API error deleteSupplierDoor', error);
    throw error;
  }
};
