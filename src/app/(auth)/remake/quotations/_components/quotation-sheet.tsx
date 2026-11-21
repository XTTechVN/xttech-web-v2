'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { approveQuotation, returnQuotation } from '@/actions';
import type { QuotationOverviewItem } from '@/types';
import { formatCurrency } from '@/utils';
import { BTN_LINE, BTN_PRIMARY, Field, INPUT, messageOf } from '../../_components/form';
import { Sheet } from '../../_components/sheet';

const when = (v?: string | null) => (v ? new Date(v).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '–');

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-3 text-sm">
    <dt className="flex-none text-rm-muted">{label}</dt>
    <dd className="min-w-0 break-words text-right">{value}</dd>
  </div>
);

interface Props {
  target: QuotationOverviewItem | null;
  onClose: () => void;
}

// Xem nhanh một báo giá; nút Duyệt / Trả lại chỉ hiện khi API báo làm được (`_can`).
export function QuotationSheet({ target, onClose }: Props) {
  const qc = useQueryClient();
  const [note, setNote] = useState('');
  const t = target;

  const done = (msg: string) => {
    toast.success(msg);
    qc.invalidateQueries({ queryKey: ['quotation-overview'] });
    onClose();
  };
  const fail = (e: unknown) => toast.error(messageOf(e));
  const approve = useMutation({
    mutationFn: () => approveQuotation(t!.projectId, t!.id, note.trim() || undefined),
    onSuccess: () => done('Đã duyệt báo giá'),
    onError: fail,
  });
  const giveBack = useMutation({
    mutationFn: () => returnQuotation(t!.projectId, t!.id, note.trim()),
    onSuccess: () => done('Đã trả lại báo giá'),
    onError: fail,
  });

  return (
    <Sheet open={!!t} onClose={onClose} title={t ? `${t.code} (v${t.version})` : ''}>
      {t && (
        <>
          <dl className="flex flex-col gap-3 p-rm-gutter">
            <Row label="Báo giá" value={t.name} />
            <Row label="Dự án" value={`${t.projectCode} · ${t.projectName}`} />
            <Row label="Khách hàng" value={t.customerName ?? '–'} />
            {t.designOptionName && <Row label="Phương án" value={t.designOptionName} />}
            <Row label="Tổng tiền" value={formatCurrency(t.totalAmount)} />
            <Row label="Chiết khấu" value={`${t.discountPercent}%`} />
            <Row label="Biên lãi" value={`${t.effectiveMarginPercent.toFixed(1)}%`} />
            <Row label="Người trình" value={`${t.submittedByName ?? '–'} · ${when(t.submittedAt)}`} />
            <Row label="Người duyệt" value={`${t.approvedByName ?? '–'} · ${when(t.approvedAt)}`} />
            {(t.customerNote ?? t.reviewNote) && <Row label="Ghi chú" value={(t.customerNote ?? t.reviewNote)!} />}
          </dl>

          {(t._can?.approve || t._can?.reject) && (
            <div className="flex flex-col gap-3 border-t border-rm-line p-rm-gutter">
              <Field label="Ghi chú (bắt buộc khi trả lại)" id="qt-note">
                <input id="qt-note" value={note} onChange={(e) => setNote(e.target.value)} className={INPUT} />
              </Field>
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
                {t._can.reject && (
                  <button type="button" disabled={giveBack.isPending || !note.trim()} onClick={() => giveBack.mutate()} className={BTN_LINE}>
                    Trả lại
                  </button>
                )}
                {t._can.approve && (
                  <button type="button" disabled={approve.isPending} onClick={() => approve.mutate()} className={BTN_PRIMARY}>
                    Duyệt
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </Sheet>
  );
}
