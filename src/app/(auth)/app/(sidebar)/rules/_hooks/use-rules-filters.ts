'use client';

import { useMemo } from 'react';
import { useQueryParam } from '@/hooks';
import type { GetDocumentRulesParams, RulesScope, RulesViewMode } from '@/types';
import {
  CURRENT_SCOPE_CHIPS,
  EMPLOYEE_SCOPE_CHIPS,
  RULES_PAGE_SIZE,
  RULES_TAB_VALUES,
  SCOPE_BY_TAB,
  expandDocumentTypes,
  type CurrentScopeChip,
  type RulesTab,
} from '../_utils/rules-constants';

const toTab = (value?: string, canManage = false): RulesTab => {
  if (!canManage) return 'current';
  return RULES_TAB_VALUES.includes(value as RulesTab) ? (value as RulesTab) : 'current';
};

const toChip = (value?: string, canManage = false): CurrentScopeChip => {
  const allowed = canManage ? CURRENT_SCOPE_CHIPS : EMPLOYEE_SCOPE_CHIPS;
  return allowed.includes(value as CurrentScopeChip) ? (value as CurrentScopeChip) : 'all';
};

const toViewMode = (value?: string): RulesViewMode => (value === 'list' ? 'list' : 'grid');

const splitCsv = (raw?: string): string[] =>
  raw
    ? raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

// Toàn bộ trạng thái bộ lọc được đồng bộ lên URL để chia sẻ / F5 không mất ngữ cảnh
export function useRulesFilters(canManage = false) {
  const [rawTab, setTab] = useQueryParam('tab', 'current');
  const [rawChip, setChip] = useQueryParam('scope', 'all');
  const [rawView, setView] = useQueryParam('view', 'grid');
  const [search, setSearch] = useQueryParam('search', '');
  const [documentType, setDocumentType] = useQueryParam('type', '');
  const [status, setStatus] = useQueryParam('status', '');
  const [unread, setUnread] = useQueryParam('unread', '');
  const [expiring, setExpiring] = useQueryParam('expiring', '');
  const [rawDeptIds, setRawDeptIds] = useQueryParam('depts', '');
  const [rawUserIds, setRawUserIds] = useQueryParam('users', '');
  const [rawOffset, setOffset] = useQueryParam('offset', '0');

  const tab = toTab(rawTab, canManage);
  const chip = toChip(rawChip, canManage);
  const viewMode = toViewMode(rawView);
  const offset = Number(rawOffset) || 0;
  const isCurrentTab = tab === 'current';

  const departmentIds = useMemo(() => (canManage ? splitCsv(rawDeptIds) : []), [rawDeptIds, canManage]);
  const recipientUserIds = useMemo(() => (canManage ? splitCsv(rawUserIds) : []), [rawUserIds, canManage]);

  const params = useMemo<GetDocumentRulesParams>(() => {
    const scope: RulesScope = isCurrentTab ? chip : SCOPE_BY_TAB[tab as Exclude<RulesTab, 'current'>];
    return {
      scope,
      search: search?.trim() || undefined,
      documentTypes: expandDocumentTypes(documentType || ''),
      status: isCurrentTab ? status || undefined : undefined,
      isRead: isCurrentTab && unread === '1' ? false : undefined,
      expiringSoon: isCurrentTab && expiring === '1' ? true : undefined,
      departmentIds: isCurrentTab && departmentIds.length > 0 ? departmentIds.join(',') : undefined,
      recipientUserIds: isCurrentTab && recipientUserIds.length > 0 ? recipientUserIds.join(',') : undefined,
      offset,
      limit: RULES_PAGE_SIZE,
    };
  }, [tab, chip, search, documentType, status, unread, expiring, departmentIds, recipientUserIds, offset, isCurrentTab]);

  const hasActiveFilters = Boolean(
    search ||
      documentType ||
      status ||
      unread === '1' ||
      expiring === '1' ||
      chip !== 'all' ||
      departmentIds.length > 0 ||
      recipientUserIds.length > 0,
  );

  const resetFilters = () => {
    setChip('all');
    setSearch('');
    setDocumentType('');
    setStatus('');
    setUnread('');
    setExpiring('');
    setRawDeptIds('');
    setRawUserIds('');
    setOffset('0');
  };

  return {
    tab,
    chip,
    viewMode,
    search: search || '',
    documentType: documentType || '',
    status: status || '',
    isUnreadOnly: unread === '1',
    isExpiringOnly: expiring === '1',
    departmentIds,
    recipientUserIds,
    hasActiveFilters,
    offset,
    params,
    setTab,
    setChip,
    setViewMode: (mode: RulesViewMode) => setView(mode),
    setSearch,
    setDocumentType,
    setStatus,
    setUnreadOnly: (isOn: boolean) => setUnread(isOn ? '1' : ''),
    setExpiringOnly: (isOn: boolean) => setExpiring(isOn ? '1' : ''),
    setDepartmentIds: (ids: (string | number)[]) => setRawDeptIds(ids.map(String).join(',')),
    setRecipientUserIds: (ids: (string | number)[]) => setRawUserIds(ids.map(String).join(',')),
    setOffset: (value: number) => setOffset(String(value)),
    resetFilters,
  };
}
