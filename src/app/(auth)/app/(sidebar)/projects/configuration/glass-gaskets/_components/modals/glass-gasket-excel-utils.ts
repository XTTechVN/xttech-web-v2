import type {
  Glass,
  GlassCategory,
  Gasket,
  GlassExcelItemData,
  GlassExcelPreviewRow,
  GasketExcelItemData,
  GasketExcelPreviewRow,
  ExcelRowAction,
} from '@/types';
import { getCategoryMaterialType } from '../glass-category-sidebar';

export function validateGlassRow(
  data: GlassExcelItemData,
  rowIndex: number,
  categories: GlassCategory[],
  existingGlasses: Glass[],
  fallbackOld?: GlassExcelItemData | null,
): GlassExcelPreviewRow {
  const errors: string[] = [];
  const code = (data.code || '').trim();
  const name = (data.name || '').trim();
  if (!code) errors.push('Thiếu mã quy cách');
  if (!name) errors.push('Thiếu tên quy cách');

  const cat = categories.find((c) => c.id === Number(data.categoryId));
  if (!cat) errors.push('Chưa chọn nhóm chủng loại');
  if (!data.thicknessMm || Number(data.thicknessMm) <= 0) errors.push('Độ dày phải > 0');
  if (Number(data.unitPrice) < 0) errors.push('Đơn giá không hợp lệ');

  const matched = code
    ? existingGlasses.find((g) => g.code.trim().toUpperCase() === code.toUpperCase())
    : null;
  const action: ExcelRowAction = errors.length > 0 ? 'ERROR' : matched ? 'UPDATE' : 'CREATE';

  return {
    rowIndex,
    action,
    existingId: matched ? matched.id : null,
    data: {
      ...data,
      categoryCode: cat?.code ?? data.categoryCode,
      categoryName: cat?.name ?? data.categoryName,
    },
    oldData: matched
      ? {
          code: matched.code,
          name: matched.name,
          materialType: getCategoryMaterialType(cat || categories[0]),
          categoryId: matched.categoryId,
          glassType: matched.glassType || 'cuong_luc',
          thicknessMm: matched.thicknessMm,
          unitPrice: matched.unitPrice,
          weightPerM2: matched.weightPerM2 ?? 0,
          maxWidthMm: matched.maxWidthMm ?? null,
          maxHeightMm: matched.maxHeightMm ?? null,
          isDefault: matched.isDefault,
          isActive: matched.isActive,
        }
      : (fallbackOld ?? null),
    errors,
    warnings: [],
  };
}

export function validateGasketRow(
  data: GasketExcelItemData,
  rowIndex: number,
  existingGaskets: Gasket[],
  fallbackOld?: GasketExcelItemData | null,
): GasketExcelPreviewRow {
  const errors: string[] = [];
  const code = (data.code || '').trim();
  const name = (data.name || '').trim();
  if (!code) errors.push('Thiếu mã vật tư');
  if (!name) errors.push('Thiếu tên vật tư');
  if (Number(data.pricePerUnit) < 0) errors.push('Đơn giá không hợp lệ');

  const matched = code
    ? existingGaskets.find((gk) => gk.code.trim().toUpperCase() === code.toUpperCase())
    : null;
  const action: ExcelRowAction = errors.length > 0 ? 'ERROR' : matched ? 'UPDATE' : 'CREATE';

  return {
    rowIndex,
    action,
    existingId: matched ? matched.id : null,
    data,
    oldData: matched
      ? {
          code: matched.code,
          name: matched.name,
          unit: matched.unit,
          pricePerUnit: matched.pricePerUnit,
          isActive: matched.isActive,
        }
      : (fallbackOld ?? null),
    errors,
    warnings: [],
  };
}
