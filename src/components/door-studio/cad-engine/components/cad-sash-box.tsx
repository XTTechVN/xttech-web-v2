import React from 'react';
import { SashCornerJoint } from '../../studio-types';

interface CadSashBoxProps {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  aluminumColor: string;
  joint?: SashCornerJoint;
  effectiveSashD: number;
}

/**
 * Render Khung cánh (Sash Box) với các kiểu ghép góc:
 * - 45: Ghép mòi 45° cả 4 góc
 * - 90_vert: 90° Dọc phủ (thanh đứng chạy suốt, thanh ngang lọt lòng)
 * - 90_horiz: 90° Ngang phủ (thanh ngang chạy suốt, thanh đứng lọt lòng)
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
}) => {
  const sd = effectiveSashD;

  if (joint === '90_vert') {
    return (
      <g fill={aluminumColor} stroke="#27272a" strokeWidth="0.7">
        <rect x={sx} y={sy} width={sd} height={sh} />
        <rect x={sx + sw - sd} y={sy} width={sd} height={sh} />
        <rect x={sx + sd} y={sy} width={Math.max(0, sw - 2 * sd)} height={sd} />
        <rect x={sx + sd} y={sy + sh - sd} width={Math.max(0, sw - 2 * sd)} height={sd} />
      </g>
    );
  }

  if (joint === '90_horiz') {
    return (
      <g fill={aluminumColor} stroke="#27272a" strokeWidth="0.7">
        <rect x={sx} y={sy} width={sw} height={sd} />
        <rect x={sx} y={sy + sh - sd} width={sw} height={sd} />
        <rect x={sx + sd} y={sy + sd} width={sd} height={Math.max(0, sh - 2 * sd)} />
        <rect x={sx + sw - sd} y={sy + sd} width={sd} height={Math.max(0, sh - 2 * sd)} />
      </g>
    );
  }

  if (joint === '45_top_90_bot') {
    return (
      <g fill={aluminumColor} stroke="#27272a" strokeWidth="0.7">
        <polygon points={`${sx},${sy} ${sx + sw},${sy} ${sx + sw - sd},${sy + sd} ${sx + sd},${sy + sd}`} />
        <rect x={sx + sd} y={sy + sh - sd} width={Math.max(0, sw - 2 * sd)} height={sd} />
        <polygon points={`${sx},${sy} ${sx + sd},${sy + sd} ${sx + sd},${sy + sh} ${sx},${sy + sh}`} />
        <polygon points={`${sx + sw},${sy} ${sx + sw - sd},${sy + sd} ${sx + sw - sd},${sy + sh} ${sx + sw},${sy + sh}`} />
      </g>
    );
  }

  // Mặc định: Ghép mòi 45° 4 góc
  return (
    <g fill={aluminumColor} stroke="#27272a" strokeWidth="0.7">
      <polygon points={`${sx},${sy} ${sx + sw},${sy} ${sx + sw - sd},${sy + sd} ${sx + sd},${sy + sd}`} />
      <polygon points={`${sx},${sy + sh} ${sx + sw},${sy + sh} ${sx + sw - sd},${sy + sh - sd} ${sx + sd},${sy + sh - sd}`} />
      <polygon points={`${sx},${sy} ${sx + sd},${sy + sd} ${sx + sd},${sy + sh - sd} ${sx},${sy + sh}`} />
      <polygon points={`${sx + sw},${sy} ${sx + sw - sd},${sy + sd} ${sx + sw - sd},${sy + sh - sd} ${sx + sw},${sy + sh}`} />
    </g>
  );
};
