'use client';

import React, { useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { advanceDoorByQr, uploadProgressEvidence } from '@/actions';
import { Button, Textarea } from '@/components';
import type { EvidenceMediaItem, ProgressStepCode } from '@/types';
import { getErrorMessage } from './qr-helpers';

const ACTION_LABEL: Partial<Record<ProgressStepCode, string>> = {
  factory_done: 'Báo đã sản xuất xong - chờ lắp đặt',
  installed: 'Báo đã lắp đặt xong',
};

interface QrStaffProgressBoxProps {
  token: string;
  projectId: number;
  actionSteps: ProgressStepCode[];
  onRefresh: () => void;
}

export function QrStaffProgressBox({
  token,
  projectId,
  actionSteps,
  onRefresh,
}: QrStaffProgressBoxProps) {
  const [selectedStep, setSelectedStep] = useState<ProgressStepCode | null>(null);
  const [note, setNote] = useState('');
  const [evidence, setEvidence] = useState<EvidenceMediaItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList | null) => {
    if (!files) return;
    setIsUploading(true);
    try {
      const results = await Promise.all(
        Array.from(files).map((file) => uploadProgressEvidence(projectId, file)),
      );
      setEvidence((prev) => [
        ...prev,
        ...results.map((r) => ({ url: r.url, name: r.name, type: r.type })),
      ]);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmitProgress = async () => {
    if (!selectedStep) return;
    setIsSubmitting(true);
    try {
      await advanceDoorByQr(token, {
        targetStep: selectedStep,
        note: note.trim() || undefined,
        evidenceMedia: evidence,
      });
      toast.success('Đã cập nhật tiến độ bộ cửa');
      setSelectedStep(null);
      setNote('');
      setEvidence([]);
      onRefresh();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-3 rounded-2xl border border-[#045863]/30 bg-[#045863]/5 p-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-[#045863]">
        Dành cho Kỹ thuật / Thợ cập nhật tiến độ
      </h3>
      <div className="flex flex-wrap gap-2">
        {actionSteps.map((step) => (
          <Button
            key={step}
            size="sm"
            variant={selectedStep === step ? 'primary' : 'outline'}
            onClick={() => setSelectedStep(step)}
            className="min-h-[44px]"
          >
            {ACTION_LABEL[step] || step}
          </Button>
        ))}
      </div>
      {selectedStep && (
        <div className="space-y-2.5">
          <Textarea
            label="Ghi chú nghiệm thu bước"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            fullWidth
          />
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              capture="environment"
              multiple
              hidden
              onChange={(e) => void handleUpload(e.target.files)}
            />
            <Button
              size="sm"
              variant="outline"
              loading={isUploading}
              leftIcon={<Camera size={14} />}
              onClick={() => fileInputRef.current?.click()}
              className="min-h-[44px]"
            >
              Chụp / chọn ảnh ({evidence.length})
            </Button>
          </div>
          <Button
            size="sm"
            fullWidth
            loading={isSubmitting}
            onClick={handleSubmitProgress}
            className="min-h-[44px]"
          >
            Xác nhận cập nhật tiến độ
          </Button>
        </div>
      )}
    </section>
  );
}
