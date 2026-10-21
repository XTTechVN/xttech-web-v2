'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight, Image as ImageIcon, Loader2, Trash2, Upload, Video } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadProgressEvidence } from '@/actions';
import { Button, Modal, Textarea } from '@/components';
import { BASE_MINIO_URL } from '@/config';
import type { EvidenceMediaItem, ProgressStepCode, ProjectDoorPosition } from '@/types';
import { useAdvanceProgress } from './hooks/use-advance-progress';
import { PROGRESS_STEP_LABEL, getNextStep } from './production-labels';

interface ProgressUpdateModalProps {
  projectId: number;
  isOpen: boolean;
  onClose: () => void;
  selectedPositions: ProjectDoorPosition[];
  currentStep?: ProgressStepCode;
  onSuccess: () => void;
}

export function ProgressUpdateModal({
  projectId,
  isOpen,
  onClose,
  selectedPositions,
  currentStep,
  onSuccess,
}: ProgressUpdateModalProps) {
  const [targetStep, setTargetStep] = useState<ProgressStepCode | null>(null);
  const [note, setNote] = useState('');
  const [evidenceMedia, setEvidenceMedia] = useState<EvidenceMediaItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (currentStep) {
      setTargetStep(getNextStep(currentStep));
    }
    setNote('');
    setEvidenceMedia([]);
  }, [currentStep, isOpen]);

  const advance = useAdvanceProgress(projectId, () => {
    onSuccess();
    onClose();
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map((file) =>
        uploadProgressEvidence(projectId, file),
      );
      const results = await Promise.all(uploadPromises);
      setEvidenceMedia((prev) => [
        ...prev,
        ...results.map((r) => ({ url: r.url, name: r.name, type: r.type })),
      ]);
      toast.success(`Đã tải lên ${results.length} tệp nghiệm thu`);
    } catch {
      toast.error('Lỗi khi tải tệp lên');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveMedia = (index: number) => {
    setEvidenceMedia((prev) => prev.filter((_, i) => i !== index));
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

  const getMediaUrl = (url: string) =>
    url.startsWith('http') ? url : `${BASE_MINIO_URL}/${url.startsWith('/') ? url.slice(1) : url}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cập nhật tiến độ & Nghiệm thu cửa"
      size="md"
    >
      <div className="space-y-4">
        {/* Banner tiến trình: Mốc hiện tại -> Mốc mới */}
        <div className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-200/80 p-3">
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

        {/* Danh sách các bộ cửa được chọn */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Các bộ cửa áp dụng ({selectedPositions.length} cửa):
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 rounded-lg border border-slate-200 bg-slate-50/50">
            {selectedPositions.map((pos) => (
              <span
                key={pos.id}
                className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-white border border-slate-200 text-slate-700 shadow-2xs"
              >
                {pos.code}
              </span>
            ))}
          </div>
        </div>

        {/* Ghi chú / Nhận xét KCS */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
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

        {/* Tải lên ảnh / video nghiệm thu */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Ảnh / Video nghiệm thu ({evidenceMedia.length}):
            </label>
            <label className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary-hover cursor-pointer">
              <Upload size={13} />
              <span>Thêm ảnh / video</span>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                disabled={isUploading}
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {isUploading && (
            <div className="flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-primary/40 bg-primary/5 text-primary text-xs">
              <Loader2 size={14} className="animate-spin" />
              <span>Đang tải tệp nghiệm thu lên...</span>
            </div>
          )}

          {evidenceMedia.length > 0 ? (
            <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1.5 border border-slate-200 rounded-lg">
              {evidenceMedia.map((item, idx) => (
                <div
                  key={`${item.url}-${idx}`}
                  className="group relative aspect-square rounded-md overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center"
                >
                  {item.type === 'video' ? (
                    <div className="flex flex-col items-center gap-1 text-slate-500">
                      <Video size={20} />
                      <span className="text-[9px] truncate max-w-[60px]">{item.name}</span>
                    </div>
                  ) : (
                    <img
                      src={getMediaUrl(item.url)}
                      alt={item.name || 'Nghiệm thu'}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveMedia(idx)}
                    className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
                    title="Xóa tệp này"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            !isUploading && (
              <div className="py-4 text-center rounded-lg border border-dashed border-slate-200 text-slate-400 text-xs">
                Chưa có ảnh/video nghiệm thu đính kèm.
              </div>
            )
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose} disabled={advance.isPending}>
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
