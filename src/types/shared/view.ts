export type ViewMode = '1x1' | '2x2' | '3x3' | '4x4';

export const VIEW_MODES_CONFIG = {
  '1x1': {
    columns: 1,
    rows: 1,
    total: 1,
  },
  '2x2': {
    columns: 2,
    rows: 2,
    total: 4,
  },
  '3x3': {
    columns: 3,
    rows: 3,
    total: 9,
  },
  '4x4': {
    columns: 4,
    rows: 4,
    total: 16,
  },
};
