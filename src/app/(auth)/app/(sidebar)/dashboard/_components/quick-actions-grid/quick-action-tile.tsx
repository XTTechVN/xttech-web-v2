'use client';

import React from 'react';
import Link from 'next/link';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '@/utils';
import { QuickActionConfig } from './quick-actions.constants';

interface QuickActionTileProps {
  action: QuickActionConfig;
  badge?: number;
  isEditing: boolean;
  isPinnedSlot: boolean;
}

const QuickActionTileComponent: React.FC<QuickActionTileProps> = ({
  action,
  badge,
  isEditing,
  isPinnedSlot,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: action.id,
    disabled: !isEditing,
  });

  const IconComponent = action.icon;

  const sortableStyle: React.CSSProperties | undefined = isEditing
    ? {
        transform: CSS.Translate.toString(transform),
        transition: isDragging ? undefined : transition,
      }
    : undefined;

  const tileContent = (
    <>
      <div
        className={cn(
          'relative w-13 h-13 rounded-block flex items-center justify-center transition-colors',
          'bg-primary/5 text-primary group-hover:bg-primary/10',
          isEditing && isDragging && 'ring-2 ring-primary shadow-lg',
          isEditing && !isDragging && !isPinnedSlot && 'opacity-80 ring-1 ring-dashed ring-slate-300'
        )}
      >
        <IconComponent size={22} strokeWidth={2} />

        {!isEditing && badge !== undefined && badge > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white tabular-nums">
            {badge > 99 ? '99+' : badge}
          </span>
        )}

        {isEditing && (
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center shadow-2xs">
            <GripVertical size={10} />
          </span>
        )}
      </div>

      <span
        className={cn(
          'text-[11px] font-medium text-center leading-tight line-clamp-1 transition-colors',
          isEditing && isDragging
            ? 'text-primary font-semibold'
            : 'text-slate-700 group-hover:text-primary'
        )}
      >
        {action.title}
      </span>
    </>
  );

  if (isEditing) {
    return (
      <button
        ref={setNodeRef}
        type="button"
        style={sortableStyle}
        {...attributes}
        {...listeners}
        className={cn(
          'relative flex flex-col items-center justify-center gap-1.5 p-1 rounded-block cursor-grab active:cursor-grabbing select-none touch-none will-change-transform',
          isDragging && 'z-30 opacity-95'
        )}
        title={`Giữ và kéo để đổi vị trí "${action.title}"`}
      >
        {tileContent}
      </button>
    );
  }

  return (
    <Link
      href={action.href}
      className="flex flex-col items-center justify-center gap-1.5 p-1 rounded-block group cursor-pointer active:scale-95 transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      {tileContent}
    </Link>
  );
};

export const QuickActionTile = React.memo(QuickActionTileComponent);
QuickActionTile.displayName = 'QuickActionTile';
