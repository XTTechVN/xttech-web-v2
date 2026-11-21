'use client';

import { useState } from 'react';
import {
  approveQuotation,
  customerAcceptQuotation,
  customerRejectQuotation,
  requestQuotationSigning,
  returnQuotation,
  submitQuotation,
} from '@/actions';
import { QUOTATION_STATUS_MAP } from '@/config';
import { useCan } from '@/hooks';
import type { ProjectQuotationDetail, SignatureInput } from '@/types';
import { Badge, toneOf } from '../../../_components/badge';
import { BTN_LINE, BTN_PRIMARY, Field, INPUT } from '../../../_components/form';
import { Sheet } from '../../../_components/sheet';
import { SignatureFields } from '../../_components/signature-pad';
import { useAct } from './use-act';

const HINT: Record<string, string> = {
  draft: 'Báo giá đang nháp. Trình duyệt trước khi gửi khách.',
  pending_approval: 'Đang chờ duyệt giá, chiết khấu và biên lợi nhuận.',
  approved: 'Đã duyệt. Gửi link cho khách đồng ý hoặc ghi nhận khách đồng ý trực tiếp.',
  sent: 'Đã gửi khách, đang chờ khách đồng ý.',
  accepted: 'Khách đã đồng ý. Sang tab Hợp đồng để lập hợp đồng.',
  rejected: 'Khách từ chối. Sửa cấu hình giá rồi lưu để tạo phiên bản mới.',
  superseded: 'Báo giá đã được thay bằng phiên bản mới.',
  not_chosen: 'Khách không chọn phương án này.',
};

type Reason = 'return' | 'reject' | 'accept' | null;

// Vòng duyệt báo giá: trình duyệt → duyệt / trả lại → gửi khách → khách đồng ý / từ chối. Nút nào cũng xét quyền và cờ _can của báo giá.
export function QuoteApproval({ projectId, q }: { projectId: number; q: ProjectQuotationDetail }) {
  const { can } = useCan();
  const flag = q._can ?? {};
  const [sheet, setSheet] = useState<Reason>(null);
  const [text, setText] = useState('');
  const [sign, setSign] = useState<SignatureInput | null>(null);
  const st = QUOTATION_STATUS_MAP[q.status];
  const close = () => {
    setSheet(null);
    setText('');
    setSign(null);
  };
  const submit = useAct(projectId, () => submitQuotation(projectId, q.id), 'Đã trình duyệt');
  const approve = useAct(projectId, () => approveQuotation(projectId, q.id), 'Đã duyệt báo giá');
  const link = useAct(
    projectId,
    async () => {
      const r = await requestQuotationSigning(projectId, q.id);
      await navigator.clipboard?.writeText(r.signingUrl).catch(() => undefined);
      return r;
    },
    'Đã tạo link duyệt báo giá và sao chép',
  );
  const decide = useAct(
    projectId,
    () =>
      sheet === 'return'
        ? returnQuotation(projectId, q.id, text.trim())
        : sheet === 'reject'
          ? customerRejectQuotation(projectId, q.id, text.trim())
          : customerAcceptQuotation(projectId, q.id, { note: text.trim() || undefined, customerSignature: sign ?? undefined }),
    sheet === 'return' ? 'Đã trả lại để sửa' : sheet === 'reject' ? 'Đã ghi nhận khách từ chối' : 'Đã ghi nhận khách đồng ý',
    close,
  );
  const busy = submit.isPending || approve.isPending || link.isPending;
  const blocked = q.isOutdated;
  const canSend = flag.send && can('quotation:send');
  const canDecide =
    (flag.send || flag.record_decision) && (can('quotation:send') || can('quotation:record_decision')) && ['approved', 'sent'].includes(q.status);
  const needReason = sheet !== 'accept';

  return (
    <section aria-label="Duyệt báo giá" className="rounded-rm-xl border border-rm-edge bg-rm-surface p-rm-gutter">
      <p className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold">
          {q.code} · v{q.version}
        </span>
        <Badge tone={toneOf(st?.variant)}>{st?.label ?? q.status}</Badge>
      </p>
      <p className="mt-1 text-sm text-rm-muted">{HINT[q.status]}</p>
      {q.reviewNote && <p className="mt-1 text-sm text-rm-warning [overflow-wrap:anywhere]">Ghi chú duyệt: {q.reviewNote}</p>}
      {q.customerNote && <p className="mt-1 text-sm text-rm-muted [overflow-wrap:anywhere]">Khách: {q.customerNote}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        {q.status === 'draft' && flag.submit && can('quotation:submit') && (
          <button type="button" disabled={blocked || busy} onClick={() => submit.mutate()} className={BTN_PRIMARY}>
            Trình duyệt
          </button>
        )}
        {q.status === 'pending_approval' && flag.reject && can('quotation:reject') && (
          <button type="button" onClick={() => setSheet('return')} className={BTN_LINE}>
            Trả lại
          </button>
        )}
        {q.status === 'pending_approval' && flag.approve && can('quotation:approve') && (
          <button type="button" disabled={blocked || busy} onClick={() => approve.mutate()} className={BTN_PRIMARY}>
            Duyệt báo giá
          </button>
        )}
        {q.status === 'approved' && flag.reject && can('quotation:reject') && (
          <button type="button" onClick={() => setSheet('return')} className={BTN_LINE}>
            Thu hồi duyệt
          </button>
        )}
        {canDecide && canSend && (
          <button type="button" disabled={blocked || busy} onClick={() => link.mutate()} className={BTN_LINE}>
            {q.status === 'sent' ? 'Gửi lại link' : 'Gửi link cho khách'}
          </button>
        )}
        {canDecide && (
          <>
            <button type="button" onClick={() => setSheet('reject')} className={BTN_LINE}>
              Khách từ chối
            </button>
            <button type="button" disabled={blocked} onClick={() => setSheet('accept')} className={BTN_PRIMARY}>
              Khách đồng ý
            </button>
          </>
        )}
      </div>

      <Sheet
        open={!!sheet}
        onClose={close}
        title={sheet === 'return' ? 'Trả lại báo giá' : sheet === 'reject' ? 'Khách từ chối báo giá' : 'Khách đồng ý báo giá'}
      >
        <form
          className="flex flex-col gap-4 p-rm-gutter"
          onSubmit={(e) => {
            e.preventDefault();
            decide.mutate();
          }}
        >
          <Field label={needReason ? 'Lý do (bắt buộc)' : 'Ghi chú của khách (không bắt buộc)'} id="qa-text">
            <input id="qa-text" value={text} onChange={(e) => setText(e.target.value)} className={INPUT} />
          </Field>
          {sheet === 'accept' && <SignatureFields id="qa-sign" title="Chữ ký khách (không bắt buộc)" onChange={setSign} />}
          <button type="submit" disabled={decide.isPending || (needReason && text.trim().length < 3)} className={BTN_PRIMARY}>
            {decide.isPending ? 'Đang lưu…' : 'Xác nhận'}
          </button>
        </form>
      </Sheet>
    </section>
  );
}
