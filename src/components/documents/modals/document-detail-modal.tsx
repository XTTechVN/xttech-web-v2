'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Modal } from '@/components';
import { RejectDocumentModal } from './reject-document-modal';
import { UploadVersionModal } from './upload-version-modal';
import { FileText } from 'lucide-react';
import type { DocumentItem } from '@/types';
import {
  getFileUrl,
  isApproverEligible,
  getApproverRoleBadge,
  DOC_QUERY_KEYS,
  invalidateDocumentQueries,
  getDocumentPermissions,
} from '@/utils';
import {
  reviewDocument,
  submitDocument,
  publishDocument,
  updateDocument,
  getDocumentById,
  markDocumentAsRead,
} from '@/actions/document';
import { getEmployees } from '@/actions/employee';
import { getDepartments } from '@/actions/department';
import { useAuthStore } from '@/stores';
import { usePermission } from '@/hooks';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { DocumentDetailBody } from './document-detail-sections';
import {
  resolveDetailDepartments,
  resolveDetailUsers,
  DocumentDetailFooter,
  SubmitApprovalModal,
} from './document-detail-helpers';

interface DocumentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
  onSuccess?: () => void;
  onEdit?: (doc: DocumentItem) => void;
  onDelete?: (doc: DocumentItem) => void;
  onShare?: (doc: DocumentItem) => void;
  onPreview?: (doc: DocumentItem) => void;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  onSuccess,
  onEdit,
  onDelete,
  onShare,
  onPreview,
}) => {
  const queryClient = useQueryClient();
  const [reviewLoading, setReviewLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isUploadVersionOpen, setIsUploadVersionOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedApproverId, setSelectedApproverId] = useState<string>('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const currentUser = useAuthStore((state) => state.user);
  const { hasRole, isAdmin, isHR, isSuper, isManager } = usePermission();

  const canManageDoc =
    isAdmin ||
    isHR ||
    isSuper ||
    isManager ||
    hasRole(['admin', 'hr', 'super', 'supper', 'super_admin', 'supper_admin']);

  const markedDocIdRef = useRef<number | null>(null);

  const { data: fullDoc } = useQuery({
    queryKey: DOC_QUERY_KEYS.documents.detail(doc?.id),
    queryFn: () => (doc?.id ? getDocumentById(doc.id) : null),
    enabled: Boolean(isOpen && doc?.id),
  });

  const targetDoc = fullDoc || doc;

  useEffect(() => {
    if (isOpen && doc?.id && markedDocIdRef.current !== doc.id) {
      markedDocIdRef.current = doc.id;
      markDocumentAsRead(doc.id)
        .then(() => queryClient.invalidateQueries({ queryKey: DOC_QUERY_KEYS.documents.list() }))
        .catch(() => {});
    }
    if (!isOpen) markedDocIdRef.current = null;
  }, [isOpen, doc?.id, queryClient]);

  const { data: employeesData } = useQuery({
    queryKey: DOC_QUERY_KEYS.options.employees,
    queryFn: () => getEmployees({ limit: 200 }),
    enabled: isOpen,
  });

  const { data: departmentsData } = useQuery({
    queryKey: DOC_QUERY_KEYS.options.departments,
    queryFn: () => getDepartments({ limit: 100 }),
    enabled: isOpen,
  });

  const employees = employeesData?.items || [];
  const departments = useMemo(() => {
    const raw = (departmentsData as any)?.data ?? departmentsData;
    return Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : [];
  }, [departmentsData]);

  const resolvedDepartments = useMemo(() => resolveDetailDepartments(targetDoc, departments), [targetDoc, departments]);
  const resolvedUsers = useMemo(() => resolveDetailUsers(targetDoc, doc, employees, currentUser), [targetDoc, doc, employees, currentUser]);

  const approverSelectOptions = useMemo(() => {
    const unique = employees
      .filter(isApproverEligible)
      .filter((emp: any, idx: number, arr: any[]) => idx === arr.findIndex((t: any) => String(t.id) === String(emp.id)));
    return [
      { value: '', label: '-- Chọn người phê duyệt --' },
      ...unique.map((emp: any) => ({
        value: String(emp.id),
        label: `${emp.fullName || emp.username} (${getApproverRoleBadge(emp)})`,
      })),
    ];
  }, [employees]);

  if (!doc || !targetDoc) return null;

  const currentApproverId = targetDoc.approverId || targetDoc.approver?.id;
  const approverEmployee = currentApproverId ? employees.find((e: any) => String(e.id) === String(currentApproverId)) : null;
  const approverDisplayName =
    targetDoc.approver?.fullName ||
    approverEmployee?.fullName ||
    approverEmployee?.username ||
    (currentApproverId ? `Nhân sự #${currentApproverId}` : null);

  const isAssignedApprover =
    Boolean(currentUser?.id) &&
    (String(currentApproverId) === String(currentUser?.id) ||
      String(doc.approverId) === String(currentUser?.id) ||
      (Boolean(currentUser?.email) &&
        Boolean(targetDoc.approver?.email) &&
        targetDoc.approver?.email?.toLowerCase() === currentUser?.email?.toLowerCase()));

  const isCreator =
    Boolean(currentUser?.id) &&
    (String(targetDoc.createdById) === String(currentUser?.id) || String(doc.createdById) === String(currentUser?.id));

  const docPerms = getDocumentPermissions(targetDoc, currentUser, { canManageDocuments: canManageDoc });
  const canEditDoc = docPerms.canEdit;

  const approvalStatus = targetDoc.approvalStatus || doc.approvalStatus || 'draft';
  const isApproved = approvalStatus === 'approved';
  const isDraftOrRejected = approvalStatus === 'draft' || approvalStatus === 'rejected';
  const isActionBusy = reviewLoading || submitLoading || publishLoading;

  const handleReview = async (status: 'approved' | 'rejected', note?: string) => {
    try {
      setReviewLoading(true);
      const reviewNote = status === 'rejected' ? note?.trim() || undefined : undefined;
      await reviewDocument(doc.id, { action: status, approvalStatus: status, comment: reviewNote, approvalNote: reviewNote });
      toast.success(status === 'approved' ? 'Phê duyệt tài liệu thành công!' : 'Đã từ chối tài liệu');
      invalidateDocumentQueries(queryClient);
      setIsRejectModalOpen(false);
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Không thể thực hiện phê duyệt');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleConfirmSubmitForApproval = async () => {
    if (!selectedApproverId) return void setSubmitError('Vui lòng chọn người phê duyệt tài liệu');
    try {
      setSubmitLoading(true);
      if (selectedApproverId !== String(currentApproverId)) {
        await updateDocument(doc.id, { approverId: selectedApproverId }).catch(() => {});
      }
      await submitDocument(doc.id, { approverId: selectedApproverId });
      toast.success('Đã trình duyệt tài liệu thành công!');
      invalidateDocumentQueries(queryClient);
      setIsSubmitModalOpen(false);
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Không thể trình duyệt tài liệu');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      setPublishLoading(true);
      await publishDocument(doc.id);
      toast.success('Đã ban hành văn bản chính thức!');
      invalidateDocumentQueries(queryClient);
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Không thể ban hành tài liệu');
    } finally {
      setPublishLoading(false);
    }
  };

  const currentVersion = doc.currentVersion;
  const downloadUrl =
    currentVersion?.downloadUrl || (currentVersion?.filePath ? getFileUrl(currentVersion.filePath) : null);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
        title={
          <div className="flex items-center gap-2 text-slate-800 min-w-0">
            <FileText className="text-primary shrink-0" size={20} />
            <span className="truncate">{doc.title ? `Chi tiết: ${doc.title}` : 'Chi tiết văn bản / tài liệu'}</span>
          </div>
        }
        footer={
          <DocumentDetailFooter
            isDraftOrRejected={isDraftOrRejected}
            isCreator={isCreator}
            canManageDoc={canManageDoc}
            canEditDoc={canEditDoc}
            approvalStatus={approvalStatus}
            isAssignedApprover={isAssignedApprover}
            isApproved={isApproved}
            isPublished={targetDoc.status === 'published'}
            isActionBusy={isActionBusy}
            submitLoading={submitLoading}
            reviewLoading={reviewLoading}
            publishLoading={publishLoading}
            downloadUrl={downloadUrl}
            onOpenSubmitModal={() => {
              setSelectedApproverId(currentApproverId ? String(currentApproverId) : '');
              setSubmitError(null);
              setIsSubmitModalOpen(true);
            }}
            onOpenRejectModal={() => setIsRejectModalOpen(true)}
            onApprove={() => handleReview('approved')}
            onPublish={handlePublish}
            onOpenUploadVersion={() => setIsUploadVersionOpen(true)}
            onEdit={onEdit ? () => onEdit(targetDoc) : undefined}
            onClose={onClose}
          />
        }
      >
        <DocumentDetailBody
          doc={doc}
          targetDoc={targetDoc}
          canManageDoc={canManageDoc}
          approvalStatus={approvalStatus}
          approverDisplayName={approverDisplayName}
          resolvedDepartments={resolvedDepartments}
          resolvedUsers={resolvedUsers}
          onPreview={onPreview}
          onShare={onShare}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </Modal>

      <RejectDocumentModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        documentTitle={targetDoc.title}
        onConfirm={(reason) => handleReview('rejected', reason)}
        loading={reviewLoading}
      />

      <UploadVersionModal
        isOpen={isUploadVersionOpen}
        onClose={() => setIsUploadVersionOpen(false)}
        document={targetDoc}
        onSuccess={() => {
          invalidateDocumentQueries(queryClient);
          onSuccess?.();
        }}
      />

      <SubmitApprovalModal
        isOpen={isSubmitModalOpen}
        loading={submitLoading}
        selectedApproverId={selectedApproverId}
        submitError={submitError}
        approverSelectOptions={approverSelectOptions}
        onApproverChange={(id) => {
          setSelectedApproverId(id);
          if (submitError) setSubmitError(null);
        }}
        onClose={() => {
          setIsSubmitModalOpen(false);
          setSubmitError(null);
        }}
        onConfirm={handleConfirmSubmitForApproval}
      />
    </>
  );
};
