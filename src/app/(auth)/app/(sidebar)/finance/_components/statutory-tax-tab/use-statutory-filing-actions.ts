'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  approveStatutoryFiling,
  backfillStatutoryCashflowCodes,
  computeStatutoryFiling,
  createSupplementalFiling,
  downloadStatutoryXml,
  exportStatutorySnapshot,
  getPitEntries,
  markStatutoryFilingFiled,
  reconcileStatutoryFiling,
} from '@/actions';
import type {
  DeclarationKind,
  FinanceSetting,
  StatutoryFiling,
  StatutoryFormCode,
  StatutoryPeriodType,
} from '@/types';
import { showErrorToast, showSuccessToast } from '@/utils';
import { exportStatutoryFilingExcel } from '../../_utils';
import { toFilingFrequency } from './statutory-tax-tab.constants';

export function useStatutoryFilingActions({
  taxYear,
  periodType,
  periodIndex,
  setting,
}: {
  taxYear: number;
  periodType: StatutoryPeriodType;
  periodIndex: number;
  setting: FinanceSetting | null;
}) {
  const queryClient = useQueryClient();
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const invalidateStatutory = async () => {
    await queryClient.invalidateQueries({ queryKey: ['finance', 'statutory'] });
  };

  const handleCompute = async (
    formCode: StatutoryFormCode,
    manualOverrides?: Record<string, number>,
    declarationKind: DeclarationKind = 'initial',
    supplementalSeq = 0,
  ) => {
    setBusyKey(`compute-${formCode}`);
    try {
      await computeStatutoryFiling({
        formCode,
        taxYear,
        periodType,
        periodIndex,
        declarationKind,
        supplementalSeq,
        manualOverrides,
      });
      await invalidateStatutory();
      showSuccessToast(`Đã tính toán số liệu tờ khai ${formCode}`);
    } catch (err) {
      showErrorToast(err, `Không thể tính toán ${formCode}`);
    } finally {
      setBusyKey(null);
    }
  };

  const handleReconcile = async (filingId: number) => {
    setBusyKey(`reconcile-${filingId}`);
    try {
      await reconcileStatutoryFiling(filingId);
      await invalidateStatutory();
      showSuccessToast('Đã chạy cổng đối chiếu chéo với Sổ cái');
    } catch (err) {
      showErrorToast(err, 'Đối chiếu chéo thất bại');
    } finally {
      setBusyKey(null);
    }
  };

  const handleApprove = async (filingId: number) => {
    setBusyKey(`approve-${filingId}`);
    try {
      await approveStatutoryFiling(filingId);
      await invalidateStatutory();
      showSuccessToast('Đã duyệt tờ khai thuế');
    } catch (err) {
      showErrorToast(err, 'Không thể duyệt tờ khai');
    } finally {
      setBusyKey(null);
    }
  };

  const handleExportFiling = async (filing: StatutoryFiling) => {
    setBusyKey(`export-${filing.id}`);
    try {
      const snapped = await exportStatutorySnapshot(filing.id);
      const pitSummary =
        filing.formCode === '05_KK_TNCN'
          ? await getPitEntries({
              taxYear,
              periodType: toFilingFrequency(periodType),
              periodIndex,
            })
          : null;
      await exportStatutoryFilingExcel(snapped, setting, pitSummary);
      await invalidateStatutory();
      showSuccessToast(`Đã xuất file Excel & lưu Snapshot SHA-256 cho ${filing.formCode}`);
    } catch (err) {
      showErrorToast(err, 'Không thể xuất file Excel tờ khai');
    } finally {
      setBusyKey(null);
    }
  };

  const handleExportXml = async (filing: StatutoryFiling) => {
    setBusyKey(`xml-${filing.id}`);
    try {
      const res = await downloadStatutoryXml(filing.id, `${filing.formCode}_HTKK.xml`);
      await invalidateStatutory();
      showSuccessToast(`Đã xuất file XML HTKK: ${res.filename}`);
    } catch (err) {
      showErrorToast(err, 'Không thể xuất file XML HTKK');
    } finally {
      setBusyKey(null);
    }
  };

  const handleMarkFiled = async (filingId: number, taxFilingRef: string) => {
    setBusyKey(`mark-${filingId}`);
    try {
      await markStatutoryFilingFiled(filingId, { taxFilingRef: taxFilingRef || null });
      await queryClient.invalidateQueries({ queryKey: ['finance'] });
      showSuccessToast('Đã đánh dấu Đã nộp CQT và khóa kỳ thuế');
    } catch (err) {
      showErrorToast(err, 'Không thể đánh dấu đã nộp');
    } finally {
      setBusyKey(null);
    }
  };

  const handleCreateSupplemental = async (formCode: StatutoryFormCode) => {
    setBusyKey(`supp-${formCode}`);
    try {
      const created = await createSupplementalFiling({
        formCode,
        taxYear,
        periodType,
        periodIndex,
      });
      await invalidateStatutory();
      showSuccessToast(
        `Đã khởi tạo tờ khai bổ sung lần ${created.supplementalSeq} (01/KHBS) cho ${formCode}`,
      );
      return created;
    } catch (err) {
      showErrorToast(err, `Không thể lập tờ khai bổ sung cho ${formCode}`);
      return null;
    } finally {
      setBusyKey(null);
    }
  };

  const handleBackfillCashflow = async () => {
    setBusyKey('backfill-cashflow');
    try {
      const res = await backfillStatutoryCashflowCodes();
      await computeStatutoryFiling({
        formCode: 'B03_DN',
        taxYear,
        periodType,
        periodIndex,
        declarationKind: 'initial',
        supplementalSeq: 0,
      });
      await invalidateStatutory();
      showSuccessToast(res.message);
    } catch (err) {
      showErrorToast(err, 'Không thể tự gắn mã dòng tiền cho bút toán cũ');
    } finally {
      setBusyKey(null);
    }
  };

  return {
    busyKey,
    handleCompute,
    handleReconcile,
    handleApprove,
    handleExportFiling,
    handleExportXml,
    handleMarkFiled,
    handleCreateSupplemental,
    handleBackfillCashflow,
  };
}
