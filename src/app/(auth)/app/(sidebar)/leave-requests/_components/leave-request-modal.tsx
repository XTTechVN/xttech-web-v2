/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Modal, Input, Select, Textarea, Button, Avatar, Badge } from '@/components';
import { FileText, Upload, X, CheckCircle2, XCircle, Pencil, Trash2, Download, Eye } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLeaveRequestStore } from '@/stores/useLeaveRequestStore';
import { createLeaveRequest, updateLeaveRequest, deleteLeaveRequest, reviewLeaveRequest } from '@/actions/leave-request';
import { getWorkShifts } from '@/actions/work-shift';
import { LeaveType, DurationType, LeaveRequestStatus } from '@/types';
import { BASE_MINIO_URL } from '@/config';
import toast from 'react-hot-toast';
import LeaveRequestReviewModal from './leave-request-review-modal';

export const leaveTypeOptions = [
  { value: LeaveType.ANNUAL, label: 'Nghỉ phép năm' },
  { value: LeaveType.UNPAID, label: 'Nghỉ không lương' },
  { value: LeaveType.SICK, label: 'Nghỉ ốm đau' },
  { value: LeaveType.MATERNITY, label: 'Nghỉ thai sản' },
  { value: LeaveType.WEDDING, label: 'Nghỉ kết hôn' },
  { value: LeaveType.BEREAVEMENT, label: 'Nghỉ tang chế' },
  { value: LeaveType.OTHER, label: 'Nghỉ khác' },
];

export const durationTypeOptions = [
  { value: DurationType.FULL_DAY, label: 'Nghỉ cả ngày' },
  { value: DurationType.MORNING, label: 'Nghỉ nửa ngày buổi sáng' },
  { value: DurationType.AFTERNOON, label: 'Nghỉ nửa ngày buổi chiều' },
  { value: DurationType.CUSTOM_SHIFT, label: 'Nghỉ theo ca cụ thể' },
];

export const statusConfig: Record<string, { label: string; badgeVariant: 'warning' | 'success' | 'danger' | 'default'; class: string }> = {
  [LeaveRequestStatus.PENDING]: {
    label: 'Đang chờ duyệt',
    badgeVariant: 'warning',
    class: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  [LeaveRequestStatus.APPROVED]: {
    label: 'Đã phê duyệt',
    badgeVariant: 'success',
    class: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  [LeaveRequestStatus.REJECTED]: {
    label: 'Bị từ chối',
    badgeVariant: 'danger',
    class: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  [LeaveRequestStatus.CANCELLED]: {
    label: 'Đã hủy',
    badgeVariant: 'default',
    class: 'bg-slate-100 text-slate-600 border-slate-200',
  },
};

interface LeaveRequestModalProps {
  isManager: boolean;
  currentUserId?: string;
}

export default function LeaveRequestModal({ isManager, currentUserId }: LeaveRequestModalProps) {
  const queryClient = useQueryClient();

  const {
    selectedLeaveRequest,
    isDetailModalOpen,
    isCreateModalOpen,
    isReviewModalOpen,
    isDeleteConfirmOpen,
    isEditing,
    formLeaveType,
    formDurationType,
    formWorkShiftId,
    formStartDate,
    formEndDate,
    formReason,
    formFile,
    formExistingAttachmentUrl,
    formErrors,
    setDetailModalOpen,
    setCreateModalOpen,
    setReviewModalOpen,
    setIsDeleteConfirmOpen,
    setIsEditing,
    setFormLeaveType,
    setFormDurationType,
    setFormWorkShiftId,
    setFormStartDate,
    setFormEndDate,
    setFormReason,
    setFormFile,
    setFormExistingAttachmentUrl,
    setFormErrors,
    resetForm,
    initEditForm,
  } = useLeaveRequestStore();

  const [reviewType, setReviewType] = useState<'approved' | 'rejected'>('approved');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Keyboard escape handler for lightbox
  useEffect(() => {
    if (!previewUrl) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        e.preventDefault();
        setPreviewUrl(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [previewUrl]);

  // Tạo URL preview trực tiếp từ file được chọn
  const localFilePreview = useMemo(() => {
    if (!formFile) return null;
    const isImg = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(formFile.name) || formFile.type.startsWith('image/');
    return isImg ? URL.createObjectURL(formFile) : null;
  }, [formFile]);

  // Dọn dẹp bộ nhớ Object URL khi file thay đổi hoặc unmount
  useEffect(() => {
    return () => {
      if (localFilePreview) {
        URL.revokeObjectURL(localFilePreview);
      }
    };
  }, [localFilePreview]);

  // Query work shifts for custom shift dropdown
  const { data: workShiftsData } = useQuery({
    queryKey: ['work-shifts-list'],
    queryFn: () => getWorkShifts({ limit: 100 }),
    enabled: isCreateModalOpen || isDetailModalOpen || isEditing,
  });

  const workShiftOptions = useMemo(() => {
    const items = Array.isArray(workShiftsData) ? workShiftsData : workShiftsData?.items || [];
    return items.map((shift: any) => ({
      value: String(shift.id),
      label: `${shift.name} (${shift.startTime || shift.start_time || ''} - ${shift.endTime || shift.end_time || ''})`,
    }));
  }, [workShiftsData]);

  // Calculate total days preview
  const calculatedDays = useMemo(() => {
    if (formDurationType === DurationType.MORNING || formDurationType === DurationType.AFTERNOON) {
      return 0.5;
    }
    if (formDurationType === DurationType.CUSTOM_SHIFT) {
      return 1;
    }
    if (!formStartDate || !formEndDate) return 0;
    const start = new Date(formStartDate);
    const end = new Date(formEndDate);
    if (end < start) return 0;
    const diff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
  }, [formDurationType, formStartDate, formEndDate]);

  // Auto sync end date when half day or custom shift is selected
  useEffect(() => {
    if (formDurationType === DurationType.MORNING || formDurationType === DurationType.AFTERNOON || formDurationType === DurationType.CUSTOM_SHIFT) {
      setFormEndDate(formStartDate);
    }
  }, [formDurationType, formStartDate, setFormEndDate]);

  // File change handler matching suggestion-modal
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const allowedDocTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    const isImage = allowedImageTypes.includes(file.type);
    const isDoc = allowedDocTypes.includes(file.type) || /\.(pdf|doc|docx|xls|xlsx)$/i.test(file.name);

    if (!isImage && !isDoc) {
      toast.error(`File "${file.name}" không hợp lệ. Chỉ chấp nhận file ảnh hoặc tài liệu (PDF, Word, Excel)!`);
      return;
    }

    const sizeLimit = 20 * 1024 * 1024;
    if (file.size > sizeLimit) {
      toast.error(`Dung lượng file "${file.name}" vượt quá giới hạn cho phép (tối đa 20MB)!`);
      return;
    }

    setFormFile(file);
    toast.success('Đã tải lên tệp đính kèm!');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = () => {
    setFormFile(null);
    setFormExistingAttachmentUrl(null);
  };

  // Compute active attachment in form
  const activeAttachment = useMemo(() => {
    if (formFile) {
      const isImg = Boolean(localFilePreview);
      const ext = formFile.name.split('.').pop()?.toUpperCase() || 'FILE';
      const sizeMb = (formFile.size / (1024 * 1024)).toFixed(2);
      return {
        isImg,
        previewUrl: localFilePreview,
        name: formFile.name,
        ext,
        sizeText: `${sizeMb} MB`,
        isLocal: true,
      };
    }
    if (formExistingAttachmentUrl) {
      const cleanBaseUrl = BASE_MINIO_URL.endsWith('/') ? BASE_MINIO_URL.slice(0, -1) : BASE_MINIO_URL;
      const cleanPath = formExistingAttachmentUrl.startsWith('/') ? formExistingAttachmentUrl : `/${formExistingAttachmentUrl}`;
      const fullUrl = formExistingAttachmentUrl.startsWith('http') ? formExistingAttachmentUrl : `${cleanBaseUrl}${cleanPath}`;
      const isImg = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(fullUrl);
      const fileName = fullUrl.split('/').pop() || 'Tài liệu đính kèm';
      const ext = fileName.split('.').pop()?.toUpperCase() || 'FILE';
      return {
        isImg,
        previewUrl: fullUrl,
        name: fileName,
        ext,
        sizeText: 'Tài liệu hiện có',
        isLocal: false,
      };
    }
    return null;
  }, [formFile, localFilePreview, formExistingAttachmentUrl]);

  // Compute attachment for detail view
  const detailAttachment = useMemo(() => {
    if (!selectedLeaveRequest?.attachmentPath) return null;
    const cleanBaseUrl = BASE_MINIO_URL.endsWith('/') ? BASE_MINIO_URL.slice(0, -1) : BASE_MINIO_URL;
    const cleanPath = selectedLeaveRequest.attachmentPath.startsWith('/')
      ? selectedLeaveRequest.attachmentPath
      : `/${selectedLeaveRequest.attachmentPath}`;
    const fullUrl = selectedLeaveRequest.attachmentPath.startsWith('http') ? selectedLeaveRequest.attachmentPath : `${cleanBaseUrl}${cleanPath}`;
    const isImg = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(fullUrl);
    const fileName = fullUrl.split('/').pop() || 'document.pdf';
    const ext = fileName.split('.').pop()?.toUpperCase() || 'FILE';
    return {
      isImg,
      fullUrl,
      fileName,
      ext,
    };
  }, [selectedLeaveRequest]);

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      return createLeaveRequest(
        {
          leaveType: formLeaveType,
          durationType: formDurationType,
          workShiftId: formDurationType === DurationType.CUSTOM_SHIFT ? formWorkShiftId : null,
          startDate: formStartDate,
          endDate: formDurationType === DurationType.FULL_DAY ? formEndDate : formStartDate,
          totalDays: formDurationType === DurationType.CUSTOM_SHIFT ? null : calculatedDays,
          reason: formReason,
        },
        formFile,
      );
    },
    onSuccess: () => {
      toast.success('Gửi đơn xin nghỉ phép thành công!');
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leave-requests-stats'] });
      setCreateModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Không thể tạo đơn xin nghỉ phép.');
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedLeaveRequest) return;
      return updateLeaveRequest(
        String(selectedLeaveRequest.id),
        {
          leaveType: formLeaveType,
          durationType: formDurationType,
          workShiftId: formDurationType === DurationType.CUSTOM_SHIFT ? formWorkShiftId : null,
          startDate: formStartDate,
          endDate: formDurationType === DurationType.FULL_DAY ? formEndDate : formStartDate,
          totalDays: formDurationType === DurationType.CUSTOM_SHIFT ? null : calculatedDays,
          reason: formReason,
        },
        formFile,
      );
    },
    onSuccess: () => {
      toast.success('Cập nhật đơn xin nghỉ phép thành công!');
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leave-requests-stats'] });
      setDetailModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Không thể cập nhật đơn xin nghỉ phép.');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string | number) => {
      return deleteLeaveRequest(String(id));
    },
    onSuccess: () => {
      toast.success('Đã hủy đơn xin nghỉ phép!');
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leave-requests-stats'] });
      setIsDeleteConfirmOpen(false);
      setDetailModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Không thể hủy đơn nghỉ phép.');
    },
  });

  // Review Mutation
  const reviewMutation = useMutation({
    mutationFn: async ({ id, note, status }: { id: string | number; note: string; status: 'approved' | 'rejected' }) => {
      return reviewLeaveRequest(String(id), {
        status,
        reviewNote: note,
      });
    },
    onSuccess: (_, variables) => {
      toast.success(variables.status === 'approved' ? 'Đã duyệt đơn nghỉ phép thành công!' : 'Đã từ chối đơn nghỉ phép!');
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leave-requests-stats'] });
      setReviewModalOpen(false);
      setDetailModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Lỗi khi duyệt đơn.');
    },
  });

  const handleStartDateChange = (val: string) => {
    setFormStartDate(val);
    if (formErrors.startDate) {
      setFormErrors((prev) => ({ ...prev, startDate: '' }));
    }
    if (formDurationType === DurationType.FULL_DAY) {
      if (formEndDate && val > formEndDate) {
        setFormEndDate(val);
        if (formErrors.endDate) {
          setFormErrors((prev) => ({ ...prev, endDate: '' }));
        }
      }
    } else {
      setFormEndDate(val);
    }
  };

  const handleEndDateChange = (val: string) => {
    let finalVal = val;
    if (formStartDate && val < formStartDate) {
      finalVal = formStartDate;
    }
    setFormEndDate(finalVal);
    if (formErrors.endDate) {
      setFormErrors((prev) => ({ ...prev, endDate: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formReason.trim()) {
      errors.reason = 'Vui lòng nhập lý do xin nghỉ phép';
    }
    if (!formStartDate) {
      errors.startDate = 'Vui lòng chọn ngày bắt đầu';
    }
    if (formDurationType === DurationType.FULL_DAY && !formEndDate) {
      errors.endDate = 'Vui lòng chọn ngày kết thúc';
    }
    if (formDurationType === DurationType.FULL_DAY && formStartDate && formEndDate && formEndDate < formStartDate) {
      errors.endDate = 'Ngày kết thúc không được trước ngày bắt đầu';
    }
    if (formDurationType === DurationType.CUSTOM_SHIFT && !formWorkShiftId) {
      errors.workShiftId = 'Vui lòng chọn ca làm việc cụ thể';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (isEditing) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const handleOpenReview = (type: 'approved' | 'rejected') => {
    setReviewType(type);
    setReviewModalOpen(true);
  };

  // Sync form state when opening Detail mode
  useEffect(() => {
    if (selectedLeaveRequest && isDetailModalOpen && !isEditing) {
      setFormLeaveType(selectedLeaveRequest.leaveType);
      setFormDurationType(selectedLeaveRequest.durationType);
      const shiftId = selectedLeaveRequest.workShiftId ?? (selectedLeaveRequest as any).work_shift_id ?? null;
      setFormWorkShiftId(shiftId ? String(shiftId) : null);
      setFormStartDate(selectedLeaveRequest.startDate);
      setFormEndDate(selectedLeaveRequest.endDate);
      setFormReason(selectedLeaveRequest.reason);
      setFormFile(null);
      setFormExistingAttachmentUrl(selectedLeaveRequest.attachmentPath);
      setFormErrors({});
    }
  }, [
    selectedLeaveRequest,
    isDetailModalOpen,
    isEditing,
    setFormLeaveType,
    setFormDurationType,
    setFormWorkShiftId,
    setFormStartDate,
    setFormEndDate,
    setFormReason,
    setFormFile,
    setFormExistingAttachmentUrl,
    setFormErrors,
  ]);

  // Handle modal close
  const handleClose = () => {
    setCreateModalOpen(false);
    setDetailModalOpen(false);
    setIsEditing(false);
    resetForm();
  };

  const isFormLoading = createMutation.isPending || updateMutation.isPending;

  const isOwner = selectedLeaveRequest?.userId === currentUserId;
  const canEdit = isOwner && selectedLeaveRequest?.status === LeaveRequestStatus.PENDING;
  const canDelete =
    isOwner && (selectedLeaveRequest?.status === LeaveRequestStatus.PENDING || selectedLeaveRequest?.status === LeaveRequestStatus.CANCELLED);
  const canReview = isManager && selectedLeaveRequest?.status === LeaveRequestStatus.PENDING;

  const isOpen = isCreateModalOpen || isDetailModalOpen || isEditing;
  const mode = isCreateModalOpen ? 'create' : isEditing ? 'edit' : 'view';

  const modalTitle =
    mode === 'create' ? (
      'TẠO ĐƠN XIN NGHỈ PHÉP MỚI'
    ) : mode === 'edit' ? (
      'CHỈNH SỬA ĐƠN XIN NGHỈ PHÉP'
    ) : (
      <div className="flex items-center gap-2.5">
        <span>CHI TIẾT ĐƠN XIN NGHỈ PHÉP</span>
        {selectedLeaveRequest && (
          <span
            className={`inline-block px-2.5 py-0.5 rounded-full text-[12px] font-bold select-none border ${
              statusConfig[selectedLeaveRequest.status]?.class || 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {statusConfig[selectedLeaveRequest.status]?.label || selectedLeaveRequest.status}
          </span>
        )}
      </div>
    );

  const footer = (
    <div className="flex items-center justify-between w-full">
      {/* Nút hủy / xóa bên trái khi ở view mode */}
      <div>
        {mode === 'view' && canDelete && (
          <Button
            variant="outline"
            className="text-rose-600 border-rose-200 hover:bg-rose-50"
            onClick={() => setIsDeleteConfirmOpen(true)}
            disabled={isFormLoading}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Xóa đơn
          </Button>
        )}
      </div>

      {/* Nhóm nút hành động bên phải */}
      <div className="flex items-center gap-2">
        {mode === 'create' && (
          <>
            <Button variant="outline" onClick={handleClose} disabled={isFormLoading}>
              Hủy bỏ
            </Button>
            <Button type="submit" variant="primary" onClick={handleSubmitForm} loading={isFormLoading} disabled={isFormLoading}>
              Gửi đơn nghỉ phép
            </Button>
          </>
        )}

        {mode === 'edit' && (
          <>
            <Button variant="outline" onClick={handleClose} disabled={isFormLoading}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleSubmitForm} loading={isFormLoading} disabled={isFormLoading}>
              Lưu thay đổi
            </Button>
          </>
        )}

        {mode === 'view' && (
          <>
            <Button variant="outline" onClick={handleClose} disabled={isFormLoading}>
              Đóng
            </Button>
            {canEdit && (
              <Button variant="primary" onClick={() => setIsEditing(true)} disabled={isFormLoading}>
                Sửa đơn
              </Button>
            )}
            {canReview && (
              <>
                <Button
                  variant="primary"
                  className="bg-rose-500 hover:bg-rose-600 border-0 text-white font-bold"
                  onClick={() => handleOpenReview('rejected')}
                  disabled={isFormLoading}
                >
                  Từ chối
                </Button>
                <Button
                  variant="primary"
                  className="bg-[#0CBFDF] hover:bg-[#0bb1ce] border-0 text-white font-bold"
                  onClick={() => handleOpenReview('approved')}
                  disabled={isFormLoading}
                >
                  Duyệt đơn
                </Button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* UNIFIED MODAL (CREATE / EDIT / VIEW) */}
      {isOpen && (
        <Modal isOpen={isOpen} onClose={handleClose} title={modalTitle} size="xl" footer={footer} disabled={isFormLoading}>
          <form onSubmit={handleSubmitForm} className="flex flex-col gap-4">
            {/* View Mode: Thông tin người gửi & thời gian gửi */}
            {mode === 'view' && selectedLeaveRequest && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Người làm đơn"
                  value={
                    selectedLeaveRequest.user?.fullName
                      ? `${selectedLeaveRequest.user.fullName} (${selectedLeaveRequest.user.email || selectedLeaveRequest.userId})`
                      : 'Nhân viên'
                  }
                  disabled
                  fullWidth
                />
                <Input
                  label="Thời gian gửi đơn"
                  value={
                    selectedLeaveRequest.createdAt
                      ? new Date(selectedLeaveRequest.createdAt).toLocaleString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })
                      : '---'
                  }
                  disabled
                  fullWidth
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Loại nghỉ */}
              <Select
                label="Loại nghỉ phép"
                options={leaveTypeOptions}
                value={formLeaveType}
                onChange={(e) => setFormLeaveType(e.target.value)}
                disabled={isFormLoading || mode === 'view'}
                required
                fullWidth
              />

              {/* Phạm vi thời gian */}
              <Select
                label="Phạm vi thời gian"
                options={durationTypeOptions}
                value={formDurationType}
                onChange={(e) => setFormDurationType(e.target.value)}
                disabled={isFormLoading || mode === 'view'}
                required
                fullWidth
              />
            </div>

            {/* Ngày nghỉ phép & Ca làm việc / Ngày kết thúc / Tổng số ngày */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={formDurationType === DurationType.FULL_DAY ? 'Ngày bắt đầu nghỉ' : 'Ngày nghỉ phép'}
                type={mode === 'view' ? 'text' : 'date'}
                value={mode === 'view' ? formStartDate.split('T')[0].split('-').reverse().join('/') : formStartDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                error={formErrors.startDate}
                disabled={isFormLoading || mode === 'view'}
                required
                fullWidth
              />

              {formDurationType === DurationType.CUSTOM_SHIFT ? (
                <Select
                  label="Chọn ca làm việc áp dụng"
                  options={workShiftOptions}
                  value={formWorkShiftId ? String(formWorkShiftId) : ''}
                  onChange={(e) => setFormWorkShiftId(e.target.value)}
                  error={formErrors.workShiftId}
                  disabled={isFormLoading || mode === 'view'}
                  placeholder="-- Chọn ca làm việc --"
                  required
                  fullWidth
                />
              ) : formDurationType === DurationType.FULL_DAY ? (
                <Input
                  label="Ngày kết thúc nghỉ"
                  type={mode === 'view' ? 'text' : 'date'}
                  value={mode === 'view' ? formEndDate.split('T')[0].split('-').reverse().join('/') : formEndDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  min={formStartDate || undefined}
                  error={formErrors.endDate}
                  disabled={isFormLoading || mode === 'view'}
                  required
                  fullWidth
                />
              ) : (
                <Input
                  label="Tổng số ngày nghỉ"
                  value={`${mode === 'view' && selectedLeaveRequest ? selectedLeaveRequest.totalDays : calculatedDays} ngày`}
                  disabled
                  fullWidth
                />
              )}
            </div>

            {formDurationType === DurationType.FULL_DAY && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Tổng số ngày nghỉ"
                  value={`${mode === 'view' && selectedLeaveRequest ? selectedLeaveRequest.totalDays : calculatedDays} ngày`}
                  disabled
                  fullWidth
                />
              </div>
            )}

            {/* Lý do */}
            <Textarea
              label="Lý do xin nghỉ phép"
              placeholder="Nhập lý do chi tiết xin nghỉ phép..."
              value={formReason}
              onChange={(e) => setFormReason(e.target.value)}
              error={formErrors.reason}
              disabled={isFormLoading || mode === 'view'}
              rows={3}
              required
              fullWidth
            />

            {/* File / Image Attachment */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-gray-700 select-none">
                {mode === 'view' ? 'Tệp hoặc Ảnh chứng từ y tế' : 'Tệp hoặc Ảnh chứng từ y tế (Tối đa 20MB)'}
              </span>

              <div className="flex flex-col gap-3">
                {mode !== 'view' && (
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/jpeg,image/png,image/webp,image/jpg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      className="hidden"
                      disabled={isFormLoading}
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isFormLoading}
                      leftIcon={<Upload className="w-4 h-4" />}
                    >
                      {activeAttachment ? 'Thay đổi file' : 'Chọn file'}
                    </Button>
                  </div>
                )}

                {/* Nhóm hình ảnh đính kèm */}
                {activeAttachment && activeAttachment.isImg && (
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex flex-wrap gap-3">
                      <div className="relative w-16 h-16 rounded-lg border border-slate-200 group">
                        <div className="w-full h-full rounded-lg overflow-hidden relative">
                          <img src={activeAttachment.previewUrl!} alt="Preview" className="w-full h-full object-cover" />
                          <div
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer"
                            onClick={() => setPreviewUrl(activeAttachment.previewUrl!)}
                          >
                            <div className="bg-transparent text-white/90 rounded-full p-1.5 transition-colors shadow-xs">
                              <Eye className="w-5 h-5" />
                            </div>
                          </div>
                        </div>
                        {mode !== 'view' && (
                          <Button
                            type="button"
                            variant="ghost"
                            disabled={isFormLoading}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveAttachment();
                            }}
                            className="absolute -top-1.5 -right-1.5 text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-full w-5 h-5 p-0 flex items-center justify-center transition-colors cursor-pointer shadow-xs z-10 min-w-0 disabled:cursor-not-allowed"
                            title="Xóa ảnh"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Nhóm tài liệu đính kèm */}
                {activeAttachment && !activeAttachment.isImg && (
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex flex-wrap gap-3">
                      {mode === 'view' ? (
                        <a
                          href={activeAttachment.previewUrl!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 p-2 bg-slate-50 border border-slate-200 rounded-xl max-w-xs shrink-0 relative overflow-hidden group hover:border-slate-350 transition-colors"
                        >
                          <div className="w-8 h-8 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center shrink-0 font-black text-[9px] uppercase border border-rose-100">
                            {activeAttachment.ext}
                          </div>
                          <div className="flex flex-col gap-0.5 overflow-hidden flex-1 min-w-0">
                            <span className="text-xs font-bold text-slate-700 truncate group-hover:text-primary transition-colors">
                              {activeAttachment.name}
                            </span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase">Click để xem/tải</span>
                          </div>
                        </a>
                      ) : (
                        <div className="flex items-center gap-2.5 p-2 bg-slate-50 border border-slate-200 rounded-xl max-w-xs shrink-0 relative overflow-hidden group">
                          <div className="w-8 h-8 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center shrink-0 font-black text-[9px] uppercase border border-rose-100">
                            {activeAttachment.ext}
                          </div>
                          <div className="flex flex-col gap-0.5 overflow-hidden flex-1 min-w-0">
                            <span className="text-xs font-bold text-slate-700 truncate">{activeAttachment.name}</span>
                            <span className="text-[9px] text-slate-450 font-bold">{activeAttachment.sizeText}</span>
                          </div>
                          <button
                            type="button"
                            disabled={isFormLoading}
                            onClick={handleRemoveAttachment}
                            className="text-slate-400 hover:text-slate-600 disabled:text-slate-300 rounded-full p-1 transition-colors shrink-0 cursor-pointer disabled:cursor-not-allowed"
                            title="Gỡ bỏ tài liệu"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Nếu ở view mode và không có đính kèm */}
                {mode === 'view' && !activeAttachment && <span className="text-xs text-slate-400 italic">Không có tệp đính kèm</span>}
              </div>
            </div>

            {/* Thông tin xét duyệt (Review Section) - ONLY FOR VIEW MODE */}
            {mode === 'view' &&
              selectedLeaveRequest &&
              (selectedLeaveRequest.status === LeaveRequestStatus.PENDING ? null : (
                <div className="flex flex-col gap-4 mt-2">
                  <hr className="border-t border-slate-200 my-2" />
                  <span className="text-sm font-bold text-[#006377] select-none tracking-wider uppercase">THÔNG TIN XÉT DUYỆT:</span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Người xét duyệt"
                      value={
                        selectedLeaveRequest.reviewer
                          ? `${selectedLeaveRequest.reviewer.fullName || selectedLeaveRequest.reviewer.username} (${selectedLeaveRequest.reviewer.email})`
                          : 'Ban Giám Đốc'
                      }
                      disabled
                      fullWidth
                    />
                    <Input
                      label="Thời gian xét duyệt"
                      value={
                        selectedLeaveRequest.reviewedAt
                          ? new Date(selectedLeaveRequest.reviewedAt).toLocaleString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })
                          : selectedLeaveRequest.updatedAt
                            ? new Date(selectedLeaveRequest.updatedAt).toLocaleString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })
                            : 'N/A'
                      }
                      disabled
                      fullWidth
                    />
                  </div>

                  <Textarea
                    label="Chi tiết phản hồi"
                    value={selectedLeaveRequest.reviewNote || 'Chưa có phản hồi đối với đơn nghỉ phép này.'}
                    disabled
                    rows={3}
                    fullWidth
                  />
                </div>
              ))}
          </form>
        </Modal>
      )}

      {/* CONFIRM DELETE / CANCEL MODAL */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        title="Xác nhận xóa đơn nghỉ phép"
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)} disabled={deleteMutation.isPending}>
              Hủy bỏ
            </Button>
            <Button
              variant="primary"
              className="bg-rose-600 hover:bg-rose-700 border-0 text-white"
              onClick={() => {
                if (selectedLeaveRequest) {
                  deleteMutation.mutate(selectedLeaveRequest.id);
                }
              }}
              loading={deleteMutation.isPending}
              disabled={deleteMutation.isPending}
            >
              Xác nhận xóa
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">
          Bạn có chắc chắn muốn xóa đơn nghỉ phép này? Hành động này không thể hoàn tác.
        </p>
      </Modal>

      {/* HR/ADMIN REVIEW MODAL */}
      <LeaveRequestReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        type={reviewType}
        onSubmit={(note) => {
          if (selectedLeaveRequest) {
            reviewMutation.mutate({
              id: selectedLeaveRequest.id,
              note,
              status: reviewType,
            });
          }
        }}
        isPending={reviewMutation.isPending}
      />

      {/* LIGHTBOX PREVIEW MODAL */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-51 flex items-center justify-center bg-black/85 backdrop-blur-xs animate-fade-in"
          onClick={() => setPreviewUrl(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 cursor-pointer transition-colors"
            onClick={() => setPreviewUrl(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={previewUrl}
            alt="Preview"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
