'use client';

import React from 'react';
import { ArchConfig, SceneCellNode } from '../studio-types';
import { ensureRootCellDimensions } from '../utils/door-tree-utils';
import { CAD_CONFIG } from './cad-config';
import { computeCadMetrics, resolveReversalMm } from './cad-metrics';
import { resolveBottomOpenPlan } from './cad-cell-config-resolver';
import { hasDefaultLeafHandle, resolveHandleHeightMm } from './cad-leaf-geometry';
import { DoorCadRendererProps } from './cad-types';
import {
  computeArchMetrics,
  getArchYAtX,
  getCurvedFramePaths,
  isArchOpenBottomShape,
} from './cad-geometry';
import { buildCadLayout, getVerticalSlices, getHorizontalSlices, collectLeafSashMullions } from './cad-tree-traverser';
import { CadMiteredFrame } from './components/cad-mitered-frame';
import { CadCurvedDoubleDoor, CadCurvedSingleDoor } from './components/cad-curved-door';
import { CadRectangularLeaf } from './components/cad-rectangular-leaf';
import { CadDimensionOverlay } from './components/cad-dimension-overlay';
import { CadSplitResizer } from './components/cad-split-resizer';

export { CAD_CONFIG };
export * from './cad-types';
export * from './cad-geometry';
export * from './cad-tree-traverser';

const LEFT_SWING_SASH_TYPES = ['swing_left', 'le-trai-mo-ra', 'le-trai-mo-vao'];
const RIGHT_SWING_SASH_TYPES = ['swing_right', 'le-phai-mo-ra', 'le-phai-mo-vao'];

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
  rootCell: rawRootCell,
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
  const rootCell = React.useMemo(
    () => ensureRootCellDimensions(rawRootCell, w, h),
    [rawRootCell, w, h]
  );
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

      if ((node.hasLock ?? hasDefaultLeafHandle(node.sashType)) && node.hasLock !== false) {
        acc.add(resolveHandleHeightMm(node, Boolean(sashConfig?.isHydraulic)));
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

  // Ghi đè Hở/Kín đáy theo từng ô: không có ghi đè => plan.mode 'global' và isOpenBottom giữ nguyên như cũ
  const isGlobalOpenBottom = Boolean((frameConfig?.isOpenBottom ?? false) || isArchOpenBottomShape(frameShape));
  const bottomOpenPlan = resolveBottomOpenPlan(rootCell, isGlobalOpenBottom);
  const isOpenBottom = bottomOpenPlan.isOpenBottom;
  const isPartialBottomOpen = bottomOpenPlan.mode === 'partial';
  const collectMinHoNen = (node: SceneCellNode): number => {
    if (!node.children || node.children.length === 0 || node.splitType === 'sash_mullion') {
      if (node.sashType === 'fixed') return 0;
      return node.hoNenMm ?? sashConfig?.hoNenMm ?? 8;
    }
    return Math.min(0, ...node.children.map(collectMinHoNen));
  };
  const minHoNenMm = isOpenBottom || isPartialBottomOpen ? Math.min(0, collectMinHoNen(rootCell)) : 0;
  const bottomOverhangMm = minHoNenMm < 0 ? Math.min(Math.round(h * 0.5), Math.abs(minHoNenMm)) : 0;

  // Kích thước lề dành cho thước đo 2 bên và trên dưới
  const leftRulerW = lockLevelsCount > 1 ? 56 : lockLevelsCount === 1 ? 38 : 0;
  const rightRulerW = hasHorizSubDims ? 55 : 36;
  const bottomRulerH = hasVertSubDims ? 55 : 36;
  const topRulerH = 12;

  // Vùng vẽ tối đa dành cho khung cửa (chừa lề đối xứng và cân đối cho các tầng thước đo)
  const availW = hideDimensions ? vbW - 16 : vbW - (leftRulerW + rightRulerW + 28);
  const availH = hideDimensions ? vbH - 16 : vbH - (topRulerH + bottomRulerH + 20);
  const scale = Math.min(availW / w, availH / (h + bottomOverhangMm));

  const fw = Math.round(w * scale);
  const fh = Math.round(h * scale);
  const bottomOverhangPx = Math.round(bottomOverhangMm * scale);

  // Căn giữa cửa cân đối hoàn hảo trong viewBox theo kích thước bao của cửa và các thước
  const totalContentW = leftRulerW + fw + rightRulerW;
  const ox = hideDimensions ? Math.round((vbW - fw) / 2) : Math.round((vbW - totalContentW) / 2) + leftRulerW;

  const totalContentH = topRulerH + fh + bottomOverhangPx + bottomRulerH;
  const oy = hideDimensions
    ? Math.round((vbH - (fh + bottomOverhangPx)) / 2)
    : Math.round((vbH - totalContentH) / 2) + topRulerH;

  // Số đo thực (px = mm × scale): độ dày từng cạnh khung bao / cánh, nẹp, đố, đảo khung, độ ngậm cánh lùa
  const metrics = computeCadMetrics({
    scale,
    doorHeightMm: h,
    frameShape,
    isThumbnail: hideDimensions,
    frameConfig,
    sashConfig,
    availableProfiles,
  });
  // Khung vòm / bo góc vẽ theo 1 độ dày đồng nhất (lấy theo cạnh trên); khung chữ nhật dùng độ dày từng cạnh
  const frameD = metrics.frame.top;
  const mullionT = Math.max(metrics.vertMullion, metrics.horizMullion);

  // Quy đổi thông số vòm sang hệ tọa độ pixel của SVG
  const scaledArchConfig: ArchConfig | undefined = frameConfig?.archConfig
    ? {
        ...frameConfig.archConfig,
        radiusMm: frameConfig.archConfig.radiusMm
          ? frameConfig.archConfig.radiusMm * scale
          : undefined,
      }
    : undefined;

  // Tính toán hình dạng khung vòm/bo góc (nếu có)
  const curvedPaths = getCurvedFramePaths(
    frameShape,
    ox,
    oy,
    fw,
    fh,
    frameD,
    isOpenBottom,
    scaledArchConfig
  );
  const clipId = `door-inner-clip-${id || 'root'}`;

  // Xây dựng sơ đồ khung, đố và ô lá từ cây scene
  const isHydraulic = Boolean(sashConfig?.isHydraulic);
  const { frames, mullions, couplingSeams, leaves, bottomSills, isLeftBottomOpen, isRightBottomOpen, bottomBarSegments } = buildCadLayout(
    rootCell,
    ox,
    oy,
    fw,
    fh,
    frameD,
    mullionT,
    {
      frameEdges: metrics.frame,
      isOpenBottom: isGlobalOpenBottom,
      isHydraulic,
      vertMullionT: metrics.vertMullion,
      horizMullionT: metrics.horizMullion,
      frameConfig,
      sashConfig,
      slidingOverlapPx: metrics.slidingOverlap,
      resolveReversalPx: (profileId) => resolveReversalMm(availableProfiles, frameConfig, profileId) * scale,
    }
  );

  // Thu thập toàn bộ đố cánh (kể cả phân chia đệ quy) và hợp nhất vào danh sách đố tương tác
  const sashMullions = collectLeafSashMullions(leaves, metrics, sashConfig);
  const allMullions = [...mullions, ...sashMullions];

  const isCurvedDouble = Boolean(
    curvedPaths &&
    mullions.length === 0 &&
    (
      (leaves.length === 1 && leaves[0].node.sashType === 'swing_double') ||
      (leaves.length === 2 &&
        LEFT_SWING_SASH_TYPES.includes(leaves[0].node.sashType || '') &&
        RIGHT_SWING_SASH_TYPES.includes(leaves[1].node.sashType || ''))
    )
  );

  const isCurvedSingle = Boolean(
    curvedPaths &&
    mullions.length === 0 &&
    leaves.length === 1 &&
    leaves[0].node.sashType !== 'swing_double'
  );

  // Các đường chia khung bao vòm (Cắt vòm tại đỉnh & Tách rời chân thẳng)
  const archMetrics = curvedPaths ? computeArchMetrics(frameShape, fw, fh, 0, scaledArchConfig) : null;
  const xMidFrame = Math.round(ox + fw / 2);
  const showApexCutLine = Boolean(
    curvedPaths &&
    (frameConfig?.archConfig?.isCutAtApex ||
      frameShape === 'arch_pointed' ||
      frameShape === 'arch_pointed_leg')
  );
  const yApexOuter = showApexCutLine
    ? getArchYAtX(frameShape, ox, oy, fw, fh, 0, xMidFrame, scaledArchConfig)
    : oy;
  const yApexInner = showApexCutLine
    ? getArchYAtX(frameShape, ox, oy, fw, fh, frameD, xMidFrame, scaledArchConfig)
    : oy + frameD;

  const showSeparateLegSeams = Boolean(
    curvedPaths &&
    frameConfig?.archConfig?.legJoinMode === 'separate' &&
    archMetrics &&
    archMetrics.legH > 4
  );
  const ySpringLine = archMetrics ? Math.round(oy + fh - archMetrics.legH) : oy + fh;

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
          {/* Đường cắt chia đôi đỉnh khung bao vòm khi tích "Cắt vòm tại đỉnh" hoặc Vòm nhọn 2 cung */}
          {showApexCutLine && (
            <line
              x1={xMidFrame}
              y1={yApexOuter}
              x2={xMidFrame}
              y2={yApexInner}
              stroke="#18181b"
              strokeWidth="0.95"
            />
          )}
          {/* Đường ghép nối chân thẳng khi chọn Phương án A (Tách rời chân thẳng) */}
          {showSeparateLegSeams && (
            <g stroke="#18181b" strokeWidth="0.85">
              <line x1={ox} y1={ySpringLine} x2={ox + frameD} y2={ySpringLine} />
              <line x1={ox + fw - frameD} y1={ySpringLine} x2={ox + fw} y2={ySpringLine} />
            </g>
          )}
          {/* Đường cắt mòi 45° tại 2 góc đáy của khung bao vòm (khi không hở chân) */}
          {!isOpenBottom && (
            <g stroke="#18181b" strokeWidth="0.75">
              <line x1={ox} y1={oy + fh} x2={ox + frameD} y2={oy + fh - frameD} />
              <line x1={ox + fw} y1={oy + fh} x2={ox + fw - frameD} y2={oy + fh - frameD} />
            </g>
          )}
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
              frameEdges={metrics.frame}
              frameShape={frameShape}
              framesCount={frames.length}
              frameConfig={frameConfig}
              isHydraulic={isHydraulic}
              isOpenBottomOverride={bottomOpenPlan.mode === 'global' ? undefined : isOpenBottom}
              partialBottom={
                isPartialBottomOpen && bottomBarSegments
                  ? {
                      isLeftBottomOpen: Boolean(isLeftBottomOpen),
                      isRightBottomOpen: Boolean(isRightBottomOpen),
                      bottomBarSegments,
                    }
                  : undefined
              }
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
            sashD={metrics.sash.left}
            beadW={metrics.bead}
            mullionT={mullionT}
            aluminumColor={aluminumColor}
            hardwareColor={hardwareColor}
            isOpenBottom={isOpenBottom}
            selectedCellId={selectedCellId}
            onSelectCell={onSelectCell}
            onEditDimension={onEditDimension}
            leftNode={leaves[0].node}
            rightNode={leaves[1]?.node}
            sashConfig={sashConfig}
            scaledArchConfig={scaledArchConfig}
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
            sashD={metrics.sash.left}
            beadW={metrics.bead}
            mullionT={mullionT}
            aluminumColor={aluminumColor}
            hardwareColor={hardwareColor}
            isOpenBottom={isOpenBottom}
            selectedCellId={selectedCellId}
            onSelectCell={onSelectCell}
            onEditDimension={onEditDimension}
            node={leaves[0].node}
            frameConfig={frameConfig}
            sashConfig={sashConfig}
            scaledArchConfig={scaledArchConfig}
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
              metrics={metrics}
              h={h}
              oy={oy}
              fh={fh}
              aluminumColor={aluminumColor}
              hardwareColor={hardwareColor}
              isOpenBottom={isOpenBottom}
              sashConfig={sashConfig}
              onSelectCell={onSelectCell}
            />
          ))
        )}

        {/* 3. Split Resizer Layer: Đố T, Vách ghép Tách khung và Tay nắm khóa (Nằm trên cùng để nhận chuột 100%) */}
        <CadSplitResizer
          mullions={allMullions}
          couplingSeams={couplingSeams}
          leaves={leaves}
          metrics={metrics}
          h={h}
          oy={oy}
          fh={fh}
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
          metrics={metrics}
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
