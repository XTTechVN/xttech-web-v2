import type {
  PreviewFloor,
  PreviewMaterial,
  PreviewDoor,
  QuotationDetail,
  QuotationFloorResponse,
  QuotationMaterialResponse,
  QuotationDoorResponse,
  QuotationAccessoryResponse,
  QuotationExtraOptionResponse,
  QuotationArchResponse,
} from '@/types';

const mapAccessoryUnit = (unit?: string): string => {
  if (!unit) return 'bộ';
  const u = unit.toLowerCase();
  switch (u) {
    case 'set':
      return 'bộ';
    case 'pcs':
      return 'cái';
    case 'unit':
      return 'chiếc';
    case 'pair':
      return 'đôi';
    default:
      return unit;
  }
};

export const adaptQuotationPreview = (data: QuotationDetail): PreviewFloor[] => {
  if (!data || !data.floors) return [];

  return data.floors.map((floor: QuotationFloorResponse) => ({
    id: floor.id,
    name: floor.name || '',
    quantity: floor.quantity ?? 0,
    totalArea: floor.totalArea ?? 0,
    totalAmount: floor.totalPrice ?? floor.totalAmount ?? 0,
    totalPrice: floor.totalPrice ?? floor.totalAmount ?? 0,
    materials: (floor.materials || []).map(
      (mat: QuotationMaterialResponse): PreviewMaterial => ({
        id: mat.id,
        materialId: mat.materialId,
        initPrice: mat.initPrice ?? 0,
        quantity: mat.quantity ?? 0,
        totalArea: mat.totalArea ?? 0,
        totalAmount: mat.totalPrice ?? mat.totalAmount ?? 0,
        totalPrice: mat.totalPrice ?? mat.totalAmount ?? 0,
        doors: (mat.doors || []).map(
          (door: QuotationDoorResponse): PreviewDoor => ({
            id: door.id,
            doorId: door.doorId,
            code: door.code || '',
            width: door.width ?? 0,
            height: door.height ?? 0,
            effectiveWidth: door.effectiveWidth ?? door.width ?? 0,
            effectiveHeight: door.effectiveHeight ?? door.height ?? 0,
            quantity: door.quantity ?? 0,
            totalArea: door.totalArea ?? 0,
            initPrice: door.initPrice ?? 0,
            totalPrice: door.totalPrice ?? 0,
          }),
        ),
        accessories: (mat.accessories || []).map((acc: QuotationAccessoryResponse) => ({
          accessoryId: acc.accessoryId,
          name: acc.name || '',
          code: acc.code || '',
          unit: mapAccessoryUnit(acc.unit),
          initPrice: acc.initPrice ?? 0,
          totalQuantity: acc.totalQuantity ?? 0,
          totalPrice: acc.totalPrice ?? 0,
        })),
        extraOptions: (mat.extraOptions || []).map((opt: QuotationExtraOptionResponse) => ({
          optionId: opt.optionId,
          name: opt.name || '',
          code: opt.code || '',
          unit: mapAccessoryUnit(opt.unit),
          initPrice: opt.initPrice ?? 0,
          calculatedQuantity: opt.calculatedQuantity ?? 0,
          totalPrice: opt.totalPrice ?? 0,
          totalArea: opt.totalArea ?? 0,
        })),
        archs: (mat.archs || []).map((arch: QuotationArchResponse) => ({
          formulaId: arch.formulaId,
          code: 'CUVT',
          name: 'Công uốn vòm',
          unit: arch.unit || 'md',
          type: arch.type,
          salary: arch.salary ?? 0,
          totalQuantity: arch.totalQuantity ?? 0,
          totalPrice: arch.totalPrice ?? 0,
          totalArea: arch.totalArea ?? 0,
          coefficientWidth: arch.coefficientWidth,
          coefficientHeight: arch.coefficientHeight,
        })),
      }),
    ),
  }));
};
