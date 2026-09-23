'use client';

import React from 'react';
import {
  SceneCellNode,
  FrameShape,
  FrameConfig,
  SashConfig,
  SashCornerJoint,
  BeadCornerJoint,
  MullionInfo,
} from '../studio-types';

interface DoorCadRendererProps {
  w: number;
  h: number;
  aluminumColor: string;
  hardwareColor: string;
  frameShape: FrameShape;
  rootCell: SceneCellNode;
  selectedCellId: string | null;
  onSelectCell: (cellId: string | null) => void;
  onSelectMullion?: (mullion: MullionInfo) => void;
  selectedMullionId?: string | null;
  onEditDimension?: (target: 'w' | 'h' | 'cell', cellId?: string) => void;
  frameConfig?: FrameConfig;
  sashConfig?: SashConfig;
}

interface LeafCell {
  node: SceneCellNode;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface MullionBar {
  x: number;
  y: number;
  w: number;
  h: number;
  info: MullionInfo;
}

interface FrameBox {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export const DoorCadRenderer: React.FC<DoorCadRendererProps> = ({
  w,
  h,
  aluminumColor,
  hardwareColor,
  frameShape,
  rootCell,
  selectedCellId,
  selectedMullionId,
  onSelectCell,
  onSelectMullion,
  onEditDimension,
  frameConfig,
  sashConfig,
}) => {
  const vbW = 500;
  const vbH = 500;
  const scale = Math.min(270 / w, 270 / h);

  const ox = 55;
  const oy = 35;
  const fw = Math.round(w * scale);
  const fh = Math.round(h * scale);
  const frameD = Math.max(9, Math.round(48 * scale));

  // Tùy biến cánh Slim vs Standard
  const isSlim = sashConfig?.sashStyle === 'slim';
  const sashD = isSlim
    ? Math.max(4, Math.round(20 * scale))
    : Math.max(8, Math.round(48 * scale));
  const sashJoint: SashCornerJoint = sashConfig?.cornerJoint ?? '45';
  const beadJoint: BeadCornerJoint = sashConfig?.beadCornerJoint ?? '45';

  const mullionT = Math.max(6, Math.round(36 * scale));

  // Extract vertical slices anywhere in tree (including double sashes)
  const getVerticalSlices = (node: SceneCellNode): { id: string; w: number }[] => {
    // 1. If this node has explicit vertical split children
    if (node.splitDirection === 'vertical' && node.children && node.children.length > 1) {
      const result: { id: string; w: number }[] = [];
      for (const c of node.children) {
        if (c.sashType === 'swing_double') {
          const half = Math.round(c.w / 2);
          result.push({ id: c.id, w: half });
          result.push({ id: c.id, w: c.w - half });
        } else {
          result.push({ id: c.id, w: c.w });
        }
      }
      return result;
    }

    // 2. If this node itself is a double sash (swing_double)
    if (node.sashType === 'swing_double') {
      const half = Math.round(node.w / 2);
      return [
        { id: node.id, w: half },
        { id: node.id, w: node.w - half },
      ];
    }

    // 3. Check inside children (e.g. horizontal split whose child is double sash or has vertical split)
    if (node.children) {
      for (const c of node.children) {
        const found = getVerticalSlices(c);
        if (found.length > 1) return found;
      }
    }

    return [];
  };

  // Extract horizontal slices anywhere in tree
  const getHorizontalSlices = (node: SceneCellNode): SceneCellNode[] => {
    if (node.splitDirection === 'horizontal' && node.children && node.children.length > 1) {
      return node.children;
    }
    if (node.children) {
      for (const c of node.children) {
        const found = getHorizontalSlices(c);
        if (found.length > 0) return found;
      }
    }
    return [];
  };

  const frames: FrameBox[] = [];
  const mullions: MullionBar[] = [];
  const leaves: LeafCell[] = [];

  // Recursive Tree Traverser: Handles both Coupling (Tách khung) and Mullion (Chia đố)
  const traverseTree = (
    node: SceneCellNode,
    x: number,
    y: number,
    wBox: number,
    hBox: number,
    isFrameUnit: boolean
  ) => {
    // 1. Frame Coupling: Each child is an independent frame unit (Ảnh 1)
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
        const ch = isVert ? hBox : (isLast ? hBox - cur : Math.round(hBox * ratio));
        const cx = isVert ? x + cur : x;
        const cy = isVert ? y : y + cur;

        traverseTree(child, cx, cy, cw, ch, true);
        cur += isVert ? cw : ch;
      });
      return;
    }

    // 2. Independent Frame Container: Push mitered frame
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

    // 3. Mullion Division (Đố T 90° - Ảnh 2 & 3)
    if (node.children && node.children.length > 0) {
      const isVert = node.splitDirection === 'vertical';
      const count = node.children.length;
      const totalMullions = (count - 1) * mullionT;
      const availSpace = Math.max(10, (isVert ? innerW : innerH) - totalMullions);
      const totalWeight = node.children.reduce((sum, c) => sum + ((isVert ? c.w : c.h) || 1), 0);

      let cur = 0;
      node.children.forEach((child, idx) => {
        const isLast = idx === count - 1;
        const weight = (isVert ? child.w : child.h) || 1;
        const ratio = totalWeight > 0 ? weight / totalWeight : 1 / count;

        const childSpan = isLast ? availSpace - cur : Math.round(availSpace * ratio);
        const cw = isVert ? childSpan : innerW;
        const ch = isVert ? innerH : childSpan;
        const cx = isVert ? innerX + cur : innerX;
        const cy = isVert ? innerY : innerY + cur;

        traverseTree(child, cx, cy, cw, ch, false);
        cur += isVert ? cw : ch;

        if (idx < count - 1) {
          const nextChild = node.children?.[idx + 1];
          const mullionInfo: MullionInfo = {
            id: `${node.id}-mullion-${idx}`,
            parentNodeId: node.id,
            mullionIndex: idx,
            direction: isVert ? 'vertical' : 'horizontal',
            childId: child.id,
            nextChildId: nextChild?.id,
            dimension: isVert ? child.w : child.h,
            totalDimension: totalWeight,
            profileId: (child as any).mullionProfileId ?? (node as any).mullionProfileId,
            cutType: (child as any).mullionCutType ?? 'inside_frame',
          };

          if (isVert) {
            mullions.push({ x: innerX + cur, y: innerY, w: mullionT, h: innerH, info: mullionInfo });
          } else {
            mullions.push({ x: innerX, y: innerY + cur, w: innerW, h: mullionT, info: mullionInfo });
          }
          cur += mullionT;
        }
      });
      return;
    }

    // 4. Leaf Cell (Pane)
    leaves.push({ node, x: innerX, y: innerY, w: innerW, h: innerH });
  };

  traverseTree(rootCell, ox, oy, fw, fh, true);

  const renderOpeningSymbol = (cx: number, cy: number, cw: number, ch: number, type: string) => {
    const stroke = '#dc2626';
    const strokeW = 1.1;

    switch (type) {
      case 'swing_left':
        return <polyline points={`${cx},${cy} ${cx + cw},${cy + ch / 2} ${cx},${cy + ch}`} fill="none" stroke={stroke} strokeWidth={strokeW} />;
      case 'swing_right':
        return <polyline points={`${cx + cw},${cy} ${cx},${cy + ch / 2} ${cx + cw},${cy + ch}`} fill="none" stroke={stroke} strokeWidth={strokeW} />;
      case 'awning':
        return <polyline points={`${cx},${cy} ${cx + cw / 2},${cy + ch} ${cx + cw},${cy}`} fill="none" stroke={stroke} strokeWidth={strokeW} />;
      case 'tilt':
        return <polyline points={`${cx},${cy + ch} ${cx + cw / 2},${cy} ${cx + cw},${cy + ch}`} fill="none" stroke={stroke} strokeWidth={strokeW} strokeDasharray="3,3" />;
      case 'tilt_down':
        return <polyline points={`${cx},${cy} ${cx + cw / 2},${cy + ch} ${cx + cw},${cy}`} fill="none" stroke={stroke} strokeWidth={strokeW} strokeDasharray="3,3" />;
      case 'tilt_turn':
        return (
          <g>
            <polyline points={`${cx},${cy} ${cx + cw},${cy + ch / 2} ${cx},${cy + ch}`} fill="none" stroke={stroke} strokeWidth={strokeW} />
            <polyline points={`${cx},${cy + ch} ${cx + cw / 2},${cy} ${cx + cw},${cy + ch}`} fill="none" stroke={stroke} strokeWidth={strokeW} strokeDasharray="3,3" />
          </g>
        );
      case 'sliding':
        return (
          <g stroke={stroke} strokeWidth={strokeW} fill="none">
            <line x1={cx + cw * 0.25} y1={cy + ch / 2} x2={cx + cw * 0.75} y2={cy + ch / 2} />
            <polyline points={`${cx + cw * 0.35},${cy + ch / 2 - 4} ${cx + cw * 0.25},${cy + ch / 2} ${cx + cw * 0.35},${cy + ch / 2 + 4}`} />
            <polyline points={`${cx + cw * 0.65},${cy + ch / 2 - 4} ${cx + cw * 0.75},${cy + ch / 2} ${cx + cw * 0.65},${cy + ch / 2 + 4}`} />
          </g>
        );
      default:
        return null;
    }
  };

  // Render Sash Frame Box with exact Sash Corner Joint (Ghép 45°, 90° Dọc phủ, 90° Ngang phủ, 45° trên - 90° dưới)
  const renderSashBox = (
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    key: string,
    joint: SashCornerJoint = '45'
  ) => {
    if (joint === '90_vert') {
      // 90° Dọc phủ: 2 thanh đứng chạy suốt từ trên xuống dưới, 2 thanh ngang lọt lòng ở giữa
      return (
        <g key={key} fill={aluminumColor} stroke="#27272a" strokeWidth="0.7">
          <rect x={sx} y={sy} width={sashD} height={sh} />
          <rect x={sx + sw - sashD} y={sy} width={sashD} height={sh} />
          <rect x={sx + sashD} y={sy} width={Math.max(0, sw - 2 * sashD)} height={sashD} />
          <rect x={sx + sashD} y={sy + sh - sashD} width={Math.max(0, sw - 2 * sashD)} height={sashD} />
        </g>
      );
    }
    if (joint === '90_horiz') {
      // 90° Ngang phủ: 2 thanh ngang trên/dưới chạy suốt, 2 thanh đứng lọt lòng ở giữa
      return (
        <g key={key} fill={aluminumColor} stroke="#27272a" strokeWidth="0.7">
          <rect x={sx} y={sy} width={sw} height={sashD} />
          <rect x={sx} y={sy + sh - sashD} width={sw} height={sashD} />
          <rect x={sx} y={sy + sashD} width={sashD} height={Math.max(0, sh - 2 * sashD)} />
          <rect x={sx + sw - sashD} y={sy + sashD} width={sashD} height={Math.max(0, sh - 2 * sashD)} />
        </g>
      );
    }
    if (joint === '45_top_90_bot') {
      // 45° trên - 90° dưới
      return (
        <g key={key} fill={aluminumColor} stroke="#27272a" strokeWidth="0.7">
          <polygon points={`${sx},${sy} ${sx + sw},${sy} ${sx + sw - sashD},${sy + sashD} ${sx + sashD},${sy + sashD}`} />
          <rect x={sx + sashD} y={sy + sh - sashD} width={Math.max(0, sw - 2 * sashD)} height={sashD} />
          <polygon points={`${sx},${sy} ${sx + sashD},${sy + sashD} ${sx + sashD},${sy + sh} ${sx},${sy + sh}`} />
          <polygon points={`${sx + sw},${sy} ${sx + sw - sashD},${sy + sashD} ${sx + sw - sashD},${sy + sh} ${sx + sw},${sy + sh}`} />
        </g>
      );
    }
    // Mặc định: Ghép 45° mòi 4 góc
    return (
      <g key={key} fill={aluminumColor} stroke="#27272a" strokeWidth="0.7">
        <polygon points={`${sx},${sy} ${sx + sw},${sy} ${sx + sw - sashD},${sy + sashD} ${sx + sashD},${sy + sashD}`} />
        <polygon points={`${sx},${sy + sh} ${sx + sw},${sy + sh} ${sx + sw - sashD},${sy + sh - sashD} ${sx + sashD},${sy + sh - sashD}`} />
        <polygon points={`${sx},${sy} ${sx + sashD},${sy + sashD} ${sx + sashD},${sy + sh - sashD} ${sx},${sy + sh}`} />
        <polygon points={`${sx + sw},${sy} ${sx + sw - sashD},${sy + sashD} ${sx + sw - sashD},${sy + sh - sashD} ${sx + sw},${sy + sh}`} />
      </g>
    );
  };

  // Render Nẹp kính lọt lòng (Bead Corner Joint)
  const renderBeadLines = (
    gx: number,
    gy: number,
    gw: number,
    gh: number,
    key: string,
    bJoint: BeadCornerJoint = '45'
  ) => {
    const bW = Math.max(2, Math.round(10 * scale));
    if (bJoint === '90_horiz') {
      return (
        <g key={key} stroke="#0ea5e9" strokeWidth="0.6" fill="none" opacity="0.65">
          <line x1={gx} y1={gy + bW} x2={gx + gw} y2={gy + bW} />
          <line x1={gx} y1={gy + gh - bW} x2={gx + gw} y2={gy + gh - bW} />
          <line x1={gx + bW} y1={gy + bW} x2={gx + bW} y2={gy + gh - bW} />
          <line x1={gx + gw - bW} y1={gy + bW} x2={gx + gw - bW} y2={gy + gh - bW} />
        </g>
      );
    }
    if (bJoint === '90_vert') {
      return (
        <g key={key} stroke="#0ea5e9" strokeWidth="0.6" fill="none" opacity="0.65">
          <line x1={gx + bW} y1={gy} x2={gx + bW} y2={gy + gh} />
          <line x1={gx + gw - bW} y1={gy} x2={gx + gw - bW} y2={gy + gh} />
          <line x1={gx + bW} y1={gy + bW} x2={gx + gw - bW} y2={gy + bW} />
          <line x1={gx + bW} y1={gy + gh - bW} x2={gx + gw - bW} y2={gy + gh - bW} />
        </g>
      );
    }
    // 45°
    return (
      <g key={key} stroke="#0ea5e9" strokeWidth="0.6" fill="none" opacity="0.65">
        <rect x={gx + bW} y={gy + bW} width={Math.max(0, gw - 2 * bW)} height={Math.max(0, gh - 2 * bW)} />
        <line x1={gx} y1={gy} x2={gx + bW} y2={gy + bW} />
        <line x1={gx + gw} y1={gy} x2={gx + gw - bW} y2={gy + bW} />
        <line x1={gx} y1={gy + gh} x2={gx + bW} y2={gy + gh - bW} />
        <line x1={gx + gw} y1={gy + gh} x2={gx + gw - bW} y2={gy + gh - bW} />
      </g>
    );
  };

  // Render Frame Box with exact Corner Joint & Open-Bottom Handling
  const renderMiteredFrame = (fx: number, fy: number, fwBox: number, fhBox: number, key: string) => {
    if (frameShape === 'round_top_2' && frames.length === 1) {
      const cr = Math.min(40, Math.round(fwBox * 0.2));
      return (
        <g key={key} fill={aluminumColor} stroke="#27272a" strokeWidth="0.8">
          <path d={`M ${fx} ${fy + fhBox} L ${fx} ${fy + cr} Q ${fx} ${fy} ${fx + cr} ${fy} L ${fx + fwBox - cr} ${fy} Q ${fx + fwBox} ${fy} ${fx + fwBox} ${fy + cr} L ${fx + fwBox} ${fy + fhBox} Z`} />
        </g>
      );
    }

    const isOpenBottom = frameConfig?.isOpenBottom ?? false;
    const cornerJoint = frameConfig?.cornerJoint ?? '45';

    // 1. Case Open-Bottom (Khung hở 3 cạnh - chạm sàn): không có thanh đáy, 2 thanh đứng chạy thẳng xuống sàn
    if (isOpenBottom) {
      if (cornerJoint === '90_horiz') {
        // Ngang trên phủ qua hai thanh đứng
        return (
          <g key={key} fill={aluminumColor} stroke="#27272a" strokeWidth="0.8">
            {/* Top Bar (Full width) */}
            <rect x={fx} y={fy} width={fwBox} height={frameD} />
            {/* Left Bar (from top bar to ground) */}
            <rect x={fx} y={fy + frameD} width={frameD} height={fhBox - frameD} />
            {/* Right Bar (from top bar to ground) */}
            <rect x={fx + fwBox - frameD} y={fy + frameD} width={frameD} height={fhBox - frameD} />
          </g>
        );
      }
      if (cornerJoint === '90_vert') {
        // Dọc hai bên phủ kịch trần, ngang trên lọt lòng
        return (
          <g key={key} fill={aluminumColor} stroke="#27272a" strokeWidth="0.8">
            {/* Left Bar (Full height) */}
            <rect x={fx} y={fy} width={frameD} height={fhBox} />
            {/* Right Bar (Full height) */}
            <rect x={fx + fwBox - frameD} y={fy} width={frameD} height={fhBox} />
            {/* Top Bar (Between uprights) */}
            <rect x={fx + frameD} y={fy} width={fwBox - 2 * frameD} height={frameD} />
          </g>
        );
      }
      // Miter 45° top corners, 90° straight bottom
      return (
        <g key={key} fill={aluminumColor} stroke="#27272a" strokeWidth="0.8" strokeLinejoin="miter">
          {/* Top Bar (45° miters on top ends) */}
          <polygon points={`${fx},${fy} ${fx + fwBox},${fy} ${fx + fwBox - frameD},${fy + frameD} ${fx + frameD},${fy + frameD}`} />
          {/* Left Bar (45° at top, 90° flat at bottom) */}
          <polygon points={`${fx},${fy} ${fx + frameD},${fy + frameD} ${fx + frameD},${fy + fhBox} ${fx},${fy + fhBox}`} />
          {/* Right Bar (45° at top, 90° flat at bottom) */}
          <polygon points={`${fx + fwBox},${fy} ${fx + fwBox - frameD},${fy + frameD} ${fx + fwBox - frameD},${fy + fhBox} ${fx + fwBox},${fy + fhBox}`} />
        </g>
      );
    }

    // 2. Case 4-sided: 90° Horizontal Overlap (Ngang phủ)
    if (cornerJoint === '90_horiz') {
      return (
        <g key={key} fill={aluminumColor} stroke="#27272a" strokeWidth="0.8">
          <rect x={fx} y={fy} width={fwBox} height={frameD} />
          <rect x={fx} y={fy + fhBox - frameD} width={fwBox} height={frameD} />
          <rect x={fx} y={fy + frameD} width={frameD} height={fhBox - 2 * frameD} />
          <rect x={fx + fwBox - frameD} y={fy + frameD} width={frameD} height={fhBox - 2 * frameD} />
        </g>
      );
    }

    // 3. Case 4-sided: 90° Vertical Overlap (Dọc phủ)
    if (cornerJoint === '90_vert') {
      return (
        <g key={key} fill={aluminumColor} stroke="#27272a" strokeWidth="0.8">
          <rect x={fx} y={fy} width={frameD} height={fhBox} />
          <rect x={fx + fwBox - frameD} y={fy} width={frameD} height={fhBox} />
          <rect x={fx + frameD} y={fy} width={fwBox - 2 * frameD} height={frameD} />
          <rect x={fx + frameD} y={fy + fhBox - frameD} width={fwBox - 2 * frameD} height={frameD} />
        </g>
      );
    }

    // 4. Case 4-sided: 45° Top, 90° Bottom
    if (cornerJoint === '45_top_90_bot') {
      return (
        <g key={key} fill={aluminumColor} stroke="#27272a" strokeWidth="0.8" strokeLinejoin="miter">
          <polygon points={`${fx},${fy} ${fx + fwBox},${fy} ${fx + fwBox - frameD},${fy + frameD} ${fx + frameD},${fy + frameD}`} />
          <rect x={fx} y={fy + fhBox - frameD} width={fwBox} height={frameD} />
          <polygon points={`${fx},${fy} ${fx + frameD},${fy + frameD} ${fx + frameD},${fy + fhBox - frameD} ${fx},${fy + fhBox - frameD}`} />
          <polygon points={`${fx + fwBox},${fy} ${fx + fwBox - frameD},${fy + frameD} ${fx + fwBox - frameD},${fy + fhBox - frameD} ${fx + fwBox},${fy + fhBox - frameD}`} />
        </g>
      );
    }

    // 5. Standard 45° Miter All Corners
    return (
      <g key={key} fill={aluminumColor} stroke="#27272a" strokeWidth="0.8" strokeLinejoin="miter">
        <polygon points={`${fx},${fy} ${fx + fwBox},${fy} ${fx + fwBox - frameD},${fy + frameD} ${fx + frameD},${fy + frameD}`} />
        <polygon points={`${fx},${fy + fhBox} ${fx + fwBox},${fy + fhBox} ${fx + fwBox - frameD},${fy + fhBox - frameD} ${fx + frameD},${fy + fhBox - frameD}`} />
        <polygon points={`${fx},${fy} ${fx + frameD},${fy + frameD} ${fx + frameD},${fy + fhBox - frameD} ${fx},${fy + fhBox}`} />
        <polygon points={`${fx + fwBox},${fy} ${fx + fwBox - frameD},${fy + frameD} ${fx + fwBox - frameD},${fy + fhBox - frameD} ${fx + fwBox},${fy + fhBox}`} />
      </g>
    );
  };

  // Dimensions positioning (Crisp CAD Style)
  const vertSlices = getVerticalSlices(rootCell);
  const horizSlices = getHorizontalSlices(rootCell);

  const hasVertSubDims = vertSlices.length > 1;
  const hasHorizSubDims = horizSlices.length > 1;

  const dimSubBotY = oy + fh + 20;
  const dimBotY = oy + fh + (hasVertSubDims ? 44 : 26);
  const dimSubRightX = ox + fw + 20;
  const dimRightX = ox + fw + (hasHorizSubDims ? 44 : 26);

  return (
    <svg
      viewBox={`0 0 ${vbW} ${vbH}`}
      className="w-full h-full select-none"
      shapeRendering="geometricPrecision"
      textRendering="geometricPrecision"
      onClick={() => onSelectCell(null)}
    >
      <defs>
        <pattern id="screen-mesh" width="4" height="4" patternUnits="userSpaceOnUse">
          <path d="M 0 2 L 4 2 M 2 0 L 2 4" stroke="#94a3b8" strokeWidth="0.5" />
        </pattern>
        <pattern id="louver-pattern" width="10" height="8" patternUnits="userSpaceOnUse">
          <line x1="0" y1="4" x2="10" y2="4" stroke="#64748b" strokeWidth="1.2" />
        </pattern>
      </defs>

      {/* 1. Mitered Frames: 1 outer frame OR multiple coupled frames with 45° corners */}
      {frames.map((fb) => renderMiteredFrame(fb.x, fb.y, fb.w, fb.h, fb.id))}

      {/* 2. Physical Mullion Bars (Đố T 90° chia ô ngang hoặc dọc - Ảnh 2 & 3) */}
      {mullions.map((m, idx) => {
        const isHoveredOrSelected = selectedMullionId === m.info.id;
        return (
          <g
            key={idx}
            className="cursor-pointer group"
            onClick={(e) => {
              e.stopPropagation();
              onSelectMullion?.(m.info);
            }}
          >
            {/* Hitbox mở rộng để người dùng dễ bấm trúng thanh đố mảnh */}
            <rect
              x={m.info.direction === 'vertical' ? m.x - 6 : m.x}
              y={m.info.direction === 'horizontal' ? m.y - 6 : m.y}
              width={m.info.direction === 'vertical' ? m.w + 12 : m.w}
              height={m.info.direction === 'horizontal' ? m.h + 12 : m.h}
              fill="transparent"
            />
            {/* Thanh đố thực tế */}
            <rect
              x={m.x}
              y={m.y}
              width={m.w}
              height={m.h}
              fill={isHoveredOrSelected ? '#f59e0b' : aluminumColor}
              stroke={isHoveredOrSelected ? '#b45309' : '#27272a'}
              strokeWidth={isHoveredOrSelected ? 1.5 : 0.7}
              className="transition-all duration-150 group-hover:fill-amber-500 group-hover:stroke-amber-700"
            />
          </g>
        );
      })}

      {/* 3. Leaf Cells: Glass + Sash + Opening Symbols */}
      {leaves.map(({ node, x: cx, y: cy, w: cw, h: ch }) => {
        const isSelected = selectedCellId === node.id;
        const isFixed = node.sashType === 'fixed';
        const isDouble = node.sashType === 'swing_double';

        return (
          <g
            key={node.id}
            onClick={(e) => {
              e.stopPropagation();
              onSelectCell(node.id);
            }}
            className="cursor-pointer"
          >
            {/* Case A: 2 cánh mở quay đối xứng (swing_double) */}
            {isDouble ? (
              (() => {
                const astW = Math.max(4, Math.round(mullionT * 0.8));
                const sW = Math.round((cw - astW) / 2);
                const s1X = cx;
                const s2X = cx + sW + astW;
                const pane1W = Math.max(4, sW - 2 * sashD);
                const pane2W = Math.max(4, sW - 2 * sashD);
                const paneH = Math.max(4, ch - 2 * sashD);

                return (
                  <g>
                    {/* Cánh trái */}
                    {renderSashBox(s1X, cy, sW, ch, `${node.id}-sash-1`, sashJoint)}
                    <rect x={s1X + sashD} y={cy + sashD} width={pane1W} height={paneH} fill="#b2f5ea" fillOpacity={0.8} stroke="#5eead4" strokeWidth="0.5" />
                    {renderBeadLines(s1X + sashD, cy + sashD, pane1W, paneH, `${node.id}-bead-1`, beadJoint)}
                    {renderOpeningSymbol(s1X + sashD, cy + sashD, pane1W, paneH, 'swing_left')}

                    {/* Đố động giữa 2 cánh */}
                    <rect x={cx + sW} y={cy} width={astW} height={ch} fill={aluminumColor} stroke="#27272a" strokeWidth="0.7" />

                    {/* Cánh phải */}
                    {renderSashBox(s2X, cy, sW, ch, `${node.id}-sash-2`, sashJoint)}
                    <rect x={s2X + sashD} y={cy + sashD} width={pane2W} height={paneH} fill="#b2f5ea" fillOpacity={0.8} stroke="#5eead4" strokeWidth="0.5" />
                    {renderBeadLines(s2X + sashD, cy + sashD, pane2W, paneH, `${node.id}-bead-2`, beadJoint)}
                    {renderOpeningSymbol(s2X + sashD, cy + sashD, pane2W, paneH, 'swing_right')}

                    <rect x={cx + sW + astW / 2 - 2} y={cy + ch / 2 - 8} width={4} height={16} rx={2} fill={hardwareColor} stroke="#000" strokeWidth="0.5" />
                  </g>
                );
              })()
            ) : (
              /* Case B: Single sash or fixed pane */
              (() => {
                const innerX = isFixed ? cx : cx + sashD;
                const innerY = isFixed ? cy : cy + sashD;
                const innerW = Math.max(4, isFixed ? cw : cw - 2 * sashD);
                const innerH = Math.max(4, isFixed ? ch : ch - 2 * sashD);

                return (
                  <g>
                    {!isFixed && renderSashBox(cx, cy, cw, ch, `${node.id}-sash-single`, sashJoint)}

                    <rect
                      x={innerX}
                      y={innerY}
                      width={innerW}
                      height={innerH}
                      fill={
                        node.paneType === 'screen'
                          ? 'url(#screen-mesh)'
                          : node.paneType === 'louver'
                          ? 'url(#louver-pattern)'
                          : node.paneType === 'panel'
                          ? aluminumColor
                          : '#b2f5ea'
                      }
                      fillOpacity={node.paneType === 'glass' ? 0.8 : 0.95}
                      stroke="#5eead4"
                      strokeWidth="0.5"
                    />

                    {/* Nẹp kính lọt lòng */}
                    {renderBeadLines(innerX, innerY, innerW, innerH, `${node.id}-bead`, beadJoint)}

                    {!isFixed && renderOpeningSymbol(innerX, innerY, innerW, innerH, node.sashType)}

                    {/* Hardware Handle */}
                    {!isFixed && (() => {
                      const isBottomHandle = node.sashType === 'awning' || node.sashType === 'tilt';
                      const isTopHandle = node.sashType === 'tilt_down';
                      const isRightHandle = node.sashType === 'swing_left' || node.sashType === 'tilt_turn';
                      const isLeftHandle = node.sashType === 'swing_right';

                      if (isBottomHandle) {
                        return (
                          <rect
                            x={cx + cw / 2 - 10}
                            y={cy + ch - sashD / 2 - 2}
                            width={20}
                            height={4}
                            rx={1.5}
                            fill={hardwareColor}
                            stroke="#000"
                            strokeWidth="0.5"
                          />
                        );
                      }

                      if (isTopHandle) {
                        return (
                          <rect
                            x={cx + cw / 2 - 10}
                            y={cy + sashD / 2 - 2}
                            width={20}
                            height={4}
                            rx={1.5}
                            fill={hardwareColor}
                            stroke="#000"
                            strokeWidth="0.5"
                          />
                        );
                      }

                      if (isRightHandle) {
                        return (
                          <rect
                            x={cx + cw - sashD / 2 - 2}
                            y={cy + ch / 2 - 10}
                            width={4}
                            height={20}
                            rx={1.5}
                            fill={hardwareColor}
                            stroke="#000"
                            strokeWidth="0.5"
                          />
                        );
                      }

                      if (isLeftHandle) {
                        return (
                          <rect
                            x={cx + sashD / 2 - 2}
                            y={cy + ch / 2 - 10}
                            width={4}
                            height={20}
                            rx={1.5}
                            fill={hardwareColor}
                            stroke="#000"
                            strokeWidth="0.5"
                          />
                        );
                      }

                      return null;
                    })()}
                  </g>
                );
              })()
            )}

            {/* Selection Outline */}
            {isSelected && (
              <rect x={cx + 1} y={cy + 1} width={cw - 2} height={ch - 2} fill="none" stroke="#2563eb" strokeWidth="2" strokeDasharray="4,3" />
            )}
          </g>
        );
      })}

      {/* 4. Sub-Dimension Lines (Bottom: khi có bất kỳ chia dọc nào) */}
      {hasVertSubDims && (
        <g stroke="#2563eb" strokeWidth="0.8">
          {(() => {
            const totalW = vertSlices.reduce((sum, s) => sum + s.w, 0) || w;
            let accumW = 0;
            return vertSlices.map((child, idx) => {
              const isLast = idx === vertSlices.length - 1;
              const childWScale = isLast ? fw - accumW : Math.round((child.w / totalW) * fw);
              const curX = ox + accumW;
              accumW += childWScale;

              return (
                <g key={idx}>
                  <line x1={curX} y1={oy + fh} x2={curX} y2={dimSubBotY} strokeDasharray="2,2" />
                  <line x1={curX + childWScale} y1={oy + fh} x2={curX + childWScale} y2={dimSubBotY} strokeDasharray="2,2" />
                  <line x1={curX} y1={dimSubBotY} x2={curX + childWScale} y2={dimSubBotY} strokeWidth="0.9" />
                  <circle cx={curX} cy={dimSubBotY} r={2} fill="#2563eb" />
                  <circle cx={curX + childWScale} cy={dimSubBotY} r={2} fill="#2563eb" />
                  <text
                    x={curX + childWScale / 2}
                    y={dimSubBotY - 3}
                    textAnchor="middle"
                    fontSize="9.5"
                    fill="#1e40af"
                    fontFamily="system-ui, sans-serif"
                    fontWeight="700"
                    paintOrder="stroke"
                    stroke="#ffffff"
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                    className="cursor-pointer hover:fill-red-600 hover:font-bold"
                    onClick={() => onEditDimension?.('cell', child.id)}
                  >
                    {child.w}
                  </text>
                </g>
              );
            });
          })()}
        </g>
      )}

      {/* 5. Sub-Dimension Lines (Right: khi có bất kỳ chia ngang nào) */}
      {hasHorizSubDims && (
        <g stroke="#2563eb" strokeWidth="0.8">
          {(() => {
            let accumH = 0;
            return horizSlices.map((child, idx) => {
              const childHScale = Math.round((child.h / h) * fh);
              const curY = oy + accumH;
              accumH += childHScale;

              return (
                <g key={idx}>
                  <line x1={ox + fw} y1={curY} x2={dimSubRightX} y2={curY} strokeDasharray="2,2" />
                  <line x1={ox + fw} y1={curY + childHScale} x2={dimSubRightX} y2={curY + childHScale} strokeDasharray="2,2" />
                  <line x1={dimSubRightX} y1={curY} x2={dimSubRightX} y2={curY + childHScale} strokeWidth="0.9" />
                  <circle cx={dimSubRightX} cy={curY} r={2} fill="#2563eb" />
                  <circle cx={dimSubRightX} cy={curY + childHScale} r={2} fill="#2563eb" />
                  <text
                    x={dimSubRightX - 3}
                    y={curY + childHScale / 2}
                    fontSize="9.5"
                    fill="#1e40af"
                    fontFamily="system-ui, sans-serif"
                    fontWeight="700"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    paintOrder="stroke"
                    stroke="#ffffff"
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                    transform={`rotate(-90, ${dimSubRightX - 3}, ${curY + childHScale / 2})`}
                    className="cursor-pointer hover:fill-red-600 hover:font-bold"
                    onClick={() => onEditDimension?.('cell', child.id)}
                  >
                    {child.h}
                  </text>
                </g>
              );
            });
          })()}
        </g>
      )}

      {/* 6. Total Width Dimension (Bottom: W) */}
      <g stroke="#2563eb" strokeWidth="0.8">
        <line x1={ox} y1={oy + fh} x2={ox} y2={dimBotY} strokeDasharray="2,2" />
        <line x1={ox + fw} y1={oy + fh} x2={ox + fw} y2={dimBotY} strokeDasharray="2,2" />
        <line x1={ox} y1={dimBotY} x2={ox + fw} y2={dimBotY} strokeWidth="1" />
        <circle cx={ox} cy={dimBotY} r={2.2} fill="#2563eb" />
        <circle cx={ox + fw} cy={dimBotY} r={2.2} fill="#2563eb" />
        <text
          x={ox + fw / 2}
          y={dimBotY - 4}
          textAnchor="middle"
          fontSize="10.5"
          fill="#1e40af"
          fontFamily="system-ui, sans-serif"
          fontWeight="800"
          paintOrder="stroke"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinejoin="round"
          className="cursor-pointer hover:fill-red-600 hover:font-bold"
          onClick={() => onEditDimension?.('w')}
        >
          {w}
        </text>
      </g>

      {/* 7. Total Height Dimension (Right: H) */}
      <g stroke="#2563eb" strokeWidth="0.8">
        <line x1={ox + fw} y1={oy} x2={dimRightX} y2={oy} strokeDasharray="2,2" />
        <line x1={ox + fw} y1={oy + fh} x2={dimRightX} y2={oy + fh} strokeDasharray="2,2" />
        <line x1={dimRightX} y1={oy} x2={dimRightX} y2={oy + fh} strokeWidth="1" />
        <circle cx={dimRightX} cy={oy} r={2.2} fill="#2563eb" />
        <circle cx={dimRightX} cy={oy + fh} r={2.2} fill="#2563eb" />
        <text
          x={dimRightX - 4}
          y={oy + fh / 2}
          fontSize="10.5"
          fill="#1e40af"
          fontFamily="system-ui, sans-serif"
          fontWeight="800"
          textAnchor="middle"
          dominantBaseline="middle"
          paintOrder="stroke"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinejoin="round"
          transform={`rotate(-90, ${dimRightX - 4}, ${oy + fh / 2})`}
          className="cursor-pointer hover:fill-red-600 hover:font-bold"
          onClick={() => onEditDimension?.('h')}
        >
          {h}
        </text>
      </g>
    </svg>
  );
};
