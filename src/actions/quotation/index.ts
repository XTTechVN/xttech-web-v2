import api from '@/utils/api';
import type { BaseResponseWithPagination } from '@/components';
import type { Quotation, QuotationCreate, QuotationQueryParams, QuotationUpdate } from '@/types';

export const getQuotations = async (
  params?: QuotationQueryParams,
): Promise<BaseResponseWithPagination<Quotation>> => {
  try {
    const response = await api.get('/api/v1/quotations', { params });
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
    console.warn('API error getQuotations', error);
    throw error;
  }
};

export const getQuotation = async (id: number): Promise<Quotation> => {
  try {
    const response = await api.get(`/api/v1/quotations/${id}`);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error getQuotation', error);
    throw error;
  }
};

export const createQuotation = async (data: QuotationCreate): Promise<Quotation> => {
  try {
    const response = await api.post('/api/v1/quotations', data);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error createQuotation', error);
    throw error;
  }
};

export const updateQuotation = async (id: number, data: QuotationUpdate): Promise<Quotation> => {
  try {
    const response = await api.put(`/api/v1/quotations/${id}`, data);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error updateQuotation', error);
    throw error;
  }
};

export const deleteQuotation = async (id: number): Promise<Quotation> => {
  try {
    const response = await api.delete(`/api/v1/quotations/${id}`);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error deleteQuotation', error);
    throw error;
  }
};
