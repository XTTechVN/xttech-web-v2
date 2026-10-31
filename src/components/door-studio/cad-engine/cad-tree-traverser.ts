import { SceneCellNode, MullionInfo, FrameConfig } from '../studio-types';
import { FrameBox, MullionBar, LeafCell, CouplingSeamBar, VerticalSlice } from './cad-types';

export interface BottomSill {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CadLayoutResult {
  frames: FrameBox[];
  mullions: MullionBar[];
  couplingSeams: CouplingSeamBar[];
  leaves: LeafCell[];
  bottomSills?: BottomSill[];
}

/**
 * Trích xuất danh sách các phân đoạn dọc (cột) trong cây layout
 * Phục vụ đo kích thước phụ từng cánh/ô ở cạnh đáy
 */
export const getVerticalSlices = (rootCell: SceneCellNode): VerticalSlice[] => {
  const totalW = rootCell.w || 1;
  const markers: { x: number; type: 'mullion' | 'sash' | 'sash_mullion'; nodeId?: string }[] = [];
  const knownNodes: { id: string; xStart: number; xEnd: number; w: number }[] = [];

  const traverse = (node: SceneCellNode, xStart: number, xEnd: number) => {
    const span = xEnd - xStart;
    if (span <= 0) return;

    // Ghi nhận phạm vi tọa độ của ô này
    knownNodes.push({ id: node.id, xStart, xEnd, w: node.w || span });

    // 1. Phân chia đố khung theo phương dọc
    if (node.splitDirection === 'vertical' && node.children && node.children.length > 1) {
      const count = node.children.length;
      const totalWeight = node.children.reduce((sum, c) => sum + (c.w || 1), 0);
      let cur = xStart;

      node.children.forEach((child, idx) => {
        const isLast = idx === count - 1;
        const weight = child.w || 1;
        const ratio = totalWeight > 0 ? weight / totalWeight : 1 / count;
        const cw = isLast ? xEnd - cur : Math.round(span * ratio);

        if (idx < count - 1) {
          markers.push({ x: cur + cw, type: 'mullion', nodeId: child.id });
        }

        traverse(child, cur, cur + cw);
        cur += cw;
      });
      return;
    }

    // 2. Phân chia đố khung theo phương ngang: các con chia sẻ cùng dải [xStart, xEnd]
    if (node.splitDirection === 'horizontal' && node.children && node.children.length > 1) {
      for (const child of node.children) {
        traverse(child, xStart, xEnd);
      }
      return;
    }

    // 3. Phân chia đố cánh (sash_mullion)
    if (node.splitType === 'sash_mullion' && node.children && node.children.length > 1) {
      if (node.splitDirection === 'vertical') {
        const count = node.children.length;
        const totalWeight = node.children.reduce((sum, c) => sum + (c.w || 1), 0);
        let cur = xStart;

        node.children.forEach((child, idx) => {
          const isLast = idx === count - 1;
          const weight = child.w || 1;
          const ratio = totalWeight > 0 ? weight / totalWeight : 1 / count;
          const cw = isLast ? xEnd - cur : Math.round(span * ratio);

          if (idx < count - 1) {
            markers.push({ x: cur + cw, type: 'sash_mullion', nodeId: child.id });
          }

          traverse(child, cur, cur + cw);
          cur += cw;
        });
        return;
      }
    }

    // 4. Các kiểu cánh có nhiều cánh (sash boundaries)
    // 4.1 Cửa 2 cánh mở quay / lùa 2 cánh / sash_pair
    if (
      node.sashType === 'swing_double' ||
      node.sashType === 'sliding_2' ||
      node.splitType === 'sash_pair'
    ) {
      const mid = xStart + Math.round(span / 2);
      markers.push({ x: mid, type: 'sash', nodeId: node.id });
    } else if (node.sashType === 'sliding_4' || node.sashType === 'folding_4') {
      // 4.2 Cửa 4 cánh (lùa 4 cánh, xếp trượt 4 cánh)
      markers.push({ x: xStart + Math.round(span * 0.25), type: 'sash', nodeId: node.id });
      markers.push({ x: xStart + Math.round(span * 0.5), type: 'sash', nodeId: node.id });
      markers.push({ x: xStart + Math.round(span * 0.75), type: 'sash', nodeId: node.id });
    } else if (node.sashType === 'folding_6') {
      for (let i = 1; i <= 5; i++) {
        markers.push({ x: xStart + Math.round((span * i) / 6), type: 'sash', nodeId: node.id });
      }
    }

    // 4.3 Đố cánh bên trong cánh đơn (sashMullions)
    if (node.sashMullions?.direction === 'vertical' && node.sashMullions.count > 1) {
      const count = node.sashMullions.count;
      const positions = node.sashMullions.positions;
      let cur = xStart;
      for (let i = 0; i < count - 1; i++) {
        const segW = positions && positions.length === count ? positions[i] : Math.round(span / count);
        cur += segW;
        markers.push({ x: cur, type: 'sash_mullion', nodeId: node.id });
      }
    }

    // 5. Nếu có con thông thường khác
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        traverse(child, xStart, xEnd);
      }
    }
  };

  traverse(rootCell, 0, totalW);

  // Thu thập và loại bỏ các mốc trùng lặp (hoặc chênh lệch <= 3mm)
  const rawCoords = [0, totalW, ...markers.map((m) => m.x)];
  rawCoords.sort((a, b) => a - b);

  const cleanCoords: number[] = [0];
  for (const c of rawCoords) {
    const prev = cleanCoords[cleanCoords.length - 1];
    if (c - prev > 3) {
      cleanCoords.push(c);
    }
  }
  if (cleanCoords[cleanCoords.length - 1] !== totalW) {
    if (totalW - cleanCoords[cleanCoords.length - 1] <= 3) {
      cleanCoords[cleanCoords.length - 1] = totalW;
    } else {
      cleanCoords.push(totalW);
    }
  }

  if (cleanCoords.length <= 1) return [];

  // Tạo các phân đoạn (slices)
  const slices: VerticalSlice[] = [];
  for (let i = 0; i < cleanCoords.length - 1; i++) {
    const sStart = cleanCoords[i];
    const sEnd = cleanCoords[i + 1];
    const segW = sEnd - sStart;

    // Tìm xem phân đoạn này có khớp trọn vẹn với một ô lá trong cây không
    const matchingNodes = knownNodes.filter(
      (n) => Math.abs(n.xStart - sStart) <= 2 && Math.abs(n.xEnd - sEnd) <= 2
    );
    matchingNodes.sort((a, b) => a.w - b.w);
    const bestNode = matchingNodes[0];

    slices.push({
      id: bestNode ? bestNode.id : `${rootCell.id}-slice-${i}`,
      w: segW,
      xStart: sStart,
      xEnd: sEnd,
      isHybrid: !bestNode,
      editableCellId: bestNode ? bestNode.id : undefined,
    });
  }

  return slices;
};

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
  mullionT: number,
  options?: {
    isOpenBottom?: boolean;
    isHydraulic?: boolean;
    vertMullionT?: number;
    horizMullionT?: number;
    frameConfig?: FrameConfig;
  }
): CadLayoutResult => {
  const frames: FrameBox[] = [];
  const mullions: MullionBar[] = [];
  const couplingSeams: CouplingSeamBar[] = [];
  const leaves: LeafCell[] = [];
  const bottomSills: BottomSill[] = [];

  const isDoorHydraulic = Boolean(options?.isHydraulic || rootCell.isHydraulic);
  const isOpenBottomDoor = Boolean(options?.isOpenBottom || isDoorHydraulic);

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
      innerH = Math.max(10, hBox - frameD - (isOpenBottomDoor ? 0 : frameD));
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

      const activeMullionT = isVert ? (options?.vertMullionT ?? mullionT) : (options?.horizMullionT ?? mullionT);
      let totalMullions = 0;
      for (let i = 0; i < count - 1; i++) {
        if (hasMullionBetween(node.children[i], node.children[i + 1])) {
          totalMullions += activeMullionT;
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
            const isSeparate = options?.frameConfig?.mullionMode === 'separate';
            const defaultPid = isSeparate
              ? (isVert
                  ? (options?.frameConfig?.mullionVertProfileId || options?.frameConfig?.mullionProfileId)
                  : (options?.frameConfig?.mullionHorizProfileId || options?.frameConfig?.mullionProfileId))
              : options?.frameConfig?.mullionProfileId;

            const mullionInfo: MullionInfo = {
              id: `${node.id}-mullion-${idx}`,
              parentNodeId: node.id,
              mullionIndex: idx,
              direction: isVert ? 'vertical' : 'horizontal',
              childId: child.id,
              nextChildId: nextChild.id,
              dimension: isVert ? child.w : child.h,
              totalDimension: totalWeight,
              profileId: child.mullionProfileId ?? (node as SceneCellNode).mullionProfileId ?? defaultPid,
              cutType: child.mullionCutType ?? 'inside_frame',
            };

            if (isVert) {
              mullions.push({ x: innerX + cur, y: innerY, w: activeMullionT, h: innerH, info: mullionInfo });
            } else {
              mullions.push({ x: innerX, y: innerY + cur, w: innerW, h: activeMullionT, info: mullionInfo });
            }
            cur += activeMullionT;
          }
        }
      });
      return;
    }

    // 4. Ô lá cuối cùng (Leaf Cell)
    const touchesFloor = isOpenBottomDoor && Math.abs((innerY + innerH) - (oy + fh)) < 2;

    if (touchesFloor && isDoorHydraulic && node.sashType === 'fixed') {
      const sillH = frameD;
      bottomSills.push({
        x: innerX,
        y: innerY + innerH - sillH,
        w: innerW,
        h: sillH,
      });
      leaves.push({
        node,
        x: innerX,
        y: innerY,
        w: innerW,
        h: Math.max(10, innerH - sillH),
      });
    } else {
      leaves.push({ node, x: innerX, y: innerY, w: innerW, h: innerH });
    }
  };

  traverse(rootCell, ox, oy, fw, fh, true);

  return { frames, mullions, couplingSeams, leaves, bottomSills };
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
