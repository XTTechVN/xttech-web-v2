'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, RefreshCw, Scale } from 'lucide-react';
import {
  Alert,
  Button,
  ConfirmActionModal,
  Skeleton,
  TableFilters,
  TableSearch,
  type ITableFilterProps,
} from '@/components';
import {
  deleteVoucher,
  getProjectPnlReport,
  getVoucher,
  getVouchers,
  postVoucher,
  unpostVoucher,
} from '@/actions';
import { VOUCHER_STATUS_OPTIONS } from '@/config/finance';
import type {
  AccountingRegime,
  VoucherStatus,
  VoucherSummary,
  VoucherType,
} from '@/types';
import { formatCurrency, getErrorMessage, showErrorToast, showSuccessToast } from '@/utils';
import { printAccountingVoucher } from '../../_utils';
import {
  GL_TAX_DEDUCTIBLE_FILTER_OPTIONS,
  GL_VOUCHER_TYPE_FILTER_OPTIONS,
} from './gl-closing-tab.constants';
import { UnpostVoucherModal } from '../modals';
import { JournalVouchersTable } from './journal-vouchers-table';

interface JournalVouchersSectionProps {
  accountingRegime?: AccountingRegime;
  refreshSignal?: number;
  onCreateJournalVoucher: () => void;
  onOpenOpeningBalance: () => void;
  onOpenVoucherDetail: (voucherId: number) => void;
  onVoucherChanged?: () => void;
}

export function JournalVouchersSection({
  accountingRegime = 'tt200',
  refreshSignal = 0,
  onCreateJournalVoucher,
  onOpenOpeningBalance,
  onOpenVoucherDetail,
  onVoucherChanged,
}: JournalVouchersSectionProps) {
  const [search, setSearch] = useState('');
  const [voucherTypeFilter, setVoucherTypeFilter] = useState<string | undefined>('general_journal');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [deductibleFilter, setDeductibleFilter] = useState<string | undefined>();
  const [fromDate, setFromDate] = useState<string | undefined>();
  const [toDate, setToDate] = useState<string | undefined>();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [deletingVoucher, setDeletingVoucher] = useState<VoucherSummary | null>(null);
  const [unpostingVoucher, setUnpostingVoucher] = useState<VoucherSummary | null>(null);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: [
      'finance-gl-vouchers',
      search,
      voucherTypeFilter,
      statusFilter,
      deductibleFilter,
      fromDate,
      toDate,
      refreshSignal,
    ],
    queryFn: async () => {
      const [vRes, pnlRes] = await Promise.all([
        getVouchers({
          search: search || undefined,
          voucherType: voucherTypeFilter as VoucherType | undefined,
          status: statusFilter as VoucherStatus | undefined,
          isTaxDeductible:
            deductibleFilter === undefined ? undefined : deductibleFilter === 'true',
          fromDate,
          toDate,
          limit: 100,
        }),
        getProjectPnlReport({ reportViewMode: 'all' }).catch(() => null),
      ]);
      return { vouchers: vRes.items || [], projectPnl: pnlRes };
    },
  });

  const vouchers = data?.vouchers || [];
  const projectPnl = data?.projectPnl || null;

  const handlePost = async (id: number) => {
    setBusyId(id);
    try {
      await postVoucher(id);
      showSuccessToast('Đã ghi sổ cái chứng từ thành công');
      await refetch();
      onVoucherChanged?.();
    } catch (err) {
      showErrorToast(err, 'Không thể ghi sổ cái');
    } finally {
      setBusyId(null);
    }
  };

  const handleRequestUnpost = (id: number) => {
    const found = vouchers.find((v) => v.id === id) || null;
    setUnpostingVoucher(found);
  };

  const handleConfirmUnpost = async (reason: string) => {
    if (!unpostingVoucher) return;
    setBusyId(unpostingVoucher.id);
    try {
      await unpostVoucher(unpostingVoucher.id, { reason });
      showSuccessToast(`Đã bỏ ghi sổ chứng từ ${unpostingVoucher.voucherNo}`);
      setUnpostingVoucher(null);
      await refetch();
      onVoucherChanged?.();
    } catch (err) {
      showErrorToast(err, 'Không thể bỏ ghi sổ chứng từ');
    } finally {
      setBusyId(null);
    }
  };

  const handlePrint = async (id: number) => {
    try {
      const detail = await getVoucher(id);
      await printAccountingVoucher(detail, { accountingRegime });
    } catch (err) {
      showErrorToast(err, 'Không thể tải dữ liệu in chứng từ');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingVoucher) return;
    setBusyId(deletingVoucher.id);
    try {
      await deleteVoucher(deletingVoucher.id);
      showSuccessToast(`Đã xóa chứng từ nháp ${deletingVoucher.voucherNo}`);
      setDeletingVoucher(null);
      await refetch();
      onVoucherChanged?.();
    } catch (err) {
      showErrorToast(err, 'Không thể xóa chứng từ');
    } finally {
      setBusyId(null);
    }
  };

  const filters: ITableFilterProps[] = useMemo(
    () => [
      { label: 'Loại CT', value: voucherTypeFilter, options: GL_VOUCHER_TYPE_FILTER_OPTIONS, onChange: setVoucherTypeFilter },
      { label: 'Trạng thái', value: statusFilter, options: VOUCHER_STATUS_OPTIONS, onChange: setStatusFilter },
      { label: 'Hợp lệ thuế', value: deductibleFilter, options: GL_TAX_DEDUCTIBLE_FILTER_OPTIONS, onChange: setDeductibleFilter },
      { type: 'date-range', label: 'Ngày CT', startDate: fromDate, endDate: toDate, onDateRangeChange: (s, e) => { setFromDate(s); setToDate(e); } },
    ],
    [voucherTypeFilter, statusFilter, deductibleFilter, fromDate, toDate],
  );

  return (
    <div className="space-y-4">
      {projectPnl && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-slate-200 p-3.5">
            <div className="text-xs text-slate-500">Tổng Doanh thu Công trình</div>
            <div className="text-lg font-mono font-bold text-primary tabular-nums mt-1">{formatCurrency(projectPnl.totalRevenue)}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-3.5">
            <div className="text-xs text-slate-500">Tổng Giá thành / Chi phí Tập hợp</div>
            <div className="text-lg font-mono font-bold text-slate-900 tabular-nums mt-1">{formatCurrency(projectPnl.totalCost)}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-3.5">
            <div className="text-xs text-slate-500">Lợi nhuận Gộp Công trình (Sổ Tài chính)</div>
            <div className="text-lg font-mono font-bold text-emerald-700 tabular-nums mt-1">{formatCurrency(projectPnl.totalGrossProfit)}</div>
          </div>
        </div>
      )}

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <TableSearch placeholder="Tìm số chứng từ PKT, diễn giải, công trình..." value={search} onChange={setSearch} className="w-72" />
          <TableFilters filters={filters} />
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={onOpenOpeningBalance} leftIcon={<Scale size={14} />}>
            Số dư đầu kỳ
          </Button>
          <Button variant="primary" size="sm" onClick={onCreateJournalVoucher} leftIcon={<Plus size={14} />}>
            Lập chứng từ PKT
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            leftIcon={<RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />}
          >
            Làm mới
          </Button>
        </div>
      </div>

      {isError && (
        <Alert variant="danger" title="Không thể tải chứng từ tổng hợp">
          {getErrorMessage(error)}
        </Alert>
      )}

      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : vouchers.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-xs text-slate-500">
          Không có chứng từ nghiệp vụ khác / tổng hợp nào phù hợp điều kiện lọc.
        </div>
      ) : (
        <JournalVouchersTable
          vouchers={vouchers}
          busyId={busyId}
          onOpenVoucherDetail={onOpenVoucherDetail}
          onPrint={handlePrint}
          onPost={handlePost}
          onUnpost={handleRequestUnpost}
          onDelete={setDeletingVoucher}
        />
      )}

      <ConfirmActionModal
        isOpen={Boolean(deletingVoucher)}
        onClose={() => setDeletingVoucher(null)}
        title="Xóa chứng từ tổng hợp nháp"
        description={`Bạn có chắc muốn xóa chứng từ ${deletingVoucher?.voucherNo || ''}?`}
        loading={Boolean(busyId)}
        onConfirm={handleConfirmDelete}
      />

      <UnpostVoucherModal
        isOpen={Boolean(unpostingVoucher)}
        onClose={() => setUnpostingVoucher(null)}
        voucher={unpostingVoucher}
        loading={Boolean(busyId)}
        onConfirm={handleConfirmUnpost}
      />
    </div>
  );
}
