import React from 'react';
import { GlassVisualEffect } from '../../studio-types';
import { createRainDrops, normalizeGlassVisualEffect, normalizeHexColor } from '../../utils/glass-visual-utils';

interface GlassBBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CadGlassEffectOverlayProps {
  cellId: string;
  effect?: GlassVisualEffect;
  color?: string;
  splitCount?: number | null;
  /** Chế độ hình chữ nhật */
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  /** Chế độ hình cong/vòm */
  pathD?: string;
  bbox?: GlassBBox;
  clipId?: string;
}

const PATTERN_FILL_OPACITY = 0.85;
const TINT_FILL_OPACITY = 0.52;

const renderPatternBody = (effect: GlassVisualEffect, cellId: string): { size: number; body: React.ReactNode } | null => {
  if (effect === 'striped') {
    return {
      size: 10,
      body: (
        <>
          <line x1={3} y1={0} x2={3} y2={10} stroke="#438ba3" strokeWidth={1.6} opacity={0.58} />
          <line x1={8} y1={0} x2={8} y2={10} stroke="#6eb5c9" strokeWidth={0.9} opacity={0.45} />
        </>
      ),
    };
  }
  if (effect === 'frosted') {
    return {
      size: 22,
      body: (
        <>
          <rect width={22} height={22} fill="#d9eef5" opacity={0.38} />
          <ellipse cx={5} cy={6} rx={1.6} ry={1.2} fill="#78b3c5" opacity={0.5} />
          <ellipse cx={15} cy={4} rx={1.2} ry={1} fill="#ffffff" opacity={0.7} />
          <ellipse cx={11} cy={13} rx={1.8} ry={1.3} fill="#78b3c5" opacity={0.45} />
          <ellipse cx={19} cy={17} rx={1.3} ry={1} fill="#ffffff" opacity={0.65} />
          <ellipse cx={4} cy={18} rx={1.2} ry={1} fill="#ffffff" opacity={0.6} />
        </>
      ),
    };
  }
  if (effect === 'rain') {
    return {
      size: 120,
      body: (
        <>
          {createRainDrops(cellId, 18).map((drop, idx) => (
            <g key={idx}>
              <ellipse cx={drop.x} cy={drop.y} rx={drop.rx} ry={drop.ry} fill="#5fa2b8" opacity={0.5} />
              <ellipse cx={drop.x - drop.rx * 0.3} cy={drop.y - drop.ry * 0.3} rx={drop.rx * 0.35} ry={drop.ry * 0.35} fill="#ffffff" opacity={0.75} />
            </g>
          ))}
        </>
      ),
    };
  }
  if (effect === 'pattern') {
    return {
      size: 24,
      body: (
        <>
          <path d="M 0 6 Q 6 0 12 6 T 24 6 M 0 18 Q 6 12 12 18 T 24 18" fill="none" stroke="#367a91" strokeWidth={1.2} opacity={0.58} />
          <polygon points="12,8 15,12 12,16 9,12" fill="#5da4bc" opacity={0.35} />
        </>
      ),
    };
  }
  return null;
};

/**
 * Lớp phủ hiệu ứng kính vector (màu, mờ, sọc, hạt mưa, hoa văn) + đường chia kính ngang.
 * Không chặn click chọn ô bên dưới (pointerEvents none).
 */
const CadGlassEffectOverlayBase: React.FC<CadGlassEffectOverlayProps> = ({
  cellId,
  effect,
  color,
  splitCount,
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  pathD,
  bbox,
  clipId,
}) => {
  const normalizedEffect = normalizeGlassVisualEffect(effect);
  const box: GlassBBox = bbox ?? { x, y, width, height };
  const safeId = cellId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const patternId = `glass-fx-${normalizedEffect}-${safeId}`;
  const pattern = renderPatternBody(normalizedEffect, cellId);
  const splitLineCount = Math.max(0, Math.floor(splitCount ?? 1) - 1);
  const hasEffect = normalizedEffect !== 'clear';
  if (!hasEffect && splitLineCount === 0) return null;

  const isTinted = normalizedEffect === 'tinted';
  const fillValue = isTinted ? normalizeHexColor(color) : `url(#${patternId})`;
  const fillOpacity = isTinted ? TINT_FILL_OPACITY : PATTERN_FILL_OPACITY;

  return (
    <g pointerEvents="none">
      {pattern && (
        <defs>
          <pattern id={patternId} patternUnits="userSpaceOnUse" width={pattern.size} height={pattern.size}>
            {pattern.body}
          </pattern>
        </defs>
      )}
      {hasEffect &&
        (pathD ? (
          <path d={pathD} fill={fillValue} fillOpacity={fillOpacity} stroke="none" />
        ) : (
          <rect x={box.x} y={box.y} width={box.width} height={box.height} fill={fillValue} fillOpacity={fillOpacity} stroke="none" />
        ))}
      {splitLineCount > 0 && (
        <g clipPath={clipId ? `url(#${clipId})` : undefined}>
          {Array.from({ length: splitLineCount }, (_, idx) => {
            const lineY = box.y + (box.height * (idx + 1)) / (splitLineCount + 1);
            return (
              <line
                key={idx}
                x1={box.x}
                y1={lineY}
                x2={box.x + box.width}
                y2={lineY}
                stroke="#0ea5e9"
                strokeWidth={1.2}
                strokeDasharray="4,3"
              />
            );
          })}
        </g>
      )}
    </g>
  );
};

export const CadGlassEffectOverlay = React.memo(CadGlassEffectOverlayBase);

/** Ô xem trước nhỏ hiển thị trên nút Accordion "Hiệu ứng" */
export const GlassEffectMiniPreview: React.FC<{
  effect: GlassVisualEffect;
  color?: string;
  previewId: string;
}> = ({ effect, color, previewId }) => (
  <svg viewBox="0 0 72 44" className="w-14 h-8 rounded border border-slate-200 shrink-0">
    <rect x={0} y={0} width={72} height={44} fill="#b2f5ea" />
    <CadGlassEffectOverlay cellId={`preview-${previewId}`} x={0} y={0} width={72} height={44} effect={effect} color={color} />
  </svg>
);
