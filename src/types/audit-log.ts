export interface AuditLogActor {
  userId?: string;
  user_id?: string;
  userName?: string;
  user_name?: string;
  ipAddress?: string | null;
  ip_address?: string | null;
  userAgent?: string | null;
  user_agent?: string | null;
}

export interface AuditLogChanges {
  oldValue?: Record<string, any> | null;
  old_value?: Record<string, any> | null;
  newValue?: Record<string, any> | null;
  new_value?: Record<string, any> | null;
  error?: string | null;
}

export interface AuditLog {
  id: number;
  eventId?: string;
  event_id?: string;
  timestamp: string;
  actor: AuditLogActor;
  action: string;
  resource: string;
  targetId?: string | null;
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
  eventId?: string;
  action?: string;
  resource?: string;
  targetId?: string;
  status?: string;
}
