import { SceneCellNode, MullionInfo } from '../studio-types';
import { FrameBox, MullionBar, LeafCell, CouplingSeamBar } from './cad-types';

export interface CadLayoutResult {
  frames: FrameBox[];
  mullions: MullionBar[];
  couplingSeams: CouplingSeamBar[];
  leaves: LeafCell[];
}

/**
 * Trích xuất danh sách các phân đoạn dọc (cột) trong cây layout
 * Phục vụ đo kích thước phụ từng cánh/ô ở cạnh đáy
 */
export const getVerticalSlices = (node: SceneCellNode): { id: string; w: number }[] => {
  // 1. Phân chia dọc trực tiếp (vertical split)
  if (node.splitDirection === 'vertical' && node.children && node.children.length > 1) {
    const result: { id: string; w: number }[] = [];
    for (const c of node.children) {
      const sub = getVerticalSlices(c);
      if (sub.length > 0) {
        result.push(...sub);
      } else if (c.sashType === 'swing_double') {
        const half = Math.round(c.w / 2);
        result.push({ id: c.id, w: half });
        result.push({ id: c.id, w: c.w - half });
      } else {
        result.push({ id: c.id, w: c.w });
      }
    }
    return result;
  }

  // 2. Nếu nút này chia ngang, tìm nhánh con có nhiều phân chia dọc nhất
  if (node.splitDirection === 'horizontal' && node.children && node.children.length > 1) {
    let best: { id: string; w: number }[] = [];
    for (const c of node.children) {
      const sub = getVerticalSlices(c);
      if (sub.length > best.length) {
        best = sub;
      }
    }
    if (best.length > 0) return best;
  }

  // 3. Nếu nút này là cửa 2 cánh mở quay đối xứng (swing_double)
  if (node.sashType === 'swing_double') {
    const half = Math.round(node.w / 2);
    return [
      { id: node.id, w: half },
      { id: node.id, w: node.w - half },
    ];
  }

  // 4. Tìm kiếm sâu hơn trong các con
  if (node.children) {
    for (const c of node.children) {
      const found = getVerticalSlices(c);
      if (found.length > 1) return found;
    }
  }

  return [];
};

/**
 * Trích xuất danh sách các phân đoạn ngang (hàng) trong cây layout
 * Phục vụ đo kích thước phụ từng ô ở cạnh phải
 */
export const getHorizontalSlices = (node: SceneCellNode): SceneCellNode[] => {
  // 1. Phân chia ngang trực tiếp (horizontal split)
  if (node.splitDirection === 'horizontal' && node.children && node.children.length > 1) {
    const result: SceneCellNode[] = [];
    for (const c of node.children) {
      const sub = getHorizontalSlices(c);
      if (sub.length > 0) {
        result.push(...sub);
      } else {
        result.push(c);
      }
    }
    return result;
  }

  // 2. Nếu nút này chia dọc, tìm nhánh con có nhiều phân chia ngang nhất
  if (node.splitDirection === 'vertical' && node.children && node.children.length > 1) {
    let best: SceneCellNode[] = [];
    for (const c of node.children) {
      const sub = getHorizontalSlices(c);
      if (sub.length > best.length) {
        best = sub;
      }
    }
    if (best.length > 0) return best;
  }

  if (node.children) {
    for (const c of node.children) {
      const found = getHorizontalSlices(c);
      if (found.length > 0) return found;
    }
  }

  return [];
};

/**
 * Duyệt đệ quy cây SceneCellNode để tính toán tọa độ SVG cho khung (Frame), đố (Mullion) và ô lá (Leaf)
 */
export const buildCadLayout = (
  rootCell: SceneCellNode,
  ox: number,
  oy: number,
  fw: number,
  fh: number,
  frameD: number,
  mullionT: number
): CadLayoutResult => {
  const frames: FrameBox[] = [];
  const mullions: MullionBar[] = [];
  const couplingSeams: CouplingSeamBar[] = [];
  const leaves: LeafCell[] = [];

  const traverse = (node: SceneCellNode, x: number, y: number, wBox: number, hBox: number, isFrameUnit: boolean) => {
    // 1. Frame Coupling: Mỗi nhánh con là 1 module khung độc lập ghép lại
    if (node.splitType === 'coupling' && node.children && node.children.length > 0) {
      const isVert = node.splitDirection === 'vertical';
      const count = node.children.length;
      const totalWeight = node.children.reduce((sum, c) => sum + ((isVert ? c.w : c.h) || 1), 0);

      let cur = 0;
      node.children.forEach((child, idx) => {
        const isLast = idx === count - 1;
        const weight = (isVert ? child.w : child.h) || 1;
        const ratio = totalWeight > 0 ? weight / totalWeight : 1 / count;

        const cw = isVert ? (isLast ? wBox - cur : Math.round(wBox * ratio)) : wBox;
        const ch = isVert ? hBox : isLast ? hBox - cur : Math.round(hBox * ratio);
        const cx = isVert ? x + cur : x;
        const cy = isVert ? y : y + cur;

        traverse(child, cx, cy, cw, ch, true);
        cur += isVert ? cw : ch;

        // Bổ sung vách giáp ranh tách khung (coupling seam) để hỗ trợ kéo thả điều chỉnh
        if (idx < count - 1) {
          const nextChild = node.children?.[idx + 1];
          if (nextChild) {
            couplingSeams.push({
              id: `${node.id}-coupling-${idx}`,
              x: isVert ? cx + cw - 4 : cx,
              y: isVert ? cy : cy + ch - 4,
              w: isVert ? 8 : cw,
              h: isVert ? ch : 8,
              direction: isVert ? 'vertical' : 'horizontal',
              parentNodeId: node.id,
              splitIndex: idx,
              childId: child.id,
              nextChildId: nextChild.id,
              dimension: isVert ? child.w : child.h,
              nextDimension: isVert ? nextChild.w : nextChild.h,
              totalDimension: (isVert ? child.w : child.h) + (isVert ? nextChild.w : nextChild.h),
            });
          }
        }
      });
      return;
    }

    // 2. Khung bao độc lập: Đẩy vào danh sách frames
    let innerX = x;
    let innerY = y;
    let innerW = wBox;
    let innerH = hBox;

    if (isFrameUnit) {
      frames.push({ id: node.id, x, y, w: wBox, h: hBox });
      innerX = x + frameD;
      innerY = y + frameD;
      innerW = Math.max(10, wBox - 2 * frameD);
      innerH = Math.max(10, hBox - 2 * frameD);
    }

    // 3. Phân chia đố T 90° hoặc cặp cánh đối xứng
    if (node.children && node.children.length > 0) {
      const isVert = node.splitDirection === 'vertical';
      const count = node.children.length;

      // Cặp cánh mở quay đối xứng (swing_left + swing_right) khép vào nhau bằng đố động, KHÔNG có đố tĩnh ở giữa
      const hasMullionBetween = (c1: SceneCellNode, c2: SceneCellNode): boolean => {
        if (node.splitType === 'sash_pair' || node.sashType === 'swing_double') return false;
        if (isVert && c1.sashType === 'swing_left' && c2.sashType === 'swing_right') return false;
        return true;
      };

      let totalMullions = 0;
      for (let i = 0; i < count - 1; i++) {
        if (hasMullionBetween(node.children[i], node.children[i + 1])) {
          totalMullions += mullionT;
        }
      }

      const availSpace = Math.max(10, (isVert ? innerW : innerH) - totalMullions);
      const totalWeight = node.children.reduce((sum, c) => sum + ((isVert ? c.w : c.h) || 1), 0);

      let cur = 0;
      let spanCur = 0;
      node.children.forEach((child, idx) => {
        const isLast = idx === count - 1;
        const weight = (isVert ? child.w : child.h) || 1;
        const ratio = totalWeight > 0 ? weight / totalWeight : 1 / count;

        const childSpan = isLast ? availSpace - spanCur : Math.round(availSpace * ratio);
        const cw = isVert ? childSpan : innerW;
        const ch = isVert ? innerH : childSpan;
        const cx = isVert ? innerX + cur : innerX;
        const cy = isVert ? innerY : innerY + cur;

        traverse(child, cx, cy, cw, ch, false);
        cur += isVert ? cw : ch;
        spanCur += isVert ? cw : ch;

        if (idx < count - 1) {
          const nextChild = node.children?.[idx + 1];
          const shouldAddMullion = nextChild ? hasMullionBetween(child, nextChild) : false;

          if (shouldAddMullion && nextChild) {
            const mullionInfo: MullionInfo = {
              id: `${node.id}-mullion-${idx}`,
              parentNodeId: node.id,
              mullionIndex: idx,
              direction: isVert ? 'vertical' : 'horizontal',
              childId: child.id,
              nextChildId: nextChild.id,
              dimension: isVert ? child.w : child.h,
              totalDimension: totalWeight,
              profileId: child.mullionProfileId ?? (node as SceneCellNode).mullionProfileId,
              cutType: child.mullionCutType ?? 'inside_frame',
            };

            if (isVert) {
              mullions.push({ x: innerX + cur, y: innerY, w: mullionT, h: innerH, info: mullionInfo });
            } else {
              mullions.push({ x: innerX, y: innerY + cur, w: innerW, h: mullionT, info: mullionInfo });
            }
            cur += mullionT;
          }
        }
      });
      return;
    }

    // 4. Ô lá cuối cùng (Leaf Cell)
    leaves.push({ node, x: innerX, y: innerY, w: innerW, h: innerH });
  };

  traverse(rootCell, ox, oy, fw, fh, true);

  return { frames, mullions, couplingSeams, leaves };
};
