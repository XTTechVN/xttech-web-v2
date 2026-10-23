import type { RulesScope } from '@/types';
import { DOCUMENT_STATUS_MAP } from '@/types';

export type RulesTab = 'current' | 'drafts' | 'to_process';

export const RULES_TAB_VALUES: RulesTab[] = ['current', 'drafts', 'to_process'];

// Tab "Cơ chế hiện hành": chip -> scope backend. Hai tab còn lại dùng scope cố định.
export type CurrentScopeChip = Extract<RulesScope, 'all' | 'company' | 'department' | 'user' | 'mine'>;

export const CURRENT_SCOPE_CHIPS: CurrentScopeChip[] = ['all', 'company', 'department', 'user', 'mine'];

// Đối với nhân viên thường: không hiện chip 'user' quản lý, chỉ hiện all, company, department, mine
export const EMPLOYEE_SCOPE_CHIPS: CurrentScopeChip[] = ['all', 'company', 'department', 'mine'];

export const RULES_QUERY_KEYS = {
  root: ['document-rules'] as const,
  list: (params: Record<string, unknown>) => ['document-rules', 'list', params] as const,
  summary: ['document-rules', 'summary'] as const,
  timeline: (id?: number | null) => ['document-rules', 'timeline', id ?? 0] as const,
  detail: (id?: number | null) => ['document-rules', 'detail', id ?? 0] as const,
  supersedeCandidates: ['document-rules', 'supersede-candidates'] as const,
};

export const RULES_PAGE_SIZE = 20;

// Khớp EXPIRING_SOON_DAYS ở backend
export const EXPIRING_SOON_DAYS = 30;

// Bộ lọc trạng thái ở tab hiện hành (backend chỉ áp dụng cho nhóm văn bản đã ban hành)
export const CURRENT_STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  ...(['published', 'superseded', 'expired'] as const).map((key) => ({
    value: key,
    label: DOCUMENT_STATUS_MAP[key].label,
  })),
];

// Backend coi announcement và notice cũ là cùng một loại "Thông báo"
export const expandDocumentTypes = (type: string): string | undefined => {
  if (!type) return undefined;
  return type === 'announcement' ? 'announcement,notice' : type;
};

export const SCOPE_BY_TAB: Record<Exclude<RulesTab, 'current'>, RulesScope> = {
  drafts: 'drafts',
  to_process: 'to_process',
};
