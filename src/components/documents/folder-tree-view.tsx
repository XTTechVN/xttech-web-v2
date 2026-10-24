'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, HardDrive, User } from 'lucide-react';
import type { DocumentCategory } from '@/types';
import { cn } from '@/utils';

interface FolderTreeProps {
  categories: DocumentCategory[];
  activeCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
}

const TreeNode: React.FC<{
  node: DocumentCategory;
  activeCategoryId: number | null;
  onSelectCategory: (id: number) => void;
  level: number;
}> = ({ node, activeCategoryId, onSelectCategory, level }) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = Boolean(node.children && node.children.length > 0);
  const isActive = activeCategoryId === node.id;
  const isShared = Boolean((node.sharedWithCount && node.sharedWithCount > 0) || node.permission === 'view');

  return (
    <div className="select-none text-xs">
      <div
        onClick={() => onSelectCategory(node.id)}
        style={{ paddingLeft: `${level * 14 + 8}px` }}
        className={cn(
          'flex items-center gap-1.5 py-1.5 pr-2 rounded-lg cursor-pointer transition-colors group',
          isActive
            ? 'bg-primary/10 text-primary font-semibold'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        )}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="p-0.5 rounded hover:bg-slate-200/60 text-slate-400 group-hover:text-slate-600 transition-colors"
          >
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}

        <div className="relative shrink-0">
          {isOpen ? (
            <FolderOpen size={15} className={isActive ? 'text-primary' : 'text-slate-500'} />
          ) : (
            <Folder size={15} className={isActive ? 'text-primary' : 'text-slate-500'} />
          )}
          {isShared && (
            <span className="absolute -bottom-1 -right-1">
              <User size={8} className="text-primary fill-primary" />
            </span>
          )}
        </div>

        <span className="truncate flex-1 min-w-0">{node.name}</span>

        {hasChildren && (
          <span className="text-[10px] text-slate-400 px-1 rounded bg-slate-100">
            {node.children?.length}
          </span>
        )}
      </div>

      {hasChildren && isOpen && (
        <div className="relative border-l border-slate-200/80 ml-4 space-y-0.5">
          {node.children?.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              activeCategoryId={activeCategoryId}
              onSelectCategory={onSelectCategory}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FolderTreeView: React.FC<FolderTreeProps> = ({
  categories = [],
  activeCategoryId,
  onSelectCategory,
}) => {
  const safeCategories = Array.isArray(categories) ? categories : [];

  return (
    <div className="w-full flex flex-col gap-1 p-2">
      <div
        onClick={() => onSelectCategory(null)}
        className={cn(
          'flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-colors text-xs font-medium',
          activeCategoryId === null
            ? 'bg-primary/10 text-primary font-semibold'
            : 'text-slate-700 hover:bg-slate-100',
        )}
      >
        <HardDrive size={16} className={activeCategoryId === null ? 'text-primary' : 'text-slate-500'} />
        <span>Thư mục gốc (Tất cả)</span>
      </div>

      <div className="border-t border-slate-100 my-1" />

      <div className="space-y-0.5">
        {safeCategories.length === 0 ? (
          <div className="text-center py-4 text-xs text-slate-400">Chưa có thư mục nào</div>
        ) : (
          safeCategories.map((cat) => (
            <TreeNode
              key={cat.id}
              node={cat}
              activeCategoryId={activeCategoryId}
              onSelectCategory={onSelectCategory}
              level={0}
            />
          ))
        )}
      </div>
    </div>
  );
};
