'use client';

import { useState } from 'react';
import { DEFAULT_CONTRACT_TERMS_HTML } from '@/config';
import type {
  ContractCreatePayload,
  ContractMilestoneInput,
  ContractPartyA,
  ContractTerms,
  ProjectContractItem,
  ProjectDetail,
  ProjectQuotationDetail,
} from '@/types';
import { formatCurrency } from '@/utils/currency';
import { cn } from '@/utils/cn';
import { RichEditor } from '../../../_components/rich-editor';
import { BTN_PRIMARY, Field, INPUT } from '../../../_components/form';
import { Sheet } from '../../../_components/sheet';
import { MoneyInput, PercentInput } from '../../_components/fields';
import { buildDefaultPartyAFromProject, buildSourceFromDraft } from '../_contracts/contract-source';
import { buildContractValues, fillContractVariables } from '../_contracts/contract-values';
import { toPartyAOverride } from '../_contracts/contract-party';
import { hasTermsContent, readTermsContent } from '../_contracts/contract-terms';

const DEFAULTS: ContractMilestoneInput[] = [
  { milestoneOrder: 1, installmentName: 'Tạm ứng đợt 1 (Ký hợp đồng)', percentage: 40, dueDate: '' },
  { milestoneOrder: 2, installmentName: 'Thanh toán đợt 2 (Giao hàng đến chân công trình)', percentage: 40, dueDate: '' },
  { milestoneOrder: 3, installmentName: 'Quyết toán đợt 3 (Nghiệm thu bàn giao)', percentage: 20, dueDate: '' },
];
const SECTIONS = [
  { id: 'pay', label: 'Đợt thanh toán' },
  { id: 'party', label: 'Bên A' },
  { id: 'terms', label: 'Điều khoản' },
  { id: 'preview', label: 'Xem trước' },
] as const;
type Section = (typeof SECTIONS)[number]['id'];
const PARTY_FIELDS: [keyof ContractPartyA, string, 'date'?][] = [
  ['name', 'Họ tên / tên đơn vị'],
  ['identityCard', 'CCCD / mã số thuế'],
  ['birthDate', 'Ngày sinh', 'date'],
  ['identityIssuedDate', 'Ngày cấp CCCD', 'date'],
  ['address', 'Địa chỉ'],
  ['siteAddress', 'Địa chỉ công trình'],
  ['phone', 'Số điện thoại'],
];

const amountOf = (m: ContractMilestoneInput, total: number) =>
  m.expectedAmount !== undefined ? Number(m.expectedAmount) : Math.round((total * (Number(m.percentage) || 0)) / 100);

interface Props {
  open: boolean;
  onClose: () => void;
  quotation: ProjectQuotationDetail | null;
  project?: ProjectDetail | null;
  live?: ProjectContractItem;
  collected: number;
  busy: boolean;
  onSubmit: (p: ContractCreatePayload) => void;
}

// Lập hợp đồng (hoặc hợp đồng thay thế) từ báo giá khách đã đồng ý: đợt thanh toán, thông tin Bên A, điều khoản.
export function ContractFormSheet({ open, onClose, quotation, project, live, collected, busy, onSubmit }: Props) {
  const total = quotation?.totalAmount ?? 0;
  const [name, setName] = useState(quotation ? `Hợp đồng thi công - ${quotation.name}` : '');
  const [ms, setMs] = useState<ContractMilestoneInput[]>(DEFAULTS);
  const [terms, setTerms] = useState(hasTermsContent(live?.contractTerms) ? readTermsContent(live?.contractTerms) : DEFAULT_CONTRACT_TERMS_HTML);
  const [edits, setEdits] = useState<Partial<ContractPartyA>>({});
  const [sec, setSec] = useState<Section>('pay');
  const defaults = buildDefaultPartyAFromProject(project);
  const party: ContractPartyA = { ...defaults, ...edits };

  const pct = Number(ms.reduce((s, m) => s + (Number(m.percentage) || 0), 0).toFixed(2));
  const sum = ms.reduce((s, m) => s + (Number.isNaN(amountOf(m, total)) ? 0 : amountOf(m, total)), 0);
  const okPct = Math.abs(pct - 100) <= 0.05;
  const okAmt = total > 0 && Math.abs(sum - total) <= 1000;
  const valid = !!quotation && !quotation.isOutdated && !!name.trim() && (okPct || okAmt) && ms.every((m) => m.installmentName.trim());

  const patch = (i: number, p: Partial<ContractMilestoneInput>) => setMs(ms.map((m, k) => (k === i ? { ...m, ...p } : m)));
  const setPct = (i: number, v: number) => patch(i, { percentage: v, expectedAmount: total > 0 ? Math.round((total * v) / 100) : 0 });
  const setAmt = (i: number, v: number | undefined) =>
    patch(i, { expectedAmount: v ?? 0, percentage: total > 0 ? Math.min(100, Number((((v ?? 0) / total) * 100).toFixed(2))) : 0 });
  const add = () =>
    setMs([
      ...ms,
      {
        milestoneOrder: ms.length + 1,
        installmentName: '',
        percentage: Math.max(0, Number((100 - pct).toFixed(2))),
        expectedAmount: Math.max(0, total - sum),
        dueDate: '',
      },
    ]);
  const del = (i: number) => setMs(ms.filter((_, k) => k !== i).map((m, k) => ({ ...m, milestoneOrder: k + 1 })));

  const previewHtml =
    sec === 'preview'
      ? fillContractVariables(
          terms,
          buildContractValues(buildSourceFromDraft({ totalAmount: total, quotationCode: quotation?.code, project, milestones: ms, partyA: party })),
          'html',
        )
      : '';

  const submit = () => {
    const override = toPartyAOverride(party, defaults);
    const content: ContractTerms = { content: terms };
    onSubmit({
      contractName: name.trim(),
      milestones: ms.map((m, i) => {
        const a = amountOf(m, total);
        return {
          ...m,
          milestoneOrder: i + 1,
          installmentName: m.installmentName.trim(),
          percentage: Number(m.percentage) || 0,
          expectedAmount: a > 0 ? a : undefined,
          dueDate: m.dueDate || undefined,
        };
      }),
      contractTerms: hasTermsContent(content) ? content : undefined,
      partyAOverride: Object.keys(override).length ? override : undefined,
    });
  };

  return (
    <Sheet open={open} onClose={onClose} title={live ? 'Lập hợp đồng thay thế' : 'Lập hợp đồng'}>
      <form
        className="flex flex-col gap-4 p-rm-gutter"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        {quotation && (
          <p className="flex items-center justify-between gap-2 rounded-rm bg-rm-bg px-3 py-2 text-sm">
            <span className="min-w-0 truncate">
              Báo giá {quotation.code} · v{quotation.version}
            </span>
            <strong className="flex-none tabular-nums">{formatCurrency(total)}</strong>
          </p>
        )}
        {live && (
          <p className="rounded-rm bg-rm-warning-soft px-3 py-2 text-sm text-rm-warning">
            Hợp đồng {live.contractCode} sẽ bị huỷ và thay thế. Số đã thu {formatCurrency(collected)} được kế thừa, các đợt chưa thu được chia lại
            theo tỷ lệ.
          </p>
        )}
        <Field label="Tên hợp đồng" id="cf-name">
          <input id="cf-name" value={name} onChange={(e) => setName(e.target.value)} className={INPUT} />
        </Field>
        <div role="tablist" aria-label="Nội dung hợp đồng" className="flex gap-1 border-b border-rm-line">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={sec === s.id}
              onClick={() => setSec(s.id)}
              className={cn(
                'h-rm-tap flex-none border-b-2 px-3 text-sm font-medium',
                sec === s.id ? 'border-rm-primary text-rm-primary' : 'border-transparent text-rm-muted',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        {sec === 'pay' && (
          <div className="flex flex-col gap-3">
            {ms.map((m, i) => (
              <fieldset key={i} className="flex flex-col gap-2 rounded-rm-xl border border-rm-line p-3">
                <legend className="px-1 text-xs text-rm-muted">Đợt {i + 1}</legend>
                <input
                  aria-label={`Tên đợt ${i + 1}`}
                  value={m.installmentName}
                  onChange={(e) => patch(i, { installmentName: e.target.value })}
                  placeholder="Tên đợt thanh toán"
                  className={INPUT}
                />
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-2">
                  <label className="text-xs text-rm-muted">
                    Tỷ lệ (%)
                    <PercentInput id={`cf-p-${i}`} value={m.percentage} onChange={(v) => setPct(i, v)} />
                  </label>
                  <label className="text-xs text-rm-muted">
                    Số tiền (đ)
                    <MoneyInput id={`cf-a-${i}`} value={m.expectedAmount ?? amountOf(m, total)} onChange={(v) => setAmt(i, v)} />
                  </label>
                </div>
                <label className="text-xs text-rm-muted">
                  Hạn thanh toán (không bắt buộc)
                  <input type="date" value={m.dueDate ?? ''} onChange={(e) => patch(i, { dueDate: e.target.value })} className={INPUT} />
                </label>
                {ms.length > 1 && (
                  <button type="button" onClick={() => del(i)} className="h-rm-tap self-end px-2 text-sm text-rm-danger">
                    Xoá đợt
                  </button>
                )}
              </fieldset>
            ))}
            <button type="button" onClick={add} className="h-rm-tap self-start px-2 text-sm font-medium text-rm-primary">
              + Thêm đợt
            </button>
            <p
              role="status"
              className={cn(
                'rounded-rm px-3 py-2 text-sm',
                okPct || okAmt ? 'bg-rm-success-soft text-rm-success' : 'bg-rm-warning-soft text-rm-warning',
              )}
            >
              Tổng {pct}% · {formatCurrency(sum)} / {formatCurrency(total)}
              {!(okPct || okAmt) && ' — cần đủ 100%'}
            </p>
          </div>
        )}

        {sec === 'party' && (
          <div className="flex flex-col gap-3">
            {PARTY_FIELDS.map(([k, label, type]) => (
              <Field key={k} label={label} id={`cf-pa-${k}`}>
                <input
                  id={`cf-pa-${k}`}
                  type={type ?? 'text'}
                  value={party[k]}
                  onChange={(e) => setEdits({ ...edits, [k]: e.target.value })}
                  className={INPUT}
                />
              </Field>
            ))}
            <p className="text-xs text-rm-muted">Chỉ các ô anh sửa mới ghi vào hợp đồng; dữ liệu khách hàng không bị đổi.</p>
          </div>
        )}

        {sec === 'terms' && (
          <div className="flex flex-col gap-2">
            <RichEditor label="Cơ chế, điều khoản và chính sách" value={terms} onChange={setTerms} />
            <p className="text-xs text-rm-muted">
              Có thể gõ biến như $ten_khach_hang, $tong_gia_tri, $lich_thanh_toan, $ngay_thang_nam; hệ thống tự điền khi xem hợp đồng.
            </p>
          </div>
        )}

        {sec === 'preview' && (
          <div className="flex flex-col gap-2">
            <h3 className="text-center text-sm font-semibold uppercase">Hợp đồng {name}</h3>
            <div
              className="rounded-rm-xl border border-rm-edge p-3 text-sm [overflow-wrap:anywhere] [&_li]:ml-5 [&_li]:list-disc"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
            <p className="text-xs text-rm-muted">Bản nháp: số hợp đồng và ngày lập sẽ được hệ thống điền khi lập.</p>
          </div>
        )}

        <button type="submit" disabled={busy || !valid} className={BTN_PRIMARY}>
          {busy ? 'Đang lập…' : live ? 'Lập hợp đồng thay thế' : 'Lập hợp đồng'}
        </button>
      </form>
    </Sheet>
  );
}

// Sửa điều khoản của hợp đồng đã lập.
export function TermsSheet({
  contract,
  onClose,
  busy,
  onSave,
}: {
  contract: ProjectContractItem | null;
  onClose: () => void;
  busy: boolean;
  onSave: (c: ProjectContractItem, terms: ContractTerms) => void;
}) {
  const [html, setHtml] = useState(
    hasTermsContent(contract?.contractTerms) ? readTermsContent(contract?.contractTerms) : DEFAULT_CONTRACT_TERMS_HTML,
  );
  return (
    <Sheet open={!!contract} onClose={onClose} title={contract ? `Điều khoản ${contract.contractCode}` : 'Điều khoản'}>
      <form
        className="flex flex-col gap-4 p-rm-gutter"
        onSubmit={(e) => {
          e.preventDefault();
          if (contract) onSave(contract, { ...(contract.contractTerms ?? {}), content: html });
        }}
      >
        <RichEditor label="Cơ chế, điều khoản và chính sách" value={html} onChange={setHtml} />
        <button type="submit" disabled={busy} className={BTN_PRIMARY}>
          {busy ? 'Đang lưu…' : 'Lưu điều khoản'}
        </button>
      </form>
    </Sheet>
  );
}
