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
  frameConfig?: import('../../studio-types').FrameConfig;
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
  aluminumColor,
  hardwareColor,
  isOpenBottom,
  selectedCellId,
  onSelectCell,
  onEditDimension,
  leftNode,
  rightNode,
  frameConfig,
}) => {
  const effectiveRightNode = rightNode || leftNode;
  const isLeftSelected = selectedCellId === leftNode.id;
  const isRightSelected = selectedCellId === effectiveRightNode.id;
  const dSash = sashD;
  const dBead = Math.max(
    CAD_CONFIG.BEAD.MIN_W,
    Math.min(CAD_CONFIG.BEAD.MAX_W, Math.round(dSash * CAD_CONFIG.BEAD.NORMAL_RATIO))
  );

  const pathSashOuter = getCurvedContourPath(frameShape, ox, oy, fw, fh, frameD, isOpenBottom);
  const pathSashInner = getCurvedContourPath(frameShape, ox, oy, fw, fh, frameD + dSash, isOpenBottom);
  const pathBeadInner = getCurvedContourPath(frameShape, ox, oy, fw, fh, frameD + dSash + dBead, isOpenBottom);

  if (!pathSashOuter || !pathSashInner || !pathBeadInner) return null;

  const isCutAtApex = frameConfig?.archConfig?.isCutAtApex ?? false;

  const xMid = ox + fw / 2;
  // Hai cánh khép sát tim cửa tại xMid (không bị chèn hộp đố động thô kệch)
  const leftStileX = xMid - dSash;
  const rightStileX = xMid;
  const leftBeadX = xMid - dSash - dBead;
  const rightBeadX = xMid + dSash;

  // Cao độ mép dưới cánh cong trên & mép nẹp kính
  const topSashInnerY = oy + frameD + dSash;
  const topBeadInnerY = oy + frameD + dSash + dBead;
  const yInBot = isOpenBottom ? oy + fh : oy + fh - frameD;
  const botSashInnerY = isOpenBottom ? yInBot : yInBot - dSash;
  const botBeadInnerY = isOpenBottom ? yInBot - dBead : yInBot - dSash - dBead;

  const stileY = topSashInnerY;
  const stileH = Math.max(10, yInBot - stileY);
  const beadY = topSashInnerY;
  const beadH = Math.max(10, botSashInnerY - beadY);

  // Cao độ tay nắm & Master node (ưu tiên cánh được chọn hoặc cánh phải)
  const masterNode = isLeftSelected ? leftNode : effectiveRightNode;
  const handleHVal = masterNode.handleHeight || Math.round((masterNode.h || h) / 2);
  const lockYCalc = oy + fh - Math.round((handleHVal / h) * fh);
  const handleY = Math.max(stileY + 20, Math.min(botSashInnerY - 20, lockYCalc));
  const isLockActive = masterNode.hasLock ?? (masterNode.sashType !== 'fixed');
  const handleType = masterNode.handleType || 'lever';

  // Clip paths cho kính cánh trái và cánh phải
  const leftGlassClipId = `curved-glass-l-${id || 'root'}`;
  const rightGlassClipId = `curved-glass-r-${id || 'root'}`;

  // Tọa độ nét mở cánh (Hình thoi cân đối 100% như Windova Hình 2)
  const isCircleOrEllipse = frameShape === 'circle' || frameShape === 'ellipse';
  const isLeftFixed = leftNode.sashType === 'fixed';
  const isRightFixed = effectiveRightNode.sashType === 'fixed';

  const yOpeningTop = topBeadInnerY + 8;
  const yOpeningBot = botBeadInnerY - 8;
  // Đỉnh nhọn 2 bên nằm chính xác tại TRUNG ĐIỂM CHIỀU CAO LÒNG CÁNH để nét đỏ luôn cân đối 100%
  const yHingeMid = (yOpeningTop + yOpeningBot) / 2;

  let leftOuterX = ox + frameD + dSash + dBead + 4;
  let rightOuterX = ox + fw - (frameD + dSash + dBead + 4);

  if (isCircleOrEllipse) {
    const rxIn = Math.max(2, fw / 2 - (frameD + dSash + dBead));
    const cxMid = ox + fw / 2;
    leftOuterX = cxMid - rxIn + 4;
    rightOuterX = cxMid + rxIn - 4;
  }

  const leftInnerX = leftBeadX;
  const rightInnerX = rightBeadX + dBead;

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

      {/* 2. Đường nét mở cánh (Hình thoi mở quay đối xứng như Hình 1) */}
      {!isLeftFixed && (
        <polyline
          points={`${leftInnerX},${yOpeningTop} ${leftOuterX},${yHingeMid} ${leftInnerX},${yOpeningBot}`}
          fill="none"
          stroke="#dc2626"
          strokeWidth="1"
        />
      )}
      {!isRightFixed && (
        <polyline
          points={`${rightInnerX},${yOpeningTop} ${rightOuterX},${yHingeMid} ${rightInnerX},${yOpeningBot}`}
          fill="none"
          stroke="#dc2626"
          strokeWidth="1"
        />
      )}

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

      {/* 5. Cụm đố đứng & nẹp đứng ở giữa (Góc vát mòi 45° lên đỉnh tim vòm như Hình 2) */}
      {/* Nẹp đứng trái & phải */}
      <rect x={leftBeadX} y={beadY} width={dBead} height={beadH} fill={aluminumColor} stroke="#27272a" strokeWidth="0.5" />
      <rect x={rightBeadX} y={beadY} width={dBead} height={beadH} fill={aluminumColor} stroke="#27272a" strokeWidth="0.5" />

      {/* Đố đứng cánh trái với góc vát mòi 45° lên đỉnh tim vòm (xMid, oy + frameD) */}
      <polygon
        points={`${leftStileX},${yInBot} ${leftStileX},${topSashInnerY} ${xMid},${oy + frameD} ${xMid},${yInBot}`}
        fill={aluminumColor}
        stroke="#27272a"
        strokeWidth="0.7"
      />
      {/* Đố đứng cánh phải với góc vát mòi 45° lên đỉnh tim vòm (xMid, oy + frameD) */}
      <polygon
        points={`${xMid},${yInBot} ${xMid},${oy + frameD} ${rightStileX + dSash},${topSashInnerY} ${rightStileX + dSash},${yInBot}`}
        fill={aluminumColor}
        stroke="#27272a"
        strokeWidth="0.7"
      />

      {/* 6. Đường tiếp giáp kỹ thuật ở tim & góc mòi chân cửa */}
      {/* Vết cắt đỉnh khung bao (nếu bật tùy chọn Cắt vòm tại đỉnh) */}
      {isCutAtApex && (
        <line x1={xMid} y1={oy} x2={xMid} y2={oy + frameD} stroke="#27272a" strokeWidth="0.8" />
      )}

      {/* Khe tiếp giáp đứng giữa 2 cánh chạy thẳng tắp từ đỉnh cánh xuống đáy cánh */}
      <line x1={xMid} y1={oy + frameD} x2={xMid} y2={yInBot} stroke="#27272a" strokeWidth="0.8" />

      {/* Thanh cánh ngang đáy & đường mòi chân cửa */}
      {!isOpenBottom && (
        <>
          {/* Mối ghép chân khung bao 90° (thanh đứng chạy suốt chạm sàn, thanh đáy lọt lòng - chuẩn Hình 2) */}
          <line x1={ox + frameD} y1={yInBot} x2={ox + frameD} y2={oy + fh} stroke="#27272a" strokeWidth="0.8" />
          <line x1={ox + fw - frameD} y1={yInBot} x2={ox + fw - frameD} y2={oy + fh} stroke="#27272a" strokeWidth="0.8" />

          {/* Mòi 2 góc ngoài đáy cánh (45 độ) */}
          <line x1={ox + frameD} y1={yInBot} x2={ox + frameD + dSash} y2={botSashInnerY} stroke="#27272a" strokeWidth="0.7" />
          <line x1={ox + fw - frameD} y1={yInBot} x2={ox + fw - frameD - dSash} y2={botSashInnerY} stroke="#27272a" strokeWidth="0.7" />

          {/* Mòi 2 góc ngoài đáy nẹp kính (45 độ - đồng quy liền mạch với góc cánh) */}
          <line x1={ox + frameD + dSash} y1={botSashInnerY} x2={ox + frameD + dSash + dBead} y2={botBeadInnerY} stroke="#27272a" strokeWidth="0.5" />
          <line x1={ox + fw - frameD - dSash} y1={botSashInnerY} x2={ox + fw - frameD - dSash - dBead} y2={botBeadInnerY} stroke="#27272a" strokeWidth="0.5" />
        </>
      )}

      {/* 7. Tay nắm khóa mở quay (Render đúng 1 khóa trên cánh chính, hỗ trợ đủ các loại tay nắm theo sidebar phải) */}
      {isLockActive && (() => {
        const isRightMaster = !isLeftSelected;
        const plateW = handleType === 'multipoint' ? 3.8 : 4.5;
        const plateH = handleType === 'multipoint' ? 16 : handleType === 'pull' ? 46 : 22;
        const leverW = handleType === 'multipoint' ? 12 : 14;
        const leverH = handleType === 'multipoint' ? 3 : 3.5;

        // Vị trí trục đố chính
        const stileX = isRightMaster ? rightStileX : leftStileX;
        const plateX = stileX + dSash / 2 - plateW / 2;
        const plateY = handleY - plateH / 2;
        // Tay gạt hướng vào lòng ô kính của cánh đó
        const leverX = isRightMaster ? plateX + plateW / 2 : plateX + plateW / 2 - leverW;

        return (
          <g
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onEditDimension?.('handleHeight', masterNode.id);
            }}
          >
            {handleType === 'crescent' ? (
              // Khóa bán nguyệt
              <g>
                <circle cx={plateX + plateW / 2} cy={handleY} r={6} fill={hardwareColor} stroke="#000" strokeWidth="0.5" />
                <path
                  d={`M ${plateX + plateW / 2} ${handleY - 5} A 5 5 0 0 ${isRightMaster ? 1 : 0} ${plateX + plateW / 2} ${handleY + 5} Z`}
                  fill="#111"
                />
              </g>
            ) : handleType === 'pull' ? (
              // Tay nắm kéo chữ D
              <g>
                <rect x={plateX} y={plateY} width={plateW} height={plateH} rx={2.2} fill={hardwareColor} stroke="#000" strokeWidth="0.5" />
                <circle cx={plateX + plateW / 2} cy={plateY + 5} r={1.2} fill="#111" />
                <circle cx={plateX + plateW / 2} cy={plateY + plateH - 5} r={1.2} fill="#111" />
              </g>
            ) : (
              // Tay gạt cửa đi (lever) hoặc tay gạt cửa sổ (multipoint)
              <g>
                <rect x={plateX} y={plateY} width={plateW} height={plateH} rx={1.5} fill={hardwareColor} stroke="#000" strokeWidth="0.5" />
                <circle cx={plateX + plateW / 2} cy={handleY + (handleType === 'multipoint' ? 3.5 : 5.5)} r={1} fill="#111" />
                <rect x={leverX} y={handleY - leverH / 2} width={leverW} height={leverH} rx={1.2} fill={hardwareColor} stroke="#000" strokeWidth="0.5" />
              </g>
            )}
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

      {/* Đường ghép mòi 45 độ góc đáy ngoài cùng khi có đáy */}
      {!isOpenBottom && (
        <>
          {/* Mối ghép chân khung bao 90° (thanh đứng chạy suốt chạm sàn, thanh đáy lọt lòng - chuẩn Hình 2) */}
          <line x1={ox + frameD} y1={oy + fh - frameD} x2={ox + frameD} y2={oy + fh} stroke="#27272a" strokeWidth="0.8" />
          <line x1={ox + fw - frameD} y1={oy + fh - frameD} x2={ox + fw - frameD} y2={oy + fh} stroke="#27272a" strokeWidth="0.8" />

          {/* Mòi 2 góc ngoài đáy cánh (45 độ nếu có cánh) */}
          {!isFixed && (
            <>
              <line x1={ox + frameD} y1={oy + fh - frameD} x2={ox + frameD + dSash} y2={oy + fh - frameD - dSash} stroke="#27272a" strokeWidth="0.7" />
              <line x1={ox + fw - frameD} y1={oy + fh - frameD} x2={ox + fw - frameD - dSash} y2={oy + fh - frameD - dSash} stroke="#27272a" strokeWidth="0.7" />
            </>
          )}

          {/* Mòi 2 góc ngoài đáy nẹp kính (45 độ) */}
          <line
            x1={ox + frameD + dSash}
            y1={oy + fh - frameD - dSash}
            x2={ox + frameD + dSash + dBead}
            y2={oy + fh - frameD - dSash - dBead}
            stroke="#27272a"
            strokeWidth="0.5"
          />
          <line
            x1={ox + fw - frameD - dSash}
            y1={oy + fh - frameD - dSash}
            x2={ox + fw - frameD - dSash - dBead}
            y2={oy + fh - frameD - dSash - dBead}
            stroke="#27272a"
            strokeWidth="0.5"
          />
        </>
      )}
    </g>
  );
};
