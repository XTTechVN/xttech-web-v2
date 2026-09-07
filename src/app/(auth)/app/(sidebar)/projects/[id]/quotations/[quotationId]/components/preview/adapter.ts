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
  QuotationFormulaResponse,
} from '@/types';

const mapUnit = (unit?: string): string => {
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
  if (!data?.floors) return [];

  return data.floors.map((floor: QuotationFloorResponse) => ({
    id: floor.id,
    name: floor.name || '',
    quantity: floor.quantity ?? 0,
    totalArea: floor.totalArea ?? 0,
    totalAmount: floor.totalAmount ?? 0,
    totalPrice: floor.totalPrice ?? 0,
    materials: (floor.materials || []).map(
      (mat: QuotationMaterialResponse): PreviewMaterial => ({
        id: mat.id,
        materialId: mat.materialId,
        initPrice: mat.initPrice ?? 0,
        quantity: mat.quantity ?? 0,
        totalArea: mat.totalArea ?? 0,
        totalPrice: mat.totalPrice ?? 0,
        doors: (mat.doors || []).map(
          (door: QuotationDoorResponse): PreviewDoor => ({
            id: door.id,
            doorId: door.doorId,
            code: door.code || '',
            unit: door.unit || 'area',
            width: door.width ?? 0,
            height: door.height ?? 0,
            effectiveWidth: door.effectiveWidth ?? door.width ?? 0,
            effectiveHeight: door.effectiveHeight ?? door.height ?? 0,
            quantity: door.quantity ?? 0,
            totalArea: door.totalArea ?? 0,
            initPrice: door.initPrice ?? 0,
            totalPrice: door.totalPrice ?? 0,
            accessories: (door.accessories || []).map((acc: QuotationAccessoryResponse) => ({
              accessoryId: acc.accessoryId,
              name: acc.name || '',
              code: acc.code || '',
              unit: mapUnit(acc.unit),
              initPrice: acc.initPrice ?? 0,
              // Số lượng phụ kiện trên mỗi bộ cửa
              quantityPerDoor: acc.totalQuantity ?? 1,
              totalPrice: acc.totalPrice ?? 0,
            })),
            extraOptions: (door.extraOptions || []).map((opt: QuotationExtraOptionResponse) => ({
              extraOptionId: opt.optionId,
              name: opt.name || '',
              code: opt.code || '',
              unit: mapUnit(opt.unit),
              initPrice: opt.initPrice ?? 0,
              calculatedQuantity: opt.calculatedQuantity ?? 0,
              totalArea: opt.totalArea ?? 0,
              totalPrice: opt.totalPrice ?? 0,
            })),
            formulas: (door.formulas || []).map((f: QuotationFormulaResponse) => ({
              formulaId: f.formulaId,
              code: f.code || '',
              name: f.name || 'Công uốn vòm',
              unit: f.unit || 'md',
              salary: f.salary ?? 0,
              widthAdd: f.widthAdd ?? 0,
              heightAdd: f.heightAdd ?? 0,
              coefficientWidth: f.coefficientWidth ?? 1,
              coefficientHeight: f.coefficientHeight ?? 1,
              totalPrice: f.totalPrice ?? 0,
              totalArea: f.totalArea ?? 0,
            })),
          }),
        ),
        accessories: (mat.accessories || []).map((acc: QuotationAccessoryResponse) => ({
          accessoryId: acc.accessoryId,
          name: acc.name || '',
          code: acc.code || '',
          unit: mapUnit(acc.unit),
          initPrice: acc.initPrice ?? 0,
          totalQuantity: acc.totalQuantity ?? 0,
          totalPrice: acc.totalPrice ?? 0,
        })),
        extraOptions: (mat.extraOptions || []).map((opt: QuotationExtraOptionResponse) => ({
          optionId: opt.optionId,
          name: opt.name || '',
          code: opt.code || '',
          unit: mapUnit(opt.unit),
          initPrice: opt.initPrice ?? 0,
          calculatedQuantity: opt.calculatedQuantity ?? 0,
          totalPrice: opt.totalPrice ?? 0,
          totalArea: opt.totalArea ?? 0,
        })),
        archs: (mat.archs || []).map((arch: QuotationArchResponse) => ({
          formulaId: arch.formulaId,
          code: arch.code || 'CUVT',
          name: arch.name || 'Công uốn vòm',
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
