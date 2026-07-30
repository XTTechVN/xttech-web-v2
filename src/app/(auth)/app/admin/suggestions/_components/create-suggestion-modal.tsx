/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useRef } from 'react';
import { Send, Upload, X } from 'lucide-react';
import { useSuggestionStore } from '@/stores/useSuggestionStore';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Input, Textarea, Checkbox, Button, Alert, Select } from '@/components';
import { createSuggestion } from '@/actions/suggestion';
import { AttachmentItem } from '@/types';

export default function CreateSuggestionModal() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isCreateModalOpen,
    setCreateModalOpen,
    createTitle: title,
    setCreateTitle: setTitle,
    createType: type,
    setCreateType: setType,
    createProblem: problem,
    setCreateProblem: setProblem,
    createIsAnonymous: isAnonymous,
    setCreateIsAnonymous: setIsAnonymous,
    createAttachments: attachments,
    setCreateAttachments: setAttachments,
    createErrors: errors,
    setCreateErrors: setErrors,
    resetCreateForm,
  } = useSuggestionStore();

  // Reset form helper
  const handleResetForm = () => {
    attachments.forEach((att) => {
      if (att.preview) URL.revokeObjectURL(att.preview);
    });
    resetCreateForm();
  };

  // Form dirty state check
  const isDirty = title.trim() !== '' || problem.trim() !== '' || attachments.length > 0;

  const handleClose = () => {
    if (isDirty) {
      if (confirm('Bạn có thay đổi chưa lưu. Bạn có chắc muốn đóng form?')) {
        handleResetForm();
        setCreateModalOpen(false);
      }
    } else {
      setCreateModalOpen(false);
    }
  };

  // React Query Mutation
  const createMutation = useMutation({
    mutationFn: async ({ data, files }: { data: any; files?: File[] }) => {
      return await createSuggestion(data, files);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-suggestions-all-stats'] });
      toast.success('Gửi đề xuất thành công!');
      handleResetForm();
      setCreateModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Có lỗi xảy ra khi gửi đề xuất.');
    },
  });

  const createError = createMutation.error
    ? (createMutation.error as any).response?.data?.message ||
      (createMutation.error as any).response?.data?.detail ||
      createMutation.error.message ||
      'Có lỗi xảy ra khi gửi đề xuất.'
    : null;

  // Validation before submission
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Vui lòng nhập chủ đề đề xuất.';
    }

    if (!problem.trim()) {
      newErrors.problem = 'Vui lòng nhập chi tiết vấn đề tồn tại.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại các thông tin nhập vào!');
      return;
    }

    const payload = {
      title: title.trim(),
      content: `${problem.trim()}`,
      anonymous: isAnonymous,
      type: type,
    };

    createMutation.mutate({
      data: payload,
      files: attachments.length > 0 ? attachments.map((att) => att.file) : undefined,
    });
  };

  // Attachment Upload Handling
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
      setAttachments((prev) => [...prev, ...newAttachments]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (id: string) => {
    setAttachments((prev) => {
      const item = prev.find((att) => att.id === id);
      if (item && item.preview) {
        URL.revokeObjectURL(item.preview);
      }
      return prev.filter((att) => att.id !== id);
    });
  };

  const footer = (
    <div className="flex items-center gap-3">
      <Button variant="outline" onClick={handleClose} disabled={createMutation.isPending}>
        Hủy bỏ
      </Button>
      <Button
        type="submit"
        variant="primary"
        onClick={handleSubmit}
        loading={createMutation.isPending}
        disabled={createMutation.isPending || !title.trim() || !problem.trim()}
        leftIcon={<Send className="w-3.5 h-3.5" />}
      >
        Gửi ý kiến
      </Button>
    </div>
  );

  return (
    <Modal isOpen={isCreateModalOpen} onClose={handleClose} title="TẠO ĐỀ XUẤT & SÁNG KIẾN MỚI" size="xl" footer={footer}>
      {createError && (
        <Alert variant="danger" className="mb-4">
          {createError}
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Title */}
        <Input
          label="Chủ đề đề xuất"
          placeholder="Nhập tên đề xuất (Ví dụ: Đề xuất cải tạo khu pantry...)"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
          }}
          error={errors.title}
          disabled={createMutation.isPending}
          fullWidth
        />

        <Select
          label="Loại đề xuất"
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
          disabled={createMutation.isPending}
          className="w-full"
        />

        {/* Anonymous Check */}
        <div className="flex items-center px-1 py-1">
          <Checkbox
            label="Gửi dưới dạng ẩn danh"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            disabled={createMutation.isPending}
          />
        </div>

        {/* File / Image Attachment */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-gray-700 select-none">
            File hoặc hình ảnh đính kèm (Cho phép chọn nhiều. Tối đa: Ảnh 2MB, Tài liệu 5MB)
          </span>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/webp,image/jpg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="hidden"
                disabled={createMutation.isPending}
                multiple
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={createMutation.isPending}
                leftIcon={<Upload className="w-4 h-4" />}
              >
                Chọn file
              </Button>
            </div>

            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-3 max-w-full">
                {attachments.map((item) => (
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
                          <span className="text-[9px] text-slate-450 font-bold">{(item.size / 1024 / 1024).toFixed(2)} MB</span>
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

        {/* Problem */}
        <Textarea
          label="Vấn đề tồn tại"
          placeholder="Nêu rõ chi tiết, hiện trạng vấn đề khó khăn, bất cập đang gặp phải..."
          value={problem}
          onChange={(e) => {
            setProblem(e.target.value);
            if (errors.problem) setErrors((prev) => ({ ...prev, problem: '' }));
          }}
          error={errors.problem}
          disabled={createMutation.isPending}
          rows={3}
          fullWidth
        />
      </form>
    </Modal>
  );
}
