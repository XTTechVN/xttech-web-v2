import api from '@/utils/api';

export type CatalogKind = 'brand' | 'series' | 'profile-bar' | 'glass' | 'door' | 'accessory' | 'combo';

/** Nhân bản bản ghi dùng chung của nền tảng về doanh nghiệp đang đăng nhập; trả id bản sao */
export const copyCatalogItem = async (kind: CatalogKind, id: number): Promise<number> => {
  const response = await api.post(`/api/v1/catalog/${kind}/${id}/copy`);
  return response.data.id;
};
