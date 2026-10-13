'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Download, Eye, MoreVertical, Trash2, Folder, Users, FolderOpen, Share2, Edit3 } from 'lucide-react';
import type { DocumentItem } from '@/types';
import { DriveFileIcon, isDocumentShared } from '../_utils/doc-helpers';
import { getFileUrl } from '@/utils/string';
import { useAuthStore } from '@/stores';
import { cn } from '@/utils';
import dayjs from 'dayjs';

interface FileTableProps {
  documents: DocumentItem[];
  currentFolderName?: string;
  selectedKeys?: Set<string>;
  onToggleSelect?: (document: DocumentItem) => void;
  onView: (document: DocumentItem) => void;
  onPreview?: (document: DocumentItem) => void;
  onEdit?: (document: DocumentItem) => void;
  onShare?: (document: DocumentItem) => void;
  onMove?: (document: DocumentItem) => void;
  onDelete?: (document: DocumentItem) => void;
  onNavigateFolder?: (folderId: number | null) => void;
  showHeader?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

const AVATAR_COLORS = [
  'bg-amber-500 text-white',
  'bg-emerald-600 text-white',
  'bg-purple-600 text-white',
  'bg-blue-600 text-white',
  'bg-rose-500 text-white',
  'bg-teal-600 text-white',
  'bg-indigo-600 text-white',
];

function getAvatarStyle(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export const FileTable: React.FC<FileTableProps> = ({
  documents,
  currentFolderName,
  showHeader = true,
  selectedKeys,
  onToggleSelect,
  onView,
  onPreview,
  onEdit,
  onShare,
  onMove,
  onDelete,
  onNavigateFolder,
  canEdit = true,
  canDelete = true,
}) => {
  const { user } = useAuthStore();
  const [openMenuDocId, setOpenMenuDocId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleButtonClick = (e: React.MouseEvent, docId: number) => {
    e.stopPropagation();
    setOpenMenuDocId((prev) => (prev === docId ? null : docId));
  };

  // Đóng menu khi nhấp chuột ra ngoài
  useEffect(() => {
    if (!openMenuDocId) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuDocId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuDocId]);

  return (
    <div className="w-full bg-[#fafbfc]">
      {/* Google Drive List Header - Giống hệt ảnh 2: Phẳng, không viền khung bao ngoài */}
      {showHeader && (
        <div className="flex items-center justify-between py-2.5 px-3.5 border-b border-gray-200 text-xs font-medium text-slate-600">
          <div className="flex-1 min-w-[260px] pl-1">Tên</div>
          <div className="w-56 hidden sm:block">Lý do tài liệu được đề xuất</div>
          <div className="w-44 hidden md:block">Chủ sở hữu</div>
          <div className="w-48 hidden lg:block">Vị trí</div>
          <div className="w-20 text-right"></div>
        </div>
      )}

      {/* Google Drive Rows List - Các hàng phẳng ngăn cách bởi đường mờ nhạt 1px */}
      <div>
        {documents.map((doc) => {
          const currentVersion = doc.currentVersion;
          const fileName = currentVersion?.fileName || doc.title;
          const isOwner = doc.createdById === user?.id;
          const ownerName = isOwner ? 'tôi' : doc.createdBy?.fullName || doc.createdBy?.email || 'Thành viên';
          const isShared = isDocumentShared(doc, user?.id);
          const folderName = doc.category?.name || currentFolderName || 'Drive của tôi';
          const isMenuOpen = openMenuDocId === doc.id;

          const downloadUrl =
            currentVersion?.downloadUrl ||
            (currentVersion?.filePath ? getFileUrl(currentVersion.filePath) : null);

          const handleDownload = (e: React.MouseEvent) => {
            e.stopPropagation();
            if (!downloadUrl) return;
            window.open(downloadUrl, '_blank', 'noopener,noreferrer');
          };

          const menuItems: {
            label: string;
            icon: React.ReactNode;
            onClick: () => void;
            danger?: boolean;
          }[] = [
            {
              label: 'Xem chi tiết',
              icon: <Eye size={15} className="text-primary" />,
              onClick: () => onView(doc),
            },
            ...(downloadUrl
              ? [
                  {
                    label: 'Tải xuống',
                    icon: <Download size={15} className="text-primary" />,
                    onClick: () => handleDownload({ stopPropagation: () => {} } as any),
                  }
                ]
              : []),
            ...(canEdit && onEdit
              ? [
                  {
                    label: 'Chỉnh sửa',
                    icon: <Edit3 size={15} className="text-primary" />,
                    onClick: () => onEdit(doc),
                  }
                ]
              : []),
            ...(canEdit && onShare
              ? [
                  {
                    label: 'Chia sẻ',
                    icon: <Share2 size={15} className="text-primary" />,
                    onClick: () => onShare(doc),
                  }
                ]
              : []),
            ...(canEdit && onMove
              ? [
                  {
                    label: 'Di chuyển',
                    icon: <FolderOpen size={15} className="text-primary" />,
                    onClick: () => onMove(doc),
                  }
                ]
              : []),
            ...(canDelete && onDelete
              ? [
                  {
                    label: 'Xóa tài liệu',
                    icon: <Trash2 size={15} className="text-rose-500" />,
                    danger: true,
                    onClick: () => onDelete(doc),
                  }
                ]
              : []),
          ];

          const isSelected = selectedKeys?.has(`doc-${doc.id}`) ?? false;

          return (
            <div
              key={doc.id}
              draggable={canEdit}
              onDragStart={(e) => {
                if (!canEdit) {
                  e.preventDefault();
                  return;
                }
                e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'document', id: doc.id }));
                e.dataTransfer.effectAllowed = 'move';
              }}
              onClick={(e) => {
                if (e.ctrlKey || e.metaKey) {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleSelect?.(doc);
                  return;
                }
                if (onPreview) {
                  onPreview(doc);
                } else if (downloadUrl) {
                  window.open(downloadUrl, '_blank', 'noopener,noreferrer');
                } else {
                  onView(doc);
                }
              }}
              className={cn(
                'group relative flex items-center justify-between py-3 px-3.5 border-b border-gray-100 hover:bg-[#f1f3f4] transition-colors cursor-pointer text-xs text-slate-800',
                isSelected && 'bg-primary/15 border-l-2 border-primary text-primary font-medium',
                isMenuOpen && 'z-40 bg-[#f1f3f4]'
              )}
            >
              {/* Cột 1: Icon file chuẩn Google Drive + Tên file + Icon Shared */}
              <div className="flex items-center gap-3.5 flex-1 min-w-[260px] pr-3">
                <DriveFileIcon filename={fileName} mimeType={currentVersion?.mimeType} size={18} />
                <span className="font-normal text-slate-900 group-hover:text-primary transition-colors truncate text-sm">
                  {doc.title}
                </span>
                {isShared && (
                  <span title="Đã chia sẻ" className="shrink-0 flex items-center">
                    <Users size={14} className="text-slate-500" />
                  </span>
                )}
              </div>

              {/* Cột 2: Lý do tài liệu được đề xuất / Lần mở */}
              <div className="w-56 hidden sm:block text-slate-600 text-xs truncate">
                Bạn đã mở • {dayjs(doc.updatedAt || doc.createdAt).format('D [thg] M')}
              </div>

              {/* Cột 3: Chủ sở hữu */}
              <div className="w-44 hidden md:flex items-center gap-2 text-slate-700 truncate">
                <div
                  className={`w-5 h-5 rounded-full ${
                    isOwner ? 'bg-slate-700 text-white font-bold' : getAvatarStyle(ownerName)
                  } text-[10px] flex items-center justify-center shrink-0 uppercase font-semibold`}
                >
                  {ownerName.charAt(0)}
                </div>
                <span className="truncate text-xs font-normal">{ownerName}</span>
              </div>

              {/* Cột 4: Vị trí (Icon Folder đen đặc trưng Drive) */}
              <div className="w-48 hidden lg:flex items-center gap-2 text-slate-700 truncate">
                <Folder size={15} className="text-slate-700 fill-slate-700 shrink-0" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (doc.categoryId && onNavigateFolder) {
                      onNavigateFolder(doc.categoryId);
                    }
                  }}
                  className="truncate text-xs text-slate-700 hover:text-primary hover:underline text-left cursor-pointer"
                  title={folderName}
                >
                  {folderName}
                </button>
              </div>

              {/* Cột 5: Nút thao tác nhanh & 3 dots */}
              <div
                className="w-20 flex items-center justify-end gap-1 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Nút Xem chi tiết nhanh */}
                <button
                  type="button"
                  onClick={() => onView(doc)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-blue-600 hover:bg-slate-200/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Xem chi tiết tài liệu"
                >
                  <Eye size={15} />
                </button>

                {/* Nút Tải xuống nhanh */}
                {downloadUrl && (
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="p-1.5 rounded-full text-slate-400 hover:text-emerald-600 hover:bg-slate-200/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Tải xuống tệp tin"
                  >
                    <Download size={15} />
                  </button>
                )}

                {/* Nút 3 chấm tròn - click để mở menu */}
                <button
                  type="button"
                  onClick={(e) => handleButtonClick(e, doc.id)}
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200/80 transition-colors cursor-pointer',
                    isMenuOpen && 'bg-slate-200 text-slate-800'
                  )}
                  title="Thao tác khác"
                >
                  <MoreVertical size={16} />
                </button>
              </div>

              {/* Menu con tách hẳn xuống dưới hàng 8px và căn lề mép phải, bo góc rounded-lg */}
              {isMenuOpen && (
                <div
                  ref={menuRef}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-3.5 top-[calc(100%+8px)] z-50 w-48 rounded-lg bg-white shadow-xl ring-1 ring-black/5 divide-y divide-gray-100 overflow-hidden border border-slate-200/90 py-0 animate-in fade-in zoom-in-95 duration-100"
                >
                  {menuItems.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuDocId(null);
                        item.onClick?.();
                      }}
                      className={cn(
                        'flex w-full items-center gap-2.5 px-3.5 py-2.5 text-xs transition-colors duration-150 text-left cursor-pointer font-medium first:rounded-t-lg last:rounded-b-lg',
                        item.danger
                          ? 'text-rose-600 hover:bg-rose-50'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      )}
                    >
                      {item.icon && <span className="shrink-0">{item.icon}</span>}
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
