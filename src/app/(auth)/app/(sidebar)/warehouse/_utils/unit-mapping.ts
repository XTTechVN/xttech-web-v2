/**
 * Mapping Đơn vị tính giữa Backend (chuẩn tiếng Anh không dấu) và Frontend (Nhãn tiếng Việt)
 * Tuân thủ Rule 14 trong quy chuẩn hệ thống.
 */

export const BACKEND_TO_DISPLAY_UNIT: Record<string, string> = {
  bar: 'Cây',
  pcs: 'Cái',
  unit: 'Chiếc',
  set: 'Bộ',
  pair: 'Đôi',
  meter: 'Mét',
  m: 'Mét',
  kg: 'Kg',
  roll: 'Cuộn',
  box: 'Hộp',
  bottle: 'Chai',
  sheet: 'Tấm',
};

export const DISPLAY_TO_BACKEND_UNIT: Record<string, string> = {
  cây: 'bar',
  cay: 'bar',
  cái: 'pcs',
  cai: 'pcs',
  con: 'pcs',
  chiếc: 'unit',
  chiec: 'unit',
  bộ: 'set',
  bo: 'set',
  đôi: 'pair',
  doi: 'pair',
  mét: 'meter',
  met: 'meter',
  m: 'meter',
  kg: 'kg',
  cuộn: 'roll',
  cuon: 'roll',
  hộp: 'box',
  hop: 'box',
  chai: 'bottle',
  bình: 'bottle',
  binh: 'bottle',
  lọ: 'bottle',
  lo: 'bottle',
  tấm: 'sheet',
  tam: 'sheet',
};

/**
 * Chuyển mã định danh tiếng Anh sang tiếng Việt thân thiện để hiển thị
 */
export function toDisplayUnit(unit?: string | null): string {
  if (!unit) return 'Cái';
  const clean = unit.trim().toLowerCase();
  return BACKEND_TO_DISPLAY_UNIT[clean] || unit;
}

/**
 * Chuẩn hóa chuỗi người dùng nhập (tiếng Việt hoặc tiếng Anh) về mã backend chuẩn
 */
export function toBackendUnit(unit?: string | null): string {
  if (!unit) return 'pcs';
  const clean = unit.trim().toLowerCase();
  if (DISPLAY_TO_BACKEND_UNIT[clean]) {
    return DISPLAY_TO_BACKEND_UNIT[clean];
  }
  // Nếu đã là mã backend hợp lệ
  if (BACKEND_TO_DISPLAY_UNIT[clean]) {
    return clean;
  }
  return clean;
}

export const STANDARD_UNIT_OPTIONS = [
  { value: 'Cây', label: 'Cây (Thanh nhôm profile)' },
  { value: 'Cái', label: 'Cái (Phụ kiện, chi tiết)' },
  { value: 'Bộ', label: 'Bộ (Combo khóa, bản lề)' },
  { value: 'Mét', label: 'Mét (Gioăng cao su, nẹp)' },
  { value: 'Chiếc', label: 'Chiếc (Tay nắm, chốt)' },
  { value: 'Đôi', label: 'Đôi (Bản lề đôi)' },
  { value: 'Cuộn', label: 'Cuộn (Gioăng cuộn, decal)' },
  { value: 'Hộp', label: 'Hộp (Vít, keo)' },
  { value: 'Chai', label: 'Chai / Lọ (Keo silicone)' },
  { value: 'Tấm', label: 'Tấm (Kính, alu)' },
  { value: 'Kg', label: 'Kg (Nhôm phế liệu)' },
];
