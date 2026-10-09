import api from '@/utils/api';
import type { BaseResponseWithPagination } from '@/components';
import {
  WarehouseSupplier,
  WarehouseSupplierCreatePayload,
  WarehouseItem,
  WarehouseItemCreatePayload,
  WarehouseOffcut,
  WarehouseOffcutCreatePayload,
  WarehouseReceipt,
  WarehouseReceiptCreatePayload,
  ShortageCheckResponse,
  GlassOrder,
  GlassOrderGeneratePayload,
} from '@/types';

// =========================================================================
// 1. SUPPLIERS
// =========================================================================
export async function getWarehouseSuppliers(params?: {
  supplier_type?: string;
  is_active?: boolean;
  limit?: number;
  offset?: number;
}): Promise<BaseResponseWithPagination<WarehouseSupplier>> {
  const response = await api.get('/api/v1/warehouse/suppliers', { params });
  return {
    items: response.data?.items || [],
    meta: response.data?.meta || { total: 0, offset: 0, limit: 10, next: false },
  };
}

export async function createWarehouseSupplier(
  payload: WarehouseSupplierCreatePayload
): Promise<WarehouseSupplier> {
  const response = await api.post('/api/v1/warehouse/suppliers', payload);
  return response.data;
}

// =========================================================================
// 2. WAREHOUSE ITEMS
// =========================================================================
export async function getWarehouseItems(params?: {
  item_type?: string;
  is_low_stock?: boolean;
  limit?: number;
  offset?: number;
}): Promise<BaseResponseWithPagination<WarehouseItem>> {
  const response = await api.get('/api/v1/warehouse/items', { params });
  return {
    items: response.data?.items || [],
    meta: response.data?.meta || { total: 0, offset: 0, limit: 10, next: false },
  };
}

export async function createWarehouseItem(
  payload: WarehouseItemCreatePayload
): Promise<WarehouseItem> {
  const response = await api.post('/api/v1/warehouse/items', payload);
  return response.data;
}

// =========================================================================
// 3. OFFCUTS (KHO ĐỀ-XÊ)
// =========================================================================
export async function getWarehouseOffcuts(params?: {
  status?: string;
  min_length?: number;
  max_length?: number;
  limit?: number;
  offset?: number;
}): Promise<BaseResponseWithPagination<WarehouseOffcut>> {
  const response = await api.get('/api/v1/warehouse/offcuts', { params });
  return {
    items: response.data?.items || [],
    meta: response.data?.meta || { total: 0, offset: 0, limit: 10, next: false },
  };
}

export async function createWarehouseOffcut(
  payload: WarehouseOffcutCreatePayload
): Promise<WarehouseOffcut> {
  const response = await api.post('/api/v1/warehouse/offcuts', payload);
  return response.data;
}

// =========================================================================
// 4. RECEIPTS
// =========================================================================
export async function getWarehouseReceipts(params?: {
  receipt_type?: string;
  receipt_reason?: string;
  status?: string;
  project_id?: number;
  limit?: number;
  offset?: number;
}): Promise<BaseResponseWithPagination<WarehouseReceipt>> {
  const response = await api.get('/api/v1/warehouse/receipts', { params });
  return {
    items: response.data?.items || [],
    meta: response.data?.meta || { total: 0, offset: 0, limit: 10, next: false },
  };
}

export async function getWarehouseReceiptDetail(
  receiptId: number
): Promise<WarehouseReceipt> {
  const response = await api.get(`/api/v1/warehouse/receipts/${receiptId}`);
  return response.data;
}

export async function createWarehouseReceipt(
  payload: WarehouseReceiptCreatePayload
): Promise<WarehouseReceipt> {
  const response = await api.post('/api/v1/warehouse/receipts', payload);
  return response.data;
}

export async function approveWarehouseReceipt(
  receiptId: number
): Promise<WarehouseReceipt> {
  const response = await api.put(`/api/v1/warehouse/receipts/${receiptId}/approve`, {});
  return response.data;
}

export async function cancelWarehouseReceipt(
  receiptId: number
): Promise<WarehouseReceipt> {
  const response = await api.put(`/api/v1/warehouse/receipts/${receiptId}/cancel`, {});
  return response.data;
}

// =========================================================================
// 5. SHORTAGE CHECK & AUTO EXPORT
// =========================================================================
export async function checkProjectMaterialShortage(
  projectId: number,
  productionOrderId?: number
): Promise<ShortageCheckResponse> {
  const response = await api.get(`/api/v1/warehouse/projects/${projectId}/check-shortage`, {
    params: { production_order_id: productionOrderId },
  });
  return response.data;
}

export async function autoExportWarehouseForOrder(
  projectId: number,
  productionOrderId: number,
  note?: string
): Promise<WarehouseReceipt> {
  const response = await api.post(`/api/v1/warehouse/projects/${projectId}/auto-export`, {
    production_order_id: productionOrderId,
    note,
  });
  return response.data;
}

export async function createReworkIssue(
  projectId: number,
  payload: {
    productionOrderId?: number;
    workerName?: string;
    issueReason: string;
    items: Array<{
      itemId?: number;
      itemCode: string;
      itemName: string;
      unit: string;
      quantity: number;
      unitPrice?: number;
      note?: string;
    }>;
    recoveredOffcuts?: Array<{
      profileBarId: number;
      colorId: number;
      lengthMm: number;
      location?: string;
      note?: string;
    }>;
  }
): Promise<WarehouseReceipt> {
  const response = await api.post(`/api/v1/warehouse/projects/${projectId}/rework-issue`, payload);
  return response.data;
}

// =========================================================================
// 6. GLASS ORDERS
// =========================================================================
export async function getProjectGlassOrders(
  projectId: number,
  params?: { status?: string; supplier_id?: number; limit?: number; offset?: number }
): Promise<BaseResponseWithPagination<GlassOrder>> {
  const response = await api.get(`/api/v1/projects/${projectId}/glass-orders`, { params });
  return {
    items: response.data?.items || [],
    meta: response.data?.meta || { total: 0, offset: 0, limit: 10, next: false },
  };
}

export async function getProjectGlassOrderDetail(
  projectId: number,
  orderId: number
): Promise<GlassOrder> {
  const response = await api.get(`/api/v1/projects/${projectId}/glass-orders/${orderId}`);
  return response.data;
}

export async function generateProjectGlassOrder(
  projectId: number,
  payload: GlassOrderGeneratePayload
): Promise<GlassOrder> {
  const response = await api.post(`/api/v1/projects/${projectId}/glass-orders/generate`, {
    production_order_id: payload.productionOrderId,
    supplier_id: payload.supplierId,
    default_unit_price: payload.defaultUnitPrice,
    note: payload.note,
  });
  return response.data;
}

export async function sendGlassOrderToSupplier(
  projectId: number,
  orderId: number
): Promise<GlassOrder> {
  const response = await api.put(`/api/v1/projects/${projectId}/glass-orders/${orderId}/send-to-supplier`, {});
  return response.data;
}

export async function receiveGlassOrderDelivery(
  projectId: number,
  orderId: number,
  payload: {
    actualDeliveryDate?: string;
    deliveryEvidenceMedia?: Array<Record<string, any>>;
    note?: string;
  }
): Promise<GlassOrder> {
  const response = await api.put(`/api/v1/projects/${projectId}/glass-orders/${orderId}/receive`, payload);
  return response.data;
}
