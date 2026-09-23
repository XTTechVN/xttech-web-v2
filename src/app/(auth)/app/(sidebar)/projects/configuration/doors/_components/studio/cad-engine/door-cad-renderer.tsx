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
  id?: string;
  hideDimensions?: boolean;
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
  onEditDimension?: (target: 'w' | 'h' | 'cell' | 'handleHeight', cellId?: string) => void;
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
  id,
  hideDimensions = false,
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
  // Aspect ratio của bộ cửa thực tế
  const aspect = w / (h || 1);

  // ViewBox thích ứng theo tỉ lệ kích thước cửa:
  // Cửa rộng ngang (aspect >= 1.25) -> mở rộng vbW tới 780px
  // Cửa cao đứng (aspect <= 0.8) -> mở rộng vbH tới 680px
  // Cửa thông thường -> 540 x 500
  // Nếu hideDimensions (dùng cho thumbnail) -> 400 x 400 cân đối
  const vbW = hideDimensions ? 400 : aspect >= 1.25 ? Math.min(780, Math.max(540, Math.round(520 * Math.sqrt(aspect / 1.1)))) : 540;
  const vbH = hideDimensions ? 400 : aspect <= 0.8 ? Math.min(680, Math.max(500, Math.round(500 * Math.sqrt(0.9 / aspect)))) : 500;

  // Vùng vẽ tối đa dành cho khung cửa (chừa lề cho thước đo)
  const availW = hideDimensions ? vbW - 16 : vbW - 110;
  const availH = hideDimensions ? vbH - 16 : vbH - 95;
  const scale = Math.min(availW / w, availH / h);

  const fw = Math.round(w * scale);
  const fh = Math.round(h * scale);

  // Căn giữa cửa trong viewBox
  const ox = hideDimensions ? Math.round((vbW - fw) / 2) : Math.round((vbW - 55 - fw) / 2) + 20;
  const oy = hideDimensions ? Math.round((vbH - fh) / 2) : Math.round((vbH - 50 - fh) / 2) + 10;
  const frameD = Math.max(5, Math.min(18, Math.round(32 * scale)));

  const isSlim = sashConfig?.sashStyle === 'slim';
  const sashD = isSlim
    ? Math.max(4, Math.round(frameD * 0.5))
    : Math.max(9, Math.round(frameD * 1.6));
  const beadW = isSlim
    ? Math.max(2, Math.round(sashD * 0.2))
    : Math.max(2, Math.round(sashD * 0.24));
  const sashJoint: SashCornerJoint = sashConfig?.cornerJoint ?? '45';

  const mullionT = Math.max(4, Math.min(12, Math.round(36 * scale)));

  // Hàm tính độ dày khung cánh thích ứng động theo kích thước từng ô cánh (tránh díu dít khi chia nhiều cánh)
  const getAdaptiveSashD = (cellW: number, cellH: number, isDoubleChild = false, isSliding = false) => {
    // Khung nhôm 2 bên không bao giờ được chiếm quá 32% bề rộng ô cánh (mỗi bên tối đa 16%)
    const ratioW = isSliding ? 0.12 : isDoubleChild ? 0.14 : 0.16;
    const maxAllowedW = Math.max(3, Math.floor(cellW * ratioW));
    const maxAllowedH = Math.max(3, Math.floor(cellH * 0.15));
    const maxAllowed = Math.min(maxAllowedW, maxAllowedH);

    const candidate = isSliding ? Math.round(sashD * 0.75) : sashD;
    return Math.max(3, Math.min(candidate, maxAllowed));
  };

  // Extract vertical slices anywhere in tree (including double sashes and recursive vertical splits)
  const getVerticalSlices = (node: SceneCellNode): { id: string; w: number }[] => {
    // 1. If this node has vertical split children or coupling vertical split
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

    // 2. If this node is split horizontally, find the horizontal partition with the most vertical divisions
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

    // 3. If this node itself is a double sash (swing_double)
    if (node.sashType === 'swing_double') {
      const half = Math.round(node.w / 2);
      return [
        { id: node.id, w: half },
        { id: node.id, w: node.w - half },
      ];
    }

    // 4. Check inside children for any vertical partitions
    if (node.children) {
      for (const c of node.children) {
        const found = getVerticalSlices(c);
        if (found.length > 1) return found;
      }
    }

    return [];
  };

  // Extract horizontal slices anywhere in tree (including recursive horizontal splits)
  const getHorizontalSlices = (node: SceneCellNode): SceneCellNode[] => {
    // 1. If this node has horizontal split children
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

    // 2. If this node is split vertically, find the vertical partition with the most horizontal divisions
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

    // 3. Mullion Division (Đố T 90°) hoặc Sash Pair (Cặp cánh mở quay không đố tĩnh)
    if (node.children && node.children.length > 0) {
      const isVert = node.splitDirection === 'vertical';
      const count = node.children.length;

      // Kiểm tra giữa 2 ô con có thanh đố tĩnh (mullion) không:
      // - Cửa đi / cửa sổ 2 cánh mở quay đối xứng (swing_left và swing_right khép vào nhau):
      //   KHÔNG CÓ đố tĩnh ở giữa, 2 cánh giáp trực tiếp bằng đố động chuẩn kỹ thuật thực tế.
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

      // cur: con trỏ định vị (bao gồm cả child span + mullion gap thực tế)
      // spanCur: chỉ cộng child span, dùng cho isLast để không bị "nhấp" mullionT
      let cur = 0;
      let spanCur = 0;
      node.children.forEach((child, idx) => {
        const isLast = idx === count - 1;
        const weight = (isVert ? child.w : child.h) || 1;
        const ratio = totalWeight > 0 ? weight / totalWeight : 1 / count;

        // isLast dùng spanCur (không có mullion offset) để lấp đầy chính xác availSpace
        const childSpan = isLast ? availSpace - spanCur : Math.round(availSpace * ratio);
        const cw = isVert ? childSpan : innerW;
        const ch = isVert ? innerH : childSpan;
        const cx = isVert ? innerX + cur : innerX;
        const cy = isVert ? innerY : innerY + cur;

        traverseTree(child, cx, cy, cw, ch, false);
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
            cur += mullionT; // chỉ tăng cur khi thực sự có thanh đố
          }
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
    joint: SashCornerJoint = '45',
    effectiveSashD = sashD
  ) => {
    const sd = effectiveSashD;
    if (joint === '90_vert') {
      // 90° Dọc phủ: 2 thanh đứng chạy suốt từ trên xuống dưới, 2 thanh ngang lọt lòng ở giữa
      return (
        <g key={key} fill={aluminumColor} stroke="#27272a" strokeWidth="0.7">
          <rect x={sx} y={sy} width={sd} height={sh} />
          <rect x={sx + sw - sd} y={sy} width={sd} height={sh} />
          <rect x={sx + sd} y={sy} width={Math.max(0, sw - 2 * sd)} height={sd} />
          <rect x={sx + sd} y={sy + sh - sd} width={Math.max(0, sw - 2 * sd)} height={sd} />
        </g>
      );
    }
    if (joint === '90_horiz') {
      // 90° Ngang phủ: 2 thanh ngang trên/dưới chạy suốt, 2 thanh đứng lọt lòng ở giữa
      return (
        <g key={key} fill={aluminumColor} stroke="#27272a" strokeWidth="0.7">
          <rect x={sx} y={sy} width={sw} height={sd} />
          <rect x={sx} y={sy + sh - sd} width={sw} height={sd} />
          <rect x={sx} y={sy + sd} width={sd} height={Math.max(0, sh - 2 * sd)} />
          <rect x={sx + sw - sd} y={sy + sd} width={sd} height={Math.max(0, sh - 2 * sd)} />
        </g>
      );
    }
    if (joint === '45_top_90_bot') {
      // 45° trên - 90° dưới
      return (
        <g key={key} fill={aluminumColor} stroke="#27272a" strokeWidth="0.7">
          <polygon points={`${sx},${sy} ${sx + sw},${sy} ${sx + sw - sd},${sy + sd} ${sx + sd},${sy + sd}`} />
          <rect x={sx + sd} y={sy + sh - sd} width={Math.max(0, sw - 2 * sd)} height={sd} />
          <polygon points={`${sx},${sy} ${sx + sd},${sy + sd} ${sx + sd},${sy + sh} ${sx},${sy + sh}`} />
          <polygon points={`${sx + sw},${sy} ${sx + sw - sd},${sy + sd} ${sx + sw - sd},${sy + sh} ${sx + sw},${sy + sh}`} />
        </g>
      );
    }
    // Mặc định: Ghép 45° mòi 4 góc
    return (
      <g key={key} fill={aluminumColor} stroke="#27272a" strokeWidth="0.7">
        <polygon points={`${sx},${sy} ${sx + sw},${sy} ${sx + sw - sd},${sy + sd} ${sx + sd},${sy + sd}`} />
        <polygon points={`${sx},${sy + sh} ${sx + sw},${sy + sh} ${sx + sw - sd},${sy + sh - sd} ${sx + sd},${sy + sh - sd}`} />
        <polygon points={`${sx},${sy} ${sx + sd},${sy + sd} ${sx + sd},${sy + sh - sd} ${sx},${sy + sh}`} />
        <polygon points={`${sx + sw},${sy} ${sx + sw - sd},${sy + sd} ${sx + sw - sd},${sy + sh - sd} ${sx + sw},${sy + sh}`} />
      </g>
    );
  };

  // Render Nẹp kính (Glazing Bead): dải nhôm fill giữa sash và kính
  // gx,gy,gw,gh: vùng bên trong sash (= glass area nếu không có bead)
  // Trả về [beadElement, glassX, glassY, glassW, glassH] để caller dùng
  const renderBead = (
    gx: number,
    gy: number,
    gw: number,
    gh: number,
    key: string,
    effectiveBeadW = beadW
  ): { el: React.ReactNode; gx2: number; gy2: number; gw2: number; gh2: number } => {
    // Nẹp kính không bao giờ chiếm quá 10% lòng kính
    const bw = Math.max(1, Math.min(effectiveBeadW, Math.floor(gw * 0.1)));
    const gx2 = gx + bw;
    const gy2 = gy + bw;
    const gw2 = Math.max(2, gw - 2 * bw);
    const gh2 = Math.max(2, gh - 2 * bw);
    // 4 thanh nẹp kính ghép mòi 45° sắc nét, cùng màu nhôm và cùng stroke viền với khung cánh (Ảnh 2)
    const el = (
      <g key={key} fill={aluminumColor} stroke="#27272a" strokeWidth="0.6" strokeLinejoin="miter">
        {/* Top Bead */}
        <polygon points={`${gx},${gy} ${gx + gw},${gy} ${gx + gw - bw},${gy + bw} ${gx + bw},${gy + bw}`} />
        {/* Bottom Bead */}
        <polygon points={`${gx},${gy + gh} ${gx + bw},${gy + gh - bw} ${gx + gw - bw},${gy + gh - bw} ${gx + gw},${gy + gh}`} />
        {/* Left Bead */}
        <polygon points={`${gx},${gy} ${gx + bw},${gy + bw} ${gx + bw},${gy + gh - bw} ${gx},${gy + gh}`} />
        {/* Right Bead */}
        <polygon points={`${gx + gw},${gy} ${gx + gw},${gy + gh} ${gx + gw - bw},${gy + gh - bw} ${gx + gw - bw},${gy + bw}`} />
      </g>
    );
    return { el, gx2, gy2, gw2, gh2 };
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
      id={id}
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
        const isSliding = node.sashType === 'sliding';

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
                // Dùng floor cho left, right bù phần còn lại để tổng luôn = cw
                const s1W = Math.floor((cw - astW) / 2);
                const s2W = cw - astW - s1W;
                const dSash1 = getAdaptiveSashD(s1W, ch, true, false);
                const dSash2 = getAdaptiveSashD(s2W, ch, true, false);
                const s1X = cx;
                const s2X = cx + s1W + astW;
                const pane1W = Math.max(4, s1W - 2 * dSash1);
                const pane2W = Math.max(4, s2W - 2 * dSash2);
                const paneH1 = Math.max(4, ch - 2 * dSash1);
                const paneH2 = Math.max(4, ch - 2 * dSash2);

                return (
                  <g>
                    {/* Cánh trái */}
                    {renderSashBox(s1X, cy, s1W, ch, `${node.id}-sash-1`, sashJoint, dSash1)}
                    {(() => {
                      const bead1 = renderBead(s1X + dSash1, cy + dSash1, pane1W, paneH1, `${node.id}-bead-1`, Math.max(1, Math.round(dSash1 * 0.22)));
                      return (<>
                        {bead1.el}
                        <rect x={bead1.gx2} y={bead1.gy2} width={bead1.gw2} height={bead1.gh2} fill="#b2f5ea" fillOpacity={0.85} stroke="none" />
                        {renderOpeningSymbol(bead1.gx2, bead1.gy2, bead1.gw2, bead1.gh2, 'swing_left')}
                      </>);
                    })()}

                    {/* Đố động giữa 2 cánh */}
                    <rect x={cx + s1W} y={cy} width={astW} height={ch} fill={aluminumColor} stroke="#27272a" strokeWidth="0.7" />

                    {/* Cánh phải */}
                    {renderSashBox(s2X, cy, s2W, ch, `${node.id}-sash-2`, sashJoint, dSash2)}
                    {(() => {
                      const bead2 = renderBead(s2X + dSash2, cy + dSash2, pane2W, paneH2, `${node.id}-bead-2`, Math.max(1, Math.round(dSash2 * 0.22)));
                      return (<>
                        {bead2.el}
                        <rect x={bead2.gx2} y={bead2.gy2} width={bead2.gw2} height={bead2.gh2} fill="#b2f5ea" fillOpacity={0.85} stroke="none" />
                        {renderOpeningSymbol(bead2.gx2, bead2.gy2, bead2.gw2, bead2.gh2, 'swing_right')}
                      </>);
                    })()}

                    {/* Lever handle on right sash */}
                    {(() => {
                      const handleHVal = node.handleHeight || 800;
                      const lockYCalc = (oy + fh) - Math.round((handleHVal / h) * fh);
                      const handleY = Math.max(cy + dSash2 + 20, Math.min(cy + ch - dSash2 - 20, lockYCalc));
                      const plateX = s2X + dSash2 / 2 - 3;
                      const plateY = handleY - 14;
                      const leverX = plateX + 3;
                      const leverY = handleY - 5;
                      return (
                        <g className="cursor-pointer" onClick={(e) => { e.stopPropagation(); onEditDimension?.('handleHeight', node.id); }}>
                          <rect x={plateX} y={plateY} width={6} height={28} rx={2} fill={hardwareColor} stroke="#000" strokeWidth="0.7" />
                          <circle cx={plateX + 3} cy={handleY + 7} r={1.2} fill="#111" />
                          <rect x={leverX} y={leverY} width={18} height={4.5} rx={2} fill={hardwareColor} stroke="#000" strokeWidth="0.7" />
                        </g>
                      );
                    })()}
                  </g>
                );
              })()
            ) : (
              /* Case B: Single sash or fixed pane */
              (() => {
                const dSash = isFixed ? 0 : getAdaptiveSashD(cw, ch, false, isSliding);
                const dBead = isFixed ? 0 : Math.max(1, Math.round(dSash * 0.22));
                const innerX = isFixed ? cx : cx + dSash;
                const innerY = isFixed ? cy : cy + dSash;
                const innerW = Math.max(4, isFixed ? cw : cw - 2 * dSash);
                const innerH = Math.max(4, isFixed ? ch : ch - 2 * dSash);
                // Bead chỉ cho cánh mở và glass; fixed/panel/screen không có nẹp
                const hasBead = !isFixed && node.paneType === 'glass';
                const bead = hasBead ? renderBead(innerX, innerY, innerW, innerH, `${node.id}-bead`, dBead) : null;
                const glassX = hasBead && bead ? bead.gx2 : innerX;
                const glassY = hasBead && bead ? bead.gy2 : innerY;
                const glassW = hasBead && bead ? bead.gw2 : innerW;
                const glassH = hasBead && bead ? bead.gh2 : innerH;

                return (
                  <g>
                    {!isFixed && renderSashBox(cx, cy, cw, ch, `${node.id}-sash-single`, sashJoint, dSash)}

                    {/* Nẹp kính (render trước glass) */}
                    {bead?.el}

                    <rect
                      x={glassX}
                      y={glassY}
                      width={glassW}
                      height={glassH}
                      fill={
                        node.paneType === 'screen'
                          ? 'url(#screen-mesh)'
                          : node.paneType === 'louver'
                          ? 'url(#louver-pattern)'
                          : node.paneType === 'panel'
                          ? aluminumColor
                          : '#b2f5ea'
                      }
                      fillOpacity={node.paneType === 'glass' ? 0.85 : 0.95}
                      stroke="none"
                    />

                    {!isFixed && renderOpeningSymbol(glassX, glassY, glassW, glassH, node.sashType)}

                    {/* Hardware Handle — chỉ render khi hasLock explicitly = true */}
                    {!isFixed && node.hasLock === true && (() => {
                      const isBottomHandle = node.sashType === 'awning' || node.sashType === 'tilt';
                      const isTopHandle = node.sashType === 'tilt_down';
                      const isRightHandle = node.sashType === 'swing_left' || node.sashType === 'tilt_turn';
                      const isLeftHandle = node.sashType === 'swing_right';

                      if (isBottomHandle) {
                        return (
                          <rect
                            x={cx + cw / 2 - 10}
                            y={cy + ch - dSash / 2 - 2}
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
                            y={cy + dSash / 2 - 2}
                            width={20}
                            height={4}
                            rx={1.5}
                            fill={hardwareColor}
                            stroke="#000"
                            strokeWidth="0.5"
                          />
                        );
                      }

                      // Tính cao độ tim khóa handleY theo handleHeight (mm) từ đáy cửa lên
                      const handleHVal = node.handleHeight || 800;
                      const lockYCalc = (oy + fh) - Math.round((handleHVal / h) * fh);
                      const isOpenBot = frameConfig?.isOpenBottom ?? false;
                      const bottomBound = isOpenBot
                        ? (oy + fh - dSash - 10)
                        : (oy + fh - frameD - dSash - 10);
                      const handleY = Math.max(cy + dSash + 20, Math.min(bottomBound, lockYCalc));

                      if (isRightHandle) {
                        // Tay nắm lắp ở cạnh phải của cánh (quay trái), tay gạt chìa sang trái
                        const plateX = cx + cw - dSash / 2 - 3;
                        const plateY = handleY - 14;
                        const leverW = 18;
                        const leverX = plateX + 3 - leverW;
                        const leverY = handleY - 5;

                        return (
                          <g className="cursor-pointer" onClick={(e) => { e.stopPropagation(); onEditDimension?.('handleHeight', node.id); }}>
                            {/* Ốp thân khóa thẳng đứng */}
                            <rect x={plateX} y={plateY} width={6} height={28} rx={2} fill={hardwareColor} stroke="#000" strokeWidth="0.7" />
                            {/* Lỗ khóa / ổ chìa */}
                            <circle cx={plateX + 3} cy={handleY + 7} r={1.2} fill="#111" />
                            {/* Cần tay gạt nằm ngang */}
                            <rect x={leverX} y={leverY} width={leverW} height={4.5} rx={2} fill={hardwareColor} stroke="#000" strokeWidth="0.7" />
                          </g>
                        );
                      }

                      if (isLeftHandle) {
                        // Tay nắm lắp ở cạnh trái của cánh (quay phải - như Ảnh 2 của User), tay gạt chìa sang phải
                        const plateX = cx + dSash / 2 - 3;
                        const plateY = handleY - 14;
                        const leverW = 18;
                        const leverX = plateX + 3;
                        const leverY = handleY - 5;

                        return (
                          <g className="cursor-pointer" onClick={(e) => { e.stopPropagation(); onEditDimension?.('handleHeight', node.id); }}>
                            {/* Ốp thân khóa thẳng đứng */}
                            <rect x={plateX} y={plateY} width={6} height={28} rx={2} fill={hardwareColor} stroke="#000" strokeWidth="0.7" />
                            {/* Lỗ khóa / ổ chìa */}
                            <circle cx={plateX + 3} cy={handleY + 7} r={1.2} fill="#111" />
                            {/* Cần tay gạt nằm ngang (chìa sang phải qua mặt kính) */}
                            <rect x={leverX} y={leverY} width={leverW} height={4.5} rx={2} fill={hardwareColor} stroke="#000" strokeWidth="0.7" />
                          </g>
                        );
                      }

                      return null;
                    })()}

                    {/* Selection Outline - Viền đứt màu cam ôm sát ô kính, không đè lên nẹp nhôm */}
                    {isSelected && (
                      <rect
                        x={glassX + 1}
                        y={glassY + 1}
                        width={Math.max(2, glassW - 2)}
                        height={Math.max(2, glassH - 2)}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                        strokeDasharray="5,3"
                      />
                    )}
                  </g>
                );
              })()
            )}
          </g>
        );
      })}

      {/* Dimensions & Sub-dimensions (Only rendered when hideDimensions is false) */}
      {!hideDimensions && (
        <>
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

          {/* 8. Lock Height Dimension Line */}
          {(() => {
            const lockLeaf = leaves.find(
              (l) =>
                (l.node.hasLock ?? (l.node.sashType === 'swing_left' || l.node.sashType === 'swing_right')) &&
                (l.node.sashType === 'swing_left' || l.node.sashType === 'swing_right') &&
                l.node.hasLock !== false
            );
            if (!lockLeaf) return null;

            const handleHVal = lockLeaf.node.handleHeight || 800;
            const lockYCalc = (oy + fh) - Math.round((handleHVal / h) * fh);
            const isOpenBot = frameConfig?.isOpenBottom ?? false;
            const bottomBound = isOpenBot
              ? (oy + fh - sashD - 10)
              : (oy + fh - frameD - sashD - 10);
            const lockY = Math.max(oy + frameD + 10, Math.min(bottomBound, lockYCalc));
            const dimLeftX = ox - 26;

            return (
              <g stroke="#2563eb" strokeWidth="0.8">
                <line x1={ox} y1={oy + fh} x2={dimLeftX} y2={oy + fh} strokeDasharray="2,2" />
                <line x1={ox} y1={lockY} x2={dimLeftX} y2={lockY} strokeDasharray="2,2" />
                <line x1={dimLeftX} y1={oy + fh} x2={dimLeftX} y2={lockY} strokeWidth="1" />
                <circle cx={dimLeftX} cy={oy + fh} r={2} fill="#2563eb" />
                <circle cx={dimLeftX} cy={lockY} r={2} fill="#2563eb" />
                <text
                  x={dimLeftX - 4}
                  y={(oy + fh + lockY) / 2}
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
                  transform={`rotate(-90, ${dimLeftX - 4}, ${(oy + fh + lockY) / 2})`}
                  className="cursor-pointer hover:fill-red-600 hover:font-bold"
                  onClick={() => onEditDimension?.('handleHeight', lockLeaf.node.id)}
                >
                  {handleHVal}
                </text>
              </g>
            );
          })()}
        </>
      )}
    </svg>
  );
};
