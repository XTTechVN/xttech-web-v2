import React from 'react';
import { FrameShape, SceneCellNode } from '../../studio-types';
import { CAD_CONFIG } from '../cad-config';
import { getCurvedContourPath } from '../cad-geometry';

interface CadCurvedDoorBaseProps {
  id?: string;
  frameShape: FrameShape;
  ox: number;
  oy: number;
  fw: number;
  fh: number;
  h: number;
  frameD: number;
  sashD: number;
  mullionT: number;
  aluminumColor: string;
  hardwareColor: string;
  isOpenBottom: boolean;
  selectedCellId: string | null;
  onSelectCell: (cellId: string | null) => void;
  onEditDimension?: (target: 'w' | 'h' | 'cell' | 'handleHeight', cellId?: string) => void;
}

interface CadCurvedDoubleDoorProps extends CadCurvedDoorBaseProps {
  leftNode: SceneCellNode;
  rightNode?: SceneCellNode;
}

interface CadCurvedSingleDoorProps extends CadCurvedDoorBaseProps {
  node: SceneCellNode;
}

/**
 * Render Cánh cong đặc biệt cho cửa 2 cánh mở quay đối xứng (swing_double hoặc cặp swing_left + swing_right) trong khung vòm / tròn
 */
export const CadCurvedDoubleDoor: React.FC<CadCurvedDoubleDoorProps> = ({
  id,
  frameShape,
  ox,
  oy,
  fw,
  fh,
  h,
  frameD,
  sashD,
  mullionT,
  aluminumColor,
  hardwareColor,
  isOpenBottom,
  selectedCellId,
  onSelectCell,
  onEditDimension,
  leftNode,
  rightNode,
}) => {
  const effectiveRightNode = rightNode || leftNode;
  const isLeftSelected = selectedCellId === leftNode.id;
  const isRightSelected = selectedCellId === effectiveRightNode.id;
  const dSash = sashD;
  const dBead = Math.max(
    CAD_CONFIG.BEAD.MIN_W,
    Math.min(CAD_CONFIG.BEAD.MAX_W, Math.round(dSash * CAD_CONFIG.BEAD.NORMAL_RATIO))
  );
  const astW = Math.max(
    CAD_CONFIG.MULLION.ASTRAGAL_MIN,
    Math.min(CAD_CONFIG.MULLION.ASTRAGAL_MAX, Math.round(mullionT * CAD_CONFIG.MULLION.ASTRAGAL_RATIO))
  );

  const pathSashOuter = getCurvedContourPath(frameShape, ox, oy, fw, fh, frameD, isOpenBottom);
  const pathSashInner = getCurvedContourPath(frameShape, ox, oy, fw, fh, frameD + dSash, isOpenBottom);
  const pathBeadInner = getCurvedContourPath(frameShape, ox, oy, fw, fh, frameD + dSash + dBead, isOpenBottom);

  if (!pathSashOuter || !pathSashInner || !pathBeadInner) return null;

  const xMid = ox + fw / 2;
  const astX = xMid - astW / 2;
  const leftStileX = astX - dSash;
  const rightStileX = astX + astW;
  const leftBeadX = leftStileX - dBead;
  const rightBeadX = rightStileX + dSash;

  // Cao độ tay nắm
  const handleHVal = effectiveRightNode.handleHeight || leftNode.handleHeight || Math.round((effectiveRightNode.h || h) / 2);
  const lockYCalc = oy + fh - Math.round((handleHVal / h) * fh);
  const handleY = Math.max(oy + frameD + dSash + 30, Math.min(oy + fh - frameD - dSash - 30, lockYCalc));

  // Clip paths cho kính cánh trái và cánh phải
  const leftGlassClipId = `curved-glass-l-${id || 'root'}`;
  const rightGlassClipId = `curved-glass-r-${id || 'root'}`;

  // Tọa độ neo cho ký hiệu mở cánh (tam giác đỏ)
  const isCircleOrEllipse = frameShape === 'circle' || frameShape === 'ellipse';
  let hingeTopY = oy + fh * 0.22;
  let hingeBotY = oy + fh * 0.78;
  let leftHingeTopX = ox + frameD + dSash + dBead + 4;
  let leftHingeBotX = ox + frameD + dSash + dBead + 4;
  let rightHingeTopX = ox + fw - (frameD + dSash + dBead + 4);
  let rightHingeBotX = ox + fw - (frameD + dSash + dBead + 4);

  if (isCircleOrEllipse) {
    hingeTopY = handleY - fh * 0.32;
    hingeBotY = handleY + fh * 0.32;
    const rxIn = Math.max(2, fw / 2 - (frameD + dSash + dBead));
    const ryIn = Math.max(2, fh / 2 - (frameD + dSash + dBead));
    const cxMid = ox + fw / 2;
    const cyMid = oy + fh / 2;
    const dy = Math.min(ryIn * 0.9, Math.abs(hingeTopY - cyMid));
    const dx = rxIn * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ryIn * ryIn)));
    leftHingeTopX = cxMid - dx + 4;
    leftHingeBotX = cxMid - dx + 4;
    rightHingeTopX = cxMid + dx - 4;
    rightHingeBotX = cxMid + dx - 4;
  } else if (frameShape.startsWith('arch_')) {
    const r = Math.min(fw / 2, fh);
    const ySpring = oy + r;
    hingeTopY = Math.max(oy + frameD + dSash + 20, ySpring - 10);
    hingeBotY = oy + fh - frameD - dSash - 20;
  }

  return (
    <g key={`${leftNode.id}-curved-double`}>
      <defs>
        <clipPath id={leftGlassClipId}>
          <rect x={ox - 40} y={oy - 40} width={Math.max(0, leftBeadX - (ox - 40))} height={fh + 80} />
        </clipPath>
        <clipPath id={rightGlassClipId}>
          <rect x={rightBeadX + dBead} y={oy - 40} width={Math.max(0, ox + fw + 40 - (rightBeadX + dBead))} height={fh + 80} />
        </clipPath>
      </defs>

      {/* 1. Kính cánh trái */}
      <path
        d={pathBeadInner}
        clipPath={`url(#${leftGlassClipId})`}
        fill="#b2f5ea"
        fillOpacity={0.85}
        stroke="none"
        className="cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onSelectCell(leftNode.id);
        }}
      />

      {/* Kính cánh phải */}
      <path
        d={pathBeadInner}
        clipPath={`url(#${rightGlassClipId})`}
        fill="#b2f5ea"
        fillOpacity={0.85}
        stroke="none"
        className="cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onSelectCell(effectiveRightNode.id);
        }}
      />

      {/* Viền chọn cánh trái khi đang active */}
      {isLeftSelected && (
        <path
          d={pathBeadInner}
          clipPath={`url(#${leftGlassClipId})`}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="1.5"
          strokeDasharray="5,3"
        />
      )}

      {/* Viền chọn cánh phải khi đang active */}
      {isRightSelected && (
        <path
          d={pathBeadInner}
          clipPath={`url(#${rightGlassClipId})`}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="1.5"
          strokeDasharray="5,3"
        />
      )}

      {/* 2. Đường nét mở cánh (Tam giác đỏ) */}
      <polyline
        points={`${leftHingeTopX},${hingeTopY} ${leftBeadX},${handleY} ${leftHingeBotX},${hingeBotY}`}
        fill="none"
        stroke="#dc2626"
        strokeWidth="1"
      />
      <polyline
        points={`${rightHingeTopX},${hingeTopY} ${rightBeadX + dBead},${handleY} ${rightHingeBotX},${hingeBotY}`}
        fill="none"
        stroke="#dc2626"
        strokeWidth="1"
      />

      {/* 3. Nẹp kính cong bao quanh chu vi */}
      <path
        d={`${pathSashInner} ${pathBeadInner}`}
        fill={aluminumColor}
        fillRule="evenodd"
        stroke="#27272a"
        strokeWidth="0.5"
      />

      {/* 4. Bản cánh cong bao quanh chu vi */}
      <path
        d={`${pathSashOuter} ${pathSashInner}`}
        fill={aluminumColor}
        fillRule="evenodd"
        stroke="#27272a"
        strokeWidth="0.7"
      />

      {/* 5. Cụm đố đứng & nẹp đứng ở giữa */}
      <rect x={leftBeadX} y={oy} width={dBead} height={fh} fill={aluminumColor} stroke="#27272a" strokeWidth="0.5" />
      <rect x={leftStileX} y={oy} width={dSash} height={fh} fill={aluminumColor} stroke="#27272a" strokeWidth="0.7" />
      <rect x={astX} y={oy} width={astW} height={fh} fill={aluminumColor} stroke="#27272a" strokeWidth="0.7" />
      <rect x={rightStileX} y={oy} width={dSash} height={fh} fill={aluminumColor} stroke="#27272a" strokeWidth="0.7" />
      <rect x={rightBeadX} y={oy} width={dBead} height={fh} fill={aluminumColor} stroke="#27272a" strokeWidth="0.5" />

      {/* 6. Cặp tay nắm khóa 2 cánh ở giữa */}
      {(() => {
        const plateW = 4.5;
        const plateH = 22;
        const leverW = 14;
        const leverH = 3.5;

        const lPlateX = leftStileX + dSash / 2 - plateW / 2;
        const lPlateY = handleY - plateH / 2;
        const lLeverX = lPlateX + plateW / 2 - leverW;

        const rPlateX = rightStileX + dSash / 2 - plateW / 2;
        const rPlateY = handleY - plateH / 2;
        const rLeverX = rPlateX + plateW / 2;

        return (
          <g
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onEditDimension?.('handleHeight', effectiveRightNode.id);
            }}
          >
            {/* Tay nắm trái */}
            <rect x={lPlateX} y={lPlateY} width={plateW} height={plateH} rx={1.5} fill={hardwareColor} stroke="#000" strokeWidth="0.5" />
            <circle cx={lPlateX + plateW / 2} cy={handleY + 5.5} r={1} fill="#111" />
            <rect x={lLeverX} y={handleY - leverH / 2} width={leverW} height={leverH} rx={1.2} fill={hardwareColor} stroke="#000" strokeWidth="0.5" />

            {/* Tay nắm phải */}
            <rect x={rPlateX} y={rPlateY} width={plateW} height={plateH} rx={1.5} fill={hardwareColor} stroke="#000" strokeWidth="0.5" />
            <circle cx={rPlateX + plateW / 2} cy={handleY + 5.5} r={1} fill="#111" />
            <rect x={rLeverX} y={handleY - leverH / 2} width={leverW} height={leverH} rx={1.2} fill={hardwareColor} stroke="#000" strokeWidth="0.5" />
          </g>
        );
      })()}
    </g>
  );
};

/**
 * Render Cánh đơn hoặc Vách chết cong uốn theo khung vòm/tròn
 */
export const CadCurvedSingleDoor: React.FC<CadCurvedSingleDoorProps> = ({
  frameShape,
  ox,
  oy,
  fw,
  fh,
  h,
  frameD,
  sashD,
  aluminumColor,
  isOpenBottom,
  selectedCellId,
  onSelectCell,
  node,
}) => {
  const isSelected = selectedCellId === node.id;
  const isFixed = node.sashType === 'fixed';
  const dSash = isFixed ? 0 : sashD;
  const dBead = isFixed
    ? Math.max(CAD_CONFIG.BEAD.MIN_W, Math.min(CAD_CONFIG.BEAD.MAX_W, Math.round(frameD * CAD_CONFIG.BEAD.FIXED_RATIO)))
    : Math.max(CAD_CONFIG.BEAD.MIN_W, Math.min(CAD_CONFIG.BEAD.MAX_W, Math.round(dSash * CAD_CONFIG.BEAD.NORMAL_RATIO)));

  const pathSashOuter = getCurvedContourPath(frameShape, ox, oy, fw, fh, frameD, isOpenBottom);
  const pathSashInner = dSash > 0 ? getCurvedContourPath(frameShape, ox, oy, fw, fh, frameD + dSash, isOpenBottom) : pathSashOuter;
  const pathBeadInner = getCurvedContourPath(frameShape, ox, oy, fw, fh, frameD + dSash + dBead, isOpenBottom);

  if (!pathSashOuter || !pathSashInner || !pathBeadInner) return null;

  const xMid = ox + fw / 2;
  const handleHVal = node.handleHeight || Math.round(node.h / 2);
  const lockYCalc = oy + fh - Math.round((handleHVal / h) * fh);
  const handleY = Math.max(oy + frameD + dSash + 30, Math.min(oy + fh - frameD - dSash - 30, lockYCalc));

  return (
    <g
      key={`${node.id}-curved-single`}
      className="cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        onSelectCell(node.id);
      }}
    >
      {/* Kính */}
      <path d={pathBeadInner} fill="#b2f5ea" fillOpacity={0.85} stroke="none" />

      {/* Viền chọn ô kính khi đang active */}
      {isSelected && (
        <path
          d={pathBeadInner}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="1.5"
          strokeDasharray="5,3"
        />
      )}

      {/* Ký hiệu mở nếu có */}
      {!isFixed && (
        <g>
          {node.sashType === 'swing_left' && (
            <polyline
              points={`${ox + frameD + dSash + dBead + 5},${handleY - fh * 0.3} ${ox + fw - frameD - dSash - dBead - 5},${handleY} ${ox + frameD + dSash + dBead + 5},${handleY + fh * 0.3}`}
              fill="none"
              stroke="#dc2626"
              strokeWidth="1"
            />
          )}
          {node.sashType === 'swing_right' && (
            <polyline
              points={`${ox + fw - frameD - dSash - dBead - 5},${handleY - fh * 0.3} ${ox + frameD + dSash + dBead + 5},${handleY} ${ox + fw - frameD - dSash - dBead - 5},${handleY + fh * 0.3}`}
              fill="none"
              stroke="#dc2626"
              strokeWidth="1"
            />
          )}
          {node.sashType === 'awning' && (
            <polyline
              points={`${ox + frameD + dSash + dBead + 10},${oy + fh - frameD - dSash - dBead - 10} ${xMid},${oy + frameD + dSash + dBead + 5} ${ox + fw - frameD - dSash - dBead - 10},${oy + fh - frameD - dSash - dBead - 10}`}
              fill="none"
              stroke="#dc2626"
              strokeWidth="1"
            />
          )}
        </g>
      )}

      {/* Nẹp kính cong */}
      <path
        d={`${pathSashInner} ${pathBeadInner}`}
        fill={aluminumColor}
        fillRule="evenodd"
        stroke="#27272a"
        strokeWidth="0.5"
      />

      {/* Bản cánh cong (nếu không phải vách cố định) */}
      {!isFixed && (
        <path
          d={`${pathSashOuter} ${pathSashInner}`}
          fill={aluminumColor}
          fillRule="evenodd"
          stroke="#27272a"
          strokeWidth="0.7"
        />
      )}
    </g>
  );
};
