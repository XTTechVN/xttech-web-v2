// Mở cửa sổ in với nội dung HTML đã dựng sẵn (đã escape bằng esc()).
export const esc = (v: unknown) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

export function printHtml(title: string, body: string) {
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(
    `<html><head><meta charset="utf-8"><title>${esc(title)}</title><style>body{font-family:serif;padding:24px;line-height:1.45;font-size:13px}h1,h2{text-align:center;margin:4px 0}table{width:100%;border-collapse:collapse;margin:8px 0}th,td{border:1px solid #444;padding:4px 6px;text-align:left}td.n{text-align:right}</style></head><body>${body}</body></html>`,
  );
  w.document.close();
  w.onload = () => w.print();
}
