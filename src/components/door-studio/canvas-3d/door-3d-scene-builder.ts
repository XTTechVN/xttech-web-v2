import {
  ArchConfig,
  FrameConfig,
  FrameShape,
  PaneType,
  SashConfig,
  SashCornerJoint,
  SceneCellNode,
} from '../studio-types';
import { ProfileBar } from '@/types/profile';
import { CAD_CONFIG } from '../cad-engine/cad-config';
import {
  computeArchMetrics,
  getArchYAtX,
  isArchOpenBottomShape,
} from '../cad-engine/cad-geometry';
import { buildCadLayout, collectSashMullions } from '../cad-engine/cad-tree-traverser';
import { resolveBottomOpenPlan } from '../cad-engine/cad-cell-config-resolver';
import { resolveReversalMm } from '../cad-engine/cad-metrics';
import { BottomBarSegment } from '../cad-engine/cad-types';
import { addGlassEffectDetails3D, resolveGlassEffectAppearance } from './door-3d-glass-effects';
import { Door3DMeshCollector, hexToRgb01, MaterialId, Vec3 } from './door-3d-math';
import { DEFAULT_DOOR_3D_SETTINGS, Door3DCustomSettings } from './door-3d-types';

export type SlidingCycleDirection = 'right_to_left' | 'left_to_right';

export interface BuildDoor3DParams {
  w: number;
  h: number;
  aluminumColor: string;
  hardwareColor: string;
  frameShape: FrameShape;
  rootCell: SceneCellNode;
  frameConfig?: FrameConfig;
  sashConfig?: SashConfig;
  availableProfiles?: ProfileBar[];
  openRatio: number; // 0.0 (closed) -> 1.0 (fully open)
  slidingDirection?: SlidingCycleDirection;
  showWall: boolean;
  showOpeningRays: boolean;
  customSettings?: Door3DCustomSettings;
}

function ensureCCW(pts: [number, number][]): [number, number][] {
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    area += x1 * y2 - x2 * y1;
  }
  return area < 0 ? [...pts].reverse() : pts;
}

function darkenColor(c: Vec3, factor: number): Vec3 {
  return [
    Math.max(0, Math.min(1, c[0] * factor)),
    Math.max(0, Math.min(1, c[1] * factor)),
    Math.max(0, Math.min(1, c[2] * factor)),
  ];
}

/**
 * Vẽ 4 thanh khung/cánh/nẹp theo kiểu ghép góc (45° cắt mòi, 90° dọc phủ, 90° ngang phủ, 45° trên - 90° dưới, hoặc ghép góc D)
 */
function addFourPerimeterBars3D(
  collector: Door3DMeshCollector,
  to3D: (xMm: number, yMm: number) => [number, number],
  box: { x: number; y: number; w: number; h: number },
  barW: { left: number; top: number; right: number; bottom: number },
  zBack: number,
  zFront: number,
  joint: string,
  color: Vec3,
  matId: MaterialId,
  edgeColor: Vec3,
  options?: {
    isOpenBottom?: boolean;
    /** Hở đáy từng phần: chân thanh đứng trái/phải chạy xuống sàn cắt 90° khi bên đó Hở */
    isOpenBotLeft?: boolean;
    isOpenBotRight?: boolean;
    /** Hở đáy từng phần: các đoạn thanh khung đáy còn lại (dưới ô Kín) */
    bottomBarSegments?: BottomBarSegment[];
    hasInnerRebate?: boolean;
    gapMm?: number;
    mullions?: Array<{
      x: number;
      y: number;
      w: number;
      h: number;
      direction?: 'vertical' | 'horizontal';
      cutStart?: boolean;
      cutEnd?: boolean;
      isSashMullion?: boolean;
      isCoupling?: boolean;
    }>;
  }
) {
  const { x, y, w, h } = box;
  const { left: dL, top: dT, right: dR, bottom: dB } = barW;
  const gap = options?.gapMm ?? 0.6;
  const isOpenBot = Boolean(options?.isOpenBottom);
  const isOpenBotLeft = options?.isOpenBotLeft ?? isOpenBot;
  const isOpenBotRight = options?.isOpenBotRight ?? isOpenBot;
  const frameMullions = (options?.mullions || []).filter(
    (m) => !m.isSashMullion && !m.isCoupling
  );

  let tlMiter = true;
  let trMiter = true;
  let blMiter = true;
  let brMiter = true;
  let vertCoversTop = false;
  let vertCoversBot = false;

  if (joint === '90_vert') {
    tlMiter = false;
    trMiter = false;
    blMiter = false;
    brMiter = false;
    vertCoversTop = true;
    vertCoversBot = true;
  } else if (joint === '90_horiz') {
    tlMiter = false;
    trMiter = false;
    blMiter = false;
    brMiter = false;
    vertCoversTop = false;
    vertCoversBot = false;
  } else if (joint === '45_top_90_bot') {
    tlMiter = true;
    trMiter = true;
    blMiter = false;
    brMiter = false;
    vertCoversBot = true;
  } else if (joint === 'd_left') {
    tlMiter = true;
    blMiter = true;
    trMiter = false;
    brMiter = false;
    vertCoversTop = true;
    vertCoversBot = true;
  } else if (joint === 'd_right') {
    tlMiter = false;
    blMiter = false;
    trMiter = true;
    brMiter = true;
    vertCoversTop = true;
    vertCoversBot = true;
  }

  // 1. Thanh Đứng Trái (Left Bar)
  const lTopOuterY = tlMiter ? y + gap : vertCoversTop ? y : y + dT + gap;
  const lTopInnerY = tlMiter ? y + dT + gap : vertCoversTop ? y : y + dT + gap;
  const lBotOuterY = isOpenBotLeft
    ? y + h
    : blMiter
      ? y + h - gap
      : vertCoversBot
        ? y + h
        : y + h - dB - gap;
  const lBotInnerY = isOpenBotLeft
    ? y + h
    : blMiter
      ? y + h - dB - gap
      : vertCoversBot
        ? y + h
        : y + h - dB - gap;

  const leftCuts = frameMullions
    .filter(
      (m) =>
        (m.direction === 'horizontal' || m.w > m.h) &&
        Boolean(m.cutStart) &&
        Math.abs(m.x - x) < 2
    )
    .sort((a, b) => a.y - b.y);

  if (leftCuts.length === 0) {
    const leftPts2d = ensureCCW([
      to3D(x, lTopOuterY),
      to3D(x + dL, lTopInnerY),
      to3D(x + dL, lBotInnerY),
      to3D(x, lBotOuterY),
    ]);
    collector.addExtrudedConvexPolygon(leftPts2d, zBack, zFront, color, matId, edgeColor);
  } else {
    let curOuterTop = lTopOuterY;
    let curInnerTop = lTopInnerY;
    leftCuts.forEach((mc) => {
      const segBotY = mc.y - gap;
      if (segBotY > Math.max(curOuterTop, curInnerTop) + 2) {
        collector.addExtrudedConvexPolygon(
          ensureCCW([
            to3D(x, curOuterTop),
            to3D(x + dL, curInnerTop),
            to3D(x + dL, segBotY),
            to3D(x, segBotY),
          ]),
          zBack,
          zFront,
          color,
          matId,
          edgeColor
        );
      }
      curOuterTop = mc.y + mc.h + gap;
      curInnerTop = mc.y + mc.h + gap;
    });
    if (Math.min(lBotOuterY, lBotInnerY) > curOuterTop + 2) {
      collector.addExtrudedConvexPolygon(
        ensureCCW([
          to3D(x, curOuterTop),
          to3D(x + dL, curInnerTop),
          to3D(x + dL, lBotInnerY),
          to3D(x, lBotOuterY),
        ]),
        zBack,
        zFront,
        color,
        matId,
        edgeColor
      );
    }
  }

  // 2. Thanh Đứng Phải (Right Bar)
  const rTopOuterY = trMiter ? y + gap : vertCoversTop ? y : y + dT + gap;
  const rTopInnerY = trMiter ? y + dT + gap : vertCoversTop ? y : y + dT + gap;
  const rBotOuterY = isOpenBotRight
    ? y + h
    : brMiter
      ? y + h - gap
      : vertCoversBot
        ? y + h
        : y + h - dB - gap;
  const rBotInnerY = isOpenBotRight
    ? y + h
    : brMiter
      ? y + h - dB - gap
      : vertCoversBot
        ? y + h
        : y + h - dB - gap;

  const rightCuts = frameMullions
    .filter(
      (m) =>
        (m.direction === 'horizontal' || m.w > m.h) &&
        Boolean(m.cutEnd) &&
        Math.abs(m.x + m.w - (x + w)) < 2
    )
    .sort((a, b) => a.y - b.y);

  if (rightCuts.length === 0) {
    const rightPts2d = ensureCCW([
      to3D(x + w - dR, rTopInnerY),
      to3D(x + w, rTopOuterY),
      to3D(x + w, rBotOuterY),
      to3D(x + w - dR, rBotInnerY),
    ]);
    collector.addExtrudedConvexPolygon(rightPts2d, zBack, zFront, color, matId, edgeColor);
  } else {
    let curOuterTop = rTopOuterY;
    let curInnerTop = rTopInnerY;
    rightCuts.forEach((mc) => {
      const segBotY = mc.y - gap;
      if (segBotY > Math.max(curOuterTop, curInnerTop) + 2) {
        collector.addExtrudedConvexPolygon(
          ensureCCW([
            to3D(x + w - dR, curInnerTop),
            to3D(x + w, curOuterTop),
            to3D(x + w, segBotY),
            to3D(x + w - dR, segBotY),
          ]),
          zBack,
          zFront,
          color,
          matId,
          edgeColor
        );
      }
      curOuterTop = mc.y + mc.h + gap;
      curInnerTop = mc.y + mc.h + gap;
    });
    if (Math.min(rBotOuterY, rBotInnerY) > curOuterTop + 2) {
      collector.addExtrudedConvexPolygon(
        ensureCCW([
          to3D(x + w - dR, curInnerTop),
          to3D(x + w, curOuterTop),
          to3D(x + w, rBotOuterY),
          to3D(x + w - dR, rBotInnerY),
        ]),
        zBack,
        zFront,
        color,
        matId,
        edgeColor
      );
    }
  }

  // 3. Thanh Ngang Trên (Top Bar)
  const tLeftOuterX = tlMiter ? x + gap : vertCoversTop ? x + dL + gap : x;
  const tLeftInnerX = tlMiter ? x + dL + gap : vertCoversTop ? x + dL + gap : x;
  const tRightOuterX = trMiter ? x + w - gap : vertCoversTop ? x + w - dR - gap : x + w;
  const tRightInnerX = trMiter ? x + w - dR - gap : vertCoversTop ? x + w - dR - gap : x + w;

  const topCuts = frameMullions
    .filter(
      (m) =>
        (m.direction === 'vertical' || m.h > m.w) &&
        Boolean(m.cutStart) &&
        Math.abs(m.y - y) < 2
    )
    .sort((a, b) => a.x - b.x);

  if (topCuts.length === 0) {
    const topPts2d = ensureCCW([
      to3D(tLeftOuterX, y),
      to3D(tRightOuterX, y),
      to3D(tRightInnerX, y + dT),
      to3D(tLeftInnerX, y + dT),
    ]);
    collector.addExtrudedConvexPolygon(topPts2d, zBack, zFront, color, matId, edgeColor);
  } else {
    let curOuterLeft = tLeftOuterX;
    let curInnerLeft = tLeftInnerX;
    topCuts.forEach((mc) => {
      const segRightX = mc.x - gap;
      if (segRightX > Math.max(curOuterLeft, curInnerLeft) + 2) {
        collector.addExtrudedConvexPolygon(
          ensureCCW([
            to3D(curOuterLeft, y),
            to3D(segRightX, y),
            to3D(segRightX, y + dT),
            to3D(curInnerLeft, y + dT),
          ]),
          zBack,
          zFront,
          color,
          matId,
          edgeColor
        );
      }
      curOuterLeft = mc.x + mc.w + gap;
      curInnerLeft = mc.x + mc.w + gap;
    });
    if (Math.min(tRightOuterX, tRightInnerX) > curOuterLeft + 2) {
      collector.addExtrudedConvexPolygon(
        ensureCCW([
          to3D(curOuterLeft, y),
          to3D(tRightOuterX, y),
          to3D(tRightInnerX, y + dT),
          to3D(curInnerLeft, y + dT),
        ]),
        zBack,
        zFront,
        color,
        matId,
        edgeColor
      );
    }
  }

  // 4. Thanh Ngang Dưới (Bottom Bar)
  if (!isOpenBot && dB > 0 && !options?.bottomBarSegments) {
    const bLeftOuterX = blMiter ? x + gap : vertCoversBot ? x + dL + gap : x;
    const bLeftInnerX = blMiter ? x + dL + gap : vertCoversBot ? x + dL + gap : x;
    const bRightOuterX = brMiter ? x + w - gap : vertCoversBot ? x + w - dR - gap : x + w;
    const bRightInnerX = brMiter ? x + w - dR - gap : vertCoversBot ? x + w - dR - gap : x + w;

    const botCuts = frameMullions
      .filter(
        (m) =>
          (m.direction === 'vertical' || m.h > m.w) &&
          Boolean(m.cutEnd) &&
          Math.abs(m.y + m.h - (y + h)) < 2
      )
      .sort((a, b) => a.x - b.x);

    if (botCuts.length === 0) {
      const botPts2d = ensureCCW([
        to3D(bLeftInnerX, y + h - dB),
        to3D(bRightInnerX, y + h - dB),
        to3D(bRightOuterX, y + h),
        to3D(bLeftOuterX, y + h),
      ]);
      collector.addExtrudedConvexPolygon(botPts2d, zBack, zFront, color, matId, edgeColor);
    } else {
      let curOuterLeft = bLeftOuterX;
      let curInnerLeft = bLeftInnerX;
      botCuts.forEach((mc) => {
        const segRightX = mc.x - gap;
        if (segRightX > Math.max(curOuterLeft, curInnerLeft) + 2) {
          collector.addExtrudedConvexPolygon(
            ensureCCW([
              to3D(curInnerLeft, y + h - dB),
              to3D(segRightX, y + h - dB),
              to3D(segRightX, y + h),
              to3D(curOuterLeft, y + h),
            ]),
            zBack,
            zFront,
            color,
            matId,
            edgeColor
          );
        }
        curOuterLeft = mc.x + mc.w + gap;
        curInnerLeft = mc.x + mc.w + gap;
      });
      if (Math.min(bRightOuterX, bRightInnerX) > curOuterLeft + 2) {
        collector.addExtrudedConvexPolygon(
          ensureCCW([
            to3D(curInnerLeft, y + h - dB),
            to3D(bRightInnerX, y + h - dB),
            to3D(bRightOuterX, y + h),
            to3D(curOuterLeft, y + h),
          ]),
          zBack,
          zFront,
          color,
          matId,
          edgeColor
        );
      }
    }
  }

  // 4b. Hở đáy từng phần: chỉ dựng các đoạn thanh đáy dưới ô Kín; đầu đâm vào đố đứng cắt 90°, đầu chạm khung đứng theo góc ghép
  if (options?.bottomBarSegments && dB > 0) {
    const frameStartOuterX = blMiter ? x + gap : vertCoversBot ? x + dL + gap : x;
    const frameStartInnerX = blMiter ? x + dL + gap : vertCoversBot ? x + dL + gap : x;
    const frameEndOuterX = brMiter ? x + w - gap : vertCoversBot ? x + w - dR - gap : x + w;
    const frameEndInnerX = brMiter ? x + w - dR - gap : vertCoversBot ? x + w - dR - gap : x + w;
    options.bottomBarSegments.forEach((segment) => {
      const startOuterX = segment.isFrameStart ? frameStartOuterX : segment.x0 + gap;
      const startInnerX = segment.isFrameStart ? frameStartInnerX : segment.x0 + gap;
      const endOuterX = segment.isFrameEnd ? frameEndOuterX : segment.x1 - gap;
      const endInnerX = segment.isFrameEnd ? frameEndInnerX : segment.x1 - gap;
      if (Math.min(endOuterX, endInnerX) <= Math.max(startOuterX, startInnerX) + 2) return;
      collector.addExtrudedConvexPolygon(
        ensureCCW([
          to3D(startInnerX, y + h - dB),
          to3D(endInnerX, y + h - dB),
          to3D(endOuterX, y + h),
          to3D(startOuterX, y + h),
        ]),
        zBack,
        zFront,
        color,
        matId,
        edgeColor
      );
    });
  }
  // Gờ hèm bậc trong (Rebate step) tạo chiều sâu cơ khí như thanh nhôm thật
  if (options?.hasInnerRebate) {
    const rebateW = Math.max(8, Math.round(Math.min(dL, dT) * 0.28));
    const zMid1 = zBack + (zFront - zBack) * 0.28;
    const zMid2 = zFront - (zFront - zBack) * 0.28;
    const rebateColor = darkenColor(color, 0.92);

    collector.addExtrudedConvexPolygon(
      ensureCCW([
        to3D(x + dL, y + dT),
        to3D(x + dL + rebateW, y + dT + rebateW),
        to3D(x + dL + rebateW, y + h - (isOpenBotLeft ? 0 : dB + rebateW)),
        to3D(x + dL, y + h - (isOpenBotLeft ? 0 : dB)),
      ]),
      zMid1,
      zMid2,
      rebateColor,
      matId,
      edgeColor,
      0.4
    );
    collector.addExtrudedConvexPolygon(
      ensureCCW([
        to3D(x + w - dR - rebateW, y + dT + rebateW),
        to3D(x + w - dR, y + dT),
        to3D(x + w - dR, y + h - (isOpenBotRight ? 0 : dB)),
        to3D(x + w - dR - rebateW, y + h - (isOpenBotRight ? 0 : dB + rebateW)),
      ]),
      zMid1,
      zMid2,
      rebateColor,
      matId,
      edgeColor,
      0.4
    );
    collector.addExtrudedConvexPolygon(
      ensureCCW([
        to3D(x + dL, y + dT),
        to3D(x + w - dR, y + dT),
        to3D(x + w - dR - rebateW, y + dT + rebateW),
        to3D(x + dL + rebateW, y + dT + rebateW),
      ]),
      zMid1,
      zMid2,
      rebateColor,
      matId,
      edgeColor,
      0.4
    );
    if (!isOpenBot && dB > 0) {
      collector.addExtrudedConvexPolygon(
        ensureCCW([
          to3D(x + dL + rebateW, y + h - dB - rebateW),
          to3D(x + w - dR - rebateW, y + h - dB - rebateW),
          to3D(x + w - dR, y + h - dB),
          to3D(x + dL, y + h - dB),
        ]),
        zMid1,
        zMid2,
        rebateColor,
        matId,
        edgeColor,
        0.4
      );
    }
  }
}

/**
 * Dựng khung bao vòm cong 3D theo đúng phương trình hình học vòm của CAD 2D
 */
function addArchedFrame3D(
  collector: Door3DMeshCollector,
  to3D: (xMm: number, yMm: number) => [number, number],
  shape: FrameShape,
  box: { x: number; y: number; w: number; h: number },
  frameD: number,
  zBack: number,
  zFront: number,
  isOpenBottom: boolean,
  archConfig: ArchConfig | undefined,
  color: Vec3,
  matId: MaterialId,
  edgeColor: Vec3
) {
  const { x, y, w, h } = box;
  const metrics = computeArchMetrics(shape, w, h, frameD, archConfig);
  const ySpringAbs = y + metrics.ySpring;
  const segments = 32;

  for (let i = 0; i < segments; i++) {
    const t0 = i / segments;
    const t1 = (i + 1) / segments;
    const xOuter0 = x + t0 * w;
    const xOuter1 = x + t1 * w;
    const xInner0 = x + frameD + t0 * Math.max(10, w - 2 * frameD);
    const xInner1 = x + frameD + t1 * Math.max(10, w - 2 * frameD);

    const yOuter0 = getArchYAtX(shape, x, y, w, h, 0, xOuter0, archConfig);
    const yOuter1 = getArchYAtX(shape, x, y, w, h, 0, xOuter1, archConfig);
    const yInner0 = getArchYAtX(shape, x, y, w, h, frameD, xInner0, archConfig);
    const yInner1 = getArchYAtX(shape, x, y, w, h, frameD, xInner1, archConfig);

    const isApexCut = Boolean(archConfig?.isCutAtApex || metrics.isPointed);
    const shrink0 = isApexCut && i === segments / 2 ? 0.8 : 0;
    const shrink1 = isApexCut && i === segments / 2 - 1 ? -0.8 : 0;

    const poly = ensureCCW([
      to3D(xOuter0 + shrink0, yOuter0),
      to3D(xOuter1 + shrink1, yOuter1),
      to3D(xInner1 + shrink1, yInner1),
      to3D(xInner0 + shrink0, yInner0),
    ]);
    collector.addExtrudedConvexPolygon(poly, zBack, zFront, color, matId, edgeColor, 0.35);
  }

  if (metrics.legH > 2) {
    const botY = isOpenBottom ? y + h : y + h - frameD;
    collector.addExtrudedConvexPolygon(
      ensureCCW([
        to3D(x, ySpringAbs),
        to3D(x + frameD, ySpringAbs),
        to3D(x + frameD, botY),
        to3D(x, y + h),
      ]),
      zBack,
      zFront,
      color,
      matId,
      edgeColor
    );
    collector.addExtrudedConvexPolygon(
      ensureCCW([
        to3D(x + w - frameD, ySpringAbs),
        to3D(x + w, ySpringAbs),
        to3D(x + w, y + h),
        to3D(x + w - frameD, botY),
      ]),
      zBack,
      zFront,
      color,
      matId,
      edgeColor
    );
  }

  if (!isOpenBottom) {
    collector.addExtrudedConvexPolygon(
      ensureCCW([
        to3D(x + frameD, y + h - frameD),
        to3D(x + w - frameD, y + h - frameD),
        to3D(x + w, y + h),
        to3D(x, y + h),
      ]),
      zBack,
      zFront,
      color,
      matId,
      edgeColor
    );
  }
}

/**
 * Dựng Tay nắm 3D (Lever Handle cho cửa mở quay hoặc D-Handle / Khóa sập cho cửa lùa)
 */
function addHandle3D(
  collector: Door3DMeshCollector,
  handleXMm: number,
  handleYMm: number,
  zSurfaceFront: number,
  zSurfaceBack: number,
  isLeftSideOfSash: boolean,
  isSliding: boolean,
  to3D: (xMm: number, yMm: number) => [number, number],
  hwColor: Vec3,
  handleOpts?: {
    depthMm?: number;
    offsetXMm?: number;
    offsetYMm?: number;
    bothSides?: boolean;
  }
) {
  const offX = handleOpts?.offsetXMm ?? 0;
  const offY = handleOpts?.offsetYMm ?? 0;
  const [hx, hy] = to3D(handleXMm + offX, handleYMm - offY);
  const edgeCol = darkenColor(hwColor, 0.55);
  const dir = isLeftSideOfSash ? 1 : -1;
  const depthScale = Math.max(0.35, (handleOpts?.depthMm ?? 47) / 47);
  const sides = handleOpts?.bothSides === false ? [1] : [1, -1];

  if (isSliding) {
    for (const signZ of sides) {
      const zBase = signZ > 0 ? zSurfaceFront : zSurfaceBack;
      collector.addBox(hx, hy, zBase + signZ * 0.003 * depthScale, 0.024, 0.18, 0.006, hwColor, 4, edgeCol);
      collector.addBox(hx, hy + 0.065, zBase + signZ * 0.016 * depthScale, 0.016, 0.016, 0.024 * depthScale, hwColor, 4, edgeCol);
      collector.addBox(hx, hy - 0.065, zBase + signZ * 0.016 * depthScale, 0.016, 0.016, 0.024 * depthScale, hwColor, 4, edgeCol);
      collector.addBox(hx, hy, zBase + signZ * 0.03 * depthScale, 0.018, 0.15, 0.012, hwColor, 4, edgeCol);
    }
    return;
  }

  for (const signZ of sides) {
    const zBase = signZ > 0 ? zSurfaceFront : zSurfaceBack;
    collector.addBox(hx, hy, zBase + signZ * 0.004 * depthScale, 0.028, 0.165, 0.008, hwColor, 4, edgeCol);
    collector.addBox(hx, hy + 0.015, zBase + signZ * 0.02 * depthScale, 0.018, 0.02, 0.028 * depthScale, hwColor, 4, edgeCol);
    collector.addBox(
      hx + dir * 0.052,
      hy + 0.015,
      zBase + signZ * 0.036 * depthScale,
      0.125,
      0.018,
      0.012,
      hwColor,
      4,
      edgeCol
    );
    collector.addBox(
      hx,
      hy - 0.038,
      zBase + signZ * 0.009 * depthScale,
      0.012,
      0.024,
      0.004,
      darkenColor(hwColor, 0.4),
      4
    );
  }
}

/**
 * Dựng Bản lề cối 3D trên cạnh bản lề của cánh mở quay (tự động đặt theo mặt mở ra hoặc mở vào)
 */
function addHinges3D(
  collector: Door3DMeshCollector,
  hingeXMm: number,
  sashYMm: number,
  sashHMm: number,
  zHingeFace: number,
  dirZ: number,
  to3D: (xMm: number, yMm: number) => [number, number],
  hwColor: Vec3
) {
  const edgeCol = darkenColor(hwColor, 0.5);
  const offsets = sashHMm >= 1600 ? [0.14, 0.5, 0.86] : [0.2, 0.8];
  for (const ratio of offsets) {
    const [bx, by] = to3D(hingeXMm, sashYMm + sashHMm * ratio);
    collector.addBox(bx, by, zHingeFace + dirZ * 0.006, 0.015, 0.092, 0.015, hwColor, 4, edgeCol);
  }
}

/**
 * Dựng Vật liệu tấm trong lòng cánh hoặc ô Fix: Kính trong suốt / Nan trang trí / Pano nhôm / Lá sách / Lưới muỗi
 */
function addInfillPane3D(
  collector: Door3DMeshCollector,
  to3D: (xMm: number, yMm: number) => [number, number],
  paneBox: { x: number; y: number; w: number; h: number },
  zCenter: number,
  paneType: PaneType,
  aluColor: Vec3,
  matId: MaterialId,
  cellNode: SceneCellNode,
  glassOpts?: {
    thicknessMm?: number;
    colorHex?: string;
    transparency?: number;
  }
) {
  const [x1, yTop] = to3D(paneBox.x, paneBox.y);
  const [x2, yBot] = to3D(paneBox.x + paneBox.w, paneBox.y + paneBox.h);
  const cx = (x1 + x2) / 2;
  const cy = (yTop + yBot) / 2;
  const pw = Math.max(0.01, Math.abs(x2 - x1));
  const ph = Math.max(0.01, Math.abs(yTop - yBot));
  const glassThickM = Math.max(0.004, (glassOpts?.thicknessMm ?? 8) * 0.001);

  const gasketCol: Vec3 = [0.12, 0.14, 0.16];
  const gT = 0.0035;
  collector.addBox(cx, yTop - gT / 2, zCenter, pw, gT, glassThickM + 0.006, gasketCol, 2);
  collector.addBox(cx, yBot + gT / 2, zCenter, pw, gT, glassThickM + 0.006, gasketCol, 2);
  collector.addBox(x1 + gT / 2, cy, zCenter, gT, ph, glassThickM + 0.006, gasketCol, 2);
  collector.addBox(x2 - gT / 2, cy, zCenter, gT, ph, glassThickM + 0.006, gasketCol, 2);

  if (paneType === 'panel') {
    const edgeCol = darkenColor(aluColor, 0.65);
    collector.addBox(cx, cy, zCenter, pw - gT * 2, ph - gT * 2, 0.014, aluColor, matId, edgeCol);
    const slats = Math.max(2, Math.min(18, Math.floor(paneBox.h / 110)));
    for (let i = 1; i < slats; i++) {
      const sy = yBot + (ph * i) / slats;
      collector.addLine([x1 + gT, sy, zCenter + 0.0075], [x2 - gT, sy, zCenter + 0.0075], edgeCol, 0.75);
      collector.addLine([x1 + gT, sy, zCenter - 0.0075], [x2 - gT, sy, zCenter - 0.0075], edgeCol, 0.75);
    }
    return;
  }

  if (paneType === 'louver') {
    const edgeCol = darkenColor(aluColor, 0.65);
    const bladeCount = Math.max(3, Math.min(28, Math.floor(paneBox.h / 65)));
    const stepY = (ph - gT * 2) / bladeCount;
    for (let i = 0; i < bladeCount; i++) {
      const by = yBot + gT + stepY * (i + 0.5);
      const snap = collector.getSnapshotIndices();
      collector.addBox(cx, by, zCenter, pw - gT * 2, stepY * 0.92, 0.004, aluColor, matId, edgeCol, 0.4);
      collector.transformSince(snap, {
        pivotX: cx,
        pivotY: by,
        pivotZ: zCenter,
        rotX: 0.55,
      });
    }
    return;
  }

  if (paneType === 'screen') {
    const meshColor: Vec3 = [0.22, 0.26, 0.3];
    const zF = zCenter + 0.002;
    const zB = zCenter - 0.002;
    collector.addTransQuad([x1, yBot, zF], [x2, yBot, zF], [x2, yTop, zF], [x1, yTop, zF], meshColor, 0.48);
    collector.addTransQuad([x2, yBot, zB], [x1, yBot, zB], [x1, yTop, zB], [x2, yTop, zB], meshColor, 0.48);
    return;
  }

  // Hiệu ứng kính riêng của ô (clear = giữ nguyên màu/độ trong theo cài đặt chung)
  const effectAppearance = resolveGlassEffectAppearance(cellNode.glassVisualEffect, cellNode.glassVisualColor);
  const glassColor: Vec3 = effectAppearance?.color ?? hexToRgb01(glassOpts?.colorHex || '#88ccff', [0.53, 0.8, 1.0]);
  const baseAlpha =
    effectAppearance?.alpha ?? Math.max(0.08, Math.min(0.85, 0.55 - (glassOpts?.transparency ?? 0.34) * 0.55));
  const halfGlass = glassThickM / 2;
  const zF = zCenter + halfGlass;
  const zB = zCenter - halfGlass;

  collector.addTransQuad([x1, yBot, zF], [x2, yBot, zF], [x2, yTop, zF], [x1, yTop, zF], glassColor, baseAlpha);
  collector.addTransQuad([x2, yBot, zB], [x1, yBot, zB], [x1, yTop, zB], [x2, yTop, zB], glassColor, baseAlpha);
  addGlassEffectDetails3D(
    collector,
    { x1, x2, yTop, yBot, zF, zB },
    cellNode.glassVisualEffect,
    cellNode.glassSplitCount,
    cellNode.id
  );

  const diagLen = Math.min(pw, ph) * 0.28;
  collector.addLine(
    [cx - diagLen * 0.6, cy - diagLen * 0.4, zF + 0.0005],
    [cx + diagLen * 0.4, cy + diagLen * 0.6, zF + 0.0005],
    [0.92, 0.98, 1.0],
    0.45
  );
  collector.addLine(
    [cx - diagLen * 0.3, cy - diagLen * 0.55, zF + 0.0005],
    [cx + diagLen * 0.55, cy + diagLen * 0.3, zF + 0.0005],
    [0.92, 0.98, 1.0],
    0.32
  );

  const grille = cellNode.grilleConfig;
  if (grille?.enabled && grille.hasGrid) {
    const grilleCol = hexToRgb01(grille.barColor || '#D4AF37', [0.83, 0.68, 0.21]);
    const barW = Math.max(0.008, (grille.barWidth || 18) * 0.001);
    const cols = Math.max(1, grille.cols || 2);
    const rows = Math.max(1, grille.rows || 2);

    for (let c = 1; c < cols; c++) {
      const gx = x1 + (pw * c) / cols;
      collector.addBox(gx, cy, zCenter, barW, ph - gT * 2, 0.006, grilleCol, 4);
    }
    for (let r = 1; r < rows; r++) {
      const gy = yBot + (ph * r) / rows;
      collector.addBox(cx, gy, zCenter, pw - gT * 2, barW, 0.006, grilleCol, 4);
    }
  }
}

/**
 * Vẽ đường chỉ hướng mở 3D (Opening Rays) trên mặt cánh để trực quan hóa bản lề & chiều mở
 */
function addOpeningRays3D(
  collector: Door3DMeshCollector,
  to3D: (xMm: number, yMm: number) => [number, number],
  sashBox: { x: number; y: number; w: number; h: number },
  zFront: number,
  openMode:
    | 'swing_left'
    | 'swing_right'
    | 'awning'
    | 'tilt'
    | 'sliding_left'
    | 'sliding_right'
    | 'sliding_both'
) {
  const pad = 45;
  const [xL, yT] = to3D(sashBox.x + pad, sashBox.y + pad);
  const [xR, yB] = to3D(sashBox.x + sashBox.w - pad, sashBox.y + sashBox.h - pad);
  const xM = (xL + xR) / 2;
  const yM = (yT + yB) / 2;
  const z = zFront + 0.003;
  const rayCol: Vec3 = [0.82, 0.22, 0.16];

  if (openMode === 'swing_left') {
    collector.addLine([xL, yT, z], [xR, yM, z], rayCol, 0.75);
    collector.addLine([xR, yM, z], [xL, yB, z], rayCol, 0.75);
  } else if (openMode === 'swing_right') {
    collector.addLine([xR, yT, z], [xL, yM, z], rayCol, 0.75);
    collector.addLine([xL, yM, z], [xR, yB, z], rayCol, 0.75);
  } else if (openMode === 'awning') {
    collector.addLine([xL, yT, z], [xM, yB, z], rayCol, 0.75);
    collector.addLine([xR, yT, z], [xM, yB, z], rayCol, 0.75);
  } else if (openMode === 'tilt') {
    collector.addLine([xL, yB, z], [xM, yT, z], rayCol, 0.75);
    collector.addLine([xR, yB, z], [xM, yT, z], rayCol, 0.75);
  } else if (openMode === 'sliding_left' || openMode === 'sliding_right') {
    const dir = openMode === 'sliding_left' ? -1 : 1;
    const len = Math.min(0.22, Math.abs(xR - xL) * 0.35);
    const xStart = xM - dir * (len / 2);
    const xEnd = xM + dir * (len / 2);
    collector.addLine([xStart, yM, z], [xEnd, yM, z], rayCol, 0.85);
    collector.addLine([xEnd, yM, z], [xEnd - dir * 0.04, yM + 0.03, z], rayCol, 0.85);
    collector.addLine([xEnd, yM, z], [xEnd - dir * 0.04, yM - 0.03, z], rayCol, 0.85);
  } else if (openMode === 'sliding_both') {
    // Mũi tên 2 chiều (<--->) thể hiện cánh lùa giữa trượt được cả sang trái lẫn sang phải
    const len = Math.min(0.25, Math.abs(xR - xL) * 0.42);
    const xLeft = xM - len / 2;
    const xRight = xM + len / 2;
    collector.addLine([xLeft, yM, z], [xRight, yM, z], rayCol, 0.85);
    // Đầu mũi tên trái
    collector.addLine([xLeft, yM, z], [xLeft + 0.038, yM + 0.028, z], rayCol, 0.85);
    collector.addLine([xLeft, yM, z], [xLeft + 0.038, yM - 0.028, z], rayCol, 0.85);
    // Đầu mũi tên phải
    collector.addLine([xRight, yM, z], [xRight - 0.038, yM + 0.028, z], rayCol, 0.85);
    collector.addLine([xRight, yM, z], [xRight - 0.038, yM - 0.028, z], rayCol, 0.85);
  }
}

function isLeafSliding(node: SceneCellNode): boolean {
  const st = String(node.sashType || '');
  return (
    st === 'sliding' ||
    st.includes('lua') ||
    st === '2-chieu' ||
    st === 'canh-truot' ||
    node.sashZIndex !== undefined
  );
}

export function buildDoor3DGeometry(params: BuildDoor3DParams): Door3DMeshCollector {
  const {
    w,
    h,
    aluminumColor,
    hardwareColor,
    frameShape,
    rootCell,
    frameConfig,
    sashConfig,
    availableProfiles,
    openRatio,
    slidingDirection = 'right_to_left',
    showWall,
    showOpeningRays,
    customSettings,
  } = params;

  const collector = new Door3DMeshCollector();
  const safeW = Math.max(200, w || 1200);
  const safeH = Math.max(200, h || 1500);

  const to3D = (xMm: number, yMm: number): [number, number] => [
    (xMm - safeW / 2) * 0.001,
    (safeH / 2 - yMm) * 0.001,
  ];

  const aluRgb = hexToRgb01(aluminumColor, [0.28, 0.33, 0.41]);
  const hwRgb = hexToRgb01(hardwareColor, [0.15, 0.18, 0.22]);
  const isWoodGrain =
    aluminumColor?.toLowerCase() === '#955f20' ||
    aluminumColor?.toLowerCase() === '#78350f';
  const aluMatId: MaterialId = isWoodGrain ? 1 : 0;
  const aluEdgeRgb = darkenColor(aluRgb, 0.58);
  const beadRgb = darkenColor(aluRgb, 1.04);

  // 1. Tính toán độ rộng bản nhôm (mm)
  const selectedFrameProfile = availableProfiles?.find(
    (p) =>
      p.id === frameConfig?.leftEdge?.profileId ||
      p.id === frameConfig?.topEdge?.profileId ||
      p.id === frameConfig?.rightEdge?.profileId ||
      p.id === frameConfig?.bottomEdge?.profileId
  );
  const rawFrameMm =
    selectedFrameProfile?.sectionHeightMm && selectedFrameProfile.sectionHeightMm > 0
      ? selectedFrameProfile.sectionHeightMm
      : CAD_CONFIG.FRAME.DEFAULT_MM;
  const frameMm = frameShape !== 'rect' ? Math.min(rawFrameMm, 56) : rawFrameMm;

  const isSlim = sashConfig?.sashStyle === 'slim';
  const isDoorUnit = safeH >= 1800;
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
  const rawSashMm =
    selectedSashProfile?.sectionHeightMm && selectedSashProfile.sectionHeightMm > 0
      ? selectedSashProfile.sectionHeightMm
      : defaultSashMm;
  const sashMm = frameShape !== 'rect' ? Math.min(rawSashMm, 68) : rawSashMm;

  const selectedBeadProfile = availableProfiles?.find(
    (p) => p.id === sashConfig?.beadProfileId || p.id === frameConfig?.beadProfileId
  );
  const beadMm =
    selectedBeadProfile?.sectionHeightMm && selectedBeadProfile.sectionHeightMm > 0
      ? selectedBeadProfile.sectionHeightMm
      : isSlim
        ? CAD_CONFIG.BEAD.SLIM_DEFAULT_MM
        : CAD_CONFIG.BEAD.DEFAULT_MM;

  const isMullionSeparate = frameConfig?.mullionMode === 'separate';
  const vertMullionProfile = availableProfiles?.find(
    (p) =>
      p.id ===
      (isMullionSeparate
        ? frameConfig?.mullionVertProfileId || frameConfig?.mullionProfileId
        : frameConfig?.mullionProfileId)
  );
  const horizMullionProfile = availableProfiles?.find(
    (p) =>
      p.id ===
      (isMullionSeparate
        ? frameConfig?.mullionHorizProfileId || frameConfig?.mullionProfileId
        : frameConfig?.mullionProfileId)
  );
  const mullionMm =
    vertMullionProfile?.sectionHeightMm && vertMullionProfile.sectionHeightMm > 0
      ? vertMullionProfile.sectionHeightMm
      : CAD_CONFIG.MULLION.DEFAULT_MM;
  const horizMullionMm =
    horizMullionProfile?.sectionHeightMm && horizMullionProfile.sectionHeightMm > 0
      ? horizMullionProfile.sectionHeightMm
      : mullionMm;

  const isGlobalOpenBottom = Boolean(
    (frameConfig?.isOpenBottom ?? false) ||
      sashConfig?.isHydraulic ||
      rootCell.isHydraulic ||
      isArchOpenBottomShape(frameShape)
  );
  // Ghi đè Hở/Kín đáy theo từng ô (không có ghi đè => giữ nguyên giá trị toàn cục)
  const bottomOpenPlan = resolveBottomOpenPlan(rootCell, isGlobalOpenBottom);
  const isOpenBottom = bottomOpenPlan.isOpenBottom;

  const slidingOverlapMm =
    sashConfig?.slidingOverlapMm && sashConfig.slidingOverlapMm > 0
      ? sashConfig.slidingOverlapMm
      : sashMm;

  // 2. Chạy thuật toán giải tích bố cục CAD 2D ngay trên miền đơn vị thực (mm)
  const layout = buildCadLayout(rootCell, 0, 0, safeW, safeH, frameMm, mullionMm, {
    isOpenBottom: isGlobalOpenBottom,
    isHydraulic: Boolean(sashConfig?.isHydraulic || rootCell.isHydraulic),
    vertMullionT: mullionMm,
    horizMullionT: horizMullionMm,
    frameConfig,
    sashConfig,
    slidingOverlapPx: slidingOverlapMm,
  });

  const cfg: Door3DCustomSettings = customSettings ?? DEFAULT_DOOR_3D_SETTINGS;
  const effectiveHwRgb =
    cfg.handleColorMode && cfg.handleColorMode !== 'design'
      ? hexToRgb01(cfg.handleColorMode, hwRgb)
      : hwRgb;

  const slidingLeavesList = layout.leaves.filter((l) => isLeafSliding(l.node));
  const totalSlidingLeaves = slidingLeavesList.length;
  const hasSlidingLeaves =
    Boolean(sashConfig?.family?.toLowerCase().includes('lùa')) || totalSlidingLeaves > 0;

  // Xác định số lượng ray trượt thực tế (2 ray, 3 ray, 4 ray...) và tọa độ Z của từng ray
  const maxZIdx = slidingLeavesList.reduce(
    (acc, l, idx) =>
      Math.max(
        acc,
        l.node.sashZIndex !== undefined
          ? l.node.sashZIndex
          : totalSlidingLeaves === 4
            ? idx === 1 || idx === 2
              ? 1
              : 0
            : idx % 2
      ),
    1
  );
  const numTracks = hasSlidingLeaves ? Math.max(2, maxZIdx + 1) : 1;
  const userSashDepthM = Math.max(0.024, (cfg.sashDepthMm || 49) * 0.001);
  const sashDepthM = hasSlidingLeaves ? Math.min(userSashDepthM, 0.042) : userSashDepthM;
  const trackSpacingM = Math.max(0.038, sashDepthM + 0.01);
  const getTrackZ = (trackIdx: number): number => {
    const clampedIdx = Math.max(0, Math.min(numTracks - 1, trackIdx));
    return (clampedIdx - (numTracks - 1) / 2) * trackSpacingM;
  };

  const baseFrameDepthM = Math.max(0.04, (cfg.frameDepthMm || 105) * 0.001);
  const frameDepthM =
    cfg.multiplyByZLayers && numTracks > 1
      ? Math.max(baseFrameDepthM, numTracks * trackSpacingM + 0.036)
      : Math.max(baseFrameDepthM, sashDepthM + 0.012);
  const frameZBack = -frameDepthM / 2;
  const frameZFront = frameDepthM / 2;

  // 3. Vẽ Mặt sàn Studio (Gỗ / Gạch 60x60 - 80x80 - 60x120) hoặc Lưới Kỹ thuật CAD
  const floorY = -(safeH / 2) * 0.001 - 0.004;
  const gridHalfExtent = Math.max(2.6, Math.max(safeW, safeH) * 0.001 * 1.45);

  if (cfg.displayMode === 'studio') {
    const fExt = 5.4;
    collector.addQuad(
      [-fExt, floorY, fExt],
      [fExt, floorY, fExt],
      [fExt, floorY, -fExt],
      [-fExt, floorY, -fExt],
      [0.85, 0.75, 0.62],
      5,
      [0, 1, 0]
    );
  } else {
    const gridStep = 0.25;
    const gridCount = Math.round(gridHalfExtent / gridStep);
    for (let i = -gridCount; i <= gridCount; i++) {
      const pos = i * gridStep;
      const isAxis = i === 0;
      const col: Vec3 = isAxis ? [0.45, 0.55, 0.65] : [0.76, 0.8, 0.85];
      const alpha = isAxis ? 0.55 : 0.32;
      collector.addLine([-gridHalfExtent, floorY, pos], [gridHalfExtent, floorY, pos], col, alpha);
      collector.addLine([pos, floorY, -gridHalfExtent], [pos, floorY, gridHalfExtent], col, alpha);
    }
  }

  const doorHalfWM = (safeW / 2) * 0.001;
  collector.addTransQuad(
    [-doorHalfWM - 0.08, floorY + 0.001, frameZFront + 0.09],
    [doorHalfWM + 0.08, floorY + 0.001, frameZFront + 0.09],
    [doorHalfWM + 0.08, floorY + 0.001, frameZBack - 0.09],
    [-doorHalfWM - 0.08, floorY + 0.001, frameZBack - 0.09],
    [0.08, 0.1, 0.14],
    0.16
  );

  if (showWall && frameShape === 'rect') {
    const wallCol: Vec3 = [0.93, 0.94, 0.96];
    const wallEdge: Vec3 = [0.78, 0.81, 0.85];
    const wallDepth = Math.max(0.18, frameDepthM + 0.08);
    const wallMargin = 0.38;
    const doorWM = safeW * 0.001;
    const doorHM = safeH * 0.001;
    collector.addBox(
      -doorWM / 2 - wallMargin / 2 - 0.002,
      0.08,
      0,
      wallMargin,
      doorHM + 0.18,
      wallDepth,
      wallCol,
      3,
      wallEdge,
      0.35
    );
    collector.addBox(
      doorWM / 2 + wallMargin / 2 + 0.002,
      0.08,
      0,
      wallMargin,
      doorHM + 0.18,
      wallDepth,
      wallCol,
      3,
      wallEdge,
      0.35
    );
    collector.addBox(
      0,
      doorHM / 2 + 0.09 + 0.002,
      0,
      doorWM + wallMargin * 2 + 0.004,
      0.18,
      wallDepth,
      wallCol,
      3,
      wallEdge,
      0.35
    );
  }

  // 4. Dựng Khung bao ngoài (Outer Frame Boxes)
  const frameJoint = frameConfig?.cornerJoint ?? '45';
  const isBot90 = frameJoint === '45_top_90_bot';
  const botFrameMm = isOpenBottom ? 0 : isBot90 ? Math.max(24, Math.round(frameMm * 0.65)) : frameMm;

  for (const fBox of layout.frames) {
    if (frameShape !== 'rect') {
      addArchedFrame3D(
        collector,
        to3D,
        frameShape,
        fBox,
        frameMm,
        frameZBack,
        frameZFront,
        isOpenBottom,
        frameConfig?.archConfig,
        aluRgb,
        aluMatId,
        aluEdgeRgb
      );
    } else {
      addFourPerimeterBars3D(
        collector,
        to3D,
        fBox,
        { left: frameMm, top: frameMm, right: frameMm, bottom: botFrameMm },
        frameZBack,
        frameZFront,
        frameJoint,
        aluRgb,
        aluMatId,
        aluEdgeRgb,
        {
          isOpenBottom,
          isOpenBotLeft: layout.isPartialBottomOpen ? layout.isLeftBottomOpen : undefined,
          isOpenBotRight: layout.isPartialBottomOpen ? layout.isRightBottomOpen : undefined,
          bottomBarSegments: layout.isPartialBottomOpen ? layout.bottomBarSegments : undefined,
          hasInnerRebate: !hasSlidingLeaves,
          gapMm: 0.7,
          mullions: layout.mullions,
        }
      );

      // Vẽ đủ số thanh Ray Inox trên khung dưới theo đúng số ray của bộ cửa (2 ray, 3 ray, 4 ray...)
      if (hasSlidingLeaves && !isOpenBottom) {
        const railCol: Vec3 = [0.78, 0.82, 0.86];
        const [rx1, ryBot] = to3D(fBox.x + frameMm, fBox.y + fBox.h - botFrameMm);
        const [rx2] = to3D(fBox.x + fBox.w - frameMm, fBox.y + fBox.h - botFrameMm);
        const railW = Math.max(0.05, Math.abs(rx2 - rx1));
        const railCx = (rx1 + rx2) / 2;
        for (let tIdx = 0; tIdx < numTracks; tIdx++) {
          collector.addBox(railCx, ryBot + 0.003, getTrackZ(tIdx), railW, 0.006, 0.005, railCol, 4);
        }
      }
    }
  }

  // 5. Dựng các thanh Đố chia khung (Static Mullions)
  const rawMullionDepthM = Math.max(0.04, (cfg.mullionDepthMm || 105) * 0.001);
  const mDepth = Math.min(frameDepthM, rawMullionDepthM);
  for (const mBar of layout.mullions) {
    const poly = ensureCCW([
      to3D(mBar.x, mBar.y),
      to3D(mBar.x + mBar.w, mBar.y),
      to3D(mBar.x + mBar.w, mBar.y + mBar.h),
      to3D(mBar.x, mBar.y + mBar.h),
    ]);
    collector.addExtrudedConvexPolygon(
      poly,
      -mDepth / 2,
      mDepth / 2,
      aluRgb,
      aluMatId,
      aluEdgeRgb
    );
  }

  // 6. Thu thập trước Đố chia cánh (Sash Mullions)
  const sashMullionsAll = collectSashMullions(layout.leaves, sashMm);

  const slidingXMin =
    slidingLeavesList.length > 0
      ? Math.min(...slidingLeavesList.map((l) => l.x))
      : frameMm;
  const slidingXMax =
    slidingLeavesList.length > 0
      ? Math.max(...slidingLeavesList.map((l) => l.x))
      : safeW - frameMm;

  const isCenterMeetingSliding =
    ((totalSlidingLeaves === 4 || totalSlidingLeaves === 6) &&
      slidingLeavesList.some((l) => Boolean(l.node.sashJoiner || l.node.sashJoinerPair))) ||
    (totalSlidingLeaves === 4 && numTracks === 2);

  // Gom nhóm các cánh mở quay/xếp trượt cùng chiều trên cùng 1 hàng ngang (không có đố tĩnh ngăn cách) để gập nối tiếp chữ V (Accordion) không xuyên qua nhau
  const hasVertMullionBetween = (xA: number, xB: number, yMid: number): boolean => {
    const minX = Math.min(xA, xB) + 4;
    const maxX = Math.max(xA, xB) - 4;
    return layout.mullions.some(
      (m) => m.h > m.w && m.x + m.w / 2 >= minX && m.x + m.w / 2 <= maxX && yMid >= m.y && yMid <= m.y + m.h
    );
  };

  // 7. Dựng từng Ô cửa (Vách kính cố định hoặc Cánh đóng/mở động học)
  let slidingLeafCounter = 0;

  interface FlattenedSashItem {
    node: SceneCellNode;
    box: { x: number; y: number; w: number; h: number };
    sashType: string;
    hasDynamicMullion?: boolean;
    slidingIndex?: number;
    foldChainIndex?: number;
    foldChainAnchorXMm?: number;
    foldChainPrevWidthsMm?: number[];
  }

  const allSashes: FlattenedSashItem[] = [];

  for (const leaf of layout.leaves) {
    const { node, x: leafX, y: leafY, w: leafW, h: leafH } = leaf;
    // Ô ghi đè Đảo vách/Đảo cánh riêng: dựng 4 thanh REVERSAL quanh ô rồi thu nhỏ hộp ô vào trong
    const hasCellReversal = leaf.effectiveReversalMode === 'wall' || leaf.effectiveReversalMode === 'sash';
    const cellReversalMm = hasCellReversal
      ? Math.min(
          resolveReversalMm(availableProfiles, frameConfig, node.reversalProfileIdOverride),
          Math.floor(Math.min(leafW, leafH) * 0.2)
        )
      : 0;
    if (cellReversalMm > 0) {
      addFourPerimeterBars3D(
        collector,
        to3D,
        { x: leafX, y: leafY, w: leafW, h: leafH },
        { left: cellReversalMm, top: cellReversalMm, right: cellReversalMm, bottom: cellReversalMm },
        -sashDepthM / 2,
        sashDepthM / 2,
        '45',
        aluRgb,
        aluMatId,
        aluEdgeRgb,
        { gapMm: 0.4 }
      );
    }
    const lx = leafX + cellReversalMm;
    const ly = leafY + cellReversalMm;
    const lw = leafW - 2 * cellReversalMm;
    const lh = leafH - 2 * cellReversalMm;
    const st = String(node.sashType || 'fixed');

    if (st === 'fixed') {
      const bW = Math.min(beadMm, Math.floor(Math.min(lw, lh) * 0.15));
      const beadDepth = Math.max(0.018, (cfg.glassThicknessMm || 8) * 0.001 + 0.01);
      addFourPerimeterBars3D(
        collector,
        to3D,
        { x: lx, y: ly, w: lw, h: lh },
        { left: bW, top: bW, right: bW, bottom: bW },
        -beadDepth / 2,
        beadDepth / 2,
        frameConfig?.beadCornerJoint ?? '45',
        beadRgb,
        aluMatId,
        aluEdgeRgb,
        { gapMm: 0.4 }
      );
      addInfillPane3D(
        collector,
        to3D,
        { x: lx + bW, y: ly + bW, w: Math.max(20, lw - 2 * bW), h: Math.max(20, lh - 2 * bW) },
        0,
        node.paneType || 'glass',
        aluRgb,
        aluMatId,
        node,
        {
          thicknessMm: cfg.glassThicknessMm,
          colorHex: cfg.glassColorHex,
          transparency: cfg.glassTransparency,
        }
      );
      continue;
    }

    if (st === 'swing_double') {
      const gapMid = 3;
      const halfW = (lw - gapMid) / 2;
      allSashes.push(
        {
          node,
          box: { x: lx, y: ly, w: halfW, h: lh },
          sashType: 'swing_left',
          hasDynamicMullion: true,
        },
        {
          node,
          box: { x: lx + halfW + gapMid, y: ly, w: halfW, h: lh },
          sashType: 'swing_right',
          hasDynamicMullion: false,
        }
      );
    } else {
      const isSlidingSash = isLeafSliding(node);
      allSashes.push({
        node,
        box: { x: lx, y: ly, w: lw, h: lh },
        sashType: st,
        slidingIndex: isSlidingSash ? slidingLeafCounter++ : undefined,
      });
    }
  }

  // Phát hiện chuỗi cánh xếp trượt / mở nối tiếp cùng phía để tính động học gập đôi (Bi-Fold Accordion)
  const leftSwingCandidates = allSashes
    .filter(
      (s) =>
        s.sashType === 'gap-xep-le-trai' ||
        s.sashType === 'swing_left' ||
        s.sashType === 'le-trai-mo-ra' ||
        s.sashType === 'le-trai-mo-vao'
    )
    .sort((a, b) => a.box.x - b.box.x);

  for (let i = 0; i < leftSwingCandidates.length; i++) {
    const cur = leftSwingCandidates[i];
    if (i === 0) {
      cur.foldChainIndex = 0;
      cur.foldChainAnchorXMm = cur.box.x;
      cur.foldChainPrevWidthsMm = [];
      continue;
    }
    const prev = leftSwingCandidates[i - 1];
    const sameRow = Math.abs(cur.box.y - prev.box.y) < 15 && Math.abs(cur.box.h - prev.box.h) < 15;
    const isAdjacent = Math.abs(cur.box.x - (prev.box.x + prev.box.w)) < 25;
    const noMullion = !hasVertMullionBetween(prev.box.x + prev.box.w / 2, cur.box.x + cur.box.w / 2, cur.box.y + cur.box.h / 2);
    if (sameRow && (cur.sashType.includes('gap-xep') || (isAdjacent && noMullion))) {
      cur.foldChainIndex = (prev.foldChainIndex ?? 0) + 1;
      cur.foldChainAnchorXMm = prev.foldChainAnchorXMm ?? prev.box.x;
      cur.foldChainPrevWidthsMm = [...(prev.foldChainPrevWidthsMm || []), prev.box.w];
    } else {
      cur.foldChainIndex = 0;
      cur.foldChainAnchorXMm = cur.box.x;
      cur.foldChainPrevWidthsMm = [];
    }
  }

  const rightSwingCandidates = allSashes
    .filter(
      (s) =>
        s.sashType === 'gap-xep-le-phai' ||
        s.sashType === 'swing_right' ||
        s.sashType === 'le-phai-mo-ra' ||
        s.sashType === 'le-phai-mo-vao'
    )
    .sort((a, b) => b.box.x - a.box.x);

  for (let i = 0; i < rightSwingCandidates.length; i++) {
    const cur = rightSwingCandidates[i];
    if (i === 0) {
      cur.foldChainIndex = 0;
      cur.foldChainAnchorXMm = cur.box.x + cur.box.w;
      cur.foldChainPrevWidthsMm = [];
      continue;
    }
    const prev = rightSwingCandidates[i - 1];
    const sameRow = Math.abs(cur.box.y - prev.box.y) < 15 && Math.abs(cur.box.h - prev.box.h) < 15;
    const isAdjacent = Math.abs(prev.box.x - (cur.box.x + cur.box.w)) < 25;
    const noMullion = !hasVertMullionBetween(cur.box.x + cur.box.w / 2, prev.box.x + prev.box.w / 2, cur.box.y + cur.box.h / 2);
    if (sameRow && (cur.sashType.includes('gap-xep') || (isAdjacent && noMullion))) {
      cur.foldChainIndex = (prev.foldChainIndex ?? 0) + 1;
      cur.foldChainAnchorXMm = prev.foldChainAnchorXMm ?? prev.box.x + prev.box.w;
      cur.foldChainPrevWidthsMm = [...(prev.foldChainPrevWidthsMm || []), prev.box.w];
    } else {
      cur.foldChainIndex = 0;
      cur.foldChainAnchorXMm = cur.box.x + cur.box.w;
      cur.foldChainPrevWidthsMm = [];
    }
  }

  for (const sub of allSashes) {
    const { node } = sub;
    const subSt = sub.sashType;
    const isSliding = sub.slidingIndex !== undefined;

    // Khe hở kỹ thuật thực tế (Rebate clearance 2mm) để cánh không cọ/xuyên vào khung bao
    const clearanceMm = isSliding ? 0 : 2;
    const sBox = {
      x: sub.box.x + clearanceMm,
      y: sub.box.y + clearanceMm,
      w: Math.max(40, sub.box.w - clearanceMm * 2),
      h: Math.max(40, sub.box.h - clearanceMm * 2),
    };

    const isLeftHinge =
      subSt === 'swing_left' ||
      subSt === 'le-trai-mo-ra' ||
      subSt === 'le-trai-mo-vao' ||
      subSt === 'gap-xep-le-trai';
    const isRightHinge =
      subSt === 'swing_right' ||
      subSt === 'le-phai-mo-ra' ||
      subSt === 'le-phai-mo-vao' ||
      subSt === 'gap-xep-le-phai';
    const isAwning = subSt === 'awning' || subSt === 'mo-hat';
    const isTilt = subSt === 'tilt' || subSt === 'mo-lat' || subSt === 'tilt_turn' || subSt === 'tilt_down';

    const isInward = subSt.includes('mo-vao') || isTilt;
    const dirZ = isInward ? -1 : 1;

    // Xác định mặt phẳng Z của cánh:
    // - Cánh mở ra ngoài (mo-ra, awning): mặt ngoài của cánh phẳng (flush) với mặt ngoài khung bao (frameZFront)
    // - Cánh mở vào trong (mo-vao, tilt): mặt trong của cánh phẳng (flush) với mặt trong khung bao (frameZBack)
    // -> Nhờ vậy khi xoay quanh tâm bản lề ngoài/trong, thân cánh thoát hoàn toàn ra khỏi khung, không bao giờ cắt xuyên qua khung!
    let trackIdx = 0;
    if (isSliding) {
      trackIdx =
        node.sashZIndex !== undefined
          ? node.sashZIndex
          : totalSlidingLeaves === 4
            ? sub.slidingIndex === 1 || sub.slidingIndex === 2
              ? 1
              : 0
            : (sub.slidingIndex ?? 0) % numTracks;
    }

    let sZBack: number;
    let sZFront: number;
    if (isSliding) {
      const trackZCenter = getTrackZ(trackIdx);
      sZBack = trackZCenter - sashDepthM / 2;
      sZFront = trackZCenter + sashDepthM / 2;
    } else if (isInward) {
      sZBack = frameZBack;
      sZFront = Math.min(frameZFront, frameZBack + sashDepthM);
    } else {
      sZFront = frameZFront;
      sZBack = Math.max(frameZBack, frameZFront - sashDepthM);
    }
    const sashZCenter = (sZBack + sZFront) / 2;

    let activeSashJoint: SashCornerJoint = sashConfig?.cornerJoint ?? '45';
    if (isSliding && sashConfig?.slidingJoints) {
      const sIdx = sub.slidingIndex ?? 0;
      const isFirst = sIdx === 0;
      const isLast = sIdx === totalSlidingLeaves - 1 && totalSlidingLeaves > 1;
      if (isFirst) {
        activeSashJoint = sashConfig.slidingJoints.leftSliding || activeSashJoint;
      } else if (isLast) {
        activeSashJoint = sashConfig.slidingJoints.rightSliding || activeSashJoint;
      } else {
        activeSashJoint = sashConfig.slidingJoints.centerSliding || activeSashJoint;
      }
    }

    const sashSnap = collector.getSnapshotIndices();
    const isVoCuc3D = isSlim && !isSliding && !subSt.includes('gap-xep');
    const hingeZFace = dirZ > 0 ? sZFront : sZBack;

    if (isVoCuc3D) {
      const voCucPoly = ensureCCW([
        to3D(sBox.x, sBox.y),
        to3D(sBox.x + sBox.w, sBox.y),
        to3D(sBox.x + sBox.w, sBox.y + sBox.h),
        to3D(sBox.x, sBox.y + sBox.h),
      ]);
      collector.addExtrudedConvexPolygon(
        voCucPoly,
        sZBack,
        sZFront,
        aluRgb,
        aluMatId,
        aluEdgeRgb
      );
      if (isLeftHinge || isRightHinge) {
        const hingeX = isLeftHinge ? sBox.x + 3 : sBox.x + sBox.w - 3;
        addHinges3D(collector, hingeX, sBox.y, sBox.h, hingeZFace, dirZ, to3D, effectiveHwRgb);
      }
    } else {
      const dSash = Math.min(sashMm, Math.floor(Math.min(sBox.w, sBox.h) * 0.22));
      addFourPerimeterBars3D(
        collector,
        to3D,
        sBox,
        { left: dSash, top: dSash, right: dSash, bottom: dSash },
        sZBack,
        sZFront,
        activeSashJoint,
        aluRgb,
        aluMatId,
        aluEdgeRgb,
        {
          hasInnerRebate: true,
          gapMm: 0.6,
        }
      );

    // Cây Ốp móc (Interlock) cho cánh lùa
    if (isSliding && totalSlidingLeaves >= 2) {
      const sIdx = sub.slidingIndex ?? 0;
      const hasRightInterlock = isCenterMeetingSliding
        ? sIdx !== totalSlidingLeaves / 2 - 1 && sIdx < totalSlidingLeaves - 1
        : sIdx < totalSlidingLeaves - 1;
      const hasLeftInterlock = isCenterMeetingSliding
        ? sIdx !== totalSlidingLeaves / 2 && sIdx > 0
        : sIdx > 0;

      const interlockFinDepth = 0.014;
      if (hasRightInterlock) {
        const [ix] = to3D(sBox.x + sBox.w - 8, sBox.y);
        const [, iyT] = to3D(sBox.x, sBox.y + dSash);
        const [, iyB] = to3D(sBox.x, sBox.y + sBox.h - dSash);
        const zFin = sZFront + interlockFinDepth / 2;
        collector.addBox(
          ix,
          (iyT + iyB) / 2,
          zFin,
          0.012,
          Math.max(0.05, Math.abs(iyT - iyB)),
          interlockFinDepth,
          aluRgb,
          aluMatId,
          aluEdgeRgb
        );
      }
      if (hasLeftInterlock) {
        const [ix] = to3D(sBox.x + 8, sBox.y);
        const [, iyT] = to3D(sBox.x, sBox.y + dSash);
        const [, iyB] = to3D(sBox.x, sBox.y + sBox.h - dSash);
        const zFin = sZBack - interlockFinDepth / 2;
        collector.addBox(
          ix,
          (iyT + iyB) / 2,
          zFin,
          0.012,
          Math.max(0.05, Math.abs(iyT - iyB)),
          interlockFinDepth,
          aluRgb,
          aluMatId,
          aluEdgeRgb
        );
      }
    }

    // Đố động / Ốp nối cánh giữa
    if (sub.hasDynamicMullion || node.sashJoiner) {
      const [dmX] = to3D(sBox.x + sBox.w + 1, sBox.y);
      const [, dmYT] = to3D(sBox.x, sBox.y);
      const [, dmYB] = to3D(sBox.x, sBox.y + sBox.h);
      collector.addBox(
        dmX,
        (dmYT + dmYB) / 2,
        sashZCenter,
        0.02,
        Math.max(0.05, Math.abs(dmYT - dmYB)),
        sZFront - sZBack,
        aluRgb,
        aluMatId,
        aluEdgeRgb
      );
    }

    // Đố chia trong lòng cánh (Sash Mullions)
    const smBarsInSash = sashMullionsAll.filter(
      (sm) =>
        sm.x >= sub.box.x - 2 &&
        sm.x + sm.w <= sub.box.x + sub.box.w + 2 &&
        sm.y >= sub.box.y - 2 &&
        sm.y + sm.h <= sub.box.y + sub.box.h + 2
    );
    for (const sm of smBarsInSash) {
      const smPoly = ensureCCW([
        to3D(sm.x, sm.y),
        to3D(sm.x + sm.w, sm.y),
        to3D(sm.x + sm.w, sm.y + sm.h),
        to3D(sm.x, sm.y + sm.h),
      ]);
      collector.addExtrudedConvexPolygon(
        smPoly,
        sZBack + 0.002,
        sZFront - 0.002,
        aluRgb,
        aluMatId,
        aluEdgeRgb
      );
    }

    // 4 Thanh Nẹp kính cánh + Tấm kính trong lòng cánh
    const sbW = Math.min(beadMm, Math.floor(dSash * 0.42));
    const innerBox = {
      x: sBox.x + dSash,
      y: sBox.y + dSash,
      w: Math.max(20, sBox.w - 2 * dSash),
      h: Math.max(20, sBox.h - 2 * dSash),
    };
    const halfBeadZ = Math.min((sZFront - sZBack) * 0.42, Math.max(0.009, (cfg.glassThicknessMm || 8) * 0.0005 + 0.005));
    addFourPerimeterBars3D(
      collector,
      to3D,
      innerBox,
      { left: sbW, top: sbW, right: sbW, bottom: sbW },
      sashZCenter - halfBeadZ,
      sashZCenter + halfBeadZ,
      sashConfig?.beadCornerJoint ?? '45',
      beadRgb,
      aluMatId,
      aluEdgeRgb,
      { gapMm: 0.4 }
    );

    addInfillPane3D(
      collector,
      to3D,
      {
        x: innerBox.x + sbW,
        y: innerBox.y + sbW,
        w: Math.max(16, innerBox.w - 2 * sbW),
        h: Math.max(16, innerBox.h - 2 * sbW),
      },
      sashZCenter,
      node.paneType || 'glass',
      aluRgb,
      aluMatId,
      node,
      {
        thicknessMm: cfg.glassThicknessMm,
        colorHex: cfg.glassColorHex,
        transparency: cfg.glassTransparency,
      }
    );

      if (isLeftHinge || isRightHinge) {
        const hingeX = isLeftHinge ? sBox.x + 3 : sBox.x + sBox.w - 3;
        addHinges3D(collector, hingeX, sBox.y, sBox.h, hingeZFace, dirZ, to3D, effectiveHwRgb);

        if (node.hasLock !== false) {
          const handleHFromBot = node.handleHeight || Math.round(sBox.h * 0.5);
          const clampedHandleH = Math.max(150, Math.min(sBox.h - 150, handleHFromBot));
          const handleY = sBox.y + sBox.h - clampedHandleH;
          const handleX = isLeftHinge ? sBox.x + sBox.w - dSash * 0.5 : sBox.x + dSash * 0.5;
          addHandle3D(
            collector,
            handleX,
            handleY,
            sZFront,
            sZBack,
            !isLeftHinge,
            false,
            to3D,
            effectiveHwRgb,
            {
              depthMm: cfg.handleDepthMm,
              offsetXMm: cfg.handleOffsetXMm,
              offsetYMm: cfg.handleOffsetYMm,
              bothSides: cfg.bothSidesHandle,
            }
          );
        }
      } else if (isSliding && node.hasLock !== false) {
        const sIdx = sub.slidingIndex ?? 0;
        const handleHFromBot = node.handleHeight || Math.round(sBox.h * 0.5);
        const clampedHandleH = Math.max(150, Math.min(sBox.h - 150, handleHFromBot));
        const handleY = sBox.y + sBox.h - clampedHandleH;

        const isHandleOnLeft = isCenterMeetingSliding
          ? sIdx === 0 || sIdx === totalSlidingLeaves / 2
          : sIdx === 0;
        const handleX = isHandleOnLeft
          ? sBox.x + dSash * 0.5
          : sBox.x + sBox.w - dSash * 0.5;
        addHandle3D(
          collector,
          handleX,
          handleY,
          sZFront,
          sZBack,
          isHandleOnLeft,
          true,
          to3D,
          effectiveHwRgb,
          {
            depthMm: cfg.handleDepthMm,
            offsetXMm: cfg.handleOffsetXMm,
            offsetYMm: cfg.handleOffsetYMm,
            bothSides: cfg.bothSidesHandle,
          }
        );
      } else if ((isAwning || isTilt) && node.hasLock !== false) {
        const [hx, hy] = to3D(
          sBox.x + sBox.w / 2 + (cfg.handleOffsetXMm || 0),
          sBox.y + sBox.h - dSash * 0.5 - (cfg.handleOffsetYMm || 0)
        );
        collector.addBox(hx, hy, sZFront + 0.012, 0.095, 0.02, 0.022, effectiveHwRgb, 4, darkenColor(effectiveHwRgb, 0.5));
      }
    }

    // Vẽ tia chỉ hướng mở 3D trên mặt kính
    if (showOpeningRays) {
      if (isLeftHinge) {
        addOpeningRays3D(collector, to3D, sBox, sZFront, 'swing_left');
      } else if (isRightHinge) {
        addOpeningRays3D(collector, to3D, sBox, sZFront, 'swing_right');
      } else if (isAwning) {
        addOpeningRays3D(collector, to3D, sBox, sZFront, 'awning');
      } else if (isTilt) {
        addOpeningRays3D(collector, to3D, sBox, sZFront, 'tilt');
      } else if (isSliding) {
        const sIdx = sub.slidingIndex ?? 0;
        const isMiddleTwoWay =
          subSt === '2-chieu' ||
          (!isCenterMeetingSliding && totalSlidingLeaves >= 3 && sIdx > 0 && sIdx < totalSlidingLeaves - 1);

        if (isMiddleTwoWay) {
          addOpeningRays3D(collector, to3D, sBox, sZFront, 'sliding_both');
        } else if (isCenterMeetingSliding) {
          const halfCount = totalSlidingLeaves / 2;
          const isInnerMeetingSash = sIdx === halfCount - 1 || sIdx === halfCount;
          const pointsLeft = isInnerMeetingSash ? sIdx < halfCount : sIdx >= halfCount;
          addOpeningRays3D(collector, to3D, sBox, sZFront, pointsLeft ? 'sliding_left' : 'sliding_right');
        } else {
          const pointsRight = sIdx === 0;
          addOpeningRays3D(collector, to3D, sBox, sZFront, pointsRight ? 'sliding_right' : 'sliding_left');
        }
      }
    }

    // 8. Áp dụng phép biến đổi Động học Chuẩn Kiến trúc (Không cắt xuyên khung / Không xuyên cánh)
    if (openRatio > 0.001) {
      const clampedOpen = Math.max(0, Math.min(1, openRatio));
      const pivotZPin = hingeZFace + dirZ * 0.003;

      if (isLeftHinge) {
        const chainIdx = sub.foldChainIndex ?? 0;
        const maxAngle = (chainIdx > 0 || subSt.includes('gap-xep')) ? (74 * Math.PI) / 180 : (68 * Math.PI) / 180;
        const theta = clampedOpen * maxAngle;
        const [pivX, pivY] = to3D(sBox.x, sBox.y + sBox.h / 2);

        if (chainIdx === 0) {
          collector.transformSince(sashSnap, {
            pivotX: pivX,
            pivotY: pivY,
            pivotZ: pivotZPin,
            rotY: -dirZ * theta,
          });
        } else {
          // Cánh xếp nối tiếp (Accordion Bi-fold): Cánh chẵn/lẻ gập ngược chiều nhau và tịnh tiến theo mép cánh trước
          const anchorX = to3D(sub.foldChainAnchorXMm ?? sBox.x, sBox.y)[0];
          const prevWidthsM = (sub.foldChainPrevWidthsMm || []).map((wm) => wm * 0.001);
          const foldedSpanM = prevWidthsM.reduce((sum, wM) => sum + wM * Math.cos(theta), 0);
          const targetHingeX = anchorX + foldedSpanM;
          const isOdd = chainIdx % 2 === 1;
          const prevW = prevWidthsM[prevWidthsM.length - 1] || sBox.w * 0.001;
          const dzHinge = isOdd ? dirZ * prevW * Math.sin(theta) : 0;

          collector.transformSince(sashSnap, {
            pivotX: pivX,
            pivotY: pivY,
            pivotZ: pivotZPin,
            rotY: isOdd ? dirZ * theta : -dirZ * theta,
            dx: targetHingeX - pivX,
            dz: dzHinge,
          });
        }
      } else if (isRightHinge) {
        const chainIdx = sub.foldChainIndex ?? 0;
        const maxAngle = (chainIdx > 0 || subSt.includes('gap-xep')) ? (74 * Math.PI) / 180 : (68 * Math.PI) / 180;
        const theta = clampedOpen * maxAngle;
        const [pivX, pivY] = to3D(sBox.x + sBox.w, sBox.y + sBox.h / 2);

        if (chainIdx === 0) {
          collector.transformSince(sashSnap, {
            pivotX: pivX,
            pivotY: pivY,
            pivotZ: pivotZPin,
            rotY: dirZ * theta,
          });
        } else {
          const anchorX = to3D(sub.foldChainAnchorXMm ?? sBox.x + sBox.w, sBox.y)[0];
          const prevWidthsM = (sub.foldChainPrevWidthsMm || []).map((wm) => wm * 0.001);
          const foldedSpanM = prevWidthsM.reduce((sum, wM) => sum + wM * Math.cos(theta), 0);
          const targetHingeX = anchorX - foldedSpanM;
          const isOdd = chainIdx % 2 === 1;
          const prevW = prevWidthsM[prevWidthsM.length - 1] || sBox.w * 0.001;
          const dzHinge = isOdd ? dirZ * prevW * Math.sin(theta) : 0;

          collector.transformSince(sashSnap, {
            pivotX: pivX,
            pivotY: pivY,
            pivotZ: pivotZPin,
            rotY: isOdd ? -dirZ * theta : dirZ * theta,
            dx: targetHingeX - pivX,
            dz: dzHinge,
          });
        }
      } else if (isAwning) {
        // Mở hất ra ngoài (+Z): Bản lề ở mép trên mặt ngoài (sZFront + 0.003), đẩy đáy cánh ra phía trước
        const [pivX, pivY] = to3D(sBox.x + sBox.w / 2, sBox.y);
        const maxAngle = (34 * Math.PI) / 180;
        collector.transformSince(sashSnap, {
          pivotX: pivX,
          pivotY: pivY,
          pivotZ: sZFront + 0.003,
          rotX: -clampedOpen * maxAngle,
        });
      } else if (isTilt) {
        // Mở lật vào trong (-Z): Bản lề ở mép dưới mặt trong (sZBack - 0.003), ngả đỉnh cánh vào trong phòng
        const [pivX, pivY] = to3D(sBox.x + sBox.w / 2, sBox.y + sBox.h);
        const maxAngle = (22 * Math.PI) / 180;
        collector.transformSince(sashSnap, {
          pivotX: pivX,
          pivotY: pivY,
          pivotZ: sZBack - 0.003,
          rotX: -clampedOpen * maxAngle,
        });
      } else if (isSliding) {
        const sIdx = sub.slidingIndex ?? 0;
        let targetXMm = sub.box.x;

        if (isCenterMeetingSliding) {
          const half = totalSlidingLeaves / 2;
          const leftCenterX = slidingLeavesList[half - 1]?.x ?? sub.box.x;
          const rightCenterX = slidingLeavesList[half]?.x ?? sub.box.x;

          if (slidingDirection === 'right_to_left') {
            // Pha 1: Mở 2 cánh giữa trượt dồn ra 2 cánh biên ngoài (trên 2 ray khác nhau, không chạm nhau)
            if (sIdx === half - 1) targetXMm = slidingXMin;
            else if (sIdx === half) targetXMm = slidingXMax;
          } else {
            // Pha 2: Mở 2 cánh biên ngoài trượt dồn vào 2 cánh giữa
            if (sIdx === 0) targetXMm = leftCenterX;
            else if (sIdx === totalSlidingLeaves - 1) targetXMm = rightCenterX;
          }
        } else {
          targetXMm = slidingDirection === 'right_to_left' ? slidingXMin : slidingXMax;
        }

        const slideDxMeters = (targetXMm - sub.box.x) * 0.001 * clampedOpen * 0.92;
        if (Math.abs(slideDxMeters) > 0.0001) {
          collector.transformSince(sashSnap, { dx: slideDxMeters });
        }
      }
    }
  }

  return collector;
}
