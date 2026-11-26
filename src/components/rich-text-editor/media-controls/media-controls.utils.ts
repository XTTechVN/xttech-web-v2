export type FigureAlign = 'left' | 'center' | 'right' | 'float-left' | 'float-right';

export const FIGURE_ALIGN_VALUES: FigureAlign[] = [
  'left',
  'center',
  'right',
  'float-left',
  'float-right',
];

export const MIN_WIDTH_PERCENT = 15;
export const MAX_WIDTH_PERCENT = 100;
export const WIDTH_STEP_PERCENT = 5;
export const WIDTH_PRESETS = [25, 50, 75, 100] as const;
export const MAX_UNDO_STEPS = 50;
export const MEDIA_DRAG_THRESHOLD_PX = 4;

export const readFigureAlign = (figure: HTMLElement): FigureAlign => {
  const raw = figure.getAttribute('data-align') as FigureAlign | null;
  return raw && FIGURE_ALIGN_VALUES.includes(raw) ? raw : 'center';
};

export const readFigureWidthPercent = (figure: HTMLElement): number => {
  const match = /^(\d+(?:\.\d+)?)%$/.exec(figure.style.width.trim());
  return match ? Math.round(Number(match[1])) : MAX_WIDTH_PERCENT;
};

export const clampWidthPercent = (percent: number): number => {
  const stepped = Math.round(percent / WIDTH_STEP_PERCENT) * WIDTH_STEP_PERCENT;
  return Math.min(MAX_WIDTH_PERCENT, Math.max(MIN_WIDTH_PERCENT, stepped));
};

/** Đưa <figure> ra làm con trực tiếp của editor để di chuyển theo từng khối. */
export const hoistFigure = (editor: HTMLElement, figure: HTMLElement): void => {
  let parent = figure.parentElement;
  if (!parent || parent === editor) return;
  while (parent.parentElement && parent.parentElement !== editor) parent = parent.parentElement;
  parent.after(figure);
  if (!parent.textContent?.trim() && !parent.querySelector('img,video,iframe,figure')) {
    parent.remove();
  }
};

/** Luôn có đoạn văn trống ở đầu/cuối để đặt được con trỏ quanh media. */
export const ensureEdgeParagraphs = (editor: HTMLElement): void => {
  const isFigure = (el: Element | null) => el?.tagName === 'FIGURE';
  if (isFigure(editor.firstElementChild)) editor.insertAdjacentHTML('afterbegin', '<p><br></p>');
  if (isFigure(editor.lastElementChild)) editor.insertAdjacentHTML('beforeend', '<p><br></p>');
};

export interface DropTarget {
  reference: Element | null;
  lineY: number;
}

/** Tìm vị trí thả dựa trên tọa độ Y chuột so với các khối con của editor. */
export const findDropTarget = (
  editor: HTMLElement,
  dragged: HTMLElement,
  clientY: number,
): DropTarget => {
  const blocks = Array.from(editor.children).filter((child) => child !== dragged);
  for (const block of blocks) {
    const rect = block.getBoundingClientRect();
    if (clientY < rect.top + rect.height / 2) return { reference: block, lineY: rect.top };
  }
  const last = blocks[blocks.length - 1];
  return { reference: null, lineY: last ? last.getBoundingClientRect().bottom : 0 };
};

