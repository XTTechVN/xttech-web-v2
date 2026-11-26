'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { AlertTriangle, ArrowRight, FileCode2, FileSpreadsheet, Plus, RefreshCw } from 'lucide-react';
import {
  Alert,
  Button,
  ConfirmActionModal,
  Skeleton,
  TableFilters,
  TableSearch,
  type ITableFilterProps,
} from '@/components';
import { deleteTaxInvoice, getTaxInvoices, getTaxInvoiceWarnings } from '@/actions';
import type {
  Account,
  FinanceTabKey,
  TaxInvoice,
  TaxInvoiceDirection,
  VatRate,
} from '@/types';
import { getErrorMessage, showErrorToast, showSuccessToast } from '@/utils';
import { ImportExcelModal } from './modals/import-excel-modal';
import { TaxInvoiceDrawer } from './tax-invoice-drawer';
import { TaxInvoicesTable } from './tax-invoices-table';
import {
  INVOICE_STATUS_OPTIONS,
  TAX_DEDUCTIBLE_OPTIONS,
  TAX_DIRECTION_OPTIONS,
  VAT_RATE_FILTER_OPTIONS,
} from './tax-tab.constants';

interface TaxInvoicesSectionProps {
  accounts: Account[];
  canViewStatutoryTax?: boolean;
  refreshSignal?: number;
  onOpenVoucherDetail: (voucherId: number) => void;
  onNavigateTab?: (tab: FinanceTabKey) => void;
}

export function TaxInvoicesSection({
  accounts,
  canViewStatutoryTax = false,
  refreshSignal = 0,
  onOpenVoucherDetail,
  onNavigateTab,
}: TaxInvoicesSectionProps) {
  const now = dayjs();
  const currentQuarter = Math.ceil((now.month() + 1) / 3);
  const [search, setSearch] = useState('');
  const [direction, setDirection] = useState<string | undefined>();
  const [vatRate, setVatRate] = useState<string | undefined>();
  const [deductibleFilter, setDeductibleFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [fromDate, setFromDate] = useState<string | undefined>();
  const [toDate, setToDate] = useState<string | undefined>();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importExcelOpen, setImportExcelOpen] = useState(false);
  const [initialXmlMode, setInitialXmlMode] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<TaxInvoice | null>(null);
  const [deletingInvoice, setDeletingInvoice] = useState<TaxInvoice | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: [
      'finance-tax-invoices',
      search,
      direction,
      vatRate,
      deductibleFilter,
      statusFilter,
      fromDate,
      toDate,
      refreshSignal,
    ],
    queryFn: () =>
      getTaxInvoices({
        search: search || undefined,
        direction: direction as TaxInvoiceDirection | undefined,
        vatRate: vatRate as VatRate | undefined,
        isTaxDeductible: deductibleFilter === undefined ? undefined : deductibleFilter === 'true',
        status: statusFilter,
        fromDate,
        toDate,
        limit: 100,
      }),
  });

  const { data: invoiceWarnings } = useQuery({
    queryKey: ['finance', 'statutory', 'tax-invoice-warnings', now.year(), currentQuarter, refreshSignal],
    queryFn: () => getTaxInvoiceWarnings({ year: now.year(), quarter: currentQuarter }),
    enabled: canViewStatutoryTax,
    staleTime: 60_000,
  });

  const invoices = data?.items || [];

  const handleConfirmDelete = async () => {
    if (!deletingInvoice) return;
    setDeleting(true);
    try {
      await deleteTaxInvoice(deletingInvoice.id);
      showSuccessToast(`Đã xóa hóa đơn ${deletingInvoice.invoiceSeries}-${deletingInvoice.invoiceNumber}`);
      setDeletingInvoice(null);
      await refetch();
    } catch (err) {
      showErrorToast(err, 'Không thể xóa hóa đơn thuế');
    } finally {
      setDeleting(false);
    }
  };

  const filters: ITableFilterProps[] = useMemo(
    () => [
      { label: 'Loại HĐ', value: direction, options: TAX_DIRECTION_OPTIONS, onChange: setDirection },
      { label: 'Thuế suất', value: vatRate, options: VAT_RATE_FILTER_OPTIONS, onChange: setVatRate },
      { label: 'Khấu trừ', value: deductibleFilter, options: TAX_DEDUCTIBLE_OPTIONS, onChange: setDeductibleFilter },
      { label: 'Trạng thái', value: statusFilter, options: INVOICE_STATUS_OPTIONS, onChange: setStatusFilter },
      { type: 'date-range', label: 'Ngày HĐ', startDate: fromDate, endDate: toDate, onDateRangeChange: (s, e) => { setFromDate(s); setToDate(e); } },
    ],
    [direction, vatRate, deductibleFilter, statusFilter, fromDate, toDate],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <TableSearch placeholder="Tìm số hóa đơn, MST, tên đối tác..." value={search} onChange={setSearch} className="w-64" />
          <TableFilters filters={filters} />
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setImportExcelOpen(true)}
            leftIcon={<FileSpreadsheet size={14} />}
          >
            Nhập Excel GDT
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setEditingInvoice(null); setInitialXmlMode(true); setDrawerOpen(true); }}
            leftIcon={<FileCode2 size={14} />}
          >
            Tải XML HĐĐT
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => { setEditingInvoice(null); setInitialXmlMode(false); setDrawerOpen(true); }}
            leftIcon={<Plus size={14} />}
          >
            Thêm hóa đơn
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

      {canViewStatutoryTax && invoiceWarnings && invoiceWarnings.totalAffected > 0 && (
        <Alert
          variant="warning"
          title={`Có ${invoiceWarnings.totalAffected} hóa đơn ảnh hưởng tờ khai 01/GTGT Quý ${currentQuarter}/${now.year()}`}
          icon={<AlertTriangle size={15} />}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>
              {invoiceWarnings.message ||
                `Thiếu chỉ tiêu tờ khai: ${invoiceWarnings.missingIndicatorCount} • Chưa liên kết chứng từ: ${invoiceWarnings.unlinkedCount}`}
            </span>
            {onNavigateTab && (
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => onNavigateTab('statutory_tax')}
                rightIcon={<ArrowRight size={12} />}
              >
                Kiểm tra tại BCTC &amp; Thuế
              </Button>
            )}
          </div>
        </Alert>
      )}

      {isError && (
        <Alert variant="danger" title="Không thể tải danh sách hóa đơn GTGT">
          {getErrorMessage(error)}
        </Alert>
      )}

      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-xs text-slate-500">
          Chưa có hóa đơn thuế GTGT nào. Bấm &quot;Tải XML HĐĐT&quot; để bóc tách tự động từ file XML Tổng cục Thuế.
        </div>
      ) : (
        <TaxInvoicesTable
          invoices={invoices}
          onEdit={(inv) => { setEditingInvoice(inv); setInitialXmlMode(false); setDrawerOpen(true); }}
          onDelete={setDeletingInvoice}
          onOpenVoucherDetail={onOpenVoucherDetail}
        />
      )}

      <TaxInvoiceDrawer
        isOpen={drawerOpen}
        invoice={editingInvoice}
        accounts={accounts}
        initialShowXml={initialXmlMode}
        onClose={() => { setDrawerOpen(false); setEditingInvoice(null); }}
        onSaved={async () => { await refetch(); }}
      />

      <ConfirmActionModal
        isOpen={Boolean(deletingInvoice)}
        onClose={() => setDeletingInvoice(null)}
        title="Xóa hóa đơn thuế GTGT"
        description={`Xác nhận xóa hóa đơn ${deletingInvoice?.invoiceSeries}-${deletingInvoice?.invoiceNumber}?`}
        loading={deleting}
        onConfirm={handleConfirmDelete}
      />

      <ImportExcelModal
        isOpen={importExcelOpen}
        onClose={() => setImportExcelOpen(false)}
        onImported={async () => { await refetch(); }}
        onOpenVoucherDetail={onOpenVoucherDetail}
      />
    </div>
  );
}
