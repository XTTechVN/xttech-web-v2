'use client';

import { Check, EllipsisVertical, File, FileArchive, FileImage, FileJson, FileSpreadsheet, FileText, Folder, FolderOpen, Presentation, type LucideIcon } from 'lucide-react';
import { DOCUMENT_TYPE_MAP, type DocumentCategory, type DocumentItem } from '@/types';
import { cn } from '@/utils/cn';
import { Tag } from '@/components-remake';

export type Entry = { kind: 'folder'; f: DocumentCategory } | { kind: 'doc'; d: DocumentItem };

export const entryKey = (e: Entry) => (e.kind === 'folder' ? `folder-${e.f.id}` : `doc-${e.d.id}`);

const day = (s?: string | null) => (s ? new Date(s).toLocaleDateString('vi-VN') : '–');
const size = (n?: number) => (n ? (n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1e3))} KB`) : '–');

interface Kind {
  label?: string;
  Icon: LucideIcon;
  /** màu biểu tượng + nền, để phân biệt loại tệp ở một cái nhìn */
  tone: string;
}

const FILE_KINDS: [RegExp, Kind][] = [
  [/\.pdf$/, { label: 'PDF', Icon: FileText, tone: 'bg-red-50 text-red-600' }],
  [/\.docx?$/, { label: 'Word', Icon: FileText, tone: 'bg-blue-50 text-blue-600' }],
  [/\.(xlsx?|csv)$/, { label: 'Excel', Icon: FileSpreadsheet, tone: 'bg-green-50 text-green-600' }],
  [/\.pptx?$/, { label: 'PowerPoint', Icon: Presentation, tone: 'bg-orange-50 text-orange-600' }],
  [/\.(png|jpe?g|gif|webp|svg)$/, { label: 'Hình ảnh', Icon: FileImage, tone: 'bg-violet-50 text-violet-600' }],
  [/\.json$/, { label: 'JSON', Icon: FileJson, tone: 'bg-teal-50 text-teal-600' }],
  [/\.(zip|rar|7z)$/, { label: 'Nén', Icon: FileArchive, tone: 'bg-amber-50 text-amber-600' }],
  [/\.txt$/, { label: 'Văn bản', Icon: FileText, tone: 'bg-slate-100 text-slate-600' }],
];
const OTHER_KIND: Kind = { Icon: File, tone: 'bg-slate-100 text-slate-600' };

function kindOf(e: Entry): Kind {
  if (e.kind === 'folder') return { Icon: e.f.isShared ? FolderOpen : Folder, tone: 'bg-amber-50 text-amber-500' };
  const name = (e.d.currentVersion?.fileName ?? '').toLowerCase();
  return FILE_KINDS.find(([re]) => re.test(name))?.[1] ?? OTHER_KIND;
}

function KindIcon({ e, size: n = 20 }: { e: Entry; size?: number }) {
  const { Icon } = kindOf(e);
  return <Icon size={n} aria-hidden="true" />;
}

export const nameOf = (e: Entry) => (e.kind === 'folder' ? e.f.name : e.d.title);
const unread = (e: Entry) => e.kind === 'doc' && e.d.isRead === false;
// Loại "Khác" không cho biết gì: suy ra từ đuôi tệp
function typeOf(e: Entry) {
  if (e.kind === 'folder') return 'Thư mục';
  const label = DOCUMENT_TYPE_MAP[e.d.documentType]?.label;
  if (label && e.d.documentType !== 'other') return label;
  return kindOf(e).label ?? label ?? 'Khác';
}
const ownerOf = (e: Entry) => (e.kind === 'folder' ? e.f.createdByName : e.d.createdBy?.fullName) ?? '–';
const dateOf = (e: Entry) => day(e.kind === 'folder' ? (e.f.updatedAt ?? e.f.createdAt) : (e.d.updatedAt ?? e.d.createdAt));
const sizeOf = (e: Entry) => (e.kind === 'folder' ? '–' : size(e.d.currentVersion?.fileSize));

/** Kéo thả để di chuyển vào thư mục (chuột): thả lên phần tử có `data-folder-id` */
export interface DragProps {
  onPointerDown: (ev: React.PointerEvent) => void;
  folderId?: number;
  over: boolean;
}

interface Handlers {
  selected: boolean;
  cut: boolean;
  /** đang ở chế độ chọn nhiều: bấm = chọn/bỏ chọn thay vì mở */
  picking: boolean;
  onOpen: (ev: React.MouseEvent) => void;
  onMenu: (ev: React.MouseEvent) => void;
  /** nhấp đúp (chuột): mở thư mục / xem tệp */
  onActivate: () => void;
  drag: DragProps;
}

// Nhấp đúp vào nút ⋮ không được mở mục
const activate = (fn: () => void) => (ev: React.MouseEvent) => {
  if (!(ev.target as HTMLElement).closest('button[aria-label^="Thao tác"]')) fn();
};

function Tile({ e, selected, picking }: { e: Entry; selected: boolean; picking: boolean }) {
  return (
    <span
      className={cn(
        'relative flex size-10 flex-none items-center justify-center rounded-control',
        selected && picking ? 'bg-primary text-white' : kindOf(e).tone,
      )}
    >
      {picking ? (
        selected ? (
          <Check size={20} aria-hidden="true" />
        ) : (
          <span className="size-5 rounded-full border-2 border-primary" aria-hidden="true" />
        )
      ) : (
        <KindIcon e={e} />
      )}
    </span>
  );
}

const MENU_BTN =
  'flex size-11 flex-none items-center justify-center rounded-full text-slate-500 transition-[background-color,transform] duration-200 active:scale-95 active:bg-slate-200 md:hover:bg-slate-200';

// Thẻ ở lưới: tên đậm + loại, một dòng phụ; ⋮ mở menu thao tác (điện thoại không có chuột phải).
export function EntryTile({ e, selected, cut, picking, onOpen, onMenu, onActivate, drag }: { e: Entry } & Handlers) {
  return (
    <li
      data-explorer-item="true"
      data-folder-id={drag.folderId}
      onPointerDown={drag.onPointerDown}
      onDoubleClick={activate(onActivate)}
      onContextMenu={onMenu}
      data-selected={selected}
      className={cn(
        'flex select-none items-center rounded-block border bg-white pl-3 transition-[background-color] duration-200',
        selected ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'border-slate-200',
        drag.over && 'border-primary bg-primary/10 ring-2 ring-primary',
        cut && 'opacity-50',
      )}
    >
      <button type="button" onClick={onOpen} className="flex min-h-14 min-w-0 flex-1 items-center gap-3 py-2 text-left">
        <Tile e={e} selected={selected} picking={picking} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className={cn('min-w-0 truncate text-sm text-slate-900', unread(e) ? 'font-semibold' : 'font-medium')}>{nameOf(e)}</span>
            {unread(e) && <Tag tone="blue">Mới</Tag>}
          </span>
          <span className="block truncate text-xs text-slate-600">
            {typeOf(e)} · {e.kind === 'folder' ? ownerOf(e) : sizeOf(e)}
          </span>
        </span>
      </button>
      <button type="button" data-no-select="true" onClick={onMenu} aria-label={`Thao tác với ${nameOf(e)}`} className={MENU_BTN}>
        <EllipsisVertical size={18} />
      </button>
    </li>
  );
}

// Dòng ở bảng (từ 768px): tên, loại, người tạo, ngày, kích thước.
export function EntryRow({ e, selected, cut, picking, onOpen, onMenu, onActivate, drag }: { e: Entry } & Handlers) {
  return (
    <tr
      data-explorer-item="true"
      data-folder-id={drag.folderId}
      onPointerDown={drag.onPointerDown}
      onDoubleClick={activate(onActivate)}
      onContextMenu={onMenu}
      onClick={onOpen}
      data-selected={selected}
      className={cn(
        'cursor-pointer select-none border-t border-slate-200 transition-[background-color] duration-200 md:hover:bg-slate-50',
        drag.over && 'bg-primary/10',
        selected && 'bg-primary/10 shadow-[inset_3px_0_0_var(--color-primary)]',
        cut && 'opacity-50',
      )}
    >
      <td className="max-w-0 px-3 py-2">
        <span className="flex items-center gap-3">
          <Tile e={e} selected={selected} picking={picking} />
          <span className={cn('min-w-0 truncate text-sm text-slate-900', unread(e) ? 'font-semibold' : 'font-medium')}>{nameOf(e)}</span>
          {unread(e) && <Tag tone="blue">Mới</Tag>}
        </span>
      </td>
      <td className="whitespace-nowrap px-3 text-sm text-slate-700">{typeOf(e)}</td>
      <td className="hidden max-w-40 truncate px-3 text-sm text-slate-600 xl:table-cell">{ownerOf(e)}</td>
      <td className="whitespace-nowrap px-3 text-sm text-slate-600">{dateOf(e)}</td>
      <td className="whitespace-nowrap px-3 text-right text-sm text-slate-600">{sizeOf(e)}</td>
      <td className="w-12 px-1">
        <button
          type="button"
          onClick={(ev) => {
            ev.stopPropagation();
            onMenu(ev);
          }}
          aria-label={`Thao tác với ${nameOf(e)}`}
          data-no-select="true"
          className={MENU_BTN}
        >
          <EllipsisVertical size={18} />
        </button>
      </td>
    </tr>
  );
}


// Thẻ ở lưới kiểu Drive: thư mục là ô gọn một hàng, tệp có vùng biểu tượng lớn phía trên.
export function EntryCard({ e, selected, cut, picking, onOpen, onMenu, onActivate, drag }: { e: Entry } & Handlers) {
  const folder = e.kind === 'folder';
  return (
    <li
      data-explorer-item="true"
      data-folder-id={drag.folderId}
      onPointerDown={drag.onPointerDown}
      onDoubleClick={activate(onActivate)}
      onContextMenu={onMenu}
      data-selected={selected}
      className={cn(
        'relative flex select-none overflow-hidden rounded-block border bg-white transition-[background-color] duration-200',
        folder ? 'items-center' : 'flex-col',
        selected ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'border-slate-200',
        drag.over && 'border-primary bg-primary/10 ring-2 ring-primary',
        cut && 'opacity-50',
      )}
    >
      {!folder && (
        <button type="button" tabIndex={-1} aria-hidden="true" onClick={onOpen} className={cn('flex h-28 items-center justify-center', kindOf(e).tone)}>
          <KindIcon e={e} size={40} />
        </button>
      )}
      {picking && (
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute left-2 top-2 flex size-5 items-center justify-center rounded-full border-2',
            selected ? 'border-primary bg-primary text-white' : 'border-primary bg-white',
            folder && 'hidden',
          )}
        >
          {selected && <Check size={12} />}
        </span>
      )}
      <div className="flex min-w-0 flex-1 items-center">
        <button type="button" onClick={onOpen} className="flex min-h-12 min-w-0 flex-1 items-center gap-2.5 py-2 pl-3 text-left">
          <span className={cn('flex-none', kindOf(e).tone.split(' ')[1])}><KindIcon e={e} /></span>
          <span className="min-w-0">
            <span className={cn('line-clamp-2 text-sm text-slate-900 [overflow-wrap:anywhere]', unread(e) ? 'font-semibold' : 'font-medium')}>{nameOf(e)}</span>
            {!folder && <span className="block truncate text-xs text-slate-600">{typeOf(e)} · {sizeOf(e)}</span>}
          </span>
        </button>
        {unread(e) && <Tag tone="blue">Mới</Tag>}
        <button type="button" data-no-select="true" onClick={onMenu} aria-label={`Thao tác với ${nameOf(e)}`} className={MENU_BTN}>
          <EllipsisVertical size={18} />
        </button>
      </div>
    </li>
  );
}
