// Làm sạch và escape HTML do người dùng soạn thảo trước khi hiển thị / in
import { getFileUrl } from './string';

const ALLOWED_TAGS = new Set([
  'P',
  'BR',
  'STRONG',
  'B',
  'EM',
  'I',
  'U',
  'S',
  'STRIKE',
  'DEL',
  'MARK',
  'UL',
  'OL',
  'LI',
  'H2',
  'H3',
  'H4',
  'BLOCKQUOTE',
  'HR',
  'SUB',
  'SUP',
  'DIV',
  'SPAN',
  'FONT',
]);

const NEWS_ALLOWED_TAGS = new Set([
  ...ALLOWED_TAGS,
  'FIGURE',
  'FIGCAPTION',
  'IMG',
  'VIDEO',
  'SOURCE',
  'IFRAME',
  'A',
]);

const MEDIA_ALLOWED_ATTRS = new Set([
  'src',
  'alt',
  'controls',
  'preload',
  'playsinline',
  'poster',
  'type',
  'class',
  'data-temp-id',
]);

const IFRAME_ALLOWED_ATTRS = new Set([
  'src',
  'title',
  'allow',
  'allowfullscreen',
  'loading',
  'class',
  'frameborder',
]);

const STYLE_ALLOWED_TAGS = new Set([
  'P',
  'SPAN',
  'DIV',
  'H2',
  'H3',
  'H4',
  'LI',
  'UL',
  'OL',
  'BLOCKQUOTE',
  'STRONG',
  'B',
  'EM',
  'I',
  'U',
  'S',
  'STRIKE',
  'DEL',
  'MARK',
  'SUB',
  'SUP',
  'FONT',
  'FIGCAPTION',
]);

const YOUTUBE_VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;
const SAFE_YOUTUBE_EMBED_REGEX =
  /^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com)\/embed\/[a-zA-Z0-9_-]{11}(\?[a-zA-Z0-9_=&-]+)?$/;

const SAFE_CSS_COLOR_REGEX =
  /^(#[0-9a-fA-F]{3,8}|rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)|hsla?\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\))$/i;

const SAFE_TEXT_ALIGN_REGEX = /^(left|center|right|justify)$/i;
const DANGEROUS_CSS_TOKEN_REGEX = /(url\s*\(|expression\s*\(|javascript:|vbscript:|@import|\\)/i;

export const isSafeYoutubeEmbedUrl = (url: string): boolean => {
  return SAFE_YOUTUBE_EMBED_REGEX.test(url.trim());
};

export const extractYoutubeEmbedUrl = (rawUrl: string): string | null => {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  try {
    const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(normalized);
    const hostname = parsed.hostname.toLowerCase();

    let videoId: string | null = null;

    if (hostname === 'youtu.be' || hostname === 'www.youtu.be') {
      videoId = parsed.pathname.split('/').filter(Boolean)[0] || null;
    } else if (
      hostname === 'youtube.com' ||
      hostname === 'www.youtube.com' ||
      hostname === 'm.youtube.com' ||
      hostname === 'youtube-nocookie.com' ||
      hostname === 'www.youtube-nocookie.com'
    ) {
      if (parsed.pathname === '/watch') {
        videoId = parsed.searchParams.get('v');
      } else {
        const segments = parsed.pathname.split('/').filter(Boolean);
        if (
          segments.length >= 2 &&
          (segments[0] === 'embed' ||
            segments[0] === 'shorts' ||
            segments[0] === 'live' ||
            segments[0] === 'v')
        ) {
          videoId = segments[1];
        }
      }
    }

    if (videoId && YOUTUBE_VIDEO_ID_REGEX.test(videoId)) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return null;
  } catch {
    return null;
  }
};

const isSafeMediaUrl = (rawUrl: string): boolean => {
  const trimmed = rawUrl.trim().toLowerCase();
  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('/')
  );
};

const isSafeHrefUrl = (rawUrl: string): boolean => {
  const trimmed = rawUrl.trim().toLowerCase();
  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('#')
  );
};

const FIGURE_ALIGN_VALUES = new Set(['left', 'center', 'right', 'float-left', 'float-right']);
const FIGURE_WIDTH_STYLE_REGEX = /(?:^|;)\s*width\s*:\s*(\d{2,3})(?:\.\d+)?%\s*(?:;|$)/i;
const FIGURE_MIN_WIDTH_PERCENT = 15;

// Chỉ chấp nhận data-align thuộc danh sách trắng cho <figure>
const extractFigureAlign = (raw: string | null): string | null => {
  const value = raw?.trim().toLowerCase() || '';
  return FIGURE_ALIGN_VALUES.has(value) ? value : null;
};

// Chỉ chấp nhận duy nhất khai báo `width: N%` (15–100) từ style của <figure>
const extractFigureWidthStyle = (rawStyle: string | null): string | null => {
  if (!rawStyle || DANGEROUS_CSS_TOKEN_REGEX.test(rawStyle)) return null;
  const match = FIGURE_WIDTH_STYLE_REGEX.exec(rawStyle);
  if (!match) return null;
  const percent = Number(match[1]);
  if (percent < FIGURE_MIN_WIDTH_PERCENT || percent > 100) return null;
  return `width: ${percent}%`;
};

export const escapeHtml = (raw: string): string =>
  raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const sanitizeElementStyle = (element: Element, stripColors = false): string => {
  const rawStyle = element.getAttribute('style') || '';
  const alignAttr = element.getAttribute('align')?.trim() || '';
  const fontColorAttr = element.tagName === 'FONT' ? element.getAttribute('color')?.trim() || '' : '';

  const safeDeclarations: Record<string, string> = {};

  if (!stripColors && fontColorAttr && SAFE_CSS_COLOR_REGEX.test(fontColorAttr)) {
    safeDeclarations['color'] = fontColorAttr;
  }

  if (alignAttr && SAFE_TEXT_ALIGN_REGEX.test(alignAttr)) {
    safeDeclarations['text-align'] = alignAttr.toLowerCase();
  }

  if (rawStyle && !DANGEROUS_CSS_TOKEN_REGEX.test(rawStyle)) {
    rawStyle.split(';').forEach((part) => {
      const colonIdx = part.indexOf(':');
      if (colonIdx === -1) return;
      const prop = part.slice(0, colonIdx).trim().toLowerCase();
      const val = part.slice(colonIdx + 1).trim();
      if (!prop || !val || DANGEROUS_CSS_TOKEN_REGEX.test(val)) return;

      if (prop === 'color' && !stripColors && SAFE_CSS_COLOR_REGEX.test(val)) {
        safeDeclarations['color'] = val;
      } else if (
        prop === 'background-color' &&
        !stripColors &&
        (val.toLowerCase() === 'transparent' || SAFE_CSS_COLOR_REGEX.test(val))
      ) {
        if (val.toLowerCase() !== 'transparent') {
          safeDeclarations['background-color'] = val;
        }
      } else if (prop === 'text-align' && SAFE_TEXT_ALIGN_REGEX.test(val)) {
        safeDeclarations['text-align'] = val.toLowerCase();
      }
    });
  }

  return Object.entries(safeDeclarations)
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ');
};

const resolveNormalizedTag = (rawTag: string, mapHeadings = false): string => {
  if (rawTag === 'FONT') return 'span';
  if (rawTag === 'STRIKE') return 's';
  if (mapHeadings) {
    if (rawTag === 'H1') return 'h2';
    if (rawTag === 'H5' || rawTag === 'H6') return 'h4';
  }
  return rawTag.toLowerCase();
};

const sanitizeNode = (node: Node, output: Node, document: Document): void => {
  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      output.appendChild(document.createTextNode(child.textContent ?? ''));
      return;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) return;

    const element = child as Element;
    const tag = element.tagName;
    if (!ALLOWED_TAGS.has(tag)) {
      if (!['SCRIPT', 'STYLE'].includes(tag)) sanitizeNode(element, output, document);
      return;
    }

    const clean = document.createElement(resolveNormalizedTag(tag));
    if (STYLE_ALLOWED_TAGS.has(tag)) {
      const safeStyle = sanitizeElementStyle(element, false);
      if (safeStyle) clean.setAttribute('style', safeStyle);
    }
    sanitizeNode(element, clean, document);
    output.appendChild(clean);
  });
};

const sanitizeNewsNode = (
  node: Node,
  output: Node,
  document: Document,
  options?: { stripColors?: boolean; mapHeadings?: boolean },
): void => {
  const stripColors = Boolean(options?.stripColors);
  const mapHeadings = Boolean(options?.mapHeadings);

  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      output.appendChild(document.createTextNode(child.textContent ?? ''));
      return;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) return;

    const element = child as Element;
    const tag = element.tagName;
    const isMappedHeading = mapHeadings && (tag === 'H1' || tag === 'H5' || tag === 'H6');

    if (!NEWS_ALLOWED_TAGS.has(tag) && !isMappedHeading) {
      if (!['SCRIPT', 'STYLE'].includes(tag)) sanitizeNewsNode(element, output, document, options);
      return;
    }

    const clean = document.createElement(resolveNormalizedTag(tag, mapHeadings));

    if (tag === 'IFRAME') {
      const src = element.getAttribute('src')?.trim() || '';
      if (!src || !isSafeYoutubeEmbedUrl(src)) return;

      Array.from(element.attributes).forEach((attr) => {
        const attrName = attr.name.toLowerCase();
        if (!IFRAME_ALLOWED_ATTRS.has(attrName)) return;
        clean.setAttribute(attrName, attrName === 'src' ? src : attr.value);
      });
      output.appendChild(clean);
      return;
    }

    if (tag === 'IMG' || tag === 'VIDEO' || tag === 'SOURCE') {
      Array.from(element.attributes).forEach((attr) => {
        const attrName = attr.name.toLowerCase();
        if (!MEDIA_ALLOWED_ATTRS.has(attrName)) return;

        if (attrName === 'src' || attrName === 'poster') {
          const val = attr.value.trim();
          if (!isSafeMediaUrl(val)) return;
          const resolved = val.startsWith('/') ? getFileUrl(val) : val;
          clean.setAttribute(attrName, resolved);
          return;
        }
        clean.setAttribute(attrName, attr.value);
      });
      if (tag === 'VIDEO' && !clean.hasAttribute('controls')) {
        clean.setAttribute('controls', '');
      }
    } else if (tag === 'A') {
      const href = element.getAttribute('href')?.trim() || '';
      if (href && isSafeHrefUrl(href)) {
        clean.setAttribute('href', href);
        if (href.startsWith('http://') || href.startsWith('https://')) {
          clean.setAttribute('target', '_blank');
          clean.setAttribute('rel', 'noopener noreferrer');
        }
      }
      const cls = element.getAttribute('class');
      if (cls && !stripColors) clean.setAttribute('class', cls);
    } else if (tag === 'FIGURE' && !stripColors) {
      const cls = element.getAttribute('class');
      if (cls) clean.setAttribute('class', cls);
      const align = extractFigureAlign(element.getAttribute('data-align'));
      if (align) clean.setAttribute('data-align', align);
      const width = extractFigureWidthStyle(element.getAttribute('style'));
      if (width) clean.setAttribute('style', width);
    } else if (tag === 'FIGCAPTION' && !stripColors) {
      const cls = element.getAttribute('class');
      if (cls) clean.setAttribute('class', cls);
    }

    if (STYLE_ALLOWED_TAGS.has(tag) || isMappedHeading) {
      const safeStyle = sanitizeElementStyle(element, stripColors);
      if (safeStyle) clean.setAttribute('style', safeStyle);
    }

    sanitizeNewsNode(element, clean, document, options);
    output.appendChild(clean);
  });
};

const sanitizeHtmlOnServer = (rawHtml: string, allowMedia = true): string => {
  let cleaned = rawHtml
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|object|embed|form|input|button|textarea|select|meta|link|base)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<(script|style|object|embed|form|input|button|textarea|select|meta|link|base)[^>]*\/?>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s(href|src|poster|action)\s*=\s*(?:"\s*(?:javascript:|vbscript:|data:text\/html)[^"]*"|'\s*(?:javascript:|vbscript:|data:text\/html)[^']*')/gi, '');

  if (!allowMedia) {
    cleaned = cleaned.replace(/<(img|video|source|iframe|figure|figcaption)[^>]*\/?>/gi, '');
  } else {
    // Dựng lại thẻ <figure> chỉ với thuộc tính layout hợp lệ (data-align, style width %)
    cleaned = cleaned.replace(/<figure\b([^>]*)>/gi, (_match, attrs: string) => {
      const alignMatch = /\sdata-align\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(attrs);
      const styleMatch = /\sstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(attrs);
      const align = extractFigureAlign(alignMatch ? (alignMatch[1] ?? alignMatch[2]) : null);
      const width = extractFigureWidthStyle(styleMatch ? (styleMatch[1] ?? styleMatch[2]) : null);
      return `<figure${align ? ` data-align="${align}"` : ''}${width ? ` style="${width}"` : ''}>`;
    });
    cleaned = cleaned.replace(
      /\s(src|poster)\s*=\s*(["'])(\/[^"']+)\2/gi,
      (_match, attrName: string, quote: string, relPath: string) =>
        ` ${attrName}=${quote}${getFileUrl(relPath)}${quote}`,
    );
  }

  return cleaned;
};

// Làm sạch HTML cơ bản cho văn bản/hợp đồng (hỗ trợ căn lề, màu chữ, màu nền an toàn)
export function sanitizeRichHtml(html: string): string {
  if (!html) return '';
  if (typeof DOMParser === 'undefined') return sanitizeHtmlOnServer(html, false);

  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const container = parsed.createElement('div');
  sanitizeNode(parsed.body, container, parsed);
  return container.innerHTML;
}

// Làm sạch HTML bài viết tin tức (hỗ trợ ảnh, video, chú thích figure/figcaption, màu chữ/nền an toàn)
export function sanitizeNewsHtml(html: string): string {
  if (!html) return '';
  if (typeof DOMParser === 'undefined') return sanitizeHtmlOnServer(html, true);

  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const container = parsed.createElement('div');
  sanitizeNewsNode(parsed.body, container, parsed, { stripColors: false, mapHeadings: false });
  return container.innerHTML;
}

// Chuẩn hóa HTML khi người dùng Paste từ trang web khác (gỡ sạch nền đen/màu chữ ngoại lai nhưng giữ cấu trúc)
export function normalizePastedHtml(rawHtml: string): string {
  if (!rawHtml) return '';
  if (typeof DOMParser === 'undefined') return sanitizeHtmlOnServer(rawHtml, true);

  const parsed = new DOMParser().parseFromString(rawHtml, 'text/html');
  const container = parsed.createElement('div');
  sanitizeNewsNode(parsed.body, container, parsed, { stripColors: true, mapHeadings: true });
  return container.innerHTML;
}
