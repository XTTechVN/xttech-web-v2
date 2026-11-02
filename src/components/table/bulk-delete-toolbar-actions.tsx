'use client';

import React from 'react';
import { Button } from '../button';
import { Trash2, CheckSquare, Square, X } from 'lucide-react';

export interface BulkDeleteToolbarActionsProps {
  isBulkMode: boolean;
  selectedCount: number;
  totalCount: number;
  isAllSelected: boolean;
  isDeleting?: boolean;
  onEnterBulkMode: () => void;
  onExitBulkMode: () => void;
  onToggleSelectAll: () => void;
  onConfirmDelete: () => void;
}

export function BulkDeleteToolbarActions({
  isBulkMode,
  selectedCount,
  totalCount,
  isAllSelected,
  isDeleting = false,
  onEnterBulkMode,
  onExitBulkMode,
  onToggleSelectAll,
  onConfirmDelete,
}: BulkDeleteToolbarActionsProps) {
  if (!isBulkMode) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onEnterBulkMode}
        disabled={totalCount === 0}
        className="gap-1.5 text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
      >
        <Trash2 size={15} />
        <span>Xóa hàng loạt</span>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleSelectAll}
        disabled={totalCount === 0 || isDeleting}
        leftIcon={isAllSelected ? <CheckSquare size={15} /> : <Square size={15} />}
      >
        {isAllSelected ? 'Bỏ chọn tất cả' : `Chọn tất cả (${totalCount})`}
      </Button>

      <Button
        variant="danger"
        size="sm"
        onClick={onConfirmDelete}
        disabled={selectedCount === 0 || isDeleting}
        loading={isDeleting}
        leftIcon={<Trash2 size={15} />}
      >
        Xóa đã chọn ({selectedCount})
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onExitBulkMode}
        disabled={isDeleting}
        leftIcon={<X size={15} />}
      >
        Hủy
      </Button>
    </div>
  );
}

