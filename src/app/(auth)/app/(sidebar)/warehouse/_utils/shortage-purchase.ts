import type { ShortageItemDetail, WarehouseReceiptItemCreatePayload } from '@/types';
import { toDisplayUnit } from './unit-mapping';

// Mặt hàng thiếu nhưng chưa gán mã profile thì không thể lập phiếu mua/nhập kho
export const getPurchasableShortages = (shortages: ShortageItemDetail[]): ShortageItemDetail[] =>
  shortages.filter((shortage) => shortage.isConfigured !== false);

// Chuyển danh sách thiếu hụt thành dòng phiếu mua bù (dùng chung cho Kho và Sản xuất)
export const buildShortagePurchaseItems = (
  shortages: ShortageItemDetail[],
  projectText: string,
): WarehouseReceiptItemCreatePayload[] =>
  getPurchasableShortages(shortages).map((shortage) => ({
    itemId: shortage.itemId || undefined,
    itemCode: shortage.itemCode,
    itemName: shortage.itemName,
    itemType: (shortage.itemType as WarehouseReceiptItemCreatePayload['itemType']) || 'profile',
    profileBarId: shortage.profileBarId || undefined,
    unit: toDisplayUnit(shortage.unit),
    colorId: shortage.colorId || undefined,
    colorName: shortage.colorName || undefined,
    quantity: shortage.shortageQty,
    unitPrice: shortage.estimatedPrice || 0,
    note: `Mua bù thiếu hụt DA ${projectText}`,
  }));
