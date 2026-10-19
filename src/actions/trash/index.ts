import api from '@/utils/api';
import type { TrashItem, TrashActionPayload } from '@/types';
import { extractErrorMessage } from '@/actions/document';

// Lấy danh sách tài liệu và thư mục trong thùng rác
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

// Khôi phục mục đã xóa
export const restoreTrashItem = async (payload: TrashActionPayload): Promise<any> => {
  try {
    const body = {
      itemType: payload.itemType,
      itemId: payload.itemId,
      item_type: payload.itemType,
      item_id: payload.itemId,
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
      item_type: payload.itemType,
      item_id: payload.itemId,
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
