import { SceneCellNode, FrameShape, FrameConfig, SashConfig, MullionInfo } from '../studio-types';

export interface ResizeSplitParams {
  parentNodeId: string;
  splitIndex: number;
  direction: 'vertical' | 'horizontal';
  childId: string;
  nextChildId?: string;
  newDimension: number;
  isFinal: boolean;
}

export interface DoorCadRendererProps {
  id?: string;
  hideDimensions?: boolean;
  w: number;
  h: number;
  aluminumColor: string;
  hardwareColor: string;
  frameShape: FrameShape;
  rootCell: SceneCellNode;
  selectedCellId: string | null;
  onSelectCell: (cellId: string | null) => void;
  onSelectMullion?: (mullion: MullionInfo) => void;
  selectedMullionId?: string | null;
  onEditDimension?: (target: 'w' | 'h' | 'cell' | 'handleHeight', cellId?: string) => void;
  onResizeSplit?: (params: ResizeSplitParams) => void;
  frameConfig?: FrameConfig;
  sashConfig?: SashConfig;
}

export interface LeafCell {
  node: SceneCellNode;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface MullionBar {
  x: number;
  y: number;
  w: number;
  h: number;
  info: MullionInfo;
}

export interface CouplingSeamBar {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  direction: 'vertical' | 'horizontal';
  parentNodeId: string;
  splitIndex: number;
  childId: string;
  nextChildId: string;
  dimension: number;
  nextDimension: number;
  totalDimension: number;
}

export interface FrameBox {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CurvedFramePaths {
  outerPath: string;
  innerPath: string;
}
