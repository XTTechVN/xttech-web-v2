import React from 'react';

interface CadOpeningSymbolProps {
  cx: number;
  cy: number;
  cw: number;
  ch: number;
  type: string;
}

export const CadOpeningSymbol: React.FC<CadOpeningSymbolProps> = ({ cx, cy, cw, ch, type }) => {
  const stroke = '#dc2626';
  const strokeW = 1.1;

  switch (type) {
    case 'swing_left':
      // Cánh mở quay trái: Bản lề nằm bên trái -> đỉnh nhọn tam giác chỉ vào mép trái (cx, cy + ch/2)
      return (
        <polyline
          points={`${cx + cw},${cy} ${cx},${cy + ch / 2} ${cx + cw},${cy + ch}`}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeW}
        />
      );

    case 'swing_right':
      // Cánh mở quay phải: Bản lề nằm bên phải -> đỉnh nhọn tam giác chỉ vào mép phải (cx + cw, cy + ch/2)
      return (
        <polyline
          points={`${cx},${cy} ${cx + cw},${cy + ch / 2} ${cx},${cy + ch}`}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeW}
        />
      );

    case 'awning':
      // Mở hất: Bản lề nằm cạnh trên -> đỉnh nhọn chỉ lên cạnh trên (cx + cw/2, cy)
      return (
        <polyline
          points={`${cx},${cy + ch} ${cx + cw / 2},${cy} ${cx + cw},${cy + ch}`}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeW}
        />
      );

    case 'tilt':
      // Mở lật trong: Bản lề nằm cạnh dưới -> đỉnh nhọn chỉ xuống cạnh dưới (cx + cw/2, cy + ch)
      return (
        <polyline
          points={`${cx},${cy} ${cx + cw / 2},${cy + ch} ${cx + cw},${cy}`}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeW}
          strokeDasharray="3,3"
        />
      );

    case 'tilt_down':
      return (
        <polyline
          points={`${cx},${cy + ch} ${cx + cw / 2},${cy} ${cx + cw},${cy + ch}`}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeW}
          strokeDasharray="3,3"
        />
      );

    case 'tilt_turn':
      return (
        <g>
          <polyline
            points={`${cx + cw},${cy} ${cx},${cy + ch / 2} ${cx + cw},${cy + ch}`}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeW}
          />
          <polyline
            points={`${cx},${cy} ${cx + cw / 2},${cy + ch} ${cx + cw},${cy}`}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeW}
            strokeDasharray="3,3"
          />
        </g>
      );

    case 'sliding':
      return (
        <g stroke={stroke} strokeWidth={strokeW} fill="none">
          <line x1={cx + cw * 0.25} y1={cy + ch / 2} x2={cx + cw * 0.75} y2={cy + ch / 2} />
          <polyline points={`${cx + cw * 0.35},${cy + ch / 2 - 4} ${cx + cw * 0.25},${cy + ch / 2} ${cx + cw * 0.35},${cy + ch / 2 + 4}`} />
          <polyline points={`${cx + cw * 0.65},${cy + ch / 2 - 4} ${cx + cw * 0.75},${cy + ch / 2} ${cx + cw * 0.65},${cy + ch / 2 + 4}`} />
        </g>
      );

    default:
      return null;
  }
};
