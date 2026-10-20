'use client';

import React, { useMemo } from 'react';
import { Select } from '@/components';
import { cn } from '@/utils';
import { DOCUMENT_TYPE_MAP, RULES_SCOPE_LABEL_MAP, RULE_FILTER_TYPES } from '@/types';
import { CURRENT_SCOPE_CHIPS, CURRENT_STATUS_OPTIONS, type CurrentScopeChip, type RulesTab } from '../_utils/rules-constants';

interface RulesFilterBarProps {
  tab: RulesTab;
  chip: CurrentScopeChip;
  documentType: string;
  status: string;
  isUnreadOnly: boolean;
  isExpiringOnly: boolean;
  expiringSoonCount: number;
  onChipChange: (chip: CurrentScopeChip) => void;
  onDocumentTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onUnreadOnlyChange: (isOn: boolean) => void;
  onExpiringOnlyChange: (isOn: boolean) => void;
}

const TOGGLE_BASE = 'px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer select-none transition-colors';
const TOGGLE_ON = 'bg-primary text-white border-primary';
const TOGGLE_OFF = 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50';

export const RulesFilterBar: React.FC<RulesFilterBarProps> = (props) => {
  const { tab, chip, documentType, status, isUnreadOnly, isExpiringOnly, expiringSoonCount } = props;
  const isCurrentTab = tab === 'current';

  const typeOptions = useMemo(
    () => [
      { value: '', label: 'Tất cả loại cơ chế' },
      ...RULE_FILTER_TYPES.map((key) => ({ value: key, label: DOCUMENT_TYPE_MAP[key].label })),
    ],
    [],
  );

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-3">
      {isCurrentTab &&
        CURRENT_SCOPE_CHIPS.map((key) => (
          <button
            key={key}
            id={`rules-chip-${key}`}
            type="button"
            onClick={() => props.onChipChange(key)}
            className={cn(TOGGLE_BASE, chip === key ? TOGGLE_ON : TOGGLE_OFF)}
          >
            {RULES_SCOPE_LABEL_MAP[key]}
          </button>
        ))}

      {isCurrentTab && <span className="hidden sm:block w-px h-5 bg-slate-200 mx-1" />}

      <div className="w-44">
        <Select
          fullWidth
          value={documentType}
          onChange={(e) => props.onDocumentTypeChange(e.target.value)}
          options={typeOptions}
        />
      </div>

      {isCurrentTab && (
        <>
          <div className="w-44">
            <Select
              fullWidth
              value={status}
              onChange={(e) => props.onStatusChange(e.target.value)}
              options={CURRENT_STATUS_OPTIONS}
            />
          </div>
          <button
            id="rules-filter-unread"
            type="button"
            onClick={() => props.onUnreadOnlyChange(!isUnreadOnly)}
            className={cn(TOGGLE_BASE, isUnreadOnly ? TOGGLE_ON : TOGGLE_OFF)}
          >
            Chưa đọc
          </button>
          <button
            id="rules-filter-expiring"
            type="button"
            onClick={() => props.onExpiringOnlyChange(!isExpiringOnly)}
            className={cn(TOGGLE_BASE, isExpiringOnly ? TOGGLE_ON : TOGGLE_OFF)}
          >
            Sắp hết hiệu lực{expiringSoonCount > 0 ? ` (${expiringSoonCount})` : ''}
          </button>
        </>
      )}
    </div>
  );
};
