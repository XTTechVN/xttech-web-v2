import { ArchConfig, FrameShape } from '@/components/door-studio/studio-types';
import { GlassOrderItem, GlassOrderPositionVisual } from '@/types';

export interface GroupedSpecPane {
  specCode: string;
  groupKey: string;
  geometryKey: string;
  widthMm: number;
  heightMm: number;
  glassType: string;
  grindType: string;
  frameShape: FrameShape;
  archConfig: ArchConfig | null;
  qty: number;
  totalAreaM2: number;
  positionsSummary: string;
}

export interface DoorPaneRowItem {
  item: GlassOrderItem;
  specCode: string;
  geometryKey: string;
  paneLabel: string;
  noteText: string;
}

export interface DoorGlassSection {
  sectionKey: string;
  isManualGroup: boolean;
  positionId: number | null;
  positionCode: string;
  doorName: string;
  floorName: string | null;
  doorWidthMm: number;
  doorHeightMm: number;
  colorName: string | null;
  visual: GlassOrderPositionVisual | null;
  panes: DoorPaneRowItem[];
  totalPanes: number;
  totalAreaM2: number;
}

export interface GroupedGlassOrderData {
  activeItems: GlassOrderItem[];
  specGroups: GroupedSpecPane[];
  doorSections: DoorGlassSection[];
  totalPanes: number;
  totalAreaM2: number;
}

export interface ExcelImageAsset {
  id: string;
  fileName: string;
  bytes: Uint8Array;
  widthPx: number;
  heightPx: number;
}

export interface SheetDrawingAnchor {
  assetId: string;
  col0: number;
  startRow0: number;
  endRow0: number;
}

export interface SheetCellSpec {
  col0: number;
  styleId: number;
  kind: 'empty' | 'str' | 'num' | 'formula';
  text?: string;
  num?: number;
  formula?: string;
}

export interface SheetRowSpec {
  row1: number;
  heightPt: number;
  cells: SheetCellSpec[];
}

export interface WorksheetSpec {
  name: string;
  colWidths: number[];
  freezeTopRows?: number;
  rows: SheetRowSpec[];
  merges: string[];
  anchors: SheetDrawingAnchor[];
}
