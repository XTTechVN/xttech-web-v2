'use client';

import React, { useMemo, useState } from 'react';
import { BarChart3, FileText, Wallet } from 'lucide-react';
import { Skeleton, Tabs } from '@/components';
import type { QuotationDoorItemSnapshot } from '@/types';
import { QuotationConfigForm } from './components/quotation-config-form';
import { QuotationDoorsTable } from './components/quotation-doors-table';
import { QuotationPreviewPanel } from './components/quotation-preview-panel';
import { QuotationPreviewTab } from './components/quotation-preview-tab';
import { QuotationStatusBanner } from './components/quotation-status-banner';
import { QuotationSummaryCards } from './components/quotation-summary-cards';
import { useProjectQuotation } from './hooks/use-project-quotation';
import { useQuotationForm } from './hooks/use-quotation-form';
import { useQuotationPriceDrafts } from './hooks/use-quotation-price-drafts';

interface ProjectQuotationsPricingProps {
  projectId: number;
}

const PRICING_TABS = [
  { value: 'config', label: 'Cấu thành giá', icon: <Wallet size={15} /> },
  { value: 'analysis', label: 'Chi tiết từng bộ cửa', icon: <BarChart3 size={15} /> },
  { value: 'sheet', label: 'Xem trước báo giá', icon: <FileText size={15} /> },
];

const EMPTY_ITEMS: QuotationDoorItemSnapshot[] = [];

export function ProjectQuotationsPricing({ projectId }: ProjectQuotationsPricingProps) {
  const [activeTab, setActiveTab] = useState('config');
  const api = useProjectQuotation(projectId);
  const { quotation } = api;
  const form = useQuotationForm(projectId, quotation);

  const items = useMemo(
    () => (Array.isArray(quotation?.snapshotItems) ? quotation.snapshotItems : EMPTY_ITEMS),
    [quotation?.snapshotItems],
  );
  const isSeparated = quotation?.accessoryMode === 'separated';
  const drafts = useQuotationPriceDrafts(items, isSeparated);
  const isLocked = quotation?.isLocked ?? false;

  if (api.isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-4">
      {quotation && (
        <>
          <QuotationStatusBanner
            quotation={quotation}
            isSyncing={api.isSyncing}
            onSync={() => api.syncQuotation()}
          />
          <QuotationSummaryCards quotation={quotation} />
        </>
      )}

      <Tabs tabs={PRICING_TABS} activeTab={activeTab} onChange={setActiveTab} size="sm" />

      {activeTab === 'config' && (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-4 items-start">
          <QuotationConfigForm
            config={form.config}
            patchConfig={form.patchConfig}
            toggleFloor={form.toggleFloor}
            name={form.name}
            onNameChange={form.setName}
            note={form.note}
            onNoteChange={form.setNote}
            floors={api.floors}
            isMissingFloors={form.isMissingFloors}
            isReadOnly={isLocked}
          />
          <QuotationPreviewPanel
            result={form.previewResult}
            isCalculating={form.isCalculating}
            isMissingFloors={form.isMissingFloors}
            saveLabel={quotation ? 'Cập nhật báo giá' : 'Lập báo giá'}
            isSaving={api.isSaving}
            isSaveDisabled={isLocked || !form.name.trim() || form.isMissingFloors}
            onSave={() =>
              api.saveQuotation({
                config: form.config,
                name: form.name.trim(),
                note: form.note.trim(),
              })
            }
          />
        </div>
      )}

      {activeTab === 'analysis' &&
        (quotation ? (
          <QuotationDoorsTable
            items={items}
            isSeparated={isSeparated}
            isLocked={isLocked}
            isSaving={api.isSavingPrices}
            drafts={drafts}
            onSave={() =>
              api.savePrices(drafts.buildPayload(), { onSuccess: drafts.resetDrafts })
            }
          />
        ) : (
          <div className="bg-white rounded-lg border border-slate-200/60 p-8 shadow-xs text-center text-xs text-slate-400">
            Dự án chưa có báo giá. Hãy lập báo giá ở tab &quot;Cấu thành giá&quot;.
          </div>
        ))}

      {activeTab === 'sheet' &&
        (quotation ? (
          <QuotationPreviewTab
            projectId={projectId}
            quotationId={quotation.id}
            initialMode={quotation.accessoryMode}
          />
        ) : (
          <div className="bg-white rounded-lg border border-slate-200/60 p-8 shadow-xs text-center text-xs text-slate-400">
            Dự án chưa có báo giá. Hãy lập báo giá ở tab &quot;Cấu thành giá&quot;.
          </div>
        ))}
    </div>
  );
}
