// CSS thuần dùng chung cho xem trước trên màn hình và in (iframe in không có Tailwind)
export const CONTRACT_DOCUMENT_CSS = `
.ct-page {
  box-sizing: border-box;
  width: 210mm;
  min-height: 297mm;
  padding: 20mm 20mm 20mm 30mm;
  background: #fff;
  color: #000;
  font-family: 'Times New Roman', Times, serif;
  font-size: 13pt;
  line-height: 1.4;
  text-align: justify;
}
.ct-page * { box-sizing: border-box; }
.ct-center { text-align: center; }
.ct-national { margin: 0; font-weight: bold; text-align: center; }
.ct-motto { text-decoration: underline; }
.ct-title { margin: 14pt 0 2pt; font-size: 16pt; font-weight: bold; text-align: center; }
.ct-number { margin: 0 0 10pt; font-weight: bold; text-align: center; }
.ct-line { margin: 0 0 3pt; white-space: pre-wrap; }
.ct-heading { margin: 10pt 0 3pt; font-weight: bold; }
.ct-article { margin: 12pt 0 4pt; font-weight: bold; text-transform: uppercase; }
.ct-body { margin: 0; }
.ct-body p { margin: 0 0 4pt; }
.ct-body ul, .ct-body ol { margin: 0 0 4pt; padding-left: 22pt; }
.ct-body li { margin: 0 0 2pt; }
.ct-body h3, .ct-body h4 { margin: 8pt 0 4pt; font-size: 13pt; font-weight: bold; text-transform: uppercase; }
.ct-body blockquote { margin: 0 0 4pt 16pt; font-style: italic; }
.ct-hint { margin: 12pt 0; padding: 8pt; border: 1px dashed #94a3b8; color: #64748b; font-size: 11pt; font-style: italic; text-align: center; }
.ct-notice { display: flex; align-items: flex-start; gap: 14pt; margin-top: 14pt; }
.ct-notice-text { flex: 1; }
.ct-notice-text .ct-heading { margin-top: 0; text-decoration: underline; }
.ct-qr { width: 38mm; height: 38mm; object-fit: contain; }
.ct-sign { width: 100%; margin-top: 16pt; border-collapse: collapse; page-break-inside: avoid; }
.ct-sign td { width: 50%; padding: 0; text-align: center; vertical-align: top; }
.ct-sign-label { font-weight: bold; text-transform: uppercase; }
.ct-sign-hint { font-style: italic; }
.ct-sign-space { height: 70pt; }
`;

// Chỉ áp dụng trong iframe in, tránh ảnh hưởng tới việc in trang ứng dụng
export const CONTRACT_PRINT_CSS = `
@page { size: A4; margin: 20mm 20mm 20mm 30mm; }
.ct-page { width: auto; min-height: 0; padding: 0; }
.ct-no-print { display: none !important; }
`;
