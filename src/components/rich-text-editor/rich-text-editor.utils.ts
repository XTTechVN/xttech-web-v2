import { escapeHtml } from '@/utils/html';

export interface MediaChunkInput {
  tempId: string;
  previewUrl: string;
  mediaType: 'image' | 'video';
  defaultCaption?: string;
}

const PROTECTED_MEDIA_TAGS = new Set(['FIGURE', 'IMG', 'VIDEO', 'SOURCE', 'IFRAME']);

const collectTargetElementsInEditor = (editorEl: HTMLElement): HTMLElement[] => {
  const selection = typeof window !== 'undefined' ? window.getSelection() : null;
  const targets = new Set<HTMLElement>();

  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    if (editorEl.contains(range.commonAncestorContainer)) {
      if (!range.collapsed) {
        const allElements = editorEl.querySelectorAll<HTMLElement>('*');
        allElements.forEach((el) => {
          if (PROTECTED_MEDIA_TAGS.has(el.tagName)) return;
          try {
            if (range.intersectsNode(el)) targets.add(el);
          } catch {
            // Bá» qua náº¿u node khÃ´ng há»£p lá»‡
          }
        });
      }

      let cursorNode: Node | null = range.startContainer;
      while (cursorNode && cursorNode !== editorEl) {
        if (cursorNode.nodeType === Node.ELEMENT_NODE) {
          const el = cursorNode as HTMLElement;
          if (!PROTECTED_MEDIA_TAGS.has(el.tagName)) {
            targets.add(el);
            el.querySelectorAll<HTMLElement>('*').forEach((child) => {
              if (!PROTECTED_MEDIA_TAGS.has(child.tagName)) targets.add(child);
            });
          }
        }
        cursorNode = cursorNode.parentNode;
      }
    }
  }

  if (targets.size === 0) {
    editorEl.querySelectorAll<HTMLElement>('*').forEach((el) => {
      if (!PROTECTED_MEDIA_TAGS.has(el.tagName)) targets.add(el);
    });
  }

  return Array.from(targets);
};

const cleanupEmptyStyleAttr = (el: HTMLElement) => {
  const styleVal = el.getAttribute('style')?.trim();
  if (!styleVal) el.removeAttribute('style');
};

export const applyEditorTextColor = (editorEl: HTMLElement, color: string | null): void => {
  const selection = typeof window !== 'undefined' ? window.getSelection() : null;
  const hasRangeSelection = Boolean(
    selection &&
      selection.rangeCount > 0 &&
      !selection.getRangeAt(0).collapsed &&
      editorEl.contains(selection.getRangeAt(0).commonAncestorContainer),
  );

  try {
    document.execCommand('styleWithCSS', false, 'true');
  } catch {
    // TrÃ¬nh duyá»‡t khÃ´ng há»— trá»£ styleWithCSS
  }

  if (color === null) {
    const targets = collectTargetElementsInEditor(editorEl);
    targets.forEach((el) => {
      el.style.color = '';
      el.removeAttribute('color');
      cleanupEmptyStyleAttr(el);
    });
    if (hasRangeSelection) {
      document.execCommand('foreColor', false, '#0F172A');
    }
    return;
  }

  if (hasRangeSelection) {
    document.execCommand('foreColor', false, color);
  } else {
    const targets = collectTargetElementsInEditor(editorEl);
    targets.forEach((el) => {
      el.style.color = color;
    });
  }
};

export const applyEditorHighlightColor = (
  editorEl: HTMLElement,
  backgroundColor: string | null,
): void => {
  const selection = typeof window !== 'undefined' ? window.getSelection() : null;
  const hasRangeSelection = Boolean(
    selection &&
      selection.rangeCount > 0 &&
      !selection.getRangeAt(0).collapsed &&
      editorEl.contains(selection.getRangeAt(0).commonAncestorContainer),
  );

  try {
    document.execCommand('styleWithCSS', false, 'true');
  } catch {
    // TrÃ¬nh duyá»‡t khÃ´ng há»— trá»£ styleWithCSS
  }

  if (backgroundColor === null) {
    if (hasRangeSelection) {
      document.execCommand('hiliteColor', false, 'transparent');
    }
    const targets = collectTargetElementsInEditor(editorEl);
    targets.forEach((el) => {
      el.style.backgroundColor = '';
      el.style.background = '';
      el.removeAttribute('bgcolor');
      if (el.tagName === 'MARK') {
        el.style.backgroundColor = 'transparent';
      }
      cleanupEmptyStyleAttr(el);
    });
    return;
  }

  if (hasRangeSelection) {
    document.execCommand('hiliteColor', false, backgroundColor);
  } else {
    const targets = collectTargetElementsInEditor(editorEl);
    targets.forEach((el) => {
      if (['P', 'DIV', 'LI', 'H2', 'H3', 'H4', 'BLOCKQUOTE', 'SPAN'].includes(el.tagName)) {
        el.style.backgroundColor = backgroundColor;
      }
    });
  }
};

export const clearEditorSelectionFormatting = (editorEl: HTMLElement): void => {
  const selection = typeof window !== 'undefined' ? window.getSelection() : null;
  const hasRangeSelection = Boolean(
    selection &&
      selection.rangeCount > 0 &&
      !selection.getRangeAt(0).collapsed &&
      editorEl.contains(selection.getRangeAt(0).commonAncestorContainer),
  );

  if (hasRangeSelection) {
    document.execCommand('removeFormat', false);
  }

  const targets = collectTargetElementsInEditor(editorEl);
  targets.forEach((el) => {
    el.style.backgroundColor = '';
    el.style.background = '';
    el.style.color = '';
    el.style.fontFamily = '';
    el.style.fontSize = '';
    el.style.lineHeight = '';
    el.removeAttribute('bgcolor');
    el.removeAttribute('color');
    el.removeAttribute('face');
    el.removeAttribute('size');
    cleanupEmptyStyleAttr(el);
  });
};

export const countEditorWordsAndChars = (html: string): { words: number; chars: number } => {
  if (!html) return { words: 0, chars: 0 };
  const plainText = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();

  if (!plainText) return { words: 0, chars: 0 };
  const words = plainText.split(' ').filter(Boolean).length;
  return { words, chars: plainText.length };
};

export const buildMediaHtmlChunks = (items: MediaChunkInput[]): string =>
  items
    .map((item) => {
      const caption = escapeHtml(item.defaultCaption || 'Nháº­p chÃº thÃ­ch...');
      const safeTempId = escapeHtml(item.tempId);
      const safeSrc = escapeHtml(item.previewUrl);
      if (item.mediaType === 'video') {
        return `<figure data-align="center" style="width: 100%"><video data-temp-id="${safeTempId}" src="${safeSrc}" controls playsinline preload="metadata"></video><figcaption>${caption}</figcaption></figure><p><br/></p>`;
      }
      return `<figure data-align="center" style="width: 100%"><img data-temp-id="${safeTempId}" src="${safeSrc}" alt="${caption}" /><figcaption>${caption}</figcaption></figure><p><br/></p>`;
    })
    .join('');

export const buildYoutubeEmbedHtml = (embedUrl: string, caption: string): string => {
  const safeCaption = escapeHtml(caption || 'Nháº­p chÃº thÃ­ch video...');
  return `<figure data-align="center" style="width: 100%"><iframe src="${embedUrl}" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen="true" loading="lazy" class="w-full aspect-video rounded-lg border-0"></iframe><figcaption>${safeCaption}</figcaption></figure><p><br/></p>`;
};
