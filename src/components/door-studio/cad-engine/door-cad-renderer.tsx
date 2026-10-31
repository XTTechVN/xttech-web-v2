'use client';

import React from 'react';
import { SashCornerJoint, SceneCellNode } from '../studio-types';
import { CAD_CONFIG } from './cad-config';
import { DoorCadRendererProps } from './cad-types';
import { getCurvedFramePaths } from './cad-geometry';
import { buildCadLayout, getVerticalSlices, getHorizontalSlices, collectSashMullions } from './cad-tree-traverser';
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
  onUpdateDimension,
  onResizeSplit,
  frameConfig,
  sashConfig,
  availableProfiles,
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

  // Dimensions & slices definition
  const vertSlices = getVerticalSlices(rootCell);
  const horizSlices = getHorizontalSlices(rootCell);
  const hasVertSubDims = !hideDimensions && vertSlices.length > 1;
  const hasHorizSubDims = !hideDimensions && horizSlices.length > 1;

  // Đếm số mức cao độ tay nắm khóa khác nhau để dành khoảng lề trái phù hợp (1 tầng hoặc nhiều tầng khi khóa lệch nhau)
  const collectLockHeights = (node: SceneCellNode, acc: Set<number>) => {
    if (!node.children || node.children.length === 0 || node.splitType === 'sash_mullion') {
      if (node.sashType === 'fixed') return;
      const isBottomOrTop =
        node.sashType === 'awning' ||
        node.sashType === 'tilt' ||
        node.sashType === 'mo-hat' ||
        node.sashType === 'mo-lat' ||
        node.sashType === 'tilt_down';
      if (isBottomOrTop) return;

      const defaultHasHandle = [
        'swing_left',
        'swing_right',
        'swing_double',
        'tilt_turn',
        'le-trai-mo-ra',
        'le-trai-mo-vao',
        'le-phai-mo-ra',
        'le-phai-mo-vao',
        'gap-xep-le-trai',
        'gap-xep-le-phai',
        'lua-trai',
        'lua-phai',
        'canh-truot',
        'sliding',
      ].includes(node.sashType || '');

      if ((node.hasLock ?? defaultHasHandle) && node.hasLock !== false) {
        const isHyd = Boolean(sashConfig?.isHydraulic || node.isHydraulic);
        const hVal = node.handleHeight || (isHyd ? 1050 : Math.round(node.h / 2));
        acc.add(hVal);
      }
      return;
    }
    node.children.forEach((c) => collectLockHeights(c, acc));
  };

  const lockHeightsSet = new Set<number>();
  if (!hideDimensions) {
    collectLockHeights(rootCell, lockHeightsSet);
  }
  const lockLevelsCount = lockHeightsSet.size;

  // Kích thước lề dành cho thước đo 2 bên và trên dưới
  const leftRulerW = lockLevelsCount > 1 ? 56 : lockLevelsCount === 1 ? 38 : 0;
  const rightRulerW = hasHorizSubDims ? 55 : 36;
  const bottomRulerH = hasVertSubDims ? 55 : 36;
  const topRulerH = 12;

  // Vùng vẽ tối đa dành cho khung cửa (chừa lề đối xứng và cân đối cho các tầng thước đo)
  const availW = hideDimensions ? vbW - 16 : vbW - (leftRulerW + rightRulerW + 28);
  const availH = hideDimensions ? vbH - 16 : vbH - (topRulerH + bottomRulerH + 20);
  const scale = Math.min(availW / w, availH / h);

  const fw = Math.round(w * scale);
  const fh = Math.round(h * scale);

  // Căn giữa cửa cân đối hoàn hảo trong viewBox theo kích thước bao của cửa và các thước
  const totalContentW = leftRulerW + fw + rightRulerW;
  const ox = hideDimensions ? Math.round((vbW - fw) / 2) : Math.round((vbW - totalContentW) / 2) + leftRulerW;

  const totalContentH = topRulerH + fh + bottomRulerH;
  const oy = hideDimensions ? Math.round((vbH - fh) / 2) : Math.round((vbH - totalContentH) / 2) + topRulerH;

  // 1. Khung bao (FRAME): Ưu tiên lấy theo sectionHeightMm của profile được chọn, fallback về mặc định chuẩn mm
  const selectedFrameProfile = availableProfiles?.find(
    (p) =>
      p.id === frameConfig?.leftEdge?.profileId ||
      p.id === frameConfig?.topEdge?.profileId ||
      p.id === frameConfig?.rightEdge?.profileId ||
      p.id === frameConfig?.bottomEdge?.profileId
  );
  const frameMm =
    selectedFrameProfile?.sectionHeightMm && selectedFrameProfile.sectionHeightMm > 0
      ? selectedFrameProfile.sectionHeightMm
      : CAD_CONFIG.FRAME.DEFAULT_MM;
  const frameD = Math.max(CAD_CONFIG.FRAME.MIN_RENDER_PX, Math.round(frameMm * scale));

  // 2. Khung cánh (SASH): Ưu tiên lấy theo sectionHeightMm của profile cánh được chọn
  const isSlim = sashConfig?.sashStyle === 'slim';
  const isDoorUnit = h >= 1800;
  const selectedSashProfile = availableProfiles?.find(
    (p) =>
      p.id === sashConfig?.leftProfileId ||
      p.id === sashConfig?.topProfileId ||
      p.id === sashConfig?.rightProfileId ||
      p.id === sashConfig?.bottomProfileId
  );
  const defaultSashMm = isSlim
    ? CAD_CONFIG.SASH.SLIM_DEFAULT_MM
    : isDoorUnit
      ? CAD_CONFIG.SASH.DOOR_DEFAULT_MM
      : CAD_CONFIG.SASH.WINDOW_DEFAULT_MM;
  const sashMm =
    selectedSashProfile?.sectionHeightMm && selectedSashProfile.sectionHeightMm > 0
      ? selectedSashProfile.sectionHeightMm
      : defaultSashMm;
  const sashD = Math.max(CAD_CONFIG.SASH.MIN_RENDER_PX, Math.round(sashMm * scale));

  // 3. Nẹp kính (BEAD): Lấy theo profile nẹp hoặc mm mặc định
  const selectedBeadProfile = availableProfiles?.find(
    (p) => p.id === sashConfig?.beadProfileId || p.id === frameConfig?.beadProfileId
  );
  const defaultBeadMm = isSlim ? CAD_CONFIG.BEAD.SLIM_DEFAULT_MM : CAD_CONFIG.BEAD.DEFAULT_MM;
  const beadMm =
    selectedBeadProfile?.sectionHeightMm && selectedBeadProfile.sectionHeightMm > 0
      ? selectedBeadProfile.sectionHeightMm
      : defaultBeadMm;
  const beadW = Math.max(CAD_CONFIG.BEAD.MIN_RENDER_PX, Math.round(beadMm * scale));

  // 5. Thanh đảo khung (REVERSAL - C3208): Lấy theo profile đảo khung hoặc mặc định 28mm
  const selectedReversalProfile = availableProfiles?.find(
    (p) => p.id === frameConfig?.reversalProfileId
  );
  const defaultReversalMm = 28;
  const reversalMm =
    selectedReversalProfile?.sectionHeightMm && selectedReversalProfile.sectionHeightMm > 0
      ? selectedReversalProfile.sectionHeightMm
      : defaultReversalMm;
  const reversalD = Math.max(3, Math.round(reversalMm * scale));

  const sashJoint: SashCornerJoint = sashConfig?.cornerJoint ?? '45';

  // 4. Đố tĩnh (MULLION): Lấy theo profile đố hoặc mm mặc định (Hỗ trợ Dọc / Ngang riêng)
  const isMullionSeparate = frameConfig?.mullionMode === 'separate';
  const vertMullionProfile = availableProfiles?.find(
    (p) =>
      p.id ===
      (isMullionSeparate
        ? (frameConfig?.mullionVertProfileId || frameConfig?.mullionProfileId)
        : frameConfig?.mullionProfileId)
  );
  const horizMullionProfile = availableProfiles?.find(
    (p) =>
      p.id ===
      (isMullionSeparate
        ? (frameConfig?.mullionHorizProfileId || frameConfig?.mullionProfileId)
        : frameConfig?.mullionProfileId)
  );

  const defaultMullionMm = CAD_CONFIG.MULLION.DEFAULT_MM;
  const vertMullionMm =
    vertMullionProfile?.sectionHeightMm && vertMullionProfile.sectionHeightMm > 0
      ? vertMullionProfile.sectionHeightMm
      : defaultMullionMm;
  const horizMullionMm =
    horizMullionProfile?.sectionHeightMm && horizMullionProfile.sectionHeightMm > 0
      ? horizMullionProfile.sectionHeightMm
      : defaultMullionMm;

  const vertMullionT = Math.max(CAD_CONFIG.MULLION.MIN_RENDER_PX, Math.round(vertMullionMm * scale));
  const horizMullionT = Math.max(CAD_CONFIG.MULLION.MIN_RENDER_PX, Math.round(horizMullionMm * scale));
  const mullionT = Math.max(vertMullionT, horizMullionT);

  const isOpenBottom = frameConfig?.isOpenBottom ?? false;

  // 6. Độ ngậm cánh lùa (SLIDING OVERLAP): Lấy cấu hình mm hoặc bản rộng profile cánh
  const slidingOverlapMm =
    sashConfig?.slidingOverlapMm && sashConfig.slidingOverlapMm > 0
      ? sashConfig.slidingOverlapMm
      : sashMm;
  const slidingOverlapPx = Math.max(10, Math.round(slidingOverlapMm * scale));

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
  const isHydraulic = Boolean(sashConfig?.isHydraulic);
  const { frames, mullions, couplingSeams, leaves, bottomSills } = buildCadLayout(
    rootCell,
    ox,
    oy,
    fw,
    fh,
    frameD,
    mullionT,
    {
      isOpenBottom,
      isHydraulic,
      vertMullionT,
      horizMullionT,
      frameConfig,
      slidingOverlapPx,
    }
  );

  // Thu thập toàn bộ đố cánh (kể cả phân chia đệ quy) và hợp nhất vào danh sách đố tương tác
  const sashMullions = collectSashMullions(leaves, sashD);
  const allMullions = [...mullions, ...sashMullions];

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
        <>
          {frames.map((fb) => (
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
              isHydraulic={isHydraulic}
            />
          ))}
          {/* Thanh đáy ô fix chạm sàn cho cửa thủy lực */}
          {bottomSills?.map((sill, idx) => (
            <rect
              key={`bottom-sill-${idx}`}
              x={sill.x}
              y={sill.y}
              width={sill.w}
              height={sill.h}
              fill={aluminumColor}
              stroke="#27272a"
              strokeWidth="0.8"
            />
          ))}
        </>
      )}

      {/* Vùng lòng cửa: Đố chia ô, Khung cánh, Kính, Nẹp, Tay nắm — Tự động cắt theo lòng vòm cong */}
      <g clipPath={curvedPaths ? `url(#${clipId})` : undefined}>
        {/* 2. Leaf Cells: Glass + Sash + Opening Symbols */}
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
            frameConfig={frameConfig}
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
          [...leaves]
            .sort((a, b) => (a.node.sashZIndex ?? 0) - (b.node.sashZIndex ?? 0))
            .map((leaf) => (
            <CadRectangularLeaf
              key={leaf.node.id}
              leaf={leaf}
              allLeaves={leaves}
              isSelected={selectedCellId === leaf.node.id}
              selectedCellId={selectedCellId}
              sashD={sashD}
              beadW={beadW}
              mullionT={mullionT}
              frameD={frameD}
              reversalD={reversalD}
              frameConfig={frameConfig}
              h={h}
              oy={oy}
              fh={fh}
              aluminumColor={aluminumColor}
              hardwareColor={hardwareColor}
              sashJoint={sashJoint}
              isOpenBottom={isOpenBottom}
              sashConfig={sashConfig}
              onSelectCell={onSelectCell}
              onEditDimension={onEditDimension}
            />
          ))
        )}

        {/* 3. Split Resizer Layer: Đố T, Vách ghép Tách khung và Tay nắm khóa (Nằm trên cùng để nhận chuột 100%) */}
        <CadSplitResizer
          mullions={allMullions}
          couplingSeams={couplingSeams}
          leaves={leaves}
          scale={scale}
          h={h}
          oy={oy}
          fh={fh}
          sashD={sashD}
          sashConfig={sashConfig}
          selectedMullionId={selectedMullionId}
          aluminumColor={aluminumColor}
          onSelectCell={onSelectCell}
          onSelectMullion={onSelectMullion}
          onResizeSplit={onResizeSplit}
          onUpdateDimension={onUpdateDimension}
        />
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
          mullions={allMullions}
          sashConfig={sashConfig}
          selectedCellId={selectedCellId}
          onEditDimension={onEditDimension}
        />
      )}
    </svg>
  );
};
