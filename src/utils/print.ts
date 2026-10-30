import { escapeHtml } from './html';

// Ảnh lỗi cũng được coi là đã xong để không treo lệnh in
const waitForImages = (doc: Document): Promise<unknown> =>
  Promise.all(
    Array.from(doc.images)
      .filter((image) => !image.complete)
      .map(
        (image) =>
          new Promise<void>((resolve) => {
            image.addEventListener('load', () => resolve(), { once: true });
            image.addEventListener('error', () => resolve(), { once: true });
          }),
      ),
  );

// In một đoạn HTML qua iframe ẩn: không cần cửa sổ mới và không phụ thuộc CSS của ứng dụng
export async function printHtmlDocument(html: string, title: string, css: string): Promise<void> {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(iframe);

  const frameDoc = iframe.contentDocument;
  const frameWindow = iframe.contentWindow;
  if (!frameDoc || !frameWindow) {
    iframe.remove();
    return;
  }

  frameDoc.open();
  frameDoc.write(
    `<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"><base href="${window.location.origin}/">` +
      `<title>${escapeHtml(title)}</title><style>${css}</style></head><body>${html}</body></html>`,
  );
  frameDoc.close();

  await waitForImages(frameDoc);
  frameWindow.addEventListener('afterprint', () => iframe.remove(), { once: true });
  frameWindow.focus();
  frameWindow.print();
}
