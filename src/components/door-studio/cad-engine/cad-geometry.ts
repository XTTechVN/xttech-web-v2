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
