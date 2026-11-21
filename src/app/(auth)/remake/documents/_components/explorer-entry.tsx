'use client';

import { Check, EllipsisVertical, FileImage, FileSpreadsheet, FileText, Folder, FolderOpen } from 'lucide-react';
import { DOCUMENT_TYPE_MAP, type DocumentCategory, type DocumentItem } from '@/types';
import { cn } from '@/utils/cn';
import { Badge } from '../../_components/badge';

export type Entry = { kind: 'folder'; f: DocumentCategory } | { kind: 'doc'; d: DocumentItem };

export const entryKey = (e: Entry) => (e.kind === 'folder' ? `folder-${e.f.id}` : `doc-${e.d.id}`);

const day = (s?: string | null) => (s ? new Date(s).toLocaleDateString('vi-VN') : '–');
const size = (n?: number) => (n ? (n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1e3))} KB`) : '–');

function iconOf(e: Entry) {
  if (e.kind === 'folder') return e.f.isShared ? <FolderOpen size={20} /> : <Folder size={20} />;
  const mime = `${e.d.currentVersion?.mimeType ?? ''} ${e.d.currentVersion?.fileName ?? ''}`.toLowerCase();
  if (/image|\.(png|jpe?g|gif|webp)/.test(mime)) return <FileImage size={20} />;
  if (/sheet|excel|\.(xlsx?|csv)/.test(mime)) return <FileSpreadsheet size={20} />;
  return <FileText size={20} />;
}

const nameOf = (e: Entry) => (e.kind === 'folder' ? e.f.name : e.d.title);
const unread = (e: Entry) => e.kind === 'doc' && e.d.isRead === false;
const typeOf = (e: Entry) => (e.kind === 'folder' ? 'Thư mục' : (DOCUMENT_TYPE_MAP[e.d.documentType]?.label ?? e.d.documentType));
const ownerOf = (e: Entry) => (e.kind === 'folder' ? e.f.createdByName : e.d.createdBy?.fullName) ?? '–';
const dateOf = (e: Entry) => day(e.kind === 'folder' ? (e.f.updatedAt ?? e.f.createdAt) : (e.d.updatedAt ?? e.d.createdAt));
const sizeOf = (e: Entry) => (e.kind === 'folder' ? '–' : size(e.d.currentVersion?.fileSize));

interface Handlers {
  selected: boolean;
  cut: boolean;
  /** đang ở chế độ chọn nhiều: bấm = chọn/bỏ chọn thay vì mở */
  picking: boolean;
  onOpen: (ev: React.MouseEvent) => void;
  onMenu: (ev: React.MouseEvent) => void;
}

function Tile({ e, selected, picking }: { e: Entry; selected: boolean; picking: boolean }) {
  return (
    <span
      className={cn(
        'relative flex size-10 flex-none items-center justify-center rounded-rm',
        selected ? 'bg-rm-primary text-rm-on-primary' : 'bg-rm-primary-soft text-rm-primary',
      )}
    >
      {selected || picking ? (
        selected ? (
          <Check size={20} aria-hidden="true" />
        ) : (
          <span className="size-5 rounded-full border-2 border-rm-primary" aria-hidden="true" />
        )
      ) : (
        iconOf(e)
      )}
    </span>
  );
}

const MENU_BTN =
  'flex size-11 flex-none items-center justify-center rounded-full text-rm-muted transition-[background-color,transform] duration-(--rm-dur-fast) active:scale-95 active:bg-rm-line md:hover:bg-rm-line';

// Thẻ ở lưới: tên đậm + loại, một dòng phụ; ⋮ mở menu thao tác (điện thoại không có chuột phải).
export function EntryTile({ e, selected, cut, picking, onOpen, onMenu }: { e: Entry } & Handlers) {
  return (
    <li
      data-explorer-item="true"
      onContextMenu={onMenu}
      data-selected={selected}
      className={cn(
        'flex items-center rounded-rm-xl border bg-rm-surface pl-3 transition-[background-color] duration-(--rm-dur-fast)',
        selected ? 'border-rm-primary bg-rm-primary-soft' : 'border-rm-edge',
        cut && 'opacity-50',
      )}
    >
      <button type="button" onClick={onOpen} className="flex min-h-14 min-w-0 flex-1 items-center gap-3 py-2 text-left">
        <Tile e={e} selected={selected} picking={picking} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className={cn('min-w-0 truncate text-sm', unread(e) ? 'font-semibold' : 'font-medium')}>{nameOf(e)}</span>
            {unread(e) && <Badge tone="primary">Mới</Badge>}
          </span>
          <span className="block truncate text-xs text-rm-muted">
            {typeOf(e)} · {e.kind === 'folder' ? ownerOf(e) : sizeOf(e)}
          </span>
        </span>
      </button>
      <button type="button" onClick={onMenu} aria-label={`Thao tác với ${nameOf(e)}`} className={MENU_BTN}>
        <EllipsisVertical size={18} />
      </button>
    </li>
  );
}

// Dòng ở bảng (từ 768px): tên, loại, người tạo, ngày, kích thước.
export function EntryRow({ e, selected, cut, picking, onOpen, onMenu }: { e: Entry } & Handlers) {
  return (
    <tr
      data-explorer-item="true"
      onContextMenu={onMenu}
      onClick={onOpen}
      data-selected={selected}
      className={cn(
        'cursor-pointer border-t border-rm-line transition-[background-color] duration-(--rm-dur-fast) md:hover:bg-rm-bg',
        selected && 'bg-rm-primary-soft',
        cut && 'opacity-50',
      )}
    >
      <td className="max-w-0 px-3 py-2">
        <span className="flex items-center gap-3">
          <Tile e={e} selected={selected} picking={picking} />
          <span className={cn('min-w-0 truncate text-sm', unread(e) ? 'font-semibold' : 'font-medium')}>{nameOf(e)}</span>
          {unread(e) && <Badge tone="primary">Mới</Badge>}
        </span>
      </td>
      <td className="whitespace-nowrap px-3 text-sm">{typeOf(e)}</td>
      <td className="hidden max-w-40 truncate px-3 text-sm text-rm-muted xl:table-cell">{ownerOf(e)}</td>
      <td className="whitespace-nowrap px-3 text-sm text-rm-muted">{dateOf(e)}</td>
      <td className="whitespace-nowrap px-3 text-right text-sm text-rm-muted">{sizeOf(e)}</td>
      <td className="w-12 px-1">
        <button
          type="button"
          onClick={(ev) => {
            ev.stopPropagation();
            onMenu(ev);
          }}
          aria-label={`Thao tác với ${nameOf(e)}`}
          className={MENU_BTN}
        >
          <EllipsisVertical size={18} />
        </button>
      </td>
    </tr>
  );
}
