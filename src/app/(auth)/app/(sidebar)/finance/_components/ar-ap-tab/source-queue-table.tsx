'use client';

import React, { useMemo } from 'react';
import { CheckCircle2, Eye, SlidersHorizontal, Zap } from 'lucide-react';
import { Badge, Button } from '@/components';
import { SOURCE_TYPE_MAP, VOUCHER_TYPE_MAP } from '@/config/finance';
import type { Account, SourceQueueItem, SourceQueueType } from '@/types';
import { formatCurrency } from '@/utils';
import { SUGGESTED_INVOICE_BADGE_MAP } from './ar-ap-tab.constants';

interface SourceQueueTableProps {
  items: SourceQueueItem[];
  accounts: Account[];
  importingKey: string | null;
  onOpenVoucherDetail: (voucherId: number) => void;
  onConfigureItem: (item: SourceQueueItem) => void;
  onQuickImport: (item: SourceQueueItem) => void;
}

export function SourceQueueTable({
  items,
  accounts,
  importingKey,
  onOpenVoucherDetail,
  onConfigureItem,
  onQuickImport,
}: SourceQueueTableProps) {
  const accountCodeById = useMemo(
    () => new Map(accounts.map((acc) => [acc.id, acc.accountCode])),
    [accounts],
  );

  const allTotalAmount = useMemo(
    () => items.reduce((sum, item) => sum + item.amount, 0),
    [items],
  );

  return (
    <>
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">Nguồn / Mã gốc</th>
                <th className="p-3">Ngày PS</th>
                <th className="p-3">Nội dung &amp; Công trình</th>
                <th className="p-3">Đối tác</th>
                <th className="p-3">Gợi ý định khoản</th>
                <th className="p-3 text-right">Giá trị (VNĐ)</th>
                <th className="p-3 text-center">Trạng thái</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => {
                const key = `${item.sourceType}-${item.sourceId}`;
                const srcMeta = SOURCE_TYPE_MAP[item.sourceType as SourceQueueType];
                const typeMeta = VOUCHER_TYPE_MAP[item.suggestedVoucherType];
                const invoiceMeta =
                  SUGGESTED_INVOICE_BADGE_MAP[item.suggestedHasValidInvoice ? 'true' : 'false'];
                const debitCode = item.suggestedDebitAccountId != null ? accountCodeById.get(item.suggestedDebitAccountId) : undefined;
                const creditCode = item.suggestedCreditAccountId != null ? accountCodeById.get(item.suggestedCreditAccountId) : undefined;
                const isBusy = importingKey === key;

                return (
                  <tr key={key} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 align-top">
                      <Badge variant={srcMeta?.variant || 'default'} size="sm">
                        {srcMeta?.shortLabel || item.sourceType}
                      </Badge>
                      <div className="font-mono font-bold text-slate-900 mt-1">
                        {item.sourceCode}
                      </div>
                    </td>
                    <td className="p-3 align-top whitespace-nowrap font-mono text-slate-700">
                      {item.sourceDate.slice(0, 10)}
                    </td>
                    <td className="p-3 align-top max-w-xs">
                      <div className="font-semibold text-slate-900">{item.title}</div>
                      <div className="text-slate-500 line-clamp-2 mt-0.5">{item.description}</div>
                      {item.projectName && (
                        <div className="text-[11px] text-primary font-medium mt-1">
                          CT: {item.projectCode ? `${item.projectCode} - ` : ''}
                          {item.projectName}
                        </div>
                      )}
                    </td>
                    <td className="p-3 align-top text-slate-700">
                      {item.partnerName || '---'}
                    </td>
                    <td className="p-3 align-top space-y-1">
                      <Badge variant={typeMeta?.variant || 'default'} size="sm">{typeMeta?.shortLabel || item.suggestedVoucherType}</Badge>
                      {debitCode && creditCode && (
                        <div className="font-mono text-[11px] text-primary font-semibold">Nợ {debitCode} / Có {creditCode}</div>
                      )}
                      <div><Badge variant={invoiceMeta.variant} size="sm">{invoiceMeta.label}</Badge></div>
                    </td>
                    <td className="p-3 align-top font-mono tabular-nums text-right font-bold text-slate-900">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="p-3 align-top text-center">
                      {item.alreadyImported && item.existingVoucherId ? (
                        <button
                          type="button"
                          onClick={() => onOpenVoucherDetail(item.existingVoucherId!)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold hover:bg-emerald-100 cursor-pointer"
                        >
                          <CheckCircle2 size={12} />
                          {item.existingVoucherNo || `CT #${item.existingVoucherId}`}
                        </button>
                      ) : (
                        <Badge variant="warning" size="sm">
                          Chờ kiểm duyệt
                        </Badge>
                      )}
                    </td>
                    <td className="p-3 align-top text-right">
                      {item.alreadyImported && item.existingVoucherId ? (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => onOpenVoucherDetail(item.existingVoucherId!)}
                          leftIcon={<Eye size={13} />}
                        >
                          Xem CT
                        </Button>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => onConfigureItem(item)}
                            leftIcon={<SlidersHorizontal size={12} />}
                          >
                            Chỉnh &amp; Nhập
                          </Button>
                          <Button
                            variant="primary"
                            size="xs"
                            loading={isBusy}
                            onClick={() => onQuickImport(item)}
                            leftIcon={<Zap size={12} />}
                          >
                            Import Nháp
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-primary/5 text-primary font-bold border-t-2 border-primary/20">
              <tr>
                <td colSpan={5} className="p-3 text-right uppercase tracking-wide">
                  Tổng giá trị hàng chờ hiển thị ({items.length} dòng)
                </td>
                <td className="p-3 font-mono tabular-nums text-right text-sm">
                  {formatCurrency(allTotalAmount)}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {items.map((item) => {
          const key = `${item.sourceType}-${item.sourceId}`;
          const srcMeta = SOURCE_TYPE_MAP[item.sourceType as SourceQueueType];
          return (
            <div key={key} className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge variant={srcMeta?.variant || 'default'} size="sm">
                    {srcMeta?.shortLabel || item.sourceType}
                  </Badge>
                  <div className="font-mono font-bold text-sm text-slate-900 mt-1">
                    {item.sourceCode}
                  </div>
                </div>
                <div className="font-mono tabular-nums text-right font-bold text-primary">
                  {formatCurrency(item.amount)}
                </div>
              </div>
              <div className="text-xs text-slate-700 font-medium">{item.title}</div>
              <div className="text-xs text-slate-500">{item.description}</div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-500">{item.sourceDate.slice(0, 10)}</span>
                {item.alreadyImported && item.existingVoucherId ? (
                  <Button variant="outline" size="xs" onClick={() => onOpenVoucherDetail(item.existingVoucherId!)}>
                    {item.existingVoucherNo || 'Xem chứng từ'}
                  </Button>
                ) : (
                  <div className="flex gap-1.5">
                    <Button variant="outline" size="xs" onClick={() => onConfigureItem(item)}>
                      Sửa
                    </Button>
                    <Button variant="primary" size="xs" loading={importingKey === key} onClick={() => onQuickImport(item)}>
                      Import Nháp
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
