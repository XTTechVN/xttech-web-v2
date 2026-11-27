'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { api, getFileExtension } from '@/utils';
import { cn } from '@/utils/cn';
import { BTN_PRIMARY } from './form';

interface Props {
  url: string;
  fileName: string;
  mimeType?: string;
  /** lấp đầy khung cha (xem toàn màn hình) thay vì chiều cao cố định */
  fill?: boolean;
}

type Kind = 'image' | 'pdf' | 'html' | 'word' | 'excel' | 'other';
const MAX_ROWS = 500;

function kindOf(name: string, mime = ''): Kind {
  const ext = getFileExtension(name).toLowerCase();
  const m = mime.toLowerCase();
  if (m.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return 'image';
  if (m.includes('pdf') || ext === 'pdf') return 'pdf';
  if (m.includes('html') || ext === 'html' || ext === 'htm') return 'html';
  if (m.includes('word') || ext === 'docx' || ext === 'doc') return 'word';
  if (m.includes('sheet') || m.includes('excel') || ['xlsx', 'xls', 'csv'].includes(ext)) return 'excel';
  return 'other';
}

function Word({ buffer }: { buffer: ArrayBuffer }) {
  const box = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  const head = new Uint8Array(buffer.slice(0, 2));
  const oldFormat = head[0] === 0xd0 && head[1] === 0xcf;
  useEffect(() => {
    if (oldFormat) return;
    let live = true;
    import('docx-preview')
      .then(
        ({ renderAsync }) =>
          box.current && live && renderAsync(buffer, box.current, undefined, { inWrapper: false, breakPages: true, useBase64URL: true }),
      )
      .catch(() => live && setError('Không xem trực tiếp được tệp Word này, hãy tải về máy.'));
    const el = box.current;
    return () => {
      live = false;
      if (el) el.innerHTML = '';
    };
  }, [buffer, oldFormat]);
  const msg = oldFormat ? 'Tệp Word cũ (.doc) không xem trực tiếp được, hãy tải về máy.' : error;
  return msg ? (
    <p role="alert" className="p-4 text-sm text-red-600">
      {msg}
    </p>
  ) : (
    <div ref={box} className="overflow-x-auto bg-white p-2" />
  );
}

const colLabel = (i: number) => {
  let out = '';
  for (let n = i; n >= 0; n = Math.floor(n / 26) - 1) out = String.fromCharCode((n % 26) + 65) + out;
  return out;
};

interface Sheet {
  name: string;
  rows: unknown[][];
  cols: number;
}

const HEAD =
  'sticky top-0 z-10 select-none whitespace-nowrap border-b border-r border-slate-200/80 bg-slate-50 px-3 py-1.5 text-center text-xs font-semibold text-slate-500';
const ROWNUM = 'sticky left-0 z-10 w-12 min-w-12 select-none border-r border-slate-200/80 bg-slate-50 px-2 py-1 text-center text-xs text-slate-500';

// Bảng tính kiểu Excel: tab trang tính kèm số dòng, tiêu đề cột A, B, C… và số dòng cố định khi cuộn, tìm trong bảng.
function Excel({ buffer, fill }: { buffer: ArrayBuffer; fill?: boolean }) {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [idx, setIdx] = useState(0);
  const [q, setQ] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    let live = true;
    import('xlsx')
      .then((X) => {
        const [a, b] = new Uint8Array(buffer.slice(0, 2));
        const binary = (a === 0x50 && b === 0x4b) || (a === 0xd0 && b === 0xcf);
        const wb = binary ? X.read(buffer, { type: 'array' }) : X.read(new TextDecoder().decode(buffer), { type: 'string' });
        const list = wb.SheetNames.map((name) => {
          const rows = X.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: '', blankrows: false }) as unknown[][];
          return { name, rows, cols: Math.max(1, ...rows.map((r) => r.length)) };
        });
        if (live) setSheets(list);
      })
      .catch(() => live && setError('Không đọc được tệp Excel này, hãy tải về máy.'));
    return () => {
      live = false;
    };
  }, [buffer]);
  const sheet = sheets[idx];
  const { rows, total } = useMemo(() => {
    if (!sheet) return { rows: [], total: 0 };
    const f = q.trim().toLowerCase();
    const all = sheet.rows.map((r, i) => ({ r, n: i + 1 }));
    const hit = f
      ? all.filter(({ r }) =>
          r.some((c) =>
            String(c ?? '')
              .toLowerCase()
              .includes(f),
          ),
        )
      : all;
    return { rows: hit.slice(0, MAX_ROWS), total: hit.length };
  }, [sheet, q]);
  if (error)
    return (
      <p role="alert" className="p-4 text-sm text-red-600">
        {error}
      </p>
    );
  if (!sheet) return <p className="p-4 text-sm text-slate-500">Đang đọc bảng tính…</p>;
  return (
    <div className={cn('flex flex-col', fill && 'h-full')}>
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 p-2">
        <div role="tablist" aria-label="Trang tính" className="flex min-w-0 max-w-full gap-1 overflow-x-auto">
          {sheets.map((s, i) => (
            <button
              key={s.name}
              type="button"
              role="tab"
              aria-selected={i === idx}
              onClick={() => {
                setIdx(i);
                setQ('');
              }}
              className={cn(
                'flex h-9 flex-none items-center gap-2 rounded-control border px-3 text-sm',
                i === idx ? 'border-primary bg-primary text-white' : 'border-slate-200/80 bg-white',
              )}
            >
              <span className="max-w-40 truncate">{s.name}</span>
              <span className="text-xs opacity-80">{s.rows.length}</span>
            </button>
          ))}
        </div>
        <span className="ml-auto hidden flex-none text-xs text-slate-500 md:inline">
          {sheet.rows.length} hàng × {sheet.cols} cột
        </span>
        <input
          type="search"
          aria-label="Tìm trong bảng tính"
          placeholder="Tìm trong bảng…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="h-9 min-w-0 flex-1 rounded-control border border-slate-200/80 bg-white px-3 text-base outline-none focus-visible:border-primary md:w-52 md:flex-none md:text-sm"
        />
      </div>
      {total > MAX_ROWS && (
        <p className="border-b border-slate-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-700">
          Đang hiển thị {MAX_ROWS}/{total} dòng, tải về để xem đủ.
        </p>
      )}
      <div className={cn('overflow-auto', fill ? 'min-h-0 flex-1' : 'max-h-[60dvh]')}>
        <table className="w-full border-collapse bg-white text-sm">
          <thead>
            <tr>
              <th className={cn(HEAD, 'left-0 z-20 w-12 min-w-12')}>#</th>
              {Array.from({ length: sheet.cols }, (_, c) => (
                <th key={c} scope="col" className={cn(HEAD, 'min-w-24')}>
                  {colLabel(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={sheet.cols + 1} className="py-12 text-center text-sm text-slate-500">
                  {q ? 'Không có dòng nào khớp từ khoá.' : 'Bảng tính này không có dữ liệu.'}
                </td>
              </tr>
            ) : (
              rows.map(({ r, n }) => (
                <tr key={n} className="border-b border-slate-200 md:hover:bg-primary/10">
                  <td className={ROWNUM}>{n}</td>
                  {Array.from({ length: sheet.cols }, (_, c) => {
                    const v = r[c];
                    const text = v == null ? '' : String(v);
                    return (
                      <td
                        key={c}
                        title={text}
                        className={cn(
                          'max-w-72 truncate border-r border-slate-200 px-3 py-1.5 whitespace-nowrap',
                          typeof v === 'number' && 'text-right tabular-nums',
                        )}
                      >
                        {text}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Xem trước tệp ngay trong trang: ảnh, PDF, HTML, Word, Excel; định dạng khác thì chỉ tải về.
export function FileViewer({ url, fileName, mimeType, fill }: Props) {
  const tall = fill ? 'h-full' : 'h-[70dvh]';
  const kind = kindOf(fileName, mimeType);
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [error, setError] = useState('');
  const [blobUrl, setBlobUrl] = useState('');

  useEffect(() => {
    if (kind === 'other') return;
    let live = true;
    let made = '';
    api
      .get(url, { responseType: 'arraybuffer' })
      .then((r) => {
        if (!live) return;
        if (!r.data?.byteLength) return setError('Tệp rỗng.');
        setBuffer(r.data);
        if (kind === 'pdf' || kind === 'image') {
          made = URL.createObjectURL(new Blob([r.data], { type: kind === 'pdf' ? 'application/pdf' : mimeType || 'image/*' }));
          setBlobUrl(made);
        }
      })
      .catch(() => live && setError('Không tải được nội dung tệp.'));
    return () => {
      live = false;
      if (made) URL.revokeObjectURL(made);
    };
  }, [url, kind, mimeType]);

  const html = useMemo(() => (kind === 'html' && buffer ? new TextDecoder().decode(buffer) : ''), [kind, buffer]);

  if (kind === 'other')
    return (
      <div className="flex flex-col items-center gap-3 p-6 text-center">
        <p className="text-sm text-slate-500">Định dạng này chưa xem trước được.</p>
        <a href={url} target="_blank" rel="noreferrer" className={BTN_PRIMARY}>
          <Download size={18} aria-hidden="true" />
          Tải về
        </a>
      </div>
    );
  if (error)
    return (
      <p role="alert" className="p-4 text-sm text-red-600">
        {error}
      </p>
    );
  if (!buffer) return <div aria-busy="true" aria-label="Đang tải tệp" className="h-64 animate-pulse bg-slate-200" />;
  if (kind === 'image')
    return (
      <div className={cn('flex items-center justify-center bg-slate-50 p-2', fill && 'h-full')}>
        <img src={blobUrl} alt={fileName} className={cn('max-w-full object-contain', fill ? 'max-h-full' : 'max-h-[70dvh]')} />
      </div>
    );
  if (kind === 'pdf') return <iframe title={fileName} src={blobUrl} className={cn(tall, 'w-full border-0')} />;
  if (kind === 'html') return <iframe title={fileName} srcDoc={html} sandbox="allow-same-origin" className={cn(tall, 'w-full border-0 bg-white')} />;
  if (kind === 'word') return <Word buffer={buffer} />;
  return <Excel buffer={buffer} fill={fill} />;
}
