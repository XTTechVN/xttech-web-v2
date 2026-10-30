import { AccessoryCombo, Brand } from '@/types';

export type ComboCategoryTab = 'frame' | 'sash' | 'opening' | 'all' | 'individual';

/**
 * Phân loại combo phụ kiện dựa trên trường `description` trong CSDL
 * (DANH_CHO:frame, DANH_CHO:sash, DANH_CHO:direction) hoặc fallback tên/mã
 */
export function detectComboCategory(combo: AccessoryCombo): 'frame' | 'sash' | 'opening' {
  const desc = (combo.description || '').toUpperCase();
  if (desc.includes('DANH_CHO:FRAME')) return 'frame';
  if (desc.includes('DANH_CHO:SASH')) return 'sash';
  if (desc.includes('DANH_CHO:DIRECTION') || desc.includes('HUONG_MO')) return 'opening';

  // Fallback nếu description rỗng
  const c = (combo.code || '').toLowerCase();
  const n = (combo.name || '').toLowerCase();

  // Khung
  if (
    n.includes('khung') ||
    n.includes('vách') ||
    c.startsWith('kb_') ||
    c.includes('_kb') ||
    c.includes('er70-er66-kb')
  ) {
    return 'frame';
  }

  // Cánh
  if (
    n.includes('cánh') ||
    n.includes('canh') ||
    c.startsWith('c_') ||
    c.includes('ke_canh') ||
    c.includes('ke cánh')
  ) {
    return 'sash';
  }

  // Hướng mở & Phụ kiện vận hành
  if (
    n.includes('bản lề') ||
    n.includes('ban le') ||
    n.includes('khóa') ||
    n.includes('khoa') ||
    n.includes('chốt') ||
    n.includes('tay nắm') ||
    n.includes('tay nam') ||
    n.includes('lùa') ||
    n.includes('quay') ||
    n.includes('xếp') ||
    n.includes('hướng') ||
    c.startsWith('bl_') ||
    c.startsWith('kh_')
  ) {
    return 'opening';
  }

  return 'frame';
}

/**
 * Xác định thương hiệu của combo dựa trên CSDL:
 * 1. combo.brandId đối chiếu bảng brands
 * 2. comboItems[].brandName hoặc brandId
 * 3. Tìm kiếm tên thương hiệu từ CSDL trong mã/tên combo
 */
export function detectComboBrand(combo: AccessoryCombo, brands: Brand[] = []): string {
  // 1. Kiểm tra trực tiếp brandId từ CSDL
  if (combo.brandId) {
    const matched = brands.find((b) => b.id === combo.brandId);
    if (matched) return matched.name;
  }

  // 2. Kiểm tra comboItems
  if (combo.comboItems && Array.isArray(combo.comboItems)) {
    for (const item of combo.comboItems) {
      if (item.brandName) return item.brandName;
      if (item.brandId) {
        const matched = brands.find((b) => b.id === item.brandId);
        if (matched) return matched.name;
      }
    }
  }

  // 3. Quét khớp với danh sách thương hiệu động từ CSDL
  const text = `${combo.code || ''} ${combo.name || ''}`.toUpperCase();
  for (const b of brands) {
    if (b.name && b.name.length >= 2 && text.includes(b.name.toUpperCase())) {
      return b.name;
    }
  }

  return 'Khác';
}
