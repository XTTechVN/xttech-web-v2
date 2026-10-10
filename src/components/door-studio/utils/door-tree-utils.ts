import { SceneCellNode, SashOpenType } from '../studio-types';

export const updateNode = (
  root: SceneCellNode,
  id: string,
  updates: Partial<SceneCellNode>
): SceneCellNode => {
  if (root.id === id) return { ...root, ...updates };
  if (root.children) {
    return { ...root, children: root.children.map((c) => updateNode(c, id, updates)) };
  }
  return root;
};

export const findNode = (root: SceneCellNode, id: string): SceneCellNode | null => {
  if (root.id === id) return root;
  if (root.children) {
    for (const c of root.children) {
      const f = findNode(c, id);
      if (f) return f;
    }
  }
  return null;
};

export const findParentNode = (root: SceneCellNode, id: string): SceneCellNode | null => {
  if (root.children) {
    if (root.children.some((c) => c.id === id)) return root;
    for (const c of root.children) {
      const p = findParentNode(c, id);
      if (p) return p;
    }
  }
  return null;
};

export const createDefaultRootCell = (width = 1400, height = 1600): SceneCellNode => ({
  id: 'root',
  w: width,
  h: height,
  sashType: 'fixed',
  paneType: 'glass',
  children: [],
});

export const rescaleTree = (node: SceneCellNode, scaleX: number, scaleY: number): SceneCellNode => ({
  ...node,
  w: Math.round(node.w * scaleX),
  h: Math.round(node.h * scaleY),
  children: node.children?.map((c) => rescaleTree(c, scaleX, scaleY)),
});

export const createSplitChildren = (
  parentId: string,
  totalW: number,
  totalH: number,
  count: number,
  direction: 'vertical' | 'horizontal',
  defaultSashType: SashOpenType = 'fixed'
): SceneCellNode[] => {
  const isVert = direction === 'vertical';
  const span = isVert ? totalW : totalH;
  const basePart = Math.floor(span / count);
  let accumulated = 0;

  return Array.from({ length: count }, (_, i) => {
    const isLast = i === count - 1;
    const currentSpan = isLast ? span - accumulated : basePart;
    accumulated += currentSpan;

    return {
      id: `${parentId}_c${i}_${crypto.randomUUID().slice(0, 8)}`,
      w: isVert ? currentSpan : totalW,
      h: isVert ? totalH : currentSpan,
      sashType: defaultSashType,
      paneType: 'glass',
    };
  });
};

/**
 * Đồng bộ kiểu cánh cho cụm cửa hoặc chuyển đổi giữa cửa 2 cánh và cửa 1 cánh / vách cố định
 */
export const applySashTypeToCluster = (
  root: SceneCellNode,
  targetId: string,
  newSashType: SashOpenType
): { updatedRoot: SceneCellNode; nextSelectedId?: string } => {
  const targetNode = findNode(root, targetId);
  if (!targetNode) return { updatedRoot: root };

  const parentNode = findParentNode(root, targetId);

  // Nhận diện cụm cánh đôi (sash pair):
  const isParentPair =
    parentNode &&
    parentNode.children &&
    parentNode.children.length === 2 &&
    parentNode.splitDirection === 'vertical' &&
    (parentNode.splitType === 'sash_pair' ||
      parentNode.sashType === 'swing_double' ||
      (parentNode.children.some((c) => c.sashType === 'swing_left') &&
        parentNode.children.some((c) => c.sashType === 'swing_right')));

  const isTargetPair =
    targetNode.children &&
    targetNode.children.length === 2 &&
    targetNode.splitDirection === 'vertical' &&
    (targetNode.splitType === 'sash_pair' ||
      targetNode.sashType === 'swing_double' ||
      (targetNode.children.some((c) => c.sashType === 'swing_left') &&
        targetNode.children.some((c) => c.sashType === 'swing_right')));

  const pairContainer = isParentPair ? parentNode : isTargetPair ? targetNode : null;

  // TRƯỜNG HỢP 1: Khoang đang là Cụm 2 cánh (pairContainer)
  if (pairContainer && pairContainer.children && pairContainer.children.length === 2) {
    const c0 = pairContainer.children[0];
    const c1 = pairContainer.children[1];

    // 1.1: Giữ nguyên là Cửa 2 cánh mở quay
    if (newSashType === 'swing_double') {
      const updatedChildren: SceneCellNode[] = [
        {
          ...c0,
          sashType: 'swing_left',
          hasLock: false,
        },
        {
          ...c1,
          sashType: 'swing_right',
          hasLock: true,
          handleHeight: Math.round(c1.h / 2),
          handleType: c1.handleType ?? 'lever',
        },
      ];
      return {
        updatedRoot: updateNode(root, pairContainer.id, {
          sashType: 'swing_double',
          splitDirection: 'vertical',
          splitType: 'sash_pair',
          children: updatedChildren,
        }),
        nextSelectedId: targetId === c0.id ? c0.id : c1.id,
      };
    }

    // 1.2: Cánh đơn hoặc vách cố định -> Hợp nhất cụm 2 cánh thành 1 cánh/ô duy nhất toàn khoang
    const sashHasHandle = ['swing_left', 'swing_right', 'tilt_turn', 'awning', 'tilt', 'tilt_down', 'sliding'].includes(newSashType);
    const activePaneType = targetNode.paneType || c0.paneType || 'glass';
    const activeGlassName = targetNode.glassName || c0.glassName;
    const activeGlassThickness = targetNode.glassThickness || c0.glassThickness;

    const mergedNode: SceneCellNode = {
      ...pairContainer,
      sashType: newSashType,
      splitDirection: undefined,
      splitType: undefined,
      children: [],
      paneType: activePaneType,
      glassName: activeGlassName,
      glassThickness: activeGlassThickness,
      hasLock: sashHasHandle,
      handleHeight: sashHasHandle ? Math.round(pairContainer.h / 2) : undefined,
      handleType: sashHasHandle ? targetNode.handleType || c1.handleType || 'lever' : undefined,
    };

    return {
      updatedRoot: updateNode(root, pairContainer.id, mergedNode),
      nextSelectedId: pairContainer.id,
    };
  }

  // TRƯỜNG HỢP 2: Khoang đang là Ô đơn lẻ (chưa chia hoặc đã hợp nhất)
  if (!pairContainer && (!targetNode.children || targetNode.children.length === 0)) {
    // 2.1: Chuyển từ ô đơn lẻ sang Cửa 2 cánh mở quay
    if (newSashType === 'swing_double') {
      const halfW = Math.round(targetNode.w / 2);
      const newChildren: SceneCellNode[] = [
        {
          id: `${targetNode.id}_c0_${crypto.randomUUID().slice(0, 8)}`,
          w: halfW,
          h: targetNode.h,
          sashType: 'swing_left',
          paneType: targetNode.paneType || 'glass',
          glassName: targetNode.glassName,
          glassThickness: targetNode.glassThickness,
          hasLock: false,
        },
        {
          id: `${targetNode.id}_c1_${crypto.randomUUID().slice(0, 8)}`,
          w: targetNode.w - halfW,
          h: targetNode.h,
          sashType: 'swing_right',
          paneType: targetNode.paneType || 'glass',
          glassName: targetNode.glassName,
          glassThickness: targetNode.glassThickness,
          hasLock: true,
          handleHeight: Math.round(targetNode.h / 2),
          handleType: targetNode.handleType || 'lever',
        },
      ];
      return {
        updatedRoot: updateNode(root, targetNode.id, {
          sashType: newSashType,
          splitDirection: 'vertical',
          splitType: 'sash_pair',
          children: newChildren,
        }),
        nextSelectedId: newChildren[1].id,
      };
    }

    // 2.2: Chuyển đổi giữa các kiểu cánh đơn / vách cố định cho ô đơn lẻ (bao gồm sliding)
    const sashHasHandle = ['swing_left', 'swing_right', 'tilt_turn', 'awning', 'tilt', 'tilt_down', 'sliding'].includes(newSashType);
    const updates: Partial<SceneCellNode> = {
      sashType: newSashType,
      hasLock: sashHasHandle,
      handleHeight: sashHasHandle ? Math.round(targetNode.h / 2) : undefined,
      handleType: sashHasHandle ? (targetNode.handleType ?? 'lever') : undefined,
    };
    return {
      updatedRoot: updateNode(root, targetId, updates),
      nextSelectedId: targetId,
    };
  }

  return { updatedRoot: root, nextSelectedId: targetId };
};

/**
 * Tổng quát: resize 1 cell bất kỳ trong cây, bù lại cho sibling kế tiếp
 */
export const resizeCellInParent = (
  root: SceneCellNode,
  cellId: string,
  newValue: number,
  axis: 'w' | 'h'
): SceneCellNode => {
  if (!root.children || root.children.length === 0) return root;

  const childIdx = root.children.findIndex((c) => c.id === cellId);
  const isMatchingAxis =
    (axis === 'w' && root.splitDirection === 'vertical') ||
    (axis === 'h' && root.splitDirection === 'horizontal');

  if (childIdx >= 0 && isMatchingAxis) {
    const siblingIdx = childIdx + 1 < root.children.length ? childIdx + 1 : childIdx - 1;
    const oldVal = axis === 'w' ? root.children[childIdx].w : root.children[childIdx].h;
    const sibOld = axis === 'w' ? root.children[siblingIdx].w : root.children[siblingIdx].h;
    const maxAllowed = oldVal + (sibOld - 100);
    const clamped = Math.max(100, Math.min(maxAllowed, newValue));
    const delta = clamped - oldVal;

    const newChildren = root.children.map((c, i) => {
      if (i === childIdx) return { ...c, [axis]: clamped };
      if (i === siblingIdx) {
        return { ...c, [axis]: Math.max(100, sibOld - delta) };
      }
      return c;
    });
    return { ...root, children: newChildren };
  }

  // Không tìm thấy ở cấp này, đệ quy xuống sâu hơn
  return { ...root, children: root.children.map((c) => resizeCellInParent(c, cellId, newValue, axis)) };
};
