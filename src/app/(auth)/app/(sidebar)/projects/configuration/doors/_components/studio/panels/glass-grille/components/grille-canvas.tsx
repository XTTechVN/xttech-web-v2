'use client';

import React from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { GlassGrilleMotif } from '../../../studio-types';
import { GrilleMotifSvg } from '../../grille-motif-svgs';
import { DragTarget } from '../types';
import { GrilleCadDimensions } from './grille-cad-dimensions';

interface GrilleCanvasProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
  glassW: number;
  glassH: number;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  dragTarget: DragTarget | null;
  hasGrid: boolean;
  hasBorder: boolean;
  hasCorner: boolean;
  barWidth: number;
  barColor: string;
  borderOffset: number;
  cornerSize: number;
  colPositions: number[];
  rowPositions: number[];
  colSpans: number[];
  rowSpans: number[];
  motifs: GlassGrilleMotif[];
  selectedMotifId: string | null;
  setSelectedMotifId: (id: string | null) => void;
  motifUnitPrice: number;
  dragOverCell: { c: number; r: number } | null;
  setDragOverCell: (cell: { c: number; r: number } | null) => void;
  onMouseDownOnCol: (e: React.MouseEvent, index: number) => void;
  onMouseDownOnRow: (e: React.MouseEvent, index: number) => void;
  onMouseDownOnBorder: (e: React.MouseEvent) => void;
  onMouseDownOnCorner: (e: React.MouseEvent) => void;
  onAssignOrReplaceMotifAtCell: (colIdx: number, rowIdx: number, motifTypeId?: string) => void;
  onOpenEditDim: (
    type: 'col-span' | 'row-span' | 'border-offset' | 'corner-size',
    index: number | undefined,
    label: string,
    currentValue: number
  ) => void;
  getSvgCoordinates: (e: React.MouseEvent | MouseEvent) => { x: number; y: number };
  activeMotifTool: string;
}

export const GrilleCanvas: React.FC<GrilleCanvasProps> = ({
  svgRef,
  glassW,
  glassH,
  zoom,
  setZoom,
  dragTarget,
  hasGrid,
  hasBorder,
  hasCorner,
  barWidth,
  barColor,
  borderOffset,
  cornerSize,
  colPositions,
  rowPositions,
  colSpans,
  rowSpans,
  motifs,
  selectedMotifId,
  setSelectedMotifId,
  motifUnitPrice,
  dragOverCell,
  setDragOverCell,
  onMouseDownOnCol,
  onMouseDownOnRow,
  onMouseDownOnBorder,
  onMouseDownOnCorner,
  onAssignOrReplaceMotifAtCell,
  onOpenEditDim,
  getSvgCoordinates,
  activeMotifTool,
}) => {
  // ViewBox CAD 4 phía
  const padLeft = 160;
  const padRight = 160;
  const padTop = 150;
  const padBot = 160;
  const vbX = -padLeft;
  const vbY = -padTop;
  const vbW = glassW + padLeft + padRight;
  const vbH = glassH + padTop + padBot;
  const dimFontSize = Math.max(22, Math.round(Math.min(glassW, glassH) * 0.04));

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-100/90">


      {/* Zoom toolbar */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-white/95 p-1 rounded-xl shadow-md border border-gray-200 backdrop-blur-xs">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
          className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-700 cursor-pointer"
          title="Phóng to"
        >
          <ZoomIn size={16} />
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
          className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-700 cursor-pointer"
          title="Thu nhỏ"
        >
          <ZoomOut size={16} />
        </button>
        <button
          type="button"
          onClick={() => setZoom(1)}
          className="px-2.5 h-8 rounded-lg hover:bg-gray-100 font-semibold text-[11px] text-gray-700 flex items-center justify-center cursor-pointer"
          title="Khôi phục góc nhìn"
        >
          Reset
        </button>
      </div>

      {/* SVG Canvas hỗ trợ Drop */}
      <div
        className="flex-1 flex items-center justify-center p-6 overflow-hidden"
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
        }}
        onDrop={(e) => {
          e.preventDefault();
          const droppedMotifType = e.dataTransfer.getData('text/plain') || activeMotifTool;
          const { x: svgX, y: svgY } = getSvgCoordinates(e);

          let closestDist = Infinity;
          let targetCell: { c: number; r: number } | null = null;

          colPositions.forEach((cx, cIdx) => {
            rowPositions.forEach((ry, rIdx) => {
              const dist = Math.hypot(cx - svgX, ry - svgY);
              if (dist < closestDist) {
                closestDist = dist;
                targetCell = { c: cIdx, r: rIdx };
              }
            });
          });

          if (targetCell !== null && closestDist < 120) {
            const cell: { c: number; r: number } = targetCell;
            onAssignOrReplaceMotifAtCell(cell.c, cell.r, droppedMotifType);
          }
          setDragOverCell(null);
        }}
      >
        <svg
          ref={svgRef}
          viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
          className="w-full h-full max-h-[760px] transition-transform duration-150 drop-shadow-md select-none"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center',
            cursor: dragTarget ? 'grabbing' : 'default',
          }}
        >
          <defs>
            <marker id="cad-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#0284c7" />
            </marker>

            <mask id="grille-bars-mask">
              <rect x="-40" y="-40" width={glassW + 80} height={glassH + 80} fill="white" />
              {motifs.map((m) => {
                const mw = m.width || 100;
                const mh = m.height || 100;

                if (m.motifType === 'rhombus' || m.motifType === 'kim_cuong_vuong' || m.motifType === '3') {
                  const pTop = `${m.x},${m.y - mh / 2 + 2}`;
                  const pRight = `${m.x + mw / 2 - 2},${m.y}`;
                  const pBottom = `${m.x},${m.y + mh / 2 - 2}`;
                  const pLeft = `${m.x - mw / 2 + 2},${m.y}`;
                  return (
                    <polygon
                      key={`mask-rhombus-${m.id}`}
                      points={`${pTop} ${pRight} ${pBottom} ${pLeft}`}
                      fill="black"
                    />
                  );
                }

                if (m.motifType === 'lotus' || m.motifType === 'tram_kim_cuong' || m.motifType === '4') {
                  const pTop = `${m.x},${m.y - mh / 2 + 3}`;
                  const pRight = `${m.x + mw / 2 - 3},${m.y}`;
                  const pBottom = `${m.x},${m.y + mh / 2 - 3}`;
                  const pLeft = `${m.x - mw / 2 + 3},${m.y}`;
                  return (
                    <polygon
                      key={`mask-lotus-${m.id}`}
                      points={`${pTop} ${pRight} ${pBottom} ${pLeft}`}
                      fill="black"
                    />
                  );
                }

                return (
                  <rect
                    key={`mask-rect-${m.id}`}
                    x={m.x - mw / 2 + 2}
                    y={m.y - mh / 2 + 2}
                    width={mw - 4}
                    height={mh - 4}
                    rx="6"
                    fill="black"
                  />
                );
              })}
            </mask>
          </defs>

          {/* 1. Nền kính */}
          <rect
            x="0"
            y="0"
            width={glassW}
            height={glassH}
            fill="#f0fdf4"
            fillOpacity="0.4"
            stroke="#1e293b"
            strokeWidth="2.8"
          />

          {/* 2. Đường ngậm nẹp nét đứt chuẩn CAD */}
          <rect
            x="15"
            y="15"
            width={glassW - 30}
            height={glassH - 30}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.2"
            strokeDasharray="5,4"
            opacity="0.8"
          />

          {/* 3. Nan chia lưới */}
          {hasGrid && (
            <g id="grid-bars" mask={motifs.length > 0 ? 'url(#grille-bars-mask)' : undefined}>
              {colPositions.map((x, cIdx) => (
                <g
                  key={`v-col-${cIdx}`}
                  onMouseDown={(e) => onMouseDownOnCol(e, cIdx)}
                  className="cursor-col-resize group"
                >
                  <rect x={x - 10} y="0" width={20} height={glassH} fill="transparent" />
                  <rect
                    x={x - barWidth / 2}
                    y="0"
                    width={barWidth}
                    height={glassH}
                    fill={barColor}
                    className="group-hover:stroke-blue-500 group-hover:stroke-2"
                  />
                </g>
              ))}

              {rowPositions.map((y, rIdx) => (
                <g
                  key={`h-row-${rIdx}`}
                  onMouseDown={(e) => onMouseDownOnRow(e, rIdx)}
                  className="cursor-row-resize group"
                >
                  <rect x="0" y={y - 10} width={glassW} height={20} fill="transparent" />
                  <rect
                    x="0"
                    y={y - barWidth / 2}
                    width={glassW}
                    height={barWidth}
                    fill={barColor}
                    className="group-hover:stroke-blue-500 group-hover:stroke-2"
                  />
                </g>
              ))}
            </g>
          )}

          {/* 4. Nan viền chu vi (Border) */}
          {hasBorder && (
            <g id="border-bars" onMouseDown={onMouseDownOnBorder} className="cursor-move group">
              <rect
                x={borderOffset - 8}
                y={borderOffset - 8}
                width={Math.max(0, glassW - borderOffset * 2 + 16)}
                height={Math.max(0, glassH - borderOffset * 2 + 16)}
                fill="none"
                stroke="transparent"
                strokeWidth={16}
              />
              <rect
                x={borderOffset}
                y={borderOffset}
                width={Math.max(0, glassW - borderOffset * 2)}
                height={Math.max(0, glassH - borderOffset * 2)}
                fill="none"
                stroke={barColor}
                strokeWidth={barWidth}
                className="group-hover:stroke-amber-600"
              />
            </g>
          )}

          {/* 5. Nan góc vuông */}
          {hasCorner && (
            <g id="corner-pieces" onMouseDown={onMouseDownOnCorner} className="cursor-pointer group">
              <path
                d={`M ${borderOffset} ${cornerSize} L ${cornerSize} ${cornerSize} L ${cornerSize} ${borderOffset}`}
                fill="none"
                stroke={barColor}
                strokeWidth={barWidth}
                className="group-hover:stroke-amber-600"
              />
              <path
                d={`M ${glassW - borderOffset} ${cornerSize} L ${glassW - cornerSize} ${cornerSize} L ${glassW - cornerSize} ${borderOffset}`}
                fill="none"
                stroke={barColor}
                strokeWidth={barWidth}
                className="group-hover:stroke-amber-600"
              />
              <path
                d={`M ${borderOffset} ${glassH - cornerSize} L ${cornerSize} ${glassH - cornerSize} L ${cornerSize} ${glassH - borderOffset}`}
                fill="none"
                stroke={barColor}
                strokeWidth={barWidth}
                className="group-hover:stroke-amber-600"
              />
              <path
                d={`M ${glassW - borderOffset} ${glassH - cornerSize} L ${glassW - cornerSize} ${glassH - cornerSize} L ${glassW - cornerSize} ${glassH - borderOffset}`}
                fill="none"
                stroke={barColor}
                strokeWidth={barWidth}
                className="group-hover:stroke-amber-600"
              />
            </g>
          )}

          {/* 6. Điểm Snap Giao Điểm */}
          {hasGrid &&
            colPositions.map((cx, cIdx) =>
              rowPositions.map((ry, rIdx) => {
                const existing = motifs.find((m) => m.gridCol === cIdx && m.gridRow === rIdx);
                const isHovered = dragOverCell?.c === cIdx && dragOverCell?.r === rIdx;

                return (
                  <g
                    key={`inter-${cIdx}-${rIdx}`}
                    onClick={() => {
                      if (existing) {
                        setSelectedMotifId(existing.id);
                      } else {
                        onAssignOrReplaceMotifAtCell(cIdx, rIdx);
                      }
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverCell({ c: cIdx, r: rIdx });
                    }}
                    onDragLeave={() => setDragOverCell(null)}
                    className="cursor-pointer group"
                  >
                    <circle
                      cx={cx}
                      cy={ry}
                      r={existing ? 40 : 24}
                      fill={isHovered ? '#3b82f6' : 'transparent'}
                      fillOpacity={isHovered ? 0.25 : 0}
                    />
                    {!existing && (
                      <>
                        <circle
                          cx={cx}
                          cy={ry}
                          r="4"
                          fill="#0284c7"
                          className="group-hover:scale-150 transition-transform"
                        />
                        <text
                          x={cx}
                          y={ry - 10}
                          textAnchor="middle"
                          fontSize="10"
                          fill="#0284c7"
                          fontWeight="bold"
                          opacity="0"
                          className="group-hover:opacity-100 transition-opacity"
                        >
                          + Gắn hoa
                        </text>
                      </>
                    )}
                  </g>
                );
              })
            )}

          {/* 7. Hoa văn vector */}
          {motifs.map((m) => {
            const isSelected = selectedMotifId === m.id;
            const mw = m.width || 100;
            const mh = m.height || 100;

            return (
              <g
                key={m.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMotifId(m.id);
                }}
                className="cursor-pointer group"
                pointerEvents="all"
              >
                <rect
                  x={m.x - mw / 2 - 6}
                  y={m.y - mh / 2 - 6}
                  width={mw + 12}
                  height={mh + 12}
                  fill={isSelected ? '#fef3c725' : 'transparent'}
                  pointerEvents="all"
                  stroke={isSelected ? '#f59e0b' : '#38bdf8'}
                  strokeWidth={isSelected ? '2.5' : '1.2'}
                  strokeDasharray={isSelected ? '5,3' : '4,4'}
                  opacity={isSelected ? '1' : '0.6'}
                  className="group-hover:opacity-100 group-hover:stroke-amber-500 transition-all"
                  rx="4"
                />

                {isSelected && (
                  <>
                    <circle cx={m.x - mw / 2 - 6} cy={m.y - mh / 2 - 6} r="3.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
                    <circle cx={m.x + mw / 2 + 6} cy={m.y - mh / 2 - 6} r="3.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
                    <circle cx={m.x - mw / 2 - 6} cy={m.y + mh / 2 + 6} r="3.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
                    <circle cx={m.x + mw / 2 + 6} cy={m.y + mh / 2 + 6} r="3.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />

                    <g transform={`translate(${m.x}, ${m.y + mh / 2 + 16})`}>
                      <rect
                        x="-46"
                        y="-8"
                        width="92"
                        height="17"
                        rx="5"
                        fill="#f59e0b"
                        stroke="#ffffff"
                        strokeWidth="1.2"
                        className="drop-shadow-xs"
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fontSize="9.5"
                        fontWeight="bold"
                        fill="#ffffff"
                        fontFamily="monospace"
                      >
                        {(m.price ?? motifUnitPrice).toLocaleString('vi-VN')} đ
                      </text>
                    </g>
                  </>
                )}

                <g transform={`translate(${m.x - mw / 2}, ${m.y - mh / 2})`}>
                  <GrilleMotifSvg motifType={m.motifType} color={barColor} width={mw} height={mh} />
                </g>
              </g>
            );
          })}

          {/* 8. Đường gióng kích thước CAD */}
          <GrilleCadDimensions
            glassW={glassW}
            glassH={glassH}
            hasBorder={hasBorder}
            hasCorner={hasCorner}
            hasGrid={hasGrid}
            borderOffset={borderOffset}
            cornerSize={cornerSize}
            colPositions={colPositions}
            rowPositions={rowPositions}
            colSpans={colSpans}
            rowSpans={rowSpans}
            dimFontSize={dimFontSize}
            onOpenEditDim={onOpenEditDim}
          />
        </svg>
      </div>
    </div>
  );
};
