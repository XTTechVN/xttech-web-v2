import { FrameShape } from '../studio-types';
import { CurvedFramePaths } from './cad-types';

/**
 * Tính toán đường dẫn SVG path cho các loại khung uốn cong/vòm tại khoảng cách lùi vào trong d (px).
 * d = 0: Viền ngoài cùng của khung bao
 * d = frameD: Viền trong lòng khung bao
 * d = frameD + sashD: Viền trong lòng cánh
 * d = frameD + sashD + beadW: Viền lòng kính
 */
export const getCurvedContourPath = (
  shape: FrameShape,
  x: number,
  y: number,
  w: number,
  h: number,
  d: number,
  isOpenBottom: boolean
): string | null => {
  if (shape === 'rect' || !shape) return null;

  const yBot = y + h;
  const yInBot = isOpenBottom ? yBot : yBot - d;

  switch (shape) {
    case 'arch_semicircle':
    case 'arch_semicircle_open': {
      // Vòm bán nguyệt: thân chữ nhật bên dưới, nóc bán nguyệt bên trên
      const r = Math.min(w / 2, h);
      const ySpring = y + r;
      if (d === 0) {
        return `M ${x} ${yBot} L ${x} ${ySpring} A ${r} ${r} 0 0 1 ${x + w} ${ySpring} L ${x + w} ${yBot} ${isOpenBottom ? '' : `L ${x} ${yBot}`} Z`;
      }
      const rIn = Math.max(2, r - d);
      const xInLeft = x + d;
      const xInRight = x + w - d;
      return `M ${xInLeft} ${yInBot} L ${xInLeft} ${ySpring} A ${rIn} ${rIn} 0 0 1 ${xInRight} ${ySpring} L ${xInRight} ${yInBot} ${isOpenBottom ? '' : `L ${xInLeft} ${yInBot}`} Z`;
    }

    case 'arch_half': {
      // Vòm nửa tròn: đỉnh tại y, đáy tại y + h
      const rx = w / 2;
      const ry = h;
      if (d === 0) {
        return `M ${x} ${yBot} A ${rx} ${ry} 0 0 1 ${x + w} ${yBot} ${isOpenBottom ? '' : `L ${x} ${yBot}`} Z`;
      }
      const rxIn = Math.max(2, rx - d);
      const ryIn = Math.max(2, ry - d);
      return `M ${x + d} ${yInBot} A ${rxIn} ${ryIn} 0 0 1 ${x + w - d} ${yInBot} ${isOpenBottom ? '' : `L ${x + d} ${yInBot}`} Z`;
    }

    case 'arch_segment': {
      // Cung tròn nông (segmental arch): vai vòm ở khoảng 1/3 chiều cao từ trên xuống
      const hArc = Math.min(h * 0.35, w * 0.25);
      const ySpring = y + hArc;
      if (d === 0) {
        return `M ${x} ${yBot} L ${x} ${ySpring} Q ${x + w / 2} ${y} ${x + w} ${ySpring} L ${x + w} ${yBot} ${isOpenBottom ? '' : `L ${x} ${yBot}`} Z`;
      }
      const xInLeft = x + d;
      const xInRight = x + w - d;
      return `M ${xInLeft} ${yInBot} L ${xInLeft} ${ySpring} Q ${x + w / 2} ${y + d} ${xInRight} ${ySpring} L ${xInRight} ${yInBot} ${isOpenBottom ? '' : `L ${xInLeft} ${yInBot}`} Z`;
    }

    case 'arch_pointed': {
      // Vòm nhọn Gothic: 2 cung nhọn giao nhau ở đỉnh giữa (x + w/2, y)
      const ySpring = y + h * 0.45;
      if (d === 0) {
        return `M ${x} ${yBot} L ${x} ${ySpring} Q ${x + w * 0.15} ${y + h * 0.1} ${x + w / 2} ${y} Q ${x + w * 0.85} ${y + h * 0.1} ${x + w} ${ySpring} L ${x + w} ${yBot} ${isOpenBottom ? '' : `L ${x} ${yBot}`} Z`;
      }
      const xInLeft = x + d;
      const xInRight = x + w - d;
      return `M ${xInLeft} ${yInBot} L ${xInLeft} ${ySpring} Q ${x + w * 0.15 + d} ${y + h * 0.1 + d} ${x + w / 2} ${y + d} Q ${x + w * 0.85 - d} ${y + h * 0.1 + d} ${xInRight} ${ySpring} L ${xInRight} ${yInBot} ${isOpenBottom ? '' : `L ${xInLeft} ${yInBot}`} Z`;
    }

    case 'round_top_2':
    case 'round_top_2_open': {
      // Bo 2 góc trên
      const r = Math.min(Math.round(w * 0.25), Math.round(h * 0.25), 45);
      if (d === 0) {
        return `M ${x} ${yBot} L ${x} ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y} L ${x + w - r} ${y} A ${r} ${r} 0 0 1 ${x + w} ${y + r} L ${x + w} ${yBot} ${isOpenBottom ? '' : `L ${x} ${yBot}`} Z`;
      }
      const rIn = Math.max(2, r - d);
      return `M ${x + d} ${yInBot} L ${x + d} ${y + r} A ${rIn} ${rIn} 0 0 1 ${x + d + rIn} ${y + d} L ${x + w - d - rIn} ${y + d} A ${rIn} ${rIn} 0 0 1 ${x + w - d} ${y + r} L ${x + w - d} ${yInBot} L ${x + d} ${yInBot} Z`;
    }

    case 'round_top_right': {
      // Bo góc trên bên phải
      const r = Math.min(Math.round(w * 0.4), Math.round(h * 0.4), 50);
      if (d === 0) {
        return `M ${x} ${yBot} L ${x} ${y} L ${x + w - r} ${y} A ${r} ${r} 0 0 1 ${x + w} ${y + r} L ${x + w} ${yBot} ${isOpenBottom ? '' : `L ${x} ${yBot}`} Z`;
      }
      const rIn = Math.max(2, r - d);
      return `M ${x + d} ${yInBot} L ${x + d} ${y + d} L ${x + w - d - rIn} ${y + d} A ${rIn} ${rIn} 0 0 1 ${x + w - d} ${y + r} L ${x + w - d} ${yInBot} L ${x + d} ${yInBot} Z`;
    }

    case 'round_4_corner': {
      // Bo tròn 4 góc
      const r = Math.min(Math.round(w * 0.15), Math.round(h * 0.15), 30);
      if (d === 0) {
        return `M ${x + r} ${y} L ${x + w - r} ${y} A ${r} ${r} 0 0 1 ${x + w} ${y + r} L ${x + w} ${yBot - r} A ${r} ${r} 0 0 1 ${x + w - r} ${yBot} L ${x + r} ${yBot} A ${r} ${r} 0 0 1 ${x} ${yBot - r} L ${x} ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y} Z`;
      }
      const rIn = Math.max(2, r - d);
      return `M ${x + d + rIn} ${y + d} L ${x + w - d - rIn} ${y + d} A ${rIn} ${rIn} 0 0 1 ${x + w - d} ${y + d + rIn} L ${x + w - d} ${y + h - d - rIn} A ${rIn} ${rIn} 0 0 1 ${x + w - d - rIn} ${y + h - d} L ${x + d + rIn} ${y + h - d} A ${rIn} ${rIn} 0 0 1 ${x + d} ${y + h - d - rIn} L ${x + d} ${y + d + rIn} A ${rIn} ${rIn} 0 0 1 ${x + d + rIn} ${y + d} Z`;
    }

    case 'quad_circle': {
      // 1/4 hình tròn
      if (d === 0) {
        return `M ${x} ${yBot} L ${x} ${y} A ${w} ${h} 0 0 1 ${x + w} ${yBot} Z`;
      }
      return `M ${x + d} ${yInBot} L ${x + d} ${y + d} A ${Math.max(2, w - d)} ${Math.max(2, h - d)} 0 0 1 ${x + w - d} ${yInBot} Z`;
    }

    case 'circle': {
      // Tròn
      const r = Math.min(w, h) / 2;
      const cx = x + w / 2;
      const cy = y + h / 2;
      const curR = Math.max(2, r - d);
      return `M ${cx - curR} ${cy} A ${curR} ${curR} 0 1 1 ${cx + curR} ${cy} A ${curR} ${curR} 0 1 1 ${cx - curR} ${cy} Z`;
    }

    case 'ellipse': {
      // Elip
      const rx = w / 2;
      const ry = h / 2;
      const cx = x + rx;
      const cy = y + ry;
      const curRx = Math.max(2, rx - d);
      const curRy = Math.max(2, ry - d);
      return `M ${cx - curRx} ${cy} A ${curRx} ${curRy} 0 1 1 ${cx + curRx} ${cy} A ${curRx} ${curRy} 0 1 1 ${cx - curRx} ${cy} Z`;
    }

    default:
      return null;
  }
};

/**
 * Trả về cặp outerPath & innerPath cho khung bao dạng cong/vòm
 */
export const getCurvedFramePaths = (
  shape: FrameShape,
  x: number,
  y: number,
  w: number,
  h: number,
  frameD: number,
  isOpenBottom: boolean
): CurvedFramePaths | null => {
  const outerPath = getCurvedContourPath(shape, x, y, w, h, 0, isOpenBottom);
  const innerPath = getCurvedContourPath(shape, x, y, w, h, frameD, isOpenBottom);
  if (!outerPath || !innerPath) return null;
  return { outerPath, innerPath };
};


export interface SlidingSashLayout {
  x: number;
  w: number;
  trackIndex: number;
  zIndex: number;
}

/**
 * Tính toán hình học cánh cửa lùa (Sliding Sashes) chồng đè thực tế (Overlap/Đè gối):
 * - 2 cánh (2 ray): Cánh 0 ray trong, Cánh 1 ray ngoài đè lên Cánh 0 một khoảng overlap
 * - 3 cánh (3 ray): 3 cánh bậc thang gối đầu nối tiếp (Ảnh 1)
 * - 4 cánh (2 ray khép giữa): 2 cánh ngoài cùng ray trong, 2 cánh giữa ray ngoài khép mí tại tâm (Ảnh 2)
 * - 6 cánh (3 ray khép giữa): 3 cánh trái và 3 cánh phải đối xứng trượt khép mí tại tâm
 */
export const computeSlidingSashes = (
  innerX: number,
  innerWidth: number,
  count: number,
  overlap: number,
  layoutId?: string
): SlidingSashLayout[] => {
  if (count <= 1) {
    return [{ x: innerX, w: innerWidth, trackIndex: 0, zIndex: 0 }];
  }

  // Khống chế overlap không vượt quá 45% chiều rộng cánh
  const maxSafeOverlap = Math.max(10, Math.floor(innerWidth / (count * 2)));
  const safeOverlap = Math.min(overlap, maxSafeOverlap);

  // 1. Cửa lùa 2 cánh (2 ray)
  if (count === 2) {
    const wSash = Math.round((innerWidth + safeOverlap) / 2);
    return [
      { x: innerX, w: wSash, trackIndex: 0, zIndex: 0 },
      { x: innerX + innerWidth - wSash, w: wSash, trackIndex: 1, zIndex: 1 },
    ];
  }

  // 2. Cửa lùa 3 cánh (3 ray trượt nối tiếp - Ảnh 1)
  if (count === 3) {
    const wSash = Math.round((innerWidth + 2 * safeOverlap) / 3);
    const step = wSash - safeOverlap;
    return [
      { x: innerX, w: wSash, trackIndex: 0, zIndex: 0 },
      { x: innerX + step, w: wSash, trackIndex: 1, zIndex: 1 },
      { x: innerX + innerWidth - wSash, w: wSash, trackIndex: 2, zIndex: 2 },
    ];
  }

  // 3. Cửa lùa 4 cánh
  if (count === 4) {
    // 4 cánh 4 ray trượt nối tiếp một phía
    if (layoutId === 'so-lua-4-canh') {
      const wSash = Math.round((innerWidth + 3 * safeOverlap) / 4);
      const step = wSash - safeOverlap;
      return [
        { x: innerX, w: wSash, trackIndex: 0, zIndex: 0 },
        { x: innerX + step, w: wSash, trackIndex: 1, zIndex: 1 },
        { x: innerX + 2 * step, w: wSash, trackIndex: 2, zIndex: 2 },
        { x: innerX + innerWidth - wSash, w: wSash, trackIndex: 3, zIndex: 3 },
      ];
    }

    // Mặc định: 4 cánh 2 ray khép giữa (Ảnh 2)
    // 2 cánh ngoài cùng (0, 3) ở ray trong (track 0, zIndex 0)
    // 2 cánh giữa (1, 2) ở ray ngoài (track 1, zIndex 1) khép mí tại midX
    const wSash = Math.round((innerWidth + 2 * safeOverlap) / 4);
    const midX = innerX + Math.round(innerWidth / 2);
    return [
      { x: innerX, w: wSash, trackIndex: 0, zIndex: 0 },
      { x: midX - wSash, w: wSash, trackIndex: 1, zIndex: 1 },
      { x: midX, w: wSash, trackIndex: 1, zIndex: 1 },
      { x: innerX + innerWidth - wSash, w: wSash, trackIndex: 0, zIndex: 0 },
    ];
  }

  // 4. Cửa lùa 6 cánh (3 ray khép giữa)
  if (count === 6 && (!layoutId || layoutId.includes('chia-doi'))) {
    const wSash = Math.round((innerWidth + 4 * safeOverlap) / 6);
    const midX = innerX + Math.round(innerWidth / 2);
    return [
      // Nửa trái
      { x: innerX, w: wSash, trackIndex: 0, zIndex: 0 },
      { x: innerX + (wSash - safeOverlap), w: wSash, trackIndex: 1, zIndex: 1 },
      { x: midX - wSash, w: wSash, trackIndex: 2, zIndex: 2 },
      // Nửa phải
      { x: midX, w: wSash, trackIndex: 2, zIndex: 2 },
      { x: midX + (wSash - safeOverlap), w: wSash, trackIndex: 1, zIndex: 1 },
      { x: innerX + innerWidth - wSash, w: wSash, trackIndex: 0, zIndex: 0 },
    ];
  }

  // 5. Cấu hình lùa đa cánh tổng quát (Cascade Sliding)
  const totalOverlaps = count - 1;
  const wSash = Math.round((innerWidth + totalOverlaps * safeOverlap) / count);
  const step = wSash - safeOverlap;

  return Array.from({ length: count }, (_, i) => ({
    x: i === count - 1 ? innerX + innerWidth - wSash : innerX + i * step,
    w: wSash,
    trackIndex: i,
    zIndex: i,
  }));
};
