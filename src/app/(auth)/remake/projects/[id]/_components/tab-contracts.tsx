'use client';

import { useState } from 'react';
import { CONTRACT_KIND_MAP, CONTRACT_STATUS_MAP, PAYMENT_MILESTONE_STATUS_MAP } from '@/config';
import { useCan } from '@/hooks';
import type { PaymentTransactionItem, ProjectContractItem, ProjectPaymentMilestoneItem } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { Badge, toneOf } from '../../../_components/badge';
import { BTN_LINE, BTN_PRIMARY } from '../../../_components/form';
import { EmptyState, ListSkeleton } from '../../../_components/state-views';
import { findLiveContract, isContractSigned, sortContractsLiveFirst, useProjectContracts } from '../_contracts/use-project-contracts';
import { CollectSheet, PreviewSheet, ReasonSheet, reversible } from './contract-sheets';
import { ContractFormSheet, TermsSheet } from './contract-form-sheet';
import { day } from './use-act';

const Note = ({ tone = 'neutral', children }: { tone?: 'neutral' | 'warning'; children: React.ReactNode }) => (
  <p
    className={`mb-3 rounded-rm-xl border p-rm-gutter text-sm ${tone === 'warning' ? 'border-rm-warning bg-rm-warning-soft text-rm-warning' : 'border-rm-edge bg-rm-surface text-rm-muted'}`}
  >
    {children}
  </p>
);

// Tab Hợp đồng: lập / thay thế / ký / gửi link ký / huỷ, điều khoản, xem - in; sổ thanh toán (thu, đảo). Nút nào cũng xét quyền contract:* và payment:*.
export function TabContracts({ projectId }: { projectId: number }) {
  const { can } = useCan();
  const canPay = can('payment:read');
  const h = useProjectContracts(projectId, canPay);
  const [form, setForm] = useState(false);
  const [cancel, setCancel] = useState<ProjectContractItem | null>(null);
  const [terms, setTerms] = useState<ProjectContractItem | null>(null);
  const [preview, setPreview] = useState<ProjectContractItem | null>(null);
  const [collect, setCollect] = useState<{ c: ProjectContractItem; m?: ProjectPaymentMilestoneItem } | null>(null);
  const [reverse, setReverse] = useState<PaymentTransactionItem | null>(null);

  const list = sortContractsLiveFirst(h.contracts);
  const live = findLiveContract(h.contracts);
  const signed = h.contracts.find((c) => c.status !== 'cancelled' && isContractSigned(c));
  const q = h.quotation;
  const accepted = q?.status === 'accepted';
  const canCreate = can('contract:create') && accepted && !q?.isOutdated && live?.quotationId !== q?.id;
  const l = h.ledger;
  const busy = h.signContract.isPending || h.requestSigning.isPending;

  if (h.isLoadingContracts) return <ListSkeleton />;

  return (
    <>
      {canPay && l && (
        <dl className="mb-4 grid grid-cols-[repeat(3,minmax(0,1fr))] gap-2 text-center">
          {[
            ['Giá trị', l.totalContractValue],
            ['Đã thu', l.totalCollected],
            ['Còn nợ', l.remainingDebt],
          ].map(([k, v]) => (
            <div key={k as string} className="rounded-rm-xl border border-rm-edge bg-rm-surface px-2 py-2">
              <dd className="truncate text-sm font-semibold tabular-nums">{formatCurrency(v as number)}</dd>
              <dt className="text-xs text-rm-muted">{k}</dt>
            </div>
          ))}
        </dl>
      )}

      <div className="mb-3 flex items-center gap-2">
        <h2 className="flex-1 text-sm font-semibold">Hợp đồng · {list.length}</h2>
        {can('contract:create') && (
          <button type="button" disabled={!canCreate} onClick={() => setForm(true)} className={`${BTN_PRIMARY} flex-none px-4`}>
            {live ? 'Lập hợp đồng thay thế' : 'Lập hợp đồng'}
          </button>
        )}
      </div>
      {can('contract:create') && !q && <Note>Cần lập báo giá trước khi lập hợp đồng.</Note>}
      {can('contract:create') && q && !accepted && !q.isOutdated && (
        <Note>Báo giá {q.code} chưa được khách đồng ý. Trình duyệt và gửi khách ở tab Báo giá trước.</Note>
      )}
      {q?.isOutdated && (
        <Note tone="warning">Báo giá đã cũ so với danh sách cửa. Đồng bộ lại báo giá (tab Báo giá) trước khi lập hoặc ký hợp đồng.</Note>
      )}
      {list.length === 0 && <EmptyState title="Chưa có hợp đồng" description="Hợp đồng được lập từ báo giá đã được khách đồng ý." />}

      {list.map((c) => {
        const st = CONTRACT_STATUS_MAP[c.status];
        const open = c.status === 'draft' || c.status === 'sent';
        return (
          <section key={c.id} className="mb-4 rounded-rm-xl border border-rm-edge bg-rm-surface">
            <div className="px-rm-gutter py-2">
              <p className="flex items-center gap-2">
                <span className="min-w-0 truncate text-sm font-medium">{c.contractName || c.contractCode}</span>
                <Badge tone={toneOf(st?.variant)}>{st?.label ?? c.status}</Badge>
                {c.kind === 'appendix' && <Badge>{CONTRACT_KIND_MAP[c.kind] ?? 'Phụ lục'}</Badge>}
              </p>
              <p className="truncate text-xs text-rm-muted">
                {c.contractCode} · {formatCurrency(c.totalAmount)} · đã thu {formatCurrency(c.paidAmount)}
                {c.replacedContractCode && ` · thay ${c.replacedContractCode}`}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" onClick={() => setPreview(c)} className={`${BTN_LINE} flex-none px-3`}>
                  Xem
                </button>
                {can('contract:update') && c.status !== 'cancelled' && (
                  <button type="button" onClick={() => setTerms(c)} className={`${BTN_LINE} flex-none px-3`}>
                    Điều khoản
                  </button>
                )}
                {open && can('contract:send') && (
                  <button
                    type="button"
                    disabled={busy || !!q?.isOutdated}
                    onClick={() => h.requestSigning.mutate(c.id)}
                    className={`${BTN_LINE} flex-none px-3`}
                  >
                    Gửi link ký
                  </button>
                )}
                {open && can('contract:sign') && (
                  <button
                    type="button"
                    disabled={busy || !!q?.isOutdated}
                    onClick={() => window.confirm('Ghi nhận hợp đồng đã ký? Báo giá sẽ bị khoá.') && h.signContract.mutate(c.id)}
                    className={`${BTN_PRIMARY} flex-none px-3`}
                  >
                    Ghi nhận đã ký
                  </button>
                )}
                {c.status !== 'cancelled' && can('contract:cancel') && (
                  <button type="button" onClick={() => setCancel(c)} className="h-rm-tap flex-none px-2 text-sm text-rm-danger md:h-rm-control">
                    Huỷ
                  </button>
                )}
              </div>
            </div>
            {(c.payments?.length ?? 0) > 0 && (
              <ul className="divide-y divide-rm-line border-t border-rm-line">
                {c.payments!.map((m) => {
                  const ms = PAYMENT_MILESTONE_STATUS_MAP[m.status];
                  return (
                    <li key={m.id} className="flex items-center gap-3 px-rm-gutter py-2">
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="min-w-0 truncate text-sm">{m.installmentName}</span>
                          <Badge tone={toneOf(ms?.variant)}>{ms?.label ?? m.status}</Badge>
                        </span>
                        <span className="block truncate text-xs text-rm-muted">
                          {formatCurrency(m.paidAmount)} / {formatCurrency(m.expectedAmount)}
                          {m.dueDate && ` · hạn ${day(m.dueDate)}`}
                        </span>
                      </span>
                      {can('payment:create') && m.remainingAmount > 0 && signed?.id === c.id && (
                        <button
                          type="button"
                          onClick={() => setCollect({ c, m })}
                          className="h-rm-tap flex-none px-2 text-sm font-medium text-rm-primary md:h-rm-control"
                        >
                          Thu
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}

      {canPay && (
        <>
          <div className="mb-2 mt-6 flex items-center gap-2">
            <h2 className="flex-1 text-sm font-semibold">Phiếu thu · {h.transactions.length}</h2>
            {can('payment:create') && signed && (
              <button type="button" onClick={() => setCollect({ c: signed })} className={`${BTN_LINE} flex-none px-4`}>
                Thu tiền
              </button>
            )}
          </div>
          {h.transactions.length === 0 ? (
            <EmptyState title="Chưa có phiếu thu" description={signed ? 'Thu tiền theo từng đợt của hợp đồng.' : 'Cần hợp đồng đã ký để thu tiền.'} />
          ) : (
            <ul className="divide-y divide-rm-line rounded-rm-xl border border-rm-edge bg-rm-surface">
              {h.transactions.map((t) => (
                <li key={t.id} className="flex items-center gap-3 px-rm-gutter py-2">
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="min-w-0 truncate text-sm font-medium tabular-nums">{formatCurrency(t.amount)}</span>
                      <Badge tone={t.transactionType === 'collection' ? 'success' : 'warning'}>
                        {t.transactionType === 'collection' ? 'Thu' : t.transactionType === 'refund' ? 'Hoàn' : 'Đảo'}
                      </Badge>
                    </span>
                    <span className="block truncate text-xs text-rm-muted">
                      {t.transactionCode} · {day(t.transactionDate)}
                      {t.bankReference && ` · ${t.bankReference}`}
                    </span>
                    {t.note && <span className="block truncate text-xs text-rm-muted">{t.note}</span>}
                  </span>
                  {can('payment:reverse') && reversible(t) && (
                    <button type="button" onClick={() => setReverse(t)} className="h-rm-tap flex-none px-2 text-sm text-rm-danger md:h-rm-control">
                      Đảo
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <ContractFormSheet
        key={form ? 'cf-open' : 'cf-idle'}
        open={form}
        onClose={() => setForm(false)}
        quotation={q}
        project={h.project}
        live={live}
        collected={l?.totalCollected ?? 0}
        busy={h.createContract.isPending}
        onSubmit={(p) => h.createContract.mutate(p, { onSuccess: () => setForm(false) })}
      />
      <TermsSheet
        key={terms ? `t-${terms.id}` : 't-idle'}
        contract={terms}
        onClose={() => setTerms(null)}
        busy={h.updateContract.isPending}
        onSave={(c, t) => h.updateContract.mutate({ contractId: c.id, payload: { contractTerms: t } }, { onSuccess: () => setTerms(null) })}
      />
      <PreviewSheet
        key={preview ? `p-${preview.id}` : 'p-idle'}
        contract={preview}
        project={h.project}
        quotationCode={q?.id === preview?.quotationId ? q?.code : null}
        onClose={() => setPreview(null)}
      />
      <CollectSheet
        key={collect ? `c-${collect.c.id}-${collect.m?.id ?? 0}` : 'c-idle'}
        projectId={projectId}
        contract={collect?.c ?? null}
        milestoneId={collect?.m?.id}
        remaining={collect?.m?.remainingAmount}
        busy={h.createTransaction.isPending}
        onClose={() => setCollect(null)}
        onSubmit={(p) => h.createTransaction.mutate(p, { onSuccess: () => setCollect(null) })}
      />
      <ReasonSheet
        key={cancel ? `x-${cancel.id}` : 'x-idle'}
        open={!!cancel}
        title={cancel ? `Huỷ ${cancel.contractCode}` : 'Huỷ hợp đồng'}
        intro="Báo giá được mở khoá để chỉnh sửa. Các phiếu thu đã ghi nhận vẫn giữ nguyên."
        label="Lý do huỷ (không bắt buộc)"
        confirm="Xác nhận huỷ"
        busy={h.cancelContract.isPending}
        onClose={() => setCancel(null)}
        onConfirm={(reason) =>
          cancel && h.cancelContract.mutate({ contractId: cancel.id, reason: reason || undefined }, { onSuccess: () => setCancel(null) })
        }
      />
      <ReasonSheet
        key={reverse ? `r-${reverse.id}` : 'r-idle'}
        open={!!reverse}
        title="Đảo bút toán"
        intro={reverse ? `Phiếu ${reverse.transactionCode} · ${formatCurrency(reverse.amount)}` : undefined}
        label="Lý do đảo (bắt buộc)"
        required
        confirm="Xác nhận đảo"
        busy={h.reverseTransaction.isPending}
        onClose={() => setReverse(null)}
        onConfirm={(note) => reverse && h.reverseTransaction.mutate({ reversalOfId: reverse.id, note }, { onSuccess: () => setReverse(null) })}
      />
    </>
  );
}
