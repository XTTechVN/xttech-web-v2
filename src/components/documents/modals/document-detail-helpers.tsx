'use client';

import React from 'react';
import { Download, Edit3,Check, Megaphone, Send, UploadCloud, X } from 'lucide-react';
import { Button, Modal, Select, Tooltip } from '@/components';
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
  canEditDoc?: boolean;
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
  onEdit?: () => void;
  onClose: () => void;
}> = ({
  isDraftOrRejected,
  isCreator,
  canManageDoc,
  canEditDoc = false,
  approvalStatus,
  isAssignedApprover,
  isApproved,
  isPublished,
  isActionBusy,
  submitLoading,
  reviewLoading,
  publishLoading,
  onOpenSubmitModal,
  onOpenRejectModal,
  onApprove,
  onPublish,
  onOpenUploadVersion,
  onEdit,
  onClose,
}) => {
  const canUploadVersion = isCreator || canManageDoc;
  const canSubmit = isDraftOrRejected && (isCreator || canManageDoc);
  const isPending = approvalStatus === 'pending' && (isAssignedApprover || canManageDoc);
  const canPublishDoc = isApproved && !isPublished && canManageDoc;

  return (
    <div className="flex items-center justify-end gap-2 w-full">
      {/* 1. Trình duyệt tài liệu */}
      {canSubmit && (
        <Tooltip content="Trình duyệt tài liệu" position="top">
          <button
            type="button"
            onClick={onOpenSubmitModal}
            disabled={isActionBusy || submitLoading}
            title="Trình duyệt tài liệu"
            className="w-10 h-10 sm:w-auto sm:h-9 sm:px-3.5 rounded-xl sm:rounded-lg bg-primary hover:bg-primary/90 active:scale-95 text-white flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50 font-medium text-xs shrink-0"
          >
            <Send size={16} className="shrink-0" />
            <span className="hidden sm:inline">Trình duyệt tài liệu</span>
          </button>
        </Tooltip>
      )}

      {/* 2. Chờ duyệt: Từ chối & Duyệt đề xuất */}
      {isPending && (
        <>
          <Tooltip content="Từ chối đề xuất" position="top">
            <button
              type="button"
              onClick={onOpenRejectModal}
              disabled={isActionBusy}
              title="Từ chối"
              className="w-10 h-10 sm:w-auto sm:h-9 sm:px-3.5 rounded-xl sm:rounded-lg bg-[#ff245a] hover:bg-[#e61a4d] active:scale-95 text-white flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50 font-semibold text-xs shrink-0"
            >
              <X size={16} className="shrink-0" />
              <span className="hidden sm:inline">Từ chối</span>
            </button>
          </Tooltip>

          <Tooltip content="Duyệt đề xuất" position="top">
            <button
              type="button"
              onClick={onApprove}
              disabled={isActionBusy || reviewLoading}
              title="Duyệt đề xuất"
              className="w-10 h-10 sm:w-auto sm:h-9 sm:px-3.5 rounded-xl sm:rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50 font-semibold text-xs shrink-0"
            >
              <Check size={16} className="shrink-0" />
              <span className="hidden sm:inline">Duyệt đề xuất</span>
            </button>
          </Tooltip>
        </>
      )}

      {/* 3. Ban hành văn bản */}
      {canPublishDoc && (
        <Tooltip content="Ban hành văn bản" position="top">
          <button
            type="button"
            onClick={onPublish}
            disabled={isActionBusy || publishLoading}
            title="Ban hành văn bản"
            className="w-10 h-10 sm:w-auto sm:h-9 sm:px-3.5 rounded-xl sm:rounded-lg border border-teal-300 bg-teal-50/70 hover:bg-teal-100 text-teal-800 flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50 font-semibold text-xs shrink-0"
          >
            <Megaphone size={16} className="shrink-0 text-teal-600" />
            <span className="hidden sm:inline">Ban hành văn bản</span>
          </button>
        </Tooltip>
      )}

      {/* 4. Tải phiên bản mới */}
      {canUploadVersion && (
        <Tooltip content="Tải phiên bản mới" position="top">
          <button
            type="button"
            onClick={onOpenUploadVersion}
            disabled={isActionBusy}
            title="Tải phiên bản mới"
            className="w-10 h-10 sm:w-auto sm:h-9 sm:px-3.5 rounded-xl sm:rounded-lg border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 hover:text-slate-900 flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-50 font-medium text-xs shrink-0"
          >
            <UploadCloud size={16} className="shrink-0" />
            <span className="hidden sm:inline">Tải phiên bản mới</span>
          </button>
        </Tooltip>
      )}

      {/* 5. Nút Đóng trên desktop */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        disabled={isActionBusy}
        className="hidden sm:inline-flex text-xs h-9 px-3 shrink-0"
      >
        Đóng
      </Button>
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
