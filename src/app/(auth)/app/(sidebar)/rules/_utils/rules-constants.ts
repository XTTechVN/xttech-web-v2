import type { RulesScope } from '@/types';
import { DOCUMENT_STATUS_MAP } from '@/types';
import { RULES_QUERY_KEYS } from '@/utils';

export { RULES_QUERY_KEYS };

export type RulesTab = 'current' | 'drafts' | 'to_process';

export const RULES_TAB_VALUES: RulesTab[] = ['current', 'drafts', 'to_process'];

export type CurrentScopeChip = Extract<RulesScope, 'all' | 'company' | 'department' | 'user' | 'mine'>;

export const CURRENT_SCOPE_CHIPS: CurrentScopeChip[] = ['all', 'company', 'department', 'user', 'mine'];

export const EMPLOYEE_SCOPE_CHIPS: CurrentScopeChip[] = ['all', 'company', 'department', 'mine'];

export const RULES_PAGE_SIZE = 20;

export const EXPIRING_SOON_DAYS = 30;

export const CURRENT_STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  ...(['published', 'superseded', 'expired'] as const).map((key) => ({
    value: key,
    label: DOCUMENT_STATUS_MAP[key].label,
  })),
];

export const expandDocumentTypes = (type: string): string | undefined => {
  if (!type) return undefined;
  return type === 'announcement' ? 'announcement,notice' : type;
};

export const SCOPE_BY_TAB: Record<Exclude<RulesTab, 'current'>, RulesScope> = {
  drafts: 'drafts',
  to_process: 'to_process',
};
