'use client';

import { useMemo } from 'react';
import { useQueryParam } from '@/hooks';
import type { GetDocumentRulesParams, RulesScope } from '@/types';
import {
  CURRENT_SCOPE_CHIPS,
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

const toChip = (value?: string): CurrentScopeChip =>
  CURRENT_SCOPE_CHIPS.includes(value as CurrentScopeChip) ? (value as CurrentScopeChip) : 'all';

// Toàn bộ trạng thái bộ lọc được đồng bộ lên URL để chia sẻ / F5 không mất ngữ cảnh
export function useRulesFilters(canManage = false) {
  const [rawTab, setTab] = useQueryParam('tab', 'current');
  const [rawChip, setChip] = useQueryParam('scope', 'all');
  const [search, setSearch] = useQueryParam('search', '');
  const [documentType, setDocumentType] = useQueryParam('type', '');
  const [status, setStatus] = useQueryParam('status', '');
  const [unread, setUnread] = useQueryParam('unread', '');
  const [expiring, setExpiring] = useQueryParam('expiring', '');
  const [rawOffset, setOffset] = useQueryParam('offset', '0');

  const tab = toTab(rawTab, canManage);
  const chip = toChip(rawChip);
  const offset = Number(rawOffset) || 0;
  const isCurrentTab = tab === 'current';

  const params = useMemo<GetDocumentRulesParams>(() => {
    const scope: RulesScope = isCurrentTab ? chip : SCOPE_BY_TAB[tab as Exclude<RulesTab, 'current'>];
    return {
      scope,
      search: search?.trim() || undefined,
      documentTypes: expandDocumentTypes(documentType || ''),
      status: isCurrentTab ? status || undefined : undefined,
      isRead: isCurrentTab && unread === '1' ? false : undefined,
      expiringSoon: isCurrentTab && expiring === '1' ? true : undefined,
      offset,
      limit: RULES_PAGE_SIZE,
    };
  }, [tab, chip, search, documentType, status, unread, expiring, offset, isCurrentTab]);

  const resetFilters = () => {
    setSearch('');
    setDocumentType('');
    setStatus('');
    setUnread('');
    setExpiring('');
  };

  return {
    tab,
    chip,
    search: search || '',
    documentType: documentType || '',
    status: status || '',
    isUnreadOnly: unread === '1',
    isExpiringOnly: expiring === '1',
    offset,
    params,
    setTab,
    setChip,
    setSearch,
    setDocumentType,
    setStatus,
    setUnreadOnly: (isOn: boolean) => setUnread(isOn ? '1' : ''),
    setExpiringOnly: (isOn: boolean) => setExpiring(isOn ? '1' : ''),
    setOffset: (value: number) => setOffset(String(value)),
    resetFilters,
  };
}
