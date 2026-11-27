'use client';

import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { approveQuotation } from '@/actions';
import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerSection, InfoRow, Tag } from '@/components-remake';
import type { QuotationOverviewItem } from '@/types';
import { formatCurrency, showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import { fmtDateTime, marginClass, statusOf } from './format';

interface Props {
  quotation: QuotationOverviewItem | null;
  canApprove: boolean;
  onClose: () => void;
}

// Xem nhanh một báo giá và duyệt ngay trong drawer
export function QuotationDrawer({ quotation: q, canApprove, onClose }: Props) {
  const approve = useMutation({
    mutationFn: (item: QuotationOverviewItem) => approveQuotation(item.projectId, item.id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['quotation_overview'] });
      toast.success(`Đã duyệt báo giá ${res.code}`);
      onClose();
    },
    onError: (e) => showErrorToast(e, 'Không duyệt được báo giá'),
  });

  const status = q && statusOf(q.status);
  const note = q && (q.customerNote ?? q.reviewNote);

  return (
    <Drawer isOpen={!!q} onClose={onClose} label="Chi tiết báo giá" width={480}>
      {q && status && (
        <>
          <DrawerHeader compact title="Báo giá" onClose={onClose} />
          <DrawerBody>
            <div className="pt-4">
              <h3 className="mb-2 text-base font-semibold text-slate-900 [overflow-wrap:anywhere]">
                {q.code} (v{q.version})
              </h3>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Tag tone={status.tone}>{status.label}</Tag>
                {q.designOptionName && <Tag tone="violet">{q.designOptionName}</Tag>}
              </div>
              <DrawerSection title="Dự án">
                <InfoRow label="Báo giá">{q.name}</InfoRow>
                <InfoRow label="Dự án">
                  {q.projectCode} · {q.projectName}
                </InfoRow>
                <InfoRow label="Khách hàng">{q.customerName ?? '–'}</InfoRow>
              </DrawerSection>
              <DrawerSection title="Giá trị">
                <InfoRow label="Tổng tiền">
                  <span className="font-semibold tabular-nums">{formatCurrency(q.totalAmount)}</span>
                </InfoRow>
                <InfoRow label="Chiết khấu">{q.discountPercent}%</InfoRow>
                <InfoRow label="Biên lãi">
                  <span className={`font-medium tabular-nums ${marginClass(q.effectiveMarginPercent)}`}>{q.effectiveMarginPercent.toFixed(1)}%</span>
                </InfoRow>
              </DrawerSection>
              <DrawerSection title="Xử lý">
                <InfoRow label="Người trình">
                  {q.submittedByName ?? '–'} · {fmtDateTime(q.submittedAt)}
                </InfoRow>
                <InfoRow label="Người duyệt">
                  {q.approvedByName ?? '–'} · {fmtDateTime(q.approvedAt)}
                </InfoRow>
                {note && <InfoRow label="Ghi chú">{note}</InfoRow>}
              </DrawerSection>
            </div>
          </DrawerBody>
          <DrawerFooter>
            <div className="flex justify-end gap-2">
              <Link
                href={`/app/projects/${q.projectId}?tab=quotations`}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-control border border-slate-200 text-sm font-medium text-slate-700 transition active:scale-95 active:bg-slate-100 md:h-10 md:flex-none md:px-4 md:hover:bg-slate-50"
              >
                <ExternalLink size={16} />
                Xem trong dự án
              </Link>
              {canApprove && q.status === 'pending_approval' && q._can?.approve !== false && (
                <Button
                  className="flex-1 md:flex-none"
                  icon={<CheckCircle2 size={16} />}
                  loading={approve.isPending}
                  onClick={() => approve.mutate(q)}
                >
                  Duyệt
                </Button>
              )}
            </div>
          </DrawerFooter>
        </>
      )}
    </Drawer>
  );
}
