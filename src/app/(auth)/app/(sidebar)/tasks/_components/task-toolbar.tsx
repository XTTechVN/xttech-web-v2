'use client';

import React, { useState } from 'react';
import { CheckCircle2, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { Button, TableFilters, TableSearch } from '@/components';
import type { ITableFilterProps } from '@/components';
import {
  TASK_CATEGORY_OPTIONS,
  TASK_DEADLINE_STATE_OPTIONS,
  TASK_PRIORITY_OPTIONS,
  TASK_SOURCE_TYPE_OPTIONS,
  TASK_STATUS_OPTIONS,
} from '@/config';
import type {
  Department,
  Employee,
  StaffTaskCategory,
  StaffTaskDeadlineState,
  StaffTaskPriority,
  StaffTaskScope,
  StaffTaskSourceType,
  StaffTaskStatus,
  StaffTaskSummary,
} from '@/types';
import { QUICK_DEADLINE_TABS, type QuickDeadlineFilter } from '../_constants/task.constants';

interface TaskToolbarProps {
  scope: StaffTaskScope;
  canManageTasks: boolean;
  summary?: StaffTaskSummary;
  search: string;
  onSearchChange: (val: string) => void;
  quickFilter: QuickDeadlineFilter;
  onQuickFilterChange: (val: QuickDeadlineFilter) => void;
  statusFilter?: StaffTaskStatus;
  onStatusFilterChange: (val?: StaffTaskStatus) => void;
  deadlineFilter?: StaffTaskDeadlineState;
  onDeadlineFilterChange: (val?: StaffTaskDeadlineState) => void;
  priorityFilter?: StaffTaskPriority;
  onPriorityFilterChange: (val?: StaffTaskPriority) => void;
  categoryFilter?: StaffTaskCategory;
  onCategoryFilterChange: (val?: StaffTaskCategory) => void;
  sourceTypeFilter?: StaffTaskSourceType;
  onSourceTypeFilterChange: (val?: StaffTaskSourceType) => void;
  assigneeFilter?: string;
  onAssigneeFilterChange: (val?: string) => void;
  departmentFilter?: number;
  onDepartmentFilterChange: (val?: number) => void;
  employees: Employee[];
  departments: Department[];
  selectedCount: number;
  onBulkCompleteClick: () => void;
  onResetFilters: () => void;
}

export function TaskToolbar({
  scope,
  canManageTasks,
  summary,
  search,
  onSearchChange,
  quickFilter,
  onQuickFilterChange,
  statusFilter,
  onStatusFilterChange,
  deadlineFilter,
  onDeadlineFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  sourceTypeFilter,
  onSourceTypeFilterChange,
  assigneeFilter,
  onAssigneeFilterChange,
  departmentFilter,
  onDepartmentFilterChange,
  employees,
  departments,
  selectedCount,
  onBulkCompleteClick,
  onResetFilters,
}: TaskToolbarProps) {
  const [showFilters, setShowFilters] = useState(false);

  const tabCounts: Partial<Record<QuickDeadlineFilter, number>> = {
    all: summary?.totalCount,
    open: summary?.openCount,
    overdue: summary?.overdueCount,
    due_soon: summary?.dueSoonCount,
    completed_on_time: summary?.completedOnTimeCount,
    completed_late: summary?.completedLateCount,
  };

  const filters: ITableFilterProps[] = [
    {
      label: 'Trạng thái',
      value: statusFilter,
      options: TASK_STATUS_OPTIONS,
      onChange: (val) => onStatusFilterChange(val as StaffTaskStatus | undefined),
    },
    {
      label: 'Tình trạng hạn',
      value: deadlineFilter,
      options: TASK_DEADLINE_STATE_OPTIONS,
      onChange: (val) => onDeadlineFilterChange(val as StaffTaskDeadlineState | undefined),
    },
    {
      label: 'Độ ưu tiên',
      value: priorityFilter,
      options: TASK_PRIORITY_OPTIONS,
      onChange: (val) => onPriorityFilterChange(val as StaffTaskPriority | undefined),
    },
    {
      label: 'Phân loại',
      value: categoryFilter,
      options: TASK_CATEGORY_OPTIONS,
      onChange: (val) => onCategoryFilterChange(val as StaffTaskCategory | undefined),
    },
    {
      label: 'Nguồn việc',
      value: sourceTypeFilter,
      options: TASK_SOURCE_TYPE_OPTIONS,
      onChange: (val) => onSourceTypeFilterChange(val as StaffTaskSourceType | undefined),
    },
  ];

  if (canManageTasks && scope === 'all') {
    filters.push(
      {
        label: 'Phòng ban',
        value: departmentFilter ? String(departmentFilter) : undefined,
        options: departments.map((d) => ({ value: String(d.id), label: d.name })),
        onChange: (val) => onDepartmentFilterChange(val ? Number(val) : undefined),
      },
      {
        label: 'Nhân sự',
        value: assigneeFilter,
        options: employees.map((emp) => ({
          value: emp.id,
          label: `${emp.fullName} (${emp.email})`,
        })),
        onChange: (val) => onAssigneeFilterChange(val ? String(val) : undefined),
      },
    );
  }

  const activeDropdownCount = [
    statusFilter,
    deadlineFilter,
    priorityFilter,
    categoryFilter,
    sourceTypeFilter,
    assigneeFilter,
    departmentFilter,
  ].filter(Boolean).length;

  const hasActiveFilters = Boolean(search || quickFilter !== 'all' || activeDropdownCount > 0);

  return (
    <div className="space-y-2.5 rounded-xl border border-slate-200 bg-white p-2.5 sm:p-3">
      <div className="flex flex-col justify-between gap-2.5 lg:flex-row lg:items-center">
        <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          {QUICK_DEADLINE_TABS.map((tab) => {
            const active = quickFilter === tab.id;
            const count = tabCounts[tab.id];
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onQuickFilterChange(tab.id)}
                className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition cursor-pointer ${
                  active
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 sm:bg-transparent'
                }`}
              >
                <span>{tab.label}</span>
                {typeof count === 'number' && (
                  <span
                    className={`font-mono text-[10px] tabular-nums ${
                      active ? 'text-white/80' : 'text-slate-400'
                    }`}
                  >
                    ({count})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 sm:flex-wrap sm:gap-2">
          <div className="min-w-0 flex-1 sm:w-64 sm:flex-none">
            <TableSearch
              placeholder="Tìm mã CV, tiêu đề, nhân sự..."
              value={search}
              onChange={onSearchChange}
              className="w-full"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition cursor-pointer ${
              showFilters || activeDropdownCount > 0
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal size={13} />
            <span>Bộ lọc{activeDropdownCount > 0 ? ` (${activeDropdownCount})` : ''}</span>
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex h-9 shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-2 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 sm:border-transparent cursor-pointer"
              title="Đặt lại bộ lọc"
            >
              <RotateCcw size={13} />
              <span className="hidden sm:inline">Đặt lại</span>
            </button>
          )}

          {selectedCount > 0 && (
            <div className="hidden md:block">
              <Button
                size="sm"
                variant="primary"
                leftIcon={<CheckCircle2 size={14} />}
                onClick={onBulkCompleteClick}
              >
                Hoàn thành ({selectedCount})
              </Button>
            </div>
          )}
        </div>
      </div>

      {(showFilters || activeDropdownCount > 0) && (
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2.5">
          <TableFilters filters={filters} />
        </div>
      )}
    </div>
  );
}
