'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileCheck, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Modal, Button, Switch, Textarea } from '@/components';
import { createAppVersion } from '@/actions';
import toast from 'react-hot-toast';
import { showErrorToast } from '@/utils';

interface ReleaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReleaseModal({ isOpen, onClose, onSuccess }: ReleaseModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [changelogText, setChangelogText] = useState('');
  const [forceUpdate, setForceUpdate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.apk')) {
        setErrorMsg('Vui lòng chỉ chọn file cài đặt Android (.apk)');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setErrorMsg('');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.name.endsWith('.apk')) {
        setErrorMsg('Vui lòng chỉ chọn file cài đặt Android (.apk)');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setErrorMsg('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Vui lòng chọn file APK để phát hành');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('platform', 'android');
      formData.append('force_update', String(forceUpdate));

      // Parse changelog thành mảng các dòng
      const lines = changelogText
        .split('\n')
        .map((l) => l.trim().replace(/^[-*•]\s*/, ''))
        .filter(Boolean);
      formData.append('changelog', JSON.stringify(lines.length > 0 ? lines : ['Cập nhật tối ưu ứng dụng']));

      await createAppVersion(formData);
      toast.success('Phát hành phiên bản mới thành công!');
      onSuccess();
      handleClose();
    } catch (err: unknown) {
      const msg = showErrorToast(err, 'Lỗi phát hành phiên bản mới');
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setChangelogText('');
    setForceUpdate(false);
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Phát hành phiên bản ứng dụng mới"
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-1">
        {/* Vùng tải lên file APK */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            File cài đặt APK <span className="text-red-500">*</span>
          </label>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".apk"
            className="hidden"
          />

          {!selectedFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-200 hover:border-primary rounded-xl p-6 text-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-gray-50 flex flex-col items-center justify-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="text-xs text-gray-600">
                <span className="font-semibold text-primary">Bấm để chọn file</span> hoặc kéo thả file vào đây
              </div>
              <p className="text-[11px] text-gray-400">Chỉ chấp nhận file định dạng .apk (tối đa 100MB)</p>
            </div>
          ) : (
            <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{selectedFile.name}</p>
                  <p className="text-[11px] text-gray-500">
                    {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB • Tự động nhận diện version
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-white transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Nội dung cập nhật Changelog */}
        <Textarea
          label="Nội dung cập nhật (Changelog)"
          value={changelogText}
          onChange={(e) => setChangelogText(e.target.value)}
          rows={4}
          fullWidth
          placeholder="Nhập các điểm mới (mỗi dòng một tính năng)&#10;Ví dụ:&#10;- Nâng cấp hệ thống định vị GPS&#10;- Sửa lỗi kết nối camera"
        />

        {/* Switch Bắt buộc cập nhật */}
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-800">Bắt buộc cập nhật</span>
            <span className="text-[11px] text-gray-500">
              Nhân viên bắt buộc phải cập nhật bản mới để tiếp tục sử dụng app
            </span>
          </div>
          <Switch
            checked={forceUpdate}
            onChange={(e) => setForceUpdate(e.target.checked)}
          />
        </div>

        {/* Thông báo lỗi nếu có */}
        {errorMsg && (
          <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-600">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Nút hành động chuẩn hệ thống */}
        <div className="flex gap-2 justify-end w-full mt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<CheckCircle2 size={16} />}
            type="submit"
            disabled={isSubmitting || !selectedFile}
            loading={isSubmitting}
          >
            Xác nhận phát hành
          </Button>
        </div>
      </form>
    </Modal>
  );
}
