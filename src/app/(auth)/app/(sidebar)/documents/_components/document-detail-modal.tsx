'use client';

import React, { useState, useMemo } from 'react';
import { Modal, Button, Textarea, Select } from '@/components';
import { RejectDocumentModal } from './reject-document-modal';
import { UploadVersionModal } from './upload-version-modal';
import {
  Download,
  FileText,
  Clock,
  User,
  Calendar,
  Folder,
  ShieldCheck,
  Building2,
  Users,
  Globe,
  Eye,
  EyeOff,
  AlertCircle,
  Megaphone,
  Send,
  UploadCloud,
  Edit3,
  Trash2,
  Share2,
} from 'lucide-react';
import type { DocumentItem } from '@/types';
import { DOCUMENT_TYPE_MAP, DOCUMENT_STATUS_MAP, APPROVAL_STATUS_MAP, SHARE_SCOPE_MAP } from '@/types';
import { formatBytes, getFileVisualInfo, isApproverEligible, getApproverRoleBadge } from '../_utils/doc-helpers';
import { getFileUrl } from '@/utils/string';
import dayjs from 'dayjs';
import { reviewDocument, submitDocument, publishDocument, updateDocument, getDocumentById } from '@/actions/document';
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

  // Fetch chi tiết tài liệu đầy đủ kèm recipients & departments
  const { data: fullDoc } = useQuery({
    queryKey: ['document-detail', doc?.id],
    queryFn: () => (doc?.id ? getDocumentById(doc.id) : null),
    enabled: Boolean(isOpen && doc?.id),
  });

  const targetDoc = fullDoc || doc;

  const sharesData = useMemo(() => {
    if (Array.isArray(targetDoc?.recipients)) {
      return targetDoc.recipients.map((r: any) => ({
        id: r.id || r.userId,
        userId: r.userId,
        userName: r.fullName,
        departmentId: r.departmentId,
        departmentName: r.departmentName,
      }));
    }
    return [];
  }, [targetDoc]);

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

  // Resolve danh sách phòng ban nhận
  const resolvedDepartments = useMemo(() => {
    if (!targetDoc) return [];
    const deptIds = new Set<number>();
    const rawDeptIds =
      (targetDoc as any)?.recipientDepartmentIds || (targetDoc as any)?.departmentIds || [];
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
        const did = Number(r.departmentId);
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
        const uid = String(r.userId || (r.user && r.user.id) || '');
        if (uid) {
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

    if (Array.isArray(sharesData)) {
      sharesData.forEach((s: any) => {
        if (s.userId) {
          const sUid = String(s.userId);
          if (!userMap.has(sUid)) {
            const emp = empMap.get(sUid);
            userMap.set(sUid, {
              id: sUid,
              fullName: s.userName || s.user?.fullName || emp?.fullName || emp?.username || 'Nhân sự',
              code: emp?.identifyCode || emp?.code || (s as any)?.code,
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

  const approverSelectOptions = useMemo(() => {
    const eligibleApprovers = employees.filter(isApproverEligible);
    const unique = eligibleApprovers.filter(
      (emp: any, index: number, self: any[]) => index === self.findIndex((t: any) => String(t.id) === String(emp.id)),
    );
    return [
      { value: '', label: '-- Chọn người phê duyệt --' },
      ...unique.map((emp: any) => {
        const roleName = getApproverRoleBadge(emp);
        return {
          value: String(emp.id),
          label: `${emp.fullName || emp.username} (${roleName})`,
        };
      }),
    ];
  }, [employees]);

  if (!doc || !targetDoc) return null;

  // Xác định người duyệt và quyền duyệt
  const currentApproverId = targetDoc?.approverId || targetDoc?.approver?.id;

  const approverEmployee = currentApproverId ? employees.find((e: any) => String(e.id) === String(currentApproverId)) : null;

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

  const isCreator =
    Boolean(currentUser?.id) && (String(targetDoc?.createdById) === String(currentUser?.id) || String(doc.createdById) === String(currentUser?.id));

  // Quản lý văn bản & phê duyệt: Chỉ Admin, HR, Super Admin
  const canManageDoc = isAdmin || isHR || isSuper || isManager || hasRole(['admin', 'hr', 'super', 'supper', 'super_admin', 'supper_admin']);

  // Role nhân viên không có quyền duyệt tài liệu (chỉ cấp quản lý mới được duyệt)
  const canApprove = canManageDoc;

  const approvalStatus = targetDoc?.approvalStatus || doc.approvalStatus || 'draft';
  const isApproved = approvalStatus === 'approved';
  const isDraftOrRejected = approvalStatus === 'draft' || approvalStatus === 'rejected';

  const handleReview = async (status: 'approved' | 'rejected', note?: string) => {
    try {
      setReviewLoading(true);
      const reviewNote = status === 'rejected' ? note?.trim() || undefined : undefined;

      await reviewDocument(doc.id, {
        action: status,
        approvalStatus: status,
        comment: reviewNote,
        approvalNote: reviewNote,
      });

      toast.success(status === 'approved' ? 'Phê duyệt tài liệu thành công!' : 'Đã từ chối tài liệu');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document-detail', doc.id] });
      queryClient.invalidateQueries({ queryKey: ['inbox-documents'] });
      setIsRejectModalOpen(false);
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Không thể thực hiện phê duyệt');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleOpenSubmitModal = () => {
    setSelectedApproverId(currentApproverId ? String(currentApproverId) : '');
    setSubmitError(null);
    setIsSubmitModalOpen(true);
  };

  const handleConfirmSubmitForApproval = async () => {
    if (!selectedApproverId) {
      setSubmitError('Vui lòng chọn người phê duyệt tài liệu');
      return;
    }

    try {
      setSubmitLoading(true);
      // Đồng bộ cập nhật người duyệt vào tài liệu nếu khác người duyệt hiện tại
      if (selectedApproverId !== String(currentApproverId)) {
        try {
          await updateDocument(doc.id, { approverId: selectedApproverId });
        } catch (updateErr) {
          console.warn('Could not pre-update approverId:', updateErr);
        }
      }

      await submitDocument(doc.id, { approverId: selectedApproverId });
      toast.success('Đã trình duyệt tài liệu thành công!');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['documents', 'rules'] });
      queryClient.invalidateQueries({ queryKey: ['document-detail', doc.id] });
      queryClient.invalidateQueries({ queryKey: ['inbox-documents'] });
      setIsSubmitModalOpen(false);
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

  const downloadUrl = currentVersion?.downloadUrl || (currentVersion?.filePath ? getFileUrl(currentVersion.filePath) : null);

  const handleDownload = () => {
    if (!downloadUrl) return;
    window.open(downloadUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
        title={
          <div className="flex items-center gap-2 text-slate-800 min-w-0">
            <FileText className="text-primary shrink-0" size={20} />
            <span className="truncate">{doc?.title ? `Chi tiết: ${doc.title}` : 'Chi tiết văn bản / tài liệu'}</span>
          </div>
        }
        footer={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 w-full">
            {/* Cụm nút Quy trình & Sửa / Xóa (Trái) */}
            <div className="flex items-center gap-2 flex-wrap justify-start">
              {/* 1. Trình duyệt tài liệu: khi ở trạng thái draft hoặc rejected */}
              {isDraftOrRejected && (isCreator || canManageDoc) && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleOpenSubmitModal}
                  loading={submitLoading}
                  disabled={reviewLoading || submitLoading || publishLoading}
                  leftIcon={<Send size={13} />}
                  className="bg-primary hover:bg-primary/90 text-white font-medium text-xs cursor-pointer h-8.5"
                >
                  Trình duyệt tài liệu
                </Button>
              )}

              {/* 2. Phê duyệt hoặc Từ chối: chỉ khi ở trạng thái pending và là người được chỉ định hoặc Admin/HR */}
              {approvalStatus === 'pending' && (isAssignedApprover || canManageDoc) && (
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setIsRejectModalOpen(true)}
                    disabled={reviewLoading || submitLoading || publishLoading}
                    className="px-3 rounded-lg bg-[#ff245a] hover:bg-[#e61a4d] text-white font-semibold text-xs tracking-wide shadow-xs border-0 cursor-pointer h-8.5"
                  >
                    Từ chối
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleReview('approved')}
                    loading={reviewLoading}
                    disabled={reviewLoading || submitLoading || publishLoading}
                    className="px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs tracking-wide shadow-xs border-0 cursor-pointer h-8.5"
                  >
                    Duyệt đề xuất
                  </Button>
                </div>
              )}

              {/* 3. Ban hành văn bản chính thức: khi đã duyệt nhưng chưa ban hành */}
              {isApproved && targetDoc.status !== 'published' && canManageDoc && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePublish}
                  loading={publishLoading}
                  disabled={reviewLoading || submitLoading || publishLoading}
                  leftIcon={<Megaphone size={13} className="text-teal-600" />}
                  className="border-teal-300 bg-teal-50/60 hover:bg-teal-50 text-teal-800 text-xs h-8.5"
                >
                  Ban hành văn bản
                </Button>
              )}

              {/* Nút Sửa ở footer */}
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(doc)}
                  leftIcon={<Edit3 size={13} className="text-primary" />}
                  className="h-8.5 px-3 text-xs text-primary border-primary/30 hover:bg-primary/5 font-semibold"
                >
                  Sửa
                </Button>
              )}

              {/* Nút Xóa ở footer */}
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(doc)}
                  leftIcon={<Trash2 size={13} className="text-rose-600" />}
                  className="h-8.5 px-3 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 font-semibold"
                >
                  Xóa
                </Button>
              )}
            </div>

            {/* Cụm nút Tải phiên bản, Tải tệp tin & Đóng (Phải) */}
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {(isCreator || canManageDoc) && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsUploadVersionOpen(true)}
                  leftIcon={<UploadCloud size={13} className="text-white" />}
                  disabled={reviewLoading || submitLoading || publishLoading}
                  className="text-xs text-white h-8.5 px-2.5 sm:px-3 whitespace-nowrap shrink-0"
                >
                  Tải phiên bản mới
                </Button>
              )}
              {downloadUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  leftIcon={<Download size={13} />}
                  disabled={reviewLoading || submitLoading || publishLoading}
                  className="text-xs h-8.5 px-2.5 sm:px-3 whitespace-nowrap shrink-0"
                >
                  Tải tệp tin
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                disabled={reviewLoading || submitLoading || publishLoading}
                className="text-xs h-8.5 px-3 shrink-0"
              >
                Đóng
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          {/* Ảnh 2: Đối tượng nhận văn bản (Đưa lên đầu) */}
          <div className="space-y-2.5 p-3.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                <Users size={15} className="text-primary" />
                <span>Đối tượng nhận văn bản</span>
              </span>
              {targetDoc.shareScope === 'all' ? (
                <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20 flex items-center gap-1">
                  <Globe size={12} className="text-primary" />
                  Toàn thể công ty
                </span>
              ) : (
                <span className="text-[11px] text-slate-500 font-medium">
                  {resolvedDepartments.length} phòng ban • {resolvedUsers.length} cá nhân
                </span>
              )}
            </div>

            {targetDoc.shareScope === 'all' && (
              <p className="text-[11px] text-slate-500 italic">Văn bản được phát hành công khai cho toàn bộ nhân sự trong công ty.</p>
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
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-medium text-slate-800 truncate block">{u.fullName}</span>
                            {u.code && (
                              <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 text-[10px] rounded font-mono font-medium border border-slate-200 shrink-0">
                                {u.code}
                              </span>
                            )}
                          </div>
                          {(u.departmentName || u.email) && (
                            <span className="text-[10px] text-slate-500 truncate block">
                              {[u.email, u.departmentName].filter(Boolean).join(' • ')}
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
              <p className="text-[11px] text-slate-400 italic">Chưa có cá nhân hay phòng ban nào được chỉ định nhận văn bản này.</p>
            )}
          </div>

          {/* Thông tin hành chính & phê duyệt */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-lg bg-white border border-slate-200/80">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-600">
                <Folder size={14} className="text-slate-500 shrink-0" />
                <span>Thư mục:</span>
                <span className="font-semibold text-slate-800">{doc.category?.name || 'Thư mục gốc'}</span>
              </div>

              <div className="flex items-center gap-2 text-slate-600">
                <User size={14} className="text-slate-500 shrink-0" />
                <span>Người tạo:</span>
                <span className="font-semibold text-slate-800">{doc.createdBy?.fullName || 'CBNV'}</span>
              </div>

              <div className="flex items-center gap-2 text-slate-600">
                <Clock size={14} className="text-slate-500 shrink-0" />
                <span>Ngày tạo:</span>
                <span className="font-semibold text-slate-800">{dayjs(doc.createdAt).format('HH:mm - DD/MM/YYYY')}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-600">
                <ShieldCheck size={14} className="text-slate-500 shrink-0" />
                <span>Trạng thái duyệt:</span>
                <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${approvalInfo.badgeClass}`}>{approvalInfo.label}</span>
              </div>

              {approverDisplayName && (
                <div className="flex items-center gap-2 text-slate-600">
                  <User size={14} className="text-slate-500 shrink-0" />
                  <span>Người duyệt:</span>
                  <span className="font-semibold text-slate-800">{approverDisplayName}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-slate-600">
                <Calendar size={14} className="text-slate-500 shrink-0" />
                <span>Phạm vi chia sẻ:</span>
                <span className="font-semibold text-slate-800">{SHARE_SCOPE_MAP[doc.shareScope] || doc.shareScope || 'Cá nhân'}</span>
              </div>
            </div>
          </div>

          {/* Trích yếu nội dung */}
          {doc.summary && (
            <div className="space-y-1">
              <span className="font-semibold text-slate-700">Trích yếu nội dung:</span>
              <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed">{doc.summary}</p>
            </div>
          )}

          {/* Hiệu lực nếu có */}
          {(doc.effectiveDate || doc.expirationDate) && (
            <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
              {doc.effectiveDate && (
                <div>
                  <span>Hiệu lực từ: </span>
                  <span className="font-semibold text-slate-800">{dayjs(doc.effectiveDate).format('DD/MM/YYYY')}</span>
                </div>
              )}
              {doc.expirationDate && (
                <div>
                  <span>Hết hạn: </span>
                  <span className="font-semibold text-slate-800">{dayjs(doc.expirationDate).format('DD/MM/YYYY')}</span>
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
                      {ver.isCurrent && <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full">Hiện hành</span>}
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

          {/* Ảnh đầu tiên: Thẻ thao tác & Thông tin văn bản (Để ở dưới cùng) */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-br from-slate-50 via-white to-slate-50 border border-slate-200 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-[10px] sm:text-[11px] font-semibold px-2 sm:px-2.5 py-0.5 rounded-md border ${docTypeInfo.badgeClass}`}>
                  {docTypeInfo.label}
                </span>
                {doc.code && (
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                    Số: {doc.code}
                  </span>
                )}
                <span className={`text-[10px] sm:text-[11px] font-semibold px-2 sm:px-2.5 py-0.5 rounded border ${statusInfo.badgeClass}`}>
                  {statusInfo.label}
                </span>
              </div>

              {/* Các nút hành động: Xem trước, Chia sẻ, Sửa, Xóa */}
              <div className="flex items-center gap-1.5 shrink-0">
                {onPreview && (
                  <button
                    type="button"
                    onClick={() => onPreview(doc)}
                    className="inline-flex items-center gap-1 h-7.5 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors shadow-2xs cursor-pointer"
                    title="Xem trước tài liệu"
                  >
                    <Eye size={13} className="text-primary" />
                    <span className="hidden sm:inline">Xem trước</span>
                  </button>
                )}

                {onShare && (
                  <button
                    type="button"
                    onClick={() => onShare(doc)}
                    className="inline-flex items-center justify-center w-7.5 h-7.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs cursor-pointer"
                    title="Chia sẻ văn bản"
                  >
                    <Share2 size={13} />
                  </button>
                )}

                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(doc)}
                    className="inline-flex items-center gap-1 h-7.5 px-2.5 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
                    title="Chỉnh sửa văn bản"
                  >
                    <Edit3 size={13} />
                    <span>Sửa</span>
                  </button>
                )}

                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(doc)}
                    className="inline-flex items-center gap-1 h-7.5 px-2.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
                    title="Xóa văn bản"
                  >
                    <Trash2 size={13} />
                    <span>Xóa</span>
                  </button>
                )}
              </div>
            </div>

            {/* Tiêu đề văn bản */}
            <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
              {doc.title}
            </h3>
          </div>
        </div>
      </Modal>

      {/* Modal xác nhận từ chối phê duyệt (Form Modal có Zod validate) */}
      <RejectDocumentModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        documentTitle={targetDoc?.title}
        onConfirm={(reason) => handleReview('rejected', reason)}
        loading={reviewLoading}
      />

      {/* Modal tải lên phiên bản mới */}
      <UploadVersionModal
        isOpen={isUploadVersionOpen}
        onClose={() => setIsUploadVersionOpen(false)}
        document={targetDoc}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['document-detail', doc.id] });
          queryClient.invalidateQueries({ queryKey: ['documents'] });
          onSuccess?.();
        }}
      />

      {/* Modal Chọn người duyệt khi ấn Trình duyệt tài liệu */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => {
          if (!submitLoading) {
            setIsSubmitModalOpen(false);
            setSubmitError(null);
          }
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
          <div>
            <Select
              label="Người có thẩm quyền phê duyệt *"
              fullWidth
              value={selectedApproverId}
              onChange={(e) => {
                setSelectedApproverId(e.target.value);
                if (submitError) setSubmitError(null);
              }}
              options={approverSelectOptions}
              error={submitError || undefined}
              placeholder="-- Chọn người phê duyệt --"
            />
          </div>

          <div className="flex justify-end gap-2.5 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSubmitModalOpen(false)}
              disabled={submitLoading}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmSubmitForApproval}
              loading={submitLoading}
              disabled={submitLoading}
              leftIcon={<Send size={13} />}
            >
              Xác nhận trình duyệt
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
