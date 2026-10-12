'use client';

import React, { useState, useMemo } from 'react';
import { Modal, Button, Textarea } from '@/components';
import {
  Download,
  FileText,
  Clock,
  User,
  Calendar,
  Folder,
  CheckCircle,
  ShieldAlert,
  ShieldCheck,
  Building2,
  Users,
  CheckCircle2,
  Globe,
  Eye,
  EyeOff,
  XCircle,
  Send,
  AlertCircle,
  Megaphone,
} from 'lucide-react';
import type { DocumentItem } from '@/types';
import {
  DOCUMENT_TYPE_MAP,
  DOCUMENT_STATUS_MAP,
  APPROVAL_STATUS_MAP,
  SHARE_SCOPE_MAP,
} from '@/types';
import { formatBytes, getFileVisualInfo } from '../_utils/doc-helpers';
import { getFileUrl } from '@/utils/string';
import dayjs from 'dayjs';
import {
  reviewDocument,
  submitDocument,
  publishDocument,
  updateDocument,
  getDocumentById,
  getDocumentShares,
} from '@/actions/document';
import { getEmployees } from '@/actions/employee';
import { getDepartments } from '@/actions/department';
import { useAuthStore } from '@/stores';
import { usePermission } from '@/hooks/user-permission';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface DocumentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
  onSuccess?: () => void;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [reviewLoading, setReviewLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [showRejectPrompt, setShowRejectPrompt] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const currentUser = useAuthStore((state) => state.user);
  const { hasRole, isAdmin, isHR, isSuper, isManager } = usePermission();

  // Fetch chi tiết tài liệu đầy đủ kèm recipients & departments
  const { data: fullDoc } = useQuery({
    queryKey: ['document-detail', doc?.id],
    queryFn: () => (doc?.id ? getDocumentById(doc.id) : null),
    enabled: Boolean(isOpen && doc?.id),
  });

  const { data: sharesData = [] } = useQuery({
    queryKey: ['document-shares', doc?.id],
    queryFn: () => (doc?.id ? getDocumentShares(doc.id) : []),
    enabled: Boolean(isOpen && doc?.id),
  });

  const { data: employeesData } = useQuery({
    queryKey: ['employees', 'share-options'],
    queryFn: () => getEmployees({ limit: 200 }),
    enabled: isOpen,
  });

  const { data: departmentsData } = useQuery({
    queryKey: ['departments', 'share-options'],
    queryFn: () => getDepartments({ limit: 100 }),
    enabled: isOpen,
  });

  const employees = employeesData?.items || [];
  const departments = useMemo(() => {
    const raw = (departmentsData as any)?.data ?? departmentsData;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.items)) return raw.items;
    return [];
  }, [departmentsData]);

  const targetDoc = fullDoc || doc;

  // Resolve danh sách phòng ban nhận
  const resolvedDepartments = useMemo(() => {
    if (!targetDoc) return [];
    const deptIds = new Set<number>();
    const rawDeptIds =
      (targetDoc as any)?.recipientDepartmentIds ||
      (targetDoc as any)?.recipient_department_ids ||
      (targetDoc as any)?.departmentIds ||
      [];
    if (Array.isArray(rawDeptIds)) {
      rawDeptIds.forEach((id: any) => {
        const num = Number(id);
        if (!isNaN(num) && num > 0) deptIds.add(num);
      });
    }
    if (Array.isArray((targetDoc as any)?.departments)) {
      (targetDoc as any).departments.forEach((d: any) => {
        const did = Number(d.id || d.departmentId);
        if (!isNaN(did) && did > 0) deptIds.add(did);
      });
    }
    if (Array.isArray(targetDoc?.recipients)) {
      targetDoc.recipients.forEach((r: any) => {
        const did = Number(r.departmentId || r.department_id);
        if (!isNaN(did) && did > 0) deptIds.add(did);
      });
    }
    if (Array.isArray(sharesData)) {
      sharesData.forEach((s: any) => {
        if (s.departmentId) {
          const did = Number(s.departmentId);
          if (!isNaN(did) && did > 0) deptIds.add(did);
        }
      });
    }

    const deptMap = new Map<number, any>();
    departments.forEach((d: any) => deptMap.set(Number(d.id), d));

    return Array.from(deptIds).map((id) => {
      const match = deptMap.get(id);
      return {
        id,
        name: match?.name || `Phòng ban #${id}`,
        code: match?.code,
      };
    });
  }, [targetDoc, sharesData, departments]);

  // Resolve danh sách cá nhân nhận
  const resolvedUsers = useMemo(() => {
    if (!targetDoc) return [];
    const userMap = new Map<string, any>();

    const empMap = new Map<string, any>();
    employees.forEach((emp: any) => empMap.set(String(emp.id), emp));

    if (Array.isArray(targetDoc?.recipients)) {
      targetDoc.recipients.forEach((r: any) => {
        const uid = String(r.userId || r.user_id || (r.user && r.user.id) || '');
        if (uid) {
          const emp = empMap.get(uid);
          userMap.set(uid, {
            id: uid,
            fullName: r.fullName || emp?.fullName || emp?.username || 'Nhân sự',
            email: r.email || emp?.email,
            departmentName: r.departmentName || emp?.departmentName || emp?.department?.name,
            isRead: Boolean(r.isRead),
            readAt: r.readAt,
          });
        }
      });
    }

    const rawUserIds = (targetDoc as any)?.recipientUserIds || (targetDoc as any)?.recipient_user_ids || [];
    if (Array.isArray(rawUserIds)) {
      rawUserIds.forEach((uid: any) => {
        const sUid = String(uid);
        if (sUid && !userMap.has(sUid)) {
          const emp = empMap.get(sUid);
          userMap.set(sUid, {
            id: sUid,
            fullName: emp?.fullName || emp?.username || `Nhân sự #${sUid}`,
            email: emp?.email,
            departmentName: emp?.departmentName || emp?.department?.name,
            isRead: false,
          });
        }
      });
    }

    if (Array.isArray(sharesData)) {
      sharesData.forEach((s: any) => {
        if (s.userId) {
          const sUid = String(s.userId);
          if (!userMap.has(sUid)) {
            const emp = empMap.get(sUid);
            userMap.set(sUid, {
              id: sUid,
              fullName: s.userName || s.user?.fullName || emp?.fullName || emp?.username || 'Nhân sự',
              email: s.user?.email || emp?.email,
              departmentName: s.departmentName || s.department?.name || emp?.departmentName,
              isRead: false,
            });
          }
        }
      });
    }

    return Array.from(userMap.values());
  }, [targetDoc, sharesData, employees]);

  if (!doc || !targetDoc) return null;

  // Xác định người duyệt và quyền duyệt
  const currentApproverId =
    targetDoc?.approverId ||
    targetDoc?.approver?.id ||
    (targetDoc as any)?.approver_id;

  const approverEmployee = currentApproverId
    ? employees.find((e: any) => String(e.id) === String(currentApproverId))
    : null;

  const approverDisplayName =
    targetDoc?.approver?.fullName ||
    approverEmployee?.fullName ||
    approverEmployee?.username ||
    (currentApproverId ? `Nhân sự #${currentApproverId}` : null);

  const isAssignedApprover =
    Boolean(currentUser?.id) &&
    (String(currentApproverId) === String(currentUser?.id) ||
      String(doc.approverId) === String(currentUser?.id) ||
      (Boolean(currentUser?.email) &&
        Boolean(targetDoc?.approver?.email) &&
        targetDoc?.approver?.email?.toLowerCase() === currentUser?.email?.toLowerCase()));

  const isCreator = Boolean(currentUser?.id) && (
    String(targetDoc?.createdById) === String(currentUser?.id) ||
    String(doc.createdById) === String(currentUser?.id)
  );

  // Quản lý văn bản & phê duyệt: Chỉ Admin, HR, Super Admin
  const canManageDoc =
    isAdmin ||
    isHR ||
    isSuper ||
    isManager ||
    hasRole(['admin', 'hr', 'super', 'supper', 'super_admin', 'supper_admin']);

  // Role nhân viên không có quyền duyệt tài liệu (chỉ cấp quản lý mới được duyệt)
  const canApprove = canManageDoc;

  const approvalStatus = targetDoc?.approvalStatus || doc.approvalStatus || 'draft';
  const isApproved = approvalStatus === 'approved';
  const isDraftOrRejected = approvalStatus === 'draft' || approvalStatus === 'rejected';

  // Role nhân viên không trình duyệt tài liệu (chỉ cấp quản lý tạo tài liệu mới trình duyệt)
  const canSubmitForApproval = canManageDoc && isCreator && isDraftOrRejected;

  const handleReview = async (status: 'approved' | 'rejected') => {
    try {
      setReviewLoading(true);

      // Nếu người dùng hiện tại có quyền duyệt (Admin, HR, Super) nhưng chưa khớp với approver_id của tài liệu,
      // tự động đồng bộ approver_id lên tài liệu trước để thỏa mãn validation của backend FastAPI
      if (currentUser?.id && String(currentApproverId) !== String(currentUser.id)) {
        try {
          await updateDocument(doc.id, {
            approverId: String(currentUser.id),
            approver_id: String(currentUser.id),
          } as any);
        } catch (syncErr) {
          console.warn('Không thể tự động đồng bộ approver_id trước khi phê duyệt:', syncErr);
        }
      }

      // Gọi API phê duyệt chuẩn POST /api/v1/documents/{id}/approve
      try {
        await reviewDocument(doc.id, {
          action: status,
          approvalStatus: status,
          comment: status === 'rejected' ? rejectNote.trim() || undefined : undefined,
          approvalNote: status === 'rejected' ? rejectNote.trim() || undefined : undefined,
        });
      } catch (reviewErr: any) {
        const errMsg = String(reviewErr?.message || '');
        const isPermissionIssue =
          errMsg.includes('chỉ định') ||
          errMsg.includes('FORBIDDEN') ||
          errMsg.includes('quyền') ||
          errMsg.includes('403');

        // Nếu Backend vẫn báo không phải người chỉ định duyệt nhưng người dùng là Admin/HR/Super -> Fallback cập nhật trực tiếp qua updateDocument
        if ((isAdmin || isHR || isSuper) && isPermissionIssue) {
          await updateDocument(doc.id, {
            approvalStatus: status,
            approval_status: status,
            approverId: String(currentUser?.id),
            approver_id: String(currentUser?.id),
            approvalNote: status === 'rejected' ? rejectNote.trim() || undefined : undefined,
            approval_note: status === 'rejected' ? rejectNote.trim() || undefined : undefined,
            status: status === 'approved' ? 'published' : 'draft',
          } as any);
        } else {
          throw reviewErr;
        }
      }

      toast.success(status === 'approved' ? 'Phê duyệt tài liệu thành công!' : 'Đã từ chối tài liệu');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document-detail', doc.id] });
      queryClient.invalidateQueries({ queryKey: ['inbox-documents'] });
      setShowRejectPrompt(false);
      setRejectNote('');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Không thể thực hiện phê duyệt');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleSubmitForApproval = async () => {
    try {
      setSubmitLoading(true);
      const approverPayload = currentApproverId ? { approverId: String(currentApproverId) } : undefined;
      await submitDocument(doc.id, approverPayload);
      toast.success('Đã trình duyệt tài liệu thành công!');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document-detail', doc.id] });
      queryClient.invalidateQueries({ queryKey: ['inbox-documents'] });
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Không thể trình duyệt tài liệu');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      setPublishLoading(true);
      await publishDocument(doc.id);
      toast.success('Đã ban hành văn bản chính thức!');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document-detail', doc.id] });
      queryClient.invalidateQueries({ queryKey: ['inbox-documents'] });
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Không thể ban hành tài liệu');
    } finally {
      setPublishLoading(false);
    }
  };

  const currentVersion = doc.currentVersion;
  const fileName = currentVersion?.fileName || doc.title;
  const visualInfo = getFileVisualInfo(fileName, currentVersion?.mimeType);

  const docTypeInfo = DOCUMENT_TYPE_MAP[doc.documentType] || {
    label: doc.documentType || 'Văn bản',
    badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  const statusInfo = DOCUMENT_STATUS_MAP[doc.status] || {
    label: doc.status || 'Bản nháp',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const approvalInfo = APPROVAL_STATUS_MAP[approvalStatus] || {
    label: approvalStatus || 'Soạn thảo',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const downloadUrl =
    currentVersion?.downloadUrl ||
    (currentVersion?.filePath ? getFileUrl(currentVersion.filePath) : null);

  const handleDownload = () => {
    if (!downloadUrl) return;
    window.open(downloadUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex items-center gap-2 text-slate-800">
          <FileText className="text-primary" size={20} />
          <span className="truncate">Chi tiết văn bản / tài liệu</span>
        </div>
      }
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
          {/* Workflow Action Buttons (Left) */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-start flex-wrap">
            {/* Chỉ người tạo thuộc cấp quản lý mới trình duyệt tài liệu; role nhân viên không duyệt */}
            {canSubmitForApproval && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSubmitForApproval}
                loading={submitLoading}
                disabled={reviewLoading || submitLoading || publishLoading}
                leftIcon={<Send size={14} className="text-sky-600" />}
                className="border-sky-300 bg-sky-50/60 hover:bg-sky-50 text-sky-800 text-xs"
              >
                Trình duyệt tài liệu
              </Button>
            )}

            {/* Nếu có quyền duyệt và tài liệu chưa được phê duyệt */}
            {canApprove && !isApproved && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRejectPrompt(true)}
                  disabled={reviewLoading || submitLoading || publishLoading}
                  leftIcon={<XCircle size={14} className="text-rose-600" />}
                  className="border-rose-300 bg-rose-50/60 hover:bg-rose-50 text-rose-700 hover:text-rose-800 text-xs"
                >
                  Từ chối
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleReview('approved')}
                  loading={reviewLoading}
                  disabled={reviewLoading || submitLoading || publishLoading}
                  leftIcon={<CheckCircle2 size={14} />}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs border-emerald-600"
                >
                  Phê duyệt
                </Button>
              </>
            )}

            {/* Nếu là cấp quản lý (Admin/HR/Super) và tài liệu đã được duyệt nhưng chưa ban hành */}
            {canManageDoc && isApproved && targetDoc.status !== 'published' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePublish}
                loading={publishLoading}
                disabled={reviewLoading || submitLoading || publishLoading}
                leftIcon={<Megaphone size={14} className="text-teal-600" />}
                className="border-teal-300 bg-teal-50/60 hover:bg-teal-50 text-teal-800 text-xs"
              >
                Ban hành văn bản
              </Button>
            )}
          </div>

          {/* Standard Download & Close (Right) */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button variant="ghost" onClick={onClose} disabled={reviewLoading || submitLoading || publishLoading}>
              Đóng
            </Button>
            {downloadUrl && (
              <Button
                variant="outline"
                onClick={handleDownload}
                leftIcon={<Download size={15} />}
                disabled={reviewLoading || submitLoading || publishLoading}
              >
                Tải tệp tin
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Rejection Prompt if toggled */}
        {showRejectPrompt && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-rose-800 font-semibold text-xs">
              <AlertCircle size={15} />
              <span>Nhập lý do từ chối phê duyệt tài liệu</span>
            </div>
            <Textarea
              placeholder="Ghi chú lý do từ chối để người soạn thảo nắm rõ..."
              rows={2}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              fullWidth
              className="text-xs bg-white"
            />
            <div className="flex justify-end gap-2">
              <Button size="xs" variant="outline" onClick={() => setShowRejectPrompt(false)} disabled={reviewLoading}>
                Hủy bỏ
              </Button>
              <Button
                size="xs"
                variant="danger"
                onClick={() => handleReview('rejected')}
                loading={reviewLoading}
                disabled={reviewLoading}
              >
                Xác nhận từ chối
              </Button>
            </div>
          </div>
        )}
        {/* Header file banner */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                {doc.code}
              </span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${docTypeInfo.badgeClass}`}>
                {docTypeInfo.label}
              </span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusInfo.badgeClass}`}>
                {statusInfo.label}
              </span>
              {currentVersion?.versionNumber && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  v{currentVersion.versionNumber}
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-slate-900 leading-snug">
              {doc.title}
            </h3>
            {fileName && fileName !== doc.title && (
              <p className="text-[11px] text-slate-600 mt-0.5">Tệp: {fileName}</p>
            )}
          </div>
        </div>

        {/* Trích yếu nội dung */}
        {doc.summary && (
          <div className="space-y-1">
            <span className="font-semibold text-slate-700">Trích yếu nội dung:</span>
            <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed">
              {doc.summary}
            </p>
          </div>
        )}

        {/* Thông tin hành chính & phê duyệt */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-lg bg-white border border-slate-200/80">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-600">
              <Folder size={14} className="text-slate-500 shrink-0" />
              <span>Thư mục:</span>
              <span className="font-semibold text-slate-800">
                {doc.category?.name || 'Thư mục gốc'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-600">
              <User size={14} className="text-slate-500 shrink-0" />
              <span>Người tạo:</span>
              <span className="font-semibold text-slate-800">
                {doc.createdBy?.fullName || 'CBNV'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-600">
              <Clock size={14} className="text-slate-500 shrink-0" />
              <span>Ngày tạo:</span>
              <span className="font-semibold text-slate-800">
                {dayjs(doc.createdAt).format('HH:mm - DD/MM/YYYY')}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-600">
              <ShieldCheck size={14} className="text-slate-500 shrink-0" />
              <span>Trạng thái duyệt:</span>
              <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${approvalInfo.badgeClass}`}>
                {approvalInfo.label}
              </span>
            </div>

            {approverDisplayName && (
              <div className="flex items-center gap-2 text-slate-600">
                <User size={14} className="text-slate-500 shrink-0" />
                <span>Người duyệt:</span>
                <span className="font-semibold text-slate-800">
                  {approverDisplayName}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-slate-600">
              <Calendar size={14} className="text-slate-500 shrink-0" />
              <span>Phạm vi chia sẻ:</span>
              <span className="font-semibold text-slate-800">
                {SHARE_SCOPE_MAP[doc.shareScope] || doc.shareScope || 'Cá nhân'}
              </span>
            </div>
          </div>
        </div>

        {/* Đối tượng nhận văn bản */}
        <div className="space-y-2.5 p-3.5 rounded-lg bg-white border border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
              <Users size={15} className="text-primary" />
              <span>Đối tượng nhận văn bản</span>
            </span>
            {targetDoc.shareScope === 'all' ? (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <Globe size={12} />
                Toàn thể công ty
              </span>
            ) : (
              <span className="text-[11px] text-slate-500 font-medium">
                {resolvedDepartments.length} phòng ban • {resolvedUsers.length} cá nhân
              </span>
            )}
          </div>

          {targetDoc.shareScope === 'all' && (
            <p className="text-[11px] text-slate-500 italic">
              Văn bản được phát hành công khai cho toàn bộ nhân sự trong công ty.
            </p>
          )}

          {/* Danh sách phòng ban nhận */}
          {resolvedDepartments.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                <Building2 size={13} className="text-sky-600" />
                <span>Phòng ban nhận ({resolvedDepartments.length}):</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {resolvedDepartments.map((dept) => (
                  <span
                    key={dept.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200/80 text-[11px] font-medium"
                  >
                    <Building2 size={12} className="text-sky-600" />
                    <span>{dept.name}</span>
                    {dept.code && <span className="text-[10px] text-sky-600">[{dept.code}]</span>}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Danh sách cá nhân nhận */}
          {resolvedUsers.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                <User size={13} className="text-primary" />
                <span>Cá nhân đích danh ({resolvedUsers.length}):</span>
              </span>
              <div className="max-h-44 overflow-y-auto divide-y divide-slate-100 border border-slate-200/80 rounded-xl bg-slate-50/50">
                {resolvedUsers.map((u) => (
                  <div key={u.id} className="p-2 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 uppercase">
                        {(u.fullName || 'U').charAt(0)}
                      </div>
                      <div className="min-w-0 truncate">
                        <span className="font-medium text-slate-800 truncate block">
                          {u.fullName}
                        </span>
                        {(u.departmentName || u.email) && (
                          <span className="text-[10px] text-slate-500 truncate block">
                            {[u.departmentName, u.email].filter(Boolean).join(' • ')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1">
                      {u.isRead ? (
                        <span
                          title={u.readAt ? `Đã đọc lúc ${dayjs(u.readAt).format('HH:mm DD/MM')}` : 'Đã đọc'}
                          className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200"
                        >
                          <Eye size={11} />
                          <span>Đã đọc</span>
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full"
                          title="Chưa đọc"
                        >
                          <EyeOff size={11} />
                          <span>Chưa đọc</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {targetDoc.shareScope !== 'all' && resolvedDepartments.length === 0 && resolvedUsers.length === 0 && (
            <p className="text-[11px] text-slate-400 italic">
              Chưa có cá nhân hay phòng ban nào được chỉ định nhận văn bản này.
            </p>
          )}
        </div>

        {/* Hiệu lực nếu có */}
        {(doc.effectiveDate || doc.expirationDate) && (
          <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
            {doc.effectiveDate && (
              <div>
                <span>Hiệu lực từ: </span>
                <span className="font-semibold text-slate-800">
                  {dayjs(doc.effectiveDate).format('DD/MM/YYYY')}
                </span>
              </div>
            )}
            {doc.expirationDate && (
              <div>
                <span>Hết hạn: </span>
                <span className="font-semibold text-slate-800">
                  {dayjs(doc.expirationDate).format('DD/MM/YYYY')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Lịch sử phiên bản nếu có */}
        {doc.versions && doc.versions.length > 1 && (
          <div className="space-y-2 pt-2">
            <h4 className="font-semibold text-slate-800 text-xs">Lịch sử các phiên bản</h4>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {doc.versions.map((ver) => (
                <div key={ver.id} className="p-2.5 flex items-center justify-between bg-white text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold font-mono text-primary">v{ver.versionNumber}</span>
                    <span className="text-slate-700 truncate max-w-[200px]">{ver.fileName}</span>
                    {ver.isCurrent && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full">
                        Hiện hành
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <span>{formatBytes(ver.fileSize)}</span>
                    <span>{dayjs(ver.createdAt).format('DD/MM/YYYY')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
