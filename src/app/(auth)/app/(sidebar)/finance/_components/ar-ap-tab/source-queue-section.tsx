'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, Sparkles } from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  Skeleton,
  TableFilters,
  TableSearch,
  type ITableFilterProps,
} from '@/components';
import {
  getFinanceSetting,
  getMyFinancePermissions,
  getSourceQueue,
  importSourceQueueItem,
} from '@/actions';
import { SOURCE_TYPE_OPTIONS } from '@/config/finance';
import type {
  Account,
  AutoPostingTemplate,
  BankAccount,
  CostItem,
  SourceQueueImportPayload,
  SourceQueueItem,
  SourceQueueType,
} from '@/types';
import { formatCurrency, getErrorMessage, showErrorToast, showSuccessToast } from '@/utils';
import { AR_AP_QUEUE_STATUS_OPTIONS } from './ar-ap-tab.constants';
import { SourceQueueImportDrawer } from './source-queue-import-drawer';
import { SourceQueueTable } from './source-queue-table';

interface SourceQueueSectionProps {
  accounts: Account[];
  bankAccounts: BankAccount[];
  costItems: CostItem[];
  templates: AutoPostingTemplate[];
  refreshSignal?: number;
  onOpenVoucherDetail: (voucherId: number) => void;
  onVoucherImported?: () => void;
}

export function SourceQueueSection({
  accounts,
  bankAccounts,
  costItems,
  templates,
  refreshSignal = 0,
  onOpenVoucherDetail,
  onVoucherImported,
}: SourceQueueSectionProps) {
  const [search, setSearch] = useState('');
  const [sourceTypeFilter, setSourceTypeFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [fromDate, setFromDate] = useState<string | undefined>();
  const [toDate, setToDate] = useState<string | undefined>();
  const [importingKey, setImportingKey] = useState<string | null>(null);
  const [configuringItem, setConfiguringItem] = useState<SourceQueueItem | null>(null);

  const { data: setting } = useQuery({
    queryKey: ['finance', 'settings'],
    queryFn: getFinanceSetting,
    staleTime: 60_000,
  });

  const { data: myPermissions } = useQuery({
    queryKey: ['finance', 'permissions', 'me'],
    queryFn: getMyFinancePermissions,
    staleTime: 60_000,
  });

  const canAutoPost =
    !(setting?.enforceMakerChecker ?? true) && Boolean(myPermissions?.canPostVoucher);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: [
      'finance-source-queue',
      search,
      sourceTypeFilter,
      statusFilter,
      fromDate,
      toDate,
      refreshSignal,
    ],
    queryFn: () =>
      getSourceQueue({
        search: search || undefined,
        sourceType: sourceTypeFilter as SourceQueueType | undefined,
        includeImported: statusFilter === 'all',
        fromDate,
        toDate,
        limit: 100,
      }),
  });

  const items = useMemo(() => data?.items || [], [data?.items]);
  const total = data?.meta?.total ?? items.length;

  const handleQuickImport = async (item: SourceQueueItem) => {
    const key = `${item.sourceType}-${item.sourceId}`;
    setImportingKey(key);
    try {
      const voucher = await importSourceQueueItem({
        sourceType: item.sourceType,
        sourceId: item.sourceId,
        voucherType: item.suggestedVoucherType,
        hasValidInvoice: item.suggestedHasValidInvoice,
        ...(item.suggestedTemplateId != null ? { autoPostingTemplateId: item.suggestedTemplateId } : {}),
        ...(item.suggestedBankAccountId != null ? { bankAccountId: item.suggestedBankAccountId } : {}),
        ...(item.suggestedDebitAccountId != null ? { debitAccountId: item.suggestedDebitAccountId } : {}),
        ...(item.suggestedCreditAccountId != null ? { creditAccountId: item.suggestedCreditAccountId } : {}),
        ...(item.suggestedCostItemId != null ? { costItemId: item.suggestedCostItemId } : {}),
      });
      showSuccessToast(`Đã tạo chứng từ nháp ${voucher.voucherNo} từ ${item.sourceCode}`);
      await refetch();
      onVoucherImported?.();
    } catch (err) {
      showErrorToast(err, 'Lỗi khi import chứng từ từ nguồn nghiệp vụ');
    } finally {
      setImportingKey(null);
    }
  };

  const handleDrawerImport = async (payload: SourceQueueImportPayload) => {
    const key = `${payload.sourceType}-${payload.sourceId}`;
    setImportingKey(key);
    try {
      const voucher = await importSourceQueueItem(payload);
      showSuccessToast(`Đã tạo chứng từ ${voucher.voucherNo} thành công`);
      setConfiguringItem(null);
      await refetch();
      onVoucherImported?.();
    } catch (err) {
      showErrorToast(err, 'Lỗi khi import chứng từ');
    } finally {
      setImportingKey(null);
    }
  };

  const filters: ITableFilterProps[] = useMemo(
    () => [
      { label: 'Nguồn chứng từ', value: sourceTypeFilter, options: SOURCE_TYPE_OPTIONS, onChange: setSourceTypeFilter },
      { label: 'Trạng thái', value: statusFilter, options: AR_AP_QUEUE_STATUS_OPTIONS, onChange: (val) => setStatusFilter(val || 'pending') },
      { type: 'date-range', label: 'Khoảng ngày', startDate: fromDate, endDate: toDate, onDateRangeChange: (s, e) => { setFromDate(s); setToDate(e); } },
    ],
    [sourceTypeFilter, statusFilter, fromDate, toDate],
  );

  const pendingTotalAmount = useMemo(
    () => items.filter((i) => !i.alreadyImported).reduce((sum, i) => sum + i.amount, 0),
    [items],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <TableSearch placeholder="Tìm mã phiếu nguồn, công trình, đối tác..." value={search} onChange={setSearch} className="w-72" />
          <TableFilters filters={filters} />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="primary" size="md">
            Chờ duyệt: {formatCurrency(pendingTotalAmount)}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            leftIcon={<RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />}
          >
            Làm mới ({total})
          </Button>
        </div>
      </div>

      {isError && (
        <Alert variant="danger" title="Không thể tải hàng chờ hạch toán">
          {getErrorMessage(error)}
        </Alert>
      )}

      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-2">
          <Sparkles size={28} className="mx-auto text-primary/60" />
          <div className="text-sm font-semibold text-slate-800">
            Không có giao dịch nguồn nào đang chờ hạch toán
          </div>
          <p className="text-xs text-slate-500">
            Các giao dịch thanh toán HĐ, phiếu nhập/xuất kho đã duyệt và đơn đặt kính sẽ tự động xuất hiện tại đây.
          </p>
        </div>
      ) : (
        <SourceQueueTable
          items={items}
          accounts={accounts}
          importingKey={importingKey}
          onOpenVoucherDetail={onOpenVoucherDetail}
          onConfigureItem={setConfiguringItem}
          onQuickImport={handleQuickImport}
        />
      )}

      <SourceQueueImportDrawer
        item={configuringItem}
        accounts={accounts}
        bankAccounts={bankAccounts}
        costItems={costItems}
        templates={templates}
        canAutoPost={canAutoPost}
        enforceMakerChecker={setting?.enforceMakerChecker ?? true}
        submitting={Boolean(importingKey)}
        onClose={() => setConfiguringItem(null)}
        onConfirmImport={handleDrawerImport}
      />
    </div>
  );
}
