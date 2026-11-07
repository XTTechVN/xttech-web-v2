import React from 'react';
import { FrameConfig, FrameShape } from '../../studio-types';
import { EdgeThickness, BottomBarSegment } from '../cad-types';
import { CadPartialBottomFrame } from './cad-partial-bottom-frame';

interface CadMiteredFrameProps {
  fx: number;
  fy: number;
  fwBox: number;
  fhBox: number;
  aluminumColor: string;
  /** Độ dày thật từng cạnh khung bao (px) */
  frameEdges: EdgeThickness;
  frameShape: FrameShape;
  framesCount: number;
  frameConfig?: FrameConfig;
  isHydraulic?: boolean;
  /** Hở đáy hiệu lực khi các ô ghi đè đồng loạt Hở/Kín (không truyền = theo frameConfig như cũ) */
  isOpenBottomOverride?: boolean;
  /** Hở đáy từng phần (ghi đè theo ô): dựng khung theo các đoạn thanh đáy còn lại */
  partialBottom?: {
    isLeftBottomOpen: boolean;
    isRightBottomOpen: boolean;
    bottomBarSegments: BottomBarSegment[];
  };
}

const FRAME_STROKE = '#27272a';
const FRAME_STROKE_WIDTH = '0.8';

const toPoints = (points: Array<[number, number]>): string => points.map(([px, py]) => `${px},${py}`).join(' ');

/**
 * Render Khung bao ngoài (Frame Box) với độ dày TỪNG CẠNH, xử lý hở sàn (open-bottom)
 * và ghép góc mòi 45°/90° (mối mòi 45° đúng cả khi 2 cạnh kề khác độ dày).
 */
export const CadMiteredFrame: React.FC<CadMiteredFrameProps> = ({
  fx,
  fy,
  fwBox,
  fhBox,
  aluminumColor,
  frameEdges,
  frameShape,
  framesCount,
  frameConfig,
  isHydraulic = false,
  partialBottom,
  isOpenBottomOverride,
}) => {
  if (frameShape === 'round_top_2' && framesCount === 1) {
    const cr = Math.min(40, Math.round(fwBox * 0.2));
    return (
      <g fill={aluminumColor} stroke={FRAME_STROKE} strokeWidth={FRAME_STROKE_WIDTH}>
        <path
          d={`M ${fx} ${fy + fhBox} L ${fx} ${fy + cr} Q ${fx} ${fy} ${fx + cr} ${fy} L ${fx + fwBox - cr} ${fy} Q ${fx + fwBox} ${fy} ${fx + fwBox} ${fy + cr} L ${fx + fwBox} ${fy + fhBox} Z`}
        />
      </g>
    );
  }

  const isOpenBottom =
    isOpenBottomOverride ?? (frameConfig?.isOpenBottom !== undefined ? frameConfig.isOpenBottom : isHydraulic);
  const cornerJoint = frameConfig?.cornerJoint ?? '45';
  if (partialBottom) {
    return (
      <CadPartialBottomFrame
        fx={fx}
        fy={fy}
        fwBox={fwBox}
        fhBox={fhBox}
        aluminumColor={aluminumColor}
        frameEdges={frameEdges}
        cornerJoint={cornerJoint}
        isLeftBottomOpen={partialBottom.isLeftBottomOpen}
        isRightBottomOpen={partialBottom.isRightBottomOpen}
        bottomBarSegments={partialBottom.bottomBarSegments}
      />
    );
  }
  const { top, left, right, bottom } = frameEdges;
  const x2 = fx + fwBox;
  const y2 = fy + fhBox;
  const bottomD = isOpenBottom ? 0 : bottom;
  const midW = Math.max(0, fwBox - left - right);

  const renderGroup = (children: React.ReactNode, isMiter = false) => (
    <g
      fill={aluminumColor}
      stroke={FRAME_STROKE}
      strokeWidth={FRAME_STROKE_WIDTH}
      strokeLinejoin={isMiter ? 'miter' : undefined}
    >
      {children}
    </g>
  );

  const topMiter = <polygon points={toPoints([[fx, fy], [x2, fy], [x2 - right, fy + top], [fx + left, fy + top]])} />;
  const bottomMiter = (
    <polygon points={toPoints([[fx, y2], [x2, y2], [x2 - right, y2 - bottom], [fx + left, y2 - bottom]])} />
  );
  const leftMiter = (
    <polygon points={toPoints([[fx, fy], [fx + left, fy + top], [fx + left, y2 - bottomD], [fx, y2]])} />
  );
  const rightMiter = (
    <polygon points={toPoints([[x2, fy], [x2 - right, fy + top], [x2 - right, y2 - bottomD], [x2, y2]])} />
  );

  // 1. Khung hở 3 cạnh (chạm sàn - Open Bottom): không có thanh đáy
  if (isOpenBottom && cornerJoint === '90_horiz') {
    return renderGroup(
      <>
        <rect x={fx} y={fy} width={fwBox} height={top} />
        <rect x={fx} y={fy + top} width={left} height={fhBox - top} />
        <rect x={x2 - right} y={fy + top} width={right} height={fhBox - top} />
      </>
    );
  }
  if (isOpenBottom && cornerJoint === '90_vert') {
    return renderGroup(
      <>
        <rect x={fx} y={fy} width={left} height={fhBox} />
        <rect x={x2 - right} y={fy} width={right} height={fhBox} />
        <rect x={fx + left} y={fy} width={midW} height={top} />
      </>
    );
  }
  if (isOpenBottom) {
    // Miter 45° 2 góc trên, 90° đáy bằng
    return renderGroup(
      <>
        {topMiter}
        {leftMiter}
        {rightMiter}
      </>,
      true
    );
  }

  // 2. 4 cạnh kín: 90° Ngang phủ
  if (cornerJoint === '90_horiz') {
    return renderGroup(
      <>
        <rect x={fx} y={fy} width={fwBox} height={top} />
        <rect x={fx} y={y2 - bottom} width={fwBox} height={bottom} />
        <rect x={fx} y={fy + top} width={left} height={Math.max(0, fhBox - top - bottom)} />
        <rect x={x2 - right} y={fy + top} width={right} height={Math.max(0, fhBox - top - bottom)} />
      </>
    );
  }

  // 3. 4 cạnh kín: 90° Dọc phủ
  if (cornerJoint === '90_vert') {
    return renderGroup(
      <>
        <rect x={fx} y={fy} width={left} height={fhBox} />
        <rect x={x2 - right} y={fy} width={right} height={fhBox} />
        <rect x={fx + left} y={fy} width={midW} height={top} />
        <rect x={fx + left} y={y2 - bottom} width={midW} height={bottom} />
      </>
    );
  }

  // 4. 4 cạnh kín: 45° Trên - 90° Dưới (2 thanh đứng chạy suốt xuống đáy, thanh ngang đáy lọt lòng theo profile đáy thật)
  if (cornerJoint === '45_top_90_bot') {
    return renderGroup(
      <>
        {topMiter}
        <rect x={fx + left} y={y2 - bottom} width={midW} height={bottom} />
        <polygon points={toPoints([[fx, fy], [fx + left, fy + top], [fx + left, y2], [fx, y2]])} />
        <polygon points={toPoints([[x2, fy], [x2 - right, fy + top], [x2 - right, y2], [x2, y2]])} />
      </>,
      true
    );
  }

  // 5. Mặc định: Ghép mòi 45° cả 4 góc
  return renderGroup(
    <>
      {topMiter}
      {bottomMiter}
      {leftMiter}
      {rightMiter}
    </>,
    true
  );
};
