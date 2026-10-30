'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getDocumentRules, getDocumentRulesSummary } from '@/actions/document';
import type { GetDocumentRulesParams } from '@/types';
import { RULES_QUERY_KEYS } from '../_utils/rules-constants';

export function useRulesList(params: GetDocumentRulesParams) {
  return useQuery({
    queryKey: RULES_QUERY_KEYS.list({ ...params }),
    queryFn: () => getDocumentRules(params),
    placeholderData: keepPreviousData,
  });
}

export function useRulesSummary() {
  return useQuery({
    queryKey: RULES_QUERY_KEYS.summary,
    queryFn: getDocumentRulesSummary,
    refetchInterval: 60_000,
  });
}
