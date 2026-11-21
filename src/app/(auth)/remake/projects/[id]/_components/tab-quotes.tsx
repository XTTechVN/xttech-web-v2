'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProjectQuotations } from '@/actions';
import { QUOTATION_STATUS_MAP } from '@/config';
import { useCan } from '@/hooks';
import type { QuotationDoorItemSnapshot } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { cn } from '@/utils/cn';
import { Badge, toneOf } from '../../../_components/badge';
import { BTN_PRIMARY } from '../../../_components/form';
import { ListSkeleton } from '../../../_components/state-views';
import { useQuotationForm } from '../_quotes/use-quotation-form';
import { useQuotationPriceDrafts } from '../_quotes/use-quotation-price-drafts';
import { useProjectQuotation } from '../_quotes/use-project-quotation';
import { QuoteAnalysis } from './quote-analysis';
import { QuoteApproval } from './quote-approval';
import { QuoteConfig } from './quote-config';
import { QuoteDoors } from './quote-doors';
import { QuoteOptions } from './quote-options';
import { QuoteSheetView } from './quote-sheet-view';
import { day } from './use-act';

const EMPTY: QuotationDoorItemSnapshot[] = [];
const VIEWS = [
  { id: 'config', label: 'Cấu thành giá' },
  { id: 'doors', label: 'Từng bộ cửa' },
  { id: 'sheet', label: 'Xem trước' },
] as const;
type View = (typeof VIEWS)[number]['id'];

const Note = ({ tone, children }: { tone: 'warning' | 'neutral'; children: React.ReactNode }) => (
  <p
    className={cn(
      'rounded-rm-xl border p-rm-gutter text-sm',
      tone === 'warning' ? 'border-rm-warning bg-rm-warning-soft text-rm-warning' : 'border-rm-edge bg-rm-surface text-rm-muted',
    )}
  >
    {children}
  </p>
);

// Tab Báo giá: phương án → báo giá hiện hành (duyệt, đồng bộ) → cấu thành giá / từng bộ cửa / xem trước. Mọi nút xét quyền quotation:*.
export function TabQuotes({ projectId }: { projectId: number }) {
  const { can } = useCan();
  const [option, setOption] = useState<number | null>(null);
  const [view, setView] = useState<View>('config');
  const api = useProjectQuotation(projectId, option);
  const q = api.quotation;
  const form = useQuotationForm(projectId, q, option);
  const items = useMemo(() => (Array.isArray(q?.snapshotItems) ? q.snapshotItems : EMPTY), [q?.snapshotItems]);
  const separated = q?.accessoryMode === 'separated';
  const drafts = useQuotationPriceDrafts(items, separated, q?.vatPercent);
  const history = useQuery({ queryKey: ['project_quotations', projectId], queryFn: () => getProjectQuotations(projectId, { limit: 50 }) });

  const canCreate = can('quotation:create');
  const canUpdate = can('quotation:update');
  const locked = q?.isLocked ?? false;
  // Lưu tại chỗ cần quyền sửa; lập mới / phiên bản mới cần quyền tạo
  const writes = !q ? canCreate : api.isEditable ? canUpdate : canCreate;

  if (api.isLoading) return <ListSkeleton />;

  return (
    <>
      <QuoteOptions projectId={projectId} value={option} onChange={setOption} />
      {!q && !canCreate && <Note tone="neutral">Chưa có báo giá cho {option === null ? 'dự án' : 'phương án này'}.</Note>}

      {q && (
        <div className="mb-4 flex flex-col gap-3">
          <QuoteApproval projectId={projectId} q={q} />
          {q.isOutdated ? (
            <div className="flex flex-wrap items-center gap-2 rounded-rm-xl border border-rm-warning bg-rm-warning-soft p-rm-gutter text-sm text-rm-warning">
              <span className="min-w-0 flex-1">
                <strong className="block">Báo giá đã cũ so với dữ liệu cửa hiện tại</strong>
                {q.outdatedReason}
              </span>
              {(q.isLocked ? canCreate : canUpdate) && (
                <button type="button" disabled={api.isSyncing} onClick={() => api.syncQuotation()} className={`${BTN_PRIMARY} flex-none px-4`}>
                  {api.isSyncing ? 'Đang đồng bộ…' : 'Đồng bộ lại'}
                </button>
              )}
            </div>
          ) : locked ? (
            <Note tone="neutral">Báo giá đang khoá theo hợp đồng đã ký. Muốn chỉnh sửa, huỷ hợp đồng ở tab Hợp đồng để mở khoá.</Note>
          ) : null}
          <dl className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2 text-sm md:grid-cols-[repeat(3,minmax(0,1fr))]">
            {[
              ['Khách phải trả (gồm thuế)', formatCurrency(q.totalAmount)],
              ['Chi phí làm ra', formatCurrency(q.workshopPrice)],
              ['Tiền lãi', `${formatCurrency(q.totalProfit)} · ${(q.effectiveMarginPercent ?? 0).toFixed(1)}%`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-rm-xl border border-rm-edge bg-rm-surface p-3">
                <dt className="text-xs text-rm-muted">{k}</dt>
                <dd className="mt-0.5 font-medium tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {(q || canCreate) && (
        <>
          <div role="tablist" aria-label="Nội dung báo giá" className="mb-4 flex gap-1 overflow-x-auto border-b border-rm-line">
            {VIEWS.filter((v) => q || v.id === 'config').map((v) => (
              <button
                key={v.id}
                type="button"
                role="tab"
                aria-selected={view === v.id}
                onClick={() => setView(v.id)}
                className={cn(
                  'h-rm-tap flex-none border-b-2 px-3 text-sm font-medium md:h-rm-control',
                  view === v.id ? 'border-rm-primary text-rm-primary' : 'border-transparent text-rm-muted',
                )}
              >
                {v.label}
              </button>
            ))}
          </div>

          {(view === 'config' || !q) && (
            <QuoteConfig
              config={form.config}
              patch={form.patchConfig}
              toggleFloor={form.toggleFloor}
              name={form.name}
              setName={form.setName}
              note={form.note}
              setNote={form.setNote}
              floors={api.floors}
              missingFloors={form.isMissingFloors}
              readOnly={locked || !writes}
              result={form.previewResult}
              calculating={form.isCalculating}
              saveLabel={!q ? 'Lập báo giá' : api.isEditable ? 'Cập nhật báo giá' : 'Lập phiên bản mới'}
              saving={api.isSaving}
              canSave={writes && !locked && !!form.name.trim() && !form.isMissingFloors}
              onSave={() => api.saveQuotation({ config: form.config, name: form.name.trim(), note: form.note.trim() })}
            />
          )}
          {q && view === 'doors' && (
            <div className="flex flex-col gap-4">
              <QuoteDoors
                items={items}
                separated={separated}
                readOnly={!api.isEditable || !canUpdate}
                saving={api.isSavingPrices}
                drafts={drafts}
                onSave={() => api.savePrices(drafts.buildPayload(), { onSuccess: drafts.resetDrafts })}
              />
              <QuoteAnalysis projectId={projectId} quotationId={q.id} />
            </div>
          )}
          {q && view === 'sheet' && <QuoteSheetView projectId={projectId} quotationId={q.id} mode={q.accessoryMode} />}
        </>
      )}

      {(history.data?.items.length ?? 0) > 1 && (
        <section className="mt-6" aria-label="Lịch sử phiên bản">
          <h2 className="mb-2 text-sm font-semibold">Lịch sử phiên bản</h2>
          <ul className="divide-y divide-rm-line rounded-rm-xl border border-rm-edge bg-rm-surface">
            {history.data!.items.map((h) => (
              <li key={h.id} className="flex items-center gap-2 px-rm-gutter py-2 text-sm">
                <span className="min-w-0 flex-1 truncate">
                  {h.code} · v{h.version}
                  <span className="block text-xs text-rm-muted">
                    {formatCurrency(h.totalAmount)} · {day(h.createdAt)}
                  </span>
                </span>
                <Badge tone={toneOf(QUOTATION_STATUS_MAP[h.status]?.variant)}>{QUOTATION_STATUS_MAP[h.status]?.label ?? h.status}</Badge>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
