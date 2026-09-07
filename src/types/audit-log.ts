export interface AuditLogActor {
  user_id: string;
  user_name: string;
  ip_address?: string | null;
  user_agent?: string | null;
}

export interface AuditLogChanges {
  old_value?: Record<string, any> | null;
  new_value?: Record<string, any> | null;
}

export interface AuditLog {
  id: number;
  event_id: string;
  timestamp: string;
  actor: AuditLogActor;
  action: string;
  resource: string;
  target_id?: string | null;
  changes?: AuditLogChanges | null;
  status: string;
}

export interface AuditLogQueryParams {
  offset?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  event_id?: string;
  action?: string;
  resource?: string;
  target_id?: string;
  status?: string;
}
