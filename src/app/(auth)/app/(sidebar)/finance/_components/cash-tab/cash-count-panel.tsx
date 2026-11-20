'use client';

import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ClipboardCheck, Plus, RefreshCw } from 'lucide-react';
import {
  Alert,
  Button,
  Skeleton,
  TableFilters,
  TableSearch,
  type ITableFilterProps,
} from '@/components';
import {
  confirmCashCount,
  createCashCountAdjustment,
  getCashCounts,
  getMyFinancePermissions,
  voidCashCount,
} from '@/actions';
import { CASH_COUNT_STATUS_OPTIONS } from '@/config/finance';
import type { CashCountMinute, CashCountStatus } from '@/types';
import { getErrorMessage, showErrorToast, showSuccessToast } from '@/utils';
import { CashCountFormModal, VoidCashCountModal } from '../modals';
import { CashCountTable } from './cash-count-table';

export interface CashCountPanelProps {
  currentBookBalance?: number;
  onOpenVoucherDetail: (voucherId: number) => void;
}

export function CashCountPanel({
  currentBookBalance = 0,
  onOpenVoucherDetail,
}: CashCountPanelProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [fromDate, setFromDate] = useState<string | undefined>();
  const [toDate, setToDate] = useState<string | undefined>();
  const [createOpen, setCreateOpen] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [voidTarget, setVoidTarget] = useState<CashCountMinute | null>(null);

  const { data: myPermissions } = useQuery({
    queryKey: ['finance', 'permissions', 'me'],
    queryFn: getMyFinancePermissions,
    staleTime: 60_000,
  });

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['finance', 'cash-counts', search, statusFilter, fromDate, toDate],
    queryFn: () =>
      getCashCounts({
        search: search || undefined,
        status: statusFilter as CashCountStatus | undefined,
        fromDate,
        toDate,
        limit: 50,
      }),
  });

  const rows = useMemo(() => data?.items || [], [data?.items]);

  const filters: ITableFilterProps[] = useMemo(
    () => [
      {
        label: 'Trạng thái',
        value: statusFilter,
        options: CASH_COUNT_STATUS_OPTIONS,
        onChange: setStatusFilter,
      },
      {
        type: 'date-range',
        label: 'Ngày kiểm kê',
        startDate: fromDate,
        endDate: toDate,
        onDateRangeChange: (s, e) => {
          setFromDate(s);
          setToDate(e);
        },
      },
    ],
    [statusFilter, fromDate, toDate],
  );

  const handleConfirm = async (minute: CashCountMinute) => {
    setBusyId(minute.id);
    try {
      await confirmCashCount(minute.id);
      await queryClient.invalidateQueries({ queryKey: ['finance'] });
      showSuccessToast(`Đã xác nhận biên bản kiểm kê ${minute.minuteNo}`);
    } catch (err) {
      showErrorToast(err, 'Không thể xác nhận biên bản kiểm kê quỹ');
    } finally {
      setBusyId(null);
    }
  };

  const handleCreateAdjustment = async (minute: CashCountMinute) => {
    setBusyId(minute.id);
    try {
      const voucher = await createCashCountAdjustment(minute.id);
      await queryClient.invalidateQueries({ queryKey: ['finance'] });
      showSuccessToast(`Đã tạo phiếu nháp xử lý chênh lệch ${voucher.voucherNo}`);
    } catch (err) {
      showErrorToast(err, 'Không thể tạo phiếu điều chỉnh chênh lệch quỹ');
    } finally {
      setBusyId(null);
    }
  };

  const handleVoid = async (reason: string) => {
    if (!voidTarget) return;
    setBusyId(voidTarget.id);
    try {
      await voidCashCount(voidTarget.id, { reason });
      await queryClient.invalidateQueries({ queryKey: ['finance'] });
      showSuccessToast(`Đã hủy biên bản ${voidTarget.minuteNo}`);
      setVoidTarget(null);
    } catch (err) {
      showErrorToast(err, 'Không thể hủy biên bản kiểm kê');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <TableSearch
            placeholder="Tìm số biên bản, nguyên nhân chênh lệch..."
            value={search}
            onChange={setSearch}
            className="w-64"
          />
          <TableFilters filters={filters} />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => refetch()}
            leftIcon={<RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />}
          >
            Làm mới
          </Button>
          <Button
            type="button"
            variant="primary"
            size="xs"
            leftIcon={<Plus size={14} />}
            onClick={() => setCreateOpen(true)}
          >
            Lập biên bản kiểm kê
          </Button>
        </div>
      </div>

      {isError && (
        <Alert variant="danger" title="Không thể tải danh sách kiểm kê quỹ">
          {getErrorMessage(error)}
        </Alert>
      )}

      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-2">
          <ClipboardCheck size={28} className="mx-auto text-slate-300" />
          <div className="text-sm font-semibold text-slate-700">Chưa có biên bản kiểm kê quỹ</div>
          <p className="text-slate-400">
            Lập biên bản kiểm kê theo mệnh giá tiền để đối chiếu tồn quỹ thực tế và Sổ Quỹ S07-DN.
          </p>
        </div>
      ) : (
        <CashCountTable
          rows={rows}
          busyId={busyId}
          canCashierConfirm={Boolean(myPermissions?.canCashierConfirm)}
          onConfirm={handleConfirm}
          onCreateAdjustment={handleCreateAdjustment}
          onVoid={setVoidTarget}
          onOpenVoucherDetail={onOpenVoucherDetail}
        />
      )}

      <CashCountFormModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        bookBalanceHint={currentBookBalance}
      />

      <VoidCashCountModal
        isOpen={Boolean(voidTarget)}
        onClose={() => setVoidTarget(null)}
        minute={voidTarget}
        loading={busyId !== null}
        onConfirm={handleVoid}
      />
    </div>
  );
}
