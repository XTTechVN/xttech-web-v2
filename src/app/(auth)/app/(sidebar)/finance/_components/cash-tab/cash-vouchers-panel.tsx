'use client';

import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import {
  Button,
  ConfirmActionModal,
  TableFilters,
  TableSearch,
  type ITableFilterProps,
} from '@/components';
import {
  getFinanceSetting,
  getVoucher,
  getVouchers,
  postVoucher,
  unpostVoucher,
} from '@/actions/finance';
import { VOUCHER_STATUS_OPTIONS } from '@/config/finance';
import { formatCurrency } from '@/utils/currency';
import { showErrorToast, showSuccessToast } from '@/utils/error';
import type { VoucherStatus, VoucherSummary, VoucherType } from '@/types';
import { printAccountingVoucher } from '../../_utils';
import {
  CASH_INVOICE_FILTER_OPTIONS,
  CASH_TAX_DEDUCTIBLE_OPTIONS,
  CASH_TYPE_FILTER_OPTIONS,
} from './cash-tab.constants';
import { UnpostVoucherModal } from '../modals';
import { CashVouchersTable } from './cash-vouchers-table';

export interface CashVouchersPanelProps {
  onCreateVoucher: (voucherType: VoucherType) => void;
  onEditVoucher: (voucher: VoucherSummary) => void;
  onOpenVoucherDetail: (voucherId: number) => void;
  onVoidVoucher: (voucher: VoucherSummary) => void;
}

export function CashVouchersPanel({
  onCreateVoucher,
  onEditVoucher,
  onOpenVoucherDetail,
  onVoidVoucher,
}: CashVouchersPanelProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [invoiceFilter, setInvoiceFilter] = useState<string | undefined>(undefined);
  const [deductibleFilter, setDeductibleFilter] = useState<string | undefined>(undefined);
  const [fromDate, setFromDate] = useState<string | undefined>(undefined);
  const [toDate, setToDate] = useState<string | undefined>(undefined);
  const [postTarget, setPostTarget] = useState<VoucherSummary | null>(null);
  const [unpostTarget, setUnpostTarget] = useState<VoucherSummary | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const { data: setting } = useQuery({
    queryKey: ['finance', 'settings'],
    queryFn: getFinanceSetting,
    staleTime: 60_000,
  });

  const { data: vouchers = [], isLoading } = useQuery({
    queryKey: [
      'finance',
      'vouchers',
      'cash-tab',
      search,
      typeFilter,
      statusFilter,
      invoiceFilter,
      deductibleFilter,
      fromDate,
      toDate,
    ],
    queryFn: async () => {
      const common = {
        search: search || undefined,
        status: statusFilter as VoucherStatus | undefined,
        hasValidInvoice:
          invoiceFilter === 'true' ? true : invoiceFilter === 'false' ? false : undefined,
        isTaxDeductible:
          deductibleFilter === 'true' ? true : deductibleFilter === 'false' ? false : undefined,
        fromDate,
        toDate,
        limit: 100,
      };
      if (typeFilter === 'cash_receipt' || typeFilter === 'cash_payment') {
        const res = await getVouchers({ ...common, voucherType: typeFilter });
        return res.items;
      }
      const [receiptsRes, paymentsRes] = await Promise.all([
        getVouchers({ ...common, voucherType: 'cash_receipt' }),
        getVouchers({ ...common, voucherType: 'cash_payment' }),
      ]);
      return [...receiptsRes.items, ...paymentsRes.items].sort(
        (a, b) => b.voucherDate.localeCompare(a.voucherDate) || b.id - a.id,
      );
    },
  });

  const totals = useMemo(() => {
    let totalIn = 0;
    let totalOut = 0;
    for (const v of vouchers) {
      if (v.status === 'voided') continue;
      if (v.voucherType === 'cash_receipt') totalIn += v.totalAmount;
      if (v.voucherType === 'cash_payment') totalOut += v.totalAmount;
    }
    return { totalIn, totalOut, net: totalIn - totalOut };
  }, [vouchers]);

  const filters: ITableFilterProps[] = [
    {
      label: 'Loại phiếu',
      value: typeFilter,
      options: CASH_TYPE_FILTER_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
      onChange: setTypeFilter,
    },
    {
      label: 'Trạng thái',
      value: statusFilter,
      options: VOUCHER_STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
      onChange: setStatusFilter,
    },
    {
      label: 'Hóa đơn GTGT',
      value: invoiceFilter,
      options: CASH_INVOICE_FILTER_OPTIONS,
      onChange: setInvoiceFilter,
    },
    {
      label: 'Thuế (B4)',
      value: deductibleFilter,
      options: CASH_TAX_DEDUCTIBLE_OPTIONS,
      onChange: setDeductibleFilter,
    },
    {
      type: 'date-range',
      label: 'Ngày CT',
      startDate: fromDate,
      endDate: toDate,
      onDateRangeChange: (s, e) => {
        setFromDate(s);
        setToDate(e);
      },
    },
  ];

  const handlePrint = async (row: VoucherSummary) => {
    setBusyId(row.id);
    try {
      const detail = await getVoucher(row.id);
      await printAccountingVoucher(detail, { accountingRegime: setting?.accountingRegime });
    } catch (err) {
      showErrorToast(err, 'Không thể tải phiếu để in');
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirmPost = async () => {
    if (!postTarget) return;
    setBusyId(postTarget.id);
    try {
      await postVoucher(postTarget.id);
      showSuccessToast(`Đã ghi sổ cái ${postTarget.voucherNo}`);
      await queryClient.invalidateQueries({ queryKey: ['finance'] });
      setPostTarget(null);
    } catch (err) {
      showErrorToast(err, 'Không thể ghi sổ cái chứng từ');
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirmUnpost = async (reason: string) => {
    if (!unpostTarget) return;
    setBusyId(unpostTarget.id);
    try {
      await unpostVoucher(unpostTarget.id, { reason });
      showSuccessToast(`Đã bỏ ghi sổ ${unpostTarget.voucherNo}`);
      await queryClient.invalidateQueries({ queryKey: ['finance'] });
      setUnpostTarget(null);
    } catch (err) {
      showErrorToast(err, 'Không thể bỏ ghi sổ chứng từ');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <TableSearch
            placeholder="Tìm số phiếu, người nộp/nhận, diễn giải..."
            value={search}
            onChange={setSearch}
            className="w-64"
          />
          <TableFilters filters={filters} />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            size="xs"
            variant="outline"
            leftIcon={<ArrowDownLeft size={14} />}
            onClick={() => onCreateVoucher('cash_receipt')}
          >
            Lập Phiếu Thu
          </Button>
          <Button
            type="button"
            size="xs"
            variant="primary"
            leftIcon={<ArrowUpRight size={14} />}
            onClick={() => onCreateVoucher('cash_payment')}
          >
            Lập Phiếu Chi
          </Button>
        </div>
      </div>

      <CashVouchersTable
        vouchers={vouchers}
        isLoading={isLoading}
        busyId={busyId}
        totalIn={totals.totalIn}
        totalOut={totals.totalOut}
        net={totals.net}
        onOpenVoucherDetail={onOpenVoucherDetail}
        onPrint={handlePrint}
        onEditVoucher={onEditVoucher}
        onPostVoucher={setPostTarget}
        onUnpostVoucher={setUnpostTarget}
        onVoidVoucher={onVoidVoucher}
      />

      <ConfirmActionModal
        isOpen={Boolean(postTarget)}
        onClose={() => setPostTarget(null)}
        title="Xác nhận Ghi sổ cái chứng từ"
        description={
          postTarget
            ? `Ghi sổ cái chứng từ ${postTarget.voucherNo} (${formatCurrency(postTarget.totalAmount)})? Sau khi ghi sổ, số liệu sẽ cập nhật vào Sổ Quỹ S07-DN & Báo cáo.`
            : ''
        }
        confirmText="Ghi sổ cái"
        variant="primary"
        loading={busyId !== null}
        onConfirm={handleConfirmPost}
      />

      <UnpostVoucherModal
        isOpen={Boolean(unpostTarget)}
        onClose={() => setUnpostTarget(null)}
        voucher={unpostTarget}
        loading={busyId !== null}
        onConfirm={handleConfirmUnpost}
      />
    </div>
  );
}
