'use client';

import React from 'react';
import { Breadcrumb, type BreadcrumbItem, Button } from '@/components';
import { Home, ChevronLeft, Folder } from 'lucide-react';
import type { DocumentCategory } from '@/types';

interface BreadcrumbBarProps {
  breadcrumbs: DocumentCategory[];
  onNavigate: (folderId: number | null) => void;
  onGoBack: () => void;
}

export const BreadcrumbBar: React.FC<BreadcrumbBarProps> = ({
  breadcrumbs,
  onNavigate,
  onGoBack,
}) => {
  const isSubFolder = breadcrumbs.length > 0;

  // Không hiển thị thanh breadcrumb khi đang ở thư mục gốc (Tài liệu của tôi)
  if (!isSubFolder) {
    return null;
  }

  const items: BreadcrumbItem[] = [
    {
      label: 'Tài liệu của tôi',
      icon: <Home size={14} className="text-slate-500" />,
      onClick: () => onNavigate(null),
    },
    ...breadcrumbs.map((folder, index) => {
      const isLast = index === breadcrumbs.length - 1;
      return {
        label: folder.name,
        icon: <Folder size={14} className={isLast ? 'text-primary' : 'text-slate-500'} />,
        onClick: () => onNavigate(folder.id),
      };
    }),
  ];

  return (
    <div className="flex items-center gap-2 select-none overflow-x-auto scrollbar-none py-1">
      {/* Nút Quay lại 1 cấp khi đang trong thư mục con */}
      <Button
        variant="secondary"
        size="sm"
        onClick={onGoBack}
        className="h-8 px-2.5 text-xs font-medium shrink-0 flex items-center gap-1.5"
        title="Quay lại thư mục trước"
      >
        <ChevronLeft size={14} />
        <span className="hidden sm:inline">Quay lại</span>
      </Button>

      {/* Breadcrumb có sẵn trong hệ thống component chung */}
      <div className="flex-1 min-w-0">
        <Breadcrumb items={items} />
      </div>
    </div>
  );
};

