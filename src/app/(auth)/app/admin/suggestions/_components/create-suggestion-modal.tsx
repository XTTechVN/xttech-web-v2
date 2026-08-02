/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useRef } from 'react';
import { Send, Upload, X, Eye } from 'lucide-react';
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
    createShowAllImages: showAllImages,
    setCreateShowAllImages: setShowAllImages,
    createShowAllFiles: showAllFiles,
    setCreateShowAllFiles: setShowAllFiles,
    createPreviewUrl: previewUrl,
    setCreatePreviewUrl: setPreviewUrl,
    createUploadProgress: uploadProgress,
    setCreateUploadProgress: setUploadProgress,
  } = useSuggestionStore();

  const imageAttachments = attachments.filter((att) => att.preview);
  const fileAttachments = attachments.filter((att) => !att.preview);

  React.useEffect(() => {
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

  // Reset form helper
  const handleResetForm = () => {
    attachments.forEach((att) => {
      if (att.preview) URL.revokeObjectURL(att.preview);
    });
    setShowAllImages(false);
    setShowAllFiles(false);
    setPreviewUrl(null);
    setUploadProgress(null);
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
      handleResetForm();
      setCreateModalOpen(false);
      setUploadProgress(null);
    },
    onError: (error: any) => {
      const errMsg = error.response?.data?.message || error.response?.data?.detail || error.message || 'Có lỗi xảy ra khi gửi đề xuất.';
      toast.error(errMsg);
      setUploadProgress(null);
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

      const sizeLimit = 20 * 1024 * 1024;
      if (file.size > sizeLimit) {
        toast.error(`Dung lượng file "${file.name}" vượt quá giới hạn cho phép (tối đa 20MB)!`);
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
        isUploading: true,
        uploadProgress: 0,
      });
    });

    if (newAttachments.length > 0) {
      setAttachments((prev) => [...prev, ...newAttachments]);

      // Set of pending IDs for this specific batch of selection
      const pendingIds = new Set(newAttachments.map((att) => att.id));

      // Simulate loading/upload progress for each newly added file
      newAttachments.forEach((newAtt) => {
        let progress = 0;
        // Larger files take slightly longer per step
        const stepTime = 100 + Math.min(400, Math.floor((newAtt.size || 0) / (1024 * 20)));
        const interval = setInterval(() => {
          const step = Math.floor(Math.random() * 15) + 10;
          progress += step;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setAttachments((prev) =>
              prev.map((att) =>
                att.id === newAtt.id ? { ...att, uploadProgress: 100, isUploading: false } : att
              )
            );

            // Remove from pending set for this batch
            pendingIds.delete(newAtt.id);
            if (pendingIds.size === 0) {
              toast.success('Tải file lên thành công!');
            }
          } else {
            setAttachments((prev) =>
              prev.map((att) =>
                att.id === newAtt.id ? { ...att, uploadProgress: progress } : att
              )
            );
          }
        }, stepTime);
      });
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
        disabled={createMutation.isPending || !title.trim() || !problem.trim() || attachments.some((att) => att.isUploading)}
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
          <span className="text-xs font-semibold text-gray-700 select-none">File hoặc hình ảnh đính kèm (Cho phép chọn nhiều, tối đa 20MB/file)</span>

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

            {/* Nhóm hình ảnh */}
            {imageAttachments.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 select-none">Hình ảnh đính kèm ({imageAttachments.length})</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={attachments.some((att) => att.isUploading)}
                      onClick={() => {
                        imageAttachments.forEach((att) => {
                          if (att.preview) URL.revokeObjectURL(att.preview);
                        });
                        setAttachments((prev) => prev.filter((att) => !att.preview));
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
                                <div className="bg-[#0CBFDF] h-full transition-all duration-150" style={{ width: `${item.uploadProgress}%` }}></div>
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFile(item.id);
                            }}
                            className="absolute -top-1.5 -right-1.5 text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-full w-5 h-5 p-0 flex items-center justify-center transition-colors cursor-pointer shadow-xs z-10 min-w-0"
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
            {fileAttachments.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 select-none">Tài liệu đính kèm ({fileAttachments.length})</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={attachments.some((att) => att.isUploading)}
                      onClick={() => {
                        setAttachments((prev) => prev.filter((att) => !!att.preview));
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
                          className="flex items-center justify-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 border border-slate-350 border-dashed rounded-xl cursor-pointer shrink-0 h-12 min-w-[120px]"
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
                            <span className="text-[9px] text-slate-450 font-bold">{(item.size / 1024 / 1024).toFixed(2)} MB</span>
                          )}
                        </div>
                        {item.isUploading ? (
                          <div className="absolute bottom-0 left-0 h-1 bg-[#0CBFDF] transition-all duration-200" style={{ width: `${item.uploadProgress}%` }}></div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(item.id)}
                            className="text-slate-400 hover:text-slate-600 rounded-full p-1 transition-colors shrink-0 cursor-pointer"
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

      {/* Lightbox Preview */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs animate-fade-in"
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center animate-fade-in">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4 max-w-sm w-full mx-4 border border-slate-100 dark:border-slate-700">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-cyan-100 dark:border-cyan-900 rounded-full"></div>
              <div
                className="absolute inset-0 border-4 border-[#0CBFDF] rounded-full transition-all duration-300 ease-out"
                style={{
                  clipPath: `polygon(50% 50%, 50% 0%, ${
                    uploadProgress >= 12.5 ? '100% 0%,' : ''
                  } ${uploadProgress >= 37.5 ? '100% 100%,' : ''} ${
                    uploadProgress >= 62.5 ? '0% 100%,' : ''
                  } ${uploadProgress >= 87.5 ? '0% 0%,' : ''} ${
                    uploadProgress >= 100 ? '100% 0%,' : ''
                  } 50% 0%)`,
                  transform: 'rotate(-90deg)',
                }}
              ></div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{uploadProgress}%</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 w-full">
              <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">Đang gửi đề xuất & tải tài liệu...</span>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-cyan-600 h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
