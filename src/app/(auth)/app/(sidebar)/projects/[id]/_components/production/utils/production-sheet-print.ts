import { escapeHtml } from '@/utils/html';

const SHEET_PRINT_CSS = `
  @page {
    size: A4 portrait;
    margin: 8mm;
  }
  html,
  body {
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
    color: #0f172a !important;
    height: auto !important;
    min-height: 0 !important;
    overflow: visible !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .sheets-print-container {
    margin: 0 !important;
    padding: 0 !important;
  }
  .sheets-print-container > * + * {
    margin-top: 0 !important;
  }
  .print-page-break {
    page-break-after: always !important;
    break-after: page !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  .print-page-break:last-child {
    page-break-after: avoid !important;
    break-after: avoid !important;
  }
  .production-sheet-page {
    min-height: 0 !important;
    max-width: none !important;
    width: 100% !important;
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  .production-sheet-left-col {
    grid-column: span 5 / span 5 !important;
  }
  .production-sheet-right-col {
    grid-column: span 7 / span 7 !important;
  }
`;

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

export async function printProductionSheets(
  containerEl: HTMLElement,
  orderCode: string,
): Promise<void> {
  const headStyles = Array.from(
    document.querySelectorAll('style, link[rel="stylesheet"]'),
  )
    .map((node) => node.outerHTML)
    .join('\n');

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
      `<title>${escapeHtml(`The-san-xuat-${orderCode}`)}</title>` +
      `${headStyles}<style>${SHEET_PRINT_CSS}</style></head>` +
      `<body>${containerEl.outerHTML}</body></html>`,
  );
  frameDoc.close();

  await waitForImages(frameDoc);
  await new Promise<void>((resolve) => setTimeout(resolve, 150));

  frameWindow.addEventListener('afterprint', () => iframe.remove(), { once: true });
  frameWindow.focus();
  frameWindow.print();
}

