import { MullionInfo, SceneCellNode } from '../studio-types';
import { renderCadBead, CadBeadResult } from './components/cad-bead';
import { CadRect } from './cad-leaf-geometry';

export interface SashSubPane {
  id: string;
  node: SceneCellNode;
  /** Ô chứa nẹp + kính (trước khi trừ nẹp) */
  x: number;
  y: number;
  w: number;
  h: number;
  bead: CadBeadResult;
  /** Vùng lòng kính (sau khi trừ nẹp) */
  gx: number;
  gy: number;
  gw: number;
  gh: number;
  paneFill: string;
  paneOpacity: number;
}

export interface SashMullionBarItem {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Thông tin đố (chỉ có với đố thuộc cây chia `sash_mullion`; đố phẳng cũ không có) */
  info?: MullionInfo;
}

export interface SashSubPaneLayout {
  subPanes: SashSubPane[];
  mullionBars: SashMullionBarItem[];
}

export interface SashSubPaneParams {
  node: SceneCellNode;
  /** Lòng trong của cánh (hoặc ô Fix) — lấy từ `resolveLeafGeometry().inner` */
  inner: CadRect;
  isFixed: boolean;
  /** Bản rộng đố cánh (px) */
  mullionThickness: number;
  /** Bản rộng nẹp kính (px) */
  beadWidth: number;
  aluminumColor: string;
}

const resolvePaneFill = (paneType: SceneCellNode['paneType'], aluminumColor: string): string => {
  if (paneType === 'screen') return 'url(#screen-mesh)';
  if (paneType === 'louver') return 'url(#louver-pattern)';
  if (paneType === 'panel') return aluminumColor;
  return '#b2f5ea';
};

const getNodeWeight = (child: SceneCellNode, isVertical: boolean): number => (isVertical ? child.w : child.h) || 1;

/**
 * Chia lòng cánh thành các ô kính con + đố cánh (cây `sash_mullion` hoặc `sashMullions` phẳng cũ).
 * Hàm thuần dùng chung cho hình vẽ cánh và danh sách đố tương tác, để hai bên khớp tuyệt đối.
 */
export const buildSashSubPanes = (params: SashSubPaneParams): SashSubPaneLayout => {
  const { node, inner, isFixed, mullionThickness, beadWidth, aluminumColor } = params;
  const beadJoint = node.beadJoint || '90';
  const subPanes: SashSubPane[] = [];
  const mullionBars: SashMullionBarItem[] = [];

  const pushPane = (id: string, paneNode: SceneCellNode, rect: CadRect, beadKey: string) => {
    const bead = renderCadBead(rect.x, rect.y, rect.w, rect.h, beadKey, aluminumColor, beadWidth, beadJoint);
    subPanes.push({
      id,
      node: paneNode,
      ...rect,
      bead,
      gx: bead.gx2,
      gy: bead.gy2,
      gw: bead.gw2,
      gh: bead.gh2,
      paneFill: resolvePaneFill(paneNode.paneType, aluminumColor),
      paneOpacity: paneNode.paneType === 'glass' ? 0.85 : 0.95,
    });
  };

  const traverseSashTree = (currNode: SceneCellNode, box: CadRect) => {
    const children = currNode.children;
    if (!children || children.length === 0 || currNode.splitType !== 'sash_mullion') {
      pushPane(currNode.id, currNode, box, `${currNode.id}-bead`);
      return;
    }

    const isVertical = currNode.splitDirection === 'vertical';
    const count = children.length;
    const availSpace = Math.max(10, (isVertical ? box.w : box.h) - (count - 1) * mullionThickness);
    const totalWeight = children.reduce((sum, child) => sum + getNodeWeight(child, isVertical), 0);

    let cursor = 0;
    let usedSpan = 0;
    children.forEach((child, idx) => {
      const isLast = idx === count - 1;
      const ratio = totalWeight > 0 ? getNodeWeight(child, isVertical) / totalWeight : 1 / count;
      const span = isLast ? availSpace - usedSpan : availSpace * ratio;
      const childBox: CadRect = isVertical
        ? { x: box.x + cursor, y: box.y, w: span, h: box.h }
        : { x: box.x, y: box.y + cursor, w: box.w, h: span };

      traverseSashTree(child, childBox);
      cursor += span;
      usedSpan += span;
      if (isLast) return;

      const nextChild = children[idx + 1];
      const childDim = getNodeWeight(child, isVertical);
      mullionBars.push({
        id: `${currNode.id}-sm-${idx}`,
        x: isVertical ? box.x + cursor : box.x,
        y: isVertical ? box.y : box.y + cursor,
        w: isVertical ? mullionThickness : box.w,
        h: isVertical ? box.h : mullionThickness,
        info: {
          id: `${currNode.id}-sm-${idx}`,
          parentNodeId: currNode.id,
          mullionIndex: idx,
          direction: isVertical ? 'vertical' : 'horizontal',
          childId: child.id,
          nextChildId: nextChild.id,
          dimension: childDim,
          totalDimension: childDim + getNodeWeight(nextChild, isVertical),
          cutType: 'inside_frame',
        },
      });
      cursor += mullionThickness;
    });
  };

  const traverseFlatMullions = () => {
    const count = node.sashMullions?.count ?? 1;
    const isVertical = (node.sashMullions?.direction || 'vertical') === 'vertical';
    const positions = node.sashMullions?.positions;
    const hasPositions = Boolean(positions && positions.length === count);
    const totalPos = hasPositions && positions ? positions.reduce((sum, pos) => sum + pos, 0) : count;
    const availSpan = Math.max(10, (isVertical ? inner.w : inner.h) - (count - 1) * mullionThickness);

    let cursor = isVertical ? inner.x : inner.y;
    let usedSpan = 0;
    for (let idx = 0; idx < count; idx++) {
      const isLast = idx === count - 1;
      const ratio = hasPositions && positions ? positions[idx] / totalPos : 1 / count;
      const span = isLast ? availSpan - usedSpan : availSpan * ratio;
      usedSpan += span;
      const paneBox: CadRect = isVertical
        ? { x: cursor, y: inner.y, w: span, h: inner.h }
        : { x: inner.x, y: cursor, w: inner.w, h: span };
      pushPane(`${node.id}-sm-${idx}`, node, paneBox, `${node.id}-sm-bead-${idx}`);

      if (idx < count - 1) {
        mullionBars.push({
          id: `${node.id}-sm-bar-${idx}`,
          x: isVertical ? cursor + span : inner.x,
          y: isVertical ? inner.y : cursor + span,
          w: isVertical ? mullionThickness : inner.w,
          h: isVertical ? inner.h : mullionThickness,
        });
      }
      cursor += span + mullionThickness;
    }
  };

  const hasSashTree = Boolean(node.children && node.children.length > 0 && node.splitType === 'sash_mullion');
  const hasFlatMullions = !isFixed && Boolean(node.sashMullions && node.sashMullions.count > 1);

  if (hasSashTree) {
    traverseSashTree(node, inner);
  } else if (hasFlatMullions) {
    traverseFlatMullions();
  } else {
    pushPane(node.id, node, inner, `${node.id}-bead`);
  }

  return { subPanes, mullionBars };
};
