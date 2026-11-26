'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { GitCompare } from 'lucide-react';
import { Alert, Badge, Button, Modal, Skeleton } from '@/components';
import { getSupplementalFilingDiff } from '@/actions';
import { cn, formatCurrency, getErrorMessage } from '@/utils';

export interface SupplementalDiffModalProps {
  isOpen: boolean;
  filingId: number | null;
  onClose: () => void;
}

export function SupplementalDiffModal({
  isOpen,
  filingId,
  onClose,
}: SupplementalDiffModalProps) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['finance', 'statutory', 'supplemental-diff', filingId],
    queryFn: () => getSupplementalFilingDiff(filingId as number),
    enabled: isOpen && Boolean(filingId),
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={
        <div className="flex items-center gap-2">
          <GitCompare size={16} className="text-primary" />
          <span>
            Bảng Giải trình Khai bổ sung (Mẫu 01/KHBS)
            {data ? ` — ${data.formCode} (Lần ${data.supplementalSeq})` : ''}
          </span>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        {isError && (
          <Alert variant="danger" title="Không thể tải bảng chênh lệch khai bổ sung">
            {getErrorMessage(error)}
          </Alert>
        )}

        {isLoading || !data ? (
          <div className="space-y-2 py-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-44 w-full" />
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
              <Badge variant="primary" size="sm">{data.formCode}</Badge>
              <Badge variant="warning" size="sm">Bổ sung lần {data.supplementalSeq}</Badge>
              <span className="text-slate-600">
                Đối chiếu với tờ khai gốc #{data.parentFilingId}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden max-h-[52vh] overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 font-semibold sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 w-24">Mã CT</th>
                    <th className="p-2.5">Chỉ tiêu</th>
                    <th className="p-2.5 w-36 text-right">Đã kê khai</th>
                    <th className="p-2.5 w-36 text-right">Điều chỉnh</th>
                    <th className="p-2.5 w-36 text-right">Chênh lệch (Tăng/Giảm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.items.map((item) => (
                    <tr key={item.code} className="hover:bg-slate-50/70">
                      <td className="p-2.5 font-mono font-bold text-primary">[{item.code}]</td>
                      <td className="p-2.5">
                        <div className="font-medium text-slate-900">{item.label}</div>
                        {item.note && (
                          <div className="text-[11px] text-slate-500 mt-0.5">{item.note}</div>
                        )}
                      </td>
                      <td className="p-2.5 font-mono tabular-nums text-right">
                        {formatCurrency(item.declaredValue)}
                      </td>
                      <td className="p-2.5 font-mono tabular-nums text-right font-semibold text-slate-900">
                        {formatCurrency(item.adjustedValue)}
                      </td>
                      <td
                        className={cn(
                          'p-2.5 font-mono tabular-nums text-right font-bold',
                          item.difference > 0
                            ? 'text-rose-700'
                            : item.difference < 0
                              ? 'text-emerald-700'
                              : 'text-slate-400',
                        )}
                      >
                        {item.difference > 0 ? '+' : ''}
                        {formatCurrency(item.difference)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Đóng
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
