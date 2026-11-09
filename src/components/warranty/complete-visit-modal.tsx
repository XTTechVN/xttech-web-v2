'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { completeWarrantyVisit, updateWarrantyVisit } from '@/actions';
import { Button } from '../button';
import { Input } from '../input';
import { Modal } from '../modal';
import { Textarea } from '../textarea';
import { showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import type { EvidenceMediaItem, WarrantyVisit } from '@/types';
import { WarrantyEvidenceUploader } from './warranty-evidence-uploader';

const parseCommaList = (raw: string): string[] =>
  raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

interface CompleteVisitModalProps {
  projectId: number;
  visit: WarrantyVisit | null;
  onClose: () => void;
}

export function CompleteVisitModal({ projectId, visit, onClose }: CompleteVisitModalProps) {
  return (
    <Modal
      isOpen={Boolean(visit)}
      onClose={onClose}
      title={`Biên bản kiểm tra & hoàn thành ${visit?.code || ''}`}
      className="max-w-lg w-full"
    >
      {visit && (
        <CompleteVisitForm
          key={visit.id}
          projectId={projectId}
          visit={visit}
          onClose={onClose}
        />
      )}
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
  const [diagnosisNote, setDiagnosisNote] = useState(visit.diagnosisNote || '');
  const [damagedPartsRaw, setDamagedPartsRaw] = useState(visit.damagedParts.join(', '));
  const [repairActions, setRepairActions] = useState(visit.repairActions || '');
  const [replacedPartsRaw, setReplacedPartsRaw] = useState(visit.replacedParts.join(', '));
  const [resultNote, setResultNote] = useState(visit.resultNote || '');
  const [photos, setPhotos] = useState<EvidenceMediaItem[]>(visit.photos || []);
  const [isInScope, setIsInScope] = useState(visit.isInScope);
  const [isChargeable, setIsChargeable] = useState(visit.isChargeable);
  const [fee, setFee] = useState(String(visit.feeAmount || 0));
  const [scopeNote, setScopeNote] = useState(visit.scopeNote || '');

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['project_warranty', projectId] });
    void queryClient.invalidateQueries({ queryKey: ['project_overview', projectId] });
    void queryClient.invalidateQueries({ queryKey: ['global_warranty_queue'] });
    void queryClient.invalidateQueries({ queryKey: ['global_warranty_badge'] });
  };

  const saveDraft = useMutation({
    mutationFn: () =>
      updateWarrantyVisit(projectId, visit.id, {
        diagnosisNote: diagnosisNote.trim() || null,
        damagedParts: parseCommaList(damagedPartsRaw),
        repairActions: repairActions.trim() || null,
        replacedParts: parseCommaList(replacedPartsRaw),
        isInScope,
        isChargeable,
        feeAmount: isChargeable ? Number(fee) || 0 : 0,
        scopeNote: scopeNote.trim() || null,
      }),
    onSuccess: () => {
      refresh();
      toast.success('Đã lưu biên bản kiểm tra kỹ thuật');
      onClose();
    },
    onError: (error) => showErrorToast(error, 'Không lưu được biên bản kiểm tra'),
  });

  const complete = useMutation({
    mutationFn: () =>
      completeWarrantyVisit(projectId, visit.id, {
        diagnosisNote: diagnosisNote.trim() || null,
        damagedParts: parseCommaList(damagedPartsRaw),
        repairActions: repairActions.trim() || null,
        replacedParts: parseCommaList(replacedPartsRaw),
        resultNote: resultNote.trim() || repairActions.trim() || 'Đã hoàn thành xử lý bảo hành',
        photos,
        isInScope,
        isChargeable,
        feeAmount: isChargeable ? Number(fee) || 0 : 0,
        scopeNote: scopeNote.trim() || null,
      }),
    onSuccess: () => {
      refresh();
      toast.success('Đã hoàn thành & đóng phiếu bảo hành');
      onClose();
    },
    onError: (error) => showErrorToast(error, 'Không hoàn thành được đợt bảo hành'),
  });

  return (
    <div className="max-h-[75vh] space-y-3 overflow-y-auto pr-1 text-xs">
      <div className="rounded-lg bg-slate-50 p-3">
        <div className="font-semibold text-slate-800">{visit.title}</div>
        {visit.issueDescription && (
          <p className="mt-1 text-slate-600">Khách báo: {visit.issueDescription}</p>
        )}
      </div>

      <Textarea
        label="1. Chẩn đoán kỹ thuật (Hỏng gì / Nguyên nhân)"
        placeholder="Mô tả chi tiết bộ phận hư hỏng phát hiện tại công trình..."
        value={diagnosisNote}
        onChange={(e) => setDiagnosisNote(e.target.value)}
        rows={2}
        fullWidth
      />
      <Input
        label="Danh sách bộ phận bị hỏng (cách nhau dấu phẩy)"
        placeholder="VD: Bản lề chữ A, Khóa đa điểm..."
        value={damagedPartsRaw}
        onChange={(e) => setDamagedPartsRaw(e.target.value)}
        fullWidth
      />

      <Textarea
        label="2. Biện pháp xử lý / Sửa chữa thực tế"
        placeholder="Mô tả kỹ thuật đã xử lý hoặc căn chỉnh..."
        value={repairActions}
        onChange={(e) => setRepairActions(e.target.value)}
        rows={2}
        fullWidth
      />
      <Input
        label="Vật tư / phụ kiện đã thay thế (cách nhau dấu phẩy)"
        placeholder="VD: Lõi khóa Kinlong, Gioăng EPDM..."
        value={replacedPartsRaw}
        onChange={(e) => setReplacedPartsRaw(e.target.value)}
        fullWidth
      />

      <div className="space-y-2 rounded-lg bg-slate-50 p-3">
        <div className="font-semibold text-slate-700">3. Phạm vi bảo hành & Chi phí thực tế</div>
        <div className="flex flex-wrap gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-slate-700">
            <input
              type="checkbox"
              checked={isInScope}
              onChange={(e) => {
                setIsInScope(e.target.checked);
                if (e.target.checked) setIsChargeable(false);
              }}
            />
            <span>Trong phạm vi bảo hành</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-slate-700">
            <input
              type="checkbox"
              checked={isChargeable}
              onChange={(e) => setIsChargeable(e.target.checked)}
            />
            <span>Có tính phí</span>
          </label>
        </div>
        {isChargeable && (
          <Input
            label="Phí thực thu (VND)"
            type="number"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            fullWidth
          />
        )}
        <Input
          label="Ghi chú phạm vi / chi phí"
          value={scopeNote}
          onChange={(e) => setScopeNote(e.target.value)}
          fullWidth
        />
      </div>

      <Textarea
        label="4. Kết quả nghiệm thu bàn giao *"
        value={resultNote}
        onChange={(e) => setResultNote(e.target.value)}
        rows={2}
        fullWidth
      />
      <WarrantyEvidenceUploader
        projectId={projectId}
        value={photos}
        onChange={setPhotos}
        label="Ảnh / Video bảo hành thực tế *"
        required
      />

      <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3">
        <Button variant="outline" size="sm" onClick={onClose}>
          Đóng
        </Button>
        <Button
          variant="outline"
          size="sm"
          loading={saveDraft.isPending}
          onClick={() => saveDraft.mutate()}
        >
          Lưu biên bản kiểm tra
        </Button>
        <Button
          size="sm"
          disabled={
            photos.length === 0 ||
            (resultNote.trim().length < 3 && repairActions.trim().length < 3)
          }
          loading={complete.isPending}
          onClick={() => complete.mutate()}
        >
          Hoàn thành & Đóng phiếu
        </Button>
      </div>
    </div>
  );
}
