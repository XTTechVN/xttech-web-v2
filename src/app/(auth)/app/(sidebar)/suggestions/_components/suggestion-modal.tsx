/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Send, Upload, X, Eye, Check, Trash2 } from 'lucide-react';
import { useSuggestionStore } from '@/stores/useSuggestionStore';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Input, Textarea, Checkbox, Button, Alert, Select } from '@/components';
import { createSuggestion, updateSuggestion, deleteSuggestion, reviewSuggestion } from '@/actions/suggestion';
import SuggestionFeedbackModal from './suggestion-feedback-modal';

const getStatusDetails = (status: string) => {
  const map: Record<string, { label: string; class: string }> = {
    pending: { label: 'Chờ duyệt', class: 'bg-amber-50 text-amber-700 border-amber-200' },
    approve: { label: 'Đã xử lý', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    reject: { label: 'Từ chối', class: 'bg-rose-50 text-rose-700 border-rose-200' },
  };
  return map[status] || { label: 'Không rõ', class: 'bg-slate-100 text-slate-600 border-slate-200' };
};

const formatDateTime = (dateStr: string | Date | undefined) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'N/A';

  const pad = (num: number) => String(num).padStart(2, '0');
  let hours = date.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;

  const minutes = pad(date.getMinutes());
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();

  return `${pad(hours)}:${minutes} ${ampm} ${day}/${month}/${year}`;
};

interface AttachmentItem {
  id: string;
  file?: File;
  name: string;
  size?: number;
  preview: string | null;
  isExisting?: boolean;
  path?: string;
  isUploading?: boolean;
  uploadProgress?: number;
}

interface SuggestionModalProps {
  isManager: boolean;
  currentUserId?: string;
}

export default function SuggestionModal({ isManager, currentUserId }: SuggestionModalProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);

  // States from store
  const {
    isCreateModalOpen,
    setCreateModalOpen,
    isDetailModalOpen,
    setDetailModalOpen,
    selectedSuggestion,
    setSelectedSuggestion,

    // Create modal form
    createTitle,
    setCreateTitle,
    createType,
    setCreateType,
    createProblem,
    setCreateProblem,
    createIsAnonymous,
    setCreateIsAnonymous,
    createAttachments,
    setCreateAttachments,
    createErrors,
    setCreateErrors,
    resetCreateForm,
    createShowAllImages,
    setCreateShowAllImages,
    createShowAllFiles,
    setCreateShowAllFiles,
    createPreviewUrl,
    setCreatePreviewUrl,
    createUploadProgress,
    setCreateUploadProgress,

    // Edit/Detail modal form
    editTitle,
    setEditTitle,
    editType,
    setEditType,
    editProblem,
    setEditProblem,
    editAttachments,
    setEditAttachments,
    setReviewText,
    isEditing,
    setIsEditing,
    isDeleteConfirmOpen,
    setIsDeleteConfirmOpen,
    isSaving,
    setIsSaving,
    detailShowAllImages,
    setDetailShowAllImages,
    detailShowAllFiles,
    setDetailShowAllFiles,
    detailPreviewUrl,
    setDetailPreviewUrl,
    detailUploadProgress,
    setDetailUploadProgress,
    resetEditForm,
  } = useSuggestionStore();

  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'approve' | 'reject'>('approve');

  const isOpen = isCreateModalOpen || isDetailModalOpen;
  const mode = isCreateModalOpen ? 'create' : isEditing ? 'edit' : 'view';

  // Helpers to parse suggestion content
  const getParsedContent = (content: string, pType?: string) => {
    const parts = content.split('|||');
    if (parts.length === 3) {
      return { type: parts[0], problem: parts[1] };
    } else if (parts.length === 2) {
      return { type: pType || 'other', problem: parts[0] };
    } else {
      return { type: pType || 'other', problem: content };
    }
  };

  const cleanAttachments = React.useMemo(() => {
    if (!selectedSuggestion || !selectedSuggestion.attachments) return [];
    return selectedSuggestion.attachments.map((att) => {
      const baseUrl = process.env.MINIO_PUBLIC_URL || 'https://minio-production-2298.up.railway.app';
      const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      const cleanPath = att.path.startsWith('/') ? att.path : `/${att.path}`;
      const fullPath = att.path.startsWith('http') ? att.path : `${cleanBaseUrl}${cleanPath}`;
      const isImg = /\.(jpg|jpeg|png|webp)$/i.test(fullPath);
      const fileName = fullPath.split('/').pop() || 'document.pdf';
      return {
        id: att.id,
        name: fileName,
        path: fullPath,
        isImg,
      };
    });
  }, [selectedSuggestion]);

  const detailImages = cleanAttachments.filter((att) => att.isImg);
  const detailFiles = cleanAttachments.filter((att) => !att.isImg);

  // Map values according to current mode
  const title = mode === 'create' ? createTitle : mode === 'edit' ? editTitle : selectedSuggestion?.title || '';
  const setTitle = mode === 'create' ? setCreateTitle : setEditTitle;

  const type = mode === 'create' ? createType : mode === 'edit' ? editType : (selectedSuggestion as any)?.type || 'other';
  const setType = mode === 'create' ? setCreateType : setEditType;

  const problem = React.useMemo(() => {
    if (mode === 'create') return createProblem;
    if (mode === 'edit') return editProblem;
    if (!selectedSuggestion) return '';
    return getParsedContent(selectedSuggestion.content, (selectedSuggestion as any).type).problem;
  }, [mode, createProblem, editProblem, selectedSuggestion]);

  const setProblem = mode === 'create' ? setCreateProblem : setEditProblem;

  const attachments = mode === 'create' ? createAttachments : editAttachments;
  const setAttachments = mode === 'create' ? setCreateAttachments : setEditAttachments;

  const showAllImages = mode === 'create' ? createShowAllImages : mode === 'edit' ? detailShowAllImages : detailShowAllImages;
  const setShowAllImages = mode === 'create' ? setCreateShowAllImages : mode === 'edit' ? setDetailShowAllImages : setDetailShowAllImages;

  const showAllFiles = mode === 'create' ? createShowAllFiles : mode === 'edit' ? detailShowAllFiles : detailShowAllFiles;
  const setShowAllFiles = mode === 'create' ? setCreateShowAllFiles : mode === 'edit' ? setDetailShowAllFiles : setDetailShowAllFiles;

  const previewUrl = mode === 'create' ? createPreviewUrl : mode === 'edit' ? detailPreviewUrl : detailPreviewUrl;
  const setPreviewUrl = mode === 'create' ? setCreatePreviewUrl : mode === 'edit' ? setDetailPreviewUrl : setDetailPreviewUrl;

  const uploadProgress = mode === 'create' ? createUploadProgress : mode === 'edit' ? detailUploadProgress : detailUploadProgress;
  const setUploadProgress = mode === 'create' ? setCreateUploadProgress : mode === 'edit' ? setDetailUploadProgress : setDetailUploadProgress;

  const imageAttachments = attachments.filter((att) => att.preview);
  const fileAttachments = attachments.filter((att) => !att.preview);

  const senderName = selectedSuggestion?.anonymous
    ? 'Ẩn danh'
    : `${selectedSuggestion?.user?.fullName} (${selectedSuggestion?.user?.email})` || 'Ẩn danh';
  const formattedDate = selectedSuggestion?.createdAt ? formatDateTime(selectedSuggestion.createdAt) : 'N/A';

  // React to suggestion selection in detail mode
  useEffect(() => {
    if (isDetailModalOpen && selectedSuggestion) {
      const { type: parsedType, problem: parsedProb } = getParsedContent(selectedSuggestion.content, (selectedSuggestion as any).type);
      setReviewText(selectedSuggestion.review || '');
      setEditType(parsedType || 'process');
      setEditTitle(selectedSuggestion.title || '');
      setEditProblem(parsedProb || '');
      setEditAttachments(
        selectedSuggestion.attachments?.map((att) => {
          const baseUrl = process.env.MINIO_PUBLIC_URL || 'https://minio-production-2298.up.railway.app';
          const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
          const cleanPath = att.path.startsWith('/') ? att.path : `/${att.path}`;
          const fullPath = att.path.startsWith('http') ? att.path : `${cleanBaseUrl}${cleanPath}`;
          const isImg = /\.(jpg|jpeg|png|webp)$/i.test(fullPath);
          const fileName = fullPath.split('/').pop() || 'document.pdf';
          return {
            id: att.id,
            name: fileName,
            path: fullPath,
            preview: isImg ? fullPath : null,
            isExisting: true,
          };
        }) || [],
      );
    }
  }, [isDetailModalOpen, selectedSuggestion, setEditAttachments, setEditProblem, setEditTitle, setEditType, setReviewText]);

  // Setup preview escape key listener
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
  }, [previewUrl, setPreviewUrl]);

  // Reset form functions
  const handleResetCreateForm = () => {
    createAttachments.forEach((att) => {
      if (att.preview) URL.revokeObjectURL(att.preview);
    });
    setCreateShowAllImages(false);
    setCreateShowAllFiles(false);
    setCreatePreviewUrl(null);
    setCreateUploadProgress(null);
    resetCreateForm();
  };

  const handleResetEditForm = () => {
    editAttachments.forEach((att) => {
      if (att.preview && !att.preview.startsWith('http')) URL.revokeObjectURL(att.preview);
    });
    setDetailShowAllImages(false);
    setDetailShowAllFiles(false);
    setDetailPreviewUrl(null);
    setDetailUploadProgress(null);
    resetEditForm();
  };

  const isEditDirty = React.useMemo(() => {
    if (!selectedSuggestion) return false;
    const { type: origType, problem: origProb } = getParsedContent(
      selectedSuggestion.content,
      (selectedSuggestion as any).type,
    );

    const titleChanged = editTitle.trim() !== (selectedSuggestion.title || '').trim();
    const typeChanged = editType !== (origType || 'process');
    const problemChanged = editProblem.trim() !== (origProb || '').trim();

    const originalAttachmentsCount = selectedSuggestion.attachments?.length || 0;
    const hasNewAttachments = editAttachments.some((att) => !att.isExisting || att.file);
    const attachmentsCountChanged = editAttachments.length !== originalAttachmentsCount;

    return titleChanged || typeChanged || problemChanged || hasNewAttachments || attachmentsCountChanged;
  }, [selectedSuggestion, editTitle, editType, editProblem, editAttachments]);

  const handleClose = () => {
    if (isPending) return;
    if (mode === 'create') {
      const isDirty = createTitle.trim() !== '' || createProblem.trim() !== '' || createAttachments.length > 0;
      if (isDirty) {
        setIsCloseConfirmOpen(true);
      } else {
        setCreateModalOpen(false);
      }
    } else if (mode === 'edit') {
      if (isEditDirty) {
        setIsCloseConfirmOpen(true);
      } else {
        handleResetEditForm();
        setIsEditing(false);
        setDetailModalOpen(false);
        setSelectedSuggestion(null);
      }
    } else {
      setDetailModalOpen(false);
      setSelectedSuggestion(null);
    }
  };

  const handleConfirmClose = () => {
    setIsCloseConfirmOpen(false);
    if (mode === 'create') {
      handleResetCreateForm();
      setCreateModalOpen(false);
    } else if (mode === 'edit') {
      handleResetEditForm();
      setIsEditing(false);
      setDetailModalOpen(false);
      setSelectedSuggestion(null);
    }
  };

  // Mutations
  const createMutation = useMutation({
    mutationFn: async ({ data, files }: { data: any; files?: File[] }) => {
      setUploadProgress(0);
      return await createSuggestion(data, files, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || progressEvent.loaded || 1));
        setUploadProgress(percentCompleted);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-suggestions-all-stats'] });
      toast.success('Gửi đề xuất thành công!');
      handleResetCreateForm();
      setCreateModalOpen(false);
      setUploadProgress(null);
    },
    onError: (error: any) => {
      const errMsg = error.response?.data?.message || error.response?.data?.detail || error.message || 'Có lỗi xảy ra khi gửi đề xuất.';
      toast.error(errMsg);
      setUploadProgress(null);
    },
  });

  const updateSuggestionMutation = useMutation({
    mutationFn: async ({ id, data, files }: { id: string; data: any; files?: File[] }) => {
      setUploadProgress(0);
      return await updateSuggestion(id, data, files, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || progressEvent.loaded || 1));
        setUploadProgress(percentCompleted);
      });
    },
    onSuccess: () => {
      toast.success('Cập nhật đề xuất thành công!');
      handleResetEditForm();
      setDetailModalOpen(false);
      setSelectedSuggestion(null);
      queryClient.invalidateQueries({ queryKey: ['admin-suggestions'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Có lỗi xảy ra khi cập nhật đề xuất.');
      setUploadProgress(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await deleteSuggestion(id);
    },
    onSuccess: () => {
      toast.success('Xóa đề xuất thành công!');
      setIsDeleteConfirmOpen(false);
      setDetailModalOpen(false);
      setSelectedSuggestion(null);
      queryClient.invalidateQueries({ queryKey: ['admin-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-suggestions-all-stats'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Có lỗi xảy ra khi xóa đề xuất.');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, review }: { id: string; status: 'approve' | 'reject'; review: string }) => {
      return await reviewSuggestion(id, { status, review });
    },
    onSuccess: () => {
      toast.success('Gửi phản hồi thành công!');
      setDetailModalOpen(false);
      setSelectedSuggestion(null);
      setFeedbackModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-suggestions-all-stats'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Có lỗi xảy ra khi duyệt đề xuất.');
    },
  });

  const handleFeedbackSubmit = (reviewText: string) => {
    if (selectedSuggestion) {
      updateStatusMutation.mutate({
        id: selectedSuggestion.id,
        status: feedbackType,
        review: reviewText,
      });
    }
  };

  const isPending =
    createMutation.isPending || updateSuggestionMutation.isPending || deleteMutation.isPending || updateStatusMutation.isPending || isSaving;

  const errorMessage =
    (createMutation.error as any)?.message ||
    (updateSuggestionMutation.error as any)?.message ||
    (deleteMutation.error as any)?.message ||
    (updateStatusMutation.error as any)?.message ||
    null;

  // File Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const allowedDocTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    const newAttachments: AttachmentItem[] = [];

    Array.from(files).forEach((file) => {
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

      const id = `${file.name}-${file.size}-${Date.now()}`;
      const preview = isImage ? URL.createObjectURL(file) : null;

      newAttachments.push({
        id,
        file,
        name: file.name,
        size: file.size,
        preview,
        isUploading: true,
        uploadProgress: 0,
      });
    });

    if (newAttachments.length > 0) {
      setAttachments((prev: any[]) => [...prev, ...newAttachments]);

      const pendingIds = new Set(newAttachments.map((att) => att.id));

      newAttachments.forEach((newAtt) => {
        let progress = 0;
        const stepTime = 100 + Math.min(400, Math.floor((newAtt.size || 0) / (1024 * 20)));
        const interval = setInterval(() => {
          const step = Math.floor(Math.random() * 15) + 10;
          progress += step;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setAttachments((prev: any[]) => prev.map((att) => (att.id === newAtt.id ? { ...att, uploadProgress: 100, isUploading: false } : att)));
            pendingIds.delete(newAtt.id);
            if (pendingIds.size === 0) {
              toast.success('Tải file lên thành công!');
            }
          } else {
            setAttachments((prev: any[]) => prev.map((att) => (att.id === newAtt.id ? { ...att, uploadProgress: progress } : att)));
          }
        }, stepTime);
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (id: string) => {
    setAttachments((prev: any[]) => {
      const item = prev.find((att) => att.id === id);
      if (item && item.preview && !item.preview.startsWith('http')) {
        URL.revokeObjectURL(item.preview);
      }
      return prev.filter((att) => att.id !== id);
    });
  };

  // Submit operations
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Vui lòng nhập chủ đề đề xuất.');
      return;
    }
    if (!problem.trim()) {
      toast.error('Vui lòng nhập chi tiết vấn đề tồn tại.');
      return;
    }

    if (mode === 'create') {
      createMutation.mutate({
        data: {
          title: title.trim(),
          content: problem.trim(),
          anonymous: createIsAnonymous,
          type: type,
        },
        files: attachments.length > 0 ? attachments.map((att) => att.file) : undefined,
      });
    } else if (mode === 'edit' && selectedSuggestion) {
      setIsSaving(true);
      Promise.all(
        attachments.map(async (att) => {
          if (att.file) return att.file;
          if (att.path) {
            try {
              const res = await fetch(att.path);
              const blob = await res.blob();
              return new File([blob], att.name, { type: blob.type });
            } catch (e) {
              console.error('Failed to convert existing attachment to File:', e);
              return null;
            }
          }
          return null;
        }),
      )
        .then((files) => {
          const validFiles = files.filter((f): f is File => f !== null);
          updateSuggestionMutation.mutate({
            id: selectedSuggestion.id,
            data: {
              title: title.trim(),
              content: problem.trim(),
              type: type,
            },
            files: validFiles,
          });
        })
        .catch(() => {
          toast.error('Có lỗi xảy ra khi xử lý file đính kèm.');
        })
        .finally(() => {
          setIsSaving(false);
        });
    }
  };

  const canEdit = selectedSuggestion?.status === 'pending' && (isManager || currentUserId === selectedSuggestion?.userId);

  // Footer Setup
  const footer = (
    <div className="flex items-center justify-end w-full">
      <div className="flex items-center gap-2">
        {mode === 'create' && (
          <>
            <Button variant="outline" onClick={handleClose} disabled={isPending}>
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              variant="primary"
              onClick={handleSubmit}
              loading={isPending}
              disabled={isPending || !title.trim() || !problem.trim() || attachments.some((att) => att.isUploading)}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Gửi đề xuất
            </Button>
          </>
        )}
        {mode === 'edit' && (
          <>
            <Button variant="outline" onClick={handleClose} disabled={isPending}>
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={isPending}
              disabled={!title.trim() || !problem.trim() || isPending || attachments.some((att) => att.isUploading)}
              leftIcon={<Check className="w-4 h-4" />}
            >
              Lưu
            </Button>
          </>
        )}
        {mode === 'view' && (
          <>
            {selectedSuggestion?.status === 'pending' ? (
              <>
                <Button variant="outline" onClick={handleClose} disabled={isPending}>
                  Đóng
                </Button>
                {canEdit && (
                  <Button variant="primary" onClick={() => setIsEditing(true)} disabled={isPending}>
                    Sửa đề xuất
                  </Button>
                )}
                {isManager && (
                  <>
                    <Button
                      variant="primary"
                      className="bg-rose-500 hover:bg-rose-600 border-0 text-white font-bold"
                      onClick={() => {
                        setFeedbackType('reject');
                        setFeedbackModalOpen(true);
                      }}
                      disabled={isPending}
                    >
                      Từ chối
                    </Button>
                    <Button
                      variant="primary"
                      className="bg-[#0CBFDF] hover:bg-[#0bb1ce] border-0 text-white font-bold"
                      onClick={() => {
                        setFeedbackType('approve');
                        setFeedbackModalOpen(true);
                      }}
                      disabled={isPending}
                    >
                      Duyệt đề xuất
                    </Button>
                  </>
                )}
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleClose} disabled={isPending}>
                  Đóng
                </Button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );

  const modalTitle =
    mode === 'create' ? (
      'Tạo đề xuất và sáng kiến mới'
    ) : mode === 'edit' ? (
      'Chỉnh sửa đề xuất và sáng kiến'
    ) : (
      <div className="flex items-center gap-2.5">
        <span>Chi tiết đề xuất và sáng kiến</span>
        {selectedSuggestion && (
          <span
            className={`inline-block px-2.5 py-0.5 rounded-full text-[12px] font-bold border ${getStatusDetails(selectedSuggestion.status).class}`}
          >
            {getStatusDetails(selectedSuggestion.status).label}
          </span>
        )}
      </div>
    );

  return (
    <>
      {isOpen && (
        <Modal isOpen={isOpen} onClose={handleClose} title={modalTitle} size="xl" footer={footer} disabled={isPending}>
          {errorMessage && (
            <Alert variant="danger" className="mb-4">
              {errorMessage}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Title */}
            <Input
              label="Chủ đề đề xuất *"
              placeholder="Nhập tên đề xuất (Ví dụ: Đề xuất cải tạo khu pantry...)"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (mode === 'create' && createErrors.title) setCreateErrors((prev) => ({ ...prev, title: '' }));
              }}
              error={mode === 'create' ? createErrors.title : undefined}
              disabled={isPending || mode === 'view'}
              fullWidth
            />

            <Select
              label="Loại đề xuất *"
              value={type}
              onChange={(e) => setType(e.target.value)}
              options={[
                { value: 'process', label: 'Cải tiến quy trình làm việc' },
                { value: 'product', label: 'Cải tiến sản phẩm/dịch vụ' },
                { value: 'technology', label: 'Đề xuất kỹ thuật, CNTT' },
                { value: 'cost', label: 'Tiết kiệm chi phí' },
                { value: 'quality', label: 'Nâng cao chất lượng' },
                { value: 'safety', label: 'An toàn lao động' },
                { value: 'workplace', label: 'Môi trường làm việc' },
                { value: 'welfare', label: 'Chế độ, phúc lợi' },
                { value: 'training', label: 'Đào tạo, phát triển nhân sự' },
                { value: 'customer', label: 'Chăm sóc khách hàng' },
                { value: 'complaint', label: 'Phản ánh, khiếu nại' },
                { value: 'other', label: 'Khác' },
              ]}
              disabled={isPending || mode === 'view'}
              className="w-full"
            />

            {mode === 'create' && (
              /* Anonymous Check (Only for Create) */
              <div className="flex items-center px-1 py-1">
                <Checkbox
                  label="Gửi dưới dạng ẩn danh"
                  checked={createIsAnonymous}
                  onChange={(e) => setCreateIsAnonymous(e.target.checked)}
                  disabled={isPending}
                />
              </div>
            )}

            {mode === 'view' && (
              /* Sender Info (Only for View Mode) */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Người gửi" value={selectedSuggestion?.anonymous ? 'Ẩn danh' : `${senderName}`} disabled fullWidth />
                <Input label="Thời gian gửi" value={formattedDate} disabled fullWidth />
              </div>
            )}

            {/* File / Image Attachment */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-gray-700 select-none">
                {mode === 'view' ? 'Tài liệu và hình ảnh đính kèm' : 'File hoặc hình ảnh đính kèm (Cho phép chọn nhiều, tối đa 20MB/file)'}
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
                      disabled={isPending}
                      multiple
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isPending}
                      leftIcon={<Upload className="w-4 h-4" />}
                    >
                      Chọn file
                    </Button>
                  </div>
                )}

                {/* Nhóm hình ảnh */}
                {mode === 'view'
                  ? /* Readonly Images for View Mode */
                    detailImages.length > 0 && (
                      <div className="flex flex-col gap-2 w-full">
                        <span className="text-xs font-semibold text-slate-500 select-none">Hình ảnh đính kèm ({detailImages.length})</span>
                        <div className="flex flex-wrap gap-3">
                          {detailImages.map((att) => (
                            <div
                              key={att.id}
                              onClick={() => setPreviewUrl(att.path)}
                              className="relative w-16 h-16 rounded-lg border border-slate-200 overflow-hidden cursor-pointer group shrink-0"
                            >
                              <img src={att.path} alt="Attachment" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                <Eye className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  : /* Editable Images for Create/Edit Modes */
                    imageAttachments.length > 0 && (
                      <div className="flex flex-col gap-2 w-full">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-500 select-none">Hình ảnh đính kèm ({imageAttachments.length})</span>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              disabled={isPending || attachments.some((att) => att.isUploading)}
                              onClick={() => {
                                imageAttachments.forEach((att) => {
                                  if (att.preview && !att.preview.startsWith('http')) URL.revokeObjectURL(att.preview);
                                });
                                setAttachments((prev: any[]) => prev.filter((att) => !att.preview));
                              }}
                              className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline disabled:text-rose-350 disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
                            >
                              Xóa toàn bộ hình ảnh
                            </button>
                            {showAllImages && imageAttachments.length > 4 && (
                              <button
                                type="button"
                                onClick={() => setShowAllImages(false)}
                                className="text-[11px] font-bold text-cyan-700 hover:text-cyan-800 hover:underline cursor-pointer"
                              >
                                Thu gọn
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {(showAllImages ? imageAttachments : imageAttachments.slice(0, 4)).map((item, index) => {
                            const isLastItemAndHasMore = !showAllImages && imageAttachments.length > 4 && index === 3;
                            if (isLastItemAndHasMore) {
                              return (
                                <div
                                  key={item.id}
                                  onClick={() => setShowAllImages(true)}
                                  className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 cursor-pointer group"
                                >
                                  <img
                                    src={item.preview!}
                                    alt="Preview"
                                    className="w-full h-full object-cover brightness-50 group-hover:scale-105 transition-transform duration-200"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white font-bold text-sm">
                                    +{imageAttachments.length - 3}
                                  </div>
                                </div>
                              );
                            }
                            return (
                              <div key={item.id} className="relative w-16 h-16 rounded-lg border border-slate-200 group">
                                <div className="w-full h-full rounded-lg overflow-hidden relative">
                                  <img src={item.preview!} alt="Preview" className="w-full h-full object-cover" />
                                  {item.isUploading ? (
                                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-[10px] font-bold select-none">
                                      <span>{item.uploadProgress}%</span>
                                      <div className="w-10 bg-white/30 h-1 rounded-full mt-1 overflow-hidden">
                                        <div
                                          className="bg-[#0CBFDF] h-full transition-all duration-150"
                                          style={{ width: `${item.uploadProgress}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div
                                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer"
                                      onClick={() => setPreviewUrl(item.preview!)}
                                    >
                                      <div className="bg-transparent text-white/90 rounded-full p-1.5 transition-colors shadow-xs">
                                        <Eye className="w-5 h-5" />
                                      </div>
                                    </div>
                                  )}
                                </div>
                                {!item.isUploading && (
                                  <Button
                                    variant="ghost"
                                    disabled={isPending}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveFile(item.id);
                                    }}
                                    className="absolute -top-1.5 -right-1.5 text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-full w-5 h-5 p-0 flex items-center justify-center transition-colors cursor-pointer shadow-xs z-10 min-w-0 disabled:cursor-not-allowed"
                                    title="Xóa ảnh"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                {/* Nhóm tài liệu */}
                {mode === 'view'
                  ? /* Readonly Files for View Mode */
                    detailFiles.length > 0 && (
                      <div className="flex flex-col gap-2 w-full">
                        <span className="text-xs font-semibold text-slate-500 select-none">Tài liệu đính kèm ({detailFiles.length})</span>
                        <div className="flex flex-wrap gap-3">
                          {detailFiles.map((att) => {
                            const ext = att.name.split('.').pop() || 'FILE';
                            return (
                              <a
                                key={att.id}
                                href={att.path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2.5 p-2 bg-slate-50 border border-slate-200 rounded-xl max-w-50 md:max-w-xs shrink-0 relative overflow-hidden group hover:border-slate-350 transition-colors"
                              >
                                <div className="w-8 h-8 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center shrink-0 font-black text-[9px] uppercase border border-rose-100">
                                  {ext}
                                </div>
                                <div className="flex flex-col gap-0.5 overflow-hidden flex-1">
                                  <span className="text-xs font-bold text-slate-700 truncate group-hover:text-cyan-700 transition-colors">
                                    {att.name}
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-bold uppercase">Click để xem/tải</span>
                                </div>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )
                  : /* Editable Files for Create/Edit Modes */
                    fileAttachments.length > 0 && (
                      <div className="flex flex-col gap-2 w-full">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-500 select-none">Tài liệu đính kèm ({fileAttachments.length})</span>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              disabled={isPending || attachments.some((att) => att.isUploading)}
                              onClick={() => {
                                setAttachments((prev: any[]) => prev.filter((att) => !!att.preview));
                              }}
                              className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline disabled:text-rose-350 disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
                            >
                              Xóa toàn bộ tài liệu
                            </button>
                            {showAllFiles && fileAttachments.length > 4 && (
                              <button
                                type="button"
                                onClick={() => setShowAllFiles(false)}
                                className="text-[11px] font-bold text-cyan-700 hover:text-cyan-800 hover:underline cursor-pointer"
                              >
                                Thu gọn
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {(showAllFiles ? fileAttachments : fileAttachments.slice(0, 4)).map((item, index) => {
                            const isLastItemAndHasMore = !showAllFiles && fileAttachments.length > 4 && index === 3;
                            if (isLastItemAndHasMore) {
                              return (
                                <div
                                  key={item.id}
                                  onClick={() => setShowAllFiles(true)}
                                  className="flex items-center justify-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 border border-slate-350 border-dashed rounded-xl cursor-pointer shrink-0 h-12 min-w-30"
                                >
                                  <span className="text-xs font-bold text-slate-650">+{fileAttachments.length - 3} file khác</span>
                                </div>
                              );
                            }
                            return (
                              <div
                                key={item.id}
                                className="flex items-center gap-2.5 p-2 bg-slate-50 border border-slate-200 rounded-xl max-w-50 md:max-w-xs shrink-0 relative overflow-hidden"
                              >
                                <div className="w-8 h-8 bg-cyan-50 text-cyan-700 rounded-lg flex items-center justify-center shrink-0 font-black text-[9px] uppercase border border-cyan-100">
                                  {item.name.split('.').pop() || 'FILE'}
                                </div>
                                <div className="flex flex-col gap-0.5 overflow-hidden flex-1">
                                  <span className="text-xs font-bold text-slate-700 truncate max-w-25 md:max-w-30">{item.name}</span>
                                  {item.isUploading ? (
                                    <span className="text-[9px] text-[#0CBFDF] font-bold">Đang tải... {item.uploadProgress}%</span>
                                  ) : (
                                    <span className="text-[9px] text-slate-450 font-bold">
                                      {item.size ? `${(item.size / 1024 / 1024).toFixed(2)} MB` : 'Tài liệu'}
                                    </span>
                                  )}
                                </div>
                                {item.isUploading ? (
                                  <div
                                    className="absolute bottom-0 left-0 h-1 bg-[#0CBFDF] transition-all duration-200"
                                    style={{ width: `${item.uploadProgress}%` }}
                                  ></div>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={isPending}
                                    onClick={() => handleRemoveFile(item.id)}
                                    className="text-slate-400 hover:text-slate-600 disabled:text-slate-300 rounded-full p-1 transition-colors shrink-0 cursor-pointer disabled:cursor-not-allowed"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
              </div>
            </div>

            <Textarea
              label="Vấn đề tồn tại"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              disabled={isPending || mode === 'view'}
              rows={4}
              fullWidth
            />

            {/* Phản hồi chính thức (Review/Response Section) - ONLY FOR VIEW MODE */}
            {mode === 'view' &&
              selectedSuggestion &&
              (selectedSuggestion.status === 'pending' ? null : (
                <div className="flex flex-col gap-4 mt-2">
                  <hr className="border-t border-slate-200 my-2" />
                  <span className="text-sm font-bold text-[#006377] select-none tracking-wider uppercase">PHẢN HỒI ĐỀ XUẤT:</span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Người phản hồi"
                      value={`${selectedSuggestion.reviewBy?.fullName} (${selectedSuggestion.reviewBy?.email})` || 'Ban Giám Đốc'}
                      disabled
                      fullWidth
                    />
                    <Input
                      label="Thời gian phản hồi"
                      value={selectedSuggestion.updatedAt ? formatDateTime(selectedSuggestion.updatedAt) : 'N/A'}
                      disabled
                      fullWidth
                    />
                  </div>

                  <Textarea
                    label="Chi tiết phản hồi"
                    value={selectedSuggestion.review || 'Chưa có phản hồi từ Ban giám đốc đối với đề xuất này.'}
                    disabled
                    rows={4}
                    fullWidth
                  />
                </div>
              ))}
          </form>
        </Modal>
      )}

      {/* Modal xác nhận xóa */}
      {selectedSuggestion && (
        <Modal
          isOpen={isDeleteConfirmOpen}
          onClose={() => {
            if (isPending) return;
            setIsDeleteConfirmOpen(false);
            if (!isDetailModalOpen) {
              setSelectedSuggestion(null);
            }
          }}
          title="Xác nhận xóa"
          size="sm"
          disabled={isPending}
          footer={
            <div className="flex items-center gap-3 w-full justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  if (!isDetailModalOpen) {
                    setSelectedSuggestion(null);
                  }
                }}
                disabled={deleteMutation.isPending}
              >
                Hủy
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  deleteMutation.mutate(selectedSuggestion.id);
                }}
                loading={deleteMutation.isPending}
              >
                Xác nhận
              </Button>
            </div>
          }
        >
          <p className="text-gray-600 text-sm">Bạn có chắc chắn muốn xóa đề xuất này? Hành động này không thể hoàn tác.</p>
        </Modal>
      )}

      {/* Lightbox Preview */}
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

      {/* Upload Progress Overlay */}
      {uploadProgress !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-9999 flex flex-col items-center justify-center animate-fade-in">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4 max-w-sm w-full mx-4 border border-slate-100 dark:border-slate-700">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-cyan-100 dark:border-cyan-900 rounded-full"></div>
              <div
                className="absolute inset-0 border-4 border-[#0CBFDF] rounded-full transition-all duration-300 ease-out"
                style={{
                  clipPath: `polygon(50% 50%, 50% 0%, ${uploadProgress >= 12.5 ? '100% 0%,' : ''} ${uploadProgress >= 37.5 ? '100% 100%,' : ''} ${
                    uploadProgress >= 62.5 ? '0% 100%,' : ''
                  } ${uploadProgress >= 87.5 ? '0% 0%,' : ''} ${uploadProgress >= 100 ? '100% 0%,' : ''} 50% 0%)`,
                  transform: 'rotate(-90deg)',
                }}
              ></div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{uploadProgress}%</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 w-full">
              <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                {mode === 'create' ? 'Đang gửi đề xuất & tải tài liệu...' : 'Đang lưu đề xuất & tải tài liệu...'}
              </span>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-linear-to-r from-cyan-400 to-cyan-600 h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <SuggestionFeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        type={feedbackType}
        onSubmit={handleFeedbackSubmit}
        isPending={updateStatusMutation.isPending}
      />

      {/* Modal xác nhận đóng form khi có thay đổi chưa lưu */}
      <Modal
        isOpen={isCloseConfirmOpen}
        onClose={() => setIsCloseConfirmOpen(false)}
        title="Xác nhận đóng form"
        className="m-2 max-w-md w-full"
      >
        <div className="py-2">
          <p className="text-gray-600 text-sm leading-relaxed">
            Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn đóng form và hủy các nội dung đang nhập không?
          </p>
        </div>
        <div className="flex gap-3 justify-end w-full mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCloseConfirmOpen(false)}
          >
            Tiếp tục chỉnh sửa
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleConfirmClose}
          >
            Xác nhận đóng
          </Button>
        </div>
      </Modal>
    </>
  );
}
