'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { completeWarrantyVisit } from '@/actions';
import { Button, Input, Modal, Textarea } from '@/components';
import { showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import type { EvidenceMediaItem, WarrantyVisit } from '@/types';
import { EvidenceUploader } from '../../shared';

interface CompleteVisitModalProps {
  projectId: number;
  visit: WarrantyVisit | null;
  onClose: () => void;
}

export function CompleteVisitModal({ projectId, visit, onClose }: CompleteVisitModalProps) {
  return (
    <Modal
      isOpen={!!visit}
      onClose={onClose}
      title={`Hoàn thành bảo hành ${visit?.code ?? ''}`}
      className="max-w-lg w-full"
    >
      {visit && <CompleteVisitForm projectId={projectId} visit={visit} onClose={onClose} />}
    </Modal>
  );
}

function CompleteVisitForm({
  projectId,
  visit,
  onClose,
}: {
  projectId: number;
  visit: WarrantyVisit;
  onClose: () => void;
}) {
  const [resultNote, setResultNote] = useState('');
  const [photos, setPhotos] = useState<EvidenceMediaItem[]>([]);
  const [fee, setFee] = useState(String(visit.feeAmount));

  const complete = useMutation({
    mutationFn: () =>
      completeWarrantyVisit(projectId, visit.id, {
        resultNote: resultNote.trim(),
        photos,
        feeAmount: visit.isChargeable ? Number(fee) || 0 : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project_warranty', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project_overview', projectId] });
      toast.success('Đã hoàn thành đợt bảo hành');
      onClose();
    },
    onError: (error) => showErrorToast(error, 'Không hoàn thành được đợt bảo hành'),
  });

  return (
    <div className="space-y-3">
      <Textarea
        label="Kết quả xử lý"
        value={resultNote}
        onChange={(e) => setResultNote(e.target.value)}
        rows={3}
        fullWidth
      />
      <EvidenceUploader projectId={projectId} value={photos} onChange={setPhotos} label="Ảnh bảo hành thực tế" required />
      {visit.isChargeable && (
        <Input label="Phí thực thu (VND)" type="number" value={fee} onChange={(e) => setFee(e.target.value)} fullWidth />
      )}
      <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
        <Button variant="outline" size="sm" onClick={onClose}>
          Đóng
        </Button>
        <Button
          size="sm"
          disabled={resultNote.trim().length < 3 || photos.length === 0}
          loading={complete.isPending}
          onClick={() => complete.mutate()}
        >
          Hoàn thành
        </Button>
      </div>
    </div>
  );
}
