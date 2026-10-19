import { SceneCellNode, SashOpenType } from '../studio-types';
import { getSashLayout } from '../core/sash-layout-catalog';

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
  const layout = getSashLayout(newSashType);

  // 1. Nhận diện cụm cánh (sash cluster):
  const isParentCluster =
    parentNode &&
    parentNode.children &&
    parentNode.children.length >= 2 &&
    (parentNode.splitType === 'sash_pair' ||
      parentNode.sashType === 'swing_double' ||
      Boolean(parentNode.sashLayout));

  const isTargetCluster =
    targetNode.children &&
    targetNode.children.length >= 2 &&
    (targetNode.splitType === 'sash_pair' ||
      targetNode.sashType === 'swing_double' ||
      Boolean(targetNode.sashLayout));

  const clusterContainer = isParentCluster ? parentNode : isTargetCluster ? targetNode : null;
  const activeContainer = clusterContainer || targetNode;

  // 2. NẾU LÀ CẤU HÌNH TRONG CATALOG (50+ KIỂU CÁNH WINDOVA)
  if (layout) {
    // 2.1: Cấu hình nhiều cánh (N >= 2)
    if (layout.sashes.length > 1) {
      const isVert = layout.layouter !== 'sliding-vertical' && layout.layouter !== 'v-equal';
      const N = layout.sashes.length;
      let sumSpan = 0;
      let defaultSelectedId: string | undefined;

      const newChildren: SceneCellNode[] = layout.sashes.map((sashDef, idx) => {
        const isLast = idx === N - 1;
        const totalSpan = isVert ? activeContainer.w : activeContainer.h;
        const span = isLast ? totalSpan - sumSpan : Math.round(totalSpan / N);
        sumSpan += span;

        const cw = isVert ? span : activeContainer.w;
        const ch = !isVert ? span : activeContainer.h;
        const dirStr = Array.isArray(sashDef.huongMo) ? sashDef.huongMo.join(',') : sashDef.huongMo;
        const childId = `${activeContainer.id}_sash_${idx}_${crypto.randomUUID().slice(0, 8)}`;

        if (sashDef.hasHandle && !defaultSelectedId) {
          defaultSelectedId = childId;
        }

        return {
          id: childId,
          w: cw,
          h: ch,
          sashType: dirStr,
          paneType: targetNode.paneType || 'glass',
          glassName: targetNode.glassName,
          glassThickness: targetNode.glassThickness,
          hasLock: sashDef.hasHandle,
          handleHeight: sashDef.hasHandle ? Math.round(ch / 2) : undefined,
          handleType: sashDef.hasHandle ? ((sashDef.handleType as any) || 'lever') : undefined,
          sashZIndex: sashDef.zIndex,
          sashArrow: sashDef.arrowType,
          sashJoiner: sashDef.joiner,
          sashJoinerPair: sashDef.joinerPair,
          sashHingeSymbol: sashDef.hingeSymbol,
        };
      });

      return {
        updatedRoot: updateNode(root, activeContainer.id, {
          sashType: newSashType,
          sashLayout: layout.id,
          splitDirection: isVert ? 'vertical' : 'horizontal',
          splitType: 'sash_pair',
          children: newChildren,
        }),
        nextSelectedId: defaultSelectedId || newChildren[0]?.id,
      };
    }

    // 2.2: Cấu hình 1 cánh đơn trong Catalog
    const singleDef = layout.sashes[0];
    const dirStr = Array.isArray(singleDef.huongMo) ? singleDef.huongMo.join(',') : singleDef.huongMo;
    const mergedNode: SceneCellNode = {
      ...activeContainer,
      sashType: dirStr,
      sashLayout: layout.id,
      splitDirection: undefined,
      splitType: undefined,
      children: [],
      paneType: targetNode.paneType || activeContainer.paneType || 'glass',
      glassName: targetNode.glassName || activeContainer.glassName,
      glassThickness: targetNode.glassThickness || activeContainer.glassThickness,
      hasLock: singleDef.hasHandle,
      handleHeight: singleDef.hasHandle ? Math.round(activeContainer.h / 2) : undefined,
      handleType: singleDef.hasHandle ? ((singleDef.handleType as any) || 'lever') : undefined,
      sashZIndex: singleDef.zIndex,
      sashArrow: singleDef.arrowType,
      sashHingeSymbol: singleDef.hingeSymbol,
    };

    return {
      updatedRoot: updateNode(root, activeContainer.id, mergedNode),
      nextSelectedId: activeContainer.id,
    };
  }

  // 3. TƯƠNG THÍCH NGƯỢC CÁC KIỂU CÁNH TRUYỀN THỐNG (swing_double, fixed, swing_left...)
  if (clusterContainer && clusterContainer.children && clusterContainer.children.length >= 2) {
    const c0 = clusterContainer.children[0];
    const c1 = clusterContainer.children[1] || c0;

    if (newSashType === 'swing_double') {
      const updatedChildren: SceneCellNode[] = [
        { ...c0, sashType: 'swing_left', hasLock: false },
        { ...c1, sashType: 'swing_right', hasLock: true, handleHeight: Math.round(c1.h / 2), handleType: c1.handleType ?? 'lever' },
      ];
      return {
        updatedRoot: updateNode(root, clusterContainer.id, {
          sashType: 'swing_double',
          splitDirection: 'vertical',
          splitType: 'sash_pair',
          children: updatedChildren,
        }),
        nextSelectedId: targetId === c0.id ? c0.id : c1.id,
      };
    }

    const sashHasHandle = ['swing_left', 'swing_right', 'tilt_turn', 'awning', 'tilt', 'tilt_down', 'sliding'].includes(newSashType);
    const mergedNode: SceneCellNode = {
      ...clusterContainer,
      sashType: newSashType,
      sashLayout: undefined,
      splitDirection: undefined,
      splitType: undefined,
      children: [],
      paneType: targetNode.paneType || c0.paneType || 'glass',
      glassName: targetNode.glassName || c0.glassName,
      glassThickness: targetNode.glassThickness || c0.glassThickness,
      hasLock: sashHasHandle,
      handleHeight: sashHasHandle ? Math.round(clusterContainer.h / 2) : undefined,
      handleType: sashHasHandle ? targetNode.handleType || c1.handleType || 'lever' : undefined,
    };

    return {
      updatedRoot: updateNode(root, clusterContainer.id, mergedNode),
      nextSelectedId: clusterContainer.id,
    };
  }

  // 4. Ô ĐƠN LẺ CHUYỂN SANG swing_double HOẶC ĐỔI KIỂU ĐƠN
  if (!clusterContainer && (!targetNode.children || targetNode.children.length === 0)) {
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

    const sashHasHandle = ['swing_left', 'swing_right', 'tilt_turn', 'awning', 'tilt', 'tilt_down', 'sliding'].includes(newSashType);
    const updates: Partial<SceneCellNode> = {
      sashType: newSashType,
      sashLayout: undefined,
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

/**
 * Kiểm tra một ô có nằm bên trong một cánh cửa hay không (ô kính/pano con của cánh hoặc cụm đố cánh)
 */
export const isInsideSash = (root: SceneCellNode, targetId: string): boolean => {
  const findAncestors = (curr: SceneCellNode, path: SceneCellNode[]): SceneCellNode[] | null => {
    if (curr.id === targetId) return path;
    if (curr.children) {
      for (const child of curr.children) {
        const res = findAncestors(child, [...path, curr]);
        if (res) return res;
      }
    }
    return null;
  };

  const ancestors = findAncestors(root, []);
  if (!ancestors || ancestors.length === 0) return false;

  return ancestors.some(
    (a) =>
      a.splitType === 'sash_mullion' ||
      a.splitType === 'sash_pair' ||
      (Boolean(a.sashType) && a.sashType !== 'fixed')
  );
};

