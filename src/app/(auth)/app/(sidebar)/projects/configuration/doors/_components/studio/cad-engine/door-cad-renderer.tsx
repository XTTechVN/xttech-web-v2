'use client';

import React from 'react';
import { SashCornerJoint } from '../studio-types';
import { CAD_CONFIG } from './cad-config';
import { DoorCadRendererProps } from './cad-types';
import { getCurvedFramePaths } from './cad-geometry';
import { buildCadLayout, getVerticalSlices, getHorizontalSlices } from './cad-tree-traverser';
import { CadMiteredFrame } from './components/cad-mitered-frame';
import { CadCurvedDoubleDoor, CadCurvedSingleDoor } from './components/cad-curved-door';
import { CadRectangularLeaf } from './components/cad-rectangular-leaf';
import { CadDimensionOverlay } from './components/cad-dimension-overlay';
import { CadSplitResizer } from './components/cad-split-resizer';

export { CAD_CONFIG };
export * from './cad-types';
export * from './cad-geometry';
export * from './cad-tree-traverser';

/**
 * Component chính DoorCadRenderer:
 * Chịu trách nhiệm thiết lập SVG Viewport, tỉ lệ scale, và phối hợp các sub-renderers.
 */
export const DoorCadRenderer: React.FC<DoorCadRendererProps> = ({
  id,
  hideDimensions = false,
  w,
  h,
  aluminumColor,
  hardwareColor,
  frameShape,
  rootCell,
  selectedCellId,
  selectedMullionId,
  onSelectCell,
  onSelectMullion,
  onEditDimension,
  onResizeSplit,
  frameConfig,
  sashConfig,
}) => {
  // Aspect ratio của bộ cửa thực tế
  const aspect = w / (h || 1);

  // ViewBox thích ứng theo tỉ lệ kích thước cửa:
  // Cửa rộng ngang (aspect >= 1.25) -> mở rộng vbW tới 780px
  // Cửa cao đứng (aspect <= 0.8) -> mở rộng vbH tới 680px
  // Cửa thông thường -> 540 x 500
  // Nếu hideDimensions (dùng cho thumbnail) -> 400 x 400 cân đối
  const vbW = hideDimensions ? 400 : aspect >= 1.25 ? Math.min(780, Math.max(540, Math.round(520 * Math.sqrt(aspect / 1.1)))) : 540;
  const vbH = hideDimensions ? 400 : aspect <= 0.8 ? Math.min(680, Math.max(500, Math.round(500 * Math.sqrt(0.9 / aspect)))) : 500;

  // Vùng vẽ tối đa dành cho khung cửa (chừa lề cho thước đo)
  const availW = hideDimensions ? vbW - 16 : vbW - 110;
  const availH = hideDimensions ? vbH - 16 : vbH - 95;
  const scale = Math.min(availW / w, availH / h);

  const fw = Math.round(w * scale);
  const fh = Math.round(h * scale);

  // Căn giữa cửa trong viewBox
  const ox = hideDimensions ? Math.round((vbW - fw) / 2) : Math.round((vbW - 55 - fw) / 2) + 20;
  const oy = hideDimensions ? Math.round((vbH - fh) / 2) : Math.round((vbH - 50 - fh) / 2) + 10;
  const baseDim = Math.min(fw, fh);

  // Khung bao ngoài: lấy theo cấu hình CAD_CONFIG
  const frameD = Math.max(
    CAD_CONFIG.FRAME.MIN_D,
    Math.min(CAD_CONFIG.FRAME.MAX_D, Math.round(baseDim * CAD_CONFIG.FRAME.SCALE_RATIO))
  );

  const isSlim = sashConfig?.sashStyle === 'slim';
  const isDoorUnit = h >= 1800;
  const defaultSashRatio = isDoorUnit ? CAD_CONFIG.SASH.DOOR_RATIO : CAD_CONFIG.SASH.WINDOW_RATIO;
  const sashD = isSlim
    ? Math.max(CAD_CONFIG.SASH.SLIM_MIN_D, Math.round(frameD * CAD_CONFIG.SASH.SLIM_RATIO))
    : Math.max(
        isDoorUnit ? CAD_CONFIG.SASH.DOOR_MIN_D : CAD_CONFIG.SASH.WINDOW_MIN_D,
        Math.min(
          isDoorUnit ? CAD_CONFIG.SASH.DOOR_MAX_D : CAD_CONFIG.SASH.WINDOW_MAX_D,
          Math.round(frameD * defaultSashRatio)
        )
      );

  const beadW = isSlim
    ? Math.max(CAD_CONFIG.BEAD.MIN_W * 0.75, Math.round(sashD * CAD_CONFIG.BEAD.SLIM_RATIO))
    : Math.max(CAD_CONFIG.BEAD.MIN_W, Math.min(CAD_CONFIG.BEAD.MAX_W, Math.round(sashD * CAD_CONFIG.BEAD.NORMAL_RATIO)));

  const sashJoint: SashCornerJoint = sashConfig?.cornerJoint ?? '45';

  // Đố tĩnh T: lấy theo cấu hình CAD_CONFIG
  const mullionT = Math.max(
    CAD_CONFIG.MULLION.MIN_T,
    Math.min(CAD_CONFIG.MULLION.MAX_T, Math.round(frameD * CAD_CONFIG.MULLION.SCALE_RATIO))
  );

  const isOpenBottom = frameConfig?.isOpenBottom ?? false;

  // Tính toán hình dạng khung vòm/bo góc (nếu có)
  const curvedPaths = getCurvedFramePaths(
    frameShape,
    ox,
    oy,
    fw,
    fh,
    frameD,
    isOpenBottom
  );
  const clipId = `door-inner-clip-${id || 'root'}`;

  // Xây dựng sơ đồ khung, đố và ô lá từ cây scene
  const { frames, mullions, couplingSeams, leaves } = buildCadLayout(rootCell, ox, oy, fw, fh, frameD, mullionT);

  // Dimensions positioning (Crisp CAD Style)
  const vertSlices = getVerticalSlices(rootCell);
  const horizSlices = getHorizontalSlices(rootCell);

  const isCurvedDouble = Boolean(
    curvedPaths &&
    mullions.length === 0 &&
    (
      (leaves.length === 1 && leaves[0].node.sashType === 'swing_double') ||
      (leaves.length === 2 &&
        leaves[0].node.sashType === 'swing_left' &&
        leaves[1].node.sashType === 'swing_right')
    )
  );

  const isCurvedSingle = Boolean(
    curvedPaths &&
    mullions.length === 0 &&
    leaves.length === 1 &&
    leaves[0].node.sashType !== 'swing_double'
  );

  return (
    <svg
      id={id}
      viewBox={`0 0 ${vbW} ${vbH}`}
      className="w-full h-full max-w-full max-h-full select-none"
      shapeRendering="geometricPrecision"
      textRendering="geometricPrecision"
      onClick={() => onSelectCell(null)}
      onContextMenu={(e) => e.preventDefault()}
    >
      <defs>
        <pattern id="screen-mesh" width="4" height="4" patternUnits="userSpaceOnUse">
          <path d="M 0 2 L 4 2 M 2 0 L 2 4" stroke="#94a3b8" strokeWidth="0.5" />
        </pattern>
        <pattern id="louver-pattern" width="10" height="8" patternUnits="userSpaceOnUse">
          <line x1="0" y1="4" x2="10" y2="4" stroke="#64748b" strokeWidth="1.2" />
        </pattern>
        {curvedPaths && (
          <clipPath id={clipId}>
            <path d={curvedPaths.innerPath} />
          </clipPath>
        )}
      </defs>

      {/* 1. Outer Frame: Uốn cong theo kiểu khung (Vòm, Bo góc) HOẶC Ghép mòi 45° chữ nhật */}
      {curvedPaths ? (
        <g key="curved-outer-frame">
          <path
            d={`${curvedPaths.outerPath} ${curvedPaths.innerPath}`}
            fill={aluminumColor}
            fillRule="evenodd"
            stroke="none"
          />
          <path
            d={curvedPaths.outerPath}
            fill="none"
            stroke="#27272a"
            strokeWidth="0.8"
          />
          <path
            d={curvedPaths.innerPath}
            fill="none"
            stroke="#27272a"
            strokeWidth="0.8"
          />
        </g>
      ) : (
        frames.map((fb) => (
          <CadMiteredFrame
            key={fb.id}
            fx={fb.x}
            fy={fb.y}
            fwBox={fb.w}
            fhBox={fb.h}
            aluminumColor={aluminumColor}
            frameD={frameD}
            frameShape={frameShape}
            framesCount={frames.length}
            frameConfig={frameConfig}
          />
        ))
      )}

      {/* Vùng lòng cửa: Đố chia ô, Khung cánh, Kính, Nẹp, Tay nắm — Tự động cắt theo lòng vòm cong */}
      <g clipPath={curvedPaths ? `url(#${clipId})` : undefined}>
        {/* 2. Split Resizer: Đố T và Vách ghép Tách khung (Hỗ trợ kéo chuột phải) */}
        <CadSplitResizer
          mullions={mullions}
          couplingSeams={couplingSeams}
          scale={scale}
          selectedMullionId={selectedMullionId}
          aluminumColor={aluminumColor}
          onSelectMullion={onSelectMullion}
          onResizeSplit={onResizeSplit}
        />

        {/* 3. Leaf Cells: Glass + Sash + Opening Symbols */}
        {isCurvedDouble ? (
          <CadCurvedDoubleDoor
            id={id}
            frameShape={frameShape}
            ox={ox}
            oy={oy}
            fw={fw}
            fh={fh}
            h={h}
            frameD={frameD}
            sashD={sashD}
            mullionT={mullionT}
            aluminumColor={aluminumColor}
            hardwareColor={hardwareColor}
            isOpenBottom={isOpenBottom}
            selectedCellId={selectedCellId}
            onSelectCell={onSelectCell}
            onEditDimension={onEditDimension}
            leftNode={leaves[0].node}
            rightNode={leaves[1]?.node}
          />
        ) : isCurvedSingle ? (
          <CadCurvedSingleDoor
            id={id}
            frameShape={frameShape}
            ox={ox}
            oy={oy}
            fw={fw}
            fh={fh}
            h={h}
            frameD={frameD}
            sashD={sashD}
            mullionT={mullionT}
            aluminumColor={aluminumColor}
            hardwareColor={hardwareColor}
            isOpenBottom={isOpenBottom}
            selectedCellId={selectedCellId}
            onSelectCell={onSelectCell}
            onEditDimension={onEditDimension}
            node={leaves[0].node}
          />
        ) : (
          leaves.map((leaf) => (
            <CadRectangularLeaf
              key={leaf.node.id}
              leaf={leaf}
              allLeaves={leaves}
              isSelected={selectedCellId === leaf.node.id}
              sashD={sashD}
              beadW={beadW}
              mullionT={mullionT}
              frameD={frameD}
              h={h}
              oy={oy}
              fh={fh}
              aluminumColor={aluminumColor}
              hardwareColor={hardwareColor}
              sashJoint={sashJoint}
              isOpenBottom={isOpenBottom}
              onSelectCell={onSelectCell}
              onEditDimension={onEditDimension}
            />
          ))
        )}
      </g>

      {/* Đường nẹp chỉ thanh mảnh chạy theo viền trong của khung vòm */}
      {curvedPaths && (
        <path
          d={curvedPaths.innerPath}
          fill="none"
          stroke="#27272a"
          strokeWidth="0.6"
        />
      )}

      {/* Dimensions & Sub-dimensions */}
      {!hideDimensions && (
        <CadDimensionOverlay
          w={w}
          h={h}
          ox={ox}
          oy={oy}
          fw={fw}
          fh={fh}
          frameD={frameD}
          sashD={sashD}
          isOpenBottom={isOpenBottom}
          vertSlices={vertSlices}
          horizSlices={horizSlices}
          leaves={leaves}
          onEditDimension={onEditDimension}
        />
      )}
    </svg>
  );
};
