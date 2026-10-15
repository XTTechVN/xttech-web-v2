'use client';

import React, { useState, useRef } from 'react';
import { Modal, Button, Input, Textarea } from '@/components';
import { createDocumentVersion } from '@/actions/document';
import { formatBytes, getFileVisualInfo } from '../_utils/doc-helpers';
import toast from 'react-hot-toast';
import { Upload, FileUp, X } from 'lucide-react';
import type { DocumentItem } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

interface UploadVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
  onSuccess?: () => void;
}

const versionSchema = z.object({
  versionNumber: z.string().optional(),
  changeSummary: z.string().optional(),
});

type VersionFormValues = z.infer<typeof versionSchema>;

export const UploadVersionModal: React.FC<UploadVersionModalProps> = ({ isOpen, onClose, document: doc, onSuccess }) => {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VersionFormValues>({
    resolver: zodResolver(versionSchema),
    defaultValues: {
      versionNumber: '',
      changeSummary: '',
    },
  });

  const uploadVersionMutation = useMutation({
    mutationFn: async ({ data, file }: { data: VersionFormValues; file: File }) => {
      if (!doc?.id) throw new Error('Không tìm thấy tài liệu');
      const formData = new FormData();
      formData.append('file', file);
      if (data.versionNumber?.trim()) {
        formData.append('version_number', data.versionNumber.trim());
        formData.append('versionNumber', data.versionNumber.trim());
      }
      if (data.changeSummary?.trim()) {
        formData.append('change_summary', data.changeSummary.trim());
        formData.append('changeSummary', data.changeSummary.trim());
      }

      return createDocumentVersion(doc.id, formData);
    },
    onSuccess: () => {
      toast.success('Tải lên phiên bản mới thành công!');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      if (doc?.id) {
        queryClient.invalidateQueries({ queryKey: ['document-detail', doc.id] });
      }
      onSuccess?.();
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Không thể tải lên phiên bản mới');
    },
  });

  const handleClose = () => {
    setFile(null);
    setFileError(null);
    reset();
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 50 * 1024 * 1024) {
        setFileError('Kích thước tệp không được vượt quá 50MB');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setFileError(null);
    }
  };

  const onSubmit = (data: VersionFormValues) => {
    if (!file) {
      setFileError('Vui lòng chọn tệp tin phiên bản mới');
      return;
    }
    uploadVersionMutation.mutate({ data, file });
  };

  const visualInfo = file ? getFileVisualInfo(file.name, file.type) : null;
  const loading = uploadVersionMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Tải lên phiên bản mới"
      size="md"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="danger" onClick={handleClose} disabled={loading}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmit(onSubmit)} loading={loading} disabled={loading}>
            Tải lên phiên bản
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* File Upload Drop Area */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 block">
            Tệp tài liệu mới <span className="text-rose-500">*</span>
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
              fileError
                ? 'border-rose-400 bg-rose-50/20'
                : file
                  ? 'border-primary/50 bg-primary/5'
                  : 'border-slate-300 hover:border-primary/50 hover:bg-slate-50'
            }`}
          >
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            {file ? (
              <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${visualInfo?.bgColor || 'bg-slate-100'}`}>
                    <FileUp size={20} className="text-primary" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">{file.name}</p>
                    <p className="text-[11px] text-slate-500">{formatBytes(file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-2 text-slate-500">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                  <Upload size={20} />
                </div>
                <p className="text-xs font-medium text-slate-700">Nhấp để tải lên tệp phiên bản mới</p>
                <p className="text-[11px] text-slate-400 mt-1">Hỗ trợ PDF, DOCX, XLSX, hình ảnh (tối đa 50MB)</p>
              </div>
            )}
          </div>
          {fileError && <p className="text-[11px] text-rose-500">{fileError}</p>}
        </div>

        {/* Số phiên bản (Tùy chọn) */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Mã / Số phiên bản (Tùy chọn)</label>
          <Input placeholder="Ví dụ: 1.1, 2.0 (Để trống hệ thống sẽ tự tính)" {...register('versionNumber')} error={errors.versionNumber?.message} />
        </div>

        {/* Ghi chú tóm tắt thay đổi */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Ghi chú thay đổi (Change Summary)</label>
          <Textarea rows={3} placeholder="Mô tả tóm tắt nội dung thay đổi hoặc cập nhật trong phiên bản này..." {...register('changeSummary')} />
        </div>
      </form>
    </Modal>
  );
};
