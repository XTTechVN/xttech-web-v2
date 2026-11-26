'use client';

import React, { useMemo } from 'react';
import { ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Alert, Badge, Button } from '@/components';
import { RECONCILIATION_STATUS_MAP } from '@/config/finance';
import type { StatutoryFiling, StatutoryReconciliationCheck } from '@/types';
import { formatCurrency } from '@/utils';
import {
  PHASE3_RC_PLACEHOLDER_SLOTS,
  type StatutorySubTabKey,
} from './statutory-tax-tab.constants';

export interface ReconciliationPanelProps {
  filings: StatutoryFiling[];
  onJumpToSource: (jumpTab?: string | null, jumpTarget?: string | null) => void;
  onNavigateSubTab: (subTab: StatutorySubTabKey) => void;
}

function ReconciliationCard({
  check,
  formLabel,
  onJump,
}: {
  check: StatutoryReconciliationCheck;
  formLabel: string;
  onJump: () => void;
}) {
  const statusMeta = RECONCILIATION_STATUS_MAP[check.status] ?? RECONCILIATION_STATUS_MAP.pending;
  const isFailed = check.status === 'failed';

  return (
    <div
      className={`rounded-xl border p-4 space-y-2.5 ${
        isFailed ? 'border-rose-200 bg-rose-50/40' : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="primary" size="sm">{check.gateCode}</Badge>
          <span className="text-xs font-bold text-slate-900">{check.title}</span>
          <Badge variant="default" size="sm">{formLabel}</Badge>
        </div>
        <Badge variant={statusMeta.variant} size="sm">{statusMeta.label}</Badge>
      </div>

      {check.message && <p className="text-xs text-slate-600">{check.message}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
        <div>
          <span className="text-slate-500">Giá trị kỳ vọng / Tờ khai:</span>
          <div className="font-mono font-bold text-slate-900 tabular-nums mt-0.5">
            {formatCurrency(check.expectedValue)}
          </div>
        </div>
        <div>
          <span className="text-slate-500">Giá trị đối chiếu / Sổ cái:</span>
          <div className="font-mono font-bold text-slate-900 tabular-nums mt-0.5">
            {formatCurrency(check.actualValue)}
          </div>
        </div>
        <div>
          <span className="text-slate-500">Chênh lệch:</span>
          <div
            className={`font-mono font-bold tabular-nums mt-0.5 ${
              check.difference !== 0 ? 'text-rose-700' : 'text-emerald-700'
            }`}
          >
            {formatCurrency(check.difference)}
          </div>
        </div>
      </div>

      {isFailed && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={onJump}
            rightIcon={<ArrowRight size={13} />}
          >
            Đi tới nguồn lệch
          </Button>
        </div>
      )}
    </div>
  );
}

export function ReconciliationPanel({
  filings,
  onJumpToSource,
  onNavigateSubTab,
}: ReconciliationPanelProps) {
  const { activeChecks, missingSlots } = useMemo(() => {
    const byGate = new Map<
      string,
      { check: StatutoryReconciliationCheck; formLabel: string }
    >();
    for (const filing of filings) {
      for (const check of filing.reconciliations || []) {
        if (!byGate.has(check.gateCode)) {
          byGate.set(check.gateCode, { check, formLabel: filing.formCode });
        }
      }
    }
    const list = Array.from(byGate.values()).sort((a, b) =>
      a.check.gateCode.localeCompare(b.check.gateCode),
    );
    const missing = PHASE3_RC_PLACEHOLDER_SLOTS.filter((s) => !byGate.has(s.gateCode));
    return { activeChecks: list, missingSlots: missing };
  }, [filings]);

  const failedCount = activeChecks.filter((c) => c.check.status === 'failed').length;

  return (
    <div className="space-y-4 text-xs">
      {failedCount > 0 ? (
        <Alert
          variant="danger"
          title={`Phát hiện ${failedCount} cổng đối chiếu chưa khớp (Chặn duyệt & xuất)`}
          icon={<ShieldAlert size={16} />}
        >
          Vui lòng xử lý toàn bộ chênh lệch trên Sổ cái hoặc bảng kê trước khi duyệt hồ sơ BCTC &amp; Tờ khai thuế.
        </Alert>
      ) : activeChecks.length > 0 ? (
        <Alert
          variant="success"
          title={`Đã kiểm tra ${activeChecks.length}/6 cổng đối chiếu — Khớp 100%`}
          icon={<CheckCircle2 size={16} />}
        >
          Tất cả cổng đối chiếu đã chạy đều khớp hoàn toàn với Sổ cái hợp nhất.
        </Alert>
      ) : (
        <Alert variant="info" title="Chưa có dữ liệu đối chiếu trong kỳ">
          Hãy bấm &quot;Tính toán&quot; trên Tờ khai thuế hoặc BCTC để chạy đủ 6 cổng đối chiếu RC-01..RC-06.
        </Alert>
      )}

      <div className="space-y-3">
        {activeChecks.map(({ check, formLabel }) => (
          <ReconciliationCard
            key={check.gateCode}
            check={check}
            formLabel={formLabel}
            onJump={() => {
              if (check.gateCode === 'RC-06') {
                onNavigateSubTab('pit_ledger');
              } else if (check.gateCode === 'RC-04') {
                onJumpToSource('tax', 'tax_invoices');
              } else if (check.gateCode === 'RC-05') {
                onNavigateSubTab('declarations');
              } else if (
                check.gateCode === 'RC-01' ||
                check.gateCode === 'RC-02' ||
                check.gateCode === 'RC-03'
              ) {
                onNavigateSubTab('bctc');
              } else {
                onJumpToSource(check.jumpTab, check.jumpTarget);
              }
            }}
          />
        ))}
      </div>

      {missingSlots.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2.5">
          <div className="text-xs font-bold text-slate-700">
            Các cổng đối chiếu chưa chạy trong kỳ (Tính BCTC / 03_TNDN để kích hoạt)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {missingSlots.map((slot) => (
              <div
                key={slot.gateCode}
                className="rounded-lg border border-dashed border-slate-200 bg-slate-50/70 p-3 flex items-start justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="default" size="sm">{slot.gateCode}</Badge>
                    <span className="font-semibold text-slate-700">{slot.title}</span>
                  </div>
                </div>
                <Badge variant="default" size="sm">Chưa chạy</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
