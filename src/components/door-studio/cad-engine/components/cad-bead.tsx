import React from 'react';
import { CAD_CONFIG } from '../cad-config';

export interface CadBeadResult {
  el: React.ReactNode;
  gx2: number;
  gy2: number;
  gw2: number;
  gh2: number;
}

/**
 * Render Nẹp kính (Glazing Bead): Dải nhôm 4 thanh ghép mòi 45° kẹp giữa khung cánh/khung bao và mặt kính.
 * Trả về element SVG kèm tọa độ lòng kính (gx2, gy2, gw2, gh2).
 */
export const renderCadBead = (
  gx: number,
  gy: number,
  gw: number,
  gh: number,
  key: string,
  aluminumColor: string,
  effectiveBeadW: number,
  jointType: '90' | '45' = '90'
): CadBeadResult => {
  const maxAllowed = Math.max(2, Math.floor((Math.min(gw, gh) - 4) / 2));
  const targetBw = Math.min(
    effectiveBeadW,
    Math.max(CAD_CONFIG.BEAD.MIN_W, Math.floor(Math.min(gw, gh) * CAD_CONFIG.BEAD.MAX_PANE_PERCENT))
  );
  const bw = Math.max(2, Math.min(targetBw, maxAllowed));
  const gx2 = gx + bw;
  const gy2 = gy + bw;
  const gw2 = Math.max(2, gw - 2 * bw);
  const gh2 = Math.max(2, gh - 2 * bw);

  const el = jointType === '45' ? (
    <g key={key} fill={aluminumColor} stroke="#27272a" strokeWidth="0.5" strokeLinejoin="miter">
      {/* Top Bead */}
      <polygon points={`${gx},${gy} ${gx + gw},${gy} ${gx + gw - bw},${gy + bw} ${gx + bw},${gy + bw}`} />
      {/* Bottom Bead */}
      <polygon points={`${gx},${gy + gh} ${gx + bw},${gy + gh - bw} ${gx + gw - bw},${gy + gh - bw} ${gx + gw},${gy + gh}`} />
      {/* Left Bead */}
      <polygon points={`${gx},${gy} ${gx + bw},${gy + bw} ${gx + bw},${gy + gh - bw} ${gx},${gy + gh}`} />
      {/* Right Bead */}
      <polygon points={`${gx + gw},${gy} ${gx + gw},${gy + gh} ${gx + gw - bw},${gy + gh - bw} ${gx + gw - bw},${gy + bw}`} />
    </g>
  ) : (
    <g key={key} fill={aluminumColor} stroke="#27272a" strokeWidth="0.5" strokeLinejoin="miter">
      {/* Nẹp đứng chạy suốt (Left & Right) */}
      <rect x={gx} y={gy} width={bw} height={gh} />
      <rect x={gx + gw - bw} y={gy} width={bw} height={gh} />
      {/* Nẹp ngang ăn vuông góc 90° vào nẹp đứng (Top & Bottom) */}
      <rect x={gx + bw} y={gy} width={Math.max(0, gw - 2 * bw)} height={bw} />
      <rect x={gx + bw} y={gy + gh - bw} width={Math.max(0, gw - 2 * bw)} height={bw} />
    </g>
  );

  return { el, gx2, gy2, gw2, gh2 };
};
