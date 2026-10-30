'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, Lock, RefreshCw } from 'lucide-react';
import { Button } from '@/components';
import type { ProjectQuotationDetail } from '@/types';

interface QuotationStatusBannerProps {
  quotation: ProjectQuotationDetail;
  isSyncing: boolean;
  onSync: () => void;
}

export function QuotationStatusBanner({ quotation, isSyncing, onSync }: QuotationStatusBannerProps) {
  if (quotation.isOutdated) {
    return <OutdatedBanner quotation={quotation} isSyncing={isSyncing} onSync={onSync} />;
  }

  if (quotation.isLocked) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
        <Lock size={14} className="shrink-0 text-amber-500" />
        <span>
          Báo giá <b>{quotation.code}</b> (v{quotation.version}) đang khóa theo hợp đồng đã ký. Muốn
          chỉnh sửa, hãy hủy hợp đồng ở tab Hợp đồng để mở khóa.
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
      <CheckCircle2 size={14} className="shrink-0" />
      <span>
        Báo giá <b>{quotation.code}</b> (v{quotation.version}) đang khớp với dữ liệu cửa của dự án.
      </span>
    </div>
  );
}

function OutdatedBanner({ quotation, isSyncing, onSync }: QuotationStatusBannerProps) {
  const syncHint = quotation.isLocked
    ? `Đồng bộ sẽ tạo phiên bản v${quotation.version + 1}, giữ nguyên cấu hình giá và giá sửa tay. Sau đó hãy lập hợp đồng thay thế.`
    : 'Đồng bộ sẽ tính lại giá theo dữ liệu cửa mới nhất, giữ nguyên cấu hình giá và giá sửa tay.';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
      <div className="flex items-start gap-2">
        <AlertTriangle size={15} className="shrink-0 mt-0.5 text-amber-600" />
        <div className="space-y-0.5">
          <p className="font-bold">Báo giá đã cũ so với dữ liệu cửa hiện tại</p>
          {quotation.outdatedReason && <p>{quotation.outdatedReason}</p>}
          <p className="text-amber-700">{syncHint}</p>
        </div>
      </div>
      <Button
        variant="primary"
        size="sm"
        leftIcon={<RefreshCw size={14} />}
        loading={isSyncing}
        disabled={isSyncing}
        onClick={onSync}
        className="shrink-0"
      >
        Đồng bộ lại báo giá mới
      </Button>
    </div>
  );
}
