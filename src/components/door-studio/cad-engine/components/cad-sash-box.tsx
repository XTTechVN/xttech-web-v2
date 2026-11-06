import React from 'react';
import { SashCornerJoint } from '../../studio-types';
import { EdgeThickness } from '../cad-types';

interface CadSashBoxProps {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  aluminumColor: string;
  joint?: SashCornerJoint;
  /** Độ dày đồng nhất cho cả 4 cạnh (dùng khi không truyền `thickness`) */
  effectiveSashD: number;
  /** Độ dày riêng từng cạnh (px, số thực) — ưu tiên hơn `effectiveSashD` */
  thickness?: EdgeThickness;
}

const BOX_STROKE = '#27272a';
const BOX_STROKE_WIDTH = '0.7';

const polygonPoints = (points: Array<[number, number]>): string => points.map(([px, py]) => `${px},${py}`).join(' ');

/**
 * Render Khung cánh (Sash Box) với độ dày TỪNG CẠNH và các kiểu ghép góc:
 * - 45: Ghép mòi 45° cả 4 góc
 * - 90_vert: 90° Dọc phủ (thanh đứng chạy suốt, thanh ngang lọt lòng)
 * - 90_horiz: 90° Ngang phủ (thanh ngang chạy suốt, thanh đứng lọt lòng giữa 2 thanh ngang)
 * - d_left / d_right: thanh đứng phía đó chạy suốt, phía còn lại lọt lòng giữa 2 thanh ngang
 * - 45_top_90_bot: 45° góc trên, 90° góc dưới
 */
export const CadSashBox: React.FC<CadSashBoxProps> = ({
  sx,
  sy,
  sw,
  sh,
  aluminumColor,
  joint = '45',
  effectiveSashD,
  thickness,
}) => {
  const top = thickness?.top ?? effectiveSashD;
  const right = thickness?.right ?? effectiveSashD;
  const bottom = thickness?.bottom ?? effectiveSashD;
  const left = thickness?.left ?? effectiveSashD;
  const x2 = sx + sw;
  const y2 = sy + sh;
  const innerW = Math.max(0, sw - left - right);
  const innerH = Math.max(0, sh - top - bottom);

  const renderGroup = (children: React.ReactNode) => (
    <g fill={aluminumColor} stroke={BOX_STROKE} strokeWidth={BOX_STROKE_WIDTH}>
      {children}
    </g>
  );

  if (joint === '90_vert') {
    return renderGroup(
      <>
        <rect x={sx} y={sy} width={left} height={sh} />
        <rect x={x2 - right} y={sy} width={right} height={sh} />
        <rect x={sx + left} y={sy} width={innerW} height={top} />
        <rect x={sx + left} y={y2 - bottom} width={innerW} height={bottom} />
      </>
    );
  }

  if (joint === '90_horiz') {
    return renderGroup(
      <>
        <rect x={sx} y={sy} width={sw} height={top} />
        <rect x={sx} y={y2 - bottom} width={sw} height={bottom} />
        <rect x={sx} y={sy + top} width={left} height={innerH} />
        <rect x={x2 - right} y={sy + top} width={right} height={innerH} />
      </>
    );
  }

  if (joint === 'd_left' || joint === 'd_right') {
    const isLeftFull = joint === 'd_left';
    const leftY = isLeftFull ? sy : sy + top;
    const leftH = isLeftFull ? sh : innerH;
    const rightY = isLeftFull ? sy + top : sy;
    const rightH = isLeftFull ? innerH : sh;
    const barX = isLeftFull ? sx + left : sx;
    const barW = sw - (isLeftFull ? left : 0) - (isLeftFull ? 0 : right);
    return renderGroup(
      <>
        <rect x={barX} y={sy} width={Math.max(0, barW)} height={top} />
        <rect x={barX} y={y2 - bottom} width={Math.max(0, barW)} height={bottom} />
        <rect x={sx} y={leftY} width={left} height={leftH} />
        <rect x={x2 - right} y={rightY} width={right} height={rightH} />
      </>
    );
  }

  if (joint === '45_top_90_bot') {
    return renderGroup(
      <>
        <polygon points={polygonPoints([[sx, sy], [x2, sy], [x2 - right, sy + top], [sx + left, sy + top]])} />
        <rect x={sx + left} y={y2 - bottom} width={innerW} height={bottom} />
        <polygon points={polygonPoints([[sx, sy], [sx + left, sy + top], [sx + left, y2], [sx, y2]])} />
        <polygon points={polygonPoints([[x2, sy], [x2 - right, sy + top], [x2 - right, y2], [x2, y2]])} />
      </>
    );
  }

  // Mặc định: Ghép mòi 45° 4 góc
  return renderGroup(
    <>
      <polygon points={polygonPoints([[sx, sy], [x2, sy], [x2 - right, sy + top], [sx + left, sy + top]])} />
      <polygon points={polygonPoints([[sx, y2], [x2, y2], [x2 - right, y2 - bottom], [sx + left, y2 - bottom]])} />
      <polygon points={polygonPoints([[sx, sy], [sx + left, sy + top], [sx + left, y2 - bottom], [sx, y2]])} />
      <polygon points={polygonPoints([[x2, sy], [x2 - right, sy + top], [x2 - right, y2 - bottom], [x2, y2]])} />
    </>
  );
};
