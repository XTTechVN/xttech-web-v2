// Làm sạch và escape HTML do người dùng soạn thảo trước khi hiển thị / in
import { getFileUrl } from './string';

const ALLOWED_TAGS = new Set([
  'P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'UL', 'OL', 'LI', 'H3', 'H4', 'BLOCKQUOTE', 'DIV', 'SPAN',
]);

const NEWS_ALLOWED_TAGS = new Set([
  ...ALLOWED_TAGS,
  'H2',
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

const YOUTUBE_VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;
const SAFE_YOUTUBE_EMBED_REGEX =
  /^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com)\/embed\/[a-zA-Z0-9_-]{11}(\?[a-zA-Z0-9_=&-]+)?$/;

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

export const escapeHtml = (raw: string): string =>
  raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const sanitizeNode = (node: Node, output: Node, document: Document): void => {
  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      output.appendChild(document.createTextNode(child.textContent ?? ''));
      return;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) return;

    const element = child as Element;
    if (!ALLOWED_TAGS.has(element.tagName)) {
      // Thẻ không cho phép: bỏ thẻ nhưng giữ nội dung chữ bên trong (trừ script/style)
      if (!['SCRIPT', 'STYLE'].includes(element.tagName)) sanitizeNode(element, output, document);
      return;
    }
    const clean = document.createElement(element.tagName.toLowerCase());
    sanitizeNode(element, clean, document);
    output.appendChild(clean);
  });
};

const sanitizeNewsNode = (node: Node, output: Node, document: Document): void => {
  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      output.appendChild(document.createTextNode(child.textContent ?? ''));
      return;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) return;

    const element = child as Element;
    const tag = element.tagName;
    if (!NEWS_ALLOWED_TAGS.has(tag)) {
      if (!['SCRIPT', 'STYLE'].includes(tag)) sanitizeNewsNode(element, output, document);
      return;
    }

    const clean = document.createElement(tag.toLowerCase());

    if (tag === 'IFRAME') {
      const src = element.getAttribute('src')?.trim() || '';
      if (!src || !isSafeYoutubeEmbedUrl(src)) return;

      Array.from(element.attributes).forEach((attr) => {
        const attrName = attr.name.toLowerCase();
        if (!IFRAME_ALLOWED_ATTRS.has(attrName)) return;
        if (attrName === 'src') {
          clean.setAttribute('src', src);
          return;
        }
        clean.setAttribute(attrName, attr.value);
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
      if (cls) clean.setAttribute('class', cls);
    } else if (tag === 'FIGURE' || tag === 'FIGCAPTION') {
      const cls = element.getAttribute('class');
      if (cls) clean.setAttribute('class', cls);
    }

    sanitizeNewsNode(element, clean, document);
    output.appendChild(clean);
  });
};

// Chỉ giữ các thẻ định dạng văn bản cơ bản, loại bỏ mọi thuộc tính (onclick, style, href...)
export function sanitizeRichHtml(html: string): string {
  if (typeof DOMParser === 'undefined') return escapeHtml(html);

  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const container = parsed.createElement('div');
  sanitizeNode(parsed.body, container, parsed);
  return container.innerHTML;
}

// Làm sạch HTML bài viết tin tức (hỗ trợ ảnh, video, chú thích figure/figcaption và chuyển đường dẫn MinIO tương đối)
export function sanitizeNewsHtml(html: string): string {
  if (!html) return '';
  if (typeof DOMParser === 'undefined') return escapeHtml(html);

  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const container = parsed.createElement('div');
  sanitizeNewsNode(parsed.body, container, parsed);
  return container.innerHTML;
}
