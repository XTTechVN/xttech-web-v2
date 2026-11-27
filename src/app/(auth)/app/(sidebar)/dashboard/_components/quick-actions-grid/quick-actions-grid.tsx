'use client';

import React, { useCallback, useId, useMemo, useState, useSyncExternalStore } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStaffTaskSummary } from '@/actions';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import {
  ArrowUpDown,
  Check,
  ChevronUp,
  LayoutGrid,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/stores';
import { useCan } from '@/hooks';
import { cn } from '@/utils';
import {
  QUICK_ACTIONS_COLLAPSED_LIMIT,
  QUICK_ACTIONS_ORDER_EVENT,
  QUICK_ACTIONS_PINNED_COUNT,
  QUICK_ACTIONS_REGISTRY,
  QUICK_ACTIONS_STORAGE_PREFIX,
  applyQuickActionsOrder,
  parseSavedOrder,
} from './quick-actions.constants';
import { QuickActionTile } from './quick-action-tile';

interface QuickActionsGridProps {
  pendingLeavesCount?: number;
  pendingAdjustmentsCount?: number;
}

const subscribeToSavedOrder = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener(QUICK_ACTIONS_ORDER_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(QUICK_ACTIONS_ORDER_EVENT, callback);
  };
};

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({
  pendingLeavesCount = 0,
  pendingAdjustmentsCount = 0,
}) => {
  const dndContextId = useId();
  const user = useAuthStore((state) => state.user);
  const { canAny } = useCan();
  const storageKey = `${QUICK_ACTIONS_STORAGE_PREFIX}_${user?.id ?? 'default'}`;

  // Dùng chung queryKey với MyTasksReminderWidget để React Query deduplicate, không tạo request thừa
  const { data: taskSummary } = useQuery({
    queryKey: ['staff-tasks-summary', 'mine'],
    queryFn: () => getStaffTaskSummary({ scope: 'mine' }),
    refetchInterval: 60000,
  });

  const rawSavedOrder = useSyncExternalStore(
    subscribeToSavedOrder,
    () => (typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) ?? '' : ''),
    () => ''
  );

  const savedOrder = useMemo(() => parseSavedOrder(rawSavedOrder), [rawSavedOrder]);

  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const visibleActions = useMemo(
    () => QUICK_ACTIONS_REGISTRY.filter((action) => canAny(action.permissions)),
    [canAny]
  );

  const orderedActions = useMemo(
    () => applyQuickActionsOrder(visibleActions, savedOrder),
    [visibleActions, savedOrder]
  );

  const persistOrder = useCallback(
    (nextIds: string[]) => {
      if (typeof window === 'undefined') return;
      if (nextIds.length === 0) {
        window.localStorage.removeItem(storageKey);
      } else {
        window.localStorage.setItem(storageKey, JSON.stringify(nextIds));
      }
      window.dispatchEvent(new Event(QUICK_ACTIONS_ORDER_EVENT));
    },
    [storageKey]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const ids = orderedActions.map((item) => item.id);
        const oldIndex = ids.indexOf(String(active.id));
        const newIndex = ids.indexOf(String(over.id));
        if (oldIndex !== -1 && newIndex !== -1) {
          persistOrder(arrayMove(ids, oldIndex, newIndex));
        }
      }
    },
    [orderedActions, persistOrder]
  );

  const handleToggleEdit = () => {
    setIsEditing((prev) => {
      const next = !prev;
      if (next) {
        setSearchQuery('');
      }
      return next;
    });
  };

  const handleResetOrder = () => {
    persistOrder([]);
  };

  const filteredActions = useMemo(() => {
    if (!isExpanded || isEditing || !searchQuery.trim()) return orderedActions;
    const normalized = searchQuery.trim().toLowerCase();
    return orderedActions.filter((action) => action.title.toLowerCase().includes(normalized));
  }, [orderedActions, isExpanded, isEditing, searchQuery]);

  const hasOverflow = orderedActions.length > QUICK_ACTIONS_COLLAPSED_LIMIT;
  const hiddenCount = Math.max(0, orderedActions.length - QUICK_ACTIONS_PINNED_COUNT);

  const displayedActions = useMemo(
    () =>
      isEditing || isExpanded || !hasOverflow
        ? filteredActions
        : orderedActions.slice(0, QUICK_ACTIONS_PINNED_COUNT),
    [isEditing, isExpanded, hasOverflow, filteredActions, orderedActions]
  );

  const displayedIds = useMemo(
    () => displayedActions.map((item) => item.id),
    [displayedActions]
  );

  if (visibleActions.length === 0) return null;

  const badgeValues = {
    pendingLeavesCount,
    pendingAdjustmentsCount,
    pendingTasksCount: taskSummary?.openCount ?? 0,
  };

  return (
    <div className="bg-white rounded-block p-4 border border-gray-100 shadow-xs flex flex-col gap-3">
      {/* Header gọn gàng, phân cấp rõ ràng */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-xs font-bold text-gray-900 truncate">
            Tiện ích doanh nghiệp
          </h2>
          <span className="px-1.5 py-0.5 rounded-control bg-slate-100 text-slate-600 text-xs font-semibold tabular-nums shrink-0">
            {orderedActions.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleResetOrder}
                disabled={savedOrder.length === 0}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-control text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                title="Khôi phục thứ tự mặc định"
              >
                <RotateCcw size={12} />
                Mặc định
              </button>
              <button
                type="button"
                onClick={handleToggleEdit}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-control text-[11px] font-semibold bg-primary text-white hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <Check size={12} />
                Xong
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleToggleEdit}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-control text-[11px] font-medium text-slate-600 hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer"
                title="Sắp xếp thứ tự tiện ích"
              >
                <ArrowUpDown size={12} />
                Sắp xếp
              </button>
              {hasOverflow && isExpanded && (
                <button
                  type="button"
                  onClick={() => {
                    setIsExpanded(false);
                    setSearchQuery('');
                  }}
                  className="inline-flex items-center gap-0.5 px-2 py-1 rounded-control text-[11px] font-medium text-primary bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
                >
                  Thu gọn
                  <ChevronUp size={13} />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Ô tìm kiếm nhanh khi mở rộng danh sách lớn */}
      {isExpanded && !isEditing && orderedActions.length > QUICK_ACTIONS_COLLAPSED_LIMIT && (
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm nhanh tiện ích..."
            className="w-full h-8 pl-8 pr-8 rounded-control bg-slate-50 border border-slate-200/80 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary/50 focus:bg-white transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              aria-label="Xóa tìm kiếm"
            >
              <X size={13} />
            </button>
          )}
        </div>
      )}

      {/* Lưới 4 cột cân đối */}
      {displayedActions.length === 0 ? (
        <div className="py-5 text-center text-xs text-slate-500">
          Không tìm thấy tiện ích phù hợp với &ldquo;{searchQuery}&rdquo;
        </div>
      ) : (
        <DndContext
          id={dndContextId}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={displayedIds} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-4 gap-2.5 pt-1">
              {displayedActions.map((action, index) => {
                const badge = action.badgeKey ? badgeValues[action.badgeKey] : undefined;
                const isPinnedSlot = !hasOverflow || index < QUICK_ACTIONS_PINNED_COUNT;

                return (
                  <QuickActionTile
                    key={action.id}
                    action={action}
                    badge={badge}
                    isEditing={isEditing}
                    isPinnedSlot={isPinnedSlot}
                  />
                );
              })}

              {/* Ô thứ 8: Nút Mở rộng để lưới thu gọn luôn tròn 2 hàng x 4 cột cân đối */}
              {!isEditing && !isExpanded && hasOverflow && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(true)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1.5 p-1 rounded-block group cursor-pointer active:scale-95 transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'
                  )}
                >
                  <div className="relative w-13 h-13 rounded-block flex items-center justify-center border border-dashed border-primary/40 bg-primary/5 text-primary group-hover:bg-primary/10 group-hover:border-primary/60 transition-colors shadow-xs">
                    <LayoutGrid size={21} strokeWidth={1.9} />
                    <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white tabular-nums">
                      +{hiddenCount}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-primary text-center leading-tight line-clamp-1">
                    Xem thêm
                  </span>
                </button>
              )}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default QuickActionsGrid;
