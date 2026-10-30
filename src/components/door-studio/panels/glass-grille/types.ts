import { GlassGrilleConfig } from '../../studio-types';

export type DragTarget =
  | { type: 'col-bar'; index: number }
  | { type: 'row-bar'; index: number }
  | { type: 'border-offset' }
  | { type: 'corner-size' };

export interface SavedTemplateItem {
  id: string;
  name: string;
  description: string;
  isDefault?: boolean;
  config: Partial<GlassGrilleConfig>;
}

export interface EditingDim {
  type: 'col-span' | 'row-span' | 'border-offset' | 'corner-size';
  index?: number;
  label: string;
  currentValue: number;
}

