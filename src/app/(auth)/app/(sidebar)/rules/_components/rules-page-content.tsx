'use client';

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { DocumentItem } from '@/types';
import { usePermission } from '@/hooks';
import { markDocumentAsRead } from '@/actions/document';
import { DocumentPreviewModal } from '@/app/(auth)/app/(sidebar)/documents/_components/document-preview-modal';
import { RejectDocumentModal } from '@/app/(auth)/app/(sidebar)/documents/_components/reject-document-modal';
import { DeleteConfirmModal } from '@/app/(auth)/app/(sidebar)/documents/_components/delete-confirm-modal';
import { useRulesFilters } from '../_hooks/use-rules-filters';
import { useRulesList, useRulesSummary } from '../_hooks/use-rules-queries';
import { useRuleActions } from '../_hooks/use-rule-actions';
import { useRulesShareOptions } from '../_hooks/use-rules-share-options';
import { RULES_QUERY_KEYS } from '../_utils/rules-constants';
import { RulesHeader } from './rules-header';
import { RulesTabs } from './rules-tabs';
import { RulesFilterBar } from './rules-filter-bar';
import { RulesTable } from './rules-table';
import { RulesCardGrid } from './rules-card-grid';
import { RuleDetailModal } from './rule-detail-modal';
import { RuleEditorModal } from './rule-editor-modal';
import { RulePublishModal } from './rule-publish-modal';

const EMPTY_HINTS = {
  current: 'Chưa có cơ chế nào khớp với bộ lọc hiện tại.',
  drafts: 'Bạn chưa soạn thảo cơ chế nào. Nhấn “Soạn cơ chế” để bắt đầu.',
  to_process: 'Hiện không có văn bản nào cần bạn phê duyệt hoặc ban hành.',
};

interface EditorState {
  isOpen: boolean;
  doc: DocumentItem | null;
  supersedingDoc?: DocumentItem | null;
}

export function RulesPageContent() {
  const queryClient = useQueryClient();
  const { user, isManager } = usePermission();
  const filters = useRulesFilters(isManager);
  const { data: summary } = useRulesSummary();
  const { data: list, isLoading } = useRulesList(filters.params);
  const { departmentOptions, employeeOptions } = useRulesShareOptions(isManager);

  const [detailDoc, setDetailDoc] = useState<DocumentItem | null>(null);
  const [editor, setEditor] = useState<EditorState>({ isOpen: false, doc: null, supersedingDoc: null });
  const [publishDoc, setPublishDoc] = useState<DocumentItem | null>(null);
  const [rejectDoc, setRejectDoc] = useState<DocumentItem | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<DocumentItem | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  const closeAll = () => {
    setDetailDoc(null);
    setPublishDoc(null);
    setRejectDoc(null);
    setDeleteDoc(null);
  };

  const actions = useRuleActions({ onDone: closeAll });

  const isOverlayOpen = Boolean(publishDoc || rejectDoc || deleteDoc || previewDoc || editor.isOpen);
  const isBusy =
    actions.reviewMutation.isPending || actions.acknowledgeMutation.isPending || actions.deleteMutation.isPending;

  const openEditor = (doc: DocumentItem | null) => setEditor({ isOpen: true, doc, supersedingDoc: null });

  const handleReplace = (doc: DocumentItem) => {
    setDetailDoc(null);
    setEditor({ isOpen: true, doc: null, supersedingDoc: doc });
  };

  const handleOpenPreview = async (doc: DocumentItem) => {
    if (doc.isRead === false) {
      try {
        await markDocumentAsRead(doc.id);
        queryClient.invalidateQueries({ queryKey: RULES_QUERY_KEYS.root });
      } catch (err) {
        console.error('Failed to mark document as read:', err);
      }
    }
    setPreviewDoc(doc);
  };

  const closePreview = () => {
    setPreviewDoc(null);
    queryClient.invalidateQueries({ queryKey: RULES_QUERY_KEYS.root });
  };

  const isGridMode = filters.tab === 'current' && filters.viewMode === 'grid';

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white">
      <RulesHeader
        search={filters.search}
        canCreate={isManager}
        viewMode={filters.viewMode}
        showViewSwitcher={filters.tab === 'current'}
        onSearchChange={filters.setSearch}
        onViewModeChange={filters.setViewMode}
        onCreate={() => openEditor(null)}
      />
      <RulesTabs activeTab={filters.tab} canManage={isManager} summary={summary} onChange={filters.setTab} />
      <RulesFilterBar
        tab={filters.tab}
        chip={filters.chip}
        canManage={isManager}
        documentType={filters.documentType}
        status={filters.status}
        isUnreadOnly={filters.isUnreadOnly}
        isExpiringOnly={filters.isExpiringOnly}
        expiringSoonCount={summary?.expiringSoonCount ?? 0}
        departmentIds={filters.departmentIds}
        recipientUserIds={filters.recipientUserIds}
        departmentOptions={departmentOptions}
        employeeOptions={employeeOptions}
        hasActiveFilters={filters.hasActiveFilters}
        onChipChange={filters.setChip}
        onDocumentTypeChange={filters.setDocumentType}
        onStatusChange={filters.setStatus}
        onUnreadOnlyChange={filters.setUnreadOnly}
        onExpiringOnlyChange={filters.setExpiringOnly}
        onDepartmentIdsChange={filters.setDepartmentIds}
        onRecipientUserIdsChange={filters.setRecipientUserIds}
        onResetFilters={filters.resetFilters}
      />

      {isGridMode ? (
        <RulesCardGrid
          items={list?.items ?? []}
          total={list?.total ?? 0}
          offset={filters.offset}
          limit={list?.limit ?? filters.params.limit ?? 20}
          isLoading={isLoading}
          emptyHint={EMPTY_HINTS[filters.tab]}
          context={{ currentUserId: user?.id ?? '', isManager }}
          onPreview={handleOpenPreview}
          onOpenDetail={setDetailDoc}
          onEdit={openEditor}
          onDelete={setDeleteDoc}
          onReplace={handleReplace}
          onPageChange={filters.setOffset}
        />
      ) : (
        <RulesTable
          items={list?.items ?? []}
          total={list?.total ?? 0}
          offset={filters.offset}
          limit={list?.limit ?? filters.params.limit ?? 20}
          isLoading={isLoading}
          emptyHint={EMPTY_HINTS[filters.tab]}
          context={{ currentUserId: user?.id ?? '', isManager }}
          onOpen={setDetailDoc}
          onEdit={openEditor}
          onDelete={setDeleteDoc}
          onPageChange={filters.setOffset}
        />
      )}

      <RuleDetailModal
        isOpen={Boolean(detailDoc) && !isOverlayOpen}
        document={detailDoc}
        context={{ currentUserId: user?.id ?? '', isManager }}
        isBusy={isBusy}
        onClose={() => setDetailDoc(null)}
        handlers={{
          onPreview: handleOpenPreview,
          onEdit: openEditor,
          onDelete: setDeleteDoc,
          onReplace: handleReplace,
          onApprove: (doc, note) => actions.reviewMutation.mutate({ id: doc.id, isApproved: true, note }),
          onReject: (doc, note) => {
            if (note) {
              actions.reviewMutation.mutate({ id: doc.id, isApproved: false, note });
            } else {
              setRejectDoc(doc);
            }
          },
          onPublish: setPublishDoc,
          onAcknowledge: (doc) => actions.acknowledgeMutation.mutate(doc.id),
        }}
      />

      <RuleEditorModal
        isOpen={editor.isOpen}
        document={editor.doc}
        supersedingDoc={editor.supersedingDoc}
        onClose={() => setEditor({ isOpen: false, doc: null, supersedingDoc: null })}
        onSaved={() => {
          actions.refreshAll();
        }}
      />

      {publishDoc && (
        <RulePublishModal
          key={publishDoc.id}
          isOpen
          document={publishDoc}
          canPublishCompany={isManager}
          isLoading={actions.publishMutation.isPending}
          onClose={() => setPublishDoc(null)}
          onConfirm={(payload) => actions.publishMutation.mutate({ id: publishDoc.id, payload })}
        />
      )}

      <RejectDocumentModal
        isOpen={Boolean(rejectDoc)}
        documentTitle={rejectDoc?.title}
        loading={actions.reviewMutation.isPending}
        onClose={() => setRejectDoc(null)}
        onConfirm={(reason) => {
          if (rejectDoc) actions.reviewMutation.mutate({ id: rejectDoc.id, isApproved: false, note: reason });
        }}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deleteDoc)}
        onClose={() => setDeleteDoc(null)}
        title="Xác nhận xóa văn bản"
        description={
          <>
            Bạn có chắc chắn muốn xóa văn bản <strong className="text-gray-900 font-semibold">{deleteDoc?.title}</strong>? Thao tác này sẽ xóa văn bản và các dữ liệu liên quan.
          </>
        }
        loading={actions.deleteMutation.isPending}
        onConfirm={() => {
          if (deleteDoc) actions.deleteMutation.mutate(deleteDoc.id);
        }}
      />

      <DocumentPreviewModal isOpen={Boolean(previewDoc)} document={previewDoc} onClose={closePreview} />
    </div>
  );
}
