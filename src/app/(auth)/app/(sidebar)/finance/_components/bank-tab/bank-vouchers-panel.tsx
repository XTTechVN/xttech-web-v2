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
import type {
  BankAccount,
  VoucherStatus,
  VoucherSummary,
  VoucherType,
} from '@/types';
import { printAccountingVoucher } from '../../_utils';
import {
  BANK_INVOICE_FILTER_OPTIONS,
  BANK_TAX_DEDUCTIBLE_OPTIONS,
  BANK_TYPE_FILTER_OPTIONS,
} from './bank-tab.constants';
import { UnpostVoucherModal } from '../modals';
import { BankVouchersTable } from './bank-vouchers-table';

export interface BankVouchersPanelProps {
  banks: BankAccount[];
  selectedBankId: number | null;
  onSelectBankId: (bankId: number | null) => void;
  onCreateVoucher: (voucherType: VoucherType, bankAccountId?: number) => void;
  onEditVoucher: (voucher: VoucherSummary) => void;
  onOpenVoucherDetail: (voucherId: number) => void;
  onVoidVoucher: (voucher: VoucherSummary) => void;
}

export function BankVouchersPanel({
  banks,
  selectedBankId,
  onSelectBankId,
  onCreateVoucher,
  onEditVoucher,
  onOpenVoucherDetail,
  onVoidVoucher,
}: BankVouchersPanelProps) {
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
      'bank-tab',
      search,
      typeFilter,
      statusFilter,
      invoiceFilter,
      deductibleFilter,
      selectedBankId,
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
        bankAccountId: selectedBankId || undefined,
        fromDate,
        toDate,
        limit: 100,
      };
      if (typeFilter === 'bank_receipt' || typeFilter === 'bank_payment') {
        const res = await getVouchers({ ...common, voucherType: typeFilter });
        return res.items;
      }
      const [rec, pay] = await Promise.all([
        getVouchers({ ...common, voucherType: 'bank_receipt' }),
        getVouchers({ ...common, voucherType: 'bank_payment' }),
      ]);
      return [...rec.items, ...pay.items].sort(
        (a, b) => b.voucherDate.localeCompare(a.voucherDate) || b.id - a.id,
      );
    },
  });

  const totals = useMemo(() => {
    let totalIn = 0;
    let totalOut = 0;
    for (const v of vouchers) {
      if (v.status === 'voided') continue;
      if (v.voucherType === 'bank_receipt') totalIn += v.totalAmount;
      if (v.voucherType === 'bank_payment') totalOut += v.totalAmount;
    }
    return { totalIn, totalOut };
  }, [vouchers]);

  const filters: ITableFilterProps[] = [
    {
      label: 'Loại giao dịch',
      value: typeFilter,
      options: BANK_TYPE_FILTER_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
      onChange: setTypeFilter,
    },
    {
      label: 'TK Ngân hàng',
      value: selectedBankId ? String(selectedBankId) : undefined,
      options: banks.map((b) => ({
        value: String(b.id),
        label: `${b.bankCode} - ${b.accountNumber}`,
      })),
      onChange: (val) => onSelectBankId(val ? Number(val) : null),
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
      options: BANK_INVOICE_FILTER_OPTIONS,
      onChange: setInvoiceFilter,
    },
    {
      label: 'Thuế (B4)',
      value: deductibleFilter,
      options: BANK_TAX_DEDUCTIBLE_OPTIONS,
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
      showErrorToast(err, 'Không thể tải chứng từ để in');
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirmPost = async () => {
    if (!postTarget) return;
    setBusyId(postTarget.id);
    try {
      await postVoucher(postTarget.id);
      showSuccessToast(`Đã ghi sổ chứng từ ${postTarget.voucherNo}`);
      await queryClient.invalidateQueries({ queryKey: ['finance'] });
      setPostTarget(null);
    } catch (err) {
      showErrorToast(err, 'Không thể ghi sổ chứng từ');
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirmUnpost = async (reason: string) => {
    if (!unpostTarget) return;
    setBusyId(unpostTarget.id);
    try {
      await unpostVoucher(unpostTarget.id, { reason });
      showSuccessToast(`Đã bỏ ghi sổ chứng từ ${unpostTarget.voucherNo}`);
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
            placeholder="Tìm số chứng từ, đối tác, nội dung chuyển khoản..."
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
            onClick={() => onCreateVoucher('bank_receipt', selectedBankId || undefined)}
          >
            Lập Báo Có
          </Button>
          <Button
            type="button"
            size="xs"
            variant="primary"
            leftIcon={<ArrowUpRight size={14} />}
            onClick={() => onCreateVoucher('bank_payment', selectedBankId || undefined)}
          >
            Lập Ủy nhiệm chi
          </Button>
        </div>
      </div>

      <BankVouchersTable
        vouchers={vouchers}
        isLoading={isLoading}
        busyId={busyId}
        totalIn={totals.totalIn}
        totalOut={totals.totalOut}
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
        title="Ghi sổ cái chứng từ Ngân hàng"
        description={
          postTarget
            ? `Xác nhận ghi sổ cái cho chứng từ ${postTarget.voucherNo} (${formatCurrency(postTarget.totalAmount)})?`
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
