import React from 'react';
import { ArchConfig, FrameConfig, FrameShape, SashConfig, SceneCellNode } from '../../studio-types';
import {
  getArchCenterlinePath,
  getArchXAtY,
  getArchYAtX,
  getCurvedContourPath,
  isArchOpenBottomShape,
} from '../cad-geometry';

interface CadCurvedDoubleDoorProps {
  id?: string;
  frameShape: FrameShape;
  ox: number;
  oy: number;
  fw: number;
  fh: number;
  h: number;
  frameD: number;
  sashD: number;
  beadW: number;
  mullionT: number;
  aluminumColor: string;
  hardwareColor: string;
  isOpenBottom: boolean;
  selectedCellId: string | null;
  onSelectCell: (id: string | null) => void;
  onEditDimension?: (target: 'w' | 'h' | 'cell' | 'cell-w' | 'cell-h' | 'handleHeight', cellId?: string) => void;
  leftNode: SceneCellNode;
  rightNode?: SceneCellNode;
  sashConfig?: SashConfig;
  scaledArchConfig?: ArchConfig;
}

/**
 * Render Cửa Vòm Mở Quay 2 Cánh đối xứng (Curved Double Swing Door):
 * - Cánh uốn cong theo viền trong khung vòm
 * - Nẹp kính uốn cong và đố đứng 2 cánh gặp nhau tại trục giữa (kèm đường cắt mòi chuẩn trên đỉnh và góc đáy)
 * - Đường tâm uốn màu cam đứt nét cho Vòm nhọn 2 cung (arch_pointed / arch_pointed_leg)
 */
export const CadCurvedDoubleDoor: React.FC<CadCurvedDoubleDoorProps> = ({
  id,
  frameShape,
  ox,
  oy,
  fw,
  fh,
  h,
  frameD,
  sashD,
  beadW,
  aluminumColor,
  hardwareColor,
  isOpenBottom,
  selectedCellId,
  onSelectCell,
  onEditDimension,
  leftNode,
  rightNode,
  sashConfig,
  scaledArchConfig,
}) => {
  const dFrame = frameD;
  const dSash = sashD;
  const dBead = beadW;

  const effectiveOpenBottom = Boolean(isOpenBottom || isArchOpenBottomShape(frameShape));
  const dBot = effectiveOpenBottom ? 0 : dFrame;
  const hoNenVal = leftNode?.hoNenMm ?? rightNode?.hoNenMm ?? sashConfig?.hoNenMm ?? 8;
  const hoNenPx = effectiveOpenBottom ? Math.round((hoNenVal / (h || 1)) * fh) : 0;
  const effFh = Math.max(40, fh - hoNenPx);

  const xMid = Math.round(ox + fw / 2);

  // 1. Đường viền ngoài của cánh = viền trong của khung bao (offset = dFrame)
  const sashOuterPath = getCurvedContourPath(
    frameShape,
    ox,
    oy,
    fw,
    effFh,
    dFrame,
    false,
    scaledArchConfig,
    dBot
  );

  // 2. Đường viền trong của cánh = viền ngoài của nẹp (offset = dFrame + dSash)
  const sashInnerPath = getCurvedContourPath(
    frameShape,
    ox,
    oy,
    fw,
    effFh,
    dFrame + dSash,
    false,
    scaledArchConfig,
    dBot + dSash
  );

  // 3. Đường viền trong của nẹp = vùng kính thông thủy (offset = dFrame + dSash + dBead)
  const beadInnerPath = getCurvedContourPath(
    frameShape,
    ox,
    oy,
    fw,
    effFh,
    dFrame + dSash + dBead,
    false,
    scaledArchConfig,
    dBot + dSash + dBead
  );

  if (!sashOuterPath || !sashInnerPath || !beadInnerPath) return null;

  const sashClipId = `curved-sash-inner-${id || 'root'}`;
  const glassClipId = `curved-glass-inner-${id || 'root'}`;

  const paneType = leftNode?.paneType ?? 'glass';
  const fillVal =
    paneType === 'panel'
      ? aluminumColor
      : paneType === 'screen'
        ? 'url(#screen-mesh)'
        : paneType === 'louver'
          ? 'url(#louver-pattern)'
          : '#a5f3fc';

  const isLeftSelected = selectedCellId === leftNode.id;
  const isRightSelected = rightNode ? selectedCellId === rightNode.id : isLeftSelected;

  const yBotOuter = oy + effFh - dBot;
  const yBotSashInner = yBotOuter - dSash;
  const yBotBeadInner = yBotSashInner - dBead;

  // Tọa độ X của đố cánh trung tâm và nẹp trung tâm
  const xLeftStileInner = xMid - dSash;
  const xRightStileInner = xMid + dSash;
  const xLeftBeadInner = xLeftStileInner - dBead;
  const xRightBeadInner = xRightStileInner + dBead;

  // Tọa độ Y chính xác tại nơi đố cánh trung tâm và nẹp trung tâm giao với đường cong vòm
  const yApexFrameInner = getArchYAtX(frameShape, ox, oy, fw, effFh, dFrame, xMid, scaledArchConfig);
  const yLeftStileTop = getArchYAtX(
    frameShape,
    ox,
    oy,
    fw,
    effFh,
    dFrame + dSash,
    xLeftStileInner,
    scaledArchConfig
  );
  const yRightStileTop = getArchYAtX(
    frameShape,
    ox,
    oy,
    fw,
    effFh,
    dFrame + dSash,
    xRightStileInner,
    scaledArchConfig
  );
  const yLeftBeadTop = getArchYAtX(
    frameShape,
    ox,
    oy,
    fw,
    effFh,
    dFrame + dSash + dBead,
    xLeftBeadInner,
    scaledArchConfig
  );
  const yRightBeadTop = getArchYAtX(
    frameShape,
    ox,
    oy,
    fw,
    effFh,
    dFrame + dSash + dBead,
    xRightBeadInner,
    scaledArchConfig
  );

  // Ký hiệu chiều mở (Red Opening Triangle): bám chính xác theo viền kính cong
  const isLeftInward = leftNode?.sashType === 'le-trai-mo-vao';
  const isRightInward = rightNode?.sashType === 'le-phai-mo-vao';
  const leftStrokeDash = isLeftInward ? '6,4' : undefined;
  const rightStrokeDash = isRightInward ? '6,4' : undefined;

  const yOpenTopLeft = Math.max(oy + dFrame + dSash + dBead + 2, yLeftBeadTop);
  const yOpenTopRight = Math.max(oy + dFrame + dSash + dBead + 2, yRightBeadTop);
  const yOpenBot = yBotBeadInner;
  const yOpenMidLeft = (yOpenTopLeft + yOpenBot) / 2;
  const yOpenMidRight = (yOpenTopRight + yOpenBot) / 2;

  const xHingeLeft = getArchXAtY(
    frameShape,
    ox,
    oy,
    fw,
    effFh,
    dFrame + dSash + dBead,
    yOpenMidLeft,
    'left',
    scaledArchConfig
  );
  const xHingeRight = getArchXAtY(
    frameShape,
    ox,
    oy,
    fw,
    effFh,
    dFrame + dSash + dBead,
    yOpenMidRight,
    'right',
    scaledArchConfig
  );

  // Đường tâm uốn màu cam nét đứt cho Vòm nhọn 2 cung (arch_pointed / arch_pointed_leg)
  const centerlinePath =
    frameShape === 'arch_pointed' || frameShape === 'arch_pointed_leg'
      ? getArchCenterlinePath(
          frameShape,
          ox,
          oy,
          fw,
          effFh,
          dFrame + dSash * 0.45,
          scaledArchConfig
        )
      : null;

  // Tay nắm khóa trên cánh phải (hoặc cánh chính)
  const isHyd = Boolean(sashConfig?.isHydraulic || leftNode?.isHydraulic || rightNode?.isHydraulic);
  const handleHVal =
    rightNode?.handleHeight || leftNode?.handleHeight || (isHyd ? 1050 : Math.round(h / 2));
  const lockY = Math.max(
    oy + dFrame + dSash + 30,
    Math.min(yBotSashInner - 20, oy + effFh - Math.round((handleHVal / (h || 1)) * fh))
  );
  const hx = xMid + Math.round(dSash * 0.45);
  const showHandle = (rightNode?.hasLock ?? leftNode?.hasLock ?? true) !== false;

  return (
    <g>
      <defs>
        <clipPath id={sashClipId}>
          <path d={sashInnerPath} />
        </clipPath>
        <clipPath id={glassClipId}>
          <path d={beadInnerPath} />
        </clipPath>
      </defs>

      {/* 1. Vùng Kính 2 bên trái/phải */}
      <g clipPath={`url(#${glassClipId})`}>
        <rect
          x={ox}
          y={oy}
          width={Math.max(0, xLeftBeadInner - ox)}
          height={effFh}
          fill={fillVal}
          fillOpacity={paneType === 'glass' ? 0.72 : 0.9}
          className="cursor-pointer transition-opacity hover:opacity-85"
          onClick={(e) => {
            e.stopPropagation();
            onSelectCell(leftNode.id);
          }}
        />
        <rect
          x={xRightBeadInner}
          y={oy}
          width={Math.max(0, ox + fw - xRightBeadInner)}
          height={effFh}
          fill={fillVal}
          fillOpacity={paneType === 'glass' ? 0.72 : 0.9}
          className="cursor-pointer transition-opacity hover:opacity-85"
          onClick={(e) => {
            e.stopPropagation();
            onSelectCell(rightNode ? rightNode.id : leftNode.id);
          }}
        />
      </g>

      {/* 2. Vành Khung Cánh uốn vòm bao quanh (Sash Arch Ring) */}
      <path
        d={`${sashOuterPath} ${sashInnerPath}`}
        fill={aluminumColor}
        fillRule="evenodd"
      />
      <path d={sashOuterPath} fill="none" stroke="#18181b" strokeWidth="0.9" />
      <path d={sashInnerPath} fill="none" stroke="#18181b" strokeWidth="0.8" />

      {/* 3. Vành Nẹp Kính uốn vòm bao quanh (Bead Arch Ring) */}
      <path
        d={`${sashInnerPath} ${beadInnerPath}`}
        fill={aluminumColor}
        fillRule="evenodd"
      />
      <path d={beadInnerPath} fill="none" stroke="#27272a" strokeWidth="0.65" />

      {/* 4. Hai thanh đố đứng cánh trung tâm & 2 thanh nẹp đứng trung tâm */}
      <g clipPath={`url(#${sashClipId})`}>
        {/* Đố đứng cánh trái + phải */}
        <rect
          x={xLeftStileInner}
          y={oy}
          width={dSash * 2}
          height={effFh}
          fill={aluminumColor}
        />
        {/* Nẹp đứng trung tâm cánh trái */}
        <rect
          x={xLeftBeadInner}
          y={oy}
          width={dBead}
          height={yBotSashInner - oy}
          fill={aluminumColor}
          stroke="#27272a"
          strokeWidth="0.6"
        />
        {/* Nẹp đứng trung tâm cánh phải */}
        <rect
          x={xRightStileInner}
          y={oy}
          width={dBead}
          height={yBotSashInner - oy}
          fill={aluminumColor}
          stroke="#27272a"
          strokeWidth="0.6"
        />
        {/* Viền ngoài 2 đố đứng cánh trung tâm */}
        <line
          x1={xLeftStileInner}
          y1={oy}
          x2={xLeftStileInner}
          y2={yBotSashInner}
          stroke="#18181b"
          strokeWidth="0.8"
        />
        <line
          x1={xRightStileInner}
          y1={oy}
          x2={xRightStileInner}
          y2={yBotSashInner}
          stroke="#18181b"
          strokeWidth="0.8"
        />
      </g>

      {/* 5. Đường cắt mòi (Miter Lines) của Cánh, Nẹp và Khe giữ 2 cánh */}
      <g stroke="#18181b" strokeWidth="0.75">
        {/* Khe đứng chính giữa 2 cánh từ đỉnh trong khung bao xuống đáy cánh */}
        <line x1={xMid} y1={yApexFrameInner} x2={xMid} y2={yBotOuter} strokeWidth="0.95" />

        {/* Đường cắt mòi đỉnh 2 cánh tại trung tâm vòm */}
        <line x1={xMid} y1={yApexFrameInner} x2={xLeftStileInner} y2={yLeftStileTop} />
        <line x1={xMid} y1={yApexFrameInner} x2={xRightStileInner} y2={yRightStileTop} />

        {/* Đường cắt mòi đỉnh 2 thanh nẹp đứng trung tâm */}
        <line x1={xLeftStileInner} y1={yLeftStileTop} x2={xLeftBeadInner} y2={yLeftBeadTop} strokeWidth="0.6" />
        <line x1={xRightStileInner} y1={yRightStileTop} x2={xRightBeadInner} y2={yRightBeadTop} strokeWidth="0.6" />

        {/* Đường cắt mòi 45° tại 4 góc đáy của 2 cánh (xuyên qua cả cánh và nẹp) */}
        <line
          x1={ox + dFrame}
          y1={yBotOuter}
          x2={ox + dFrame + dSash + dBead}
          y2={yBotBeadInner}
        />
        <line
          x1={xMid}
          y1={yBotOuter}
          x2={xLeftBeadInner}
          y2={yBotBeadInner}
        />
        <line
          x1={xMid}
          y1={yBotOuter}
          x2={xRightBeadInner}
          y2={yBotBeadInner}
        />
        <line
          x1={ox + fw - dFrame}
          y1={yBotOuter}
          x2={ox + fw - dFrame - dSash - dBead}
          y2={yBotBeadInner}
        />
      </g>

      {/* 6. Đường tâm uốn cam nét đứt cho Vòm nhọn 2 cung */}
      {centerlinePath && (
        <path
          d={centerlinePath}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="1.15"
          strokeDasharray="5,4"
          className="pointer-events-none"
        />
      )}

      {/* 7. Ký hiệu chiều mở quay 2 cánh (Tam giác đỏ) */}
      <g
        fill="none"
        stroke="#dc2626"
        strokeWidth="1"
        strokeLinejoin="round"
        className="pointer-events-none"
      >
        <polyline
          points={`${xLeftBeadInner},${yOpenTopLeft} ${xHingeLeft + 1},${yOpenMidLeft} ${xLeftBeadInner},${yOpenBot}`}
          strokeDasharray={leftStrokeDash}
        />
        <polyline
          points={`${xRightBeadInner},${yOpenTopRight} ${xHingeRight - 1},${yOpenMidRight} ${xRightBeadInner},${yOpenBot}`}
          strokeDasharray={rightStrokeDash}
        />
      </g>

      {/* 8. Viền sáng xanh khi người dùng click chọn ô cánh */}
      {isLeftSelected && (
        <rect
          x={ox + dFrame + 2}
          y={oy + dFrame + 2}
          width={Math.max(0, xMid - (ox + dFrame) - 4)}
          height={Math.max(0, effFh - dFrame - dBot - 4)}
          fill="none"
          stroke="#2563eb"
          strokeWidth="1.6"
          strokeDasharray="4,2"
          className="pointer-events-none"
        />
      )}
      {isRightSelected && rightNode && (
        <rect
          x={xMid + 2}
          y={oy + dFrame + 2}
          width={Math.max(0, ox + fw - dFrame - xMid - 4)}
          height={Math.max(0, effFh - dFrame - dBot - 4)}
          fill="none"
          stroke="#2563eb"
          strokeWidth="1.6"
          strokeDasharray="4,2"
          className="pointer-events-none"
        />
      )}

      {/* 9. Tay nắm khóa gạt (Lever Handle) trên cánh phải */}
      {showHandle && (
        <g
          className="cursor-pointer hover:opacity-85"
          onClick={(e) => {
            e.stopPropagation();
            onEditDimension?.('handleHeight', rightNode ? rightNode.id : leftNode.id);
          }}
        >
          <title>{`Tay nắm khóa (Cao độ: ${handleHVal}mm - Nhấp để sửa)`}</title>
          {/* Đế khóa (Escutcheon) */}
          <rect
            x={hx - 2.5}
            y={lockY - 12}
            width={5}
            height={24}
            rx={1.8}
            fill={hardwareColor}
            stroke="#0f172a"
            strokeWidth="0.7"
          />
          {/* Tay gạt ngang (Lever) hướng sang phải */}
          <rect
            x={hx - 1}
            y={lockY - 3.5}
            width={17}
            height={4}
            rx={1.8}
            fill={hardwareColor}
            stroke="#0f172a"
            strokeWidth="0.75"
          />
          {/* Lỗ ruột khóa */}
          <circle cx={hx} cy={lockY + 6.5} r={1} fill="#94a3b8" />
        </g>
      )}
    </g>
  );
};

interface CadCurvedSingleDoorProps {
  id?: string;
  frameShape: FrameShape;
  ox: number;
  oy: number;
  fw: number;
  fh: number;
  h: number;
  frameD: number;
  sashD: number;
  beadW: number;
  mullionT: number;
  aluminumColor: string;
  hardwareColor: string;
  isOpenBottom: boolean;
  selectedCellId: string | null;
  onSelectCell: (id: string | null) => void;
  onEditDimension?: (target: 'w' | 'h' | 'cell' | 'cell-w' | 'cell-h' | 'handleHeight', cellId?: string) => void;
  node: SceneCellNode;
  frameConfig?: FrameConfig;
  sashConfig?: SashConfig;
  scaledArchConfig?: ArchConfig;
}

/**
 * Render Cửa Vòm 1 Cánh hoặc Vách Kính Cố Định Vòm (Curved Single Door / Fixed Arch):
 * - Nếu Fixed: Chỉ hiển thị vành nẹp kính uốn cong + mặt kính
 * - Nếu có Cánh (Mở quay trái/phải, Mở hất, Mở lật): Hiển thị vành cánh uốn cong + nẹp kính + ký hiệu mở + tay nắm
 */
export const CadCurvedSingleDoor: React.FC<CadCurvedSingleDoorProps> = ({
  id,
  frameShape,
  ox,
  oy,
  fw,
  fh,
  h,
  frameD,
  sashD,
  beadW,
  aluminumColor,
  hardwareColor,
  isOpenBottom,
  selectedCellId,
  onSelectCell,
  onEditDimension,
  node,
  frameConfig,
  sashConfig,
  scaledArchConfig,
}) => {
  const sashType = node?.sashType ?? 'fixed';
  const hasSash = sashType !== 'fixed';

  const dFrame = frameD;
  const dSash = hasSash ? sashD : 0;
  const dBead = beadW;

  const effectiveOpenBottom = Boolean(isOpenBottom || isArchOpenBottomShape(frameShape));
  const dBot = effectiveOpenBottom && hasSash ? 0 : dFrame;
  const hoNenVal = node?.hoNenMm ?? sashConfig?.hoNenMm ?? 8;
  const hoNenPx = effectiveOpenBottom && hasSash ? Math.round((hoNenVal / (h || 1)) * fh) : 0;
  const effFh = Math.max(40, fh - hoNenPx);

  const sashOuterPath = getCurvedContourPath(
    frameShape,
    ox,
    oy,
    fw,
    effFh,
    dFrame,
    false,
    scaledArchConfig,
    dBot
  );

  const sashInnerPath = hasSash
    ? getCurvedContourPath(
        frameShape,
        ox,
        oy,
        fw,
        effFh,
        dFrame + dSash,
        false,
        scaledArchConfig,
        dBot + dSash
      )
    : sashOuterPath;

  const beadInnerPath = getCurvedContourPath(
    frameShape,
    ox,
    oy,
    fw,
    effFh,
    dFrame + dSash + dBead,
    false,
    scaledArchConfig,
    dBot + dSash + dBead
  );

  if (!sashOuterPath || !sashInnerPath || !beadInnerPath) return null;

  const glassClipId = `curved-single-glass-${id || 'root'}`;
  const paneType = node?.paneType ?? 'glass';
  const fillVal =
    paneType === 'panel'
      ? aluminumColor
      : paneType === 'screen'
        ? 'url(#screen-mesh)'
        : paneType === 'louver'
          ? 'url(#louver-pattern)'
          : '#a5f3fc';

  const isSelected = selectedCellId === node.id;

  const gx = ox + dFrame + dSash + dBead;
  const gy = oy + dFrame + dSash + dBead;
  const gw = Math.max(10, fw - 2 * (dFrame + dSash + dBead));
  const gh = Math.max(10, effFh - dFrame - dBot - 2 * (dSash + dBead));
  const yBotOuter = oy + effFh - dBot;
  const yBotBeadInner = gy + gh;

  const isLeftSwing = ['swing_left', 'le-trai-mo-ra', 'le-trai-mo-vao', 'gap-xep-le-trai'].includes(sashType);
  const isRightSwing = ['swing_right', 'le-phai-mo-ra', 'le-phai-mo-vao', 'gap-xep-le-phai'].includes(sashType);
  const isAwning = ['awning', 'mo-hat'].includes(sashType);
  const isTilt = ['tilt', 'mo-lat', 'mo-lat-trong', 'tilt_down'].includes(sashType);
  const isTiltTurn = sashType === 'tilt_turn';
  const isInward = ['le-trai-mo-vao', 'le-phai-mo-vao', 'mo-lat', 'mo-lat-trong'].includes(sashType);
  const openDash = isInward ? '6,4' : undefined;

  const yMidGlass = gy + gh * 0.55;
  const xLeftEdgeMid = getArchXAtY(
    frameShape,
    ox,
    oy,
    fw,
    effFh,
    dFrame + dSash + dBead,
    yMidGlass,
    'left',
    scaledArchConfig
  );
  const xRightEdgeMid = getArchXAtY(
    frameShape,
    ox,
    oy,
    fw,
    effFh,
    dFrame + dSash + dBead,
    yMidGlass,
    'right',
    scaledArchConfig
  );
  const yApexSashOuter = getArchYAtX(
    frameShape,
    ox,
    oy,
    fw,
    effFh,
    dFrame,
    ox + fw / 2,
    scaledArchConfig
  );
  const yApexGlass = getArchYAtX(
    frameShape,
    ox,
    oy,
    fw,
    effFh,
    dFrame + dSash + dBead,
    ox + fw / 2,
    scaledArchConfig
  );
  const showSingleApexCut = Boolean(
    frameConfig?.archConfig?.isCutAtApex ||
      frameShape === 'arch_pointed' ||
      frameShape === 'arch_pointed_leg'
  );

  // Đường tâm uốn màu cam nét đứt cho Vòm nhọn 2 cung
  const centerlinePath =
    frameShape === 'arch_pointed' || frameShape === 'arch_pointed_leg'
      ? getArchCenterlinePath(
          frameShape,
          ox,
          oy,
          fw,
          effFh,
          dFrame + (hasSash ? dSash * 0.45 : dBead * 0.5),
          scaledArchConfig
        )
      : null;

  // Tay nắm khóa cho cửa 1 cánh mở quay
  const showSideHandle = hasSash && (isLeftSwing || isRightSwing || isTiltTurn) && node?.hasLock !== false;
  const isHyd = Boolean(sashConfig?.isHydraulic || node?.isHydraulic);
  const handleHVal = node?.handleHeight || (isHyd ? 1050 : Math.round(h / 2));
  const lockY = Math.max(
    oy + dFrame + dSash + 30,
    Math.min(yBotOuter - dSash - 20, oy + effFh - Math.round((handleHVal / (h || 1)) * fh))
  );
  const handleSide = isLeftSwing ? 'right' : 'left';
  const xLockOuter = getArchXAtY(
    frameShape,
    ox,
    oy,
    fw,
    effFh,
    dFrame + dSash * 0.5,
    lockY,
    handleSide,
    scaledArchConfig
  );

  return (
    <g>
      <defs>
        <clipPath id={glassClipId}>
          <path d={beadInnerPath} />
        </clipPath>
      </defs>

      {/* 1. Mặt Kính */}
      <g clipPath={`url(#${glassClipId})`}>
        <rect
          x={ox}
          y={oy}
          width={fw}
          height={effFh}
          fill={fillVal}
          fillOpacity={paneType === 'glass' ? 0.72 : 0.9}
          className="cursor-pointer transition-opacity hover:opacity-85"
          onClick={(e) => {
            e.stopPropagation();
            onSelectCell(node.id);
          }}
        />
      </g>

      {/* 2. Vành Cánh uốn vòm (nếu không phải ô Fix) */}
      {hasSash && (
        <>
          <path
            d={`${sashOuterPath} ${sashInnerPath}`}
            fill={aluminumColor}
            fillRule="evenodd"
          />
          <path d={sashOuterPath} fill="none" stroke="#18181b" strokeWidth="0.9" />
          <path d={sashInnerPath} fill="none" stroke="#18181b" strokeWidth="0.8" />
        </>
      )}

      {/* 3. Vành Nẹp kính uốn vòm */}
      <path
        d={`${sashInnerPath} ${beadInnerPath}`}
        fill={aluminumColor}
        fillRule="evenodd"
      />
      <path d={beadInnerPath} fill="none" stroke="#27272a" strokeWidth="0.65" />

      {/* 4. Đường cắt mòi 45° tại 2 góc đáy và nét cắt đỉnh (khi chia đôi tại đỉnh) */}
      <g stroke="#18181b" strokeWidth="0.75">
        {showSingleApexCut && (
          <line
            x1={Math.round(ox + fw / 2)}
            y1={yApexSashOuter}
            x2={Math.round(ox + fw / 2)}
            y2={yApexGlass}
            strokeWidth="0.85"
          />
        )}
        <line
          x1={ox + dFrame}
          y1={yBotOuter}
          x2={gx}
          y2={yBotBeadInner}
        />
        <line
          x1={ox + fw - dFrame}
          y1={yBotOuter}
          x2={gx + gw}
          y2={yBotBeadInner}
        />
      </g>

      {/* 5. Đường tâm uốn cam nét đứt cho Vòm nhọn 2 cung */}
      {centerlinePath && (
        <path
          d={centerlinePath}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="1.15"
          strokeDasharray="5,4"
          className="pointer-events-none"
        />
      )}

      {/* 6. Ký hiệu chiều mở */}
      {hasSash && (
        <g
          fill="none"
          stroke="#dc2626"
          strokeWidth="1"
          strokeLinejoin="round"
          className="pointer-events-none"
        >
          {isLeftSwing && (
            <polyline
              points={`${gx + gw - 4},${yMidGlass - gh * 0.25} ${xLeftEdgeMid + 1},${yMidGlass} ${gx + gw},${yBotBeadInner}`}
              strokeDasharray={openDash}
            />
          )}
          {isRightSwing && (
            <polyline
              points={`${gx + 4},${yMidGlass - gh * 0.25} ${xRightEdgeMid - 1},${yMidGlass} ${gx},${yBotBeadInner}`}
              strokeDasharray={openDash}
            />
          )}
          {isAwning && (
            <polyline
              points={`${gx},${yBotBeadInner} ${ox + fw / 2},${yApexGlass + 2} ${gx + gw},${yBotBeadInner}`}
              strokeDasharray={openDash}
            />
          )}
          {isTilt && (
            <polyline
              points={`${xLeftEdgeMid + 2},${yMidGlass} ${ox + fw / 2},${yBotBeadInner} ${xRightEdgeMid - 2},${yMidGlass}`}
              strokeDasharray={openDash}
            />
          )}
          {isTiltTurn && (
            <>
              <polyline
                points={`${gx + gw - 4},${yMidGlass - gh * 0.25} ${xLeftEdgeMid + 1},${yMidGlass} ${gx + gw},${yBotBeadInner}`}
              />
              <polyline
                points={`${xLeftEdgeMid + 2},${yMidGlass} ${ox + fw / 2},${yBotBeadInner} ${xRightEdgeMid - 2},${yMidGlass}`}
                strokeDasharray="5,3"
              />
            </>
          )}
        </g>
      )}

      {/* 7. Tay nắm khóa gạt (cho cửa 1 cánh mở quay) */}
      {showSideHandle && (
        <g
          className="cursor-pointer hover:opacity-85"
          onClick={(e) => {
            e.stopPropagation();
            onEditDimension?.('handleHeight', node.id);
          }}
        >
          <title>{`Tay nắm khóa (Cao độ: ${handleHVal}mm - Nhấp để sửa)`}</title>
          <rect
            x={xLockOuter - 2.5}
            y={lockY - 12}
            width={5}
            height={24}
            rx={1.8}
            fill={hardwareColor}
            stroke="#0f172a"
            strokeWidth="0.7"
          />
          <rect
            x={handleSide === 'right' ? xLockOuter - 15 : xLockOuter - 1}
            y={lockY - 3.5}
            width={16}
            height={4}
            rx={1.8}
            fill={hardwareColor}
            stroke="#0f172a"
            strokeWidth="0.75"
          />
          <circle cx={xLockOuter} cy={lockY + 6.5} r={1} fill="#94a3b8" />
        </g>
      )}

      {/* 8. Viền sáng xanh khi chọn ô */}
      {isSelected && (
        <path
          d={beadInnerPath}
          fill="none"
          stroke="#2563eb"
          strokeWidth="1.8"
          strokeDasharray="4,2"
          className="pointer-events-none"
        />
      )}
    </g>
  );
};
