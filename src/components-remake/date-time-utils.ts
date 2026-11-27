export type DateTimeMode = 'date' | 'time' | 'datetime' | 'month';

// Mẫu gõ: mỗi "x" là một chữ số, ký tự khác là dấu ngăn tự chèn
const TEMPLATE: Record<DateTimeMode, string> = {
  date: 'xx/xx/xxxx',
  time: 'xx:xx',
  month: 'xx/xxxx',
  datetime: 'xx/xx/xxxx xx:xx',
};

export const PLACEHOLDER: Record<DateTimeMode, string> = {
  date: 'dd/mm/yyyy',
  time: 'hh:mm',
  month: 'mm/yyyy',
  datetime: 'dd/mm/yyyy hh:mm',
};

export const pad = (n: number) => String(n).padStart(2, '0');

/** Chỉ giữ chữ số rồi chèn dấu ngăn theo mẫu; dấu chỉ xuất hiện khi còn chữ số theo sau nên xóa lùi vẫn mượt */
export function maskInput(mode: DateTimeMode, raw: string): string {
  const digits = raw.replace(/\D/g, '');
  let out = '';
  let i = 0;
  for (const c of TEMPLATE[mode]) {
    if (i >= digits.length) break;
    if (c === 'x') out += digits[i++];
    else out += c;
  }
  return out;
}

const parseDate = (d: number, m: number, y: number) => {
  const dt = new Date(y, m - 1, d);
  const ok = y >= 1900 && dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
  return ok ? `${y}-${pad(m)}-${pad(d)}` : null;
};
const parseTime = (h: number, mi: number) => (h < 24 && mi < 60 ? `${pad(h)}:${pad(mi)}` : null);

/** Chữ gõ → giá trị chuẩn (YYYY-MM-DD, HH:MM, YYYY-MM, YYYY-MM-DDTHH:MM); null nếu chưa đủ hoặc không hợp lệ */
export function parseInput(mode: DateTimeMode, text: string): string | null {
  if (text.length !== TEMPLATE[mode].length) return null;
  const n = text.split(/\D+/).map(Number);
  if (mode === 'date') return parseDate(n[0], n[1], n[2]);
  if (mode === 'time') return parseTime(n[0], n[1]);
  if (mode === 'month') return n[0] >= 1 && n[0] <= 12 && n[1] >= 1900 ? `${n[1]}-${pad(n[0])}` : null;
  const date = parseDate(n[0], n[1], n[2]);
  const time = parseTime(n[3], n[4]);
  return date && time ? `${date}T${time}` : null;
}

/** Giá trị chuẩn → chữ hiển thị trong ô */
export function formatValue(mode: DateTimeMode, value: string): string {
  if (!value) return '';
  const [d = '', t = ''] = value.split(/[T ]/);
  const date = () => d.split('-').reverse().join('/');
  if (mode === 'time') return value.slice(0, 5);
  if (mode === 'month') return `${d.slice(5, 7)}/${d.slice(0, 4)}`;
  if (mode === 'date') return date();
  return t ? `${date()} ${t.slice(0, 5)}` : date();
}

export const datePart = (value: string) => value.split(/[T ]/)[0] ?? '';
export const timePart = (value: string, mode: DateTimeMode) => (mode === 'time' ? value : (value.split(/[T ]/)[1] ?? '')).slice(0, 5);
export const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
