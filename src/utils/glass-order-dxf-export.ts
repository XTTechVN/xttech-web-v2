import toast from 'react-hot-toast';
import { GlassOrder, GlassOrderItem, ManualReason } from '@/types';
import { ArchConfig, FrameShape } from '@/components/door-studio/studio-types';
import { computeArchMetrics } from '@/components/door-studio/cad-engine/cad-geometry';

export const GLASS_GRIND_LABEL_MAP: Record<string, string> = {
  grind_edge: 'Mài xiết cạnh',
  grind_flat: 'Mài bóng phẳng',
  grind_bevel: 'Mài vát cạnh',
  no_grind: 'Không mài',
};

export const GLASS_MANUAL_REASON_MAP: Record<ManualReason, string> = {
  spare: 'Kính dự phòng',
  replacement: 'Kính thay thế (vỡ/lỗi)',
  extra: 'Phát sinh ngoài thiết kế',
  other: 'Khác',
};

export const FRAME_SHAPE_LABEL_MAP: Record<string, string> = {
  rect: 'Chữ nhật',
  arch_half: 'Vòm bán nguyệt',
  arch_segment: 'Vòm cung tròn',
  arch_semicircle: 'Vòm bán nguyệt có chân',
  arch_semicircle_open: 'Vòm bán nguyệt mở đáy',
  arch_segment_leg: 'Vòm cung có chân',
  arch_segment_leg_open: 'Vòm cung mở đáy',
  arch_pointed: 'Vòm nhọn Gothic',
  arch_pointed_leg: 'Vòm nhọn có chân',
  round_top: 'Tròn đầu',
  round_top_open: 'Tròn đầu mở đáy',
  round_top_2: 'Bo 2 góc trên',
  round_top_2_open: 'Bo 2 góc trên mở đáy',
  round_top_right: 'Bo 1 góc trên',
  round_top_rw: 'Bo góc lệch',
  round_4_corner: 'Bo 4 góc',
  quad_circle: 'Vòm 1/4',
  circle: 'Hình tròn',
  ellipse: 'Hình elip',
};

export function formatPaneShapeSummary(
  frameShape?: string | null,
  archConfig?: { radiusMm?: number } | null,
): string {
  if (!frameShape || frameShape === 'rect') {
    return FRAME_SHAPE_LABEL_MAP.rect;
  }
  const baseLabel = FRAME_SHAPE_LABEL_MAP[frameShape] || frameShape;
  if (archConfig?.radiusMm && archConfig.radiusMm > 0) {
    return `${baseLabel} (R=${Math.round(archConfig.radiusMm)})`;
  }
  return baseLabel;
}

interface GroupedGlassPane {
  groupIndex: number;
  widthMm: number;
  heightMm: number;
  glassType: string;
  grindType: string;
  frameShape: FrameShape;
  archConfig: ArchConfig | null;
  qty: number;
  totalAreaM2: number;
  positionSummary: string;
}

export function toCadSafeText(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^\x20-\x7E]/g, ' ')
    .trim();
}

function dxfLine(layer: string, x1: number, y1: number, x2: number, y2: number, ltype = 'CONTINUOUS'): string {
  return [
    '0', 'LINE', '8', layer, '6', ltype,
    '10', x1.toFixed(2), '20', y1.toFixed(2), '30', '0.0',
    '11', x2.toFixed(2), '21', y2.toFixed(2), '31', '0.0',
  ].join('\n');
}

function dxfCircle(layer: string, cx: number, cy: number, r: number): string {
  return ['0', 'CIRCLE', '8', layer, '10', cx.toFixed(2), '20', cy.toFixed(2), '30', '0.0', '40', r.toFixed(2)].join('\n');
}

function dxfArc(layer: string, cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  return [
    '0', 'ARC', '8', layer,
    '10', cx.toFixed(2), '20', cy.toFixed(2), '30', '0.0',
    '40', r.toFixed(2), '50', startDeg.toFixed(4), '51', endDeg.toFixed(4),
  ].join('\n');
}

function dxfText(layer: string, x: number, y: number, height: number, text: string): string {
  return [
    '0', 'TEXT', '8', layer,
    '10', x.toFixed(2), '20', y.toFixed(2), '30', '0.0',
    '40', height.toFixed(2), '1', toCadSafeText(text),
  ].join('\n');
}

function buildDxfHeaderAndTables(): string {
  return [
    '0', 'SECTION', '2', 'HEADER', '9', '$ACADVER', '1', 'AC1009', '9', '$INSUNITS', '70', '4', '0', 'ENDSEC',
    '0', 'SECTION', '2', 'TABLES',
    '0', 'TABLE', '2', 'LTYPE', '70', '2',
    '0', 'LTYPE', '2', 'CONTINUOUS', '70', '0', '3', 'Solid line', '72', '65', '73', '0', '40', '0.0',
    '0', 'LTYPE', '2', 'DASHED', '70', '0', '3', 'Dashed line', '72', '65', '73', '2', '40', '15.0', '49', '10.0', '49', '-5.0',
    '0', 'ENDTAB',
    '0', 'TABLE', '2', 'LAYER', '70', '4',
    '0', 'LAYER', '2', 'GLASS_CUT', '70', '0', '62', '3', '6', 'CONTINUOUS',
    '0', 'LAYER', '2', 'DIMENSIONS', '70', '0', '62', '2', '6', 'CONTINUOUS',
    '0', 'LAYER', '2', 'TEXT_INFO', '70', '0', '62', '7', '6', 'CONTINUOUS',
    '0', 'LAYER', '2', 'TITLE_BLOCK', '70', '0', '62', '5', '6', 'CONTINUOUS',
    '0', 'ENDTAB', '0', 'ENDSEC',
  ].join('\n');
}

function groupGlassOrderItems(items: GlassOrderItem[]): GroupedGlassPane[] {
  const map = new Map<string, { item: GlassOrderItem; qty: number; area: number; labels: Set<string> }>();
  for (const it of items) {
    const shape = (it.frameShape || 'rect') as FrameShape;
    const radius = it.archConfig?.radiusMm || 0;
    const key = `${it.glassType}|${it.widthMm}|${it.heightMm}|${it.grindType || 'grind_edge'}|${shape}|${radius}`;
    const posLabel =
      it.positionCode ||
      it.doorName ||
      (it.manualReason ? GLASS_MANUAL_REASON_MAP[it.manualReason] : 'Kinh le');
    const fullTag = it.paneLabel ? `${posLabel}(${it.paneLabel})` : posLabel;
    const existing = map.get(key);
    if (existing) {
      existing.qty += 1;
      existing.area += it.areaM2;
      existing.labels.add(fullTag);
    } else {
      map.set(key, { item: it, qty: 1, area: it.areaM2, labels: new Set([fullTag]) });
    }
  }
  return Array.from(map.values()).map((entry, idx) => ({
    groupIndex: idx + 1,
    widthMm: entry.item.widthMm,
    heightMm: entry.item.heightMm,
    glassType: entry.item.glassType,
    grindType: entry.item.grindType || 'grind_edge',
    frameShape: (entry.item.frameShape || 'rect') as FrameShape,
    archConfig: entry.item.archConfig || null,
    qty: entry.qty,
    totalAreaM2: Number(entry.area.toFixed(3)),
    positionSummary: Array.from(entry.labels).slice(0, 4).join(', '),
  }));
}

function renderRectOutline(x0: number, y0: number, w: number, h: number, layer = 'GLASS_CUT'): string[] {
  return [
    dxfLine(layer, x0, y0, x0 + w, y0),
    dxfLine(layer, x0 + w, y0, x0 + w, y0 + h),
    dxfLine(layer, x0 + w, y0 + h, x0, y0 + h),
    dxfLine(layer, x0, y0 + h, x0, y0),
  ];
}

function renderPointedArchPane(x0: number, y0: number, w: number, h: number, shape: FrameShape, archConfig: ArchConfig | null): string[] {
  const m = computeArchMetrics(shape, w, h, 0, archConfig || undefined);
  const archH = Math.max(1, Math.min(h, m.archH));
  const legH = Math.max(0, h - archH);
  const rEff = w / 4 + (archH * archH) / Math.max(1, w);
  const entities: string[] = [dxfLine('GLASS_CUT', x0, y0, x0 + w, y0)];
  if (legH > 0.5) {
    entities.push(dxfLine('GLASS_CUT', x0, y0, x0, y0 + legH));
    entities.push(dxfLine('GLASS_CUT', x0 + w, y0, x0 + w, y0 + legH));
    entities.push(dxfLine('DIMENSIONS', x0, y0 + legH, x0 + w, y0 + legH, 'DASHED'));
  }
  const dxCenter = Math.max(0.01, rEff - w / 2);
  const cxLeft = x0 + w / 2 + dxCenter;
  const cxRight = x0 + w / 2 - dxCenter;
  const cy = y0 + legH;
  const thetaDeg = (Math.atan2(archH, dxCenter) * 180) / Math.PI;
  entities.push(dxfArc('GLASS_CUT', cxRight, cy, rEff, 0, thetaDeg));
  entities.push(dxfArc('GLASS_CUT', cxLeft, cy, rEff, 180 - thetaDeg, 180));
  entities.push(dxfText('DIMENSIONS', x0 + w / 2 - 45, y0 + h + 18, 22, `R=${Math.round(rEff)}`));
  return entities;
}

function renderStandardArchPane(x0: number, y0: number, w: number, h: number, shape: FrameShape, archConfig: ArchConfig | null): string[] {
  const m = computeArchMetrics(shape, w, h, 0, archConfig || undefined);
  const halfW = w / 2;
  const rRaw = Math.max(halfW, m.rOuter);
  const rawSagitta = rRaw - Math.sqrt(Math.max(0, rRaw * rRaw - halfW * halfW));
  const archH = rawSagitta <= h ? rawSagitta : h;
  const legH = rawSagitta <= h ? h - archH : 0;
  const rEff = rawSagitta <= h ? rRaw : h / 2 + (w * w) / (8 * Math.max(1, h));

  const entities: string[] = [dxfLine('GLASS_CUT', x0, y0, x0 + w, y0)];
  if (legH > 0.5) {
    entities.push(dxfLine('GLASS_CUT', x0, y0, x0, y0 + legH));
    entities.push(dxfLine('GLASS_CUT', x0 + w, y0, x0 + w, y0 + legH));
    entities.push(dxfLine('DIMENSIONS', x0, y0 + legH, x0 + w, y0 + legH, 'DASHED'));
    entities.push(dxfText('DIMENSIONS', x0 + 15, y0 + legH + 12, 18, `H_CHAN=${Math.round(legH)} | H_VOM=${Math.round(archH)}`));
  }
  const cx = x0 + halfW;
  const cy = y0 + h - rEff;
  const halfAngleDeg = (Math.asin(Math.min(1, halfW / rEff)) * 180) / Math.PI;
  entities.push(dxfArc('GLASS_CUT', cx, cy, rEff, 90 - halfAngleDeg, 90 + halfAngleDeg));
  entities.push(dxfText('DIMENSIONS', x0 + halfW - 45, y0 + h + 18, 22, `R=${Math.round(rEff)}`));
  return entities;
}

function renderRoundedCornerPane(x0: number, y0: number, w: number, h: number, shape: FrameShape, archConfig: ArchConfig | null): string[] {
  const r = Math.min(Math.min(w, h) * 0.25, archConfig?.radiusMm || Math.round(Math.min(w, h) * 0.2));
  const isAll4 = shape === 'round_4_corner';
  const isRightOnly = shape === 'round_top_right';
  const rBL = isAll4 ? r : 0;
  const rBR = isAll4 ? r : 0;
  const effTL = isRightOnly ? 0 : r;
  const entities: string[] = [
    dxfLine('GLASS_CUT', x0 + rBL, y0, x0 + w - rBR, y0),
    dxfLine('GLASS_CUT', x0 + w, y0 + rBR, x0 + w, y0 + h - r),
    dxfLine('GLASS_CUT', x0 + w - r, y0 + h, x0 + effTL, y0 + h),
    dxfLine('GLASS_CUT', x0, y0 + h - effTL, x0, y0 + rBL),
  ];
  if (r > 0) entities.push(dxfArc('GLASS_CUT', x0 + w - r, y0 + h - r, r, 0, 90));
  if (effTL > 0) entities.push(dxfArc('GLASS_CUT', x0 + effTL, y0 + h - effTL, effTL, 90, 180));
  if (rBL > 0) entities.push(dxfArc('GLASS_CUT', x0 + rBL, y0 + rBL, rBL, 180, 270));
  if (rBR > 0) entities.push(dxfArc('GLASS_CUT', x0 + w - rBR, y0 + rBR, rBR, 270, 360));
  return entities;
}

function renderSingleGlassGroup(group: GroupedGlassPane, x0: number, y0: number): string[] {
  const { widthMm: w, heightMm: h, frameShape: shape, archConfig } = group;
  const entities: string[] = [];
  if (shape === 'circle' || shape === 'ellipse') {
    entities.push(dxfCircle('GLASS_CUT', x0 + w / 2, y0 + h / 2, Math.min(w, h) / 2));
  } else if (shape === 'arch_pointed' || shape === 'arch_pointed_leg') {
    entities.push(...renderPointedArchPane(x0, y0, w, h, shape, archConfig));
  } else if (shape.startsWith('arch_') || shape === 'round_top_open') {
    entities.push(...renderStandardArchPane(x0, y0, w, h, shape, archConfig));
  } else if (shape.startsWith('round_') || shape === 'quad_circle') {
    entities.push(...renderRoundedCornerPane(x0, y0, w, h, shape, archConfig));
  } else {
    entities.push(...renderRectOutline(x0, y0, w, h));
  }
  entities.push(
    dxfLine('DIMENSIONS', x0, y0 - 45, x0 + w, y0 - 45),
    dxfText('DIMENSIONS', x0 + w / 2 - 40, y0 - 38, 24, `RONG: ${w} mm`),
    dxfLine('DIMENSIONS', x0 + w + 45, y0, x0 + w + 45, y0 + h),
    dxfText('DIMENSIONS', x0 + w + 55, y0 + h / 2, 24, `CAO: ${h} mm`),
  );
  const grindLabel = GLASS_GRIND_LABEL_MAP[group.grindType] || group.grindType;
  const shapeLabel = FRAME_SHAPE_LABEL_MAP[shape] || shape;
  const textBaseY = y0 - 105;
  entities.push(
    dxfText('TEXT_INFO', x0, textBaseY, 26, `[#${group.groupIndex}] SL: ${group.qty} TAM (${w} x ${h} mm) - ${group.totalAreaM2} m2`),
    dxfText('TEXT_INFO', x0, textBaseY - 36, 20, `LOAI KINH: ${group.glassType}`),
    dxfText('TEXT_INFO', x0, textBaseY - 68, 18, `VI TRI: ${group.positionSummary}`),
    dxfText('TEXT_INFO', x0, textBaseY - 98, 18, `MAI: ${grindLabel} | BIEN DANG: ${shapeLabel}`),
  );
  return entities;
}

function renderTitleBlock(fullOrder: GlassOrder, groups: GroupedGlassPane[], topY: number): string[] {
  const boxH = 260 + groups.length * 38;
  const boxW = 3600;
  const entities: string[] = renderRectOutline(0, topY, boxW, boxH, 'TITLE_BLOCK');
  const headerY = topY + boxH - 55;
  entities.push(
    dxfText('TITLE_BLOCK', 40, headerY, 38, `BAN VE GIA CONG KINH (TI LE 1:1 - DON VI: MM) - MA DON: ${fullOrder.code}`),
    dxfText('TEXT_INFO', 40, headerY - 50, 24, `DU AN: ${fullOrder.projectName || 'N/A'} | NGAY LAP: ${new Date(fullOrder.createdAt).toLocaleDateString('vi-VN')}`),
    dxfText('TEXT_INFO', 40, headerY - 90, 24, `TONG SO TAM: ${fullOrder.totalPanes} TAM | TONG DIEN TICH: ${fullOrder.totalAreaM2.toFixed(3)} M2`),
    dxfLine('TITLE_BLOCK', 0, headerY - 115, boxW, headerY - 115),
  );
  groups.forEach((g, idx) => {
    const rowY = headerY - 155 - idx * 36;
    const shapeLabel = FRAME_SHAPE_LABEL_MAP[g.frameShape] || g.frameShape;
    entities.push(
      dxfText(
        'TEXT_INFO',
        40,
        rowY,
        20,
        `#${g.groupIndex}: ${g.widthMm} x ${g.heightMm} mm | SL: ${g.qty} tam | ${g.glassType} | ${shapeLabel} | Vi tri: ${g.positionSummary}`,
      ),
    );
  });
  return entities;
}

export function exportGlassOrderToDxf(fullOrder: GlassOrder): void {
  const items = fullOrder.items || [];
  if (items.length === 0) {
    toast.error('Đơn hàng không có tấm kính nào để xuất bản vẽ CAD!');
    return;
  }
  const groups = groupGlassOrderItems(items);
  const cols = 4;
  const gapX = 500;
  const gapY = 480;
  const maxW = Math.max(...groups.map((g) => g.widthMm), 800);
  const maxH = Math.max(...groups.map((g) => g.heightMm), 1000);
  const cellW = maxW + gapX;
  const cellH = maxH + gapY;
  const totalRows = Math.ceil(groups.length / cols);
  const entities: string[] = [];

  groups.forEach((group, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const x0 = col * cellW;
    const y0 = (totalRows - 1 - row) * cellH;
    entities.push(...renderSingleGlassGroup(group, x0, y0));
  });

  const titleTopY = totalRows * cellH + 250;
  entities.push(...renderTitleBlock(fullOrder, groups, titleTopY));

  const dxfContent = [
    buildDxfHeaderAndTables(),
    '0', 'SECTION', '2', 'ENTITIES',
    ...entities,
    '0', 'ENDSEC',
    '0', 'EOF',
  ].join('\n');

  const blob = new Blob([dxfContent], { type: 'application/dxf;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Ban_Ve_Kinh_${fullOrder.code}.dxf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  toast.success('Đã xuất bản vẽ AutoCAD (.dxf) tỉ lệ 1:1 thành công!');
}
