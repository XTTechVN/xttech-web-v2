'use client';

import { useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { uploadProgressEvidence } from '@/actions';
import { PAYMENT_METHOD_OPTIONS } from '@/config';
import type { PaymentTransactionCreatePayload, PaymentTransactionItem, ProjectContractItem, ProjectDetail } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { BTN_LINE, BTN_PRIMARY, Field, INPUT, messageOf } from '../../../_components/form';
import { Select } from '../../../_components/select';
import { Sheet } from '../../../_components/sheet';
import { MoneyInput } from '../../_components/fields';
import { ReasonSheet } from '../../_components/reason-sheet';

export { ReasonSheet };
import { buildContractValues, fillContractVariables } from '../_contracts/contract-values';
import { buildSourceFromContract } from '../_contracts/contract-source';
import { hasTermsContent, readTermsContent } from '../_contracts/contract-terms';
import { day } from './use-act';

// Thu tiền theo hợp đồng đã ký: số tiền, hình thức, mã giao dịch, ghi chú, ảnh chứng từ.
export function CollectSheet({
  projectId,
  contract,
  milestoneId,
  remaining,
  onClose,
  busy,
  onSubmit,
}: {
  projectId: number;
  contract: ProjectContractItem | null;
  milestoneId?: number;
  remaining?: number;
  onClose: () => void;
  busy: boolean;
  onSubmit: (p: PaymentTransactionCreatePayload) => void;
}) {
  const [amount, setAmount] = useState<number | undefined>(remaining || undefined);
  const [method, setMethod] = useState('bank_transfer');
  const [ref, setRef] = useState('');
  const [note, setNote] = useState('');
  const [img, setImg] = useState('');
  const [up, setUp] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const pick = async (f?: File) => {
    if (!f) return;
    setUp(true);
    try {
      setImg((await uploadProgressEvidence(projectId, f)).url);
    } catch (e) {
      toast.error(messageOf(e));
    } finally {
      setUp(false);
      if (file.current) file.current.value = '';
    }
  };
  return (
    <Sheet open={!!contract} onClose={onClose} title="Thu tiền">
      <form
        className="flex flex-col gap-4 p-rm-gutter"
        onSubmit={(e) => {
          e.preventDefault();
          if (contract && amount)
            onSubmit({
              projectId,
              contractId: contract.id,
              paymentInstallmentId: milestoneId,
              amount,
              transactionType: 'collection',
              paymentMethod: method,
              bankReference: ref.trim() || undefined,
              receiptImage: img || undefined,
              note: note.trim() || undefined,
            });
        }}
      >
        {contract && (
          <p className="rounded-rm bg-rm-bg px-3 py-2 text-sm">
            {contract.contractCode} · còn {formatCurrency(contract.remainingAmount)}
          </p>
        )}
        <Field label="Số tiền thu thực tế (đ)" id="cs-amount">
          <MoneyInput id="cs-amount" value={amount} onChange={setAmount} />
        </Field>
        <Field label="Hình thức thanh toán" id="cs-method">
          <Select id="cs-method" label="Hình thức" value={method} onChange={setMethod} options={PAYMENT_METHOD_OPTIONS} />
        </Field>
        <Field label="Mã giao dịch ngân hàng (nếu có)" id="cs-ref">
          <input id="cs-ref" value={ref} onChange={(e) => setRef(e.target.value)} className={INPUT} />
        </Field>
        <Field label="Ghi chú" id="cs-note">
          <input id="cs-note" value={note} onChange={(e) => setNote(e.target.value)} className={INPUT} />
        </Field>
        <div className="flex items-center gap-3">
          <input
            ref={file}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            aria-label="Ảnh chứng từ"
            onChange={(e) => pick(e.target.files?.[0])}
          />
          <button type="button" disabled={up} onClick={() => file.current?.click()} className={`${BTN_LINE} flex-none px-4`}>
            {up ? 'Đang tải ảnh…' : img ? 'Đổi ảnh chứng từ' : 'Thêm ảnh chứng từ'}
          </button>
          {img && (
            <button type="button" onClick={() => setImg('')} className="text-sm text-rm-danger">
              Bỏ ảnh
            </button>
          )}
        </div>
        <button type="submit" disabled={busy || up || !amount} className={BTN_PRIMARY}>
          {busy ? 'Đang lưu…' : 'Lưu phiếu thu'}
        </button>
      </form>
    </Sheet>
  );
}

// Xem hợp đồng đã lập: Bên A, tổng giá trị, lịch thanh toán và điều khoản (biến đã được điền); in được.
export function PreviewSheet({
  contract,
  project,
  quotationCode,
  onClose,
}: {
  contract: ProjectContractItem | null;
  project?: ProjectDetail | null;
  quotationCode?: string | null;
  onClose: () => void;
}) {
  if (!contract)
    return (
      <Sheet open={false} onClose={onClose} title="Hợp đồng">
        {null}
      </Sheet>
    );
  const src = buildSourceFromContract(contract, project, quotationCode);
  const values = buildContractValues(src);
  const terms = hasTermsContent(contract.contractTerms) ? fillContractVariables(readTermsContent(contract.contractTerms), values, 'html') : '';
  const a = src.partyA;
  const print = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(
      `<html><head><title>${contract.contractCode}</title><style>body{font-family:serif;padding:32px;line-height:1.5}h1{text-align:center}</style></head><body><h1>HỢP ĐỒNG ${contract.contractName ?? ''}</h1><p>Số: ${contract.contractCode}</p>${terms}</body></html>`,
    );
    w.document.close();
    w.onload = () => w.print();
  };
  return (
    <Sheet open onClose={onClose} title={contract.contractCode}>
      <div className="flex flex-col gap-4 p-rm-gutter text-sm">
        <dl className="divide-y divide-rm-line rounded-rm-xl border border-rm-edge">
          {[
            ['Bên A', a.name],
            ['CCCD / MST', a.identityCard],
            ['Địa chỉ', a.address],
            ['Công trình', a.siteAddress],
            ['Điện thoại', a.phone],
            ['Ngày lập', day(contract.contractDate)],
            ['Tổng giá trị', formatCurrency(contract.totalAmount)],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-3 px-3 py-1.5">
              <dt className="w-24 flex-none text-rm-muted">{k}</dt>
              <dd className="min-w-0 flex-1 [overflow-wrap:anywhere]">{v || '–'}</dd>
            </div>
          ))}
        </dl>
        {src.installments.length > 0 && (
          <ul className="divide-y divide-rm-line rounded-rm-xl border border-rm-edge">
            {src.installments.map((i, k) => (
              <li key={k} className="flex items-baseline gap-3 px-3 py-1.5">
                <span className="min-w-0 flex-1">
                  Đợt {k + 1}: {i.name}
                  {i.dueDate && <span className="block text-xs text-rm-muted">Hạn {day(i.dueDate)}</span>}
                </span>
                <span className="flex-none tabular-nums">
                  {i.percentage}% · {formatCurrency(i.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
        {terms && (
          <div
            className="rounded-rm-xl border border-rm-edge p-3 [overflow-wrap:anywhere] [&_li]:ml-5 [&_li]:list-disc"
            dangerouslySetInnerHTML={{ __html: terms }}
          />
        )}
        <button type="button" onClick={print} className={BTN_LINE}>
          In hợp đồng
        </button>
      </div>
    </Sheet>
  );
}

export const reversible = (t: PaymentTransactionItem) => t.transactionType !== 'reversal' && !t.reversalOfId;
