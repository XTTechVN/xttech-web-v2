export type StaffTaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export type StaffTaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type StaffTaskCategory =
  | 'general'
  | 'warranty'
  | 'project_site'
  | 'warehouse_production'
  | 'administrative';

export type StaffTaskSourceType = 'manual' | 'warranty';

export type StaffTaskDeadlineState =
  | 'overdue'
  | 'due_soon'
  | 'on_track'
  | 'completed_on_time'
  | 'completed_late'
  | 'cancelled';

export type StaffTaskScope = 'mine' | 'all';

export interface StaffTask {
  id: number;
  code: string;
  title: string;
  description: string | null;
  category: StaffTaskCategory;
  priority: StaffTaskPriority;
  status: StaffTaskStatus;
  sourceType: StaffTaskSourceType;

  assigneeId: string;
  assigneeName: string | null;
  assigneeEmail: string | null;
  assigneeAvatar: string | null;

  assignedById: string | null;
  assignedByName: string | null;

  departmentId: number | null;
  departmentName: string | null;

  projectId: number | null;
  projectCode: string | null;
  projectName: string | null;
  projectAddress: string | null;

  warrantyVisitId: number | null;
  warrantyVisitCode: string | null;
  warrantyVisitStatus: 'scheduled' | 'in_progress' | 'done' | 'cancelled' | null;
  warrantyVisitKind: 'periodic' | 'claim' | null;
  warrantyScheduledDate: string | null;
  requesterName: string | null;
  requesterPhone: string | null;

  dueAt: string;
  startedAt: string | null;
  completedAt: string | null;

  isCompletedLate: boolean;
  lateMinutes: number;
  isOverdue: boolean;
  isDueSoon: boolean;
  deadlineState: StaffTaskDeadlineState;

  completionNote: string | null;
  managerNote: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface StaffTaskSummary {
  totalCount: number;
  pendingCount: number;
  inProgressCount: number;
  openCount: number;
  dueSoonCount: number;
  overdueCount: number;
  completedOnTimeCount: number;
  completedLateCount: number;
  completedTodayCount: number;
  urgentReminderTasks: StaffTask[];
}

export interface StaffTaskCreatePayload {
  title: string;
  description?: string | null;
  category?: StaffTaskCategory;
  priority?: StaffTaskPriority;
  assigneeIds: string[];
  dueAt: string;
  projectId?: number | null;
  warrantyVisitId?: number | null;
  managerNote?: string | null;
}

export interface StaffTaskBatchCreateResponse {
  createdCount: number;
  items: StaffTask[];
}

export interface StaffTaskUpdatePayload {
  title?: string;
  description?: string | null;
  category?: StaffTaskCategory;
  priority?: StaffTaskPriority;
  assigneeId?: string;
  dueAt?: string;
  projectId?: number | null;
  managerNote?: string | null;
}

export interface StaffTaskCompletePayload {
  completionNote?: string | null;
}

export interface StaffTaskBulkCompletePayload {
  taskIds: number[];
  completionNote?: string | null;
}

export interface StaffTaskBulkCompleteResponse {
  completedCount: number;
  completedLateCount: number;
  items: StaffTask[];
}

export interface StaffTaskReopenPayload {
  reason?: string | null;
}

export interface StaffTaskQueryParams {
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  scope?: StaffTaskScope;
  status?: StaffTaskStatus;
  openOnly?: boolean;
  deadlineState?: StaffTaskDeadlineState;
  priority?: StaffTaskPriority;
  category?: StaffTaskCategory;
  sourceType?: StaffTaskSourceType;
  assigneeId?: string;
  departmentId?: number;
  projectId?: number;
  dueFrom?: string;
  dueTo?: string;
}

