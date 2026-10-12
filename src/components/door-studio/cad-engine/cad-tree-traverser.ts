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

  // 4. Nếu nút này có chia đố cánh theo phương dọc (sashMullions)
  if (node.sashMullions?.direction === 'vertical' && node.sashMullions.count > 1) {
    const count = node.sashMullions.count;
    const positions = node.sashMullions.positions;
    let sum = 0;
    const result: { id: string; w: number }[] = [];
    for (let i = 0; i < count; i++) {
      const sw = positions && positions.length === count ? positions[i] : (i === count - 1 ? node.w - sum : Math.round(node.w / count));
      sum += sw;
      result.push({ id: `${node.id}-sm-${i}`, w: sw });
    }
    return result;
  }

  // 5. Tìm kiếm sâu hơn trong các con
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
      } else if (c.sashMullions?.direction === 'horizontal' && c.sashMullions.count > 1) {
        const count = c.sashMullions.count;
        const positions = c.sashMullions.positions;
        let sum = 0;
        for (let i = 0; i < count; i++) {
          const sh = positions && positions.length === count ? positions[i] : (i === count - 1 ? c.h - sum : Math.round(c.h / count));
          sum += sh;
          result.push({ ...c, id: `${c.id}-sm-${i}`, h: sh });
        }
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

  // 3. Nếu nút này có chia đố cánh theo phương ngang
  if (node.sashMullions?.direction === 'horizontal' && node.sashMullions.count > 1) {
    const count = node.sashMullions.count;
    const positions = node.sashMullions.positions;
    let sum = 0;
    const result: SceneCellNode[] = [];
    for (let i = 0; i < count; i++) {
      const sh = positions && positions.length === count ? positions[i] : (i === count - 1 ? node.h - sum : Math.round(node.h / count));
      sum += sh;
      result.push({ ...node, id: `${node.id}-sm-${i}`, h: sh });
    }
    return result;
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
    if (node.children && node.children.length > 0 && node.splitType !== 'sash_mullion') {
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

/**
 * Thu thập tất cả các thanh đố cánh (Sash Mullions) từ các ô lá (leaves)
 * bao gồm cả phân chia phân tầng đệ quy nhiều cấp
 */
export const collectSashMullions = (leaves: LeafCell[], sashD: number): MullionBar[] => {
  const result: MullionBar[] = [];

  for (const leaf of leaves) {
    const { node, x: cx, y: cy, w: cw, h: ch } = leaf;
    const isFixed = node.sashType === 'fixed';
    const isDouble = node.sashType === 'swing_double';
    const isSliding = node.sashType === 'sliding';
    if (isDouble) continue;

    // Tính độ dày khung cánh thích ứng
    const ratioW = isSliding ? 0.12 : 0.18;
    const maxAllowedW = Math.max(8, Math.floor(cw * ratioW));
    const maxAllowedH = Math.max(8, Math.floor(ch * 0.12));
    const maxAllowed = Math.min(maxAllowedW, maxAllowedH);
    const candidate = isSliding ? Math.round(sashD * 0.85) : sashD;
    const dSash = Math.max(8, Math.min(candidate, maxAllowed));

    const smT = Math.max(14, Math.min(32, Math.round(dSash * 0.7)));
    const innerX = isFixed ? cx : cx + dSash;
    const innerY = isFixed ? cy : cy + dSash;
    const innerW = Math.max(4, isFixed ? cw : cw - 2 * dSash);
    const innerH = Math.max(4, isFixed ? ch : ch - 2 * dSash);

    const traverseSashSubTree = (
      currNode: SceneCellNode,
      bx: number,
      by: number,
      bw: number,
      bh: number
    ) => {
      if (
        currNode.children &&
        currNode.children.length > 0 &&
        currNode.splitType === 'sash_mullion'
      ) {
        const isVert = currNode.splitDirection === 'vertical';
        const count = currNode.children.length;
        const mullionSpace = (count - 1) * smT;
        const availSpace = Math.max(10, (isVert ? bw : bh) - mullionSpace);
        const totalWeight = currNode.children.reduce(
          (sum: number, c: SceneCellNode) => sum + ((isVert ? c.w : c.h) || 1),
          0
        );

        let cur = 0;
        let spanCur = 0;
        currNode.children.forEach((child: SceneCellNode, idx: number) => {
          const isLast = idx === count - 1;
          const weight = (isVert ? child.w : child.h) || 1;
          const ratio = totalWeight > 0 ? weight / totalWeight : 1 / count;
          const childSpan = isLast ? availSpace - spanCur : Math.round(availSpace * ratio);
          const cwChild = isVert ? childSpan : bw;
          const chChild = isVert ? bh : childSpan;
          const cxChild = isVert ? bx + cur : bx;
          const cyChild = isVert ? by : by + cur;

          traverseSashSubTree(child, cxChild, cyChild, cwChild, chChild);
          cur += isVert ? cwChild : chChild;
          spanCur += isVert ? cwChild : chChild;

          if (idx < count - 1) {
            const nextChild = currNode.children![idx + 1];
            const childDim = (isVert ? child.w : child.h) || 1;
            const nextChildDim = (isVert ? nextChild.w : nextChild.h) || 1;

            const barInfo: MullionInfo = {
              id: `${currNode.id}-sm-${idx}`,
              parentNodeId: currNode.id,
              mullionIndex: idx,
              direction: isVert ? 'vertical' : 'horizontal',
              childId: child.id,
              nextChildId: nextChild.id,
              dimension: childDim,
              totalDimension: childDim + nextChildDim,
              cutType: 'inside_frame',
            };

            result.push({
              x: isVert ? bx + cur : bx,
              y: isVert ? by : by + cur,
              w: isVert ? smT : bw,
              h: isVert ? bh : smT,
              info: barInfo,
            });
            cur += smT;
          }
        });
      }
    };

    if (node.children && node.children.length > 0 && node.splitType === 'sash_mullion') {
      traverseSashSubTree(node, innerX, innerY, innerW, innerH);
    }
  }

  return result;
};
