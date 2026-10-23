'use client';

import React, { useRef, useState } from 'react';
import { ArrowRight, ImagePlus, Loader2, Trash2, Upload, Video } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadProgressEvidence } from '@/actions';
import { Button, Modal, Textarea } from '@/components';
import { BASE_MINIO_URL } from '@/config';
import { cn } from '@/utils/cn';
import type { EvidenceMediaItem, ProgressStepCode, ProjectDoorPosition } from '@/types';
import { useAdvanceProgress } from '../hooks';
import { getNextStep, PROGRESS_STEP_LABEL } from '../utils';

interface ProgressUpdateModalProps {
  projectId: number;
  isOpen: boolean;
  onClose: () => void;
  selectedPositions: ProjectDoorPosition[];
  currentStep?: ProgressStepCode;
  onSuccess: () => void;
}

const isValidMediaFile = (file: File): boolean =>
  file.type.startsWith('image/') || file.type.startsWith('video/');

const getMediaUrl = (url: string): string =>
  url.startsWith('http') ? url : `${BASE_MINIO_URL}/${url.startsWith('/') ? url.slice(1) : url}`;

export function ProgressUpdateModal({
  projectId,
  isOpen,
  onClose,
  selectedPositions,
  currentStep,
  onSuccess,
}: ProgressUpdateModalProps) {
  const [note, setNote] = useState('');
  const [evidenceMedia, setEvidenceMedia] = useState<EvidenceMediaItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const targetStep = currentStep ? getNextStep(currentStep) : null;

  const resetAndClose = () => {
    setNote('');
    setEvidenceMedia([]);
    setIsDragging(false);
    onClose();
  };

  const advance = useAdvanceProgress(projectId, () => {
    onSuccess();
    resetAndClose();
  });

  const processUploadFiles = async (rawFiles: FileList | File[]) => {
    const fileArray = Array.from(rawFiles);
    if (fileArray.length === 0) return;

    const validFiles = fileArray.filter(isValidMediaFile);
    if (validFiles.length < fileArray.length) {
      toast.error('Chỉ hỗ trợ định dạng tệp Hình ảnh hoặc Video');
    }
    if (validFiles.length === 0) return;

    setIsUploading(true);
    try {
      const results = await Promise.all(
        validFiles.map((file) => uploadProgressEvidence(projectId, file)),
      );
      setEvidenceMedia((prev) => [
        ...prev,
        ...results.map((r) => ({ url: r.url, name: r.name, type: r.type })),
      ]);
      toast.success(`Đã tải lên ${results.length} tệp nghiệm thu`);
    } catch {
      toast.error('Lỗi khi tải tệp lên');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!isUploading && e.dataTransfer.files?.length) {
      void processUploadFiles(e.dataTransfer.files);
    }
  };

  const handleSubmit = () => {
    if (!targetStep) {
      toast.error('Không xác định được mốc tiến độ tiếp theo');
      return;
    }
    advance.mutate({
      positionIds: selectedPositions.map((p) => p.id),
      targetStep,
      note: note.trim() || undefined,
      evidenceMedia: evidenceMedia.length > 0 ? evidenceMedia : undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title="Cập nhật tiến độ & Nghiệm thu cửa"
      size="md"
    >
      <div className="space-y-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">
              Ảnh / Video nghiệm thu ({evidenceMedia.length}):
            </label>
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary-hover disabled:opacity-50"
            >
              <Upload size={13} />
              <span>Thêm ảnh / video</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              disabled={isUploading}
              onChange={(e) => e.target.files && void processUploadFiles(e.target.files)}
            />
          </div>

          <div
            onDragEnter={handleDragOver}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading && evidenceMedia.length === 0 && fileInputRef.current?.click()}
            className={cn(
              'rounded-lg border-2 border-dashed p-3 transition-all',
              isDragging
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                : 'border-slate-200 hover:border-primary/40 bg-slate-50/40',
              evidenceMedia.length === 0 && !isUploading && 'cursor-pointer py-5',
            )}
          >
            {isUploading ? (
              <div className="flex items-center justify-center gap-2 py-4 text-xs text-primary">
                <Loader2 size={15} className="animate-spin" />
                <span>Đang tải tệp nghiệm thu lên...</span>
              </div>
            ) : evidenceMedia.length > 0 ? (
              <div className="space-y-2">
                <div className="grid max-h-40 grid-cols-4 gap-2 overflow-y-auto pr-0.5">
                  {evidenceMedia.map((item, idx) => (
                    <div
                      key={`${item.url}-${idx}`}
                      className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-white"
                    >
                      {item.type === 'video' ? (
                        <div className="flex flex-col items-center gap-1 text-slate-500">
                          <Video size={20} />
                          <span className="max-w-[60px] truncate text-[9px]">{item.name}</span>
                        </div>
                      ) : (
                        <img
                          src={getMediaUrl(item.url)}
                          alt={item.name || 'Nghiệm thu'}
                          className="h-full w-full object-cover"
                        />
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEvidenceMedia((prev) => prev.filter((_, i) => i !== idx));
                        }}
                        className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-rose-600 cursor-pointer"
                        title="Xóa tệp này"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-center text-[11px] text-slate-400">
                  Kéo thả thêm ảnh/video vào khung này hoặc bấm &quot;Thêm ảnh / video&quot;
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-1.5 text-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ImagePlus size={18} />
                </div>
                <p className="text-xs font-medium text-slate-600">
                  Kéo thả ảnh/video vào đây hoặc <span className="font-semibold text-primary">bấm để chọn tệp</span>
                </p>
                <span className="text-[11px] text-slate-400">
                  Hỗ trợ tải lên nhiều hình ảnh &amp; video nghiệm thu cùng lúc
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-slate-200/80 bg-slate-50 p-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Mốc hiện tại:</span>
            <span className="text-xs font-bold text-slate-700">
              {currentStep ? PROGRESS_STEP_LABEL[currentStep] : '---'}
            </span>
          </div>
          <ArrowRight size={14} className="text-primary" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Chuyển sang:</span>
            <span className="text-xs font-bold text-primary">
              {targetStep ? PROGRESS_STEP_LABEL[targetStep] : '---'}
            </span>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            Các bộ cửa áp dụng ({selectedPositions.length} cửa):
          </label>
          <div className="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/50 p-2">
            {selectedPositions.map((pos) => (
              <span
                key={pos.id}
                className="inline-flex items-center rounded border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-bold text-slate-700 shadow-2xs"
              >
                {pos.code}
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            Ghi chú / Nhận xét chất lượng / Nghiệm thu:
          </label>
          <Textarea
            rows={3}
            placeholder="Nhập ghi chú chi tiết hoặc lưu ý hiện trường (tùy chọn)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full text-xs"
          />
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-2">
          <Button variant="outline" size="sm" onClick={resetAndClose} disabled={advance.isPending}>
            Hủy
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={advance.isPending || !targetStep || selectedPositions.length === 0}
          >
            {advance.isPending ? (
              <span className="flex items-center gap-1.5">
                <Loader2 size={13} className="animate-spin" />
                Đang lưu...
              </span>
            ) : (
              'Xác nhận chuyển mốc'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
