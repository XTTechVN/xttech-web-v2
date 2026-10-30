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

  // Hỗ trợ cả string ghép hoặc mảng (như quay-hất: ['le-trai-mo-ra', 'mo-hat'])
  const types = String(type || '').split(',').map((s) => s.trim().toLowerCase());

  const renderSingleSymbol = (symType: string, key?: string) => {
    switch (symType) {
      case 'swing_left':
      case 'le-trai-mo-ra':
      case 'gap-xep-le-trai':
        // Cánh mở quay trái ra ngoài (nét liền)
        return (
          <polyline
            key={key}
            points={`${cx + cw},${cy} ${cx},${cy + ch / 2} ${cx + cw},${cy + ch}`}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeW}
          />
        );

      case 'le-trai-mo-vao':
        // Cánh mở quay trái vào trong (nét đứt)
        return (
          <polyline
            key={key}
            points={`${cx + cw},${cy} ${cx},${cy + ch / 2} ${cx + cw},${cy + ch}`}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeW}
            strokeDasharray="3,3"
          />
        );

      case 'swing_right':
      case 'le-phai-mo-ra':
      case 'gap-xep-le-phai':
        // Cánh mở quay phải ra ngoài (nét liền)
        return (
          <polyline
            key={key}
            points={`${cx},${cy} ${cx + cw},${cy + ch / 2} ${cx},${cy + ch}`}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeW}
          />
        );

      case 'le-phai-mo-vao':
        // Cánh mở quay phải vào trong (nét đứt)
        return (
          <polyline
            key={key}
            points={`${cx},${cy} ${cx + cw},${cy + ch / 2} ${cx},${cy + ch}`}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeW}
            strokeDasharray="3,3"
          />
        );

      case 'awning':
      case 'mo-hat':
        // Mở hất (nét liền, bản lề trên)
        return (
          <polyline
            key={key}
            points={`${cx},${cy + ch} ${cx + cw / 2},${cy} ${cx + cw},${cy + ch}`}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeW}
          />
        );

      case 'tilt':
      case 'mo-lat':
        // Mở lật trong (nét đứt, bản lề dưới)
        return (
          <polyline
            key={key}
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
            key={key}
            points={`${cx},${cy + ch} ${cx + cw / 2},${cy} ${cx + cw},${cy + ch}`}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeW}
            strokeDasharray="3,3"
          />
        );

      case 'tilt_turn':
        return (
          <g key={key}>
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

      case 'mo-song-song':
        return (
          <g key={key} stroke={stroke} strokeWidth={strokeW} fill="none">
            <line x1={cx + cw / 2} y1={cy + 8} x2={cx + cw / 2} y2={cy + 20} />
            <polyline points={`${cx + cw / 2 - 4},${cy + 14} ${cx + cw / 2},${cy + 8} ${cx + cw / 2 + 4},${cy + 14}`} />
            <line x1={cx + cw / 2} y1={cy + ch - 8} x2={cx + cw / 2} y2={cy + ch - 20} />
            <polyline points={`${cx + cw / 2 - 4},${cy + ch - 14} ${cx + cw / 2},${cy + ch - 8} ${cx + cw / 2 + 4},${cy + ch - 14}`} />
            <line x1={cx + 8} y1={cy + ch / 2} x2={cx + 20} y2={cy + ch / 2} />
            <polyline points={`${cx + 14},${cy + ch / 2 - 4} ${cx + 8},${cy + ch / 2} ${cx + 14},${cy + ch / 2 + 4}`} />
            <line x1={cx + cw - 8} y1={cy + ch / 2} x2={cx + cw - 20} y2={cy + ch / 2} />
            <polyline points={`${cx + cw - 14},${cy + ch / 2 - 4} ${cx + cw - 8},${cy + ch / 2} ${cx + cw - 14},${cy + ch / 2 + 4}`} />
          </g>
        );

      case 'lua-trai':
      case 'lua-ep-trai': {
        // Mũi tên xanh trượt sang trái (như Ảnh 2)
        const blue = '#0284c7';
        const midX = cx + cw / 2;
        const midY = cy + ch / 2;
        return (
          <g key={key}>
            <line x1={midX - 3} y1={midY} x2={midX + 9} y2={midY} stroke={blue} strokeWidth={2.4} strokeLinecap="round" />
            <polygon points={`${midX - 9},${midY} ${midX - 2},${midY - 5} ${midX - 2},${midY + 5}`} fill={blue} />
          </g>
        );
      }

      case 'lua-phai':
      case 'lua-ep-phai': {
        // Mũi tên xanh trượt sang phải (như Ảnh 2)
        const blue = '#0284c7';
        const midX = cx + cw / 2;
        const midY = cy + ch / 2;
        return (
          <g key={key}>
            <line x1={midX - 9} y1={midY} x2={midX + 3} y2={midY} stroke={blue} strokeWidth={2.4} strokeLinecap="round" />
            <polygon points={`${midX + 9},${midY} ${midX + 2},${midY - 5} ${midX + 2},${midY + 5}`} fill={blue} />
          </g>
        );
      }

      case '2-chieu': {
        // Hình quả trám / kim cương màu xanh cho cánh giữa 2 chiều (như Ảnh 2)
        const blue = '#0284c7';
        const midX = cx + cw / 2;
        const midY = cy + ch / 2;
        return (
          <polygon
            key={key}
            points={`${midX},${midY - 6.5} ${midX + 8.5},${midY} ${midX},${midY + 6.5} ${midX - 8.5},${midY}`}
            fill={blue}
          />
        );
      }

      case 'sliding': {
        // Mũi tên 2 chiều
        const blue = '#0284c7';
        const midX = cx + cw / 2;
        const midY = cy + ch / 2;
        return (
          <g key={key}>
            <polygon points={`${midX - 10},${midY} ${midX - 4},${midY - 4.5} ${midX - 4},${midY + 4.5}`} fill={blue} />
            <line x1={midX - 4} y1={midY} x2={midX + 4} y2={midY} stroke={blue} strokeWidth={2} />
            <polygon points={`${midX + 10},${midY} ${midX + 4},${midY - 4.5} ${midX + 4},${midY + 4.5}`} fill={blue} />
          </g>
        );
      }

      case 'lua-len':
        return (
          <g key={key} stroke={stroke} strokeWidth={strokeW} fill="none">
            <line x1={cx + cw / 2} y1={cy + ch * 0.25} x2={cx + cw / 2} y2={cy + ch * 0.75} />
            <polyline points={`${cx + cw / 2 - 4},${cy + ch * 0.35} ${cx + cw / 2},${cy + ch * 0.25} ${cx + cw / 2 + 4},${cy + ch * 0.35}`} />
          </g>
        );

      case 'lua-xuong':
        return (
          <g key={key} stroke={stroke} strokeWidth={strokeW} fill="none">
            <line x1={cx + cw / 2} y1={cy + ch * 0.25} x2={cx + cw / 2} y2={cy + ch * 0.75} />
            <polyline points={`${cx + cw / 2 - 4},${cy + ch * 0.65} ${cx + cw / 2},${cy + ch * 0.75} ${cx + cw / 2 + 4},${cy + ch * 0.65}`} />
          </g>
        );

      case 'canh-truot':
        return (
          <g key={key} stroke={stroke} strokeWidth={strokeW} fill="none">
            <line x1={cx + cw * 0.25} y1={cy + ch / 2} x2={cx + cw * 0.75} y2={cy + ch / 2} />
            <polyline points={`${cx + cw * 0.35},${cy + ch / 2 - 4} ${cx + cw * 0.25},${cy + ch / 2} ${cx + cw * 0.35},${cy + ch / 2 + 4}`} />
            <polyline points={`${cx + cw * 0.65},${cy + ch / 2 - 4} ${cx + cw * 0.75},${cy + ch / 2} ${cx + cw * 0.65},${cy + ch / 2 + 4}`} />
          </g>
        );

      case 'canh-quay':
        return (
          <polyline
            key={key}
            points={`${cx + cw},${cy} ${cx},${cy + ch / 2} ${cx + cw},${cy + ch}`}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeW}
          />
        );

      default:
        return null;
    }
  };

  if (types.length === 1) {
    return renderSingleSymbol(types[0]);
  }

  return <g>{types.map((t, idx) => renderSingleSymbol(t, `sym-${idx}`))}</g>;
};
