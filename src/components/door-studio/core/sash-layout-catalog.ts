/**
 * SASH LAYOUT CATALOG & GENERATOR (Thư viện Kiểu Cánh Chuẩn Hóa)
 * Cung cấp đầy đủ hơn 50+ cấu hình kiểu cánh cửa đi, cửa sổ, lùa, gấp xếp, trượt quay.
 * Hỗ trợ bộ sinh Parametric tự động cho cửa gấp xếp N-R và cửa lùa đa ray.
 */

export type SashFamily =
  | 'cua-so'
  | 'cua-di'
  | 'cua-so-lua'
  | 'cua-di-lua'
  | 'gap-xep'
  | 'truot-quay';

export type SashLayouter =
  | 'h-equal'
  | 'h-equal-door'
  | 'sliding'
  | 'sliding-door'
  | 'sliding-vertical'
  | 'h-fold'
  | 'v-equal';

export type SashOpeningDirection =
  | 'le-trai-mo-ra'
  | 'le-trai-mo-vao'
  | 'le-phai-mo-ra'
  | 'le-phai-mo-vao'
  | 'gap-xep-le-trai'
  | 'gap-xep-le-phai'
  | 'mo-hat'
  | 'mo-lat'
  | 'mo-song-song'
  | 'lua-trai'
  | 'lua-phai'
  | '2-chieu'
  | 'sliding'
  | 'lua-ep-trai'
  | 'lua-ep-phai'
  | 'lua-len'
  | 'lua-xuong'
  | 'canh-truot'
  | 'canh-quay'
  | 'canh-giua'
  | 'co-dinh';

export interface SashItemDefinition {
  huongMo: SashOpeningDirection | SashOpeningDirection[];
  hasHandle: boolean;
  handleType?: string | null;
  handleSide?: 'trai' | 'phai' | 'center' | 'both';
  arrowType?: string;
  zIndex?: number;
  joiner?: boolean;
  joinerPair?: boolean;
  hingeSymbol?: string;
}

export interface SashLayoutConfig {
  id: string;
  family: SashFamily;
  label: string;
  layouter: SashLayouter;
  sashes: SashItemDefinition[];
  extras?: Record<string, any>;
  voCucLegacyAlias?: boolean;
}

/**
 * Hàm sinh Parametric tự động cho Cửa Gấp Xếp (Bi-folding Door)
 * @param label Tên hiển thị tiếng Việt
 * @param pattern Chuỗi tỷ lệ ví dụ "3-1", "4-0", "2-2", "5-1" (n cánh dồn trái, r cánh dồn phải)
 */
export function createFoldingLayout(label: string, pattern: string): SashLayoutConfig {
  const [leftCount, rightCount] = pattern.split('-').map(Number);
  const totalSashes = leftCount + rightCount;
  
  // Xác định vị trí cánh có tay nắm chính
  const handleIndex =
    leftCount === 0
      ? 0
      : rightCount === 0
      ? leftCount - 1
      : leftCount === 1
      ? 0
      : rightCount === 1
      ? totalSashes - 1
      : leftCount;

  return {
    id: `cua-gap-xep-${totalSashes}-canh-${pattern}`,
    family: 'gap-xep',
    label,
    layouter: 'h-fold',
    extras: {
      pattern,
      leftCount,
      rightCount,
    },
    sashes: Array.from({ length: totalSashes }, (_, idx) => {
      const isLeftFold = idx < leftCount;
      const isHandle = idx === handleIndex;
      return {
        huongMo: isLeftFold ? 'le-trai-mo-ra' : 'le-phai-mo-ra',
        hasHandle: isHandle,
        ...(isHandle
          ? {
              handleType: isLeftFold ? 'gap-xep-le-trai' : 'gap-xep-le-phai',
              handleSide: isLeftFold ? 'phai' : 'trai',
            }
          : {}),
      };
    }),
  };
}

/**
 * Toàn bộ Danh mục Cấu hình Kiểu Cánh Chuẩn Hóa
 */
export const SASH_LAYOUT_CATALOG: Record<string, SashLayoutConfig> = {
  // ==========================================
  // 1. CỬA SỔ MỞ QUAY / HẤT / LẬT (cua-so)
  // ==========================================
  'so-le-trai': {
    id: 'so-le-trai',
    family: 'cua-so',
    label: 'Cửa sổ lề trái mở ra',
    layouter: 'h-equal',
    sashes: [{ huongMo: 'le-trai-mo-ra', hasHandle: true, handleSide: 'phai' }],
  },
  'so-le-trai-mo-vao': {
    id: 'so-le-trai-mo-vao',
    family: 'cua-so',
    label: 'Cửa sổ lề trái mở vào',
    layouter: 'h-equal',
    sashes: [{ huongMo: 'le-trai-mo-vao', hasHandle: true, handleSide: 'phai' }],
  },
  'so-le-phai': {
    id: 'so-le-phai',
    family: 'cua-so',
    label: 'Cửa sổ lề phải mở ra',
    layouter: 'h-equal',
    sashes: [{ huongMo: 'le-phai-mo-ra', hasHandle: true, handleSide: 'trai' }],
  },
  'so-le-phai-mo-vao': {
    id: 'so-le-phai-mo-vao',
    family: 'cua-so',
    label: 'Cửa sổ lề phải mở vào',
    layouter: 'h-equal',
    sashes: [{ huongMo: 'le-phai-mo-vao', hasHandle: true, handleSide: 'trai' }],
  },
  'so-2-canh': {
    id: 'so-2-canh',
    family: 'cua-so',
    label: 'Cửa sổ 2 cánh mở ra',
    layouter: 'h-equal',
    sashes: [
      { huongMo: 'le-trai-mo-ra', hasHandle: false },
      { huongMo: 'le-phai-mo-ra', hasHandle: true, handleSide: 'trai' },
    ],
  },
  'so-2-canh-mo-vao': {
    id: 'so-2-canh-mo-vao',
    family: 'cua-so',
    label: 'Cửa sổ 2 cánh mở vào',
    layouter: 'h-equal',
    sashes: [
      { huongMo: 'le-trai-mo-vao', hasHandle: false },
      { huongMo: 'le-phai-mo-vao', hasHandle: true, handleSide: 'trai' },
    ],
  },
  'so-mo-hat': {
    id: 'so-mo-hat',
    family: 'cua-so',
    label: 'Cửa sổ mở hất',
    layouter: 'h-equal',
    sashes: [{ huongMo: 'mo-hat', hasHandle: true, handleSide: 'center' }],
  },
  'so-mo-lat': {
    id: 'so-mo-lat',
    family: 'cua-so',
    label: 'Cửa sổ mở lật',
    layouter: 'h-equal',
    sashes: [{ huongMo: 'mo-lat', hasHandle: true, handleSide: 'center' }],
  },
  'so-quay-hat-le-trai': {
    id: 'so-quay-hat-le-trai',
    family: 'cua-so',
    label: 'Quay-hất lề trái',
    layouter: 'h-equal',
    sashes: [{ huongMo: ['le-trai-mo-ra', 'mo-hat'], hasHandle: true, handleSide: 'phai' }],
  },
  'so-quay-hat-le-phai': {
    id: 'so-quay-hat-le-phai',
    family: 'cua-so',
    label: 'Quay-hất lề phải',
    layouter: 'h-equal',
    sashes: [{ huongMo: ['le-phai-mo-ra', 'mo-hat'], hasHandle: true, handleSide: 'trai' }],
  },
  'so-quay-lat-le-trai': {
    id: 'so-quay-lat-le-trai',
    family: 'cua-so',
    label: 'Quay-lật lề trái',
    layouter: 'h-equal',
    sashes: [{ huongMo: ['le-trai-mo-vao', 'mo-lat'], hasHandle: true, handleSide: 'phai' }],
  },
  'so-quay-lat-le-phai': {
    id: 'so-quay-lat-le-phai',
    family: 'cua-so',
    label: 'Quay-lật lề phải',
    layouter: 'h-equal',
    sashes: [{ huongMo: ['le-phai-mo-vao', 'mo-lat'], hasHandle: true, handleSide: 'trai' }],
  },
  'so-mo-song-song': {
    id: 'so-mo-song-song',
    family: 'cua-so',
    label: 'Cửa sổ mở song song',
    layouter: 'h-equal',
    sashes: [{ huongMo: 'mo-song-song', hasHandle: true, handleType: 'cua-so-song-song', handleSide: 'both' }],
  },

  // ==========================================
  // 2. CỬA ĐI MỞ QUAY (cua-di)
  // ==========================================
  'cua-di-le-trai-mo-ra': {
    id: 'cua-di-le-trai-mo-ra',
    family: 'cua-di',
    label: 'Cửa đi lề trái mở ra',
    layouter: 'h-equal-door',
    sashes: [{ huongMo: 'le-trai-mo-ra', hasHandle: true, handleSide: 'phai' }],
  },
  'cua-di-le-trai-mo-vao': {
    id: 'cua-di-le-trai-mo-vao',
    family: 'cua-di',
    label: 'Cửa đi lề trái mở vào',
    layouter: 'h-equal-door',
    sashes: [{ huongMo: 'le-trai-mo-vao', hasHandle: true, handleSide: 'phai' }],
  },
  'cua-di-le-phai-mo-ra': {
    id: 'cua-di-le-phai-mo-ra',
    family: 'cua-di',
    label: 'Cửa đi lề phải mở ra',
    layouter: 'h-equal-door',
    sashes: [{ huongMo: 'le-phai-mo-ra', hasHandle: true, handleSide: 'trai' }],
  },
  'cua-di-le-phai-mo-vao': {
    id: 'cua-di-le-phai-mo-vao',
    family: 'cua-di',
    label: 'Cửa đi lề phải mở vào',
    layouter: 'h-equal-door',
    sashes: [{ huongMo: 'le-phai-mo-vao', hasHandle: true, handleSide: 'trai' }],
  },
  'cua-di-2-canh-mo-ra': {
    id: 'cua-di-2-canh-mo-ra',
    family: 'cua-di',
    label: 'Cửa đi 2 cánh mở ra',
    layouter: 'h-equal-door',
    sashes: [
      { huongMo: 'le-trai-mo-ra', hasHandle: false },
      { huongMo: 'le-phai-mo-ra', hasHandle: true, handleSide: 'trai' },
    ],
  },
  'cua-di-2-canh-mo-vao': {
    id: 'cua-di-2-canh-mo-vao',
    family: 'cua-di',
    label: 'Cửa đi 2 cánh mở vào',
    layouter: 'h-equal-door',
    sashes: [
      { huongMo: 'le-trai-mo-vao', hasHandle: false },
      { huongMo: 'le-phai-mo-vao', hasHandle: true, handleSide: 'trai' },
    ],
  },
  'cua-di-3-canh-mo-ra-1-2': {
    id: 'cua-di-3-canh-mo-ra-1-2',
    family: 'cua-di',
    label: 'Cửa đi 3 cánh mở ra (1+2)',
    layouter: 'h-equal-door',
    sashes: [
      { huongMo: 'le-trai-mo-ra', hasHandle: true, handleSide: 'phai' },
      { huongMo: 'le-phai-mo-ra', hasHandle: false },
      { huongMo: 'le-phai-mo-ra', hasHandle: false },
    ],
  },
  'cua-di-3-canh-mo-vao-1-2': {
    id: 'cua-di-3-canh-mo-vao-1-2',
    family: 'cua-di',
    label: 'Cửa đi 3 cánh mở vào (1+2)',
    layouter: 'h-equal-door',
    sashes: [
      { huongMo: 'le-trai-mo-vao', hasHandle: true, handleSide: 'phai' },
      { huongMo: 'le-phai-mo-vao', hasHandle: false },
      { huongMo: 'le-phai-mo-vao', hasHandle: false },
    ],
  },
  'cua-di-3-canh-mo-ra-2-1': {
    id: 'cua-di-3-canh-mo-ra-2-1',
    family: 'cua-di',
    label: 'Cửa đi 3 cánh mở ra (2+1)',
    layouter: 'h-equal-door',
    sashes: [
      { huongMo: 'le-trai-mo-ra', hasHandle: false },
      { huongMo: 'le-trai-mo-ra', hasHandle: false },
      { huongMo: 'le-phai-mo-ra', hasHandle: true, handleSide: 'trai' },
    ],
  },
  'cua-di-3-canh-mo-vao-2-1': {
    id: 'cua-di-3-canh-mo-vao-2-1',
    family: 'cua-di',
    label: 'Cửa đi 3 cánh mở vào (2+1)',
    layouter: 'h-equal-door',
    sashes: [
      { huongMo: 'le-trai-mo-vao', hasHandle: false },
      { huongMo: 'le-trai-mo-vao', hasHandle: false },
      { huongMo: 'le-phai-mo-vao', hasHandle: true, handleSide: 'trai' },
    ],
  },
  'cua-di-4-canh-mo-ra': {
    id: 'cua-di-4-canh-mo-ra',
    family: 'cua-di',
    label: 'Cửa đi 4 cánh mở ra',
    layouter: 'h-equal-door',
    sashes: [
      { huongMo: 'le-trai-mo-ra', hasHandle: false },
      { huongMo: 'le-trai-mo-ra', hasHandle: true, handleSide: 'phai' },
      { huongMo: 'le-phai-mo-ra', hasHandle: false },
      { huongMo: 'le-phai-mo-ra', hasHandle: false },
    ],
  },
  'cua-di-4-canh-mo-vao': {
    id: 'cua-di-4-canh-mo-vao',
    family: 'cua-di',
    label: 'Cửa đi 4 cánh mở vào',
    layouter: 'h-equal-door',
    sashes: [
      { huongMo: 'le-trai-mo-vao', hasHandle: false },
      { huongMo: 'le-trai-mo-vao', hasHandle: true, handleSide: 'phai' },
      { huongMo: 'le-phai-mo-vao', hasHandle: false },
      { huongMo: 'le-phai-mo-vao', hasHandle: false },
    ],
  },

  // ==========================================
  // 3. CỬA SỔ LÙA (cua-so-lua)
  // ==========================================
  'so-lua-2-canh': {
    id: 'so-lua-2-canh',
    family: 'cua-so-lua',
    label: 'Cửa sổ lùa 2 cánh',
    layouter: 'sliding',
    sashes: [
      {
        huongMo: 'lua-phai',
        hasHandle: true,
        handleType: 'khoa-sap',
        handleSide: 'trai',
        arrowType: 'lua-trai',
        zIndex: 0,
      },
      {
        huongMo: 'lua-trai',
        hasHandle: true,
        handleType: 'khoa-sap',
        handleSide: 'phai',
        arrowType: 'lua-phai',
        zIndex: 1,
      },
    ],
  },
  'so-lua-3-canh': {
    id: 'so-lua-3-canh',
    family: 'cua-so-lua',
    label: 'Cửa sổ lùa 3 cánh',
    layouter: 'sliding',
    sashes: [
      {
        huongMo: 'lua-phai',
        hasHandle: true,
        handleType: 'khoa-sap',
        handleSide: 'trai',
        arrowType: 'lua-trai',
        zIndex: 0,
      },
      { huongMo: '2-chieu', hasHandle: false, zIndex: 1 },
      {
        huongMo: 'lua-phai',
        hasHandle: true,
        handleType: 'khoa-sap',
        handleSide: 'phai',
        arrowType: 'lua-phai',
        zIndex: 2,
      },
    ],
  },
  'so-lua-4-canh-chia-doi': {
    id: 'so-lua-4-canh-chia-doi',
    family: 'cua-so-lua',
    label: 'Cửa sổ lùa 4 cánh - 2 ray',
    layouter: 'sliding',
    sashes: [
      {
        huongMo: 'lua-phai',
        hasHandle: true,
        handleType: 'khoa-sap',
        handleSide: 'trai',
        arrowType: 'lua-trai',
        zIndex: 0,
      },
      {
        huongMo: 'lua-phai',
        hasHandle: false,
        handleType: 'khoa-sap',
        handleSide: 'phai',
        arrowType: 'lua-phai',
        zIndex: 1,
        joiner: true,
      },
      {
        huongMo: 'lua-trai',
        hasHandle: true,
        handleType: 'khoa-sap',
        handleSide: 'trai',
        arrowType: 'lua-trai',
        zIndex: 1,
        joinerPair: true,
      },
      {
        huongMo: 'lua-trai',
        hasHandle: true,
        handleType: 'khoa-sap',
        handleSide: 'phai',
        arrowType: 'lua-phai',
        zIndex: 0,
      },
    ],
  },
  'so-lua-4-canh': {
    id: 'so-lua-4-canh',
    family: 'cua-so-lua',
    label: 'Cửa sổ lùa 4 cánh - 4 ray',
    layouter: 'sliding',
    sashes: [
      {
        huongMo: 'lua-phai',
        hasHandle: true,
        handleType: 'khoa-sap',
        handleSide: 'trai',
        arrowType: 'lua-trai',
        zIndex: 0,
      },
      { huongMo: '2-chieu', hasHandle: false, zIndex: 1 },
      { huongMo: '2-chieu', hasHandle: false, zIndex: 2 },
      {
        huongMo: 'lua-trai',
        hasHandle: true,
        handleType: 'khoa-sap',
        handleSide: 'phai',
        arrowType: 'lua-phai',
        zIndex: 3,
      },
    ],
  },
  'so-lua-5-canh': {
    id: 'so-lua-5-canh',
    family: 'cua-so-lua',
    label: 'Cửa sổ lùa 5 cánh',
    layouter: 'sliding-door',
    sashes: [
      {
        huongMo: 'lua-phai',
        hasHandle: true,
        handleType: 'khoa-sap',
        handleSide: 'trai',
        arrowType: 'lua-trai',
        zIndex: 0,
      },
      { huongMo: '2-chieu', hasHandle: false, zIndex: 1 },
      { huongMo: '2-chieu', hasHandle: false, zIndex: 2 },
      { huongMo: '2-chieu', hasHandle: false, zIndex: 3 },
      {
        huongMo: 'lua-trai',
        hasHandle: true,
        handleType: 'khoa-sap',
        handleSide: 'phai',
        arrowType: 'lua-phai',
        zIndex: 4,
      },
    ],
  },
  'so-lua-6-canh-chia-doi': {
    id: 'so-lua-6-canh-chia-doi',
    family: 'cua-so-lua',
    label: 'Cửa sổ lùa 6 cánh - 3 ray',
    layouter: 'sliding',
    sashes: [
      {
        huongMo: 'lua-phai',
        hasHandle: true,
        handleType: 'khoa-sap',
        handleSide: 'trai',
        arrowType: 'lua-trai',
        zIndex: 0,
      },
      { huongMo: '2-chieu', hasHandle: false, zIndex: 1 },
      {
        huongMo: 'lua-phai',
        hasHandle: true,
        handleType: 'khoa-sap',
        handleSide: 'phai',
        arrowType: 'lua-phai',
        zIndex: 2,
        joiner: true,
      },
      {
        huongMo: 'lua-trai',
        hasHandle: true,
        handleType: 'khoa-sap',
        handleSide: 'trai',
        arrowType: 'lua-trai',
        zIndex: 2,
        joinerPair: true,
      },
      { huongMo: '2-chieu', hasHandle: false, zIndex: 1 },
      {
        huongMo: 'lua-trai',
        hasHandle: true,
        handleType: 'khoa-sap',
        handleSide: 'phai',
        arrowType: 'lua-phai',
        zIndex: 0,
      },
    ],
  },
  'so-lua-2-canh-doc': {
    id: 'so-lua-2-canh-doc',
    family: 'cua-so-lua',
    label: 'Cửa sổ lùa 2 cánh trượt dọc',
    layouter: 'sliding-vertical',
    sashes: [
      { huongMo: 'lua-xuong', hasHandle: false, handleType: null, zIndex: 0 },
      {
        huongMo: 'lua-len',
        hasHandle: true,
        handleType: 'lua-doc',
        handleSide: 'center',
        arrowType: 'lua-len',
        zIndex: 1,
      },
    ],
  },

  // ==========================================
  // 4. CỬA ĐI LÙA (cua-di-lua)
  // ==========================================
  'di-lua-2-canh': {
    id: 'di-lua-2-canh',
    family: 'cua-di-lua',
    label: 'Cửa đi lùa 2 cánh',
    layouter: 'sliding-door',
    sashes: [
      {
        huongMo: 'lua-phai',
        hasHandle: true,
        handleType: 'khoa-sap',
        handleSide: 'trai',
        arrowType: 'lua-trai',
        zIndex: 0,
      },
      {
        huongMo: 'lua-trai',
        hasHandle: true,
        handleType: 'd-trai',
        handleSide: 'phai',
        arrowType: 'lua-phai',
        zIndex: 1,
      },
    ],
  },
  'di-lua-3-canh': {
    id: 'di-lua-3-canh',
    family: 'cua-di-lua',
    label: 'Cửa đi lùa 3 cánh',
    layouter: 'sliding-door',
    sashes: [
      {
        huongMo: 'lua-phai',
        hasHandle: true,
        handleType: 'khoa-sap',
        handleSide: 'trai',
        arrowType: 'lua-trai',
        zIndex: 0,
      },
      { huongMo: '2-chieu', hasHandle: false, zIndex: 1 },
      {
        huongMo: 'lua-phai',
        hasHandle: true,
        handleType: 'd-trai',
        handleSide: 'phai',
        arrowType: 'lua-phai',
        zIndex: 2,
      },
    ],
  },
  'di-lua-4-canh-chia-doi': {
    id: 'di-lua-4-canh-chia-doi',
    family: 'cua-di-lua',
    label: 'Cửa đi lùa 4 cánh - 2 ray',
    layouter: 'sliding-door',
    sashes: [
      {
        huongMo: 'lua-phai',
        hasHandle: true,
        handleType: 'khoa-sap',
        handleSide: 'trai',
        arrowType: 'lua-trai',
        zIndex: 0,
      },
      {
        huongMo: 'lua-phai',
        hasHandle: false,
        handleType: 'd-trai',
        handleSide: 'phai',
        arrowType: 'lua-phai',
        zIndex: 1,
        joiner: true,
      },
      {
        huongMo: 'lua-trai',
        hasHandle: true,
        handleType: 'd-phai',
        handleSide: 'trai',
        arrowType: 'lua-trai',
        zIndex: 1,
        joinerPair: true,
      },
      {
        huongMo: 'lua-trai',
        hasHandle: true,
        handleType: 'khoa-sap',
        handleSide: 'phai',
        arrowType: 'lua-phai',
        zIndex: 0,
      },
    ],
  },
  'di-lua-4-canh': {
    id: 'di-lua-4-canh',
    family: 'cua-di-lua',
    label: 'Cửa đi lùa 4 cánh - 4 ray',
    layouter: 'sliding-door',
    sashes: [
      {
        huongMo: 'lua-phai',
        hasHandle: true,
        handleType: 'khoa-sap',
        handleSide: 'trai',
        arrowType: 'lua-trai',
        zIndex: 0,
      },
      { huongMo: '2-chieu', hasHandle: false, zIndex: 1 },
      { huongMo: '2-chieu', hasHandle: false, zIndex: 2 },
      {
        huongMo: 'lua-trai',
        hasHandle: true,
        handleType: 'd-trai',
        handleSide: 'phai',
        arrowType: 'lua-phai',
        zIndex: 3,
      },
    ],
  },
  'di-lua-5-canh': {
    id: 'di-lua-5-canh',
    family: 'cua-di-lua',
    label: 'Cửa đi lùa 5 cánh',
    layouter: 'sliding-door',
    sashes: [
      {
        huongMo: 'lua-phai',
        hasHandle: true,
        handleType: 'khoa-sap',
        handleSide: 'trai',
        arrowType: 'lua-trai',
        zIndex: 0,
      },
      { huongMo: '2-chieu', hasHandle: false, zIndex: 1 },
      { huongMo: '2-chieu', hasHandle: false, zIndex: 2 },
      { huongMo: '2-chieu', hasHandle: false, zIndex: 3 },
      {
        huongMo: 'lua-trai',
        hasHandle: true,
        handleType: 'd-trai',
        handleSide: 'phai',
        arrowType: 'lua-phai',
        zIndex: 4,
      },
    ],
  },
  'di-lua-6-canh-chia-doi': {
    id: 'di-lua-6-canh-chia-doi',
    family: 'cua-di-lua',
    label: 'Cửa đi lùa 6 cánh - 3 ray',
    layouter: 'sliding-door',
    sashes: [
      {
        huongMo: 'lua-phai',
        hasHandle: true,
        handleType: 'khoa-sap',
        handleSide: 'trai',
        arrowType: 'lua-trai',
        zIndex: 0,
      },
      { huongMo: '2-chieu', hasHandle: false, zIndex: 1 },
      {
        huongMo: 'lua-phai',
        hasHandle: true,
        handleType: 'd-trai',
        handleSide: 'phai',
        arrowType: 'lua-phai',
        zIndex: 2,
        joiner: true,
      },
      {
        huongMo: 'lua-trai',
        hasHandle: true,
        handleType: 'd-phai',
        handleSide: 'trai',
        arrowType: 'lua-trai',
        zIndex: 2,
        joinerPair: true,
      },
      { huongMo: '2-chieu', hasHandle: false, zIndex: 1 },
      {
        huongMo: 'lua-trai',
        hasHandle: true,
        handleType: 'khoa-sap',
        handleSide: 'phai',
        arrowType: 'lua-phai',
        zIndex: 0,
      },
    ],
  },
  'di-lua-6-canh': {
    id: 'di-lua-6-canh',
    family: 'cua-di-lua',
    label: 'Cửa đi lùa 6 cánh - 6 ray',
    layouter: 'sliding-door',
    sashes: [
      { huongMo: 'lua-phai', hasHandle: true, handleType: 'khoa-sap', handleSide: 'trai', arrowType: 'lua-trai', zIndex: 0 },
      { huongMo: '2-chieu', hasHandle: false, zIndex: 1 },
      { huongMo: '2-chieu', hasHandle: false, zIndex: 2 },
      { huongMo: '2-chieu', hasHandle: false, zIndex: 3 },
      { huongMo: '2-chieu', hasHandle: false, zIndex: 4 },
      { huongMo: 'lua-trai', hasHandle: true, handleType: 'd-trai', handleSide: 'phai', arrowType: 'lua-phai', zIndex: 5 },
    ],
  },
  'di-lua-7-canh': {
    id: 'di-lua-7-canh',
    family: 'cua-di-lua',
    label: 'Cửa đi lùa 7 cánh',
    layouter: 'sliding-door',
    sashes: [
      { huongMo: 'lua-phai', hasHandle: true, handleType: 'khoa-sap', handleSide: 'trai', arrowType: 'lua-trai', zIndex: 0 },
      { huongMo: '2-chieu', hasHandle: false, zIndex: 1 },
      { huongMo: '2-chieu', hasHandle: false, zIndex: 2 },
      { huongMo: '2-chieu', hasHandle: false, zIndex: 3 },
      { huongMo: '2-chieu', hasHandle: false, zIndex: 4 },
      { huongMo: '2-chieu', hasHandle: false, zIndex: 5 },
      { huongMo: 'lua-trai', hasHandle: true, handleType: 'd-trai', handleSide: 'phai', arrowType: 'lua-phai', zIndex: 6 },
    ],
  },
  'di-lua-8-canh-chia-doi': {
    id: 'di-lua-8-canh-chia-doi',
    family: 'cua-di-lua',
    label: 'Cửa đi lùa 8 cánh - 4 ray',
    layouter: 'sliding-door',
    sashes: [
      { huongMo: 'lua-phai', hasHandle: true, handleType: 'khoa-sap', handleSide: 'trai', arrowType: 'lua-trai', zIndex: 0 },
      { huongMo: '2-chieu', hasHandle: false, zIndex: 1 },
      { huongMo: '2-chieu', hasHandle: false, zIndex: 2 },
      { huongMo: 'lua-phai', hasHandle: true, handleType: 'd-trai', handleSide: 'phai', arrowType: 'lua-phai', zIndex: 3, joiner: true },
      { huongMo: 'lua-trai', hasHandle: true, handleType: 'd-phai', handleSide: 'trai', arrowType: 'lua-trai', zIndex: 3, joinerPair: true },
      { huongMo: '2-chieu', hasHandle: false, zIndex: 2 },
      { huongMo: '2-chieu', hasHandle: false, zIndex: 1 },
      { huongMo: 'lua-trai', hasHandle: true, handleType: 'khoa-sap', handleSide: 'phai', arrowType: 'lua-phai', zIndex: 0 },
    ],
  },
  'di-lua-ep-phai': {
    id: 'di-lua-ep-phai',
    family: 'cua-di-lua',
    label: 'Lùa ép phải',
    layouter: 'sliding-door',
    sashes: [{ huongMo: 'lua-ep-phai', hasHandle: true, handleType: 'lua-ep-phai', handleSide: 'trai', arrowType: 'lua-ep-phai', zIndex: 0 }],
  },
  'di-lua-ep-trai': {
    id: 'di-lua-ep-trai',
    family: 'cua-di-lua',
    label: 'Lùa ép trái',
    layouter: 'sliding-door',
    sashes: [{ huongMo: 'lua-ep-trai', hasHandle: true, handleType: 'lua-ep-trai', handleSide: 'phai', arrowType: 'lua-ep-trai', zIndex: 0 }],
  },

  // ==========================================
  // 5. CỬA GẤP XẾP (gap-xep)
  // ==========================================
  'cua-gap-xep-2-canh-2-0': createFoldingLayout('Cửa gấp xếp 2 cánh (2-0)', '2-0'),
  'cua-gap-xep-2-canh-0-2': createFoldingLayout('Cửa gấp xếp 2 cánh (0-2)', '0-2'),
  'cua-gap-xep-3-canh-3-0': createFoldingLayout('Cửa gấp xếp 3 cánh (3-0)', '3-0'),
  'cua-gap-xep-3-canh-0-3': createFoldingLayout('Cửa gấp xếp 3 cánh (0-3)', '0-3'),
  'cua-gap-xep-4-canh-3-1': createFoldingLayout('Cửa gấp xếp 4 cánh (3-1)', '3-1'),
  'cua-gap-xep-4-canh-1-3': createFoldingLayout('Cửa gấp xếp 4 cánh (1-3)', '1-3'),
  'cua-gap-xep-4-canh-4-0': createFoldingLayout('Cửa gấp xếp 4 cánh (4-0)', '4-0'),
  'cua-gap-xep-4-canh-0-4': createFoldingLayout('Cửa gấp xếp 4 cánh (0-4)', '0-4'),
  'cua-gap-xep-4-canh-2-2': createFoldingLayout('Cửa gấp xếp 4 cánh (2-2)', '2-2'),
  'cua-gap-xep-5-canh-4-1': createFoldingLayout('Cửa gấp xếp 5 cánh (4-1)', '4-1'),
  'cua-gap-xep-5-canh-1-4': createFoldingLayout('Cửa gấp xếp 5 cánh (1-4)', '1-4'),
  'cua-gap-xep-5-canh-5-0': createFoldingLayout('Cửa gấp xếp 5 cánh (5-0)', '5-0'),
  'cua-gap-xep-5-canh-0-5': createFoldingLayout('Cửa gấp xếp 5 cánh (0-5)', '0-5'),
  'cua-gap-xep-6-canh-5-1': createFoldingLayout('Cửa gấp xếp 6 cánh (5-1)', '5-1'),
  'cua-gap-xep-6-canh-1-5': createFoldingLayout('Cửa gấp xếp 6 cánh (1-5)', '1-5'),
  'cua-gap-xep-6-canh-3-3': createFoldingLayout('Cửa gấp xếp 6 cánh (3-3)', '3-3'),
  'cua-gap-xep-6-canh-2-4': createFoldingLayout('Cửa gấp xếp 6 cánh (2-4)', '2-4'),
  'cua-gap-xep-6-canh-4-2': createFoldingLayout('Cửa gấp xếp 6 cánh (4-2)', '4-2'),
  'cua-gap-xep-7-canh-7-0': createFoldingLayout('Cửa gấp xếp 7 cánh (7-0)', '7-0'),
  'cua-gap-xep-7-canh-0-7': createFoldingLayout('Cửa gấp xếp 7 cánh (0-7)', '0-7'),
  'cua-gap-xep-7-canh-1-6': createFoldingLayout('Cửa gấp xếp 7 cánh (1-6)', '1-6'),
  'cua-gap-xep-7-canh-6-1': createFoldingLayout('Cửa gấp xếp 7 cánh (6-1)', '6-1'),
  'cua-gap-xep-7-canh-3-4': createFoldingLayout('Cửa gấp xếp 7 cánh (3-4)', '3-4'),
  'cua-gap-xep-7-canh-4-3': createFoldingLayout('Cửa gấp xếp 7 cánh (4-3)', '4-3'),
  'cua-gap-xep-8-canh-1-7': createFoldingLayout('Cửa gấp xếp 8 cánh (1-7)', '1-7'),
  'cua-gap-xep-8-canh-7-1': createFoldingLayout('Cửa gấp xếp 8 cánh (7-1)', '7-1'),
  'cua-gap-xep-8-canh-4-4': createFoldingLayout('Cửa gấp xếp 8 cánh (4-4)', '4-4'),
  'cua-gap-xep-2-canh-doc': {
    id: 'cua-gap-xep-2-canh-doc',
    family: 'gap-xep',
    label: 'Cửa gấp xếp 2 cánh dọc',
    layouter: 'v-equal',
    sashes: [
      { huongMo: 'mo-hat', hasHandle: false },
      { huongMo: 'mo-hat', hasHandle: true, handleType: 'gap-xep-doc', handleSide: 'center' },
    ],
  },

  // ==========================================
  // 6. CỬA TRƯỢT QUAY (truot-quay)
  // ==========================================
  'truot-quay-2-le-trai': {
    id: 'truot-quay-2-le-trai',
    family: 'truot-quay',
    label: 'Trượt quay 2 cánh lề trái',
    layouter: 'sliding',
    extras: { baseLike: 'so-lua-2-canh' },
    sashes: [
      { huongMo: 'le-trai-mo-ra', hingeSymbol: 'le-trai-mo-ra', hasHandle: false, zIndex: 0 },
      { huongMo: 'lua-trai', hasHandle: true, handleType: 'truot-quay-le-trai', handleSide: 'phai', arrowType: 'lua-phai', zIndex: 1 },
    ],
  },
  'truot-quay-2-le-phai': {
    id: 'truot-quay-2-le-phai',
    family: 'truot-quay',
    label: 'Trượt quay 2 cánh lề phải',
    layouter: 'sliding',
    extras: { baseLike: 'so-lua-2-canh' },
    sashes: [
      { huongMo: 'lua-phai', hasHandle: true, handleType: 'truot-quay-le-phai', handleSide: 'trai', arrowType: 'lua-trai', zIndex: 0 },
      { huongMo: 'le-phai-mo-ra', hingeSymbol: 'le-phai-mo-ra', hasHandle: false, zIndex: 1 },
    ],
  },
  'truot-quay-3-le-trai': {
    id: 'truot-quay-3-le-trai',
    family: 'truot-quay',
    label: 'Trượt quay 3 cánh lề trái',
    layouter: 'sliding',
    extras: { baseLike: 'so-lua-3-canh' },
    sashes: [
      { huongMo: 'le-trai-mo-ra', hingeSymbol: 'le-trai-mo-ra', hasHandle: false, zIndex: 0 },
      { huongMo: '2-chieu', hasHandle: false, zIndex: 1 },
      { huongMo: 'lua-phai', hasHandle: true, handleType: 'truot-quay-le-trai', handleSide: 'phai', arrowType: 'lua-phai', zIndex: 2 },
    ],
  },
  'truot-quay-3-le-phai': {
    id: 'truot-quay-3-le-phai',
    family: 'truot-quay',
    label: 'Trượt quay 3 cánh lề phải',
    layouter: 'sliding',
    extras: { baseLike: 'so-lua-3-canh' },
    sashes: [
      { huongMo: 'lua-phai', hasHandle: true, handleType: 'truot-quay-le-phai', handleSide: 'trai', arrowType: 'lua-trai', zIndex: 0 },
      { huongMo: '2-chieu', hasHandle: false, zIndex: 1 },
      { huongMo: 'le-phai-mo-ra', hingeSymbol: 'le-phai-mo-ra', hasHandle: false, zIndex: 2 },
    ],
  },
  'truot-quay-4-canh': {
    id: 'truot-quay-4-canh',
    family: 'truot-quay',
    label: 'Trượt quay 4 cánh (chia đôi)',
    layouter: 'sliding',
    extras: {
      baseLike: 'so-lua-4-canh-chia-doi',
      splitSym: true,
      calcLike: 'so-lua-4-canh-chia-doi',
      renderLike: 'so-lua-4-canh-chia-doi',
    },
    sashes: [
      {
        huongMo: 'lua-phai',
        hingeSymbol: 'le-trai-mo-ra',
        hasHandle: false,
        handleType: 'khoa-sap',
        handleSide: 'trai',
        arrowType: 'lua-trai',
        zIndex: 0,
      },
      {
        huongMo: 'lua-phai',
        hasHandle: true,
        handleType: 'truot-quay-le-trai',
        handleSide: 'phai',
        arrowType: 'lua-phai',
        zIndex: 1,
        joiner: true,
      },
      {
        huongMo: 'lua-trai',
        hasHandle: true,
        handleType: 'truot-quay-le-phai',
        handleSide: 'trai',
        arrowType: 'lua-trai',
        zIndex: 1,
        joinerPair: true,
      },
      {
        huongMo: 'lua-trai',
        hingeSymbol: 'le-phai-mo-ra',
        hasHandle: false,
        handleType: 'khoa-sap',
        handleSide: 'phai',
        arrowType: 'lua-phai',
        zIndex: 0,
      },
    ],
  },
  'truot-quay-6-canh': {
    id: 'truot-quay-6-canh',
    family: 'truot-quay',
    label: 'Trượt quay 6 cánh',
    layouter: 'sliding-door',
    extras: { splitSym: true },
    sashes: [
      { huongMo: 'le-trai-mo-ra', hingeSymbol: 'le-trai-mo-ra', hasHandle: false, zIndex: 0 },
      { huongMo: '2-chieu', hasHandle: false, zIndex: 1 },
      {
        huongMo: 'lua-phai',
        hasHandle: true,
        handleType: 'truot-quay-le-trai',
        handleSide: 'phai',
        arrowType: 'lua-phai',
        zIndex: 2,
        joiner: true,
      },
      {
        huongMo: 'lua-trai',
        hasHandle: true,
        handleType: 'truot-quay-le-phai',
        handleSide: 'trai',
        arrowType: 'lua-trai',
        zIndex: 2,
        joinerPair: true,
      },
      { huongMo: '2-chieu', hasHandle: false, zIndex: 1 },
      { huongMo: 'le-phai-mo-ra', hingeSymbol: 'le-phai-mo-ra', hasHandle: false, zIndex: 0 },
    ],
  },
};

/**
 * Danh mục Nhãn Tiếng Việt của các Họ Cửa
 */
export const SASH_FAMILY_LABELS: Record<SashFamily, string> = {
  'cua-di': 'Cửa đi mở quay',
  'cua-so': 'Cửa sổ mở quay/hất',
  'cua-di-lua': 'Cửa đi lùa',
  'cua-so-lua': 'Cửa sổ lùa',
  'gap-xep': 'Cửa gấp xếp',
  'truot-quay': 'Cửa trượt quay',
};

/**
 * Helper: Lấy cấu hình layout từ Catalog hoặc tạo fallback
 */
export function getSashLayout(id: string | null | undefined): SashLayoutConfig | null {
  if (!id) return null;
  return SASH_LAYOUT_CATALOG[id] || null;
}

/**
 * Helper: Lọc danh sách kiểu cánh theo Họ cửa (Family)
 */
export function getSashLayoutsByFamily(family?: SashFamily | 'all'): SashLayoutConfig[] {
  const all = Object.values(SASH_LAYOUT_CATALOG);
  if (!family || family === 'all') return all;
  return all.filter((l) => l.family === family);
}

/**
 * Helper: Lọc theo số cánh
 */
export function getSashLayoutsByLeafCount(count: number, list?: SashLayoutConfig[]): SashLayoutConfig[] {
  const base = list || Object.values(SASH_LAYOUT_CATALOG);
  if (count >= 5) {
    return base.filter((l) => l.sashes.length >= 5);
  }
  return base.filter((l) => l.sashes.length === count);
}

/**
 * Helper: Tìm kiếm theo từ khóa
 */
export function searchSashLayouts(query: string, list?: SashLayoutConfig[]): SashLayoutConfig[] {
  const base = list || Object.values(SASH_LAYOUT_CATALOG);
  const q = query.toLowerCase().trim();
  if (!q) return base;
  return base.filter(
    (l) =>
      l.id.toLowerCase().includes(q) ||
      l.label.toLowerCase().includes(q) ||
      l.family.toLowerCase().includes(q) ||
      (l.extras?.pattern && String(l.extras.pattern).toLowerCase().includes(q))
  );
}

/**
 * Chuyển đổi ngược chiều mở (Mở ra <-> Mở vào)
 */
export function invertOpeningDirection(layoutId: string): string | null {
  const map: Record<string, string> = {
    'so-le-trai': 'so-le-trai-mo-vao',
    'so-le-trai-mo-vao': 'so-le-trai',
    'so-le-phai': 'so-le-phai-mo-vao',
    'so-le-phai-mo-vao': 'so-le-phai',
    'so-2-canh': 'so-2-canh-mo-vao',
    'so-2-canh-mo-vao': 'so-2-canh',
    'cua-di-le-trai-mo-ra': 'cua-di-le-trai-mo-vao',
    'cua-di-le-trai-mo-vao': 'cua-di-le-trai-mo-ra',
    'cua-di-le-phai-mo-ra': 'cua-di-le-phai-mo-vao',
    'cua-di-le-phai-mo-vao': 'cua-di-le-phai-mo-ra',
    'cua-di-2-canh-mo-ra': 'cua-di-2-canh-mo-vao',
    'cua-di-2-canh-mo-vao': 'cua-di-2-canh-mo-ra',
    'cua-di-3-canh-mo-ra-1-2': 'cua-di-3-canh-mo-vao-1-2',
    'cua-di-3-canh-mo-vao-1-2': 'cua-di-3-canh-mo-ra-1-2',
    'cua-di-3-canh-mo-ra-2-1': 'cua-di-3-canh-mo-vao-2-1',
    'cua-di-3-canh-mo-vao-2-1': 'cua-di-3-canh-mo-ra-2-1',
    'cua-di-4-canh-mo-ra': 'cua-di-4-canh-mo-vao',
    'cua-di-4-canh-mo-vao': 'cua-di-4-canh-mo-ra',
  };
  return map[layoutId] || null;
}
