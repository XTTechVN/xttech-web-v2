'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { completeWarrantyVisit, updateWarrantyVisit } from '@/actions';
import { Button, Input, Modal, Textarea } from '@/components';
import { showErrorToast } from '@/utils';
import type { EvidenceMediaItem, WarrantyVisit } from '@/types';
import { parseCommaList } from './qr-helpers';
import { QrMediaUploader } from './qr-media-uploader';

interface QrTechInspectModalProps {
  token: string;
  projectId: number;
  visit: WarrantyVisit | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function QrTechInspectModal({
  token,
  projectId,
  visit,
  onClose,
  onSuccess,
}: QrTechInspectModalProps) {
  return (
    <Modal
      isOpen={Boolean(visit)}
      onClose={onClose}
      title={visit ? `Biên bản kỹ thuật · ${visit.code}` : ''}
      className="max-w-lg w-full"
    >
      {visit && (
        <QrTechInspectForm
          key={visit.id}
          token={token}
          projectId={projectId}
          visit={visit}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      )}
    </Modal>
  );
}

function QrTechInspectForm({
  token,
  projectId,
  visit,
  onClose,
  onSuccess,
}: {
  token: string;
  projectId: number;
  visit: WarrantyVisit;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [diagnosisNote, setDiagnosisNote] = useState(visit.diagnosisNote || '');
  const [damagedPartsRaw, setDamagedPartsRaw] = useState(visit.damagedParts.join(', '));
  const [repairActions, setRepairActions] = useState(visit.repairActions || '');
  const [replacedPartsRaw, setReplacedPartsRaw] = useState(visit.replacedParts.join(', '));
  const [resultNote, setResultNote] = useState(visit.resultNote || '');
  const [isInScope, setIsInScope] = useState(visit.isInScope);
  const [isChargeable, setIsChargeable] = useState(visit.isChargeable);
  const [feeAmount, setFeeAmount] = useState(String(visit.feeAmount || 0));
  const [scopeNote, setScopeNote] = useState(visit.scopeNote || '');
  const [photos, setPhotos] = useState<EvidenceMediaItem[]>(visit.photos || []);
  const [isUploading, setIsUploading] = useState(false);

  const saveInspection = useMutation({
    mutationFn: () =>
      updateWarrantyVisit(projectId, visit.id, {
        diagnosisNote: diagnosisNote.trim() || null,
        damagedParts: parseCommaList(damagedPartsRaw),
        repairActions: repairActions.trim() || null,
        replacedParts: parseCommaList(replacedPartsRaw),
        isInScope,
        isChargeable,
        feeAmount: isChargeable ? Number(feeAmount) || 0 : 0,
        scopeNote: scopeNote.trim() || null,
      }),
    onSuccess: () => {
      toast.success('Đã lưu biên bản kiểm tra kỹ thuật');
      onSuccess();
      onClose();
    },
    onError: (err) => showErrorToast(err, 'Không lưu được biên bản kiểm tra'),
  });

  const completeVisit = useMutation({
    mutationFn: () =>
      completeWarrantyVisit(projectId, visit.id, {
        diagnosisNote: diagnosisNote.trim() || null,
        damagedParts: parseCommaList(damagedPartsRaw),
        repairActions: repairActions.trim() || null,
        replacedParts: parseCommaList(replacedPartsRaw),
        resultNote: (resultNote.trim() || repairActions.trim() || 'Đã hoàn thành xử lý bảo hành'),
        photos,
        isInScope,
        isChargeable,
        feeAmount: isChargeable ? Number(feeAmount) || 0 : 0,
        scopeNote: scopeNote.trim() || null,
      }),
    onSuccess: () => {
      toast.success('Đã hoàn thành & đóng phiếu bảo hành');
      onSuccess();
      onClose();
    },
    onError: (err) => showErrorToast(err, 'Không hoàn thành được phiếu bảo hành'),
  });

  return (
    <div className="max-h-[75vh] space-y-3.5 overflow-y-auto pr-1 text-xs">
      <div className="rounded-xl bg-slate-50 p-3">
        <div className="font-semibold text-slate-800">{visit.title}</div>
        {visit.issueDescription && (
          <p className="mt-1 text-slate-600">Khách báo: {visit.issueDescription}</p>
        )}
      </div>

      <Textarea
        label="1. Chẩn đoán kỹ thuật (Hỏng gì / Nguyên nhân)"
        placeholder="Mô tả nguyên nhân hư hỏng sau khi kiểm tra thực tế..."
        value={diagnosisNote}
        onChange={(e) => setDiagnosisNote(e.target.value)}
        rows={2}
        fullWidth
      />
      <Input
        label="Bộ phận / phụ kiện bị hỏng (cách nhau dấu phẩy)"
        placeholder="VD: Bản lề chữ A, Khóa đa điểm, Gioăng EPDM..."
        value={damagedPartsRaw}
        onChange={(e) => setDamagedPartsRaw(e.target.value)}
        fullWidth
      />

      <Textarea
        label="2. Biện pháp xử lý / Sửa chữa"
        placeholder="VD: Căn chỉnh lại bản lề, thay lõi khóa mới, bơm keo chống thấm..."
        value={repairActions}
        onChange={(e) => setRepairActions(e.target.value)}
        rows={2}
        fullWidth
      />
      <Input
        label="Vật tư / linh kiện đã thay thế (cách nhau dấu phẩy)"
        placeholder="VD: Lõi khóa Kinlong, Tay nắm gạt..."
        value={replacedPartsRaw}
        onChange={(e) => setReplacedPartsRaw(e.target.value)}
        fullWidth
      />

      <div className="space-y-2 rounded-xl bg-slate-50 p-3">
        <div className="font-bold text-slate-700">3. Phạm vi bảo hành & Chi phí</div>
        <div className="flex flex-wrap gap-4">
          <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-slate-700">
            <input
              type="checkbox"
              checked={isInScope}
              onChange={(e) => {
                setIsInScope(e.target.checked);
                if (e.target.checked) setIsChargeable(false);
              }}
            />
            <span>Thuộc phạm vi bảo hành</span>
          </label>
          <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-slate-700">
            <input
              type="checkbox"
              checked={isChargeable}
              onChange={(e) => setIsChargeable(e.target.checked)}
            />
            <span>Có thu phí vật tư / sửa chữa</span>
          </label>
        </div>
        {isChargeable && (
          <Input
            label="Số tiền thu (VNĐ)"
            type="number"
            value={feeAmount}
            onChange={(e) => setFeeAmount(e.target.value)}
            fullWidth
          />
        )}
        <Input
          label="Ghi chú phạm vi / chi phí"
          placeholder="Lý do tính phí hoặc ghi chú bảo hành..."
          value={scopeNote}
          onChange={(e) => setScopeNote(e.target.value)}
          fullWidth
        />
      </div>

      <Textarea
        label="4. Kết luận nghiệm thu bàn giao (Bắt buộc khi Hoàn thành)"
        placeholder="Cửa vận hành êm, khóa đóng mở nhẹ nhàng, khách hàng đã kiểm tra..."
        value={resultNote}
        onChange={(e) => setResultNote(e.target.value)}
        rows={2}
        fullWidth
      />

      <div className="space-y-1.5">
        <div className="font-semibold text-slate-700">
          Ảnh / Video sau xử lý (Bắt buộc tối thiểu 1 tệp để Hoàn thành)
        </div>
        <QrMediaUploader
          token={token}
          value={photos}
          onChange={setPhotos}
          buttonLabel="Chụp ảnh / video nghiệm thu sau sửa chữa"
          onUploadingChange={setIsUploading}
        />
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3">
        <Button
          size="sm"
          variant="outline"
          disabled={isUploading}
          loading={saveInspection.isPending}
          onClick={() => saveInspection.mutate()}
        >
          Lưu biên bản kiểm tra
        </Button>
        <Button
          size="sm"
          disabled={isUploading || photos.length === 0 || (resultNote.trim().length < 3 && repairActions.trim().length < 3)}
          loading={completeVisit.isPending}
          onClick={() => completeVisit.mutate()}
        >
          Hoàn thành & Đóng phiếu
        </Button>
      </div>
    </div>
  );
}
