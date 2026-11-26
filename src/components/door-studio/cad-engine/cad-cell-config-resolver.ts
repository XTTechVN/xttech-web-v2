import { ProfileBar } from '@/types/profile';
import {
  FrameConfig,
  FrameCornerJoint,
  ProfileIdRef,
  SashConfig,
  SashCornerJoint,
  SceneCellNode,
} from '../studio-types';
import { findStudioProfile } from '../utils/profile-combine-utils';
import { CAD_CONFIG } from './cad-config';
import { CadReversalMode, EdgeThickness } from './cad-types';

export type BottomOpenMode = 'global' | 'all_open' | 'all_closed' | 'partial';

export interface BottomOpenPlan {
  mode: BottomOpenMode;
  /** Giá trị Hở đáy hiệu lực ở cấp khung bao (true: bỏ hẳn thanh khung đáy) */
  isOpenBottom: boolean;
  /** Id các ô lá chạm đáy */
  bottomLeafIds: Set<string>;
  /** Id các ô lá chạm đáy đang Hở */
  openLeafIds: Set<string>;
}

const isLeafNode = (node: SceneCellNode): boolean =>
  !node.children || node.children.length === 0 || node.splitType === 'sash_mullion';

const getExplicitBottomOverride = (node: SceneCellNode): 'open' | 'closed' | undefined => {
  if (node.openBottomOverride === 'open' || node.openBottomOverride === 'closed') {
    return node.openBottomOverride;
  }
  if (node.hasBottomFrameOverride === false) return 'open';
  if (node.hasBottomFrameOverride === true) return 'closed';
  return undefined;
};

const hasOpenBottomOverride = (node: SceneCellNode): boolean =>
  getExplicitBottomOverride(node) !== undefined ||
  Boolean(node.children?.some(hasOpenBottomOverride));

/** Ô lá hoặc khối khung đang Hở cạnh đáy hiệu lực: override 'open'/'closed' thắng, ngược lại theo cấu hình chung */
export const resolveIsCellOpenBottom = (node: SceneCellNode, isGlobalOpen: boolean): boolean => {
  const ov = getExplicitBottomOverride(node);
  if (ov === 'open') return true;
  if (ov === 'closed') return false;
  return isGlobalOpen;
};

/** Đảo riêng của ô: undefined = kế thừa; 'wall' chỉ áp cho ô fix, 'sash' chỉ áp cho ô cánh */
export const resolveCellReversal = (node: SceneCellNode): CadReversalMode | undefined => {
  const override = node.reversalOverride;
  if (override !== undefined && override !== 'inherit') {
    if (override === 'none') return 'none';
    const isFixed = node.sashType === 'fixed';
    if (override === 'wall') return isFixed ? 'wall' : 'none';
    return isFixed ? 'none' : 'sash';
  }
  if (node.hasFrameReversalOverride === false) return 'none';
  if (node.hasFrameReversalOverride === true) {
    return node.sashType === 'fixed' ? 'wall' : 'sash';
  }
  return undefined;
};

/**
 * Lập kế hoạch Hở/Kín đáy cho 1 khối khung bao (`unitRootCell`) hoặc toàn bộ cửa.
 * Hỗ trợ đầy đủ cả cửa ghép khung (`coupling`) và ghi đè theo từng khối khung / từng ô lá chạm đáy.
 */
export const resolveBottomOpenPlan = (unitRootCell: SceneCellNode, isGlobalOpen: boolean): BottomOpenPlan => {
  const bottomLeafIds = new Set<string>();
  const openLeafIds = new Set<string>();
  const unitBaseOpen = resolveIsCellOpenBottom(unitRootCell, isGlobalOpen);
  const rootExplicit = getExplicitBottomOverride(unitRootCell);
  const legacyPlan: BottomOpenPlan = {
    mode: rootExplicit ? (unitBaseOpen ? 'all_open' : 'all_closed') : 'global',
    isOpenBottom: unitBaseOpen,
    bottomLeafIds,
    openLeafIds,
  };
  if (!hasOpenBottomOverride(unitRootCell)) return legacyPlan;

  const walk = (node: SceneCellNode, inheritedOpen: boolean, isTouchingBottom: boolean): void => {
    const ov = getExplicitBottomOverride(node);
    const isOpen = ov === 'open' ? true : ov === 'closed' ? false : inheritedOpen;
    if (isLeafNode(node)) {
      if (!isTouchingBottom) return;
      bottomLeafIds.add(node.id);
      if (isOpen) openLeafIds.add(node.id);
      return;
    }
    const children = node.children ?? [];
    const isVertical = node.splitDirection === 'vertical';
    children.forEach((child, idx) =>
      walk(child, isOpen, isTouchingBottom && (isVertical || idx === children.length - 1))
    );
  };
  walk(unitRootCell, unitBaseOpen, true);

  if (bottomLeafIds.size === 0) return legacyPlan;
  if (openLeafIds.size === bottomLeafIds.size) {
    return { mode: 'all_open', isOpenBottom: true, bottomLeafIds, openLeafIds };
  }
  if (openLeafIds.size === 0) {
    return { mode: 'all_closed', isOpenBottom: false, bottomLeafIds, openLeafIds };
  }
  return { mode: 'partial', isOpenBottom: false, bottomLeafIds, openLeafIds };
};

/** Ô lá chạm đáy ở mép trái/phải của một nhánh (dùng cho đố đứng ranh giới Hở/Kín) */
export const findEdgeBottomLeafId = (node: SceneCellNode, side: 'first' | 'last'): string => {
  if (isLeafNode(node)) return node.id;
  const children = node.children ?? [];
  const isVertical = node.splitDirection === 'vertical';
  const target = isVertical && side === 'first' ? children[0] : children[children.length - 1];
  return findEdgeBottomLeafId(target, side);
};

/** Ô có chạm đáy cửa không (tính theo cây, dùng cho UI Thuộc tính ô) */
export const isNodeTouchingBottom = (rootCell: SceneCellNode, targetId: string): boolean => {
  const walk = (node: SceneCellNode, isTouchingBottom: boolean): boolean | undefined => {
    if (node.id === targetId) return isTouchingBottom;
    const children = node.children ?? [];
    const isVertical = node.splitDirection === 'vertical';
    for (let idx = 0; idx < children.length; idx++) {
      const found = walk(children[idx], isTouchingBottom && (isVertical || idx === children.length - 1));
      if (found !== undefined) return found;
    }
    return undefined;
  };
  return walk(rootCell, true) ?? false;
};

export interface SeriesDefaultProfiles {
  frameId?: ProfileIdRef;
  mullionId?: ProfileIdRef;
  sashId?: ProfileIdRef;
  beadId?: ProfileIdRef;
  reversalId?: ProfileIdRef;
}

/** Tìm bộ mã thanh mặc định của một hệ nhôm (seriesId) trong danh sách thanh của hãng */
export const resolveDefaultProfilesForSeries = (
  allProfiles: ProfileBar[] | undefined,
  seriesId?: number | null
): SeriesDefaultProfiles => {
  if (!allProfiles || !seriesId) return {};
  const inSeries = allProfiles.filter((p) => p.seriesId === seriesId && !p.isVirtual);
  const pickByType = (barType: string): ProfileIdRef | undefined =>
    inSeries.find((p) => (p.barType || '').toUpperCase() === barType)?.id;
  return {
    frameId: pickByType('FRAME'),
    mullionId: pickByType('MULLION'),
    sashId: pickByType('SASH') ?? pickByType('SCREEN_SASH'),
    beadId: pickByType('BEAD'),
    reversalId: pickByType('REVERSAL'),
  };
};

const getProfileSectionMm = (
  profiles: ProfileBar[] | undefined,
  profileId?: ProfileIdRef | null
): number | undefined => {
  if (!profileId) return undefined;
  const found = findStudioProfile(profiles, profileId);
  return found && found.sectionHeightMm > 0 ? found.sectionHeightMm : undefined;
};

export interface FrameUnitOverrideMetrics {
  frameEdges: EdgeThickness;
  frameMmEdges: EdgeThickness;
  cornerJoint: FrameCornerJoint;
  mullionProfileIdOverride?: ProfileIdRef;
  vertMullionPx?: number;
  horizMullionPx?: number;
  unitBottomPlan: BottomOpenPlan;
}

const normalizeCornerJoint = <T extends string>(raw: string | null | undefined, fallback?: T): T | undefined => {
  if (!raw) return fallback;
  if (raw === 'miter_45') return '45' as T;
  if (raw === 'butt_vertical') return '90_vert' as T;
  if (raw === 'butt_horizontal') return '90_horiz' as T;
  return raw as T;
};

/** Phân giải độ dày 4 cạnh khung bao, góc ghép và đố tĩnh cho từng Khối khung (Frame Unit) */
export const resolveFrameUnitOverrideMetrics = (
  unitNode: SceneCellNode,
  frameConfig: FrameConfig | undefined,
  availableProfiles: ProfileBar[] | undefined,
  baseFrameEdges: EdgeThickness,
  scale: number,
  isGlobalOpenBottom: boolean
): FrameUnitOverrideMetrics => {
  const unitBottomPlan = resolveBottomOpenPlan(unitNode, isGlobalOpenBottom);
  const seriesDefaults = resolveDefaultProfilesForSeries(availableProfiles, unitNode.seriesIdOverride);
  const sharedFrameId = unitNode.frameProfileIdOverride ?? seriesDefaults.frameId;

  const leftMm =
    getProfileSectionMm(
      availableProfiles,
      unitNode.frameLeftProfileIdOverride ?? sharedFrameId ?? frameConfig?.leftEdge?.profileId
    ) ?? (scale > 0 ? baseFrameEdges.left / scale : CAD_CONFIG.FRAME.DEFAULT_MM);
  const topMm =
    getProfileSectionMm(
      availableProfiles,
      unitNode.frameTopProfileIdOverride ?? sharedFrameId ?? frameConfig?.topEdge?.profileId
    ) ?? leftMm;
  const rightMm =
    getProfileSectionMm(
      availableProfiles,
      unitNode.frameRightProfileIdOverride ?? sharedFrameId ?? frameConfig?.rightEdge?.profileId
    ) ?? leftMm;
  const bottomMm =
    getProfileSectionMm(
      availableProfiles,
      unitNode.frameBottomProfileIdOverride ?? sharedFrameId ?? frameConfig?.bottomEdge?.profileId
    ) ?? leftMm;

  const frameMmEdges: EdgeThickness = { top: topMm, right: rightMm, bottom: bottomMm, left: leftMm };
  const hasFrameOverride = Boolean(
    unitNode.seriesIdOverride ||
      unitNode.frameProfileIdOverride ||
      unitNode.frameLeftProfileIdOverride ||
      unitNode.frameTopProfileIdOverride ||
      unitNode.frameRightProfileIdOverride ||
      unitNode.frameBottomProfileIdOverride
  );
  const frameEdges: EdgeThickness = hasFrameOverride
    ? {
        top: topMm * scale,
        right: rightMm * scale,
        bottom: bottomMm * scale,
        left: leftMm * scale,
      }
    : baseFrameEdges;

  const mullionId = unitNode.mullionProfileIdOverride ?? seriesDefaults.mullionId;
  const mullionMm = getProfileSectionMm(availableProfiles, mullionId);

  return {
    frameEdges,
    frameMmEdges,
    cornerJoint:
      normalizeCornerJoint<FrameCornerJoint>(
        unitNode.frameCornerJointOverride,
        frameConfig?.cornerJoint ?? '45'
      ) ?? '45',
    mullionProfileIdOverride: mullionId ?? undefined,
    vertMullionPx: mullionMm !== undefined ? mullionMm * scale : undefined,
    horizMullionPx: mullionMm !== undefined ? mullionMm * scale : undefined,
    unitBottomPlan,
  };
};

export interface LeafOverrideMetrics {
  sashEdges?: EdgeThickness;
  sashMmEdges?: EdgeThickness;
  sashCornerJoint?: SashCornerJoint;
  beadW?: number;
  beadMm?: number;
}

/** Phân giải độ dày 4 cạnh cánh, góc ghép cánh và nẹp kính cho từng Ô lá (Leaf Cell) */
export const resolveLeafOverrideMetrics = (
  leafNode: SceneCellNode,
  unitNode: SceneCellNode | undefined,
  sashConfig: SashConfig | undefined,
  frameConfig: FrameConfig | undefined,
  availableProfiles: ProfileBar[] | undefined,
  scale: number
): LeafOverrideMetrics => {
  const effectiveSeriesId = leafNode.seriesIdOverride ?? unitNode?.seriesIdOverride;
  const seriesDefaults = resolveDefaultProfilesForSeries(availableProfiles, effectiveSeriesId);

  const hasSashOverride = Boolean(
    effectiveSeriesId ||
      leafNode.sashProfileIdOverride ||
      leafNode.sashLeftProfileIdOverride ||
      leafNode.sashTopProfileIdOverride ||
      leafNode.sashRightProfileIdOverride ||
      leafNode.sashBottomProfileIdOverride
  );

  let sashEdges: EdgeThickness | undefined;
  let sashMmEdges: EdgeThickness | undefined;

  if (hasSashOverride) {
    const sharedSashId = leafNode.sashProfileIdOverride ?? seriesDefaults.sashId;
    const leftMm =
      getProfileSectionMm(
        availableProfiles,
        leafNode.sashLeftProfileIdOverride ?? sharedSashId ?? sashConfig?.leftProfileId
      ) ?? CAD_CONFIG.SASH.DOOR_DEFAULT_MM;
    const topMm =
      getProfileSectionMm(
        availableProfiles,
        leafNode.sashTopProfileIdOverride ?? sharedSashId ?? sashConfig?.topProfileId
      ) ?? leftMm;
    const rightMm =
      getProfileSectionMm(
        availableProfiles,
        leafNode.sashRightProfileIdOverride ?? sharedSashId ?? sashConfig?.rightProfileId
      ) ?? leftMm;
    const bottomMm =
      getProfileSectionMm(
        availableProfiles,
        leafNode.sashBottomProfileIdOverride ?? sharedSashId ?? sashConfig?.bottomProfileId
      ) ?? leftMm;

    sashMmEdges = { top: topMm, right: rightMm, bottom: bottomMm, left: leftMm };
    sashEdges = {
      top: topMm * scale,
      right: rightMm * scale,
      bottom: bottomMm * scale,
      left: leftMm * scale,
    };
  }

  const beadOverrideId =
    leafNode.beadProfileIdOverride ??
    leafNode.customBeads?.left ??
    leafNode.customBeads?.top ??
    seriesDefaults.beadId;
  const resolvedBeadMm = beadOverrideId
    ? getProfileSectionMm(availableProfiles, beadOverrideId) ??
      getProfileSectionMm(availableProfiles, sashConfig?.beadProfileId ?? frameConfig?.beadProfileId)
    : undefined;

  return {
    sashEdges,
    sashMmEdges,
    sashCornerJoint: normalizeCornerJoint<SashCornerJoint>(leafNode.sashCornerJointOverride),
    beadMm: resolvedBeadMm,
    beadW: resolvedBeadMm !== undefined ? resolvedBeadMm * scale : undefined,
  };
};
