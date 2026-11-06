import { FrameConfig, FrameShape, SashConfig, SashVariantProfiles, SlidingSashRole } from '../studio-types';
import { ProfileBar } from '@/types/profile';
import { CAD_CONFIG } from './cad-config';
import { CadMetrics, CadReversalMode, EdgeThickness } from './cad-types';

export interface CadMetricsInput {
  /** px / mm của bản vẽ */
  scale: number;
  /** Chiều cao cửa (mm) — quyết định cánh cửa đi hay cửa sổ khi chưa gán profile */
  doorHeightMm: number;
  frameShape: FrameShape;
  /** Thumbnail: chỉ áp ngưỡng nét tối thiểu nhỏ để không biến mất */
  isThumbnail: boolean;
  frameConfig?: FrameConfig;
  sashConfig?: SashConfig;
  availableProfiles?: ProfileBar[];
}

const MAX_CURVED_FRAME_MM = 56;
const MAX_CURVED_SASH_MM = 68;
const SLIDING_ROLES: SlidingSashRole[] = ['left_sliding', 'right_sliding', 'center_sliding'];

const getProfileMm = (profiles: ProfileBar[] | undefined, profileId: number | undefined): number | undefined => {
  if (profileId === undefined || !profiles) return undefined;
  const profile = profiles.find((item) => item.id === profileId);
  return profile && profile.sectionHeightMm > 0 ? profile.sectionHeightMm : undefined;
};

/** Lấy mm của từng cạnh; cạnh chưa gán profile dùng cạnh đã gán đầu tiên (theo thứ tự trên-trái-phải-dưới), sau đó mặc định */
const resolveEdgeMm = (
  edgeMm: Record<keyof EdgeThickness, number | undefined>,
  defaultMm: number
): Record<keyof EdgeThickness, number> => {
  const firstKnownMm = [edgeMm.top, edgeMm.left, edgeMm.right, edgeMm.bottom].find((mm) => mm !== undefined);
  const fallbackMm = firstKnownMm ?? defaultMm;
  return {
    top: edgeMm.top ?? fallbackMm,
    left: edgeMm.left ?? fallbackMm,
    right: edgeMm.right ?? fallbackMm,
    bottom: edgeMm.bottom ?? fallbackMm,
  };
};

const toEdgeThickness = (
  edgeMm: Record<keyof EdgeThickness, number>,
  scale: number,
  minPx: number,
  maxMm = Number.POSITIVE_INFINITY
): EdgeThickness => ({
  top: Math.max(minPx, Math.min(edgeMm.top, maxMm) * scale),
  right: Math.max(minPx, Math.min(edgeMm.right, maxMm) * scale),
  bottom: Math.max(minPx, Math.min(edgeMm.bottom, maxMm) * scale),
  left: Math.max(minPx, Math.min(edgeMm.left, maxMm) * scale),
});

const getDefaultSashMm = (isSlim: boolean, doorHeightMm: number): number => {
  if (isSlim) return CAD_CONFIG.SASH.SLIM_DEFAULT_MM;
  return doorHeightMm >= 1800 ? CAD_CONFIG.SASH.DOOR_DEFAULT_MM : CAD_CONFIG.SASH.WINDOW_DEFAULT_MM;
};

const resolveSlidingSashMetrics = (
  input: CadMetricsInput,
  baseEdgeMm: Record<keyof EdgeThickness, number>,
  minPx: number,
  maxMm: number
): CadMetrics['slidingSash'] => {
  const slidingSash: CadMetrics['slidingSash'] = {};
  const variants = input.sashConfig?.slidingVariants;
  if (!variants) return slidingSash;

  for (const role of SLIDING_ROLES) {
    const variant: SashVariantProfiles | undefined = variants[role];
    if (!variant) continue;
    const variantMm = {
      top: getProfileMm(input.availableProfiles, variant.topProfileId),
      left: getProfileMm(input.availableProfiles, variant.leftProfileId),
      right: getProfileMm(input.availableProfiles, variant.rightProfileId),
      bottom: getProfileMm(input.availableProfiles, variant.bottomProfileId),
    };
    if (Object.values(variantMm).every((mm) => mm === undefined)) continue;
    slidingSash[role] = toEdgeThickness(
      {
        top: variantMm.top ?? baseEdgeMm.top,
        left: variantMm.left ?? baseEdgeMm.left,
        right: variantMm.right ?? baseEdgeMm.right,
        bottom: variantMm.bottom ?? baseEdgeMm.bottom,
      },
      input.scale,
      minPx,
      maxMm
    );
  }
  return slidingSash;
};

/**
 * Tính toàn bộ số đo thực của bản vẽ (px = mm × scale, số thực, KHÔNG kẹp tối thiểu / KHÔNG làm tròn).
 * Mỗi cạnh khung bao / khung cánh lấy độ dày từ đúng profile của cạnh đó.
 */
export const computeCadMetrics = (input: CadMetricsInput): CadMetrics => {
  const { scale, frameShape, frameConfig, sashConfig, availableProfiles } = input;
  const isCurvedShape = frameShape !== 'rect';
  const minPx = input.isThumbnail ? CAD_CONFIG.THUMBNAIL_MIN_PX : 0;
  const pxOf = (mm: number): number => Math.max(minPx, mm * scale);

  // 1. Khung bao: từng cạnh theo profile của cạnh
  const frameEdgeMm = resolveEdgeMm(
    {
      top: getProfileMm(availableProfiles, frameConfig?.topEdge?.profileId),
      left: getProfileMm(availableProfiles, frameConfig?.leftEdge?.profileId),
      right: getProfileMm(availableProfiles, frameConfig?.rightEdge?.profileId),
      bottom: getProfileMm(availableProfiles, frameConfig?.bottomEdge?.profileId),
    },
    CAD_CONFIG.FRAME.DEFAULT_MM
  );
  const frame = toEdgeThickness(frameEdgeMm, scale, minPx, isCurvedShape ? MAX_CURVED_FRAME_MM : undefined);

  // 2. Khung cánh: từng cạnh theo profile cánh (hệ Slim dùng profile vỏ cúc cho cả 4 cạnh)
  const isSlim = sashConfig?.sashStyle === 'slim';
  const voCucMm = isSlim ? getProfileMm(availableProfiles, sashConfig?.voCucProfileId) : undefined;
  const sashEdgeMm = resolveEdgeMm(
    {
      top: voCucMm ?? getProfileMm(availableProfiles, sashConfig?.topProfileId),
      left: voCucMm ?? getProfileMm(availableProfiles, sashConfig?.leftProfileId),
      right: voCucMm ?? getProfileMm(availableProfiles, sashConfig?.rightProfileId),
      bottom: voCucMm ?? getProfileMm(availableProfiles, sashConfig?.bottomProfileId),
    },
    getDefaultSashMm(isSlim, input.doorHeightMm)
  );
  const sashMaxMm = isCurvedShape ? MAX_CURVED_SASH_MM : undefined;
  const sash = toEdgeThickness(sashEdgeMm, scale, minPx, sashMaxMm);
  const slidingSash = resolveSlidingSashMetrics(input, sashEdgeMm, minPx, sashMaxMm ?? Number.POSITIVE_INFINITY);

  // 3. Nẹp kính
  const beadMm =
    getProfileMm(availableProfiles, sashConfig?.beadProfileId ?? frameConfig?.beadProfileId) ??
    (isSlim ? CAD_CONFIG.BEAD.SLIM_DEFAULT_MM : CAD_CONFIG.BEAD.DEFAULT_MM);

  // 4. Đố tĩnh (dọc / ngang riêng) và đố cánh / đố động
  const isMullionSeparate = frameConfig?.mullionMode === 'separate';
  const vertMullionProfileId = isMullionSeparate
    ? frameConfig?.mullionVertProfileId || frameConfig?.mullionProfileId
    : frameConfig?.mullionProfileId;
  const horizMullionProfileId = isMullionSeparate
    ? frameConfig?.mullionHorizProfileId || frameConfig?.mullionProfileId
    : frameConfig?.mullionProfileId;
  const vertMullionMm = getProfileMm(availableProfiles, vertMullionProfileId) ?? CAD_CONFIG.MULLION.DEFAULT_MM;
  const horizMullionMm = getProfileMm(availableProfiles, horizMullionProfileId) ?? CAD_CONFIG.MULLION.DEFAULT_MM;
  const sashMullionMm =
    getProfileMm(availableProfiles, sashConfig?.mullionProfileId) ?? Math.max(vertMullionMm, horizMullionMm);
  const astragalMm =
    getProfileMm(availableProfiles, sashConfig?.dynamicMullionProfileId) ?? CAD_CONFIG.MULLION.ASTRAGAL_DEFAULT_MM;

  // 5. Đảo khung
  const reversalMm = getProfileMm(availableProfiles, frameConfig?.reversalProfileId) ?? CAD_CONFIG.REVERSAL.DEFAULT_MM;
  const reversalMode: CadReversalMode =
    frameConfig?.reversalMode ?? (frameConfig?.isReversedWall ? 'wall' : frameConfig?.isReversedSash ? 'sash' : 'none');

  // 6. Độ ngậm cánh lùa: cấu hình mm, mặc định bằng bản rộng đứng của cánh
  const overlapMm =
    sashConfig?.slidingOverlapMm && sashConfig.slidingOverlapMm > 0 ? sashConfig.slidingOverlapMm : sashEdgeMm.left;

  return {
    scale,
    frame,
    sash,
    slidingSash,
    bead: pxOf(beadMm),
    reversal: pxOf(reversalMm),
    reversalMode,
    vertMullion: pxOf(vertMullionMm),
    horizMullion: pxOf(horizMullionMm),
    sashMullion: pxOf(sashMullionMm),
    astragal: pxOf(astragalMm),
    slidingOverlap: pxOf(overlapMm),
  };
};
