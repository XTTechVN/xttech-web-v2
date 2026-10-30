'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, HardDrive, User, Check, X, Loader2 } from 'lucide-react';
import type { DocumentCategory } from '@/types';
import { cn } from '@/utils';

interface FolderTreeProps {
  categories: DocumentCategory[];
  activeCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
  rootLabel?: string;
  hideRoot?: boolean;
  creatingParentId?: number | null | undefined;
  onCreateConfirm?: (name: string, parentId: number | null) => Promise<void>;
  onCreateCancel?: () => void;
  isCreatingLoading?: boolean;
}

const InlineNewFolderNode: React.FC<{
  level: number;
  onConfirm: (name: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}> = ({ level, onConfirm, onCancel, isLoading }) => {
  const [name, setName] = useState('Thư mục mới');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ paddingLeft: `${level * 14 + 8}px` }}
      className="flex items-center gap-1.5 py-1 pr-2 rounded-lg bg-primary/5 border border-primary/40 my-0.5 animate-in fade-in duration-150"
    >
      <span className="w-4 shrink-0" />
      <div className="relative shrink-0">
        <Folder size={15} className="text-primary animate-pulse" />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        placeholder="Tên thư mục..."
        className="flex-1 min-w-0 bg-white border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary h-6"
      />
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="submit"
          disabled={isLoading || !name.trim()}
          title="Tạo (Enter)"
          className="p-1 rounded bg-primary text-white hover:bg-primary/90 disabled:opacity-50 cursor-pointer transition-colors"
        >
          {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
        </button>
        <button
          type="button"
          disabled={isLoading}
          onClick={onCancel}
          title="Hủy (Esc)"
          className="p-1 rounded text-slate-500 hover:bg-slate-200/60 hover:text-slate-700 cursor-pointer transition-colors"
        >
          <X size={12} />
        </button>
      </div>
    </form>
  );
};

const TreeNode: React.FC<{
  node: DocumentCategory;
  activeCategoryId: number | null;
  onSelectCategory: (id: number) => void;
  level: number;
  creatingParentId?: number | null | undefined;
  onCreateConfirm?: (name: string, parentId: number | null) => Promise<void>;
  onCreateCancel?: () => void;
  isCreatingLoading?: boolean;
}> = ({
  node,
  activeCategoryId,
  onSelectCategory,
  level,
  creatingParentId,
  onCreateConfirm,
  onCreateCancel,
  isCreatingLoading,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = Boolean(node.children && node.children.length > 0);
  const isActive = activeCategoryId === node.id;
  const isShared = Boolean((node.sharedWithCount && node.sharedWithCount > 0) || node.permission === 'view');
  const isCreatingUnderThis = creatingParentId === node.id;

  const showChildren = (isOpen || isCreatingUnderThis) && (hasChildren || isCreatingUnderThis);

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
        {hasChildren || isCreatingUnderThis ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="p-0.5 rounded hover:bg-slate-200/60 text-slate-400 group-hover:text-slate-600 transition-colors"
          >
            {isOpen || isCreatingUnderThis ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}

        <div className="relative shrink-0">
          {isOpen || isCreatingUnderThis ? (
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

      {showChildren && (
        <div className="relative border-l border-slate-200/80 ml-4 space-y-0.5">
          {isCreatingUnderThis && (
            <InlineNewFolderNode
              level={level + 1}
              onConfirm={(name) => onCreateConfirm?.(name, node.id)}
              onCancel={() => onCreateCancel?.()}
              isLoading={isCreatingLoading}
            />
          )}
          {node.children?.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              activeCategoryId={activeCategoryId}
              onSelectCategory={onSelectCategory}
              level={level + 1}
              creatingParentId={creatingParentId}
              onCreateConfirm={onCreateConfirm}
              onCreateCancel={onCreateCancel}
              isCreatingLoading={isCreatingLoading}
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
  rootLabel = 'Thư mục gốc (Tài liệu của tôi)',
  hideRoot = false,
  creatingParentId,
  onCreateConfirm,
  onCreateCancel,
  isCreatingLoading,
}) => {
  const safeCategories = Array.isArray(categories) ? categories : [];

  return (
    <div className="w-full flex flex-col gap-1">
      {!hideRoot && (
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
          <span>{rootLabel}</span>
        </div>
      )}

      {creatingParentId === null && (
        <div className="pl-2 border-l border-slate-200/80 ml-4 my-1">
          <InlineNewFolderNode
            level={0}
            onConfirm={(name) => onCreateConfirm?.(name, null)}
            onCancel={() => onCreateCancel?.()}
            isLoading={isCreatingLoading}
          />
        </div>
      )}

      {!hideRoot && <div className="border-t border-slate-100 my-0.5" />}

      <div className="space-y-0.5">
        {safeCategories.length === 0 && creatingParentId === undefined ? (
          <div className="text-center py-4 text-xs text-slate-400">Chưa có thư mục nào</div>
        ) : (
          safeCategories.map((cat) => (
            <TreeNode
              key={cat.id}
              node={cat}
              activeCategoryId={activeCategoryId}
              onSelectCategory={onSelectCategory}
              level={0}
              creatingParentId={creatingParentId}
              onCreateConfirm={onCreateConfirm}
              onCreateCancel={onCreateCancel}
              isCreatingLoading={isCreatingLoading}
            />
          ))
        )}
      </div>
    </div>
  );
};
