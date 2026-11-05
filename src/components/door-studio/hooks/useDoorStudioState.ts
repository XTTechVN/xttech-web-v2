/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Door, DoorCreate, DoorUpdate, DoorCalculateResponse, SelectedAccessoryItem, normalizeDoorType } from '@/types';
import { calculateDoor, createDoor, updateDoor, getDoorSeriesList, getProfileBars, getAccessoryCombos, getAccessories, getGlasses, getBrandColors, getBrands, } from '@/actions';
import { FrameShape, SashOpenType, SceneCellNode, StudioMainTab, FrameConfig, SashConfig, FrameCornerJoint, SashCornerJoint, BeadCornerJoint, SlidingSashRole, SashOffsetScope, SashOffsetValues, SashVariantProfiles, DoorCustomExtraItem, DoorSystemFamily, DEFAULT_FRAME_CONFIG, DEFAULT_SASH_CONFIG, MullionInfo, MullionCutType, ColorSwatch, ALUMINUM_PALETTE, GlassGrilleConfig, } from '../studio-types';
import { ResizeSplitParams } from '../cad-engine/door-cad-renderer';
import { updateNode, findNode, findParentNode, createDefaultRootCell, rescaleTree, ensureRootCellDimensions, createSplitChildren, applySashTypeToCluster, resizeCellInParent, isInsideSash, } from '../utils/door-tree-utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import toast from 'react-hot-toast';
import { showErrorToast } from '@/utils';

function pickNumber(sources: Array<Record<string, unknown> | undefined>, keys: string[], fallback: number): number {
  for (const src of sources) {
    if (!src) continue;
    for (const key of keys) {
      const val = src[key];
      if (val !== undefined && val !== null && val !== '') {
        const num = Number(val);
        if (!Number.isNaN(num)) return num;
      }
    }
  }
  return fallback;
}

function pickString(sources: Array<Record<string, unknown> | undefined>, keys: string[], fallback: string): string {
  for (const src of sources) {
    if (!src) continue;
    for (const key of keys) {
      const val = src[key];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        return String(val).trim();
      }
    }
  }
  return fallback;
}

function pickBool(sources: Array<Record<string, unknown> | undefined>, keys: string[], fallback: boolean): boolean {
  for (const src of sources) {
    if (!src) continue;
    for (const key of keys) {
      const val = src[key];
      if (val !== undefined && val !== null) {
        return Boolean(val);
      }
    }
  }
  return fallback;
}

function parseProfileId(val: unknown): number | undefined {
  if (val === undefined || val !== null && val === '') return undefined;
  if (val === null) return undefined;
  const s = String(val).trim();
  if (!s) return undefined;
  const head = s.split('_')[0];
  const n = Number(head);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

const LEGACY_FAMILY_MAP: Record<string, DoorSystemFamily> = {
  'cua-di': 'Cửa đi mở quay',
  'cua-so': 'Cửa sổ mở quay/Hất',
  'cua-di-lua': 'Cửa đi lùa',
  'cua-so-lua': 'Cửa sổ lùa',
  'gap-xep': 'Cửa xếp trượt',
  'xep-truot': 'Cửa xếp trượt',
  'truot-quay': 'Cửa trượt quay',
  'cua-truot-quay': 'Cửa trượt quay',
};

const LEGACY_CORNER_JOINT_MAP: Record<string, string> = {
  '45': '45',
  '45-do': '45',
  '45-di': '45',
  '45_all': '45',
  '45-90': '45_top_90_bot',
  '45_top_90_bot': '45_top_90_bot',
  '90-di': '90_vert',
  '90-dung': '90_vert',
  '90_vert': '90_vert',
  '90': '90_vert',
  '90-do': '90_horiz',
  '90-so': '90_horiz',
  '90-ngang': '90_horiz',
  '90_horiz': '90_horiz',
  '63': '63',
  'd-trai': 'd_left',
  'd_left': 'd_left',
  'd-phai': 'd_right',
  'd_right': 'd_right',
};

function normalizeCornerJoint(val: unknown, fallback: string): string {
  const s = String(val || '').trim().toLowerCase();
  if (!s) return fallback;
  if (LEGACY_CORNER_JOINT_MAP[s]) {
    return LEGACY_CORNER_JOINT_MAP[s];
  }
  if (s.includes('d_left') || s.includes('d-trai')) return 'd_left';
  if (s.includes('d_right') || s.includes('d-phai')) return 'd_right';
  if (s.includes('45') && s.includes('90')) return '45_top_90_bot';
  if (s.includes('63')) return '63';
  if (s.includes('90')) {
    if (s.includes('ngang') || s.includes('horiz') || s.includes('90-so') || s.includes('90-do')) return '90_horiz';
    return '90_vert';
  }
  if (s.includes('45')) return '45';
  return fallback;
}

function normalizeSashFamily(rawFamily: unknown, doorType?: string | null): DoorSystemFamily {
  const f = String(rawFamily || '').trim();
  if (
    f === 'Cửa sổ mở quay/Hất' ||
    f === 'Cửa đi mở quay' ||
    f === 'Cửa đi lùa' ||
    f === 'Cửa sổ lùa' ||
    f === 'Cửa xếp trượt' ||
    f === 'Cửa trượt quay'
  ) {
    return f;
  }
  const fl = f.toLowerCase();
  if (LEGACY_FAMILY_MAP[fl]) {
    return LEGACY_FAMILY_MAP[fl];
  }
  const dt = (doorType || '').toLowerCase();
  if (
    fl.includes('trượt quay') ||
    fl.includes('truot quay') ||
    fl.includes('truot-quay') ||
    dt === 'sliding_casement_door' ||
    dt === 'truot_quay'
  ) {
    return 'Cửa trượt quay';
  }
  if (fl === 'cửa trượt lùa') {
    return dt === 'cs' || dt.includes('so') ? 'Cửa sổ lùa' : 'Cửa đi lùa';
  }
  if (
    fl.includes('xếp trượt') ||
    fl.includes('xep truot') ||
    fl.includes('gấp xếp') ||
    fl.includes('gap-xep') ||
    dt.includes('folding') ||
    dt === 'gap_xep'
  ) {
    return 'Cửa xếp trượt';
  }
  if (
    fl.includes('lùa') ||
    fl.includes('trượt') ||
    fl.includes('lua') ||
    dt.includes('sliding') ||
    dt === 'cl' ||
    dt === 'di_lua' ||
    dt === 'so_lua'
  ) {
    if (fl.includes('sổ') || fl.includes('so') || dt === 'cs' || dt.includes('so') || dt.includes('window')) {
      return 'Cửa sổ lùa';
    }
    return 'Cửa đi lùa';
  }
  if (
    fl.includes('cửa đi') ||
    fl.includes('cua di') ||
    fl === 'cua-di' ||
    dt === 'cd' ||
    dt === 'casement_door' ||
    dt === 'di_mo'
  ) {
    return 'Cửa đi mở quay';
  }
  return 'Cửa sổ mở quay/Hất';
}

function inferSashFamilyFromSashType(
  sashType: string,
  currentFamily: string,
  doorType: string
): string | null {
  const st = (sashType || '').trim().toLowerCase();
  if (!st || st === 'fixed') return null;

  if (st.startsWith('cua-di-truot-quay-') || st.startsWith('truot-quay-')) {
    return 'Cửa trượt quay';
  }
  if (st.startsWith('di-lua-')) {
    return 'Cửa đi lùa';
  }
  if (st.startsWith('so-lua-')) {
    return 'Cửa sổ lùa';
  }
  if (st.startsWith('cua-gap-xep-')) {
    return 'Cửa xếp trượt';
  }
  if (st.startsWith('cua-di-')) {
    return 'Cửa đi mở quay';
  }
  if (st.startsWith('so-')) {
    return 'Cửa sổ mở quay/Hất';
  }

  // Các mã kiểu mở đơn lẻ (từ CellInspector hoặc node lá)
  if (
    st === 'awning' ||
    st === 'tilt' ||
    st === 'tilt_turn' ||
    st === 'tilt_down' ||
    st === 'mo-hat' ||
    st === 'mo-lat' ||
    st.includes('mo-hat')
  ) {
    return 'Cửa sổ mở quay/Hất';
  }

  if (
    st === 'sliding' ||
    st === 'lua-trai' ||
    st === 'lua-phai' ||
    st === '2-chieu' ||
    st === '1-chieu'
  ) {
    if (currentFamily === 'Cửa đi lùa' || currentFamily === 'Cửa sổ lùa') {
      return currentFamily;
    }
    const dt = (doorType || '').toLowerCase();
    if (dt === 'cs' || dt.includes('window') || currentFamily === 'Cửa sổ mở quay/Hất') {
      return 'Cửa sổ lùa';
    }
    return 'Cửa đi lùa';
  }

  if (
    st === 'swing_left' ||
    st === 'swing_right' ||
    st === 'swing_double' ||
    st.startsWith('le-trai') ||
    st.startsWith('le-phai')
  ) {
    if (currentFamily === 'Cửa đi mở quay' || currentFamily === 'Cửa sổ mở quay/Hất') {
      return currentFamily;
    }
    const dt = (doorType || '').toLowerCase();
    if (
      dt === 'cd' ||
      dt.includes('door') ||
      currentFamily === 'Cửa đi lùa' ||
      currentFamily === 'Cửa xếp trượt'
    ) {
      return 'Cửa đi mở quay';
    }
    return 'Cửa sổ mở quay/Hất';
  }

  return null;
}

function mapRawExtraItem(raw: unknown, idx: number, target: 'frame' | 'sash'): DoorCustomExtraItem {
  const r = (raw || {}) as Record<string, unknown>;
  const rawPid = pickString([r], ['profileId', 'profile'], '');
  return {
    id: pickString([r], ['id'], `extra_${target}_${idx}`),
    profileId: parseProfileId(rawPid),
    profileCode: r.profileCode ? String(r.profileCode) : undefined,
    profileName: r.profileName ? String(r.profileName) : undefined,
    note: pickString([r], ['note'], ''),
    formulaLen: pickString([r], ['formulaLen', 'formula_len'], target === 'frame' ? 'W' : 'Ws'),
    angle1: pickNumber([r], ['angle1'], 90),
    angle2: pickNumber([r], ['angle2'], 90),
    qty: Math.max(1, pickNumber([r], ['qty'], 1)),
    fixedQty: pickBool([r], ['fixedQty', 'fixed_qty'], target === 'frame'),
    target,
  };
}

function isValidRawExtraItem(raw: unknown): boolean {
  const r = (raw || {}) as Record<string, unknown>;
  const pid = parseProfileId(r.profileId ?? r.profile);
  const code = String(r.profileCode || '').trim();
  return pid !== undefined || Boolean(code);
}

function normalizeExtrasList(
  explicitExtras: unknown,
  legacyExtras: unknown,
  target: 'frame' | 'sash'
): DoorCustomExtraItem[] {
  if (Array.isArray(explicitExtras) && explicitExtras.length > 0) {
    const validExplicit = explicitExtras.filter(isValidRawExtraItem);
    if (validExplicit.length > 0) {
      return validExplicit.map((item, idx) => mapRawExtraItem(item, idx, target));
    }
  }
  if (Array.isArray(legacyExtras) && legacyExtras.length > 0) {
    return legacyExtras
      .filter((item) => {
        const r = (item || {}) as Record<string, unknown>;
        return (r.target || 'frame') === target && isValidRawExtraItem(item);
      })
      .map((item, idx) => mapRawExtraItem(item, idx, target));
  }
  return [];
}

function parseVariantEntry(raw: unknown, fallbackLeft?: number): SashVariantProfiles {
  if (typeof raw === 'number' || typeof raw === 'string') {
    const pid = parseProfileId(raw) ?? fallbackLeft;
    return {
      leftProfileId: pid,
      topProfileId: undefined,
      rightProfileId: undefined,
      bottomProfileId: undefined,
    };
  }
  if (raw && typeof raw === 'object') {
    const d = raw as Record<string, unknown>;
    const leftId = parseProfileId(pickString([d], ['leftProfileId', '1', 'left'], '')) ?? fallbackLeft;
    const topId = parseProfileId(pickString([d], ['topProfileId', '2', 'top'], ''));
    const rightId = parseProfileId(pickString([d], ['rightProfileId', '3', 'right'], ''));
    const bottomId = parseProfileId(pickString([d], ['bottomProfileId', '4', 'bot', 'bottom'], ''));
    return {
      leftProfileId: leftId,
      topProfileId: topId && topId !== leftId ? topId : undefined,
      rightProfileId: rightId && rightId !== leftId ? rightId : undefined,
      bottomProfileId: bottomId && bottomId !== (topId || leftId) ? bottomId : undefined,
    };
  }
  return { leftProfileId: fallbackLeft };
}

function normalizeInitialFrameConfig(sc: Record<string, unknown>): FrameConfig {
  const rawFc = (sc.frameConfig || {}) as Record<string, unknown>;
  const rawLegacyFrame = (sc.frame || {}) as Record<string, unknown>;
  const rawLegacyMullion = (sc.mullion || {}) as Record<string, unknown>;
  const leftEdgeSrc = (rawFc.leftEdge || {}) as Record<string, unknown>;
  const topEdgeSrc = (rawFc.topEdge || {}) as Record<string, unknown>;
  const rightEdgeSrc = (rawFc.rightEdge || {}) as Record<string, unknown>;
  const bottomEdgeSrc = (rawFc.bottomEdge || {}) as Record<string, unknown>;
  const archSrc = (rawFc.archConfig || {}) as Record<string, unknown>;

  const isLegacyOpenBottom =
    String(rawLegacyFrame?.type || '').trim() === '3' && !rawLegacyFrame?.bot;
  const isOpenBottom = isLegacyOpenBottom
    ? true
    : pickBool(
        [rawFc, rawLegacyFrame],
        ['isOpenBottom', 'open_bottom'],
        DEFAULT_FRAME_CONFIG.isOpenBottom
      );

  const legacyFrameJointKey = String(rawLegacyFrame?.joint || '').trim();
  const cornerJoint = (
    (legacyFrameJointKey && LEGACY_CORNER_JOINT_MAP[legacyFrameJointKey]) ||
    normalizeCornerJoint(
      pickString([rawFc, rawLegacyFrame], ['cornerJoint', 'joint'], ''),
      DEFAULT_FRAME_CONFIG.cornerJoint
    )
  ) as FrameCornerJoint;

  const beadCornerJoint = normalizeCornerJoint(
    pickString([rawFc, rawLegacyFrame, sc], ['beadCornerJoint', 'beadJoint', 'bead_joint'], ''),
    DEFAULT_FRAME_CONFIG.beadCornerJoint
  ) as BeadCornerJoint;

  const leftPid = parseProfileId(leftEdgeSrc.profileId) ?? parseProfileId(rawLegacyFrame.left);
  const topPid = parseProfileId(topEdgeSrc.profileId) ?? parseProfileId(rawLegacyFrame.top) ?? leftPid;
  const rightPid = parseProfileId(rightEdgeSrc.profileId) ?? parseProfileId(rawLegacyFrame.right) ?? leftPid;
  const bottomPid =
    parseProfileId(bottomEdgeSrc.profileId) ??
    parseProfileId(rawLegacyFrame.bot ?? rawLegacyFrame.bottom) ??
    leftPid;

  const rawMullionMode = pickString([rawFc, rawLegacyMullion, rawLegacyFrame], ['mullionMode', 'type', 'mullion_mode'], '');
  const rawMullionPid = parseProfileId(
    rawFc.mullionProfileId ?? rawLegacyMullion.profile ?? rawLegacyMullion.vertical ?? rawLegacyFrame.mullion
  );
  const mullionMode: FrameConfig['mullionMode'] =
    rawMullionMode === 'separate'
      ? 'separate'
      : rawMullionMode === 'single' || rawMullionMode === 'shared' || (rawMullionMode !== 'none' && rawMullionPid !== undefined)
        ? 'single'
        : rawMullionMode === 'none'
          ? 'none'
          : DEFAULT_FRAME_CONFIG.mullionMode;

  const mullionPid = mullionMode === 'none' ? undefined : rawMullionPid;
  const mullionVertPid =
    mullionMode === 'separate'
      ? parseProfileId(rawFc.mullionVertProfileId ?? rawLegacyMullion.vertical ?? rawLegacyMullion.profile)
      : undefined;
  const mullionHorizPid =
    mullionMode === 'separate'
      ? parseProfileId(rawFc.mullionHorizProfileId ?? rawLegacyMullion.horizontal ?? rawLegacyMullion.profile)
      : undefined;

  const beadPid = parseProfileId(rawFc.beadProfileId ?? rawLegacyFrame.bead ?? sc.bead);

  return {
    ...DEFAULT_FRAME_CONFIG,
    ...(rawFc as Partial<FrameConfig>),
    isOpenBottom,
    cornerJoint,
    beadCornerJoint,
    mullionMode,
    mullionProfileId: mullionPid,
    mullionVertProfileId: mullionVertPid ?? (rawFc.mullionVertProfileId as number | undefined),
    mullionHorizProfileId: mullionHorizPid ?? (rawFc.mullionHorizProfileId as number | undefined),
    beadProfileId: beadPid,
    leftEdge: {
      ...DEFAULT_FRAME_CONFIG.leftEdge,
      ...(leftEdgeSrc as Partial<FrameConfig['leftEdge']>),
      profileId: leftPid,
      offsetMm: pickNumber([leftEdgeSrc, rawLegacyFrame], ['offsetMm', 'offset_left'], 0),
    },
    topEdge: {
      ...DEFAULT_FRAME_CONFIG.topEdge,
      ...(topEdgeSrc as Partial<FrameConfig['topEdge']>),
      profileId: topPid,
      offsetMm: pickNumber([topEdgeSrc, rawLegacyFrame], ['offsetMm', 'offset_top'], 0),
    },
    rightEdge: {
      ...DEFAULT_FRAME_CONFIG.rightEdge,
      ...(rightEdgeSrc as Partial<FrameConfig['rightEdge']>),
      profileId: rightPid,
      offsetMm: pickNumber([rightEdgeSrc, rawLegacyFrame], ['offsetMm', 'offset_right'], 0),
    },
    bottomEdge: {
      ...DEFAULT_FRAME_CONFIG.bottomEdge,
      ...(bottomEdgeSrc as Partial<FrameConfig['bottomEdge']>),
      profileId: bottomPid,
      offsetMm: pickNumber([bottomEdgeSrc, rawLegacyFrame], ['offsetMm', 'offset_bot', 'offset_bottom'], 0),
    },
    archConfig: {
      ...(DEFAULT_FRAME_CONFIG.archConfig || { isCutAtApex: false, bendingClampingMm: 250 }),
      ...(archSrc as Partial<NonNullable<FrameConfig['archConfig']>>),
    },
    extras: normalizeExtrasList(rawFc.extras, sc.extras ?? sc.customAccessories, 'frame'),
  };
}

function normalizeInitialSashConfig(sc: Record<string, unknown>, doorType?: string | null): SashConfig {
  const rawSc = (sc.sashConfig || {}) as Record<string, unknown>;
  const rawLegacySash = (sc.sash || {}) as Record<string, unknown>;
  const rawOffset = (rawSc.offsetMm || {}) as Record<string, unknown>;

  const legacyFamilyKey = String(rawLegacySash?.family || '').trim().toLowerCase();
  const family =
    (legacyFamilyKey && LEGACY_FAMILY_MAP[legacyFamilyKey]) ||
    normalizeSashFamily(pickString([rawSc, rawLegacySash], ['family'], ''), doorType);

  const ngamNgangMm = pickNumber(
    [rawSc, rawLegacySash],
    ['ngamNgangMm', 'doNgamNgang', 'do_ngam_ngang'],
    DEFAULT_SASH_CONFIG.ngamNgangMm
  );
  const ngamDocMm = pickNumber(
    [rawSc, rawLegacySash],
    ['ngamDocMm', 'doNgamDoc', 'do_ngam_doc'],
    DEFAULT_SASH_CONFIG.ngamDocMm
  );
  const truDoDongMm = pickNumber(
    [rawSc, rawLegacySash],
    ['truDoDongMm', 'opDodong', 'op_dodong', 'deductOpNoi', 'deduct_op_noi'],
    DEFAULT_SASH_CONFIG.truDoDongMm
  );
  const hoNenMm = pickNumber(
    [rawSc, rawLegacySash],
    ['hoNenMm', 'hoCanh', 'ho_canh'],
    DEFAULT_SASH_CONFIG.hoNenMm
  );
  const rawHoLeVal = pickNumber(
    [rawLegacySash, rawSc],
    ['ho_le', 'hoLeMm'],
    family === 'Cửa xếp trượt' ? 13 : Number.NaN
  );
  const hoLeMm = Number.isFinite(rawHoLeVal) ? rawHoLeVal : undefined;

  const rawJointsMap = (rawLegacySash.joints || {}) as Record<string, unknown>;
  const rawSlidingJoints = (rawSc.slidingJoints || {}) as Record<string, unknown>;

  const legacySashJointKey = String(rawLegacySash?.joint || '').trim();
  const cornerJoint = (
    (legacySashJointKey && LEGACY_CORNER_JOINT_MAP[legacySashJointKey]) ||
    normalizeCornerJoint(
      pickString([rawSc, rawLegacySash, rawJointsMap], ['cornerJoint', 'joint', 'lua-trai'], ''),
      DEFAULT_SASH_CONFIG.cornerJoint
    )
  ) as SashCornerJoint;

  const slidingJoints = {
    leftSliding: normalizeCornerJoint(
      pickString([rawSlidingJoints, rawJointsMap], ['leftSliding', 'lua-trai'], cornerJoint),
      cornerJoint
    ) as SashCornerJoint,
    rightSliding: normalizeCornerJoint(
      pickString([rawSlidingJoints, rawJointsMap], ['rightSliding', 'lua-phai'], cornerJoint),
      cornerJoint
    ) as SashCornerJoint,
    centerSliding: normalizeCornerJoint(
      pickString([rawSlidingJoints, rawJointsMap], ['centerSliding', '2-chieu'], cornerJoint),
      cornerJoint
    ) as SashCornerJoint,
  };

  const beadCornerJoint = normalizeCornerJoint(
    pickString([rawSc, rawLegacySash, sc], ['beadCornerJoint', 'beadJoint', 'bead_joint'], ''),
    DEFAULT_SASH_CONFIG.beadCornerJoint
  ) as BeadCornerJoint;

  const baseOffset: SashOffsetValues = {
    left: pickNumber([rawOffset, rawLegacySash], ['left', 'offset_left'], 0),
    top: pickNumber([rawOffset, rawLegacySash], ['top', 'offset_top'], 0),
    right: pickNumber([rawOffset, rawLegacySash], ['right', 'offset_right'], 0),
    bottom: pickNumber([rawOffset, rawLegacySash], ['bottom', 'offset_bot', 'offset_bottom'], 0),
  };

  const rawOffsetApply = pickString([rawSc, rawLegacySash], ['offsetApplyTo', 'offset_apply_to'], 'all');
  const offsetApplyTo: SashOffsetScope =
    rawOffsetApply === 'left_sliding' || rawOffsetApply === 'right_sliding' || rawOffsetApply === 'center_sliding'
      ? rawOffsetApply
      : 'all';

  const rawSlidingOffsets = (rawSc.slidingOffsets || {}) as Record<string, Record<string, unknown>>;
  const zeroOffset: SashOffsetValues = { left: 0, top: 0, right: 0, bottom: 0 };
  const slidingOffsets: Partial<Record<SashOffsetScope, SashOffsetValues>> = {
    all: rawSlidingOffsets.all
      ? {
          left: pickNumber([rawSlidingOffsets.all], ['left'], 0),
          top: pickNumber([rawSlidingOffsets.all], ['top'], 0),
          right: pickNumber([rawSlidingOffsets.all], ['right'], 0),
          bottom: pickNumber([rawSlidingOffsets.all], ['bottom'], 0),
        }
      : offsetApplyTo === 'all'
      ? baseOffset
      : zeroOffset,
    left_sliding: rawSlidingOffsets.left_sliding
      ? {
          left: pickNumber([rawSlidingOffsets.left_sliding], ['left'], 0),
          top: pickNumber([rawSlidingOffsets.left_sliding], ['top'], 0),
          right: pickNumber([rawSlidingOffsets.left_sliding], ['right'], 0),
          bottom: pickNumber([rawSlidingOffsets.left_sliding], ['bottom'], 0),
        }
      : offsetApplyTo === 'left_sliding'
      ? baseOffset
      : zeroOffset,
    right_sliding: rawSlidingOffsets.right_sliding
      ? {
          left: pickNumber([rawSlidingOffsets.right_sliding], ['left'], 0),
          top: pickNumber([rawSlidingOffsets.right_sliding], ['top'], 0),
          right: pickNumber([rawSlidingOffsets.right_sliding], ['right'], 0),
          bottom: pickNumber([rawSlidingOffsets.right_sliding], ['bottom'], 0),
        }
      : offsetApplyTo === 'right_sliding'
      ? baseOffset
      : zeroOffset,
    center_sliding: rawSlidingOffsets.center_sliding
      ? {
          left: pickNumber([rawSlidingOffsets.center_sliding], ['left'], 0),
          top: pickNumber([rawSlidingOffsets.center_sliding], ['top'], 0),
          right: pickNumber([rawSlidingOffsets.center_sliding], ['right'], 0),
          bottom: pickNumber([rawSlidingOffsets.center_sliding], ['bottom'], 0),
        }
      : offsetApplyTo === 'center_sliding'
      ? baseOffset
      : zeroOffset,
  };

  const rawLegacyProfile = (rawLegacySash.profile || {}) as Record<string, unknown>;
  const rawLegacyVariants = (rawLegacyProfile.variants || {}) as Record<string, unknown>;
  const rawVariants =
    Object.keys(rawLegacyVariants).length > 0
      ? rawLegacyVariants
      : (rawSc.rawVariants as Record<string, unknown> | undefined);
  const swingVariantBranch = ((rawVariants && (rawVariants['mo-ra'] || rawVariants['mo-vao'])) ||
    undefined) as Record<string, unknown> | undefined;
  const swingProfileId =
    swingVariantBranch && typeof swingVariantBranch === 'object'
      ? parseProfileId(swingVariantBranch['1'])
      : undefined;
  const swingTopProfileId =
    swingVariantBranch && typeof swingVariantBranch === 'object'
      ? parseProfileId(swingVariantBranch['2'])
      : undefined;
  const swingRightProfileId =
    swingVariantBranch && typeof swingVariantBranch === 'object'
      ? parseProfileId(swingVariantBranch['3'])
      : undefined;
  const swingBottomRailId =
    swingVariantBranch && typeof swingVariantBranch === 'object'
      ? parseProfileId(swingVariantBranch['4'])
      : undefined;

  const rawSlidingVariants = (rawSc.slidingVariants || {}) as Record<string, unknown>;
  const fallbackLeftPid = parseProfileId(rawSc.leftProfileId ?? rawSc.profileId);

  const leftVariant = parseVariantEntry(
    rawSlidingVariants.left_sliding ?? rawLegacyVariants['lua-trai'],
    fallbackLeftPid
  );
  const rightVariant = parseVariantEntry(
    rawSlidingVariants.right_sliding ?? rawLegacyVariants['lua-phai'],
    leftVariant.leftProfileId ?? fallbackLeftPid
  );
  const centerVariant = parseVariantEntry(
    rawSlidingVariants.center_sliding ?? rawLegacyVariants['2-chieu'],
    leftVariant.leftProfileId ?? fallbackLeftPid
  );

  const rawDodongStr = pickString([rawLegacySash, rawSc], ['dodong', 'rawDodong'], '');
  const rawDodong = rawDodongStr.includes('_comp_') ? rawDodongStr : undefined;
  const dynamicMullionProfileId =
    (rawDodongStr.includes('_comp_') ? parseProfileId(rawDodongStr.split('_comp_')[0]) : undefined) ??
    parseProfileId(pickString([rawSc, rawLegacySash], ['dynamicMullionProfileId', 'dodong', 'do_dong'], ''));

  const opNoiProfileId = parseProfileId(pickString([rawSc, rawLegacySash], ['opNoiProfileId', 'op_noi'], ''));
  const interlockProfileId = parseProfileId(pickString([rawSc, rawLegacySash], ['interlockProfileId', 'interlock'], ''));
  const isSlidingFamilyInit = family === 'Cửa đi lùa' || family === 'Cửa sổ lùa';
  const rawBeadStr =
    isSlidingFamilyInit && 'bead' in rawLegacySash && rawLegacySash.bead === null
      ? ''
      : pickString([rawSc, rawLegacySash], ['beadProfileId', 'bead'], '');
  const beadProfileId = parseProfileId(rawBeadStr);

  const effectiveLeftPid = fallbackLeftPid ?? swingProfileId ?? leftVariant.leftProfileId;
  const effectiveTopPid =
    parseProfileId(rawSc.topProfileId) ?? swingTopProfileId ?? leftVariant.topProfileId ?? effectiveLeftPid;
  const effectiveRightPid =
    parseProfileId(rawSc.rightProfileId) ?? swingRightProfileId ?? leftVariant.rightProfileId ?? effectiveLeftPid;
  const effectiveBottomPid =
    parseProfileId(rawSc.bottomProfileId) ??
    parseProfileId(rawSc.bottomRailProfileId) ??
    swingBottomRailId ??
    leftVariant.bottomProfileId ??
    effectiveTopPid ??
    effectiveLeftPid;
  const bottomRailProfileId =
    parseProfileId(rawSc.bottomRailProfileId) ?? swingBottomRailId ?? effectiveBottomPid;
  const rawEdges = (rawSc.edges || {}) as Record<string, unknown>;
  const rawBottomEdge = (rawEdges.bottom || {}) as Record<string, unknown>;
  const rawSashMode = pickString([rawSc, rawLegacySash], ['sashStyle', 'sash_mode', 'sashMode'], 'standard').toLowerCase();
  const sashStyle: 'standard' | 'slim' =
    rawSashMode === 'slim' || rawSashMode === 'vo-cuc' || rawSashMode === 'vo_cuc' ? 'slim' : 'standard';
  const voCucProfileId =
    parseProfileId(pickString([rawSc, rawLegacySash], ['voCucProfileId', 'vo_cuc_profile'], '')) ?? effectiveLeftPid;

  return {
    ...DEFAULT_SASH_CONFIG,
    ...(rawSc as Partial<SashConfig>),
    family,
    sashStyle,
    voCucProfileId,
    ngamNgangMm,
    ngamDocMm,
    truDoDongMm,
    hoNenMm,
    hoLeMm,
    cornerJoint,
    slidingJoints,
    beadCornerJoint,
    offsetApplyTo,
    offsetMm: slidingOffsets[offsetApplyTo] || baseOffset,
    slidingOffsets,
    profileId: effectiveLeftPid,
    leftProfileId: effectiveLeftPid,
    topProfileId: effectiveTopPid,
    rightProfileId: effectiveRightPid,
    bottomProfileId: effectiveBottomPid,
    bottomRailProfileId,
    edges: {
      ...rawEdges,
      bottom: {
        ...rawBottomEdge,
        profileId: bottomRailProfileId,
        enabled: Boolean(bottomRailProfileId && bottomRailProfileId !== effectiveLeftPid),
      },
    },
    slidingVariants: {
      left_sliding: leftVariant,
      right_sliding: rightVariant,
      center_sliding: centerVariant,
    },
    beadProfileId,
    dynamicMullionProfileId,
    opNoiProfileId,
    interlockProfileId,
    rawDodong,
    rawVariants,
    extras: normalizeExtrasList(rawSc.extras, sc.extras ?? sc.customAccessories, 'sash'),
  };
}

function syncLegacyDrawingMullionMeta(
  cell: SceneCellNode,
  drNode?: Record<string, unknown>
): SceneCellNode {
  if (!drNode || !Array.isArray(cell.children) || cell.children.length === 0) return cell;
  const isHoriz = cell.splitDirection === 'horizontal';
  const rawCuts = isHoriz
    ? Array.isArray(drNode.mullH_cut)
      ? drNode.mullH_cut
      : []
    : Array.isArray(drNode.mullV_cut)
      ? drNode.mullV_cut
      : [];
  const rawProfiles = isHoriz
    ? Array.isArray(drNode.mullH_profiles)
      ? drNode.mullH_profiles
      : []
    : Array.isArray(drNode.mullV_profiles)
      ? drNode.mullV_profiles
      : [];
  const drChildren = Array.isArray(drNode.children) ? drNode.children : [];

  const nextChildren = cell.children.map((ch, idx) => {
    let nextCh = ch;
    if (idx < (cell.children?.length || 0) - 1) {
      const cutObj = rawCuts[idx] as Record<string, unknown> | undefined;
      let inferredCut: MullionCutType | undefined;
      if (cutObj && typeof cutObj === 'object') {
        const s = isHoriz ? cutObj.left : cutObj.top;
        const e = isHoriz ? cutObj.right : cutObj.bot;
        if (s === 'cat' && e === 'cat') inferredCut = 'cut_both';
        else if (s === 'cat') inferredCut = 'cut_left';
        else if (e === 'cat') inferredCut = 'cut_right';
        else if (s === 'lot' && e === 'lot') inferredCut = 'inside_frame';
      }
      const rawProf = rawProfiles[idx] as Record<string, unknown> | string | number | undefined;
      const profId = parseProfileId(
        typeof rawProf === 'object' && rawProf !== null
          ? rawProf.id ?? rawProf.profileId
          : rawProf
      );
      if ((!nextCh.mullionCutType && inferredCut) || (!nextCh.mullionProfileId && profId)) {
        nextCh = {
          ...nextCh,
          mullionCutType: nextCh.mullionCutType ?? inferredCut,
          mullionProfileId: nextCh.mullionProfileId ?? profId,
        };
      }
    }
    if (drChildren[idx] && typeof drChildren[idx] === 'object') {
      nextCh = syncLegacyDrawingMullionMeta(nextCh, drChildren[idx] as Record<string, unknown>);
    }
    return nextCh;
  });
  return { ...cell, children: nextChildren };
}

interface UseDoorStudioStateProps {
  isOpen: boolean;
  onClose: () => void;
  door?: Door | null;
  defaultBrandId?: number | null;
  onSaveSuccess?: (savedDoor: Door) => void;
  onCustomSave?: (data: {
    name: string;
    code: string;
    type: string;
    doorSeriesId?: number | null;
    width: number;
    height: number;
    systemConfig: Record<string, any>;
    imageB64?: string;
  }) => Promise<void>;
}

export function useDoorStudioState({
  isOpen,
  onClose,
  door,
  defaultBrandId,
  onSaveSuccess,
  onCustomSave,
}: UseDoorStudioStateProps) {
  // Navigation Tabs
  const [activeMainTab, setActiveMainTab] = useState<StudioMainTab>('info');

  // Selected Brand State
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);

  // Basic Door State
  const [w, setW] = useState<number>(1400);
  const [h, setH] = useState<number>(1600);
  const [name, setName] = useState<string>('Vách kính cố định');
  const [code, setCode] = useState<string>('');
  const [type, setType] = useState<string>('ck');
  const [aluminumColor, setAluminumColor] = useState<string>('#955F20');
  const [hardwareColor, setHardwareColor] = useState<string>('#1E293B');
  const [frameShape, setFrameShape] = useState<FrameShape>('rect');
  const [seriesId, setSeriesId] = useState<number | undefined>(() => door?.doorSeriesId || (door?.systemConfig as any)?.seriesId || undefined);
  const prevSeriesIdRef = useRef<number | undefined>(undefined);
  const wasOpenRef = useRef<boolean>(false);
  const [selectedComboIds, setSelectedComboIds] = useState<number[]>([]);
  const [selectedAccessories, setSelectedAccessories] = useState<SelectedAccessoryItem[]>([]);

  // Flexible Configurations (Frame & Sash)
  const [frameConfig, setFrameConfig] = useState<FrameConfig>(() =>
    door
      ? normalizeInitialFrameConfig((door.systemConfig || {}) as Record<string, unknown>)
      : DEFAULT_FRAME_CONFIG
  );
  const [sashConfig, setSashConfig] = useState<SashConfig>(() =>
    door
      ? normalizeInitialSashConfig((door.systemConfig || {}) as Record<string, unknown>, door.type)
      : { ...DEFAULT_SASH_CONFIG, family: 'Cửa đi mở quay' }
  );

  // Drawing View State
  const [activeLeftTab, setActiveLeftTab] = useState<'frame' | 'sash'>('sash');
  const [currentSashType, setCurrentSashType] = useState<SashOpenType>('fixed');
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [selectedMullion, setSelectedMullion] = useState<MullionInfo | null>(null);
  const [isMullionModalOpen, setIsMullionModalOpen] = useState<boolean>(false);
  const [isGrilleModalOpen, setIsGrilleModalOpen] = useState<boolean>(false);
  const [grilleEditingCell, setGrilleEditingCell] = useState<SceneCellNode | null>(null);

  // Scene Graph Root: Mặc định là Vách kính cố định (fixed)
  const [rootCell, setRootCell] = useState<SceneCellNode>(() => createDefaultRootCell(1400, 1600));

  // Undo / Redo Stack
  const [history, setHistory] = useState<SceneCellNode[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [calcData, setCalcData] = useState<DoorCalculateResponse | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // Fetch Door Series
  const { data: seriesData } = useQuery({
    queryKey: ['door-series-list'],
    queryFn: () => getDoorSeriesList({ limit: 9999 }),
    enabled: isOpen,
  });
  const allAvailableSeries = useMemo(() => seriesData?.items || [], [seriesData]);

  // Fetch Brands (Lấy toàn bộ hãng đang hoạt động để tách hãng nhôm & hãng phụ kiện)
  const { data: brandsData } = useQuery({
    queryKey: ['brands-list', 'all'],
    queryFn: () => getBrands({ limit: 9999, isActive: true }),
    enabled: isOpen,
  });
  const availableBrands = useMemo(() => {
    const list = (brandsData?.items || []).filter(
      (b) => !b.brandType || b.brandType === 'aluminum' || b.brandType === 'both'
    );
    return [...list].sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }));
  }, [brandsData]);
  const availableAccessoryBrands = useMemo(() => {
    const list = (brandsData?.items || []).filter(
      (b) => b.brandType === 'accessory' || b.brandType === 'both'
    );
    return [...list].sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }));
  }, [brandsData]);

  const currentSeriesObj = useMemo(
    () => (seriesId ? allAvailableSeries.find((s) => s.id === seriesId) : undefined),
    [allAvailableSeries, seriesId]
  );

  const effectiveBrandId = useMemo(() => {
    return (
      selectedBrandId ||
      currentSeriesObj?.brandId ||
      door?.doorSeries?.brandId ||
      defaultBrandId ||
      availableBrands[0]?.id ||
      null
    );
  }, [selectedBrandId, currentSeriesObj, door?.doorSeries?.brandId, defaultBrandId, availableBrands]);

  const availableSeries = useMemo(() => {
    if (!effectiveBrandId) return allAvailableSeries;
    return allAvailableSeries.filter((s) => s.brandId === effectiveBrandId);
  }, [allAvailableSeries, effectiveBrandId]);

  const explicitSeriesId = useMemo(() => {
    if (seriesId && (allAvailableSeries.length === 0 || allAvailableSeries.some((s) => s.id === seriesId))) {
      return seriesId;
    }
    return undefined;
  }, [seriesId, allAvailableSeries]);

  const fallbackSeriesId = availableSeries[0]?.id || allAvailableSeries[0]?.id || seriesId || undefined;

  // Fetch Profile Bars (theo hãng nhôm / hệ nhôm đang chọn để hỗ trợ cả các thanh dùng chung trong hãng)
  const { data: profilesData } = useQuery({
    queryKey: ['profile-bars', effectiveBrandId, explicitSeriesId || fallbackSeriesId],
    queryFn: () =>
      getProfileBars({
        brandId: effectiveBrandId || undefined,
        seriesId: !effectiveBrandId ? (explicitSeriesId || fallbackSeriesId) : undefined,
        limit: 1000,
      }),
    enabled: isOpen && Boolean(effectiveBrandId || explicitSeriesId || fallbackSeriesId),
  });

  const effectiveSeriesId = useMemo(() => {
    if (explicitSeriesId) return explicitSeriesId;
    const leftPid = frameConfig.leftEdge?.profileId;
    if (leftPid && profilesData?.items?.length) {
      const matchedProf = profilesData.items.find((p) => p.id === leftPid);
      if (matchedProf?.seriesId) return matchedProf.seriesId;
    }
    return fallbackSeriesId;
  }, [explicitSeriesId, frameConfig.leftEdge?.profileId, profilesData, fallbackSeriesId]);

  const availableProfiles = useMemo(() => {
    const allItems = profilesData?.items || [];
    if (!effectiveSeriesId || allItems.length === 0) return allItems;

    const seriesItems = allItems.filter((p) => p.seriesId === effectiveSeriesId);
    if (seriesItems.length === 0) return allItems;

    const includedIds = new Set(seriesItems.map((p) => p.id));
    const result = [...seriesItems];

    // Bổ sung các nhóm thanh dùng chung của hãng nếu hệ nhôm con chưa khai báo riêng nhóm đó (không mượn TRACK của hệ lùa sang hệ mở quay)
    const requiredBarTypes = [
      'FRAME',
      'SASH',
      'SCREEN_SASH',
      'MULLION',
      'DYNAMIC_MULLION',
      'INTERLOCK',
      'SASH_JOINER',
      'BEAD',
      'COUPLING',
      'REVERSAL',
    ];
    const presentBarTypes = new Set(seriesItems.map((p) => (p.barType || '').toUpperCase()));

    for (const bt of requiredBarTypes) {
      if (!presentBarTypes.has(bt)) {
        for (const p of allItems) {
          if ((p.barType || '').toUpperCase() === bt && !includedIds.has(p.id)) {
            includedIds.add(p.id);
            result.push(p);
          }
        }
      }
    }

    // Luôn bổ sung các thanh phụ trợ / dùng chung của hãng (OTHER, INTERLOCK, SASH_JOINER, COUPLING, REVERSAL)
    // để hệ con (như RT134) luôn truy cập được ốp móc, ốp nối, ray inox, thanh bắt đa điểm dùng chung của hãng (như R-SP134-*, VI-001)
    const sharedAuxiliaryTypes = new Set(['OTHER', 'INTERLOCK', 'SASH_JOINER', 'COUPLING', 'REVERSAL']);
    for (const p of allItems) {
      const bt = (p.barType || '').toUpperCase();
      if (sharedAuxiliaryTypes.has(bt) && !includedIds.has(p.id)) {
        includedIds.add(p.id);
        result.push(p);
      }
    }

    return result;
  }, [profilesData, effectiveSeriesId]);

  const availableBeads = useMemo(() => {
    return availableProfiles.filter(
      (p) => p.barType?.toUpperCase() === 'BEAD' || (p as any).category === 'bead'
    );
  }, [availableProfiles]);

  // Fetch Accessory Combos (Đầy đủ toàn bộ combo từ CSDL)
  const { data: combosData } = useQuery({
    queryKey: ['accessory-combos-list'],
    queryFn: () => getAccessoryCombos({ limit: 500 }),
    enabled: isOpen,
  });
  const availableCombos = combosData?.items || [];

  // Fetch Individual Accessories
  const { data: accessoriesData } = useQuery({
    queryKey: ['accessories-list'],
    queryFn: () => getAccessories({ limit: 1000, isActive: true }),
    enabled: isOpen,
  });
  const availableAccessories = accessoriesData?.items || [];

  // Fetch Glasses (for CellInspector dropdown)
  const { data: glassesData } = useQuery({
    queryKey: ['glasses-list'],
    queryFn: () => getGlasses({ limit: 200, isActive: true }),
    enabled: isOpen,
  });
  const availableGlasses = useMemo(() => glassesData?.items || [], [glassesData]);

  const defaultGlass = useMemo(() => {
    return availableGlasses.find((g) => g.isDefault) || availableGlasses[0] || null;
  }, [availableGlasses]);

  // Lấy brandId đang active
  const brandId = effectiveBrandId;

  // Fetch danh sách màu thực tế của Hãng từ Database
  const { data: brandColorsData } = useQuery({
    queryKey: ['brand-colors', brandId],
    queryFn: () => getBrandColors({ brandId: brandId || undefined, limit: 100, isActive: true }),
    enabled: isOpen && !!brandId,
  });
  const availableBrandColors = useMemo(() => brandColorsData?.items || [], [brandColorsData]);

  // Bảng màu nhôm động
  const dynamicAluminumColors: ColorSwatch[] =
    availableBrandColors.length > 0
      ? availableBrandColors.map((bc) => ({
          code: bc.code,
          name: bc.name,
          colorHex: bc.colorHex,
        }))
      : ALUMINUM_PALETTE;

  // Tự động fallback màu khi người dùng đổi hệ nhôm trong Studio
  useEffect(() => {
    if (
      prevSeriesIdRef.current !== undefined &&
      seriesId !== undefined &&
      prevSeriesIdRef.current !== seriesId
    ) {
      prevSeriesIdRef.current = seriesId;
      if (availableBrandColors.length > 0) {
        const cleanCurrent = (aluminumColor || '').trim().toLowerCase();
        const exists = availableBrandColors.some(
          (c) => (c.colorHex || '').trim().toLowerCase() === cleanCurrent
        );
        if (!exists) {
          const defaultColor =
            availableBrandColors.find((c) => c.isDefault) || availableBrandColors[0];
          if (defaultColor) {
            setAluminumColor(defaultColor.colorHex.trim());
          }
        }
      }
    }
  }, [seriesId, availableBrandColors, aluminumColor]);

  // Tự động điền sẵn thanh khung bao và thanh cánh đầu tiên của Hệ nhôm vào các cạnh
  useEffect(() => {
    if (!availableProfiles || availableProfiles.length === 0) return;

    const isDedicatedBottomFrame = (p: { barType?: string; name?: string }) => {
      const bt = (p.barType || '').toUpperCase();
      if (bt !== 'FRAME' && bt !== 'TRACK') return false;
      const n = (p.name || '').toLowerCase();
      return n.includes('khung dưới') || n.includes('ngang dưới') || n.includes('ray dưới');
    };

    const defaultFrame =
      availableProfiles.find((p) => p.barType === 'FRAME' && !isDedicatedBottomFrame(p)) ||
      availableProfiles.find((p) => p.barType === 'FRAME');
    const dedicatedBottomFrame = availableProfiles.find(
      (p) =>
        isDedicatedBottomFrame(p) &&
        (!defaultFrame?.seriesId || p.seriesId === defaultFrame.seriesId)
    );
    const defaultBottomFrame = dedicatedBottomFrame || defaultFrame;
    const defaultSash = availableProfiles.find(
      (p) => p.barType === 'SASH' || p.barType === 'SCREEN_SASH'
    );
    const defaultBead = availableProfiles.find((p) => p.barType === 'BEAD');
    const defaultMullion = availableProfiles.find((p) => p.barType === 'MULLION');
    const defaultDynamicMullion = availableProfiles.find((p) => p.barType === 'DYNAMIC_MULLION');
    const defaultReversal = availableProfiles.find((p) => p.barType === 'REVERSAL');

    // 1. Tự động gán Khung bao mặc định nếu chưa chọn hoặc profile hiện tại không thuộc hệ này
    const isFrameValid =
      frameConfig.leftEdge?.profileId &&
      availableProfiles.some((p) => p.id === frameConfig.leftEdge?.profileId && p.barType === 'FRAME');

    if (!isFrameValid && defaultFrame) {
      setFrameConfig((prev) => {
        if (prev.leftEdge?.profileId === defaultFrame.id) return prev;
        const isBotValid =
          prev.bottomEdge?.profileId &&
          availableProfiles.some((p) => p.id === prev.bottomEdge?.profileId);
        const botProf = defaultBottomFrame || defaultFrame;
        return {
          ...prev,
          cornerJoint:
            dedicatedBottomFrame && prev.cornerJoint === '45'
              ? '45_top_90_bot'
              : prev.cornerJoint,
          leftEdge: { ...prev.leftEdge, profileId: defaultFrame.id, profileCode: defaultFrame.code },
          topEdge: { ...prev.topEdge, profileId: defaultFrame.id, profileCode: defaultFrame.code },
          rightEdge: { ...prev.rightEdge, profileId: defaultFrame.id, profileCode: defaultFrame.code },
          bottomEdge:
            prev.isOpenBottom || (isBotValid && prev.bottomEdge?.profileId !== prev.leftEdge?.profileId)
              ? prev.bottomEdge
              : { ...prev.bottomEdge, profileId: botProf.id, profileCode: botProf.code },
          beadProfileId:
            prev.beadProfileId && availableProfiles.some((p) => p.id === prev.beadProfileId)
              ? prev.beadProfileId
              : defaultBead?.id,
          mullionProfileId:
            prev.mullionProfileId && availableProfiles.some((p) => p.id === prev.mullionProfileId)
              ? prev.mullionProfileId
              : prev.mullionMode === 'none'
              ? undefined
              : defaultMullion?.id,
          mullionVertProfileId:
            prev.mullionVertProfileId && availableProfiles.some((p) => p.id === prev.mullionVertProfileId)
              ? prev.mullionVertProfileId
              : prev.mullionMode === 'none'
              ? undefined
              : defaultMullion?.id,
          mullionHorizProfileId:
            prev.mullionHorizProfileId && availableProfiles.some((p) => p.id === prev.mullionHorizProfileId)
              ? prev.mullionHorizProfileId
              : prev.mullionMode === 'none'
              ? undefined
              : defaultMullion?.id,
          reversalProfileId:
            prev.reversalProfileId && availableProfiles.some((p) => p.id === prev.reversalProfileId)
              ? prev.reversalProfileId
              : defaultReversal?.id,
          reversalProfileCode:
            prev.reversalProfileId && availableProfiles.some((p) => p.id === prev.reversalProfileId)
              ? prev.reversalProfileCode
              : defaultReversal?.code,
        };
      });
    } else if (
      isFrameValid &&
      defaultFrame &&
      dedicatedBottomFrame &&
      !frameConfig.isOpenBottom &&
      frameConfig.leftEdge?.profileId === defaultFrame.id &&
      frameConfig.bottomEdge?.profileId === defaultFrame.id &&
      (frameConfig.cornerJoint === '45_top_90_bot' || sashConfig.family.includes('lùa'))
    ) {
      setFrameConfig((prev) => ({
        ...prev,
        cornerJoint: prev.cornerJoint === '45' ? '45_top_90_bot' : prev.cornerJoint,
        bottomEdge: {
          ...prev.bottomEdge,
          profileId: dedicatedBottomFrame.id,
          profileCode: dedicatedBottomFrame.code,
        },
      }));
    }

    // 2. Tự động gán Cánh cửa mặc định nếu chưa chọn hoặc profile hiện tại không thuộc nhóm SASH của hệ này
    const defaultInterlock = availableProfiles.find(
      (p) =>
        p.barType === 'INTERLOCK' ||
        p.name.toLowerCase().includes('móc') ||
        p.name.toLowerCase().includes('interlock')
    );
    const defaultOpNoi = availableProfiles.find(
      (p) =>
        p.barType === 'SASH_JOINER' ||
        p.name.toLowerCase().includes('ốp nối') ||
        p.barType === 'DYNAMIC_MULLION'
    );

    if (defaultSash) {
      setSashConfig((prev) => {
        const isSashIdValid = (pid?: number) =>
          Boolean(
            pid &&
              availableProfiles.some(
                (p) => p.id === pid && (p.barType === 'SASH' || p.barType === 'SCREEN_SASH')
              )
          );
        const isAnyIdValid = (pid?: number) =>
          Boolean(pid && availableProfiles.some((p) => p.id === pid));

        const wasSashAlreadyValid = isSashIdValid(prev.leftProfileId);
        const nextLeftId = wasSashAlreadyValid ? prev.leftProfileId : defaultSash.id;
        const nextTopId = isSashIdValid(prev.topProfileId) ? prev.topProfileId : nextLeftId;
        const nextRightId = isSashIdValid(prev.rightProfileId) ? prev.rightProfileId : nextLeftId;
        const nextBottomId =
          isSashIdValid(prev.bottomProfileId) ||
          isAnyIdValid(prev.bottomProfileId) ||
          Boolean(prev.bottomRailProfileId && prev.bottomProfileId)
            ? prev.bottomProfileId
            : nextTopId;

        const sanitizeVariant = (v?: SashVariantProfiles): SashVariantProfiles => {
          const vLeft = isSashIdValid(v?.leftProfileId) ? v?.leftProfileId : nextLeftId;
          const vTop =
            isSashIdValid(v?.topProfileId) && v?.topProfileId !== vLeft
              ? v?.topProfileId
              : undefined;
          const vRight =
            isSashIdValid(v?.rightProfileId) && v?.rightProfileId !== vLeft
              ? v?.rightProfileId
              : undefined;
          const vBot =
            isSashIdValid(v?.bottomProfileId) && v?.bottomProfileId !== (vTop || vLeft)
              ? v?.bottomProfileId
              : undefined;
          return {
            leftProfileId: vLeft,
            topProfileId: vTop,
            rightProfileId: vRight,
            bottomProfileId: vBot,
          };
        };

        const nextLeftVar = sanitizeVariant(prev.slidingVariants?.left_sliding);
        const nextRightVar = sanitizeVariant(prev.slidingVariants?.right_sliding);
        const nextCenterVar = sanitizeVariant(prev.slidingVariants?.center_sliding);

        // Đố cánh (mullionProfileId): tôn trọng tuyệt đối lựa chọn "Không có" (undefined) của người dùng;
        // chỉ giữ lại nếu đang có ID hợp lệ trong hệ nhôm hiện tại.
        const nextMullionId = isAnyIdValid(prev.mullionProfileId)
          ? prev.mullionProfileId
          : undefined;

        // Các profile phụ khác: chỉ tự động điền mặc định khi khởi tạo mới / đổi hệ nhôm (!wasSashAlreadyValid);
        // nếu cửa đã thuộc hệ nhôm này thì giữ nguyên lựa chọn của người dùng (kể cả khi người dùng chọn bỏ trống).
        const resolveOptionalProfile = (currentId?: number, fallbackId?: number) => {
          if (isAnyIdValid(currentId)) return currentId;
          if (wasSashAlreadyValid) return undefined;
          return fallbackId;
        };

        const isSlidingFamilyNow =
          prev.family === 'Cửa đi lùa' || prev.family === 'Cửa sổ lùa';
        const nextBeadId = resolveOptionalProfile(
          prev.beadProfileId,
          isSlidingFamilyNow ? undefined : defaultBead?.id
        );
        const nextDynMullionId = resolveOptionalProfile(
          prev.dynamicMullionProfileId,
          defaultDynamicMullion?.id
        );
        const nextInterlockId = resolveOptionalProfile(
          prev.interlockProfileId,
          defaultInterlock?.id
        );
        const nextOpNoiId = resolveOptionalProfile(prev.opNoiProfileId, defaultOpNoi?.id);

        const isSameVariant = (a?: SashVariantProfiles, b?: SashVariantProfiles) =>
          a?.leftProfileId === b?.leftProfileId &&
          a?.topProfileId === b?.topProfileId &&
          a?.rightProfileId === b?.rightProfileId &&
          a?.bottomProfileId === b?.bottomProfileId;

        const nextVoCucId = prev.voCucProfileId || nextLeftId;

        if (
          prev.leftProfileId === nextLeftId &&
          prev.voCucProfileId === nextVoCucId &&
          prev.topProfileId === nextTopId &&
          prev.rightProfileId === nextRightId &&
          prev.bottomProfileId === nextBottomId &&
          prev.beadProfileId === nextBeadId &&
          prev.mullionProfileId === nextMullionId &&
          prev.dynamicMullionProfileId === nextDynMullionId &&
          prev.interlockProfileId === nextInterlockId &&
          prev.opNoiProfileId === nextOpNoiId &&
          isSameVariant(prev.slidingVariants?.left_sliding, nextLeftVar) &&
          isSameVariant(prev.slidingVariants?.right_sliding, nextRightVar) &&
          isSameVariant(prev.slidingVariants?.center_sliding, nextCenterVar)
        ) {
          return prev;
        }

        return {
          ...prev,
          leftProfileId: nextLeftId,
          voCucProfileId: nextVoCucId,
          topProfileId: nextTopId,
          rightProfileId: nextRightId,
          bottomProfileId: nextBottomId,
          beadProfileId: nextBeadId,
          mullionProfileId: nextMullionId,
          dynamicMullionProfileId: nextDynMullionId,
          interlockProfileId: nextInterlockId,
          opNoiProfileId: nextOpNoiId,
          slidingVariants: {
            left_sliding: nextLeftVar,
            right_sliding: nextRightVar,
            center_sliding: nextCenterVar,
          },
        };
      });
    }
  }, [
    availableProfiles,
    frameConfig.leftEdge?.profileId,
    frameConfig.bottomEdge?.profileId,
    frameConfig.cornerJoint,
    frameConfig.isOpenBottom,
    sashConfig.leftProfileId,
    sashConfig.family,
  ]);


  // Khởi tạo hoặc nạp lại state khi sửa cửa cũ, HOẶC reset toàn bộ khi thêm cửa mới
  useEffect(() => {
    if (!isOpen) {
      wasOpenRef.current = false;
      return;
    }
    const isFirstOpen = !wasOpenRef.current;
    wasOpenRef.current = true;

    if (door) {
      if (door.name) setName(door.name);
      if (door.code) setCode(door.code);
      if (door.type) setType(normalizeDoorType(door.type));

      const sc = (door.systemConfig || {}) as Record<string, any>;
      if (sc.w) setW(sc.w);
      if (sc.h) setH(sc.h);
      if (sc.frameShape) setFrameShape(sc.frameShape);
      const rawColor = (sc.aluminumColor || sc.surface_color || '').trim();
      if (rawColor) setAluminumColor(rawColor);
      const rawHwColor = (sc.hardwareColor || '').trim();
      if (rawHwColor) setHardwareColor(rawHwColor);
      if (sc.seriesId) {
        setSeriesId(sc.seriesId);
        prevSeriesIdRef.current = sc.seriesId;
        const curSeries = allAvailableSeries.find((s) => s.id === sc.seriesId);
        if (curSeries?.brandId) setSelectedBrandId(curSeries.brandId);
        else if (door.doorSeries?.brandId) setSelectedBrandId(door.doorSeries.brandId);
      } else if (door.doorSeriesId) {
        setSeriesId(door.doorSeriesId);
        prevSeriesIdRef.current = door.doorSeriesId;
        if (door.doorSeries?.brandId) setSelectedBrandId(door.doorSeries.brandId);
      } else {
        const fallbackBrandId = door.doorSeries?.brandId || defaultBrandId || (availableBrands[0]?.id ?? null);
        setSelectedBrandId(fallbackBrandId);
        const brandSeriesList = fallbackBrandId
          ? allAvailableSeries.filter((s) => s.brandId === fallbackBrandId)
          : allAvailableSeries;
        const fallbackSeriesId = brandSeriesList[0]?.id || undefined;
        setSeriesId(fallbackSeriesId);
        prevSeriesIdRef.current = fallbackSeriesId;
      }
      if (sc.selectedComboIds && Array.isArray(sc.selectedComboIds)) {
        setSelectedComboIds(sc.selectedComboIds);
      } else if (sc.selectedComboId) {
        setSelectedComboIds([sc.selectedComboId]);
      } else {
        setSelectedComboIds([]);
      }
      if (sc.selectedAccessories && Array.isArray(sc.selectedAccessories)) {
        const cleanAccs = sc.selectedAccessories
          .filter((a: any) => a && (a.accessoryId || a.accessory_id))
          .map((a: any) => ({
            accessoryId: Number(a.accessoryId || a.accessory_id),
            quantity: Number(a.quantity || a.qty || 1),
            note: a.note || null,
          }));
        setSelectedAccessories(cleanAccs);
      } else {
        setSelectedAccessories([]);
      }
      setFrameConfig(normalizeInitialFrameConfig(sc));
      setSashConfig(normalizeInitialSashConfig(sc, door?.type));
      if (sc.rootCell) {
        const targetW = Number(sc.w) || 1400;
        const targetH = Number(sc.h) || 1600;
        const drRoot = sc.drawing?.root as Record<string, unknown> | undefined;
        const syncedRoot = syncLegacyDrawingMullionMeta(
          ensureRootCellDimensions(sc.rootCell, targetW, targetH),
          drRoot
        );
        const mullHList = Array.isArray(drRoot?.mullH) ? drRoot?.mullH : undefined;
        const mullHDims = Array.isArray(drRoot?.mullH_dim_mm) ? drRoot?.mullH_dim_mm : undefined;
        if (
          syncedRoot.splitDirection === 'horizontal' &&
          Array.isArray(syncedRoot.children) &&
          syncedRoot.children.length === 2 &&
          mullHList?.length === 1 &&
          mullHDims?.length === 1
        ) {
          const ratioH = Number(mullHList[0]);
          const dimH = Number(mullHDims[0]);
          if (dimH > 0 && dimH < targetH && ratioH > 0 && ratioH < 1) {
            const botApprox = targetH * ratioH;
            const topApprox = targetH * (1 - ratioH);
            const targetTopH =
              Math.abs(dimH - botApprox) <= Math.abs(dimH - topApprox)
                ? Math.round((targetH - dimH) * 10) / 10
                : Math.round(dimH * 10) / 10;
            const targetBotH = Math.round((targetH - targetTopH) * 10) / 10;
            const curBotH = Number(syncedRoot.children[1]?.h || 0);
            if (Math.abs(curBotH - targetBotH) > 0 && Math.abs(curBotH - targetBotH) <= 60) {
              syncedRoot.children = [
                ensureRootCellDimensions(syncedRoot.children[0], targetW, targetTopH),
                ensureRootCellDimensions(syncedRoot.children[1], targetW, targetBotH),
              ];
            }
          }
        }
        setRootCell(syncedRoot);
        setHistory([syncedRoot]);
        setHistoryIdx(0);
      } else {
        const fallbackW = Number(sc.w) || 1400;
        const fallbackH = Number(sc.h) || 1600;
        const fallbackRoot = createDefaultRootCell(fallbackW, fallbackH);
        setRootCell(fallbackRoot);
        setHistory([fallbackRoot]);
        setHistoryIdx(0);
      }
      setSelectedCellId(null);
      setSelectedMullion(null);
      setIsMullionModalOpen(false);
      setCalcData(null);
      if (isFirstOpen) {
        setActiveMainTab('info');
      }
    } else {
      const defaultW = 1400;
      const defaultH = 1600;
      const initialRoot = createDefaultRootCell(defaultW, defaultH);

      setName('Cửa đi mở quay');
      setCode('');
      setType('casement_door');
      setW(defaultW);
      setH(defaultH);
      setFrameShape('rect');
      setAluminumColor('#955F20');
      setHardwareColor('#1E293B');
      const initialBrandId = defaultBrandId || (availableBrands[0]?.id ?? null);
      setSelectedBrandId(initialBrandId);
      const brandSeriesList = initialBrandId
        ? allAvailableSeries.filter((s) => s.brandId === initialBrandId)
        : allAvailableSeries;
      const initialSeriesId = brandSeriesList[0]?.id || undefined;
      setSeriesId(initialSeriesId);
      prevSeriesIdRef.current = initialSeriesId;
      setSelectedComboIds([]);
      setSelectedAccessories([]);
      setFrameConfig(DEFAULT_FRAME_CONFIG);
      setSashConfig({ ...DEFAULT_SASH_CONFIG, family: 'Cửa đi mở quay' });
      setCurrentSashType('fixed');
      setRootCell(initialRoot);
      setHistory([initialRoot]);
      setHistoryIdx(0);
      setSelectedCellId(null);
      setSelectedMullion(null);
      setIsMullionModalOpen(false);
      setCalcData(null);
      setIsCalculating(false);
      setActiveMainTab('info');
    }
  }, [door, isOpen, defaultBrandId, allAvailableSeries.length]);

  const pushState = (newRoot: SceneCellNode) => {
    const nextHist = [...history.slice(0, historyIdx + 1), newRoot];
    setHistory(nextHist);
    setHistoryIdx(nextHist.length - 1);
    setRootCell(newRoot);
  };

  const handleUndo = () => {
    if (historyIdx > 0) {
      setHistoryIdx(historyIdx - 1);
      setRootCell(history[historyIdx - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      setHistoryIdx(historyIdx + 1);
      setRootCell(history[historyIdx + 1]);
    }
  };

  const handleReset = () => {
    const initRoot: SceneCellNode = createDefaultRootCell(w, h);
    setRootCell(initRoot);
    setHistory([initRoot]);
    setHistoryIdx(0);
    setSelectedCellId(null);
    setSelectedMullion(null);
    setIsMullionModalOpen(false);
    toast.success('Đã làm mới bản vẽ cửa về mặc định');
  };

  const handleChangeDimension = (newW: number, newH: number) => {
    const scaleX = newW / (w || 1);
    const scaleY = newH / (h || 1);
    setW(newW);
    setH(newH);
    pushState(rescaleTree(rootCell, scaleX, scaleY));
  };

  const handleSplitMullion = (count: number, direction: 'vertical' | 'horizontal') => {
    const countClamped = Math.max(2, Math.min(20, count));
    const targetNode = selectedCellId ? findNode(rootCell, selectedCellId) : null;
    const target = targetNode || rootCell;

    const children = createSplitChildren(target.id, target.w, target.h, countClamped, direction, 'fixed');
    const updated = updateNode(rootCell, target.id, {
      splitDirection: direction,
      splitType: 'mullion',
      children,
    });
    pushState(updated);
    if (children.length > 0) setSelectedCellId(children[0].id);
  };

  const handleCoupleFrame = (direction: 'vertical' | 'horizontal') => {
    const targetNode = selectedCellId ? findNode(rootCell, selectedCellId) : null;
    const target = targetNode || rootCell;

    const children = createSplitChildren(target.id, target.w, target.h, 2, direction, 'fixed');
    const updated = updateNode(rootCell, target.id, {
      splitDirection: direction,
      splitType: 'coupling',
      children,
    });
    pushState(updated);
    if (children.length > 0) setSelectedCellId(children[0].id);
  };

  const handleSplitSashMullion = (count: number, direction: 'vertical' | 'horizontal') => {
    if (!selectedCellId) {
      toast.error('Vui lòng chọn một cánh cửa trên bản vẽ để chia đố cánh');
      return;
    }
    const targetNode = findNode(rootCell, selectedCellId);
    if (!targetNode) return;

    // Chặn nghiêm ngặt: Chỉ chặn khi là ô fix của khung bao ngoài (không nằm trong cánh cửa)
    const inSash = isInsideSash(rootCell, targetNode.id);
    if (targetNode.sashType === 'fixed' && !inSash) {
      toast.error('Ô đang chọn là Vách kính cố định của khung bao. Vui lòng sử dụng "Chia đố khung" ở tab Kiểu khung.');
      return;
    }

    const countClamped = Math.max(2, Math.min(20, count));
    const target = targetNode;

    // Tính toán chia đều vị trí
    const totalDim = direction === 'vertical' ? target.w : target.h;
    const baseVal = Math.round(totalDim / countClamped);
    const positions: number[] = [];
    let cur = 0;
    for (let i = 0; i < countClamped - 1; i++) {
      positions.push(baseVal);
      cur += baseVal;
    }
    positions.push(totalDim - cur);

    // Tạo các ô con đệ quy bên trong ô/cánh đang chọn
    const subChildren = createSplitChildren(
      target.id,
      target.w,
      target.h,
      countClamped,
      direction,
      'fixed'
    ).map((child) => ({
      ...child,
      paneType: target.paneType || 'glass',
    }));

    const updated = updateNode(rootCell, target.id, {
      splitDirection: direction,
      splitType: 'sash_mullion',
      children: subChildren,
      sashMullions: {
        count: countClamped,
        direction,
        positions,
      },
    });
    pushState(updated);
    if (subChildren.length > 0) {
      setSelectedCellId(subChildren[0].id);
    }
    toast.success(`Đã chia đố cánh thành ${countClamped} ô`);
  };

  const handleDeleteSelected = () => {
    if (!selectedCellId) {
      toast.error('Vui lòng chọn một ô hoặc cánh cần xóa');
      return;
    }
    const targetNode = findNode(rootCell, selectedCellId);
    if (!targetNode) return;

    // 1. Nếu ô đang chọn là ô con bên trong một cụm chia đố cánh (sash_mullion):
    const parentNode = findParentNode(rootCell, selectedCellId);
    if (parentNode && parentNode.splitType === 'sash_mullion') {
      const updated = updateNode(rootCell, parentNode.id, {
        splitDirection: undefined,
        splitType: undefined,
        children: [],
        sashMullions: undefined,
      });
      pushState(updated);
      setSelectedCellId(parentNode.id);
      toast.success('Đã xóa đố cánh, hợp nhất lại ô');
      return;
    }

    // 2. Nếu ô đang có đố cánh: xóa đố cánh trước
    if (targetNode.sashMullions || (targetNode.children && targetNode.splitType === 'sash_mullion')) {
      const updated = updateNode(rootCell, selectedCellId, {
        splitDirection: undefined,
        splitType: undefined,
        children: [],
        sashMullions: undefined,
      });
      pushState(updated);
      toast.success('Đã xóa đố cánh');
      return;
    }

    // 3. Nếu đang là cánh cửa: chuyển về vách kính cố định
    if (targetNode.sashType !== 'fixed') {
      const updated = updateNode(rootCell, selectedCellId, {
        sashType: 'fixed',
        hasLock: false,
        handleHeight: undefined,
        sashMullions: undefined,
        splitDirection: undefined,
        splitType: undefined,
        children: [],
      });
      pushState(updated);
      toast.success('Đã chuyển về vách cố định');
      return;
    }

    // 4. Nếu có children: xóa các con và hợp nhất
    if (targetNode.children && targetNode.children.length > 0) {
      const updated = updateNode(rootCell, selectedCellId, {
        splitDirection: undefined,
        splitType: undefined,
        children: [],
      });
      pushState(updated);
      toast.success('Đã xóa phân chia ô');
      return;
    }

    toast('Ô vách cố định mặc định');
  };

  const handleSelectSashType = (sashType: SashOpenType) => {
    const isSlimMode = sashConfig.sashStyle === 'slim';
    if (isSlimMode && sashType !== 'fixed') {
      const stStr = String(sashType || '').toLowerCase();
      if (stStr.includes('double') || stStr.includes('2-') || stStr.includes('3-') || stStr.includes('4-') || stStr.includes('6-')) {
        toast.error('Cửa vô cực chỉ hỗ trợ mẫu 1 cánh.');
        return;
      }
      const voCucProfile = availableProfiles.find(
        (p) => p.id === (sashConfig.voCucProfileId ?? sashConfig.leftProfileId)
      );
      if (!voCucProfile || !voCucProfile.sectionHeightMm) {
        toast.error('Vui lòng chọn Profile cánh vô cực ở tab Cấu hình → Cánh cửa trước.');
        return;
      }
    }

    setCurrentSashType(sashType);
    const inferredFamily = inferSashFamilyFromSashType(sashType, sashConfig.family, type);
    if (inferredFamily && inferredFamily !== sashConfig.family) {
      setSashConfig((prev) => ({ ...prev, family: inferredFamily }));
    }
    const targetId = selectedCellId || (rootCell.children?.[0]?.id || rootCell.id);
    let { updatedRoot, nextSelectedId } = applySashTypeToCluster(rootCell, targetId, sashType);

    if (isSlimMode && sashType !== 'fixed') {
      const voCucProfile = availableProfiles.find(
        (p) => p.id === (sashConfig.voCucProfileId ?? sashConfig.leftProfileId)
      );
      const leafW = Number(voCucProfile?.sectionHeightMm || 0);
      const netLeafW = leafW - 2 * Number(sashConfig.ngamNgangMm ?? 5);
      const effectiveCellId = nextSelectedId || targetId;
      const parentNode = findParentNode(updatedRoot, effectiveCellId);

      if (parentNode && parentNode.splitDirection === 'vertical' && parentNode.children && parentNode.children.length >= 2) {
        const childIdx = parentNode.children.findIndex((c) => c.id === effectiveCellId);
        if (childIdx > 0 && childIdx < parentNode.children.length - 1) {
          toast.error('Cửa vô cực: ô đang nằm giữa hai đố dọc; không xác định được cây đố nào cần dời.');
          return;
        }
        if (childIdx !== -1) {
          const isLeftOuter = childIdx === 0;
          const siblingIdx = isLeftOuter ? 1 : childIdx - 1;
          const frameEdgeId = isLeftOuter
            ? frameConfig.leftEdge.profileId
            : (frameConfig.rightEdge.profileId ?? frameConfig.leftEdge.profileId);
          const frameProf = availableProfiles.find((p) => p.id === frameEdgeId);
          const dedFrame = Number(frameProf?.deductSashMm || 0);

          let dedOther = 0;
          if (parentNode.splitType === 'coupling') {
            const otherFrameId = isLeftOuter
              ? (frameConfig.rightEdge.profileId ?? frameConfig.leftEdge.profileId)
              : frameConfig.leftEdge.profileId;
            const otherFrameProf = availableProfiles.find((p) => p.id === otherFrameId);
            dedOther = Number(otherFrameProf?.deductSashMm || 0);
          } else {
            const mullId = frameConfig.mullionVertProfileId ?? frameConfig.mullionProfileId;
            const mullProf = availableProfiles.find((p) => p.id === mullId);
            dedOther = Number(mullProf?.deductSashMm || 0);
          }

          const targetSpan = Math.round(netLeafW + dedFrame + dedOther);
          const curChild = parentNode.children[childIdx];
          const sibChild = parentNode.children[siblingIdx];
          const pairTotalW = (curChild?.w || 0) + (sibChild?.w || 0);
          if (targetSpan > 20 && targetSpan < pairTotalW - 20) {
            const nextChildren = parentNode.children.map((c, idx) => {
              if (idx === childIdx) return { ...c, w: targetSpan };
              if (idx === siblingIdx) return { ...c, w: pairTotalW - targetSpan };
              return c;
            });
            updatedRoot = updateNode(updatedRoot, parentNode.id, { children: nextChildren });
          }
        }
      } else if (!parentNode || parentNode.splitDirection !== 'vertical') {
        const leftProf = availableProfiles.find((p) => p.id === frameConfig.leftEdge.profileId);
        const rightProf = availableProfiles.find(
          (p) => p.id === (frameConfig.rightEdge.profileId ?? frameConfig.leftEdge.profileId)
        );
        const targetW = Math.round(
          netLeafW + Number(leftProf?.deductSashMm || 0) + Number(rightProf?.deductSashMm || 0)
        );
        if (targetW >= 80) {
          setW(targetW);
          updatedRoot = { ...updatedRoot, w: targetW };
        }
      }
    }

    pushState(updatedRoot);
    if (nextSelectedId) {
      setSelectedCellId(nextSelectedId);
    }
  };

  const handleUpdateDimension = (
    target: 'w' | 'h' | 'cell' | 'cell-w' | 'cell-h' | 'handleHeight',
    value: number,
    cellId?: string,
    isFinal: boolean = true
  ) => {
    if (target === 'w') {
      handleChangeDimension(value, h);
    } else if (target === 'h') {
      handleChangeDimension(w, value);
    } else if (target === 'handleHeight' && cellId) {
      const clampedVal = Math.max(100, Math.min(h - 80, value));
      const updatedRoot = updateNode(rootCell, cellId, { handleHeight: clampedVal });
      if (isFinal) {
        pushState(updatedRoot);
      } else {
        setRootCell(updatedRoot);
      }
    } else if (target === 'cell-h' && cellId) {
      const tryH = resizeCellInParent(rootCell, cellId, value, 'h');
      pushState(tryH);
    } else if ((target === 'cell-w' || target === 'cell') && cellId) {
      const tryW = resizeCellInParent(rootCell, cellId, value, 'w');
      const tryH = resizeCellInParent(rootCell, cellId, value, 'h');
      const changed = JSON.stringify(tryW) !== JSON.stringify(rootCell) ? tryW : (target === 'cell' ? tryH : rootCell);
      pushState(changed);
    }
  };

  const handleUpdateSelectedCell = (updates: Partial<SceneCellNode>) => {
    if (!selectedCellId) return;
    if (updates.sashType) {
      setCurrentSashType(updates.sashType);
      const inferredFamily = inferSashFamilyFromSashType(updates.sashType, sashConfig.family, type);
      if (inferredFamily && inferredFamily !== sashConfig.family) {
        setSashConfig((prev) => ({ ...prev, family: inferredFamily }));
      }
      const { updatedRoot, nextSelectedId } = applySashTypeToCluster(rootCell, selectedCellId, updates.sashType);
      pushState(updatedRoot);
      if (nextSelectedId) {
        setSelectedCellId(nextSelectedId);
      }
      return;
    }
    pushState(updateNode(rootCell, selectedCellId, updates));
  };

  const handleSelectMullion = (mullion: MullionInfo) => {
    setSelectedMullion(mullion);
    setIsMullionModalOpen(true);
  };

  const handleSaveMullion = (params: {
    dimension: number;
    profileId?: number;
    cutType?: MullionCutType;
  }) => {
    if (!selectedMullion) return;
    const parentNode = findNode(rootCell, selectedMullion.parentNodeId);
    if (!parentNode || !parentNode.children || parentNode.children.length < 2) return;

    const idx = selectedMullion.mullionIndex;
    const isVert = selectedMullion.direction === 'vertical';
    const child = parentNode.children[idx];
    const nextChild = parentNode.children[idx + 1];

    const oldDim = isVert ? child.w : child.h;
    const oldNextDim = isVert ? nextChild.w : nextChild.h;
    const totalDim = oldDim + oldNextDim;
    const minDim = Math.min(50, Math.max(20, Math.floor(totalDim * 0.15)));
    const newDim = Math.max(minDim, Math.min(totalDim - minDim, params.dimension));
    const delta = newDim - oldDim;

    const newChildren = parentNode.children.map((c, i) => {
      if (i === idx) {
        const scaled = rescaleTree(
          c,
          isVert ? newDim / (oldDim || 1) : 1,
          isVert ? 1 : newDim / (oldDim || 1)
        );
        return {
          ...scaled,
          w: isVert ? newDim : scaled.w,
          h: isVert ? scaled.h : newDim,
          mullionProfileId: params.profileId,
          mullionCutType: params.cutType,
        };
      }
      if (i === idx + 1 && nextChild) {
        const newNextDim = Math.max(minDim, oldNextDim - delta);
        const scaledNext = rescaleTree(
          c,
          isVert ? newNextDim / (oldNextDim || 1) : 1,
          isVert ? 1 : newNextDim / (oldNextDim || 1)
        );
        return {
          ...scaledNext,
          w: isVert ? newNextDim : scaledNext.w,
          h: isVert ? scaledNext.h : newNextDim,
        };
      }
      return c;
    });

    const updatedNodeData: Partial<SceneCellNode> = {
      children: newChildren,
      sashMullions: parentNode.sashMullions
        ? {
            ...parentNode.sashMullions,
            positions: newChildren.map((c) => (isVert ? c.w : c.h)),
          }
        : undefined,
    };

    pushState(updateNode(rootCell, parentNode.id, updatedNodeData));
    toast.success('Cập nhật thông số đố thành công');
  };

  const handleResizeSplit = ({
    parentNodeId,
    splitIndex,
    direction,
    newDimension,
    isFinal,
  }: ResizeSplitParams) => {
    const parentNode = findNode(rootCell, parentNodeId);
    if (!parentNode || !parentNode.children || parentNode.children.length < splitIndex + 2) return;

    const idx = splitIndex;
    const isVert = direction === 'vertical';
    const child = parentNode.children[idx];
    const nextChild = parentNode.children[idx + 1];

    const oldDim1 = isVert ? child.w : child.h;
    const oldDim2 = isVert ? nextChild.w : nextChild.h;
    const totalDim = oldDim1 + oldDim2;

    const minDim = Math.min(50, Math.max(20, Math.floor(totalDim * 0.15)));
    const clampedDim1 = Math.max(minDim, Math.min(totalDim - minDim, newDimension));
    const clampedDim2 = totalDim - clampedDim1;

    const updatedChild = rescaleTree(
      child,
      isVert ? clampedDim1 / (oldDim1 || 1) : 1,
      isVert ? 1 : clampedDim1 / (oldDim1 || 1)
    );
    const updatedNextChild = rescaleTree(
      nextChild,
      isVert ? clampedDim2 / (oldDim2 || 1) : 1,
      isVert ? 1 : clampedDim2 / (oldDim2 || 1)
    );

    const newChildren = [...parentNode.children];
    newChildren[idx] = {
      ...updatedChild,
      w: isVert ? clampedDim1 : updatedChild.w,
      h: isVert ? updatedChild.h : clampedDim1,
    };
    newChildren[idx + 1] = {
      ...updatedNextChild,
      w: isVert ? clampedDim2 : updatedNextChild.w,
      h: isVert ? updatedNextChild.h : clampedDim2,
    };

    const updatedRoot = updateNode(rootCell, parentNode.id, {
      children: newChildren,
      sashMullions: parentNode.sashMullions
        ? {
            ...parentNode.sashMullions,
            positions: newChildren.map((c) => (isVert ? c.w : c.h)),
          }
        : undefined,
    });

    if (isFinal) {
      pushState(updatedRoot);
    } else {
      setRootCell(updatedRoot);
    }
  };

  const handleDeleteMullion = () => {
    if (!selectedMullion) return;
    const parentNode = findNode(rootCell, selectedMullion.parentNodeId);
    if (!parentNode || !parentNode.children || parentNode.children.length === 0) return;

    const idx = selectedMullion.mullionIndex;
    const isVert = selectedMullion.direction === 'vertical';

    if (parentNode.children.length <= 2) {
      const mergedNode: Partial<SceneCellNode> = {
        children: [],
        splitDirection: undefined,
        splitType: undefined,
        sashType: parentNode.children[0]?.sashType || 'fixed',
        paneType: parentNode.children[0]?.paneType || 'glass',
      };
      pushState(updateNode(rootCell, parentNode.id, mergedNode));
    } else {
      const c1 = parentNode.children[idx];
      const c2 = parentNode.children[idx + 1];
      const mergedSpan = (isVert ? c1.w : c1.h) + (isVert ? c2.w : c2.h);

      const mergedChild: SceneCellNode = {
        ...c1,
        w: isVert ? mergedSpan : c1.w,
        h: isVert ? c1.h : mergedSpan,
      };

      const newChildren = [
        ...parentNode.children.slice(0, idx),
        mergedChild,
        ...parentNode.children.slice(idx + 2),
      ];
      pushState(updateNode(rootCell, parentNode.id, { children: newChildren }));
    }

    setSelectedMullion(null);
    setIsMullionModalOpen(false);
    toast.success('Đã xóa thanh đố thành công');
  };

  const handleLocalTransposeMullion = (parentId: string, mullionIndex: number) => {
    const targetParent = findNode(rootCell, parentId);
    if (!targetParent || !targetParent.children || targetParent.children.length < 2) {
      toast.error('Không tìm thấy giao điểm đố vuông góc để đảo chiều');
      return;
    }

    const transposeTwoLevelSplit = (outerNode: SceneCellNode): SceneCellNode | null => {
      if (!outerNode.children || outerNode.children.length !== 2 || !outerNode.splitDirection) {
        return null;
      }
      const isOuterVert = outerNode.splitDirection === 'vertical';
      const innerDir: 'vertical' | 'horizontal' = isOuterVert ? 'horizontal' : 'vertical';
      const [c0, c1] = outerNode.children;
      const c0HasInner = c0.children?.length === 2 && c0.splitDirection === innerDir;
      const c1HasInner = c1.children?.length === 2 && c1.splitDirection === innerDir;
      if (!c0HasInner && !c1HasInner) return null;

      const refInner = c0HasInner ? c0 : c1;
      const innerDim0 = isOuterVert ? refInner.children![0].h : refInner.children![0].w;
      const innerDim1 = isOuterVert ? refInner.children![1].h : refInner.children![1].w;

      const c0A: SceneCellNode = c0HasInner
        ? c0.children![0]
        : { ...c0, id: `${c0.id}-a`, w: isOuterVert ? c0.w : innerDim0, h: isOuterVert ? innerDim0 : c0.h };
      const c0B: SceneCellNode = c0HasInner
        ? c0.children![1]
        : { ...c0, id: `${c0.id}-b`, w: isOuterVert ? c0.w : innerDim1, h: isOuterVert ? innerDim1 : c0.h };
      const c1A: SceneCellNode = c1HasInner
        ? c1.children![0]
        : { ...c1, id: `${c1.id}-a`, w: isOuterVert ? c1.w : innerDim0, h: isOuterVert ? innerDim0 : c1.h };
      const c1B: SceneCellNode = c1HasInner
        ? c1.children![1]
        : { ...c1, id: `${c1.id}-b`, w: isOuterVert ? c1.w : innerDim1, h: isOuterVert ? innerDim1 : c1.h };

      const newBranch0: SceneCellNode = {
        id: `${outerNode.id}-tr-0`,
        w: isOuterVert ? outerNode.w : innerDim0,
        h: isOuterVert ? innerDim0 : outerNode.h,
        splitDirection: outerNode.splitDirection,
        splitType: outerNode.splitType || 'mullion',
        sashType: 'fixed',
        paneType: 'glass',
        children: [
          { ...c0A, w: c0.w, h: isOuterVert ? innerDim0 : c0A.h },
          { ...c1A, w: c1.w, h: isOuterVert ? innerDim0 : c1A.h },
        ],
      };
      const newBranch1: SceneCellNode = {
        id: `${outerNode.id}-tr-1`,
        w: isOuterVert ? outerNode.w : innerDim1,
        h: isOuterVert ? innerDim1 : outerNode.h,
        splitDirection: outerNode.splitDirection,
        splitType: outerNode.splitType || 'mullion',
        sashType: 'fixed',
        paneType: 'glass',
        children: [
          { ...c0B, w: c0.w, h: isOuterVert ? innerDim1 : c0B.h },
          { ...c1B, w: c1.w, h: isOuterVert ? innerDim1 : c1B.h },
        ],
      };

      return {
        ...outerNode,
        splitDirection: innerDir,
        children: [newBranch0, newBranch1],
      };
    };

    const directTransposed = transposeTwoLevelSplit(targetParent);
    if (directTransposed) {
      pushState(updateNode(rootCell, targetParent.id, directTransposed));
      toast.success('Đã đảo chiều ưu tiên giao điểm đố (Local transpose)');
      return;
    }

    const grandParent = findParentNode(rootCell, targetParent.id);
    if (grandParent) {
      const parentTransposed = transposeTwoLevelSplit(grandParent);
      if (parentTransposed) {
        pushState(updateNode(rootCell, grandParent.id, parentTransposed));
        toast.success('Đã đảo chiều ưu tiên giao điểm đố (Local transpose)');
        return;
      }
    }

    toast.error('Cần có giao điểm đố ngang - dọc (T hoặc +) để đảo chiều ưu tiên');
  };

  const handleSaveGrille = (config: GlassGrilleConfig, applyToAllSashes: boolean) => {
    if (!grilleEditingCell) return;
    if (applyToAllSashes) {
      const updateAllLeaves = (node: SceneCellNode): SceneCellNode => {
        if (!node.children || node.children.length === 0) {
          if (node.paneType === 'glass') {
            return { ...node, grilleConfig: { ...config } };
          }
          return node;
        }
        return { ...node, children: node.children.map(updateAllLeaves) };
      };
      pushState(updateAllLeaves(rootCell));
      toast.success('Đã áp dụng mẫu nan đồng cho tất cả các cánh kính');
    } else {
      pushState(updateNode(rootCell, grilleEditingCell.id, { grilleConfig: config }));
      toast.success('Đã cập nhật nan đồng cho ô kính');
    }
    setIsGrilleModalOpen(false);
    setGrilleEditingCell(null);
  };

  const initialSystemConfig = useMemo(
    () => ((door?.systemConfig || {}) as Record<string, unknown>),
    [door?.systemConfig]
  );

  // Realtime calculate BOM
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    setIsCalculating(true);

    const timer = setTimeout(async () => {
      try {
        const rawLegacySashObj = (initialSystemConfig.sash || {}) as Record<string, unknown>;
        const rawLegacyProfileObj = (rawLegacySashObj.profile || {}) as Record<string, unknown>;
        const hasLegacySash =
          initialSystemConfig.sash !== undefined ||
          sashConfig.sashStyle === 'slim' ||
          sashConfig.voCucProfileId !== undefined ||
          sashConfig.rawDodong !== undefined ||
          sashConfig.rawVariants !== undefined ||
          sashConfig.hoLeMm !== undefined;
        const mergedLegacySash = hasLegacySash
          ? {
              ...rawLegacySashObj,
              sash_mode: sashConfig.sashStyle === 'slim' ? 'vo-cuc' : 'normal',
              ...(sashConfig.voCucProfileId !== undefined
                ? { vo_cuc_profile: sashConfig.voCucProfileId }
                : sashConfig.leftProfileId !== undefined
                ? { vo_cuc_profile: sashConfig.leftProfileId }
                : {}),
              ...(sashConfig.hoLeMm !== undefined ? { ho_le: sashConfig.hoLeMm } : {}),
              ...(sashConfig.rawDodong ? { dodong: sashConfig.rawDodong } : {}),
              ...(sashConfig.rawVariants
                ? {
                    profile: {
                      ...rawLegacyProfileObj,
                      variants: sashConfig.rawVariants,
                    },
                  }
                : {}),
            }
          : undefined;

        const res = await calculateDoor({
          doorId: door?.id || undefined,
          width: w,
          height: h,
          systemConfig: {
            ...initialSystemConfig,
            ...(initialSystemConfig.drawing !== undefined ? { drawing: initialSystemConfig.drawing } : {}),
            ...(mergedLegacySash !== undefined ? { sash: mergedLegacySash } : {}),
            ...(initialSystemConfig.frame !== undefined ? { frame: initialSystemConfig.frame } : {}),
            ...(initialSystemConfig.curtain_wall !== undefined
              ? { curtain_wall: initialSystemConfig.curtain_wall }
              : {}),
            ...(initialSystemConfig.glass_bead !== undefined
              ? { glass_bead: initialSystemConfig.glass_bead }
              : {}),
            ...(initialSystemConfig.sash_layout !== undefined
              ? { sash_layout: initialSystemConfig.sash_layout }
              : {}),
            ...(initialSystemConfig.cells !== undefined ? { cells: initialSystemConfig.cells } : {}),
            ...(initialSystemConfig.extras !== undefined ? { extras: initialSystemConfig.extras } : {}),
            ...(initialSystemConfig.sash_extras !== undefined
              ? { sash_extras: initialSystemConfig.sash_extras }
              : {}),
            ...(initialSystemConfig.mullionConfig !== undefined
              ? { mullionConfig: initialSystemConfig.mullionConfig }
              : {}),
            ...(initialSystemConfig.glassBeadConfig !== undefined
              ? { glassBeadConfig: initialSystemConfig.glassBeadConfig }
              : {}),
            w,
            h,
            frameShape,
            aluminumColor,
            rootCell,
            frameConfig,
            sashConfig,
            seriesId: effectiveSeriesId,
            selectedComboIds,
            selectedComboId: selectedComboIds[0] || null,
            selectedAccessories,
          },
        });
        if (isMounted) setCalcData(res);
      } catch (err) {
        console.warn('Calc error', err);
      } finally {
        if (isMounted) setIsCalculating(false);
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isOpen, door?.id, initialSystemConfig, w, h, frameShape, aluminumColor, rootCell, frameConfig, sashConfig, effectiveSeriesId, selectedComboIds, selectedAccessories]);

  const handleToggleCombo = (comboId: number) => {
    setSelectedComboIds((prev) =>
      prev.includes(comboId) ? prev.filter((id) => id !== comboId) : [...prev, comboId]
    );
  };

  const handleUpdateAccessoryQty = (accessoryId: number, delta: number) => {
    setSelectedAccessories((prev) => {
      const existing = prev.find((a) => a.accessoryId === accessoryId);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) {
          return prev.filter((a) => a.accessoryId !== accessoryId);
        }
        return prev.map((a) => (a.accessoryId === accessoryId ? { ...a, quantity: newQty } : a));
      }
      if (delta > 0) {
        return [...prev, { accessoryId, quantity: delta }];
      }
      return prev;
    });
  };

  const handleSetAccessoryQty = (accessoryId: number, qty: number) => {
    setSelectedAccessories((prev) => {
      if (qty <= 0) {
        return prev.filter((a) => a.accessoryId !== accessoryId);
      }
      const existing = prev.find((a) => a.accessoryId === accessoryId);
      if (existing) {
        return prev.map((a) => (a.accessoryId === accessoryId ? { ...a, quantity: qty } : a));
      }
      return [...prev, { accessoryId, quantity: qty }];
    });
  };

  const handleClearAllAccessories = () => {
    setSelectedComboIds([]);
    setSelectedAccessories([]);
  };

  // Save Mutation
  const { mutate: saveMutation, isPending: isSaving } = useMutation({
    mutationFn: async () => {
      let imageB64: string | undefined = undefined;
      try {
        const svgEl = document.getElementById('studio-export-cad-svg') || document.getElementById('door-cad-svg');
        if (svgEl) {
          const clone = svgEl.cloneNode(true) as SVGSVGElement;
          clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
          const svgString = new XMLSerializer().serializeToString(clone);
          imageB64 = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
        }
      } catch (err) {
        console.warn('Cannot serialize CAD SVG:', err);
      }

      const rawLegacySashObj = (initialSystemConfig.sash || {}) as Record<string, unknown>;
      const rawLegacyProfileObj = (rawLegacySashObj.profile || {}) as Record<string, unknown>;
      const hasLegacySash =
        initialSystemConfig.sash !== undefined ||
        sashConfig.rawDodong !== undefined ||
        sashConfig.rawVariants !== undefined ||
        sashConfig.hoLeMm !== undefined;
      const mergedLegacySash = hasLegacySash
        ? {
            ...rawLegacySashObj,
            ...(sashConfig.hoLeMm !== undefined ? { ho_le: sashConfig.hoLeMm } : {}),
            ...(sashConfig.rawDodong ? { dodong: sashConfig.rawDodong } : {}),
            ...(sashConfig.rawVariants
              ? {
                  profile: {
                    ...rawLegacyProfileObj,
                    variants: sashConfig.rawVariants,
                  },
                }
              : {}),
          }
        : undefined;

      const sysConfig = {
        ...initialSystemConfig,
        ...(initialSystemConfig.drawing !== undefined ? { drawing: initialSystemConfig.drawing } : {}),
        ...(mergedLegacySash !== undefined ? { sash: mergedLegacySash } : {}),
        ...(initialSystemConfig.frame !== undefined ? { frame: initialSystemConfig.frame } : {}),
        ...(initialSystemConfig.curtain_wall !== undefined
          ? { curtain_wall: initialSystemConfig.curtain_wall }
          : {}),
        ...(initialSystemConfig.glass_bead !== undefined
          ? { glass_bead: initialSystemConfig.glass_bead }
          : {}),
        ...(initialSystemConfig.sash_layout !== undefined
          ? { sash_layout: initialSystemConfig.sash_layout }
          : {}),
        ...(initialSystemConfig.cells !== undefined ? { cells: initialSystemConfig.cells } : {}),
        ...(initialSystemConfig.extras !== undefined ? { extras: initialSystemConfig.extras } : {}),
        ...(initialSystemConfig.sash_extras !== undefined
          ? { sash_extras: initialSystemConfig.sash_extras }
          : {}),
        ...(initialSystemConfig.mullionConfig !== undefined
          ? { mullionConfig: initialSystemConfig.mullionConfig }
          : {}),
        ...(initialSystemConfig.glassBeadConfig !== undefined
          ? { glassBeadConfig: initialSystemConfig.glassBeadConfig }
          : {}),
        w,
        h,
        frameShape,
        aluminumColor: (aluminumColor || '').trim(),
        hardwareColor: (hardwareColor || '').trim(),
        rootCell,
        frameConfig,
        sashConfig,
        seriesId: effectiveSeriesId,
        selectedComboIds,
        selectedComboId: selectedComboIds[0] || null,
        selectedAccessories,
      };

      if (onCustomSave) {
        await onCustomSave({
          name,
          code,
          type,
          doorSeriesId: effectiveSeriesId || null,
          width: w,
          height: h,
          systemConfig: sysConfig,
          imageB64,
        });
        return {
          id: door?.id || 0,
          name,
          code,
          type,
          doorSeriesId: effectiveSeriesId || undefined,
          imagePath: door?.imagePath || null,
          specification: `${w}×${h}mm`,
          systemConfig: sysConfig,
          createdAt: '',
          updatedAt: '',
        } as Door;
      }

      const payload: DoorCreate = {
        name,
        code,
        type,
        doorSeriesId: effectiveSeriesId || null,
        imageB64,
        specification: `${w}×${h}mm, ${frameShape}, hệ ID:${effectiveSeriesId || 'default'}`,
        systemConfig: sysConfig,
      };

      if (door?.id) {
        return updateDoor(door.id, { data: payload as DoorUpdate });
      }
      return createDoor({ data: payload });
    },
    onSuccess: (savedDoor: Door) => {
      queryClient.invalidateQueries({ queryKey: ['doors'] });
      queryClient.invalidateQueries({ queryKey: ['door-templates'] });
      queryClient.invalidateQueries({ queryKey: ['doors-stats'] });
      queryClient.invalidateQueries({ queryKey: ['project_positions'] });
      toast.success(door?.id ? 'Cập nhật thiết kế thành công' : 'Lưu thiết kế thành công');
      onSaveSuccess?.(savedDoor);
      onClose();
    },
    onError: (err) => showErrorToast(err, 'Lưu thiết kế thất bại'),
  });

  const selectedCellNode = selectedCellId ? findNode(rootCell, selectedCellId) : null;
  const parentOfSelected = selectedCellId ? findParentNode(rootCell, selectedCellId) : null;
  const isSelectedInPair =
    parentOfSelected &&
    parentOfSelected.children &&
    parentOfSelected.children.length === 2 &&
    parentOfSelected.splitDirection === 'vertical' &&
    (parentOfSelected.splitType === 'sash_pair' || parentOfSelected.sashType === 'swing_double');
  const effectiveSashType: SashOpenType = isSelectedInPair
    ? (parentOfSelected.sashType || 'swing_double')
    : (selectedCellNode?.sashType || currentSashType);
  const isSelectedInsideSash = selectedCellId ? isInsideSash(rootCell, selectedCellId) : false;

  return {
    activeMainTab,
    setActiveMainTab,
    w,
    setW,
    h,
    setH,
    name,
    setName,
    code,
    setCode,
    type,
    setType,
    aluminumColor,
    setAluminumColor,
    hardwareColor,
    setHardwareColor,
    frameShape,
    setFrameShape,
    seriesId: effectiveSeriesId,
    setSeriesId,
    selectedComboIds,
    selectedAccessories,
    frameConfig,
    setFrameConfig,
    sashConfig,
    setSashConfig,
    activeLeftTab,
    setActiveLeftTab,
    currentSashType,
    selectedCellId,
    setSelectedCellId,
    selectedCellNode,
    effectiveSashType,
    isSelectedInsideSash,
    selectedMullion,
    setSelectedMullion,
    isMullionModalOpen,
    setIsMullionModalOpen,
    isGrilleModalOpen,
    setIsGrilleModalOpen,
    grilleEditingCell,
    setGrilleEditingCell,
    rootCell,
    history,
    historyIdx,
    calcData,
    isCalculating,
    availableSeries,
    allAvailableSeries,
    availableProfiles,
    availableBeads,
    availableCombos,
    availableAccessories,
    availableBrands,
    availableAccessoryBrands,
    selectedBrandId: effectiveBrandId,
    setSelectedBrandId,
    availableGlasses,
    defaultGlass,
    dynamicAluminumColors,
    handleUndo,
    handleRedo,
    handleReset,
    handleChangeDimension,
    handleSplitMullion,
    handleCoupleFrame,
    handleSplitSashMullion,
    handleDeleteSelected,
    handleSelectSashType,
    handleUpdateDimension,
    handleUpdateSelectedCell,
    handleSelectMullion,
    handleSaveMullion,
    handleResizeSplit,
    handleDeleteMullion,
    handleLocalTransposeMullion,
    handleSaveGrille,
    handleToggleCombo,
    handleUpdateAccessoryQty,
    handleSetAccessoryQty,
    handleClearAllAccessories,
    saveMutation,
    isSaving,
    pushState,
  };
}
