/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useRef } from 'react';
import { Check, Trash2, User, Upload, X, AlertCircle, Paperclip, UserLock, SendHorizontal, Forward } from 'lucide-react';
import { useSuggestionStore } from '@/stores/useSuggestionStore';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Select, Button, Textarea, Input, Alert } from '@/components';
import { reviewSuggestion, deleteSuggestion, updateSuggestion } from '@/actions/suggestion';
import { Suggestion } from '@/types';

// Helper labels for suggestion categories
const categoryLabels: Record<string, string> = {
  process: 'Cải tiến quy trình làm việc',
  product: 'Cải tiến sản phẩm/dịch vụ',
  technology: 'Đề xuất kỹ thuật, CNTT',
  cost: 'Tiết kiệm chi phí',
  quality: 'Nâng cao chất lượng',
  safety: 'An toàn lao động',
  workplace: 'Môi trường làm việc',
  welfare: 'Chế độ, phúc lợi',
  training: 'Đào tạo, phát triển nhân sự',
  customer: 'Chăm sóc khách hàng',
  complaint: 'Phản ánh, khiếu nại',
  other: 'Khác',
};

// Helper labels and classes for statuses
const getStatusDetails = (status: string) => {
  const map: Record<string, { label: string; class: string }> = {
    pending: { label: 'Chờ xử lý', class: 'bg-amber-50 text-amber-700 border-amber-200' },
    approve: { label: 'Đã duyệt', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    reject: { label: 'Từ chối', class: 'bg-rose-50 text-rose-700 border-rose-200' },
  };
  return map[status] || { label: 'Không rõ', class: 'bg-slate-100 text-slate-600 border-slate-200' };
};

function SuggestionDetailModalInner({ selectedSuggestion }: { selectedSuggestion: Suggestion }) {
  const queryClient = useQueryClient();

  const setDetailModalOpen = useSuggestionStore((state) => state.setDetailModalOpen);
  const setSelectedSuggestion = useSuggestionStore((state) => state.setSelectedSuggestion);
  const isDetailModalOpen = useSuggestionStore((state) => state.isDetailModalOpen);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse content to extract type, problem, and solution
  const getParsedContent = (content: string, pType?: string) => {
    const parts = content.split('|||');
    if (parts.length === 3) {
      return {
        type: parts[0],
        problem: parts[1],
      };
    } else if (parts.length === 2) {
      return {
        type: pType || 'other',
        problem: parts[0],
      };
    } else {
      return {
        type: pType || 'other',
        problem: content,
      };
    }
  };

  const { type, problem } = getParsedContent(selectedSuggestion.content, (selectedSuggestion as any).type);

  const {
    reviewText,
    setReviewText,
    isEditing,
    setIsEditing,
    editType,
    setEditType,
    editTitle,
    setEditTitle,
    editProblem,
    setEditProblem,
    editAttachments,
    setEditAttachments,
    isDeleteConfirmOpen,
    setIsDeleteConfirmOpen,
    isSaving,
    setIsSaving,
  } = useSuggestionStore();

  interface AttachmentItem {
    id: string;
    file?: File;
    name: string;
    size?: number;
    preview: string | null;
    isExisting?: boolean;
    path?: string;
  }

  React.useEffect(() => {
    if (selectedSuggestion) {
      const { type: parsedType, problem: parsedProb } = getParsedContent(selectedSuggestion.content, (selectedSuggestion as any).type);
      setReviewText(selectedSuggestion.review || '');
      setIsEditing(false);
      setEditType(parsedType || 'process');
      setEditTitle(selectedSuggestion.title || '');
      setEditProblem(parsedProb || '');
      setEditAttachments(
        selectedSuggestion.attachments?.map((att) => {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://dev-xt-api-v2.up.railway.app';
          const fullPath = att.path.startsWith('http') ? att.path : `${baseUrl}${att.path}`;
          const isImg = /\.(jpg|jpeg|png|webp)$/i.test(fullPath);
          const fileName = fullPath.split('/').pop() || 'document.pdf';
          return {
            id: `existing-${att.id}`,
            name: fileName,
            preview: isImg ? fullPath : null,
            isExisting: true,
            path: fullPath,
          };
        }) || [],
      );
      setIsDeleteConfirmOpen(false);
      setIsSaving(false);
    }
  }, [
    selectedSuggestion,
    setReviewText,
    setIsEditing,
    setEditTitle,
    setEditProblem,
    setEditAttachments,
    setIsDeleteConfirmOpen,
    setIsSaving,
    setEditType,
  ]);

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, review }: { id: number; status: 'approve' | 'reject'; review: string }) => {
      return await reviewSuggestion(id, { status, review });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-suggestions-all-stats'] });
      toast.success('Gửi phản hồi thành công!');
      setDetailModalOpen(false);
      setSelectedSuggestion(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Có lỗi xảy ra khi phê duyệt.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await deleteSuggestion(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-suggestions-all-stats'] });
      toast.success('Xóa đề xuất thành công!');
      setDetailModalOpen(false);
      setSelectedSuggestion(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Có lỗi xảy ra khi xóa đề xuất.');
    },
  });

  const updateSuggestionMutation = useMutation({
    mutationFn: async ({ id, data, files }: { id: number; data: any; files?: File[] }) => {
      return await updateSuggestion(id, data, files);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-suggestions-all-stats'] });
      toast.success('Chỉnh sửa ý kiến thành công!');
      setIsEditing(false);
      setDetailModalOpen(false);
      setSelectedSuggestion(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Có lỗi xảy ra khi cập nhật.');
    },
  });

  const isPending = updateStatusMutation.isPending || deleteMutation.isPending || updateSuggestionMutation.isPending || isSaving;

  const errorMessage = updateStatusMutation.error?.message || deleteMutation.error?.message || updateSuggestionMutation.error?.message || null;

  const handleDelete = () => {
    setIsDeleteConfirmOpen(true);
  };

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

      const sizeLimit = isImage ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > sizeLimit) {
        toast.error(`Dung lượng file "${file.name}" vượt quá giới hạn cho phép (${isImage ? '2MB đối với ảnh' : '5MB đối với tài liệu'})!`);
        return;
      }

      const id = `${file.name}-${file.size}-${Date.now()}`;
      let preview: string | null = null;
      if (isImage) {
        preview = URL.createObjectURL(file);
      }

      newAttachments.push({
        id,
        file,
        name: file.name,
        size: file.size,
        preview,
      });
    });

    if (newAttachments.length > 0) {
      setEditAttachments((prev) => [...prev, ...newAttachments]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (id: string) => {
    setEditAttachments((prev) => {
      const item = prev.find((att) => att.id === id);
      if (item && item.preview) {
        URL.revokeObjectURL(item.preview);
      }
      return prev.filter((att) => att.id !== id);
    });
  };

  const handleAdminSubmit = (statusVal: 'approve' | 'reject') => {
    if (!reviewText.trim()) {
      toast.error('Vui lòng nhập nội dung phản hồi chính thức!');
      return;
    }
    updateStatusMutation.mutate({
      id: selectedSuggestion.id,
      status: statusVal,
      review: reviewText.trim(),
    });
  };

  const handleForward = () => {
    toast.success('Đã chuyển tiếp đề xuất này tới Ban giám đốc thành công!');
  };

  const canEdit = selectedSuggestion.status === 'pending';
  const canDelete = true;

  const formattedDate = selectedSuggestion.createdAt ? new Date(selectedSuggestion.createdAt).toLocaleDateString('vi-VN') : 'N/A';

  const senderName = selectedSuggestion.anonymous ? 'Ẩn danh' : selectedSuggestion.user?.fullName || 'Ẩn danh';
  const senderAvatar = selectedSuggestion.anonymous ? null : selectedSuggestion.user?.avatar;
  const deptName = (selectedSuggestion as any).department || (selectedSuggestion.user as any)?.department || 'Thành viên';

  const footer = (
    <div className="flex items-center justify-between w-full">
      {canDelete && !isEditing ? (
        <Button
          variant="danger"
          onClick={handleDelete}
          loading={deleteMutation.isPending}
          disabled={isPending}
          leftIcon={<Trash2 className="w-4 h-4" />}
        >
          Xóa ý kiến
        </Button>
      ) : (
        <div />
      )}

      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={() => setIsEditing(false)} disabled={updateSuggestionMutation.isPending}>
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={async () => {
                setIsSaving(true);
                try {
                  const files = await Promise.all(
                    editAttachments.map(async (att) => {
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
                  );
                  const validFiles = files.filter((f): f is File => f !== null);

                  updateSuggestionMutation.mutate({
                    id: selectedSuggestion.id,
                    data: {
                      title: editTitle,
                      content: editProblem.trim(),
                      type: editType,
                    },
                    files: validFiles,
                  });
                } catch (err) {
                  console.log(err);
                  toast.error('Có lỗi xảy ra khi xử lý file đính kèm.');
                } finally {
                  setIsSaving(false);
                }
              }}
              loading={updateSuggestionMutation.isPending || isSaving}
              disabled={!editTitle.trim() || !editProblem.trim() || isPending}
              leftIcon={<Check className="w-4 h-4" />}
            >
              Lưu
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={() => {
                setDetailModalOpen(false);
                setSelectedSuggestion(null);
              }}
              disabled={isPending}
            >
              Đóng
            </Button>
            {canEdit && (
              <Button variant="primary" onClick={() => setIsEditing(true)} disabled={isPending}>
                Sửa ý kiến
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isDetailModalOpen}
      onClose={() => {
        if (!isPending) {
          setDetailModalOpen(false);
          setSelectedSuggestion(null);
        }
      }}
      size="xl"
      footer={footer}
      className="[&>div:first-child]:border-b-0 [&>div:first-child]:pb-0"
    >
      {errorMessage && (
        <Alert variant="danger" className="mb-4">
          {errorMessage}
        </Alert>
      )}

      {isEditing ? (
        <div className="flex flex-col gap-4">
          <Input label="Chủ đề đề xuất" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} disabled={isPending} fullWidth />

          <Select
            label="Loại đề xuất"
            value={editType}
            onChange={(e) => setEditType(e.target.value)}
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
            disabled={isPending}
            className="w-full mb-4"
          />

          {/* File / Image Attachment */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-gray-700 select-none">
              File hoặc hình ảnh đính kèm mới (Cho phép chọn nhiều. Thay thế hoàn toàn file/ảnh cũ)
            </span>

            <div className="flex flex-col gap-3">
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

              {editAttachments.length > 0 && (
                <div className="flex flex-wrap gap-3 max-w-full">
                  {editAttachments.map((item) => (
                    <div key={item.id} className="shrink-0 max-w-50 md:max-w-xs">
                      {item.preview ? (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200">
                          <img src={item.preview} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(item.id)}
                            className="absolute top-0.5 right-0.5 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full p-0.5 transition-colors cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                          <div className="w-8 h-8 bg-cyan-50 text-cyan-700 rounded-lg flex items-center justify-center shrink-0 font-black text-[9px] uppercase border border-cyan-100">
                            {item.name.split('.').pop() || 'FILE'}
                          </div>
                          <div className="flex flex-col gap-0.5 overflow-hidden">
                            <span className="text-xs font-bold text-slate-700 truncate max-w-25 md:max-w-30">{item.name}</span>
                            <span className="text-[9px] text-slate-450 font-bold">
                              {item.size ? `${(item.size / 1024 / 1024).toFixed(2)} MB` : 'Tài liệu'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(item.id)}
                            className="text-slate-400 hover:text-slate-600 rounded-full p-1 transition-colors shrink-0 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Textarea
            label="Vấn đề tồn tại"
            value={editProblem}
            onChange={(e) => setEditProblem(e.target.value)}
            disabled={isPending}
            rows={4}
            fullWidth
          />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Header Layout based on design */}
          <div className="border border-cyan-100 bg-cyan-50/20 rounded-2xl py-3 px-6 flex flex-col gap-2">
            <div className="flex items-center justify-between select-none">
              <span className="text-[12px] font-bold text-[#0891b2] tracking-wider uppercase">{categoryLabels[type] || 'Ý kiến đóng góp khác'}</span>
            </div>
            <h2 className="text-[30px] md:text-[24px] font-bold text-slate-800 leading-snug">{selectedSuggestion.title}</h2>
            {/* Sender card in dark teal */}
            <div className="flex items-center gap-3 py-1 px-4 bg-[#005a70] text-white rounded-xl select-none shadow-xs w-fit">
              {senderAvatar ? (
                <div className="relative w-9 h-9 rounded-full overflow-hidden border border-white/20 shrink-0">
                  <img src={senderAvatar} alt={senderName} width={36} height={36} className="object-cover" />
                </div>
              ) : selectedSuggestion.anonymous ? (
                <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 shrink-0 flex items-center justify-center text-white">
                  <UserLock className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 shrink-0 flex items-center justify-center text-white">
                  <User className="w-4 h-4" />
                </div>
              )}

              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-sm leading-tight text-[#F8F8F8]">{senderName}</span>
                <span className="text-[12px] text-white font-normal">
                  {deptName} • {formattedDate}
                </span>
              </div>
            </div>
          </div>

          {/* 2-Column Responsive Body */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-6 items-start">
            {/* Left Column (Content Areas) */}
            <div className="flex flex-col gap-5">
              {/* Vấn đề tồn tại */}
              <div className="border border-rose-100 bg-rose-50/20 rounded-2xl p-4.5 flex flex-col gap-3">
                <span className="text-[18px] md:text-[16px] font-bold text-[#F87171] tracking-wider flex items-center gap-2 select-none">
                  <AlertCircle className="w-4.5 h-4.5 text-[#F87171] shrink-0" />
                  Vấn đề tồn tại
                </span>
                <p className="text-[#404040] text-[16px] md:text-sm leading-relaxed whitespace-pre-line font-medium">{problem}</p>
              </div>

              {/* Attachments Section */}
              {selectedSuggestion.attachments && selectedSuggestion.attachments.length > 0 && (
                <div className="border border-slate-100 bg-slate-50/20 rounded-2xl p-4.5 flex flex-col gap-3">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2 select-none">
                    <Paperclip className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                    Tài liệu đính kèm
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedSuggestion.attachments.map((att) => {
                      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://dev-xt-api-v2.up.railway.app';
                      const fullPath = att.path.startsWith('http') ? att.path : `${baseUrl}${att.path}`;
                      const isImg = /\.(jpg|jpeg|png|webp)$/i.test(fullPath);
                      const fileName = fullPath.split('/').pop() || 'document.pdf';
                      if (isImg) {
                        return (
                          <a
                            key={att.id}
                            href={fullPath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 group cursor-pointer shadow-xs block"
                          >
                            <img src={fullPath} alt="Attachment" className="w-full h-full object-cover" />
                            <div className="absolute bottom-0 inset-x-0 bg-slate-900/60 backdrop-blur-xs px-2.5 py-1.5 flex items-center justify-between text-[10px] text-white font-bold">
                              <span className="truncate pr-2">{fileName}</span>
                            </div>
                          </a>
                        );
                      }
                      return (
                        <a
                          key={att.id}
                          href={fullPath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="items-center gap-3 p-3 bg-white border border-slate-150 rounded-xl hover:shadow-xs transition-shadow group block"
                        >
                          <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-black text-rose-500">PDF</span>
                          </div>
                          <div className="flex flex-col gap-0.5 overflow-hidden">
                            <span className="text-xs font-bold text-slate-700 truncate group-hover:text-cyan-600 transition-colors">{fileName}</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase">Tài liệu</span>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column (Review & Actions Panel) */}
            <div className="flex flex-col gap-5">
              <div className="border border-cyan-100 rounded-2xl overflow-hidden bg-white shadow-xs flex flex-col">
                <div className="bg-[#006377] text-white py-1 text-[18px] md:text-[16px] font-bold tracking-wider text-center select-none">
                  Phản hồi chính thức
                </div>

                <div className="bg-[#E6F8FB] border-b border-t border-cyan-100 px-4 py-2 text-sm font-normal text-[#006275] leading-relaxed select-none">
                  Nội dung này sẽ được gửi trực tiếp đến người gửi phản hồi.
                </div>

                {selectedSuggestion.status === 'pending' ? (
                  <div className="flex flex-col">
                    <textarea
                      className="w-full min-h-40 p-4 text-xs font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none resize-none border-0"
                      placeholder="Chào bạn, cảm ơn bạn đã góp ý..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      disabled={isPending}
                    />
                    <div className="p-4 border-t border-cyan-100 flex flex-col gap-3">
                      <Button
                        variant="primary"
                        className="w-full bg-[#0CBFDF] hover:bg-[#0bb1ce] border-0 text-white font-bold text-sm py-3 rounded-lg shadow-xs cursor-pointer flex items-center justify-center gap-2"
                        onClick={() => handleAdminSubmit('approve')}
                        loading={updateStatusMutation.isPending}
                        leftIcon={<SendHorizontal className="w-4 h-4 text-white" />}
                      >
                        Gửi lại phản hồi
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-2 border-slate-200 hover:border-slate-350 text-slate-600 hover:bg-slate-50 font-bold text-sm py-3 rounded-lg cursor-pointer flex items-center justify-center gap-2"
                        onClick={handleForward}
                        disabled={isPending}
                        leftIcon={<Forward className="w-4 h-4" />}
                      >
                        Chuyển tiếp cho Ban giám đốc
                      </Button>
                      <Button
                        variant="primary"
                        className="w-full bg-rose-500 hover:bg-rose-600 border-0 text-white font-bold text-sm py-3 rounded-lg shadow-xs cursor-pointer flex items-center justify-center gap-2"
                        onClick={() => handleAdminSubmit('reject')}
                        loading={updateStatusMutation.isPending}
                        leftIcon={<X className="w-4 h-4 text-white" />}
                      >
                        Từ chối đề xuất
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <div className="p-4 text-xs font-bold text-slate-650 min-h-40 bg-slate-50/30 leading-relaxed whitespace-pre-line">
                      {selectedSuggestion.review || 'Chưa có phản hồi từ Ban giám đốc đối với đề xuất này.'}
                    </div>
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/10">
                      <span className="font-bold text-slate-500 select-none">Trạng thái:</span>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[10px] font-black border ${getStatusDetails(selectedSuggestion.status).class}`}
                      >
                        {getStatusDetails(selectedSuggestion.status).label}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal xác nhận xóa */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        title="Xác nhận xóa"
        size="sm"
        footer={
          <div className="flex items-center gap-3 w-full justify-end">
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)} disabled={deleteMutation.isPending}>
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
    </Modal>
  );
}

export default function SuggestionDetailModal() {
  const selectedSuggestion = useSuggestionStore((state) => state.selectedSuggestion) as unknown as Suggestion | null;
  const isDetailModalOpen = useSuggestionStore((state) => state.isDetailModalOpen);

  if (!isDetailModalOpen || !selectedSuggestion) return null;

  return <SuggestionDetailModalInner key={selectedSuggestion.id} selectedSuggestion={selectedSuggestion} />;
}
