'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { FileCheck2, Lock, LockOpen, RefreshCw, ShieldAlert } from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  ConfirmActionModal,
  Input,
  Select,
  Skeleton,
} from '@/components';
import {
  getPeriodLocks,
  lockPeriod,
  markPeriodTaxFiled,
  unlockPeriod,
} from '@/actions';
import type { PeriodLock } from '@/types';
import { getErrorMessage, showErrorToast, showSuccessToast } from '@/utils';
import { MarkTaxFiledModal } from '../modals';
import { MONTH_LABELS } from './gl-closing-tab.constants';

interface PeriodLocksSectionProps {
  refreshSignal?: number;
}

export function PeriodLocksSection({ refreshSignal = 0 }: PeriodLocksSectionProps) {
  const currentYear = dayjs().year();
  const [year, setYear] = useState<number>(currentYear);
  const [note, setNote] = useState('');
  const [pendingAction, setPendingAction] = useState<{
    month: number;
    action: 'lock' | 'unlock';
  } | null>(null);
  const [taxFilingTargetMonth, setTaxFilingTargetMonth] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: locks = [], isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['finance-period-locks', year, refreshSignal],
    queryFn: () => getPeriodLocks({ year }),
  });

  const lockMap = useMemo(() => {
    const map = new Map<number, PeriodLock>();
    for (const item of locks) {
      if (item.year === year) map.set(item.month, item);
    }
    return map;
  }, [locks, year]);

  const handleConfirm = async () => {
    if (!pendingAction) return;
    if (pendingAction.action === 'unlock' && note.trim().length < 5) {
      showErrorToast('Mở khóa kỳ kế toán bắt buộc nhập lý do tối thiểu 5 ký tự.');
      return;
    }
    setSubmitting(true);
    try {
      if (pendingAction.action === 'lock') {
        await lockPeriod({
          year,
          month: pendingAction.month,
          note: note.trim() || undefined,
        });
        showSuccessToast(`Đã khóa sổ kế toán tháng ${pendingAction.month}/${year}`);
      } else {
        await unlockPeriod({
          year,
          month: pendingAction.month,
          note: note.trim(),
        });
        showSuccessToast(`Đã mở khóa kỳ kế toán tháng ${pendingAction.month}/${year}`);
      }
      setPendingAction(null);
      setNote('');
      await refetch();
    } catch (err) {
      showErrorToast(err, 'Không thể cập nhật khóa kỳ kế toán');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkTaxFiled = async (payload: {
    taxFilingRef?: string;
    note?: string;
  }) => {
    if (!taxFilingTargetMonth) return;
    setSubmitting(true);
    try {
      await markPeriodTaxFiled({
        year,
        month: taxFilingTargetMonth,
        taxFilingRef: payload.taxFilingRef,
        note: payload.note,
      });
      showSuccessToast(
        `Đã khóa cứng kỳ ${taxFilingTargetMonth}/${year} theo trạng thái Đã nộp tờ khai thuế`,
      );
      setTaxFilingTargetMonth(null);
      await refetch();
    } catch (err) {
      showErrorToast(err, 'Không thể đánh dấu kỳ đã nộp tờ khai thuế');
    } finally {
      setSubmitting(false);
    }
  };

  const yearOptions = [currentYear - 1, currentYear, currentYear + 1].map((y) => ({
    value: String(y),
    label: `Năm ${y}`,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-40">
            <Select value={String(year)} onChange={(e) => setYear(Number(e.target.value))} options={yearOptions} fullWidth />
          </div>
          <div className="w-80">
            <Input
              placeholder="Lý do khóa / mở khóa kỳ (Bắt buộc ≥ 5 ký tự khi mở khóa)..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              fullWidth
            />
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          leftIcon={<RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />}
        >
          Làm mới
        </Button>
      </div>

      {isError && (
        <Alert variant="danger" title="Không thể tải trạng thái khóa sổ">
          {getErrorMessage(error)}
        </Alert>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {MONTH_LABELS.map((m) => {
            const lock = lockMap.get(m.month);
            const isLocked = Boolean(lock?.isLocked);
            const isTaxFiled = Boolean(lock?.isTaxFiled);

            return (
              <div key={m.month} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between gap-3 shadow-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      {m.name}/{year}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {isTaxFiled
                        ? `Khóa thuế: ${lock?.taxFiledByName || 'Kế toán trưởng'}`
                        : isLocked
                          ? `Khóa bởi: ${lock?.lockedByName || 'Kế toán'}`
                          : 'Cho phép ghi / sửa sổ'}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {isTaxFiled ? (
                      <Badge variant="danger" size="sm">
                        Đã nộp tờ khai (Khóa cứng)
                      </Badge>
                    ) : (
                      <Badge variant={isLocked ? 'warning' : 'success'} size="sm">
                        {isLocked ? 'Đã khóa sổ' : 'Đang mở'}
                      </Badge>
                    )}
                  </div>
                </div>

                {(lock?.taxFilingRef || lock?.note) && (
                  <div className="text-[11px] text-slate-600 bg-slate-50 rounded-lg px-2.5 py-1.5 space-y-0.5">
                    {lock.taxFilingRef && (
                      <div className="font-mono font-semibold text-rose-700">
                        Mã HS thuế: {lock.taxFilingRef}
                      </div>
                    )}
                    {lock.note && <div>{lock.note}</div>}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-slate-100">
                  {isTaxFiled ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700">
                      <ShieldAlert size={12} />
                      Khóa cứng vĩnh viễn
                    </span>
                  ) : (
                    <>
                      {isLocked ? (
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => setPendingAction({ month: m.month, action: 'unlock' })}
                          leftIcon={<LockOpen size={12} />}
                        >
                          Mở khóa
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="xs"
                          onClick={() => setPendingAction({ month: m.month, action: 'lock' })}
                          leftIcon={<Lock size={12} />}
                        >
                          Khóa kỳ
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => setTaxFilingTargetMonth(m.month)}
                        leftIcon={<FileCheck2 size={12} />}
                      >
                        Đã nộp tờ khai
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmActionModal
        isOpen={Boolean(pendingAction)}
        onClose={() => setPendingAction(null)}
        variant={pendingAction?.action === 'lock' ? 'primary' : 'danger'}
        confirmText={pendingAction?.action === 'lock' ? 'Xác nhận Khóa kỳ' : 'Xác nhận Mở khóa'}
        title={
          pendingAction?.action === 'lock'
            ? `Khóa kỳ kế toán Tháng ${pendingAction?.month}/${year}`
            : `Mở khóa kỳ kế toán Tháng ${pendingAction?.month}/${year}`
        }
        description={
          pendingAction?.action === 'lock'
            ? 'Sau khi khóa kỳ, mọi thao tác ghi sổ hoặc hủy ghi sổ trong tháng này sẽ bị chặn để bảo vệ số liệu báo cáo.'
            : `Mở khóa sẽ lưu Audit Log với lý do: "${note.trim() || '(Chưa nhập lý do ≥ 5 ký tự)'}".`
        }
        loading={submitting}
        onConfirm={handleConfirm}
      />

      <MarkTaxFiledModal
        isOpen={Boolean(taxFilingTargetMonth)}
        onClose={() => setTaxFilingTargetMonth(null)}
        year={year}
        month={taxFilingTargetMonth}
        loading={submitting}
        onConfirm={handleMarkTaxFiled}
      />
    </div>
  );
}
