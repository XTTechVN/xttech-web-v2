'use client';

import React, { useState, useMemo } from 'react';
import { SashOpenType } from '../studio-types';
import { Columns, Rows, Grid, ChevronDown, ChevronRight } from 'lucide-react';
import {
  SASH_LAYOUT_CATALOG,
  SashLayoutConfig,
  SashFamily,
} from '../core/sash-layout-catalog';

interface SashTypePickerProps {
  currentSashType: SashOpenType;
  selectedCellId: string | null;
  isInsideSash?: boolean;
  onSelectSashType: (sashType: SashOpenType) => void;
  onSplitSashMullion?: (count: number, direction: 'vertical' | 'horizontal') => void;
}

/**
 * Vẽ biểu tượng kỹ thuật CAD hình vuông (3D/2D Visual Card)
 * Chuẩn đồ họa Windova: Viền nhôm vàng kim mảnh thanh thoát, nền trong sáng sủa,
 * kính xanh ngọc trong trẻo, nét mở phối cảnh và mũi tên xanh lam CAD sắc nét.
 */
function renderSquareVisualCard(layout: SashLayoutConfig): React.ReactNode {
  const { id, family, layouter, sashes } = layout;
  const count = sashes.length;
  const isVertical = layouter === 'sliding-vertical' || layouter === 'v-equal';

  // Kích thước chuẩn khung hình vuông
  const vbSize = 72;
  const framePad = 4;
  const frameInner = vbSize - framePad * 2;

  // Màu sắc chuẩn Windova (thanh thoát, sáng sủa, tinh tế)
  const frameBorder = '#b88a44'; // Viền nhôm vàng kim thanh mảnh
  const canvasBg = '#fcfbfa';    // Nền khung trắng ngà sáng sủa
  const glassColor = '#c8f5f0';  // Kính xanh ngọc/cyan sáng
  const glassBorder = '#0284c7'; // Nét viền kính xanh lam CAD
  const blueSymbol = '#0284c7';  // Xanh lam CAD cho mũi tên lùa & nét mở
  const elevatedGlass = '#bbf7d0'; // Kính tầng trên / so le nhẹ nhàng

  // 1. NHÓM CỬA LÙA (cua-so-lua, cua-di-lua)
  if (family === 'cua-so-lua' || family === 'cua-di-lua') {
    // 1.1 Lùa ép góc (L-arrow)
    if (id.includes('ep-phai')) {
      return (
        <svg viewBox={`0 0 ${vbSize} ${vbSize}`} className="w-full h-full p-1">
          <rect x={framePad} y={framePad} width={frameInner} height={frameInner} fill={canvasBg} stroke={frameBorder} strokeWidth="1.8" rx="2" />
          <rect x={framePad + 4} y={framePad + 4} width={frameInner - 8} height={frameInner - 8} fill={glassColor} stroke={glassBorder} strokeWidth="1" />
          {/* Mũi tên góc phải: từ trên xuống rồi rẽ phải |-> */}
          <path d="M 26 46 L 26 55 L 48 55" fill="none" stroke={blueSymbol} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="42 50 48 55 42 60" fill="none" stroke={blueSymbol} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
    if (id.includes('ep-trai')) {
      return (
        <svg viewBox={`0 0 ${vbSize} ${vbSize}`} className="w-full h-full p-1">
          <rect x={framePad} y={framePad} width={frameInner} height={frameInner} fill={canvasBg} stroke={frameBorder} strokeWidth="1.8" rx="2" />
          <rect x={framePad + 4} y={framePad + 4} width={frameInner - 8} height={frameInner - 8} fill={glassColor} stroke={glassBorder} strokeWidth="1" />
          {/* Mũi tên góc trái: từ trên xuống rồi rẽ trái <-| */}
          <path d="M 46 46 L 46 55 L 24 55" fill="none" stroke={blueSymbol} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="30 50 24 55 30 60" fill="none" stroke={blueSymbol} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }

    // 1.2 Lùa trượt đứng (2 cánh dọc)
    if (isVertical) {
      const sh = (frameInner - 10) / 2;
      return (
        <svg viewBox={`0 0 ${vbSize} ${vbSize}`} className="w-full h-full p-1">
          <rect x={framePad} y={framePad} width={frameInner} height={frameInner} fill={canvasBg} stroke={frameBorder} strokeWidth="1.8" rx="2" />
          <rect x={framePad + 4} y={framePad + 4} width={frameInner - 8} height={sh} fill={glassColor} stroke={glassBorder} strokeWidth="0.9" />
          <rect x={framePad + 4} y={framePad + 6 + sh} width={frameInner - 8} height={sh} fill={elevatedGlass} stroke={glassBorder} strokeWidth="1.1" />
          {/* Mũi tên lên */}
          <path d="M 36 53 L 36 41" stroke={blueSymbol} strokeWidth="2" strokeLinecap="round" />
          <polyline points="32 45 36 40 40 45" fill="none" stroke={blueSymbol} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }

    // 1.3 Lùa ngang các loại (2, 3, 4, 5, 6, 8 cánh xếp lớp Windova)
    return (
      <svg viewBox={`0 0 ${vbSize} ${vbSize}`} className="w-full h-full p-0.5">
        {/* Khung bao ngoài thanh mảnh */}
        <rect x={framePad} y={framePad} width={frameInner} height={frameInner} fill={canvasBg} stroke={frameBorder} strokeWidth="1.8" rx="2" />

        {/* Các cánh cửa lùa xếp lớp zIndex */}
        {sashes.map((s, idx) => {
          const gap = count > 4 ? 1 : 2;
          const sw = Math.floor((frameInner - 8 - (count - 1) * gap) / count);
          const sx = framePad + 4 + idx * (sw + gap);
          const sy = framePad + 4;
          const sh = frameInner - 8;
          const isElevated = s.zIndex && s.zIndex > 0;
          const dir = Array.isArray(s.huongMo) ? s.huongMo[0] : s.huongMo;

          return (
            <g key={idx}>
              {/* Cánh kính */}
              <rect
                x={sx}
                y={sy}
                width={sw}
                height={sh}
                fill={isElevated ? elevatedGlass : glassColor}
                stroke={glassBorder}
                strokeWidth={isElevated ? '1.2' : '0.9'}
                rx="1"
              />

              {/* Mũi tên trượt màu xanh đậm */}
              {dir === 'lua-trai' && (
                <g stroke={blueSymbol} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <line x1={sx + sw * 0.22} y1={sy + sh / 2} x2={sx + sw * 0.78} y2={sy + sh / 2} />
                  <polyline points={`${sx + sw * 0.45} ${sy + sh / 2 - 3} ${sx + sw * 0.22} ${sy + sh / 2} ${sx + sw * 0.45} ${sy + sh / 2 + 3}`} />
                </g>
              )}
              {dir === 'lua-phai' && (
                <g stroke={blueSymbol} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <line x1={sx + sw * 0.22} y1={sy + sh / 2} x2={sx + sw * 0.78} y2={sy + sh / 2} />
                  <polyline points={`${sx + sw * 0.55} ${sy + sh / 2 - 3} ${sx + sw * 0.78} ${sy + sh / 2} ${sx + sw * 0.55} ${sy + sh / 2 + 3}`} />
                </g>
              )}
              {dir === '2-chieu' && (
                <polygon
                  points={`${sx + sw / 2} ${sy + sh / 2 - 3.5} ${sx + sw / 2 + 3.5} ${sy + sh / 2} ${sx + sw / 2} ${sy + sh / 2 + 3.5} ${sx + sw / 2 - 3.5} ${sy + sh / 2}`}
                  fill={blueSymbol}
                />
              )}
            </g>
          );
        })}
      </svg>
    );
  }

  // 2. NHÓM CỬA SỔ & CỬA ĐI MỞ QUAY / HẤT / LẬT (Chuẩn Windova 3D mở hé thanh thoát)
  if (family === 'cua-so' || family === 'cua-di') {
    // 2.1 Cửa 1 cánh mở quay (Phối cảnh 3D mở hé cánh trên nền trắng ngà)
    if (id === 'so-le-trai' || id === 'so-le-trai-mo-vao' || id === 'cua-di-le-trai-mo-ra' || id === 'cua-di-le-trai-mo-vao') {
      const isMoVao = id.includes('mo-vao');
      return (
        <svg viewBox={`0 0 ${vbSize} ${vbSize}`} className="w-full h-full p-1">
          <rect x={framePad} y={framePad} width={frameInner} height={frameInner} fill={canvasBg} stroke={frameBorder} strokeWidth="1.8" rx="2" />
          {/* Cánh mở hé phối cảnh 3D lề trái */}
          <polygon
            points="12,12 54,16 52,56 12,60"
            fill={glassColor}
            stroke={blueSymbol}
            strokeWidth="1.3"
            strokeDasharray={isMoVao ? '2.5,2' : undefined}
          />
          {/* Tam giác mở cửa */}
          <polyline points="52,16 14,36 50,56" fill="none" stroke={blueSymbol} strokeWidth="1.1" strokeDasharray={isMoVao ? '2,2' : undefined} />
        </svg>
      );
    }

    if (id === 'so-le-phai' || id === 'so-le-phai-mo-vao' || id === 'cua-di-le-phai-mo-ra' || id === 'cua-di-le-phai-mo-vao') {
      const isMoVao = id.includes('mo-vao');
      return (
        <svg viewBox={`0 0 ${vbSize} ${vbSize}`} className="w-full h-full p-1">
          <rect x={framePad} y={framePad} width={frameInner} height={frameInner} fill={canvasBg} stroke={frameBorder} strokeWidth="1.8" rx="2" />
          {/* Cánh mở hé phối cảnh 3D lề phải */}
          <polygon
            points="60,12 18,16 20,56 60,60"
            fill={glassColor}
            stroke={blueSymbol}
            strokeWidth="1.3"
            strokeDasharray={isMoVao ? '2.5,2' : undefined}
          />
          <polyline points="20,16 58,36 22,56" fill="none" stroke={blueSymbol} strokeWidth="1.1" strokeDasharray={isMoVao ? '2,2' : undefined} />
        </svg>
      );
    }

    // 2.2 Cửa 2 cánh mở quay đối xứng (Windova)
    if (id.includes('2-canh')) {
      const isMoVao = id.includes('mo-vao');
      return (
        <svg viewBox={`0 0 ${vbSize} ${vbSize}`} className="w-full h-full p-1">
          <rect x={framePad} y={framePad} width={frameInner} height={frameInner} fill={canvasBg} stroke={frameBorder} strokeWidth="1.8" rx="2" />
          {/* Cánh trái mở hé */}
          <polygon points="12,12 32,15 31,57 12,60" fill={glassColor} stroke={blueSymbol} strokeWidth="1.2" strokeDasharray={isMoVao ? '2,1.5' : undefined} />
          <polyline points="31,15 13,36 30,57" fill="none" stroke={blueSymbol} strokeWidth="1" strokeDasharray={isMoVao ? '2,1.5' : undefined} />
          {/* Cánh phải mở hé */}
          <polygon points="60,12 40,15 41,57 60,60" fill={glassColor} stroke={blueSymbol} strokeWidth="1.2" strokeDasharray={isMoVao ? '2,1.5' : undefined} />
          <polyline points="41,15 59,36 42,57" fill="none" stroke={blueSymbol} strokeWidth="1" strokeDasharray={isMoVao ? '2,1.5' : undefined} />
        </svg>
      );
    }

    // 2.3 Cửa sổ mở hất
    if (id === 'so-mo-hat') {
      return (
        <svg viewBox={`0 0 ${vbSize} ${vbSize}`} className="w-full h-full p-1">
          <rect x={framePad} y={framePad} width={frameInner} height={frameInner} fill={canvasBg} stroke={frameBorder} strokeWidth="1.8" rx="2" />
          {/* Cánh mở hé lên trên */}
          <polygon points="14,14 58,14 54,58 18,58" fill={glassColor} stroke={blueSymbol} strokeWidth="1.3" />
          <polyline points="18,58 36,16 54,58" fill="none" stroke={blueSymbol} strokeWidth="1.2" />
        </svg>
      );
    }

    // 2.4 Cửa sổ mở lật trong
    if (id === 'so-mo-lat') {
      return (
        <svg viewBox={`0 0 ${vbSize} ${vbSize}`} className="w-full h-full p-1">
          <rect x={framePad} y={framePad} width={frameInner} height={frameInner} fill={canvasBg} stroke={frameBorder} strokeWidth="1.8" rx="2" />
          {/* Cánh lật nét đứt */}
          <polygon points="18,14 54,14 58,58 14,58" fill={glassColor} stroke={blueSymbol} strokeWidth="1.3" strokeDasharray="3,2" />
          <polyline points="18,14 36,56 54,14" fill="none" stroke={blueSymbol} strokeWidth="1.2" strokeDasharray="2.5,2" />
        </svg>
      );
    }

    // 2.5 Quay - Hất
    if (id.includes('quay-hat')) {
      const isTrai = id.includes('trai');
      return (
        <svg viewBox={`0 0 ${vbSize} ${vbSize}`} className="w-full h-full p-1">
          <rect x={framePad} y={framePad} width={frameInner} height={frameInner} fill={canvasBg} stroke={frameBorder} strokeWidth="1.8" rx="2" />
          <rect x={11} y={11} width={50} height={50} fill={glassColor} stroke={blueSymbol} strokeWidth="1.2" />
          {/* Nét mở hất */}
          <polyline points="13,59 36,13 59,59" fill="none" stroke={blueSymbol} strokeWidth="1.1" />
          {/* Nét mở quay */}
          {isTrai ? (
            <polyline points="59,13 13,36 59,59" fill="none" stroke={blueSymbol} strokeWidth="1.1" />
          ) : (
            <polyline points="13,13 59,36 13,59" fill="none" stroke={blueSymbol} strokeWidth="1.1" />
          )}
        </svg>
      );
    }

    // 2.6 Quay - Lật
    if (id.includes('quay-lat')) {
      const isTrai = id.includes('trai');
      return (
        <svg viewBox={`0 0 ${vbSize} ${vbSize}`} className="w-full h-full p-1">
          <rect x={framePad} y={framePad} width={frameInner} height={frameInner} fill={canvasBg} stroke={frameBorder} strokeWidth="1.8" rx="2" />
          <rect x={11} y={11} width={50} height={50} fill={glassColor} stroke={blueSymbol} strokeWidth="1.2" />
          {/* Nét mở lật đứt */}
          <polyline points="13,13 36,59 59,13" fill="none" stroke={blueSymbol} strokeWidth="1.1" strokeDasharray="2.5,2" />
          {/* Nét mở quay đứt */}
          {isTrai ? (
            <polyline points="59,13 13,36 59,59" fill="none" stroke={blueSymbol} strokeWidth="1.1" strokeDasharray="2.5,2" />
          ) : (
            <polyline points="13,13 59,36 13,59" fill="none" stroke={blueSymbol} strokeWidth="1.1" strokeDasharray="2.5,2" />
          )}
        </svg>
      );
    }

    // 2.7 Cửa 3, 4 cánh mở quay
    return (
      <svg viewBox={`0 0 ${vbSize} ${vbSize}`} className="w-full h-full p-0.5">
        <rect x={framePad} y={framePad} width={frameInner} height={frameInner} fill={canvasBg} stroke={frameBorder} strokeWidth="1.8" rx="2" />
        {sashes.map((s, idx) => {
          const sw = Math.floor((frameInner - 8 - (count - 1) * 2) / count);
          const sx = framePad + 4 + idx * (sw + 2);
          const dir = Array.isArray(s.huongMo) ? s.huongMo[0] : s.huongMo;
          const isLeftHinge = dir.includes('le-trai');
          return (
            <g key={idx}>
              <rect x={sx} y={framePad + 4} width={sw} height={frameInner - 8} fill={glassColor} stroke={blueSymbol} strokeWidth="0.8" />
              {isLeftHinge ? (
                <polyline points={`${sx + sw},${framePad + 4} ${sx},${framePad + frameInner / 2} ${sx + sw},${framePad + frameInner - 4}`} fill="none" stroke={blueSymbol} strokeWidth="1" />
              ) : (
                <polyline points={`${sx},${framePad + 4} ${sx + sw},${framePad + frameInner / 2} ${sx},${framePad + frameInner - 4}`} fill="none" stroke={blueSymbol} strokeWidth="1" />
              )}
            </g>
          );
        })}
      </svg>
    );
  }

  // 3. NHÓM GẤP XẾP & TRƯỢT QUAY
  return (
    <svg viewBox={`0 0 ${vbSize} ${vbSize}`} className="w-full h-full p-0.5">
      <rect x={framePad} y={framePad} width={frameInner} height={frameInner} fill={canvasBg} stroke={frameBorder} strokeWidth="1.8" rx="2" />
      {sashes.map((s, idx) => {
        const gap = 1.2;
        const sw = Math.floor((frameInner - 8 - (count - 1) * gap) / count);
        const sx = framePad + 4 + idx * (sw + gap);
        const dir = Array.isArray(s.huongMo) ? s.huongMo[0] : s.huongMo;
        const isLeft = dir.includes('trai');

        return (
          <g key={idx}>
            <rect x={sx} y={framePad + 4} width={sw} height={frameInner - 8} fill={glassColor} stroke={blueSymbol} strokeWidth="0.8" />
            {dir.includes('lua') ? (
              <polyline
                points={isLeft ? `${sx + sw * 0.65},${36 - 2.5} ${sx + sw * 0.3},${36} ${sx + sw * 0.65},${36 + 2.5}` : `${sx + sw * 0.35},${36 - 2.5} ${sx + sw * 0.7},${36} ${sx + sw * 0.35},${36 + 2.5}`}
                fill="none"
                stroke={blueSymbol}
                strokeWidth="1.4"
              />
            ) : isLeft ? (
              <polyline points={`${sx + sw},${framePad + 5} ${sx},${36} ${sx + sw},${frameInner + 3}`} fill="none" stroke={blueSymbol} strokeWidth="0.8" />
            ) : (
              <polyline points={`${sx},${framePad + 5} ${sx + sw},${36} ${sx},${frameInner + 3}`} fill="none" stroke={blueSymbol} strokeWidth="0.8" />
            )}
          </g>
        );
      })}
    </svg>
  );
}

export const SashTypePicker: React.FC<SashTypePickerProps> = ({
  currentSashType,
  selectedCellId,
  isInsideSash = false,
  onSelectSashType,
  onSplitSashMullion,
}) => {
  const [splitCount, setSplitCount] = useState<number>(2);
  const [activeFamily, setActiveFamily] = useState<SashFamily>('cua-so');
  const [isSplitCollapsed, setIsSplitCollapsed] = useState<boolean>(true);

  // Phân loại nhóm hiển thị
  const familyTabs: { id: SashFamily; label: string }[] = [
    { id: 'cua-so', label: 'Cửa sổ' },
    { id: 'cua-di', label: 'Cửa đi' },
    { id: 'cua-so-lua', label: 'Sổ lùa' },
    { id: 'cua-di-lua', label: 'Đi lùa' },
    { id: 'gap-xep', label: 'Gấp xếp' },
    { id: 'truot-quay', label: 'Trượt quay' },
  ];

  // Danh sách layout thuộc nhóm đang chọn
  const currentFamilyLayouts = useMemo(() => {
    return Object.values(SASH_LAYOUT_CATALOG).filter((item) => item.family === activeFamily);
  }, [activeFamily]);

  const isFixed = currentSashType === 'fixed';
  const hasSelectedCell = Boolean(selectedCellId);

  return (
    <div className="flex flex-col space-y-2.5 text-xs">
      {/* 1. Header & Chia đố cánh (Collapsible gọn gàng) */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <button
          type="button"
          onClick={() => setIsSplitCollapsed(!isSplitCollapsed)}
          className="w-full p-2.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-xs">
            <Grid size={13} className="text-primary" />
            <span>Chia đố cánh</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            {isInsideSash && (
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200 font-medium">
                Trong cánh
              </span>
            )}
            {isSplitCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
          </div>
        </button>

        {!isSplitCollapsed && (
          <div className="p-2.5 pt-0 border-t border-slate-100 space-y-2">
            {!hasSelectedCell ? (
              <div className="text-[11px] text-slate-400 italic">Nhấp chọn cánh cửa trên bản vẽ để chia đố.</div>
            ) : isFixed && !isInsideSash ? (
              <div className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded">
                Ô fix dùng <strong>Chia đố khung</strong> ở tab Kiểu khung.
              </div>
            ) : (
              <div className="flex items-center gap-1.5 pt-1.5">
                <div className="flex items-center gap-1 shrink-0">
                  <input
                    type="number"
                    min={2}
                    max={6}
                    value={splitCount}
                    onChange={(e) => setSplitCount(Math.max(2, Math.min(6, Number(e.target.value))))}
                    className="w-9 h-7 text-center text-xs font-bold rounded border border-slate-200 bg-white focus:outline-none focus:border-primary"
                  />
                  <span className="text-slate-500 font-medium text-[11px]">ô</span>
                </div>
                <button
                  type="button"
                  onClick={() => onSplitSashMullion?.(splitCount, 'vertical')}
                  className="flex-1 h-7 px-1.5 rounded-md border border-emerald-300 bg-emerald-50/60 hover:bg-emerald-500 hover:text-white text-emerald-700 font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer text-[11px]"
                >
                  <Columns size={11} />
                  <span>Dọc</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSplitSashMullion?.(splitCount, 'horizontal')}
                  className="flex-1 h-7 px-1.5 rounded-md border border-emerald-300 bg-emerald-50/60 hover:bg-emerald-500 hover:text-white text-emerald-700 font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer text-[11px]"
                >
                  <Rows size={11} />
                  <span>Ngang</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. KHỐI KIỂU CÁNH CHUẨN WINDOVA (Ảnh 1 & Ảnh 3) */}
      <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-2.5">
        {/* Tiêu đề mục */}
        <div className="flex items-center justify-between">
          <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
            <span className="w-2.5 h-3.5 rounded-xs bg-[#c5a059] inline-block shadow-2xs" />
            <span>Kiểu cánh</span>
          </div>
          {selectedCellId && (
            <span className="text-[10px] text-primary bg-primary/10 font-bold px-1.5 py-0.5 rounded border border-primary/20">
              {isInsideSash ? 'Ô con' : `Ô ${selectedCellId}`}
            </span>
          )}
        </div>

        {/* Ô ĐẦU TIÊN: VÁCH KÍNH CỐ ĐỊNH (Ô FIX) - Giống hệt ô trên cùng trong Ảnh 1 & 3 */}
        <div>
          <button
            type="button"
            onClick={() => onSelectSashType('fixed')}
            title="Vách kính cố định (ô fix)"
            className={`w-18 h-18 rounded-lg p-1 transition-all cursor-pointer flex items-center justify-center bg-white ${
              isFixed
                ? 'ring-2 ring-blue-500 border-2 border-blue-500 shadow-xs'
                : 'border border-slate-200 hover:border-slate-300'
            }`}
          >
            <svg viewBox="0 0 72 72" className="w-full h-full p-0.5">
              {/* Khung nhôm mòi góc vách cố định thanh lịch */}
              <rect x="4" y="4" width="64" height="64" fill="#fcfbfa" stroke="#94a3b8" strokeWidth="1.8" rx="2" />
              {/* Kính cố định xanh ngọc thanh thoát */}
              <rect x="11" y="11" width="50" height="50" fill="#c8f5f0" stroke="#0284c7" strokeWidth="1" />
              {/* Đường mòi góc 45 độ */}
              <line x1="4" y1="4" x2="11" y2="11" stroke="#94a3b8" strokeWidth="1" />
              <line x1="68" y1="4" x2="61" y2="11" stroke="#94a3b8" strokeWidth="1" />
              <line x1="4" y1="68" x2="11" y2="61" stroke="#94a3b8" strokeWidth="1" />
              <line x1="68" y1="68" x2="61" y2="61" stroke="#94a3b8" strokeWidth="1" />
            </svg>
          </button>
        </div>

        {/* Thanh chọn Phân Loại (Family Tabs) */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[11px] border-b border-slate-100">
          {familyTabs.map((tab) => {
            const isTabActive = activeFamily === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFamily(tab.id)}
                className={`px-2 py-1 rounded-md whitespace-nowrap font-medium transition-all cursor-pointer ${
                  isTabActive
                    ? 'bg-slate-800 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* LƯỚI 3 CỘT CÁC Ô BIỂU TƯỢNG HÌNH VUÔNG (3-Column Grid) - Giống 100% Ảnh 1 & Ảnh 3 */}
        <div className="max-h-[380px] overflow-y-auto pr-0.5 custom-scrollbar">
          <div className="grid grid-cols-3 gap-2">
            {currentFamilyLayouts.map((layout) => {
              const isSelected = currentSashType === layout.id;

              return (
                <button
                  key={layout.id}
                  type="button"
                  onClick={() => onSelectSashType(layout.id as SashOpenType)}
                  title={`${layout.label} (${layout.sashes.length} cánh)`}
                  className={`aspect-square rounded-lg p-0.5 transition-all cursor-pointer flex items-center justify-center bg-white ${
                    isSelected
                      ? 'ring-2 ring-blue-500 border-2 border-blue-500 shadow-sm'
                      : 'border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {renderSquareVisualCard(layout)}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
