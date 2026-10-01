import React from 'react';
import { GlassGrilleConfig, GlassGrilleMotif } from '../../../studio-types';
import { GrilleMotifSvg } from '../../grille-motif-svgs';

interface GrilleTemplateMiniPreviewProps {
  config: Partial<GlassGrilleConfig>;
}

/**
 * Thumbnail CAD thu nhỏ trực quan cho từng mẫu nan, đồng bộ 1:1 với bản vẽ thực tế
 */
export const GrilleTemplateMiniPreview: React.FC<GrilleTemplateMiniPreviewProps> = ({ config }) => {
  const w = 44;
  const h = 60;
  const cols = Math.max(1, config.cols || 1);
  const rows = Math.max(1, config.rows || 1);
  const hasGrid = config.hasGrid ?? true;
  const hasBorder = config.hasBorder ?? false;
  const hasCorner = config.hasCorner ?? false;
  const bColor = config.barColor || '#D4AF37';
  const motifs = config.motifs || [];

  const bOffset = hasBorder ? 6 : 0;
  const cDist = hasCorner ? 11 : 0;

  // Giới hạn nan lưới nằm gọn bên trong viền lề (nếu có viền)
  const gridStartX = hasBorder ? bOffset : 1;
  const gridEndX = hasBorder ? w - bOffset : w - 1;
  const gridStartY = hasBorder ? bOffset : 1;
  const gridEndY = hasBorder ? h - bOffset : h - 1;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full drop-shadow-2xs">
      {/* 1. Nền kính */}
      <rect x="1" y="1" width={w - 2} height={h - 2} fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" rx="2" />

      {/* 2. Nan viền lề */}
      {hasBorder && (
        <rect
          x={bOffset}
          y={bOffset}
          width={Math.max(0, w - bOffset * 2)}
          height={Math.max(0, h - bOffset * 2)}
          fill="none"
          stroke={bColor}
          strokeWidth="1.2"
        />
      )}

      {/* 3. Nan góc hoa thị */}
      {hasCorner && (
        <g stroke={bColor} strokeWidth="1" fill="none">
          <path d={`M ${bOffset} ${cDist} L ${cDist} ${cDist} L ${cDist} ${bOffset}`} />
          <path d={`M ${w - bOffset} ${cDist} L ${w - cDist} ${cDist} L ${w - cDist} ${bOffset}`} />
          <path d={`M ${bOffset} ${h - cDist} L ${cDist} ${h - cDist} L ${cDist} ${h - bOffset}`} />
          <path d={`M ${w - bOffset} ${h - cDist} L ${w - cDist} ${h - cDist} L ${w - cDist} ${h - bOffset}`} />
        </g>
      )}

      {/* 4. Nan chia lưới caro */}
      {hasGrid && (
        <g stroke={bColor} strokeWidth="1">
          {Array.from({ length: cols - 1 }).map((_, i) => {
            const x = ((i + 1) / cols) * w;
            return <line key={`v-${i}`} x1={x} y1={gridStartY} x2={x} y2={gridEndY} />;
          })}
          {Array.from({ length: rows - 1 }).map((_, i) => {
            const y = ((i + 1) / rows) * h;
            return <line key={`h-${i}`} x1={gridStartX} y1={y} x2={gridEndX} y2={y} />;
          })}
        </g>
      )}

      {/* 5. Hoa văn đúc thực tế (có nền mask trắng ngắt nan chuẩn CAD) */}
      {motifs.map((m: GlassGrilleMotif, idx: number) => {
        let mx = w / 2;
        let my = h / 2;
        if (m.gridCol !== undefined && cols > 1) {
          mx = ((m.gridCol + 1) / cols) * w;
        }
        if (m.gridRow !== undefined && rows > 1) {
          my = ((m.gridRow + 1) / rows) * h;
        }

        // Tự động phân loại kích cỡ hoa văn (phù điêu lớn vs hoa văn góc/giao điểm)
        const isCenterLotus = m.motifType === 'lotus' || motifs.length === 1;
        const mw = isCenterLotus ? 18 : 8.5;
        const mh = isCenterLotus ? 26 : 8.5;
        const maskPadding = isCenterLotus ? 1.5 : 1;

        return (
          <g key={m.id || idx}>
            {/* Nền mask ngắt nan giúp hoa văn nổi bật rõ ràng */}
            <rect
              x={mx - (mw + maskPadding) / 2}
              y={my - (mh + maskPadding) / 2}
              width={mw + maskPadding}
              height={mh + maskPadding}
              fill="#f8fafc"
              rx="1"
            />
            {/* Icon hoa văn thật */}
            <g transform={`translate(${mx - mw / 2}, ${my - mh / 2})`}>
              <GrilleMotifSvg motifType={m.motifType || 'flower_classic'} width={mw} height={mh} color={bColor} />
            </g>
          </g>
        );
      })}
    </svg>
  );
};

