// Làm sạch và escape HTML do người dùng soạn thảo trước khi hiển thị / in

const ALLOWED_TAGS = new Set([
  'P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'UL', 'OL', 'LI', 'H3', 'H4', 'BLOCKQUOTE', 'DIV', 'SPAN',
]);

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

// Chỉ giữ các thẻ định dạng văn bản cơ bản, loại bỏ mọi thuộc tính (onclick, style, href...)
export function sanitizeRichHtml(html: string): string {
  if (typeof DOMParser === 'undefined') return escapeHtml(html);

  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const container = parsed.createElement('div');
  sanitizeNode(parsed.body, container, parsed);
  return container.innerHTML;
}
