'use client';

import React from 'react';
import { Download, Megaphone, Send, UploadCloud } from 'lucide-react';
import { Button, Modal, Select } from '@/components';
import type { DocumentItem } from '@/types';

export function resolveDetailDepartments(targetDoc: DocumentItem | null, departments: any[]) {
  if (!targetDoc) return [];
  const deptIds = new Set<number>();
  const rawDeptIds = (targetDoc as any)?.recipientDepartmentIds || (targetDoc as any)?.departmentIds || [];
  if (Array.isArray(rawDeptIds)) {
    rawDeptIds.forEach((id: any) => {
      const num = Number(id);
      if (!Number.isNaN(num) && num > 0) deptIds.add(num);
    });
  }
  if (Array.isArray((targetDoc as any)?.departments)) {
    (targetDoc as any).departments.forEach((d: any) => {
      const did = Number(d.id || d.departmentId);
      if (!Number.isNaN(did) && did > 0) deptIds.add(did);
    });
  }
  if (Array.isArray(targetDoc.recipients)) {
    targetDoc.recipients.forEach((r: any) => {
      const did = Number(r.departmentId);
      if (!Number.isNaN(did) && did > 0) deptIds.add(did);
    });
  }

  const deptMap = new Map<number, any>(departments.map((d: any) => [Number(d.id), d]));
  return Array.from(deptIds).map((id) => {
    const match = deptMap.get(id);
    return { id, name: match?.name || `Phòng ban #${id}`, code: match?.code };
  });
}

export function resolveDetailUsers(
  targetDoc: DocumentItem | null,
  doc: DocumentItem | null,
  employees: any[],
  currentUser: any,
) {
  if (!targetDoc) return [];
  const userMap = new Map<string, any>();
  const empMap = new Map<string, any>(employees.map((emp: any) => [String(emp.id), emp]));

  if (Array.isArray(targetDoc.recipients)) {
    targetDoc.recipients.forEach((r: any) => {
      const uid = String(r.userId || r.user?.id || '');
      if (uid && !userMap.has(uid)) {
        const emp = empMap.get(uid);
        userMap.set(uid, {
          id: uid,
          fullName: r.fullName || emp?.fullName || emp?.username || 'Nhân sự',
          code: emp?.identifyCode || emp?.code || (r as any)?.identifyCode || (r as any)?.code,
          email: r.email || emp?.email,
          departmentName: r.departmentName || emp?.departmentName || emp?.department?.name,
          isRead: Boolean(r.isRead),
          readAt: r.readAt,
        });
      }
    });
  }

  const rawUserIds = (targetDoc as any)?.recipientUserIds || [];
  if (Array.isArray(rawUserIds)) {
    rawUserIds.forEach((uid: any) => {
      const sUid = String(uid);
      if (sUid && !userMap.has(sUid)) {
        const emp = empMap.get(sUid);
        userMap.set(sUid, {
          id: sUid,
          fullName: emp?.fullName || emp?.username || `Nhân sự #${sUid}`,
          code: emp?.identifyCode || emp?.code,
          email: emp?.email,
          departmentName: emp?.departmentName || emp?.department?.name,
          isRead: false,
        });
      }
    });
  }

  const creatorId = String(targetDoc.createdById || doc?.createdById || targetDoc.createdBy?.id || '');
  const creatorEmail = (targetDoc.createdBy?.email || doc?.createdBy?.email || '').toLowerCase().trim();
  const creatorName = (targetDoc.createdBy?.fullName || doc?.createdBy?.fullName || '').toLowerCase().trim();

  return Array.from(userMap.values()).filter((u) => {
    const isCreatorId = Boolean(creatorId && String(u.id) === creatorId);
    const isCreatorEmail = Boolean(creatorEmail && u.email && u.email.toLowerCase().trim() === creatorEmail);
    const isCreatorName = Boolean(creatorName && u.fullName && u.fullName.toLowerCase().trim() === creatorName);
    const isCurrentOwner = Boolean(
      (targetDoc.isOwner || doc?.isOwner) && currentUser?.id && String(u.id) === String(currentUser.id),
    );
    return !isCreatorId && !isCreatorEmail && !isCreatorName && !isCurrentOwner;
  });
}

export const DocumentDetailFooter: React.FC<{
  isDraftOrRejected: boolean;
  isCreator: boolean;
  canManageDoc: boolean;
  approvalStatus: string;
  isAssignedApprover: boolean;
  isApproved: boolean;
  isPublished: boolean;
  isActionBusy: boolean;
  submitLoading: boolean;
  reviewLoading: boolean;
  publishLoading: boolean;
  downloadUrl: string | null;
  onOpenSubmitModal: () => void;
  onOpenRejectModal: () => void;
  onApprove: () => void;
  onPublish: () => void;
  onOpenUploadVersion: () => void;
  onClose: () => void;
}> = ({
  isDraftOrRejected,
  isCreator,
  canManageDoc,
  approvalStatus,
  isAssignedApprover,
  isApproved,
  isPublished,
  isActionBusy,
  submitLoading,
  reviewLoading,
  publishLoading,
  downloadUrl,
  onOpenSubmitModal,
  onOpenRejectModal,
  onApprove,
  onPublish,
  onOpenUploadVersion,
  onClose,
}) => {
  const canUploadVersion = isCreator || canManageDoc;
  const canDownload = Boolean(downloadUrl);
  const hasBothSecondary = canUploadVersion && canDownload;

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 w-full">
      {/* Cụm nút hành động chính (Trình duyệt, Duyệt, Ban hành) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
        {isDraftOrRejected && (isCreator || canManageDoc) && (
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenSubmitModal}
            loading={submitLoading}
            disabled={isActionBusy}
            leftIcon={<Send size={15} />}
            className="w-full sm:w-auto h-10.5 sm:h-8.5 rounded-xl sm:rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold sm:font-medium text-xs sm:text-xs cursor-pointer shadow-xs justify-center"
          >
            Trình duyệt tài liệu
          </Button>
        )}

        {approvalStatus === 'pending' && (isAssignedApprover || canManageDoc) && (
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
            <Button
              variant="danger"
              size="sm"
              onClick={onOpenRejectModal}
              disabled={isActionBusy}
              className="h-10.5 sm:h-8.5 rounded-xl sm:rounded-lg px-3 bg-[#ff245a] hover:bg-[#e61a4d] text-white font-semibold text-xs tracking-wide shadow-xs border-0 cursor-pointer justify-center"
            >
              Từ chối
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onApprove}
              loading={reviewLoading}
              disabled={isActionBusy}
              className="h-10.5 sm:h-8.5 rounded-xl sm:rounded-lg px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs tracking-wide shadow-xs border-0 cursor-pointer justify-center"
            >
              Duyệt đề xuất
            </Button>
          </div>
        )}

        {isApproved && !isPublished && canManageDoc && (
          <Button
            variant="outline"
            size="sm"
            onClick={onPublish}
            loading={publishLoading}
            disabled={isActionBusy}
            leftIcon={<Megaphone size={14} className="text-teal-600" />}
            className="w-full sm:w-auto h-10.5 sm:h-8.5 rounded-xl sm:rounded-lg border-teal-300 bg-teal-50/60 hover:bg-teal-50 text-teal-800 text-xs font-semibold sm:font-normal justify-center"
          >
            Ban hành văn bản
          </Button>
        )}
      </div>

      {/* Cụm nút phụ (Tải phiên bản mới, Tải tệp tin, Đóng) */}
      <div
        className={`${
          hasBothSecondary
            ? 'grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto'
            : 'flex items-center gap-2 w-full sm:w-auto justify-end'
        }`}
      >
        {canUploadVersion && (
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenUploadVersion}
            leftIcon={<UploadCloud size={15} className="text-white" />}
            disabled={isActionBusy}
            className="h-10.5 sm:h-8.5 rounded-xl sm:rounded-lg text-xs text-white px-2.5 sm:px-3 whitespace-nowrap justify-center flex-1 sm:flex-none shadow-xs"
          >
            Tải phiên bản mới
          </Button>
        )}
        {downloadUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(downloadUrl, '_blank', 'noopener,noreferrer')}
            leftIcon={<Download size={15} />}
            disabled={isActionBusy}
            className="h-10.5 sm:h-8.5 rounded-xl sm:rounded-lg text-xs px-2.5 sm:px-3 whitespace-nowrap bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 justify-center flex-1 sm:flex-none shadow-2xs"
          >
            Tải tệp tin
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          disabled={isActionBusy}
          className="hidden sm:inline-flex text-xs h-8.5 px-3 shrink-0"
        >
          Đóng
        </Button>
      </div>
    </div>
  );
};

export const SubmitApprovalModal: React.FC<{
  isOpen: boolean;
  loading: boolean;
  selectedApproverId: string;
  submitError: string | null;
  approverSelectOptions: { value: string; label: string }[];
  onApproverChange: (id: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}> = ({
  isOpen,
  loading,
  selectedApproverId,
  submitError,
  approverSelectOptions,
  onApproverChange,
  onClose,
  onConfirm,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={() => {
      if (!loading) onClose();
    }}
    size="md"
    title={
      <div className="flex items-center gap-2 text-slate-800">
        <Send className="text-primary" size={18} />
        <span className="font-semibold text-sm">Trình duyệt tài liệu</span>
      </div>
    }
  >
    <div className="flex flex-col gap-4 py-2 text-xs">
      <Select
        label="Người có thẩm quyền phê duyệt *"
        fullWidth
        value={selectedApproverId}
        onChange={(e) => onApproverChange(e.target.value)}
        options={approverSelectOptions}
        error={submitError || undefined}
        placeholder="-- Chọn người phê duyệt --"
      />
      <div className="flex justify-end gap-2.5 mt-2">
        <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={onConfirm}
          loading={loading}
          disabled={loading}
          leftIcon={<Send size={13} />}
        >
          Xác nhận trình duyệt
        </Button>
      </div>
    </div>
  </Modal>
);
