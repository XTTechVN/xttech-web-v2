'use client';

import React from 'react';

interface GrilleCadDimensionsProps {
  glassW: number;
  glassH: number;
  hasBorder: boolean;
  hasCorner: boolean;
  hasGrid: boolean;
  borderOffset: number;
  cornerSize: number;
  colPositions: number[];
  rowPositions: number[];
  colSpans: number[];
  rowSpans: number[];
  dimFontSize: number;
  onOpenEditDim: (
    type: 'col-span' | 'row-span' | 'border-offset' | 'corner-size',
    index: number | undefined,
    label: string,
    currentValue: number
  ) => void;
}

export const GrilleCadDimensions: React.FC<GrilleCadDimensionsProps> = ({
  glassW,
  glassH,
  hasBorder,
  hasCorner,
  hasGrid,
  borderOffset,
  cornerSize,
  colPositions,
  rowPositions,
  colSpans,
  rowSpans,
  dimFontSize,
  onOpenEditDim,
}) => {
  return (
    <g id="cad-dimensions" stroke="#0284c7" fill="#0284c7" fontFamily="monospace" fontWeight="bold">
      {/* ================= PHÍA TRÊN (TOP) ================= */}
      {hasBorder && (
        <g id="top-dim-border">
          <line x1="0" y1="-34" x2={borderOffset} y2="-34" strokeWidth="1.4" markerStart="url(#cad-arrow)" markerEnd="url(#cad-arrow)" />
          <line x1="0" y1="0" x2="0" y2="-48" strokeWidth="0.8" opacity="0.5" />
          <line x1={borderOffset} y1={borderOffset} x2={borderOffset} y2="-48" strokeWidth="0.8" opacity="0.5" />
          {(() => {
            const val = borderOffset;
            const badgeW = Math.max(dimFontSize * 2.2, String(val).length * dimFontSize * 0.72 + 18);
            const badgeH = dimFontSize * 1.45;
            const midX = borderOffset / 2;
            const dimY = -34;
            return (
              <g
                className="cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEditDim('border-offset', undefined, 'Khoảng cách lề viền', borderOffset);
                }}
              >
                <rect
                  x={midX - badgeW / 2}
                  y={dimY - badgeH / 2}
                  width={badgeW}
                  height={badgeH}
                  rx="6"
                  fill="#ffffff"
                  stroke="#0284c7"
                  strokeWidth="1.6"
                  className="group-hover:fill-blue-50 group-hover:stroke-blue-600 transition-all drop-shadow-xs"
                />
                <text
                  x={midX}
                  y={dimY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={dimFontSize}
                  fontWeight="bold"
                  fill="#0284c7"
                  className="group-hover:fill-blue-800"
                >
                  {val}
                </text>
              </g>
            );
          })()}
        </g>
      )}

      {hasCorner && (
        <g id="top-dim-corner">
          <line x1="0" y1="-82" x2={cornerSize} y2="-82" strokeWidth="1.4" markerStart="url(#cad-arrow)" markerEnd="url(#cad-arrow)" />
          <line x1="0" y1="-34" x2="0" y2="-96" strokeWidth="0.8" opacity="0.5" />
          <line x1={cornerSize} y1={cornerSize} x2={cornerSize} y2="-96" strokeWidth="0.8" opacity="0.5" />
          {(() => {
            const val = cornerSize;
            const badgeW = Math.max(dimFontSize * 2.2, String(val).length * dimFontSize * 0.72 + 18);
            const badgeH = dimFontSize * 1.45;
            const midX = cornerSize / 2;
            const dimY = -82;
            return (
              <g
                className="cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEditDim('corner-size', undefined, 'Chiều dài nan góc', cornerSize);
                }}
              >
                <rect
                  x={midX - badgeW / 2}
                  y={dimY - badgeH / 2}
                  width={badgeW}
                  height={badgeH}
                  rx="6"
                  fill="#ffffff"
                  stroke="#0284c7"
                  strokeWidth="1.6"
                  className="group-hover:fill-blue-50 group-hover:stroke-blue-600 transition-all drop-shadow-xs"
                />
                <text
                  x={midX}
                  y={dimY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={dimFontSize}
                  fontWeight="bold"
                  fill="#0284c7"
                  className="group-hover:fill-blue-800"
                >
                  {val}
                </text>
              </g>
            );
          })()}
        </g>
      )}

      {/* ================= PHÍA TRÁI (LEFT) ================= */}
      {hasBorder && (
        <g id="left-dim-border">
          <line x1="-34" y1="0" x2="-34" y2={borderOffset} strokeWidth="1.4" markerStart="url(#cad-arrow)" markerEnd="url(#cad-arrow)" />
          <line x1="0" y1="0" x2="-48" y2="0" strokeWidth="0.8" opacity="0.5" />
          <line x1={borderOffset} y1={borderOffset} x2="-48" y2={borderOffset} strokeWidth="0.8" opacity="0.5" />
          {(() => {
            const val = borderOffset;
            const badgeW = Math.max(dimFontSize * 2.2, String(val).length * dimFontSize * 0.72 + 18);
            const badgeH = dimFontSize * 1.45;
            const dimX = -34;
            const midY = borderOffset / 2;
            return (
              <g
                className="cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEditDim('border-offset', undefined, 'Khoảng cách lề viền', borderOffset);
                }}
              >
                <rect
                  x={dimX - badgeW / 2}
                  y={midY - badgeH / 2}
                  width={badgeW}
                  height={badgeH}
                  rx="6"
                  fill="#ffffff"
                  stroke="#0284c7"
                  strokeWidth="1.6"
                  className="group-hover:fill-blue-50 group-hover:stroke-blue-600 transition-all drop-shadow-xs"
                />
                <text
                  x={dimX}
                  y={midY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={dimFontSize}
                  fontWeight="bold"
                  fill="#0284c7"
                  className="group-hover:fill-blue-800"
                >
                  {val}
                </text>
              </g>
            );
          })()}
        </g>
      )}

      {hasCorner && (
        <g id="left-dim-corner">
          <line x1="-82" y1="0" x2="-82" y2={cornerSize} strokeWidth="1.4" markerStart="url(#cad-arrow)" markerEnd="url(#cad-arrow)" />
          <line x1="-34" y1="0" x2="-96" y2="0" strokeWidth="0.8" opacity="0.5" />
          <line x1={cornerSize} y1={cornerSize} x2="-96" y2={cornerSize} strokeWidth="0.8" opacity="0.5" />
          {(() => {
            const val = cornerSize;
            const badgeW = Math.max(dimFontSize * 2.2, String(val).length * dimFontSize * 0.72 + 18);
            const badgeH = dimFontSize * 1.45;
            const dimX = -82;
            const midY = cornerSize / 2;
            return (
              <g
                className="cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEditDim('corner-size', undefined, 'Chiều dài nan góc', cornerSize);
                }}
              >
                <rect
                  x={dimX - badgeW / 2}
                  y={midY - badgeH / 2}
                  width={badgeW}
                  height={badgeH}
                  rx="6"
                  fill="#ffffff"
                  stroke="#0284c7"
                  strokeWidth="1.6"
                  className="group-hover:fill-blue-50 group-hover:stroke-blue-600 transition-all drop-shadow-xs"
                />
                <text
                  x={dimX}
                  y={midY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={dimFontSize}
                  fontWeight="bold"
                  fill="#0284c7"
                  className="group-hover:fill-blue-800"
                >
                  {val}
                </text>
              </g>
            );
          })()}
        </g>
      )}

      {/* ================= PHÍA DƯỚI (BOTTOM) ================= */}
      {hasGrid && colPositions.length > 0 && (
        <g id="bot-dim-spans">
          {colSpans.map((spanW, idx) => {
            const startX = idx === 0 ? 0 : colPositions[idx - 1];
            const endX = idx === colSpans.length - 1 ? glassW : colPositions[idx];
            const midX = (startX + endX) / 2;
            const textVal = Math.round(spanW);
            const badgeW = Math.max(dimFontSize * 2.2, String(textVal).length * dimFontSize * 0.72 + 18);
            const badgeH = dimFontSize * 1.45;
            const dimY = glassH + 34;
            return (
              <g key={`col-span-${idx}`}>
                <line
                  x1={startX}
                  y1={dimY}
                  x2={endX}
                  y2={dimY}
                  strokeWidth="1.4"
                  markerStart="url(#cad-arrow)"
                  markerEnd="url(#cad-arrow)"
                />
                <line x1={startX} y1={glassH} x2={startX} y2={dimY + 14} strokeWidth="0.8" opacity="0.5" />
                <g
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenEditDim('col-span', idx, `Khoang cột ${idx + 1}`, textVal);
                  }}
                >
                  <rect
                    x={midX - badgeW / 2}
                    y={dimY - badgeH / 2}
                    width={badgeW}
                    height={badgeH}
                    rx="6"
                    fill="#ffffff"
                    stroke="#0284c7"
                    strokeWidth="1.6"
                    className="group-hover:fill-blue-50 group-hover:stroke-blue-600 transition-all drop-shadow-xs"
                  />
                  <text
                    x={midX}
                    y={dimY}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={dimFontSize}
                    fontWeight="bold"
                    fill="#0284c7"
                    className="group-hover:fill-blue-800"
                  >
                    {textVal}
                  </text>
                </g>
              </g>
            );
          })}
          <line x1={glassW} y1={glassH} x2={glassW} y2={glassH + 34 + 14} strokeWidth="0.8" opacity="0.5" />
        </g>
      )}

      {/* Dòng 2: Tổng chiều rộng kính (glassW) */}
      {(() => {
        const dimY = glassH + 86;
        const badgeW = Math.max(dimFontSize * 2.4, String(glassW).length * dimFontSize * 0.72 + 20);
        const badgeH = dimFontSize * 1.45;
        return (
          <g id="bot-dim-total">
            <line
              x1="0"
              y1={dimY}
              x2={glassW}
              y2={dimY}
              strokeWidth="1.6"
              markerStart="url(#cad-arrow)"
              markerEnd="url(#cad-arrow)"
            />
            <line x1="0" y1={glassH + 34} x2="0" y2={dimY + 14} strokeWidth="0.8" opacity="0.5" />
            <line x1={glassW} y1={glassH + 34} x2={glassW} y2={dimY + 14} strokeWidth="0.8" opacity="0.5" />
            <g>
              <rect
                x={glassW / 2 - badgeW / 2}
                y={dimY - badgeH / 2}
                width={badgeW}
                height={badgeH}
                rx="6"
                fill="#ffffff"
                stroke="#0284c7"
                strokeWidth="1.8"
                className="drop-shadow-xs"
              />
              <text
                x={glassW / 2}
                y={dimY}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={dimFontSize}
                fontWeight="bold"
                fill="#0284c7"
              >
                {glassW}
              </text>
            </g>
          </g>
        );
      })()}

      {/* ================= PHÍA PHẢI (RIGHT) ================= */}
      {hasGrid && rowPositions.length > 0 && (
        <g id="right-dim-spans">
          {rowSpans.map((spanH, idx) => {
            const startY = idx === 0 ? 0 : rowPositions[idx - 1];
            const endY = idx === rowSpans.length - 1 ? glassH : rowPositions[idx];
            const midY = (startY + endY) / 2;
            const textVal = Math.round(spanH);
            const badgeW = Math.max(dimFontSize * 2.2, String(textVal).length * dimFontSize * 0.72 + 18);
            const badgeH = dimFontSize * 1.45;
            const dimX = glassW + 34;
            return (
              <g key={`row-span-${idx}`}>
                <line
                  x1={dimX}
                  y1={startY}
                  x2={dimX}
                  y2={endY}
                  strokeWidth="1.4"
                  markerStart="url(#cad-arrow)"
                  markerEnd="url(#cad-arrow)"
                />
                <line x1={glassW} y1={startY} x2={dimX + 14} y2={startY} strokeWidth="0.8" opacity="0.5" />
                <g
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenEditDim('row-span', idx, `Khoang hàng ${idx + 1}`, textVal);
                  }}
                >
                  <rect
                    x={dimX - badgeW / 2}
                    y={midY - badgeH / 2}
                    width={badgeW}
                    height={badgeH}
                    rx="6"
                    fill="#ffffff"
                    stroke="#0284c7"
                    strokeWidth="1.6"
                    className="group-hover:fill-blue-50 group-hover:stroke-blue-600 transition-all drop-shadow-xs"
                  />
                  <text
                    x={dimX}
                    y={midY}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={dimFontSize}
                    fontWeight="bold"
                    fill="#0284c7"
                    className="group-hover:fill-blue-800"
                  >
                    {textVal}
                  </text>
                </g>
              </g>
            );
          })}
          <line x1={glassW} y1={glassH} x2={glassW + 34 + 14} y2={glassH} strokeWidth="0.8" opacity="0.5" />
        </g>
      )}

      {/* Dòng 2: Tổng chiều cao kính (glassH) */}
      {(() => {
        const dimX = glassW + 86;
        const badgeW = Math.max(dimFontSize * 2.4, String(glassH).length * dimFontSize * 0.72 + 20);
        const badgeH = dimFontSize * 1.45;
        return (
          <g id="right-dim-total">
            <line
              x1={dimX}
              y1="0"
              x2={dimX}
              y2={glassH}
              strokeWidth="1.6"
              markerStart="url(#cad-arrow)"
              markerEnd="url(#cad-arrow)"
            />
            <line x1={glassW + 34} y1="0" x2={dimX + 14} y2="0" strokeWidth="0.8" opacity="0.5" />
            <line x1={glassW + 34} y1={glassH} x2={dimX + 14} y2={glassH} strokeWidth="0.8" opacity="0.5" />
            <g>
              <rect
                x={dimX - badgeW / 2}
                y={glassH / 2 - badgeH / 2}
                width={badgeW}
                height={badgeH}
                rx="6"
                fill="#ffffff"
                stroke="#0284c7"
                strokeWidth="1.8"
                className="drop-shadow-xs"
              />
              <text
                x={dimX}
                y={glassH / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={dimFontSize}
                fontWeight="bold"
                fill="#0284c7"
              >
                {glassH}
              </text>
            </g>
          </g>
        );
      })()}
    </g>
  );
};
