import { ArchConfig, FrameShape } from '@/components/door-studio/studio-types';
import { GLASS_MANUAL_REASON_MAP } from '@/config/warehouse';
import { GlassOrder, GlassOrderItem, GlassOrderPositionVisual } from '@/types';
import {
  DoorGlassSection,
  DoorPaneRowItem,
  GroupedGlassOrderData,
  GroupedSpecPane,
} from './glass-excel-types';

const EXCLUDED_ITEM_STATUSES = new Set(['cancelled', 'scrapped']);

export function canonicalizeArchConfig(archConfig?: ArchConfig | null): string {
  if (!archConfig) return '';
  const record = archConfig as Record<string, unknown>;
  const keys = Object.keys(record).filter((k) => record[k] !== undefined && record[k] !== null).sort();
  if (keys.length === 0) return '';
  const normalized: Record<string, unknown> = {};
  for (const key of keys) normalized[key] = record[key];
  return JSON.stringify(normalized);
}

export function buildPaneGeometryKey(
  frameShape?: FrameShape | null,
  widthMm?: number,
  heightMm?: number,
  archConfig?: ArchConfig | null,
): string {
  const shape = (frameShape || 'rect') as FrameShape;
  return `${shape}|${Math.round(Number(widthMm) || 0)}|${Math.round(Number(heightMm) || 0)}|${canonicalizeArchConfig(archConfig)}`;
}

function resolveDoorCodeLabel(item: GlassOrderItem, positionMap: Map<number, GlassOrderPositionVisual>): string {
  if (item.paneSource === 'manual' || !item.positionId) {
    return item.manualReason ? GLASS_MANUAL_REASON_MAP[item.manualReason] : 'Kính lẻ';
  }
  const pos = positionMap.get(item.positionId);
  return pos?.positionCode || item.positionCode || item.doorName || `Cửa #${item.positionId}`;
}

function formatDoorLabelsMap(doorLabels: Map<string, string[]>): string {
  return Array.from(doorLabels.entries())
    .map(([code, labels]) => {
      const valid = labels.filter(Boolean);
      return valid.length > 0 ? `${code} (${valid.join(', ')})` : code;
    })
    .join('; ');
}

function buildSpecGroups(
  activeItems: GlassOrderItem[],
  positionMap: Map<number, GlassOrderPositionVisual>,
): { specGroups: GroupedSpecPane[]; itemRefMap: Map<number, { specCode: string; geometryKey: string }> } {
  const groupMap = new Map<string, {
    firstItem: GlassOrderItem;
    geometryKey: string;
    qty: number;
    areaSum: number;
    doorLabels: Map<string, string[]>;
    itemIds: number[];
  }>();

  for (const item of activeItems) {
    const geometryKey = buildPaneGeometryKey(item.frameShape, item.widthMm, item.heightMm, item.archConfig);
    const grind = item.grindType || 'grind_edge';
    const groupKey = `${item.glassType.trim()}|${grind}|${geometryKey}`;
    const doorCode = resolveDoorCodeLabel(item, positionMap);
    const paneText = item.paneLabel?.trim() || '';
    const existing = groupMap.get(groupKey);
    if (existing) {
      existing.qty += 1;
      existing.areaSum += item.areaM2;
      existing.itemIds.push(item.id);
      const list = existing.doorLabels.get(doorCode) || [];
      if (paneText) list.push(paneText);
      existing.doorLabels.set(doorCode, list);
    } else {
      groupMap.set(groupKey, {
        firstItem: item,
        geometryKey,
        qty: 1,
        areaSum: item.areaM2,
        doorLabels: new Map([[doorCode, paneText ? [paneText] : []]]),
        itemIds: [item.id],
      });
    }
  }

  const itemRefMap = new Map<number, { specCode: string; geometryKey: string }>();
  const specGroups: GroupedSpecPane[] = Array.from(groupMap.entries()).map(([groupKey, acc], idx) => {
    const specCode = `K-${String(idx + 1).padStart(2, '0')}`;
    for (const id of acc.itemIds) itemRefMap.set(id, { specCode, geometryKey: acc.geometryKey });
    return {
      specCode,
      groupKey,
      geometryKey: acc.geometryKey,
      widthMm: acc.firstItem.widthMm,
      heightMm: acc.firstItem.heightMm,
      glassType: acc.firstItem.glassType,
      grindType: acc.firstItem.grindType || 'grind_edge',
      frameShape: (acc.firstItem.frameShape || 'rect') as FrameShape,
      archConfig: acc.firstItem.archConfig || null,
      qty: acc.qty,
      totalAreaM2: Number(acc.areaSum.toFixed(3)),
      positionsSummary: formatDoorLabelsMap(acc.doorLabels),
    };
  });
  return { specGroups, itemRefMap };
}

function mapDoorPanes(
  items: GlassOrderItem[],
  itemRefMap: Map<number, { specCode: string; geometryKey: string }>,
  isManual: boolean,
): DoorPaneRowItem[] {
  return items.map((it, idx) => {
    const ref = itemRefMap.get(it.id);
    const noteText = isManual
      ? (it.manualReason ? GLASS_MANUAL_REASON_MAP[it.manualReason] : 'Kính lẻ')
      : (it.isRevisionStale ? 'Thiết kế cửa đã sửa sau bóc tách' : '');
    return {
      item: it,
      specCode: ref?.specCode || 'K-01',
      geometryKey: ref?.geometryKey || buildPaneGeometryKey(it.frameShape, it.widthMm, it.heightMm, it.archConfig),
      paneLabel: it.paneLabel || (isManual ? `Kính lẻ ${idx + 1}` : `Ô kính ${idx + 1}`),
      noteText,
    };
  });
}

function buildDoorSections(
  activeItems: GlassOrderItem[],
  positions: GlassOrderPositionVisual[],
  positionMap: Map<number, GlassOrderPositionVisual>,
  itemRefMap: Map<number, { specCode: string; geometryKey: string }>,
): DoorGlassSection[] {
  const doorBuckets = new Map<number, GlassOrderItem[]>();
  const manualItems: GlassOrderItem[] = [];
  for (const item of activeItems) {
    if (item.paneSource === 'manual' || !item.positionId) {
      manualItems.push(item);
    } else {
      const list = doorBuckets.get(item.positionId) || [];
      list.push(item);
      doorBuckets.set(item.positionId, list);
    }
  }

  const orderedPosIds: number[] = [];
  const seen = new Set<number>();
  for (const pos of positions) {
    if (doorBuckets.has(pos.positionId) && !seen.has(pos.positionId)) {
      orderedPosIds.push(pos.positionId);
      seen.add(pos.positionId);
    }
  }
  for (const posId of doorBuckets.keys()) {
    if (!seen.has(posId)) orderedPosIds.push(posId);
  }

  const sections: DoorGlassSection[] = orderedPosIds.map((posId) => {
    const panesRaw = doorBuckets.get(posId) || [];
    const visual = positionMap.get(posId) || null;
    const first = panesRaw[0];
    const panes = mapDoorPanes(panesRaw, itemRefMap, false);
    const areaSum = panesRaw.reduce((s, it) => s + it.areaM2, 0);
    return {
      sectionKey: `door_${posId}`,
      isManualGroup: false,
      positionId: posId,
      positionCode: visual?.positionCode || first?.positionCode || `CUA-${posId}`,
      doorName: visual?.doorName || first?.doorName || `Vị trí cửa #${posId}`,
      floorName: visual?.floorName || null,
      doorWidthMm: visual?.width || 0,
      doorHeightMm: visual?.height || 0,
      colorName: visual?.colorName || null,
      visual,
      panes,
      totalPanes: panes.length,
      totalAreaM2: Number(areaSum.toFixed(3)),
    };
  });

  if (manualItems.length > 0) {
    const panes = mapDoorPanes(manualItems, itemRefMap, true);
    const areaSum = manualItems.reduce((s, it) => s + it.areaM2, 0);
    sections.push({
      sectionKey: 'manual_group',
      isManualGroup: true,
      positionId: null,
      positionCode: 'KINH-LE',
      doorName: 'Nhóm kính lẻ / Dự phòng / Thay thế ngoài thiết kế',
      floorName: null,
      doorWidthMm: 0,
      doorHeightMm: 0,
      colorName: null,
      visual: null,
      panes,
      totalPanes: panes.length,
      totalAreaM2: Number(areaSum.toFixed(3)),
    });
  }
  return sections;
}

export function groupGlassOrderForExcel(order: GlassOrder): GroupedGlassOrderData {
  const activeItems = (order.items || []).filter(
    (it) => !EXCLUDED_ITEM_STATUSES.has((it.status || '').toLowerCase()),
  );
  const positions = order.positions || [];
  const positionMap = new Map(positions.map((pos) => [pos.positionId, pos]));
  const { specGroups, itemRefMap } = buildSpecGroups(activeItems, positionMap);
  const doorSections = buildDoorSections(activeItems, positions, positionMap, itemRefMap);
  const totalAreaSum = activeItems.reduce((sum, it) => sum + it.areaM2, 0);
  return {
    activeItems,
    specGroups,
    doorSections,
    totalPanes: activeItems.length,
    totalAreaM2: Number(totalAreaSum.toFixed(3)),
  };
}
