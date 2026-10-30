import type {
  ProjectQuotationItem,
  ProjectQuotationPreviewRequest,
  QuotationDoorItemSnapshot,
} from '@/types';

export const DEFAULT_QUOTATION_NAME = 'Báo giá dự án';

// Giá trị mặc định đồng bộ với schema backend
export const DEFAULT_PRICING_CONFIG: ProjectQuotationPreviewRequest = {
  scopeType: 'all',
  floorIds: [],
  laborCalcUnit: 'vnd_per_m2',
  laborProductionRate: 150000,
  laborInstallRate: 120000,
  laborCleanRate: 30000,
  otherCost: 0,
  managementRatePercent: 16,
  pricingMode: 'markup',
  markupPercent: 45,
  marginPercent: 30,
  discountPercent: 0,
  vatPercent: 10,
  accessoryMode: 'combined',
};

// Giá phụ kiện coi là nhập tay khi khác giá gợi ý (bị trần bởi giá bộ cửa)
export const isAccessoryManual = (item: QuotationDoorItemSnapshot): boolean =>
  item.accessoryMode === 'separated' &&
  item.accessorySellingPrice !== Math.min(item.accessorySuggestedPrice, item.sellingPrice);

// Khi tính riêng phụ kiện: bộ đã có giá tay (giá cửa hoặc giá phụ kiện)
export const isSeparatedManual = (item: QuotationDoorItemSnapshot): boolean =>
  item.isManuallyEdited || isAccessoryManual(item);

interface ManualPrices {
  customSellingPrices: Record<number, number>;
  customAccessoryPrices: Record<number, number>;
}

// Giá bán sửa tay đã lưu trong báo giá, theo positionId
export const extractManualPrices = (items: QuotationDoorItemSnapshot[]): ManualPrices => {
  const customSellingPrices: Record<number, number> = {};
  const customAccessoryPrices: Record<number, number> = {};
  items.forEach((item) => {
    if (item.isManuallyEdited) customSellingPrices[item.positionId] = item.sellingPrice;
    if (isAccessoryManual(item)) customAccessoryPrices[item.positionId] = item.accessorySellingPrice;
  });
  return { customSellingPrices, customAccessoryPrices };
};

// Đổ cấu hình của báo giá đã lưu lên form
export const buildConfigFromQuotation = (
  quotation: ProjectQuotationItem,
): ProjectQuotationPreviewRequest => ({
  scopeType: quotation.scopeType,
  floorIds: quotation.floorIds,
  laborCalcUnit: quotation.laborCalcUnit,
  laborProductionRate: quotation.laborProductionRate,
  laborInstallRate: quotation.laborInstallRate,
  laborCleanRate: quotation.laborCleanRate,
  otherCost: quotation.otherCost,
  otherSellingPrice:
    quotation.otherSellingPrice === quotation.otherCost ? undefined : quotation.otherSellingPrice,
  managementRatePercent: quotation.managementRatePercent,
  pricingMode: quotation.pricingMode,
  markupPercent: quotation.markupPercent,
  marginPercent: quotation.marginPercent,
  discountPercent: quotation.discountPercent,
  vatPercent: quotation.vatPercent,
  accessoryMode: quotation.accessoryMode,
  ...extractManualPrices(Array.isArray(quotation.snapshotItems) ? quotation.snapshotItems : []),
});

// Gom các bộ cửa theo tầng để hiển thị bảng chi tiết
export const groupItemsByFloor = (
  items: QuotationDoorItemSnapshot[],
): [string, QuotationDoorItemSnapshot[]][] =>
  Object.entries(
    items.reduce<Record<string, QuotationDoorItemSnapshot[]>>((acc, item) => {
      (acc[item.floorName] ??= []).push(item);
      return acc;
    }, {}),
  );
