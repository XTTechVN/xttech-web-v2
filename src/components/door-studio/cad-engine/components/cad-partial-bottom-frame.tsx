import React from 'react';
import { EdgeThickness, BottomBarSegment } from '../cad-types';

interface CadPartialBottomFrameProps {
  fx: number;
  fy: number;
  fwBox: number;
  fhBox: number;
  aluminumColor: string;
  frameEdges: EdgeThickness;
  /** Góc ghép khung hiện có: '45' | '45_top_90_bot' | '90_horiz' | '90_vert' */
  cornerJoint: string;
  isLeftBottomOpen: boolean;
  isRightBottomOpen: boolean;
  bottomBarSegments: BottomBarSegment[];
}

type Point = [number, number];

const FRAME_STROKE = '#27272a';
const FRAME_STROKE_WIDTH = '0.8';

const toPoints = (points: Point[]): string => points.map(([px, py]) => `${px},${py}`).join(' ');

/**
 * Khung bao khi cửa Hở đáy từng phần: 2 thanh đứng + thanh trên theo góc ghép của khung,
 * thanh đáy chỉ còn các đoạn dưới ô Kín. Đầu đoạn đâm vào đố đứng cắt 90°, đầu chạm khung đứng theo góc ghép.
 */
export const CadPartialBottomFrame: React.FC<CadPartialBottomFrameProps> = ({
  fx,
  fy,
  fwBox,
  fhBox,
  aluminumColor,
  frameEdges,
  cornerJoint,
  isLeftBottomOpen,
  isRightBottomOpen,
  bottomBarSegments,
}) => {
  const { top, left, right, bottom } = frameEdges;
  const x2 = fx + fwBox;
  const y2 = fy + fhBox;
  const isHoriz90 = cornerJoint === '90_horiz';
  const isVert90 = cornerJoint === '90_vert';
  const isBottom90 = cornerJoint === '45_top_90_bot';

  // Thanh trên
  const topInnerL = isVert90 ? fx + left : isHoriz90 ? fx : fx + left;
  const topOuterL = isVert90 ? fx + left : fx;
  const topOuterR = isVert90 ? x2 - right : x2;
  const topInnerR = isVert90 ? x2 - right : isHoriz90 ? x2 : x2 - right;
  const topPoly: Point[] = [
    [topOuterL, fy],
    [topOuterR, fy],
    [topInnerR, fy + top],
    [topInnerL, fy + top],
  ];

  // Chân thanh đứng: bên Hở luôn chạy xuống sàn cắt 90°; bên Kín theo góc ghép
  const resolveVerticalFoot = (isOpen: boolean): { outerY: number; innerY: number } => {
    if (isOpen || isBottom90 || isVert90) return { outerY: y2, innerY: y2 };
    if (isHoriz90) return { outerY: y2 - bottom, innerY: y2 - bottom };
    return { outerY: y2, innerY: y2 - bottom };
  };
  const topLeftY = isVert90 ? fy : isHoriz90 ? fy + top : fy;
  const topLeftInnerY = isVert90 ? fy : fy + top;
  const leftFoot = resolveVerticalFoot(isLeftBottomOpen);
  const rightFoot = resolveVerticalFoot(isRightBottomOpen);
  const leftPoly: Point[] = [
    [fx, topLeftY],
    [fx + left, topLeftInnerY],
    [fx + left, leftFoot.innerY],
    [fx, leftFoot.outerY],
  ];
  const rightPoly: Point[] = [
    [x2, topLeftY],
    [x2 - right, topLeftInnerY],
    [x2 - right, rightFoot.innerY],
    [x2, rightFoot.outerY],
  ];

  const segmentPolys = bottomBarSegments.map((segment): Point[] => {
    const startOuter = segment.isFrameStart ? (isHoriz90 ? fx : isVert90 || isBottom90 ? fx + left : fx) : segment.x0;
    const startInner = segment.isFrameStart ? (isHoriz90 ? fx : fx + left) : segment.x0;
    const endOuter = segment.isFrameEnd ? (isHoriz90 ? x2 : isVert90 || isBottom90 ? x2 - right : x2) : segment.x1;
    const endInner = segment.isFrameEnd ? (isHoriz90 ? x2 : x2 - right) : segment.x1;
    return [
      [startOuter, y2],
      [endOuter, y2],
      [endInner, y2 - bottom],
      [startInner, y2 - bottom],
    ];
  });

  return (
    <g fill={aluminumColor} stroke={FRAME_STROKE} strokeWidth={FRAME_STROKE_WIDTH} strokeLinejoin="miter">
      <polygon points={toPoints(topPoly)} />
      <polygon points={toPoints(leftPoly)} />
      <polygon points={toPoints(rightPoly)} />
      {segmentPolys.map((poly, idx) => (
        <polygon key={`bottom-seg-${idx}`} points={toPoints(poly)} />
      ))}
    </g>
  );
};
