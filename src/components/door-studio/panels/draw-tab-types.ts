import type { DoorCalculateResponse, DoorSeries, Glass, ProfileBar } from '@/types';
import type { ResizeSplitParams } from '../cad-engine/door-cad-renderer';
import type {
  ColorSwatch,
  FrameConfig,
  FrameShape,
  MullionInfo,
  SashConfig,
  SashOpenType,
  SceneCellNode,
} from '../studio-types';
import type { EnclosingFrameUnitInfo } from '../utils/door-tree-utils';

export interface DrawTabViewProps {
  sketchMode?: boolean;
  w: number;
  h: number;
  aluminumColor: string;
  hardwareColor: string;
  frameShape: FrameShape;
  frameConfig: FrameConfig;
  sashConfig?: SashConfig;
  rootCell: SceneCellNode;
  selectedCellId: string | null;
  selectedCellNode: SceneCellNode | null;
  activeLeftTab: 'frame' | 'sash';
  currentSashType: SashOpenType;
  historyIdx: number;
  historyLength: number;
  calcData: DoorCalculateResponse | null;
  isCalculating: boolean;
  selectedMullionId?: string | null;
  onSelectMullion?: (mullion: MullionInfo) => void;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onChangeDimension: (w: number, h: number) => void;
  onSelectAluminumColor: (color: string) => void;
  onSelectHardwareColor: (color: string) => void;
  onSelectFrameShape: (shape: FrameShape) => void;
  onSelectSashType: (type: SashOpenType) => void;
  onSplitMullion: (count: number, direction: 'vertical' | 'horizontal') => void;
  onCoupleFrame: (direction: 'vertical' | 'horizontal') => void;
  onSplitSashMullion?: (count: number, direction: 'vertical' | 'horizontal') => void;
  onDeleteSelected?: () => void;
  onChangeTab: (tab: 'frame' | 'sash') => void;
  onSelectCell: (id: string | null) => void;
  onUpdateDimension: (
    target: 'w' | 'h' | 'cell' | 'cell-w' | 'cell-h' | 'handleHeight',
    value: number,
    cellId?: string,
    isFinal?: boolean,
  ) => void;
  onResizeSplit?: (params: ResizeSplitParams) => void;
  onUpdateSelectedCell: (updates: Partial<SceneCellNode>) => void;
  onSplitSelectedCell: (direction: 'vertical' | 'horizontal') => void;
  onMergeSelectedCell: () => void;
  onApplyGlassVisualToAll?: (patch: Partial<SceneCellNode>) => void;
  onOpenGrilleModal?: (cell: SceneCellNode) => void;
  availableGlasses?: Glass[];
  availableBeads?: ProfileBar[];
  availableProfiles?: ProfileBar[];
  defaultGlass?: Glass | null;
  aluminumColors?: ColorSwatch[];
  onChangeFrameConfig?: (updates: Partial<FrameConfig>) => void;
  onChangeSashConfig?: (updates: Partial<SashConfig>) => void;
  isInsideSash?: boolean;
  frameUnitInfo?: EnclosingFrameUnitInfo | null;
  onUpdateFrameUnit?: (updates: Partial<SceneCellNode>) => void;
  globalSeriesId?: number;
  availableSeries?: DoorSeries[];
  allBrandProfiles?: ProfileBar[];
}
