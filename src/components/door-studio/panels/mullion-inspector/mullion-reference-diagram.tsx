'use client';

import React from 'react';
import { MullionReferenceContext, MullionReferenceMode, formatReferenceValue } from '../../utils/mullion-reference-utils';

interface MullionReferenceDiagramProps {
  ctx: MullionReferenceContext;
  mode: MullionReferenceMode;
  anchorPos: number;
  previewPos: number;
  distanceDisplay: number;
  isValid: boolean;
}

export const MullionReferenceDiagram: React.FC<MullionReferenceDiagramProps> = ({
  ctx,
  mode,
  anchorPos,
  previewPos,
  distanceDisplay,
  isValid,
}) => {
  const vbW = 320;
  const vbH = 104;
  const padX = 20;
  const padY = 14;
  const boxW = vbW - padX * 2;
  const boxH = vbH - padY * 2;
  const isVert = ctx.direction === 'vertical';
  const span = Math.max(1, ctx.scopeSpan);
  const perpSpan = Math.max(1, ctx.scopePerpSpan);

  const mapAxis = (val: number) =>
    isVert ? padX + (val / span) * boxW : padY + (val / span) * boxH;
  const mapPerp = (val: number) =>
    isVert ? padY + (val / perpSpan) * boxH : padX + (val / perpSpan) * boxW;

  const clampedPreview = Math.max(0, Math.min(span, previewPos));
  const minCoord = mapAxis(ctx.absMinPos);
  const maxCoord = mapAxis(ctx.absMaxPos);
  const perp0 = mapPerp(ctx.targetPerpStart);
  const perp1 = mapPerp(ctx.targetPerpEnd);
  const anchorCoord = mapAxis(Math.max(0, Math.min(span, anchorPos)));
  const previewCoord = mapAxis(clampedPreview);
  const targetColor = isValid ? '#f97316' : '#e11d48';
  const midPerp = (perp0 + perp1) / 2;

  const labelText = `${formatReferenceValue(distanceDisplay)} mm`;
  const labelW = Math.max(48, labelText.length * 6.5 + 12);
  const midAxis = (anchorCoord + previewCoord) / 2;

  return (
    <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-2">
      <svg
        viewBox={`0 0 ${vbW} ${vbH}`}
        className="w-full h-[92px] select-none"
        role="img"
        aria-label="Sơ đồ mốc tham chiếu đố"
      >
        <rect
          x={padX}
          y={padY}
          width={boxW}
          height={boxH}
          rx={4}
          fill="#ffffff"
          stroke="#cbd5e1"
          strokeWidth={1.5}
        />

        {/* Vùng biên hợp lệ [absMinPos, absMaxPos] */}
        <rect
          x={isVert ? minCoord : perp0}
          y={isVert ? perp0 : minCoord}
          width={isVert ? Math.max(2, maxCoord - minCoord) : Math.max(2, perp1 - perp0)}
          height={isVert ? Math.max(2, perp1 - perp0) : Math.max(2, maxCoord - minCoord)}
          fill={isValid ? '#ccfbf1' : '#ffe4e6'}
          fillOpacity={0.55}
          stroke={isValid ? '#14b8a6' : '#f43f5e'}
          strokeWidth={0.8}
          strokeDasharray="3,2"
        />

        {/* Các đố tham chiếu cùng phương */}
        {ctx.refMullions.map((ref) => {
          const c = mapAxis(ref.coord);
          const isActive = mode === 'from_ref_mullion' && Math.abs(ref.coord - anchorPos) < 0.5;
          return ref.perpIntervals.map((iv, idx) => {
            const p0 = mapPerp(iv.start);
            const p1 = mapPerp(iv.end);
            return (
              <line
                key={`${ref.id}-${idx}`}
                x1={isVert ? c : p0}
                y1={isVert ? p0 : c}
                x2={isVert ? c : p1}
                y2={isVert ? p1 : c}
                stroke={isActive ? '#045863' : '#94a3b8'}
                strokeWidth={isActive ? 2.6 : 1.3}
                strokeDasharray={isActive ? undefined : '2.5,2'}
              />
            );
          });
        })}

        {/* Mốc cạnh khung/mép cánh khi chọn from_start hoặc from_end */}
        {mode !== 'from_ref_mullion' && (
          <line
            x1={isVert ? anchorCoord : padX}
            y1={isVert ? padY : anchorCoord}
            x2={isVert ? anchorCoord : padX + boxW}
            y2={isVert ? padY + boxH : anchorCoord}
            stroke="#045863"
            strokeWidth={3}
          />
        )}

        {/* Thanh đố đang chỉnh sửa tại previewPos */}
        <line
          x1={isVert ? previewCoord : perp0}
          y1={isVert ? perp0 : previewCoord}
          x2={isVert ? previewCoord : perp1}
          y2={isVert ? perp1 : previewCoord}
          stroke={targetColor}
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* Đường gióng & badge khoảng cách */}
        <line
          x1={isVert ? anchorCoord : midPerp}
          y1={isVert ? midPerp : anchorCoord}
          x2={isVert ? previewCoord : midPerp}
          y2={isVert ? midPerp : previewCoord}
          stroke="#045863"
          strokeWidth={1.3}
        />
        <circle cx={isVert ? anchorCoord : midPerp} cy={isVert ? midPerp : anchorCoord} r={2.5} fill="#045863" />
        <circle cx={isVert ? previewCoord : midPerp} cy={isVert ? midPerp : previewCoord} r={2.5} fill={targetColor} />

        <g transform={`translate(${isVert ? Math.max(padX + labelW / 2, Math.min(padX + boxW - labelW / 2, midAxis)) : Math.min(padX + boxW - labelW / 2 - 4, midPerp + labelW / 2 + 8)}, ${isVert ? Math.max(padY + 12, midPerp - 14) : Math.max(padY + 10, Math.min(padY + boxH - 10, midAxis))})`}>
          <rect
            x={-labelW / 2}
            y={-9}
            width={labelW}
            height={18}
            rx={6}
            fill="#045863"
          />
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fill="#ffffff"
            fontSize={9.5}
            fontWeight={700}
            className="font-mono tabular-nums"
          >
            {labelText}
          </text>
        </g>
      </svg>
    </div>
  );
};
