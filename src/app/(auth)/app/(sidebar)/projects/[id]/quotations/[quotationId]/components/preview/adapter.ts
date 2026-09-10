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
    quantity: floor.quantity ?? null,
    totalArea: floor.totalArea ?? null,
    totalAmount: floor.totalAmount ?? null,
    totalPrice: floor.totalPrice ?? null,
    materials: (floor.materials || []).map(
      (mat: QuotationMaterialResponse): PreviewMaterial => ({
        id: mat.id,
        materialId: mat.materialId,
        initPrice: mat.initPrice ?? null,
        quantity: mat.quantity ?? null,
        totalArea: mat.totalArea ?? null,
        totalPrice: mat.totalPrice ?? null,
        doors: (mat.doors || []).map(
          (door: QuotationDoorResponse): PreviewDoor => ({
            id: door.id,
            doorId: door.doorId,
            code: door.code || '',
            unit: door.unit || 'area',
            width: door.width ?? null,
            height: door.height ?? null,
            effectiveWidth: door.effectiveWidth ?? door.width ?? null,
            effectiveHeight: door.effectiveHeight ?? door.height ?? null,
            quantity: door.quantity ?? null,
            totalArea: door.totalArea ?? null,
            initPrice: door.initPrice ?? null,
            totalPrice: door.totalPrice ?? null,
            imagePath: door.imagePath ?? null,
            accessories: (door.accessories || []).map((acc: QuotationAccessoryResponse) => ({
              accessoryId: acc.accessoryId,
              name: acc.name || '',
              code: acc.code || '',
              unit: mapUnit(acc.unit),
              initPrice: acc.initPrice ?? null,
              // Số lượng phụ kiện trên mỗi bộ cửa
              quantityPerDoor: acc.totalQuantity ?? null,
              totalQuantity: acc.totalQuantity ?? null,
              totalPrice: acc.totalPrice ?? null,
            })),
            extraOptions: (door.extraOptions || []).map((opt: QuotationExtraOptionResponse) => ({
              extraOptionId: opt.optionId,
              name: opt.name || '',
              code: opt.code || '',
              unit: mapUnit(opt.unit),
              initPrice: opt.initPrice ?? null,
              calculatedQuantity: opt.calculatedQuantity ?? null,
              totalQuantity: opt.totalQuantity ?? null,
              totalArea: opt.totalArea ?? null,
              totalPrice: opt.totalPrice ?? null,
            })),
            formulas: (door.formulas || []).map((f: QuotationFormulaResponse) => ({
              formulaId: f.formulaId,
              code: f.code || '',
              name: f.name || 'Công uốn vòm',
              unit: f.unit || 'md',
              salary: f.salary ?? null,
              widthAdd: f.widthAdd ?? null,
              heightAdd: f.heightAdd ?? null,
              coefficientWidth: f.coefficientWidth ?? 1,
              coefficientHeight: f.coefficientHeight ?? 1,
              totalPrice: f.totalPrice ?? null,
              totalArea: f.totalArea ?? null,
            })),
          }),
        ),
        accessories: (mat.accessories || []).map((acc: QuotationAccessoryResponse) => ({
          accessoryId: acc.accessoryId,
          name: acc.name || '',
          code: acc.code || '',
          unit: mapUnit(acc.unit),
          initPrice: acc.initPrice ?? null,
          totalQuantity: acc.totalQuantity ?? null,
          totalPrice: acc.totalPrice ?? null,
        })),
        extraOptions: (mat.extraOptions || []).map((opt: QuotationExtraOptionResponse) => ({
          optionId: opt.optionId,
          name: opt.name || '',
          code: opt.code || '',
          unit: mapUnit(opt.unit),
          initPrice: opt.initPrice ?? null,
          calculatedQuantity: opt.calculatedQuantity ?? null,
          totalQuantity: opt.totalQuantity ?? null,
          totalPrice: opt.totalPrice ?? null,
          totalArea: opt.totalArea ?? null,
        })),
        archs: (mat.archs || []).map((arch: QuotationArchResponse) => ({
          formulaId: arch.formulaId,
          code: arch.code || 'CUVT',
          name: arch.name || 'Công uốn vòm',
          unit: arch.unit || 'md',
          type: arch.type,
          salary: arch.salary ?? null,
          totalQuantity: arch.totalQuantity ?? null,
          totalPrice: arch.totalPrice ?? null,
          totalArea: arch.totalArea ?? null,
          coefficientWidth: arch.coefficientWidth,
          coefficientHeight: arch.coefficientHeight,
        })),
      }),
    ),
  }));
};
