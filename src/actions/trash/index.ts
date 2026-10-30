import api from '@/utils/api';
import type { DocumentCategory, TrashItem, TrashActionPayload } from '@/types';
import { extractErrorMessage } from '@/actions/document';

// Lấy danh sách tài liệu và thư mục gốc trong thùng rác
export const getTrashItems = async (): Promise<TrashItem[]> => {
  try {
    const res = await api.get('/api/v1/documents/trash');
    const raw = res.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.items)) return raw.items;
    return [];
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể tải danh sách thùng rác'));
  }
};

// Lấy cây thư mục trong thùng rác (phân cấp cha - con dạng tree)
export const getTrashCategoryTree = async (): Promise<DocumentCategory[]> => {
  try {
    const res = await api.get('/api/v1/documents/trash/tree');
    const raw = res.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.items)) return raw.items;
    return [];
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể tải cây thư mục thùng rác'));
  }
};

// Khôi phục mục đã xóa
export const restoreTrashItem = async (payload: TrashActionPayload): Promise<any> => {
  try {
    const body = {
      itemType: payload.itemType,
      itemId: payload.itemId,
    };
    const res = await api.post('/api/v1/documents/trash/restore', body);
    return res.data?.data ?? res.data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể khôi phục mục đã chọn'));
  }
};

// Xóa vĩnh viễn mục đã xóa
export const purgeTrashItem = async (payload: TrashActionPayload): Promise<any> => {
  try {
    const body = {
      itemType: payload.itemType,
      itemId: payload.itemId,
    };
    try {
      const res = await api.delete('/api/v1/documents/trash/purge', { data: body });
      return res.data?.data ?? res.data;
    } catch (err: any) {
      if (err?.response?.status === 405) {
        const res = await api.post('/api/v1/documents/trash/purge', body);
        return res.data?.data ?? res.data;
      }
      throw err;
    }
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể xóa vĩnh viễn mục đã chọn'));
  }
};

// Dọn sạch toàn bộ thùng rác
export const emptyTrash = async (): Promise<any> => {
  try {
    try {
      const res = await api.delete('/api/v1/documents/trash/purge', { data: {} });
      return res.data?.data ?? res.data;
    } catch (err: any) {
      if (err?.response?.status === 405) {
        const res = await api.post('/api/v1/documents/trash/purge', {});
        return res.data?.data ?? res.data;
      }
      throw err;
    }
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể dọn sạch thùng rác'));
  }
};
