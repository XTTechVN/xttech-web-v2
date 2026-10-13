'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Download, Eye, MoreVertical, Trash2, FolderOpen, Share2, Edit3, Users } from 'lucide-react';
import type { DocumentItem } from '@/types';
import { DOCUMENT_TYPE_MAP, DOCUMENT_STATUS_MAP } from '@/types';
import { formatBytes, getFileVisualInfo, isDocumentShared } from '../_utils/doc-helpers';
import { getFileUrl } from '@/utils/string';
import { useAuthStore } from '@/stores';
import { cn } from '@/utils';

interface FileCardProps {
  document: DocumentItem;
  locationName?: string;
  isSelected?: boolean;
  onToggleSelect?: (document: DocumentItem) => void;
  onPreview?: (document: DocumentItem) => void;
  onView: (document: DocumentItem) => void;
  onEdit?: (document: DocumentItem) => void;
  onShare?: (document: DocumentItem) => void;
  onMove?: (document: DocumentItem) => void;
  onDelete?: (document: DocumentItem) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export const FileCard: React.FC<FileCardProps> = ({
  document: doc,
  locationName,
  isSelected = false,
  onToggleSelect,
  onPreview,
  onView,
  onEdit,
  onShare,
  onMove,
  onDelete,
  canEdit = true,
  canDelete = true,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen((prev) => !prev);
  };

  // Close dropdown on click outside
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const user = useAuthStore((state) => state.user);
  const isShared = isDocumentShared(doc, user?.id);

  const currentVersion = doc.currentVersion;
  const fileName = currentVersion?.fileName || doc.title;
  const visualInfo = getFileVisualInfo(fileName, currentVersion?.mimeType);

  const docTypeInfo = DOCUMENT_TYPE_MAP[doc.documentType] || {
    label: doc.documentType || 'Văn bản',
  };

  const statusInfo = DOCUMENT_STATUS_MAP[doc.status] || {
    label: doc.status || 'Bản nháp',
  };

  const downloadUrl =
    currentVersion?.downloadUrl ||
    (currentVersion?.filePath ? getFileUrl(currentVersion.filePath) : null);

  const handleDownload = () => {
    if (!downloadUrl) return;
    window.open(downloadUrl, '_blank', 'noopener,noreferrer');
  };

  const menuItems: {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    danger?: boolean;
    disabled?: boolean;
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
            onClick: handleDownload,
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

  // Subtitle format: e.g. "trong Tài liệu của tôi" or "Quy chế • 28.3 KB"
  const subText = locationName
    ? `trong ${locationName}`
    : `${docTypeInfo.label}${currentVersion?.fileSize ? ` • ${formatBytes(currentVersion.fileSize)}` : ''} • ${statusInfo.label}`;

  return (
    <div
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
        'group relative flex items-center justify-between gap-4 p-4 rounded-lg cursor-pointer select-none transition-all duration-150',
        isSelected
          ? 'bg-primary/15 border-primary shadow-xs ring-2 ring-primary/60 text-primary'
          : 'bg-[#f0f4f9] hover:bg-[#e4ebf5] border border-transparent hover:border-slate-200/60 shadow-2xs hover:shadow-xs',
        isMenuOpen ? 'z-40 bg-[#e4ebf5] border-slate-200/80 shadow-xs' : 'active:scale-[0.99]',
      )}
      title={`${doc.title} (${doc.code})`}
    >
      {/* Icon bên trái */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="relative shrink-0 flex items-center justify-center">
          {visualInfo.icon}
          {isShared && (
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-2xs">
              <Users size={10} className="text-primary fill-primary" />
            </div>
          )}
        </div>

        {/* Tên file & Thông tin phụ */}
        <div className="flex flex-col min-w-0 flex-1">
          <span className="truncate text-sm font-medium text-slate-800 group-hover:text-primary transition-colors leading-tight">
            {doc.title}
          </span>
          <span className="text-[11px] text-slate-500 truncate mt-0.5">
            {subText}
          </span>
        </div>
      </div>

      {/* Nút 3 chấm thao tác */}
      <div
        className="shrink-0"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <button
          type="button"
          onClick={handleButtonClick}
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200/80 transition-colors cursor-pointer',
            isMenuOpen && 'bg-slate-200/80 text-slate-800',
          )}
          title="Thao tác"
        >
          <MoreVertical size={16} />
        </button>
      </div>

      {/* Menu con tách hẳn xuống dưới và căn thẳng hàng với bên phải card, bo góc rounded-lg */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-[calc(100%+6px)] z-50 w-48 rounded-lg bg-white shadow-xl ring-1 ring-black/5 divide-y divide-gray-100 overflow-hidden border border-slate-200/80 py-0 animate-in fade-in zoom-in-95 duration-100"
        >
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              type="button"
              disabled={item.disabled}
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(false);
                item.onClick?.();
              }}
              className={cn(
                'flex w-full items-center gap-2.5 px-3.5 py-2.5 text-xs transition-colors duration-150 text-left cursor-pointer font-medium first:rounded-t-lg last:rounded-b-lg',
                item.danger
                  ? 'text-rose-600 hover:bg-rose-50'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900',
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
};
