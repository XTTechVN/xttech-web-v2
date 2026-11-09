import React from 'react';
import { SceneCellNode } from '../../studio-types';
import { CAD_CONFIG } from '../cad-config';
import { LeafGeometry } from '../cad-leaf-geometry';

type HandleSide = 'left' | 'right';

const HARDWARE_STROKE = '#000';
const HARDWARE_STROKE_WIDTH = '0.5';
const PULL_BAR_STROKE = '#0f172a';
const PULL_CAP_COLOR = '#334155';

const LEFT_HANDLE_SASH_TYPES = ['swing_right', 'le-phai-mo-ra', 'le-phai-mo-vao', 'gap-xep-le-phai', 'lua-phai'];
const RIGHT_HANDLE_SASH_TYPES = [
  'swing_left',
  'tilt_turn',
  'le-trai-mo-ra',
  'le-trai-mo-vao',
  'gap-xep-le-trai',
  'lua-trai',
];
const BOTTOM_HANDLE_SASH_TYPES = ['awning', 'tilt', 'mo-hat', 'mo-lat'];

/** mm → px theo scale, có ngưỡng nhìn thấy tối thiểu nhỏ để phụ kiện không biến mất ở cửa rất lớn */
const hardwarePx = (mm: number, scale: number): number => Math.max(CAD_CONFIG.HARDWARE.MIN_VISIBLE_PX, mm * scale);

interface HydraulicPullProps {
  centerX: number;
  handleY: number;
  maxLengthPx: number;
  scale: number;
  hardwareColor: string;
}

/** Tay nắm ống tròn dài của cửa thủy lực */
export const CadHydraulicPull: React.FC<HydraulicPullProps> = ({ centerX, handleY, maxLengthPx, scale, hardwareColor }) => {
  const { LENGTH_MM, WIDTH_MM, CAP_LENGTH_MM } = CAD_CONFIG.HARDWARE.PULL_BAR;
  const length = Math.max(0, Math.min(maxLengthPx, hardwarePx(LENGTH_MM, scale)));
  const width = hardwarePx(WIDTH_MM, scale);
  const capLength = hardwarePx(CAP_LENGTH_MM, scale);
  const capWidth = width * 1.5;
  const capOffsetY = length * 0.35;

  return (
    <>
      <rect
        x={centerX - width / 2}
        y={handleY - length / 2}
        width={width}
        height={length}
        rx={width / 2}
        fill={hardwareColor}
        stroke={PULL_BAR_STROKE}
        strokeWidth="0.6"
      />
      {[-capOffsetY, capOffsetY].map((offsetY, capIndex) => (
        <rect
          key={capIndex}
          x={centerX - capWidth / 2}
          y={handleY + offsetY - capLength / 2}
          width={capWidth}
          height={capLength}
          rx={capLength / 4}
          fill={PULL_CAP_COLOR}
        />
      ))}
    </>
  );
};

interface LeverHandleProps {
  centerX: number;
  handleY: number;
  /** Cạnh đứng đặt tay gạt: tay gạt chĩa vào phía trong cánh */
  side: HandleSide;
  scale: number;
  hardwareColor: string;
}

/** Tay gạt (đế + cần) cho cửa mở quay / lật */
export const CadLeverHandle: React.FC<LeverHandleProps> = ({ centerX, handleY, side, scale, hardwareColor }) => {
  const { PLATE_LENGTH_MM, PLATE_WIDTH_MM, LEVER_LENGTH_MM, LEVER_THICKNESS_MM } = CAD_CONFIG.HARDWARE.LEVER;
  const plateLength = hardwarePx(PLATE_LENGTH_MM, scale);
  const plateWidth = hardwarePx(PLATE_WIDTH_MM, scale);
  const leverLength = hardwarePx(LEVER_LENGTH_MM, scale);
  const leverThickness = hardwarePx(LEVER_THICKNESS_MM, scale);
  const leverX = side === 'right' ? centerX - leverLength : centerX;

  return (
    <>
      <rect
        x={centerX - plateWidth / 2}
        y={handleY - plateLength / 2}
        width={plateWidth}
        height={plateLength}
        rx={Math.min(1.5, plateWidth / 3)}
        fill={hardwareColor}
        stroke={HARDWARE_STROKE}
        strokeWidth={HARDWARE_STROKE_WIDTH}
      />
      <circle cx={centerX} cy={handleY + plateLength / 4} r={Math.max(0.6, plateWidth / 4.5)} fill="#111" />
      <rect
        x={leverX}
        y={handleY - leverThickness / 2}
        width={leverLength}
        height={leverThickness}
        rx={Math.min(1.2, leverThickness / 2)}
        fill={hardwareColor}
        stroke={HARDWARE_STROKE}
        strokeWidth={HARDWARE_STROKE_WIDTH}
      />
    </>
  );
};

interface DHandleProps {
  centerX: number;
  handleY: number;
  side: HandleSide;
  scale: number;
  hardwareColor: string;
}

/** Tay nắm chữ D cho cửa lùa (2 cánh giữa khép đối đầu) */
const CadSlidingDHandle: React.FC<DHandleProps> = ({ centerX, handleY, side, scale, hardwareColor }) => {
  const { LENGTH_MM, PLATE_WIDTH_MM, REACH_MM } = CAD_CONFIG.HARDWARE.D_HANDLE;
  const length = hardwarePx(LENGTH_MM, scale);
  const plateWidth = hardwarePx(PLATE_WIDTH_MM, scale);
  const reach = hardwarePx(REACH_MM, scale);
  const direction = side === 'right' ? -1 : 1;
  const edgeX = centerX + direction * (plateWidth / 2);
  const outerHalf = length * 0.39;
  const innerHalf = length * 0.29;
  const innerReach = reach * 0.73;
  const arcPath =
    `M ${edgeX} ${handleY - outerHalf} ` +
    `C ${edgeX + direction * reach} ${handleY - outerHalf}, ${edgeX + direction * reach} ${handleY + outerHalf}, ${edgeX} ${handleY + outerHalf} ` +
    `L ${edgeX} ${handleY + innerHalf} ` +
    `C ${edgeX + direction * innerReach} ${handleY + innerHalf}, ${edgeX + direction * innerReach} ${handleY - innerHalf}, ${edgeX} ${handleY - innerHalf} Z`;

  return (
    <>
      <rect
        x={centerX - plateWidth / 2}
        y={handleY - length / 2}
        width={plateWidth}
        height={length}
        rx={Math.min(1, plateWidth / 4)}
        fill={hardwareColor}
        stroke={HARDWARE_STROKE}
        strokeWidth={HARDWARE_STROKE_WIDTH}
      />
      <path d={arcPath} fill={hardwareColor} stroke={HARDWARE_STROKE} strokeWidth={HARDWARE_STROKE_WIDTH} />
    </>
  );
};

interface SlidingLockProps {
  centerX: number;
  handleY: number;
  scale: number;
  hardwareColor: string;
}

/** Khóa sập âm dài của cửa lùa */
const CadSlidingLock: React.FC<SlidingLockProps> = ({ centerX, handleY, scale, hardwareColor }) => {
  const { LENGTH_MM, WIDTH_MM, CYLINDER_LENGTH_MM, KEY_LENGTH_MM } = CAD_CONFIG.HARDWARE.SLIDING_LOCK;
  const length = hardwarePx(LENGTH_MM, scale);
  const width = hardwarePx(WIDTH_MM, scale);
  const cylinderLength = hardwarePx(CYLINDER_LENGTH_MM, scale);
  const keyLength = hardwarePx(KEY_LENGTH_MM, scale);

  return (
    <>
      <rect
        x={centerX - width / 2}
        y={handleY - length / 2}
        width={width}
        height={length}
        rx={Math.min(1, width / 4)}
        fill={hardwareColor}
        stroke={HARDWARE_STROKE}
        strokeWidth={HARDWARE_STROKE_WIDTH}
      />
      <rect
        x={centerX - width / 4}
        y={handleY - cylinderLength / 2}
        width={width / 2}
        height={cylinderLength}
        rx={0.4}
        fill={PULL_CAP_COLOR}
      />
      <rect
        x={centerX - width * 0.33}
        y={handleY - keyLength / 2}
        width={width * 0.66}
        height={keyLength}
        rx={0.5}
        fill="#f8fafc"
        stroke={PULL_BAR_STROKE}
        strokeWidth="0.3"
      />
    </>
  );
};

interface DoubleDoorHardwareProps {
  leftSashRightStileCenterX: number;
  rightSashLeftStileCenterX: number;
  handleY: number;
  maxPullLengthPx: number;
  scale: number;
  hardwareColor: string;
  isHydraulic: boolean;
}

/** Tay nắm của ô 2 cánh mở quay đối xứng (swing_double) */
export const CadDoubleDoorHardware: React.FC<DoubleDoorHardwareProps> = ({
  leftSashRightStileCenterX,
  rightSashLeftStileCenterX,
  handleY,
  maxPullLengthPx,
  scale,
  hardwareColor,
  isHydraulic,
}) => (
  <g className="cursor-pointer" onClick={(e) => e.stopPropagation()}>
    {isHydraulic ? (
      <>
        <CadHydraulicPull
          centerX={leftSashRightStileCenterX}
          handleY={handleY}
          maxLengthPx={maxPullLengthPx}
          scale={scale}
          hardwareColor={hardwareColor}
        />
        <CadHydraulicPull
          centerX={rightSashLeftStileCenterX}
          handleY={handleY}
          maxLengthPx={maxPullLengthPx}
          scale={scale}
          hardwareColor={hardwareColor}
        />
      </>
    ) : (
      <CadLeverHandle
        centerX={rightSashLeftStileCenterX}
        handleY={handleY}
        side="left"
        scale={scale}
        hardwareColor={hardwareColor}
      />
    )}
  </g>
);

export interface LeafHandleFlags {
  isSlidingDoorSash: boolean;
  isDHandle: boolean;
  isRightHandle: boolean;
  isLeftHandle: boolean;
  isBottomHandle: boolean;
  isTopHandle: boolean;
}

/** Phân loại loại tay nắm / khóa của 1 cánh theo kiểu cánh và cấu hình tay nắm */
export const resolveLeafHandleFlags = (node: SceneCellNode): LeafHandleFlags => {
  const sashType = node.sashType || '';
  const isSlidingDoorSash =
    node.sashType === 'sliding' ||
    sashType.includes('lua') ||
    Boolean(node.sashArrow) ||
    node.sashZIndex !== undefined ||
    node.handleType === 'khoa-sap' ||
    node.handleType === 'd-trai' ||
    node.handleType === 'd-phai';
  const isDHandle =
    node.handleType === 'd-trai' ||
    node.handleType === 'd-phai' ||
    Boolean(node.sashJoiner) ||
    Boolean(node.sashJoinerPair);
  return {
    isSlidingDoorSash,
    isDHandle,
    isRightHandle: RIGHT_HANDLE_SASH_TYPES.includes(sashType),
    isLeftHandle: LEFT_HANDLE_SASH_TYPES.includes(sashType),
    isBottomHandle: BOTTOM_HANDLE_SASH_TYPES.includes(sashType),
    isTopHandle: sashType === 'tilt_down',
  };
};

interface CadLeafHardwareProps {
  node: SceneCellNode;
  geometry: LeafGeometry;
  handleY: number;
  scale: number;
  hardwareColor: string;
  isHydraulic: boolean;
}

/** Tay nắm & khóa của 1 cánh đơn: khóa sập / tay D (cửa lùa), tay gạt / ống thủy lực / thanh hất (mở quay, hất, lật) */
export const CadLeafHardware: React.FC<CadLeafHardwareProps> = ({
  node,
  geometry,
  handleY,
  scale,
  hardwareColor,
  isHydraulic,
}) => {
  const { sashBox, thickness } = geometry;
  const flags = resolveLeafHandleFlags(node);
  const rightStileCenterX = sashBox.x + sashBox.w - thickness.right / 2;
  const leftStileCenterX = sashBox.x + thickness.left / 2;
  const centerBarX = sashBox.x + sashBox.w / 2;
  const { LENGTH_MM: barLengthMm, THICKNESS_MM: barThicknessMm } = CAD_CONFIG.HARDWARE.AWNING_BAR;
  const barLength = hardwarePx(barLengthMm, scale);
  const barThickness = hardwarePx(barThicknessMm, scale);
  const maxPullLengthPx = sashBox.h - 40;

  const renderStopClick = (children: React.ReactNode) => (
    <g className="cursor-pointer" onClick={(e) => e.stopPropagation()}>
      {children}
    </g>
  );

  if (flags.isSlidingDoorSash) {
    const isRightSide = flags.isRightHandle || Boolean(node.sashJoiner) || node.handleType === 'd-trai';
    if (flags.isDHandle) {
      const side: HandleSide = isRightSide ? 'right' : 'left';
      return renderStopClick(
        <CadSlidingDHandle
          centerX={isRightSide ? rightStileCenterX : leftStileCenterX}
          handleY={handleY}
          side={side}
          scale={scale}
          hardwareColor={hardwareColor}
        />
      );
    }
    return renderStopClick(
      <CadSlidingLock
        centerX={flags.isRightHandle ? rightStileCenterX : leftStileCenterX}
        handleY={handleY}
        scale={scale}
        hardwareColor={hardwareColor}
      />
    );
  }

  if (flags.isBottomHandle || flags.isTopHandle) {
    const barY = flags.isBottomHandle
      ? sashBox.y + sashBox.h - thickness.bottom / 2 - barThickness / 2
      : sashBox.y + thickness.top / 2 - barThickness / 2;
    return (
      <rect
        x={centerBarX - barLength / 2}
        y={barY}
        width={barLength}
        height={barThickness}
        rx={Math.min(1, barThickness / 2)}
        fill={hardwareColor}
        stroke={HARDWARE_STROKE}
        strokeWidth={HARDWARE_STROKE_WIDTH}
      />
    );
  }

  const renderSideHandle = (side: HandleSide) => {
    const centerX = side === 'right' ? rightStileCenterX : leftStileCenterX;
    return renderStopClick(
      isHydraulic ? (
        <CadHydraulicPull
          centerX={centerX}
          handleY={handleY}
          maxLengthPx={maxPullLengthPx}
          scale={scale}
          hardwareColor={hardwareColor}
        />
      ) : (
        <CadLeverHandle centerX={centerX} handleY={handleY} side={side} scale={scale} hardwareColor={hardwareColor} />
      )
    );
  };

  return (
    <>
      {flags.isRightHandle && renderSideHandle('right')}
      {flags.isLeftHandle && renderSideHandle('left')}
    </>
  );
};
