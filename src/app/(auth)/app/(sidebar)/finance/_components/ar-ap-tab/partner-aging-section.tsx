'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Download, RefreshCw } from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  Input,
  Skeleton,
  TableSearch,
} from '@/components';
import { getArApAgingReport } from '@/actions';
import type { ArApAgingItem } from '@/types';
import { formatCurrency, getErrorMessage } from '@/utils';
import { exportArApAgingExcel } from './ar-ap-export';
import { PartnerAgingTable } from './partner-aging-table';
import { PartnerLedgerPanel } from './partner-ledger-panel';

interface PartnerAgingSectionProps {
  kind: 'receivable' | 'payable';
  refreshSignal?: number;
  onOpenVoucherDetail: (voucherId: number) => void;
}

export function PartnerAgingSection({
  kind,
  refreshSignal = 0,
  onOpenVoucherDetail,
}: PartnerAgingSectionProps) {
  const [search, setSearch] = useState('');
  const [asOfDate, setAsOfDate] = useState<string>(() => dayjs().format('YYYY-MM-DD'));
  const [selectedPartner, setSelectedPartner] = useState<ArApAgingItem | null>(null);

  const { data: report, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['finance-ar-ap-aging', kind, asOfDate, search, refreshSignal],
    queryFn: () =>
      getArApAgingReport({
        kind,
        asOfDate,
        search: search || undefined,
      }),
  });

  const items = report?.items || [];
  const title =
    kind === 'receivable' ? 'Phải thu Khách hàng (TK 131)' : 'Phải trả Nhà cung cấp (TK 331)';

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <TableSearch placeholder={`Tìm theo tên, mã, SĐT (${title})...`} value={search} onChange={setSearch} className="w-64" />
          <div className="w-40">
            <Input type="date" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)} className="h-9 text-xs" />
          </div>
          <Badge variant="default" size="sm">
            100% Sổ Tài chính
          </Badge>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="primary" size="md">
            Tổng dư: {formatCurrency(report?.totalBalance ?? 0)}
          </Badge>
          {report && items.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => exportArApAgingExcel(report)} leftIcon={<Download size={14} />}>
              Xuất Excel
            </Button>
          )}
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
        <Alert variant="danger" title="Không thể tải báo cáo tuổi nợ">
          {getErrorMessage(error)}
        </Alert>
      )}

      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-xs text-slate-500">
          Chưa có số dư công nợ {kind === 'receivable' ? 'phải thu 131' : 'phải trả 331'} tại ngày {asOfDate}.
        </div>
      ) : (
        <PartnerAgingTable items={items} onSelectPartner={setSelectedPartner} />
      )}

      {selectedPartner && (
        <PartnerLedgerPanel
          key={`${selectedPartner.partnerType}-${selectedPartner.partnerId}-${asOfDate}`}
          partner={selectedPartner}
          kind={kind}
          asOfDate={asOfDate}
          onClose={() => setSelectedPartner(null)}
          onOpenVoucherDetail={onOpenVoucherDetail}
        />
      )}
    </div>
  );
}
