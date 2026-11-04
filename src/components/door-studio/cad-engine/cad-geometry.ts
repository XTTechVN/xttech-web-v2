import { ArchConfig, FrameShape } from '../studio-types';
import { CurvedFramePaths } from './cad-types';

export interface ArchMetrics {
  rOuter: number;
  rIn: number;
  archH: number;
  legH: number;
  ySpring: number; // Tương đối so với đỉnh y
  isPointed: boolean;
  isOpenBottom: boolean;
  autoRadiusMm: number;
}

export const OPEN_BOTTOM_ARCH_SHAPES = new Set<FrameShape>([
  'arch_semicircle_open',
  'arch_segment_leg_open',
  'round_top_2_open',
  'round_top_open',
]);

export const isArchOpenBottomShape = (shape: FrameShape, configOpenBottom?: boolean): boolean => {
  return Boolean(configOpenBottom || OPEN_BOTTOM_ARCH_SHAPES.has(shape));
};

/**
 * Tính toán thông số giải tích hình học vòm O(1) thuần toán học.
 * Dùng chung cho cả hệ tọa độ thực (mm) và hệ tọa độ khung vẽ SVG (px).
 */
export const computeArchMetrics = (
  shape: FrameShape,
  w: number,
  h: number,
  d: number = 0,
  archConfig?: ArchConfig
): ArchMetrics => {
  const safeW = Math.max(10, w);
  const safeH = Math.max(10, h);
  const halfW = safeW / 2;
  const isOpen = OPEN_BOTTOM_ARCH_SHAPES.has(shape);

  switch (shape) {
    case 'arch_half': {
      const autoR = Math.round(halfW);
      const rOuter = halfW;
      const rIn = Math.max(2, rOuter - d);
      return {
        rOuter,
        rIn,
        archH: safeH,
        legH: 0,
        ySpring: safeH,
        isPointed: false,
        isOpenBottom: false,
        autoRadiusMm: autoR,
      };
    }

    case 'arch_segment': {
      const autoR = Math.round(safeH / 2 + (safeW * safeW) / (8 * safeH));
      const rOuter = Math.max(halfW + 1, archConfig?.radiusMm || autoR);
      const rIn = Math.max(Math.max(2, halfW - d + 1), rOuter - d);
      return {
        rOuter,
        rIn,
        archH: safeH,
        legH: 0,
        ySpring: safeH,
        isPointed: false,
        isOpenBottom: false,
        autoRadiusMm: autoR,
      };
    }

    case 'arch_semicircle':
    case 'arch_semicircle_open': {
      const autoR = Math.round(halfW);
      const rOuter = Math.min(halfW, safeH);
      const rIn = Math.max(2, rOuter - d);
      const archH = rOuter;
      const legH = Math.max(0, safeH - archH);
      return {
        rOuter,
        rIn,
        archH,
        legH,
        ySpring: archH,
        isPointed: false,
        isOpenBottom: isOpen,
        autoRadiusMm: autoR,
      };
    }

    case 'arch_segment_leg':
    case 'arch_segment_leg_open': {
      const autoR = Math.round(safeW * 0.65);
      const minR = halfW + Math.min(10, safeW * 0.02);
      const rOuter = Math.max(minR, archConfig?.radiusMm || autoR);
      const sagitta = rOuter - Math.sqrt(Math.max(0, rOuter * rOuter - halfW * halfW));
      const archH = Math.min(safeH, sagitta);
      const legH = Math.max(0, safeH - archH);
      const wIn = Math.max(4, safeW - 2 * d);
      const rIn = Math.max(wIn / 2 + 2, rOuter - d);
      return {
        rOuter,
        rIn,
        archH,
        legH,
        ySpring: archH,
        isPointed: false,
        isOpenBottom: isOpen,
        autoRadiusMm: autoR,
      };
    }

    case 'arch_pointed': {
      const autoR = Math.round(safeW / 4 + (safeH * safeH) / safeW);
      const rOuter = Math.max(halfW + 2, archConfig?.radiusMm || autoR);
      const rIn = Math.max(2, rOuter - d);
      return {
        rOuter,
        rIn,
        archH: safeH,
        legH: 0,
        ySpring: safeH,
        isPointed: true,
        isOpenBottom: false,
        autoRadiusMm: autoR,
      };
    }

    case 'arch_pointed_leg': {
      const defaultArchH = Math.min(safeH * 0.62, safeW * 0.85);
      const autoR = Math.round(safeW / 4 + (defaultArchH * defaultArchH) / safeW);
      const rOuter = Math.max(halfW + 2, archConfig?.radiusMm || autoR);
      const rawArchH = Math.sqrt(Math.max(0, rOuter * rOuter - (rOuter - halfW) * (rOuter - halfW)));
      const archH = Math.min(safeH * 0.65, rawArchH);
      const legH = Math.max(0, safeH - archH);
      const rIn = Math.max(2, rOuter - d);
      return {
        rOuter,
        rIn,
        archH,
        legH,
        ySpring: archH,
        isPointed: true,
        isOpenBottom: false,
        autoRadiusMm: autoR,
      };
    }

    default: {
      const autoR = Math.round(halfW);
      return {
        rOuter: halfW,
        rIn: Math.max(2, halfW - d),
        archH: safeH,
        legH: 0,
        ySpring: safeH,
        isPointed: false,
        isOpenBottom: isOpen,
        autoRadiusMm: autoR,
      };
    }
  }
};

/**
 * Tính chính xác tung độ Y trên đường cong vòm tại hoành độ queryX bất kỳ.
 * Dùng để cắt vát mòi 45° tại đỉnh thanh đứng cánh giữa và neo đường mở cửa.
 */
export const getArchYAtX = (
  shape: FrameShape,
  x: number,
  y: number,
  w: number,
  h: number,
  d: number,
  queryX: number,
  archConfig?: ArchConfig
): number => {
  const xMid = x + w / 2;
  const dx = Math.abs(queryX - xMid);
  const metrics = computeArchMetrics(shape, w, h, d, archConfig);

  switch (shape) {
    case 'arch_semicircle':
    case 'arch_semicircle_open': {
      const yCenter = y + metrics.rOuter;
      const dy = Math.sqrt(Math.max(0, metrics.rIn * metrics.rIn - dx * dx));
      return yCenter - dy;
    }

    case 'arch_half': {
      const rxIn = Math.max(2, w / 2 - d);
      const ryIn = Math.max(2, h - d);
      const ratio = Math.min(1, dx / rxIn);
      return y + h - ryIn * Math.sqrt(Math.max(0, 1 - ratio * ratio));
    }

    case 'arch_segment':
    case 'arch_segment_leg':
    case 'arch_segment_leg_open': {
      const yCenter = y + metrics.rOuter;
      const dy = Math.sqrt(Math.max(0, metrics.rIn * metrics.rIn - dx * dx));
      return yCenter - dy;
    }

    case 'arch_pointed':
    case 'arch_pointed_leg': {
      const effROuter =
        shape === 'arch_pointed_leg'
          ? w / 4 + (metrics.archH * metrics.archH) / Math.max(1, w)
          : w / 4 + (h * h) / Math.max(1, w);
      const r0 = archConfig?.radiusMm ? Math.max(w / 2 + 2, archConfig.radiusMm) : effROuter;
      const rIn = Math.max(2, r0 - d);
      const ySpringAbs =
        shape === 'arch_pointed_leg'
          ? y + Math.min(h * 0.65, Math.sqrt(Math.max(0, r0 * r0 - (r0 - w / 2) * (r0 - w / 2))))
          : y + Math.sqrt(Math.max(0, r0 * r0 - (r0 - w / 2) * (r0 - w / 2)));
      const distX = r0 - w / 2 + dx;
      const dy = Math.sqrt(Math.max(0, rIn * rIn - distX * distX));
      return ySpringAbs - dy;
    }

    case 'circle': {
      const r = Math.min(w, h) / 2;
      const curR = Math.max(2, r - d);
      const cy = y + h / 2;
      return cy - Math.sqrt(Math.max(0, curR * curR - dx * dx));
    }

    case 'ellipse': {
      const curRx = Math.max(2, w / 2 - d);
      const curRy = Math.max(2, h / 2 - d);
      const cy = y + h / 2;
      const ratio = Math.min(1, dx / curRx);
      return cy - curRy * Math.sqrt(Math.max(0, 1 - ratio * ratio));
    }

    default:
      return y + d;
  }
};

/**
 * Tính chính xác hoành độ X trên đường cong vòm tại tung độ queryY.
 */
export const getArchXAtY = (
  shape: FrameShape,
  x: number,
  y: number,
  w: number,
  h: number,
  d: number,
  queryY: number,
  side: 'left' | 'right',
  archConfig?: ArchConfig
): number => {
  const xMid = x + w / 2;
  const metrics = computeArchMetrics(shape, w, h, d, archConfig);

  if (shape === 'arch_pointed' || shape === 'arch_pointed_leg') {
    const effROuter =
      shape === 'arch_pointed_leg'
        ? w / 4 + (metrics.archH * metrics.archH) / Math.max(1, w)
        : w / 4 + (h * h) / Math.max(1, w);
    const r0 = archConfig?.radiusMm ? Math.max(w / 2 + 2, archConfig.radiusMm) : effROuter;
    const rIn = Math.max(2, r0 - d);
    const ySpringAbs =
      shape === 'arch_pointed_leg'
        ? y + Math.min(h * 0.65, Math.sqrt(Math.max(0, r0 * r0 - (r0 - w / 2) * (r0 - w / 2))))
        : y + Math.sqrt(Math.max(0, r0 * r0 - (r0 - w / 2) * (r0 - w / 2)));

    if (queryY >= ySpringAbs) {
      return side === 'left' ? x + d : x + w - d;
    }
    const dy = ySpringAbs - queryY;
    const horizFromCenter = Math.sqrt(Math.max(0, rIn * rIn - dy * dy));
    const dxFromMid = Math.max(0, horizFromCenter - (r0 - w / 2));
    return side === 'left' ? xMid - dxFromMid : xMid + dxFromMid;
  }

  if (shape === 'arch_half') {
    const rxIn = Math.max(2, w / 2 - d);
    const ryIn = Math.max(2, h - d);
    const dy = Math.max(0, y + h - queryY);
    const ratio = Math.min(1, dy / ryIn);
    const dx = rxIn * Math.sqrt(Math.max(0, 1 - ratio * ratio));
    return side === 'left' ? xMid - dx : xMid + dx;
  }

  if (
    shape === 'arch_segment' ||
    shape === 'arch_segment_leg' ||
    shape === 'arch_segment_leg_open' ||
    shape === 'arch_semicircle' ||
    shape === 'arch_semicircle_open'
  ) {
    const ySpringAbs = y + metrics.ySpring;
    if (queryY >= ySpringAbs && metrics.legH > 0) {
      return side === 'left' ? x + d : x + w - d;
    }
    const yCenter = y + metrics.rOuter;
    const dy = yCenter - queryY;
    const dx = Math.min(w / 2 - d, Math.sqrt(Math.max(0, metrics.rIn * metrics.rIn - dy * dy)));
    return side === 'left' ? xMid - dx : xMid + dx;
  }

  return side === 'left' ? x + d : x + w - d;
};

/**
 * Tính toán đường dẫn SVG path cho các loại khung uốn cong/vòm tại khoảng cách lùi vào trong d (px).
 */
export const getCurvedContourPath = (
  shape: FrameShape,
  x: number,
  y: number,
  w: number,
  h: number,
  d: number = 0,
  isOpenBottom: boolean = false,
  archConfig?: ArchConfig,
  bottomInsetOverride?: number
): string | null => {
  if (shape === 'rect' || !shape) return null;

  const effectiveOpenBottom =
    bottomInsetOverride !== undefined ? isOpenBottom : isArchOpenBottomShape(shape, isOpenBottom);
  const yBot = y + h;
  const dBot =
    bottomInsetOverride !== undefined
      ? bottomInsetOverride
      : effectiveOpenBottom && d > 0
        ? 0
        : d;
  const yInBot = yBot - dBot;
  const xMid = x + w / 2;

  switch (shape) {
    case 'arch_half': {
      const rxIn = Math.max(2, w / 2 - d);
      const ryIn = Math.max(2, h - d);
      if (d === 0) {
        return `M ${x} ${yBot} A ${w / 2} ${h} 0 0 1 ${x + w} ${yBot} ${effectiveOpenBottom ? '' : `L ${x} ${yBot}`} Z`;
      }
      const xLeft = getArchXAtY(shape, x, y, w, h, d, yInBot, 'left', archConfig);
      const xRight = getArchXAtY(shape, x, y, w, h, d, yInBot, 'right', archConfig);
      return `M ${xLeft} ${yInBot} A ${rxIn} ${ryIn} 0 0 1 ${xRight} ${yInBot} ${effectiveOpenBottom ? '' : `L ${xLeft} ${yInBot}`} Z`;
    }

    case 'arch_segment': {
      const metrics = computeArchMetrics(shape, w, h, d, archConfig);
      if (d === 0) {
        return `M ${x} ${yBot} A ${metrics.rOuter} ${metrics.rOuter} 0 0 1 ${x + w} ${yBot} ${effectiveOpenBottom ? '' : `L ${x} ${yBot}`} Z`;
      }
      const yArcEnd = Math.min(
        yInBot,
        y + metrics.rOuter - Math.sqrt(Math.max(0, metrics.rIn * metrics.rIn - (w / 2 - d) * (w / 2 - d)))
      );
      const xInLeft = x + d;
      const xInRight = x + w - d;
      return `M ${xInLeft} ${yInBot} L ${xInLeft} ${yArcEnd} A ${metrics.rIn} ${metrics.rIn} 0 0 1 ${xInRight} ${yArcEnd} L ${xInRight} ${yInBot} ${effectiveOpenBottom ? '' : `L ${xInLeft} ${yInBot}`} Z`;
    }

    case 'arch_semicircle':
    case 'arch_semicircle_open': {
      const r = Math.min(w / 2, h);
      const ySpring = y + r;
      if (d === 0) {
        return `M ${x} ${yBot} L ${x} ${ySpring} A ${r} ${r} 0 0 1 ${x + w} ${ySpring} L ${x + w} ${yBot} ${effectiveOpenBottom ? '' : `L ${x} ${yBot}`} Z`;
      }
      const rIn = Math.max(2, r - d);
      const xInLeft = x + d;
      const xInRight = x + w - d;
      return `M ${xInLeft} ${yInBot} L ${xInLeft} ${ySpring} A ${rIn} ${rIn} 0 0 1 ${xInRight} ${ySpring} L ${xInRight} ${yInBot} ${effectiveOpenBottom ? '' : `L ${xInLeft} ${yInBot}`} Z`;
    }

    case 'arch_segment_leg':
    case 'arch_segment_leg_open': {
      const metrics = computeArchMetrics(shape, w, h, d, archConfig);
      const ySpring = y + metrics.ySpring;
      if (d === 0) {
        return `M ${x} ${yBot} L ${x} ${ySpring} A ${metrics.rOuter} ${metrics.rOuter} 0 0 1 ${x + w} ${ySpring} L ${x + w} ${yBot} ${effectiveOpenBottom ? '' : `L ${x} ${yBot}`} Z`;
      }
      const xInLeft = x + d;
      const xInRight = x + w - d;
      const ySpringIn = Math.min(
        yInBot,
        y + metrics.rOuter - Math.sqrt(Math.max(0, metrics.rIn * metrics.rIn - (w / 2 - d) * (w / 2 - d)))
      );
      return `M ${xInLeft} ${yInBot} L ${xInLeft} ${ySpringIn} A ${metrics.rIn} ${metrics.rIn} 0 0 1 ${xInRight} ${ySpringIn} L ${xInRight} ${yInBot} ${effectiveOpenBottom ? '' : `L ${xInLeft} ${yInBot}`} Z`;
    }

    case 'arch_pointed': {
      const metrics = computeArchMetrics(shape, w, h, d, archConfig);
      const r0 = metrics.rOuter;
      const rIn = metrics.rIn;
      const yApex = getArchYAtX(shape, x, y, w, h, d, xMid, archConfig);
      if (d === 0) {
        return `M ${x} ${yBot} A ${r0} ${r0} 0 0 1 ${xMid} ${yApex} A ${r0} ${r0} 0 0 1 ${x + w} ${yBot} ${effectiveOpenBottom ? '' : `L ${x} ${yBot}`} Z`;
      }
      const xInLeft = getArchXAtY(shape, x, y, w, h, d, yInBot, 'left', archConfig);
      const xInRight = getArchXAtY(shape, x, y, w, h, d, yInBot, 'right', archConfig);
      return `M ${xInLeft} ${yInBot} A ${rIn} ${rIn} 0 0 1 ${xMid} ${yApex} A ${rIn} ${rIn} 0 0 1 ${xInRight} ${yInBot} ${effectiveOpenBottom ? '' : `L ${xInLeft} ${yInBot}`} Z`;
    }

    case 'arch_pointed_leg': {
      const metrics = computeArchMetrics(shape, w, h, d, archConfig);
      const r0 = metrics.rOuter;
      const rIn = metrics.rIn;
      const ySpring = y + metrics.ySpring;
      const yApex = getArchYAtX(shape, x, y, w, h, d, xMid, archConfig);
      if (d === 0) {
        return `M ${x} ${yBot} L ${x} ${ySpring} A ${r0} ${r0} 0 0 1 ${xMid} ${yApex} A ${r0} ${r0} 0 0 1 ${x + w} ${ySpring} L ${x + w} ${yBot} ${effectiveOpenBottom ? '' : `L ${x} ${yBot}`} Z`;
      }
      const xInLeft = x + d;
      const xInRight = x + w - d;
      return `M ${xInLeft} ${yInBot} L ${xInLeft} ${ySpring} A ${rIn} ${rIn} 0 0 1 ${xMid} ${yApex} A ${rIn} ${rIn} 0 0 1 ${xInRight} ${ySpring} L ${xInRight} ${yInBot} ${effectiveOpenBottom ? '' : `L ${xInLeft} ${yInBot}`} Z`;
    }

    case 'round_top_2':
    case 'round_top_2_open': {
      const r = Math.min(Math.round(w * 0.25), Math.round(h * 0.25), 45);
      if (d === 0) {
        return `M ${x} ${yBot} L ${x} ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y} L ${x + w - r} ${y} A ${r} ${r} 0 0 1 ${x + w} ${y + r} L ${x + w} ${yBot} ${effectiveOpenBottom ? '' : `L ${x} ${yBot}`} Z`;
      }
      const rIn = Math.max(2, r - d);
      return `M ${x + d} ${yInBot} L ${x + d} ${y + r} A ${rIn} ${rIn} 0 0 1 ${x + d + rIn} ${y + d} L ${x + w - d - rIn} ${y + d} A ${rIn} ${rIn} 0 0 1 ${x + w - d} ${y + r} L ${x + w - d} ${yInBot} L ${x + d} ${yInBot} Z`;
    }

    case 'round_top_right': {
      const r = Math.min(Math.round(w * 0.4), Math.round(h * 0.4), 50);
      if (d === 0) {
        return `M ${x} ${yBot} L ${x} ${y} L ${x + w - r} ${y} A ${r} ${r} 0 0 1 ${x + w} ${y + r} L ${x + w} ${yBot} ${effectiveOpenBottom ? '' : `L ${x} ${yBot}`} Z`;
      }
      const rIn = Math.max(2, r - d);
      return `M ${x + d} ${yInBot} L ${x + d} ${y + d} L ${x + w - d - rIn} ${y + d} A ${rIn} ${rIn} 0 0 1 ${x + w - d} ${y + r} L ${x + w - d} ${yInBot} L ${x + d} ${yInBot} Z`;
    }

    case 'round_4_corner': {
      const r = Math.min(Math.round(w * 0.15), Math.round(h * 0.15), 30);
      if (d === 0) {
        return `M ${x + r} ${y} L ${x + w - r} ${y} A ${r} ${r} 0 0 1 ${x + w} ${y + r} L ${x + w} ${yBot - r} A ${r} ${r} 0 0 1 ${x + w - r} ${yBot} L ${x + r} ${yBot} A ${r} ${r} 0 0 1 ${x} ${yBot - r} L ${x} ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y} Z`;
      }
      const rIn = Math.max(2, r - d);
      return `M ${x + d + rIn} ${y + d} L ${x + w - d - rIn} ${y + d} A ${rIn} ${rIn} 0 0 1 ${x + w - d} ${y + d + rIn} L ${x + w - d} ${y + h - d - rIn} A ${rIn} ${rIn} 0 0 1 ${x + w - d - rIn} ${y + h - d} L ${x + d + rIn} ${y + h - d} A ${rIn} ${rIn} 0 0 1 ${x + d} ${y + h - d - rIn} L ${x + d} ${y + d + rIn} A ${rIn} ${rIn} 0 0 1 ${x + d + rIn} ${y + d} Z`;
    }

    case 'quad_circle': {
      if (d === 0) {
        return `M ${x} ${yBot} L ${x} ${y} A ${w} ${h} 0 0 1 ${x + w} ${yBot} Z`;
      }
      return `M ${x + d} ${yInBot} L ${x + d} ${y + d} A ${Math.max(2, w - d)} ${Math.max(2, h - d)} 0 0 1 ${x + w - d} ${yInBot} Z`;
    }

    case 'circle': {
      const r = Math.min(w, h) / 2;
      const cx = x + w / 2;
      const cy = y + h / 2;
      const curR = Math.max(2, r - d);
      return `M ${cx - curR} ${cy} A ${curR} ${curR} 0 1 1 ${cx + curR} ${cy} A ${curR} ${curR} 0 1 1 ${cx - curR} ${cy} Z`;
    }

    case 'ellipse': {
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
 * Vẽ đường tâm uốn nét đứt màu cam (#f59e0b) cho arch_pointed / arch_pointed_leg (như Hình 5)
 */
export const getArchCenterlinePath = (
  shape: FrameShape,
  x: number,
  y: number,
  w: number,
  h: number,
  offsetCenter: number,
  archConfig?: ArchConfig
): string | null => {
  if (shape !== 'arch_pointed' && shape !== 'arch_pointed_leg') {
    return null;
  }
  return getCurvedContourPath(shape, x, y, w, h, offsetCenter, false, archConfig);
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
  isOpenBottom: boolean,
  archConfig?: ArchConfig
): CurvedFramePaths | null => {
  const outerPath = getCurvedContourPath(shape, x, y, w, h, 0, isOpenBottom, archConfig);
  const innerPath = getCurvedContourPath(shape, x, y, w, h, frameD, isOpenBottom, archConfig);
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
