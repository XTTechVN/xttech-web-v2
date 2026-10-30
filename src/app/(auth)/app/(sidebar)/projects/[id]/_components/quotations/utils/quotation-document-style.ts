// CSS thuần dùng chung cho xem trước trên màn hình và in (iframe in không có Tailwind)
export const QUOTATION_DOCUMENT_CSS = `
.qt-page {
  box-sizing: border-box;
  width: 210mm;
  min-height: 297mm;
  padding: 10mm 10mm 14mm;
  background: #fff;
  color: #000;
  font-family: 'Times New Roman', Times, serif;
  font-size: 10.5pt;
  line-height: 1.35;
}
.qt-page * { box-sizing: border-box; }
.qt-header { display: flex; align-items: center; gap: 10pt; }
.qt-logo { width: 22mm; height: 22mm; object-fit: contain; }
.qt-company { flex: 1; font-size: 9pt; }
.qt-company-name { margin: 0 0 2pt; font-size: 10.5pt; font-weight: bold; color: #c00000; text-transform: uppercase; }
.qt-company p { margin: 0; }
.qt-date { margin: 10pt 0 0; text-align: right; font-style: italic; }
.qt-doc-title { margin: 6pt 0 0; font-size: 12pt; font-weight: bold; text-align: center; }
.qt-title { margin: 2pt 0 0; font-size: 12pt; font-weight: bold; text-align: center; }
.qt-code { margin: 2pt 0 0; font-weight: bold; text-align: center; }
.qt-contract-ref { margin: 0 0 6pt; font-style: italic; text-align: center; }
.qt-customer { margin: 0 0 6pt; }
.qt-customer p { margin: 0 0 2pt; }
.qt-customer b { display: inline-block; min-width: 26mm; }
.qt-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.qt-table th, .qt-table td { padding: 2pt 3pt; border: 1px solid #000; font-size: 9.5pt; vertical-align: middle; word-break: break-word; }
.qt-table th { background: #f2f2f2; text-align: center; font-weight: bold; }
.qt-table tr { page-break-inside: avoid; }
.qt-center { text-align: center; }
.qt-right { text-align: right; }
.qt-left { text-align: left; }
.qt-floor td { background: #b5e6a2; font-weight: bold; font-size: 10.5pt; }
.qt-accessory td { font-style: italic; }
.qt-sum td { background: #d9d9d9; font-weight: bold; }
.qt-payable td { background: #d9d9d9; font-weight: bold; color: #c00000; }
.qt-thumb { display: block; width: 100%; max-width: 100%; height: 22mm; max-height: 22mm; margin: 0 auto; object-fit: contain; }
.qt-thumb svg { display: block; width: 100%; height: 22mm; max-width: 100%; max-height: 22mm; margin: 0 auto; }
.qt-words, .qt-advance { margin: 6pt 0 0; }
.qt-notes-title { margin: 8pt 0 2pt; font-weight: bold; }
.qt-notes { margin: 0; white-space: pre-wrap; }
.qt-sign { width: 100%; margin-top: 14pt; border-collapse: collapse; page-break-inside: avoid; }
.qt-sign td { width: 50%; padding: 0; text-align: center; vertical-align: top; font-weight: bold; text-transform: uppercase; }
.qt-sign-space { height: 60pt; }
`;

// Chỉ áp dụng trong iframe in, tránh ảnh hưởng tới việc in trang ứng dụng
export const QUOTATION_PRINT_CSS = `
@page { size: A4; margin: 10mm; }
.qt-page { width: auto; min-height: 0; padding: 0; }
`;
