import type { FinanceTabKey } from '@/types';

export const DEFAULT_FINANCE_TAB: FinanceTabKey = 'overview';

export const FINANCE_TAB_KEYS: FinanceTabKey[] = [
  'overview',
  'cash',
  'bank',
  'ar_ap',
  'gl_closing',
  'tax',
  'reports',
  'settings',
];

export function resolveFinanceTabKey(raw: string | null): FinanceTabKey {
  if (raw && FINANCE_TAB_KEYS.includes(raw as FinanceTabKey)) {
    return raw as FinanceTabKey;
  }
  return DEFAULT_FINANCE_TAB;
}
