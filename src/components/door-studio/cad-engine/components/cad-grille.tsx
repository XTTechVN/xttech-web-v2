import React from 'react';
import { GlassGrilleConfig } from '../../studio-types';
import { GrilleMotifSvg } from '../../panels/grille-motif-svgs';

/** Render lưới nan / viền / nan góc / hoa văn đúc trên mặt kính */
export const renderCadGrille = (
  gx: number,
  gy: number,
  gw: number,
  gh: number,
  grilleConfig?: GlassGrilleConfig
) => {
  if (!grilleConfig || !grilleConfig.enabled) return null;
  const {
    hasGrid,
    hasBorder,
    hasCorner,
    barColor = '#D4AF37',
    barWidth = 6,
    cols = 1,
    rows = 1,
    borderOffset = 95,
    cornerSize = 180,
    colPositions,
    rowPositions,
    motifs = [],
  } = grilleConfig;

  const origW = grilleConfig.glassW || gw || 1;
  const origH = grilleConfig.glassH || gh || 1;
  const scaleX = gw / origW;
  const scaleY = gh / origH;
  const bw = Math.max(1.2, barWidth * scaleX);

  const bOffset = borderOffset * scaleX;
  const cDist = cornerSize * scaleX; // Khoảng cách từ mép ngoài tới đường nan góc (180mm)

  // Tọa độ các thanh nan dọc
  const vBars = (colPositions && colPositions.length === cols - 1)
    ? colPositions.map((pos) => gx + pos * scaleX)
    : Array.from({ length: cols - 1 }).map((_, i) => gx + ((i + 1) / cols) * gw);

  // Tọa độ các thanh nan ngang
  const hBars = (rowPositions && rowPositions.length === rows - 1)
    ? rowPositions.map((pos) => gy + pos * scaleY)
    : Array.from({ length: rows - 1 }).map((_, i) => gy + ((i + 1) / rows) * gh);

  const maskId = `grille-leaf-mask-${Math.round(gx)}-${Math.round(gy)}`;

  return (
    <g id="glass-grille">
      {motifs.length > 0 && (
        <defs>
          <mask id={maskId}>
            <rect x={gx - 10} y={gy - 10} width={gw + 20} height={gh + 20} fill="white" />
            {motifs.map((m) => {
              const mx = gx + (m.x ?? origW / 2) * scaleX;
              const my = gy + (m.y ?? origH / 2) * scaleY;
              const mw = Math.max(8, (m.width || 100) * scaleX);
              const mh = Math.max(8, (m.height || 100) * scaleY);
              const motifType = m.motifType || 'flower_classic';

              if (motifType === 'rhombus' || motifType === 'kim_cuong_vuong' || motifType === '3') {
                const pTop = `${mx},${my - mh / 2 + 1}`;
                const pRight = `${mx + mw / 2 - 1},${my}`;
                const pBottom = `${mx},${my + mh / 2 - 1}`;
                const pLeft = `${mx - mw / 2 + 1},${my}`;
                return (
                  <polygon
                    key={`leaf-mask-rhombus-${m.id}`}
                    points={`${pTop} ${pRight} ${pBottom} ${pLeft}`}
                    fill="black"
                  />
                );
              }

              if (motifType === 'lotus' || motifType === 'tram_kim_cuong' || motifType === '4') {
                const pTop = `${mx},${my - mh / 2 + 2}`;
                const pRight = `${mx + mw / 2 - 2},${my}`;
                const pBottom = `${mx},${my + mh / 2 - 2}`;
                const pLeft = `${mx - mw / 2 + 2},${my}`;
                return (
                  <polygon
                    key={`leaf-mask-lotus-${m.id}`}
                    points={`${pTop} ${pRight} ${pBottom} ${pLeft}`}
                    fill="black"
                  />
                );
              }

              return (
                <rect
                  key={`leaf-mask-rect-${m.id}`}
                  x={mx - mw / 2 + 1.5}
                  y={my - mh / 2 + 1.5}
                  width={mw - 3}
                  height={mh - 3}
                  rx="3"
                  fill="black"
                />
              );
            })}
          </mask>
        </defs>
      )}

      {/* 1. Nan chia lưới */}
      {hasGrid && (
        <g mask={motifs.length > 0 ? `url(#${maskId})` : undefined}>
          {vBars.map((x, i) => (
            <line key={`v-${i}`} x1={x} y1={gy} x2={x} y2={gy + gh} stroke={barColor} strokeWidth={bw} />
          ))}
          {hBars.map((y, i) => (
            <line key={`h-${i}`} x1={gx} y1={y} x2={gx + gw} y2={y} stroke={barColor} strokeWidth={bw} />
          ))}
        </g>
      )}
      {/* 2. Nan viền chu vi */}
      {hasBorder && (
        <rect
          x={gx + bOffset}
          y={gy + bOffset}
          width={Math.max(0, gw - bOffset * 2)}
          height={Math.max(0, gh - bOffset * 2)}
          fill="none"
          stroke={barColor}
          strokeWidth={bw}
        />
      )}
      {/* 3. Nan góc */}
      {hasCorner && (
        <g stroke={barColor} strokeWidth={bw} fill="none">
          <path d={`M ${gx + bOffset} ${gy + cDist} L ${gx + cDist} ${gy + cDist} L ${gx + cDist} ${gy + bOffset}`} />
          <path d={`M ${gx + gw - bOffset} ${gy + cDist} L ${gx + gw - cDist} ${gy + cDist} L ${gx + gw - cDist} ${gy + bOffset}`} />
          <path d={`M ${gx + bOffset} ${gy + gh - cDist} L ${gx + cDist} ${gy + gh - cDist} L ${gx + cDist} ${gy + gh - bOffset}`} />
          <path d={`M ${gx + gw - bOffset} ${gy + gh - cDist} L ${gx + gw - cDist} ${gy + gh - cDist} L ${gx + gw - cDist} ${gy + gh - bOffset}`} />
        </g>
      )}
      {/* 4. Hoa văn đúc tại giao điểm nan */}
      {motifs.map((m) => {
        const mx = gx + (m.x ?? origW / 2) * scaleX;
        const my = gy + (m.y ?? origH / 2) * scaleY;
        const mw = Math.max(8, (m.width || 100) * scaleX);
        const mh = Math.max(8, (m.height || 100) * scaleY);
        const motifType = m.motifType || 'flower_classic';

        return (
          <g key={m.id} transform={`translate(${mx - mw / 2}, ${my - mh / 2})`}>
            <GrilleMotifSvg
              motifType={motifType}
              color={barColor}
              width={mw}
              height={mh}
            />
          </g>
        );
      })}
    </g>
  );
};
