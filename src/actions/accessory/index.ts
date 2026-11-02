import api from '@/utils/api';
import { downloadOrShareBlob, getFilenameFromContentDisposition } from '@/utils';
import type { BaseResponseWithPagination } from '@/components';
import type {
  Accessory,
  AccessoryAssignDoors,
  AccessoryAssignMaterials,
  AccessoryCreate,
  AccessoryQueryParams,
  AccessoryUnassignDoors,
  AccessoryUnassignMaterials,
  AccessoryUpdate,
  AccessoryExcelPreviewResponse,
  AccessoryBulkUpsertRequest,
  MaterialBulkUpsertResponse,
  Door,
  DoorQueryParams,
  Material,
  MaterialQueryParams,
} from '@/types';

export const getAccessories = async (
  params?: AccessoryQueryParams,
): Promise<BaseResponseWithPagination<Accessory>> => {
  try {
    const response = await api.get('/api/v1/accessories', { params });
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
    console.warn('API error getAccessories', error);
    throw error;
  }
};

export const getAccessory = async (id: number): Promise<Accessory> => {
  try {
    const response = await api.get(`/api/v1/accessories/${id}`);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error getAccessory', error);
    throw error;
  }
};

export const createAccessory = async (payload: { data: AccessoryCreate; file?: File }): Promise<Accessory> => {
  try {
    const formData = new FormData();
    formData.append('data', JSON.stringify(payload.data));
    if (payload.file) {
      formData.append('file', payload.file);
    }
    const response = await api.post('/api/v1/accessories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: unknown) {
    console.warn('API error createAccessory', error);
    throw error;
  }
};

export const updateAccessory = async (
  id: number,
  payload: { data: AccessoryUpdate; file?: File },
): Promise<Accessory> => {
  try {
    const formData = new FormData();
    formData.append('data', JSON.stringify(payload.data));
    if (payload.file) {
      formData.append('file', payload.file);
    }
    const response = await api.put(`/api/v1/accessories/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: unknown) {
    console.warn('API error updateAccessory', error);
    throw error;
  }
};

export const deleteAccessory = async (id: number): Promise<Accessory> => {
  try {
    const response = await api.delete(`/api/v1/accessories/${id}`);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error deleteAccessory', error);
    throw error;
  }
};

// Accessories Excel Export / Preview / Bulk Upsert
export const exportAccessoriesExcel = async (params?: {
  brandId?: number | null;
  categoryId?: number | null;
  templateOnly?: boolean;
}): Promise<void> => {
  try {
    const query: Record<string, unknown> = {};
    if (params?.brandId) query.brand_id = params.brandId;
    if (params?.categoryId) query.category_id = params.categoryId;
    if (params?.templateOnly) query.template_only = true;

    const response = await api.get('/api/v1/accessories/excel/export', {
      params: query,
      responseType: 'blob',
    });
    const disposition = response.headers['content-disposition'];
    const fallback = params?.templateOnly ? 'mau_nhap_phu_kien.xlsx' : 'danh_sach_phu_kien.xlsx';
    const fileName = getFilenameFromContentDisposition(disposition, fallback);
    await downloadOrShareBlob(response.data, fileName);
  } catch (error: unknown) {
    console.warn('API error exportAccessoriesExcel', error);
    throw error;
  }
};

export const previewAccessoriesExcel = async (file: File): Promise<AccessoryExcelPreviewResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/v1/accessories/excel/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error: unknown) {
    console.warn('API error previewAccessoriesExcel', error);
    throw error;
  }
};

export const bulkUpsertAccessories = async (
  payload: AccessoryBulkUpsertRequest,
): Promise<MaterialBulkUpsertResponse> => {
  try {
    const response = await api.post('/api/v1/accessories/excel/bulk-upsert', payload);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error bulkUpsertAccessories', error);
    throw error;
  }
};

// --- Sub-resource: Doors ---

export const getAccessoryDoors = async (
  accessoryId: number,
  params?: DoorQueryParams,
): Promise<BaseResponseWithPagination<Door>> => {
  try {
    const response = await api.get(`/api/v1/accessories/${accessoryId}/doors`, { params });
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
    console.warn('API error getAccessoryDoors', error);
    throw error;
  }
};

export const assignAccessoryDoors = async (
  accessoryId: number,
  payload: AccessoryAssignDoors,
): Promise<Door[]> => {
  try {
    const response = await api.post(`/api/v1/accessories/${accessoryId}/doors`, payload);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error assignAccessoryDoors', error);
    throw error;
  }
};

export const revokeAccessoryDoors = async (
  accessoryId: number,
  payload: AccessoryUnassignDoors,
): Promise<Door[]> => {
  try {
    const response = await api.delete(`/api/v1/accessories/${accessoryId}/doors`, {
      data: payload,
    });
    return response.data;
  } catch (error: unknown) {
    console.warn('API error revokeAccessoryDoors', error);
    throw error;
  }
};

// --- Sub-resource: Materials ---

export const getAccessoryMaterials = async (
  accessoryId: number,
  params?: MaterialQueryParams,
): Promise<BaseResponseWithPagination<Material>> => {
  try {
    const response = await api.get(`/api/v1/accessories/${accessoryId}/materials`, { params });
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
    console.warn('API error getAccessoryMaterials', error);
    throw error;
  }
};

export const assignAccessoryMaterials = async (
  accessoryId: number,
  payload: AccessoryAssignMaterials,
): Promise<Material[]> => {
  try {
    const response = await api.post(`/api/v1/accessories/${accessoryId}/materials`, payload);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error assignAccessoryMaterials', error);
    throw error;
  }
};

export const revokeAccessoryMaterials = async (
  accessoryId: number,
  payload: AccessoryUnassignMaterials,
): Promise<Material[]> => {
  try {
    const response = await api.delete(`/api/v1/accessories/${accessoryId}/materials`, {
      data: payload,
    });
    return response.data;
  } catch (error: unknown) {
    console.warn('API error revokeAccessoryMaterials', error);
    throw error;
  }
};
