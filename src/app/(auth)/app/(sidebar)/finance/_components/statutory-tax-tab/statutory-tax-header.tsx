'use client';

import React from 'react';
import { Landmark, RefreshCw } from 'lucide-react';
import { Badge, Button, Select, Tabs, type TabItem } from '@/components';
import { ACCOUNTING_REGIME_MAP } from '@/config/finance';
import type { AccountingRegime, StatutoryPeriodType } from '@/types';
import {
  STATUTORY_MONTH_OPTIONS,
  STATUTORY_PERIOD_TYPE_OPTIONS,
  STATUTORY_QUARTER_OPTIONS,
  type StatutorySubTabKey,
} from './statutory-tax-tab.constants';

export interface StatutoryTaxHeaderProps {
  activeRegime: AccountingRegime;
  taxYear: number;
  currentYear: number;
  periodType: StatutoryPeriodType;
  periodIndex: number;
  isFetching: boolean;
  subTab: StatutorySubTabKey;
  tabItems: TabItem[];
  onChangeYear: (year: number) => void;
  onChangePeriodType: (type: StatutoryPeriodType) => void;
  onChangePeriodIndex: (index: number) => void;
  onChangeSubTab: (tab: StatutorySubTabKey) => void;
  onRefresh: () => void;
}

export function StatutoryTaxHeader({
  activeRegime,
  taxYear,
  currentYear,
  periodType,
  periodIndex,
  isFetching,
  subTab,
  tabItems,
  onChangeYear,
  onChangePeriodType,
  onChangePeriodIndex,
  onChangeSubTab,
  onRefresh,
}: StatutoryTaxHeaderProps) {
  const regimeMeta = ACCOUNTING_REGIME_MAP[activeRegime] ?? ACCOUNTING_REGIME_MAP.tt99;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Landmark size={18} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                BCTC &amp; Kê khai Thuế Điện tử (TT99/2025 &amp; TT89/2026)
              </h3>
              <Badge variant={regimeMeta.variant} size="sm">{regimeMeta.shortLabel}</Badge>
              <Badge variant="default" size="sm">HTKK 5.8.4</Badge>
            </div>
            <p className="text-xs text-slate-500">
              Tổng hợp tờ khai 01/GTGT, 05/KK-TNCN, 03/TNDN, BCTC TT99 (B01..B09, CĐTK), 6 cổng đối chiếu &amp; kết xuất Excel/XML
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="w-28">
            <Select
              value={String(taxYear)}
              options={[currentYear - 1, currentYear, currentYear + 1].map((y) => ({
                value: String(y),
                label: `Năm ${y}`,
              }))}
              onChange={(e) => onChangeYear(Number(e.target.value))}
              fullWidth
            />
          </div>
          <div className="w-40">
            <Select
              value={periodType}
              options={STATUTORY_PERIOD_TYPE_OPTIONS}
              onChange={(e) => {
                onChangePeriodType(e.target.value as StatutoryPeriodType);
                onChangePeriodIndex(1);
              }}
              fullWidth
            />
          </div>
          {periodType !== 'annual' && (
            <div className="w-40">
              <Select
                value={String(periodIndex)}
                options={periodType === 'month' ? STATUTORY_MONTH_OPTIONS : STATUTORY_QUARTER_OPTIONS}
                onChange={(e) => onChangePeriodIndex(Number(e.target.value))}
                fullWidth
              />
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            leftIcon={<RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />}
          >
            Làm mới
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto pb-0.5">
        <Tabs
          tabs={tabItems}
          activeTab={subTab}
          onChange={(val) => onChangeSubTab(val as StatutorySubTabKey)}
          variant="pill"
          size="sm"
        />
      </div>
    </div>
  );
}
