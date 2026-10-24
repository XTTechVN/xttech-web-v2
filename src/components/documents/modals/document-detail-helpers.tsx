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
}) => (
  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 w-full">
    <div className="flex items-center gap-2 flex-wrap justify-start">
      {isDraftOrRejected && (isCreator || canManageDoc) && (
        <Button
          variant="primary"
          size="sm"
          onClick={onOpenSubmitModal}
          loading={submitLoading}
          disabled={isActionBusy}
          leftIcon={<Send size={13} />}
          className="bg-primary hover:bg-primary/90 text-white font-medium text-xs cursor-pointer h-8.5"
        >
          Trình duyệt tài liệu
        </Button>
      )}

      {approvalStatus === 'pending' && (isAssignedApprover || canManageDoc) && (
        <div className="flex items-center gap-1.5">
          <Button
            variant="danger"
            size="sm"
            onClick={onOpenRejectModal}
            disabled={isActionBusy}
            className="px-3 rounded-lg bg-[#ff245a] hover:bg-[#e61a4d] text-white font-semibold text-xs tracking-wide shadow-xs border-0 cursor-pointer h-8.5"
          >
            Từ chối
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onApprove}
            loading={reviewLoading}
            disabled={isActionBusy}
            className="px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs tracking-wide shadow-xs border-0 cursor-pointer h-8.5"
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
          leftIcon={<Megaphone size={13} className="text-teal-600" />}
          className="border-teal-300 bg-teal-50/60 hover:bg-teal-50 text-teal-800 text-xs h-8.5"
        >
          Ban hành văn bản
        </Button>
      )}
    </div>

    <div className="flex items-center gap-2 flex-wrap justify-end">
      {(isCreator || canManageDoc) && (
        <Button
          variant="primary"
          size="sm"
          onClick={onOpenUploadVersion}
          leftIcon={<UploadCloud size={13} className="text-white" />}
          disabled={isActionBusy}
          className="text-xs text-white h-8.5 px-2.5 sm:px-3 whitespace-nowrap shrink-0"
        >
          Tải phiên bản mới
        </Button>
      )}
      {downloadUrl && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(downloadUrl, '_blank', 'noopener,noreferrer')}
          leftIcon={<Download size={13} />}
          disabled={isActionBusy}
          className="text-xs h-8.5 px-2.5 sm:px-3 whitespace-nowrap shrink-0"
        >
          Tải tệp tin
        </Button>
      )}
      <Button variant="ghost" size="sm" onClick={onClose} disabled={isActionBusy} className="text-xs h-8.5 px-3 shrink-0">
        Đóng
      </Button>
    </div>
  </div>
);

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
