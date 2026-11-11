'use client';

import React, { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  deleteStaffTask,
  getDepartments,
  getEmployees,
  getProjectWarranty,
  getProjects,
  getStaffTasks,
  getStaffTaskSummary,
  reopenStaffTask,
} from '@/actions';
import { Button, CompleteVisitModal, ConfirmActionModal, Skeleton } from '@/components';
import { usePermission } from '@/hooks';
import { showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import type {
  StaffTask,
  StaffTaskCategory,
  StaffTaskDeadlineState,
  StaffTaskPriority,
  StaffTaskQueryParams,
  StaffTaskScope,
  StaffTaskSourceType,
  StaffTaskStatus,
  WarrantyVisit,
} from '@/types';
import { QUICK_DEADLINE_TABS, TASK_SCOPE_TABS, type QuickDeadlineFilter } from './_constants/task.constants';
import { TaskStatsCards } from './_components/task-stats-cards';
import { TaskUrgentBanner } from './_components/task-urgent-banner';
import { TaskToolbar } from './_components/task-toolbar';
import { TaskTable } from './_components/task-table';
import { TaskFormModal } from './_components/modals/task-form-modal';
import { TaskCompleteModal } from './_components/modals/task-complete-modal';
import { TaskDetailModal } from './_components/modals/task-detail-modal';

export default function StaffTasksPage() {
  return (
    <Suspense
      fallback={
        <div className="p-4 sm:p-5">
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      }
    >
      <StaffTasksView />
    </Suspense>
  );
}

function StaffTasksView() {
  const searchParams = useSearchParams();
  const initialSourceType = (searchParams.get('sourceType') as StaffTaskSourceType) || undefined;
  const { user, canManageTasks } = usePermission();
  const [scope, setScope] = useState<StaffTaskScope>(canManageTasks ? 'all' : 'mine');
  const effectiveScope: StaffTaskScope = canManageTasks ? scope : 'mine';

  const [search, setSearch] = useState('');
  const [quickFilter, setQuickFilter] = useState<QuickDeadlineFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StaffTaskStatus | undefined>(undefined);
  const [deadlineFilter, setDeadlineFilter] = useState<StaffTaskDeadlineState | undefined>(undefined);
  const [priorityFilter, setPriorityFilter] = useState<StaffTaskPriority | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState<StaffTaskCategory | undefined>(undefined);
  const [sourceTypeFilter, setSourceTypeFilter] = useState<StaffTaskSourceType | undefined>(initialSourceType);
  const [assigneeFilter, setAssigneeFilter] = useState<string | undefined>(undefined);
  const [departmentFilter, setDepartmentFilter] = useState<number | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<StaffTask | null>(null);
  const [completingTasks, setCompletingTasks] = useState<StaffTask[]>([]);
  const [viewingTask, setViewingTask] = useState<StaffTask | null>(null);
  const [deletingTask, setDeletingTask] = useState<StaffTask | null>(null);
  const [warrantyModalState, setWarrantyModalState] = useState<{ projectId: number; visit: WarrantyVisit } | null>(null);

  const activeQuickTab = QUICK_DEADLINE_TABS.find((t) => t.id === quickFilter);
  const queryParams: StaffTaskQueryParams = {
    scope: effectiveScope,
    search: search || undefined,
    status: statusFilter,
    openOnly: activeQuickTab?.openOnly,
    deadlineState: deadlineFilter ?? activeQuickTab?.deadlineState,
    priority: priorityFilter,
    category: categoryFilter,
    sourceType: sourceTypeFilter,
    assigneeId: effectiveScope === 'all' ? assigneeFilter : undefined,
    departmentId: effectiveScope === 'all' ? departmentFilter : undefined,
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
  };

  const { data: tasksRes, isLoading } = useQuery({ queryKey: ['staff-tasks', queryParams], queryFn: () => getStaffTasks(queryParams) });
  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['staff-tasks-summary', effectiveScope, assigneeFilter, departmentFilter],
    queryFn: () => getStaffTaskSummary({ scope: effectiveScope, assigneeId: effectiveScope === 'all' ? assigneeFilter : undefined, departmentId: effectiveScope === 'all' ? departmentFilter : undefined }),
  });
  const { data: employeesRes } = useQuery({ queryKey: ['employees', 'task-assignees'], queryFn: () => getEmployees({ limit: 200 }), enabled: canManageTasks, staleTime: 5 * 60 * 1000 });
  const { data: departmentsRes } = useQuery({ queryKey: ['departments', 'task-filter'], queryFn: () => getDepartments({ limit: 100 }), enabled: canManageTasks, staleTime: 5 * 60 * 1000 });
  const { data: projectsRes } = useQuery({ queryKey: ['projects', 'task-selector'], queryFn: () => getProjects({ limit: 100 }), enabled: canManageTasks, staleTime: 3 * 60 * 1000 });

  const invalidateAll = () => {
    ['staff-tasks', 'staff-tasks-summary', 'global_warranty_queue', 'global_warranty_badge', 'project_warranty'].forEach((key) => {
      void queryClient.invalidateQueries({ queryKey: [key] });
    });
  };

  const reopenMutation = useMutation({
    mutationFn: (task: StaffTask) => reopenStaffTask(task.id, { reason: 'Mở lại để kiểm tra bổ sung' }),
    onSuccess: () => { invalidateAll(); toast.success('Đã mở lại công việc'); },
    onError: (err) => showErrorToast(err, 'Không mở lại được công việc'),
  });
  const deleteMutation = useMutation({
    mutationFn: (task: StaffTask) => deleteStaffTask(task.id),
    onSuccess: () => { invalidateAll(); toast.success('Đã xóa công việc'); setDeletingTask(null); },
    onError: (err) => showErrorToast(err, 'Không xóa được công việc'),
  });

  const handleOpenWarrantyReport = async (task: StaffTask) => {
    if (!task.projectId || !task.warrantyVisitId) return;
    try {
      const warrantySummary = await getProjectWarranty(task.projectId);
      const visit = warrantySummary.visits.find((v) => v.id === task.warrantyVisitId);
      if (!visit) return void toast.error('Không tìm thấy phiếu bảo hành tương ứng');
      setWarrantyModalState({ projectId: task.projectId, visit });
    } catch (err) {
      showErrorToast(err, 'Không tải được thông tin phiếu bảo hành');
    }
  };

  const items = tasksRes?.items || [];
  const totalPages = Math.ceil((tasksRes?.meta?.total || 0) / pageSize);
  const departmentsList = Array.isArray(departmentsRes) ? departmentsRes : departmentsRes?.items || [];
  const openCompletingSelection = () => {
    const chosen = items.filter((i) => selectedIds.includes(i.id));
    if (chosen.length > 0) setCompletingTasks(chosen);
  };

  return (
    <div className="p-4 sm:p-5 space-y-3 pb-20 sm:space-y-4 md:pb-5">
      <div className="space-y-2.5 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-base font-bold text-slate-900">Công việc & Giao việc</h1>
            <p className="hidden text-xs text-slate-500 sm:block">Quản lý công việc theo hạn hoàn thành và lịch bảo hành cửa</p>
          </div>
          {canManageTasks && (
            <Button size="sm" variant="primary" leftIcon={<Plus size={14} />} className="sm:hidden" onClick={() => { setEditingTask(null); setIsFormOpen(true); }}>
              Giao việc
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {canManageTasks && (
            <div className="grid w-full grid-cols-2 rounded-lg border border-slate-200 bg-slate-100/80 p-0.5 sm:inline-flex sm:w-auto">
              {TASK_SCOPE_TABS.map((tab) => {
                const active = effectiveScope === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => { setScope(tab.id); setCurrentPage(1); setSelectedIds([]); }}
                    className={`rounded-md px-3 py-1.5 text-center text-xs font-medium transition cursor-pointer ${active ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    {tab.id === 'all' ? 'Quản lý chung' : 'Việc của tôi'}
                  </button>
                );
              })}
            </div>
          )}
          {canManageTasks && (
            <Button size="sm" variant="primary" leftIcon={<Plus size={14} />} className="hidden sm:inline-flex" onClick={() => { setEditingTask(null); setIsFormOpen(true); }}>
              Giao việc mới
            </Button>
          )}
        </div>
      </div>

      <div className="hidden sm:block">
        <TaskStatsCards summary={summary} isLoading={isSummaryLoading} activeQuickFilter={quickFilter} onSelectQuickFilter={(f) => { setQuickFilter(f); setDeadlineFilter(undefined); setCurrentPage(1); }} />
      </div>

      <div className="hidden sm:block">
        <TaskUrgentBanner
          urgentTasks={summary?.urgentReminderTasks || []}
          overdueCount={summary?.overdueCount ?? 0}
          dueSoonCount={summary?.dueSoonCount ?? 0}
          onQuickComplete={(t) => setCompletingTasks([t])}
          onSelectTask={setViewingTask}
          onFilterOverdue={() => { setQuickFilter('overdue'); setDeadlineFilter(undefined); setCurrentPage(1); }}
        />
      </div>

      <TaskToolbar
        scope={effectiveScope}
        canManageTasks={canManageTasks}
        summary={summary}
        search={search}
        onSearchChange={(val) => { setSearch(val); setCurrentPage(1); }}
        quickFilter={quickFilter}
        onQuickFilterChange={(val) => { setQuickFilter(val); setDeadlineFilter(undefined); setCurrentPage(1); }}
        statusFilter={statusFilter}
        onStatusFilterChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
        deadlineFilter={deadlineFilter}
        onDeadlineFilterChange={(val) => { setDeadlineFilter(val); setQuickFilter('all'); setCurrentPage(1); }}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={(val) => { setPriorityFilter(val); setCurrentPage(1); }}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={(val) => { setCategoryFilter(val); setCurrentPage(1); }}
        sourceTypeFilter={sourceTypeFilter}
        onSourceTypeFilterChange={(val) => { setSourceTypeFilter(val); setCurrentPage(1); }}
        assigneeFilter={assigneeFilter}
        onAssigneeFilterChange={(val) => { setAssigneeFilter(val); setCurrentPage(1); }}
        departmentFilter={departmentFilter}
        onDepartmentFilterChange={(val) => { setDepartmentFilter(val); setCurrentPage(1); }}
        employees={employeesRes?.items || []}
        departments={departmentsList}
        selectedCount={selectedIds.length}
        onBulkCompleteClick={openCompletingSelection}
        onResetFilters={() => {
          setSearch(''); setQuickFilter('all'); setStatusFilter(undefined); setDeadlineFilter(undefined);
          setPriorityFilter(undefined); setCategoryFilter(undefined); setSourceTypeFilter(undefined);
          setAssigneeFilter(undefined); setDepartmentFilter(undefined); setCurrentPage(1);
        }}
      />

      <TaskTable
        items={items}
        isLoading={isLoading}
        canManageTasks={canManageTasks}
        currentUserId={user?.id}
        selectedIds={selectedIds}
        onToggleSelect={(id) => setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))}
        onToggleSelectAll={(checked) => setSelectedIds(checked ? items.filter((t) => t.status === 'pending' || t.status === 'in_progress').map((t) => t.id) : [])}
        onCompleteTask={(t) => setCompletingTasks([t])}
        onOpenWarrantyReport={handleOpenWarrantyReport}
        onViewDetail={setViewingTask}
        onEditTask={(t) => { setEditingTask(t); setIsFormOpen(true); }}
        onReopenTask={(t) => reopenMutation.mutate(t)}
        onDeleteTask={setDeletingTask}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
      />

      {selectedIds.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-2 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-xs md:hidden">
          <div className="text-xs font-semibold text-slate-700">
            Đã chọn <b className="font-mono text-primary">{selectedIds.length}</b> công việc
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setSelectedIds([])}>Bỏ chọn</Button>
            <Button size="sm" variant="primary" leftIcon={<CheckCircle2 size={14} />} onClick={openCompletingSelection}>
              Hoàn thành ({selectedIds.length})
            </Button>
          </div>
        </div>
      )}

      <TaskFormModal isOpen={isFormOpen} task={editingTask} employees={employeesRes?.items || []} departments={departmentsList} projects={projectsRes?.items || []} onClose={() => setIsFormOpen(false)} onSuccess={invalidateAll} />
      <TaskCompleteModal tasks={completingTasks} isOpen={completingTasks.length > 0} onClose={() => setCompletingTasks([])} onSuccess={() => { setSelectedIds([]); invalidateAll(); }} />
      <TaskDetailModal task={viewingTask} onClose={() => setViewingTask(null)} onCompleteTask={(t) => setCompletingTasks([t])} onOpenWarrantyReport={handleOpenWarrantyReport} />
      <ConfirmActionModal
        isOpen={Boolean(deletingTask)}
        onClose={() => setDeletingTask(null)}
        title="Xác nhận xóa công việc"
        description={<span>Bạn có chắc chắn muốn xóa công việc <b>{deletingTask?.code}</b> ({deletingTask?.title}) không?</span>}
        confirmText="Xóa công việc"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={() => { if (deletingTask) deleteMutation.mutate(deletingTask); }}
      />
      {warrantyModalState && (
        <CompleteVisitModal projectId={warrantyModalState.projectId} visit={warrantyModalState.visit} onClose={() => { setWarrantyModalState(null); invalidateAll(); }} />
      )}
    </div>
  );
}
