'use client';

import React, { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createProjectAcceptance } from '@/actions';
import { Button, Input, Modal, Textarea } from '@/components';
import { showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import type { EvidenceMediaItem, ProjectDoorPosition, SignatureInput } from '@/types';
import { EvidenceUploader, SignatureFields } from '../../shared';

type SignMode = 'onsite' | 'link' | 'later';

interface AcceptanceFormModalProps {
  projectId: number;
  isOpen: boolean;
  onClose: () => void;
  installedPositions: ProjectDoorPosition[];
}

const SIGN_MODE_OPTIONS: { value: SignMode; label: string; hint: string }[] = [
  { value: 'onsite', label: 'Khách ký tại công trình', hint: 'Khách ký ngay trên thiết bị này' },
  { value: 'link', label: 'Gửi link ký online', hint: 'Gửi email cho khách ký từ xa' },
  { value: 'later', label: 'Lưu, khách ký sau', hint: 'Tạo biên bản, gửi link sau' },
];

export function AcceptanceFormModal({ projectId, isOpen, onClose, installedPositions }: AcceptanceFormModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Lập biên bản nghiệm thu" className="max-w-2xl w-full">
      {isOpen && (
        <AcceptanceForm projectId={projectId} installedPositions={installedPositions} onClose={onClose} />
      )}
    </Modal>
  );
}

function AcceptanceForm({
  projectId,
  installedPositions,
  onClose,
}: Omit<AcceptanceFormModalProps, 'isOpen'>) {
  const [selectedIds, setSelectedIds] = useState<number[]>(() => installedPositions.map((p) => p.id));
  const [photos, setPhotos] = useState<EvidenceMediaItem[]>([]);
  const [note, setNote] = useState('');
  const [mode, setMode] = useState<SignMode>('onsite');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [companySignature, setCompanySignature] = useState<SignatureInput | null>(null);
  const [customerSignature, setCustomerSignature] = useState<SignatureInput | null>(null);

  const create = useMutation({
    mutationFn: () =>
      createProjectAcceptance(projectId, {
        positionIds: selectedIds,
        photos,
        note: note.trim() || undefined,
        companySignature: companySignature as SignatureInput,
        customerSignature: mode === 'onsite' ? (customerSignature ?? undefined) : undefined,
        sendLink: mode === 'link',
        recipientEmail: recipientEmail.trim() || undefined,
      }),
    onSuccess: (result) => {
      ['project_acceptances', 'progress_matrix', 'project_positions', 'project', 'project_overview', 'project_warranty'].forEach(
        (key) => queryClient.invalidateQueries({ queryKey: [key, projectId] }),
      );
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success(
        result.status === 'signed'
          ? `Biên bản ${result.code} đã đủ chữ ký 2 bên — dự án đủ điều kiện hoàn thành`
          : `Đã lập biên bản ${result.code}, đang chờ khách ký`,
      );
      onClose();
    },
    onError: (error) => showErrorToast(error, 'Không lập được biên bản nghiệm thu'),
  });

  const toggle = (id: number) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));

  const isReady = useMemo(
    () =>
      selectedIds.length > 0 &&
      photos.length > 0 &&
      Boolean(companySignature) &&
      (mode !== 'onsite' || Boolean(customerSignature)),
    [selectedIds, photos, companySignature, customerSignature, mode],
  );

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <div className="text-xs font-semibold text-slate-700">Các bộ cửa nghiệm thu ({selectedIds.length})</div>
        <div className="grid max-h-36 grid-cols-3 gap-1.5 overflow-y-auto sm:grid-cols-4">
          {installedPositions.map((position) => (
            <label
              key={position.id}
              className="flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-200 px-2 py-1 text-xs"
            >
              <input type="checkbox" checked={selectedIds.includes(position.id)} onChange={() => toggle(position.id)} />
              <span className="truncate font-medium text-slate-700">{position.code}</span>
            </label>
          ))}
        </div>
      </div>

      <EvidenceUploader projectId={projectId} value={photos} onChange={setPhotos} label="Ảnh nghiệm thu thực tế" required />
      <Textarea label="Ghi chú nghiệm thu" value={note} onChange={(e) => setNote(e.target.value)} rows={2} fullWidth />

      <SignatureFields title="Chữ ký đại diện công ty" defaultTitle="Giám sát thi công" onChange={setCompanySignature} />

      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-700">Chữ ký khách hàng</div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {SIGN_MODE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setMode(option.value)}
              className={`cursor-pointer rounded-lg border p-2 text-left transition-colors ${
                mode === option.value ? 'border-primary bg-primary/5' : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="text-xs font-semibold text-slate-800">{option.label}</div>
              <div className="text-[10px] text-slate-500">{option.hint}</div>
            </button>
          ))}
        </div>
        {mode === 'onsite' && (
          <SignatureFields title="Khách hàng ký xác nhận" defaultTitle="Chủ nhà" onChange={setCustomerSignature} />
        )}
        {mode === 'link' && (
          <Input
            label="Email nhận link (để trống = email khách hàng của dự án)"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            fullWidth
          />
        )}
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
        <Button variant="outline" size="sm" onClick={onClose}>
          Đóng
        </Button>
        <Button size="sm" disabled={!isReady} loading={create.isPending} onClick={() => create.mutate()}>
          {mode === 'onsite' ? 'Hoàn tất nghiệm thu' : 'Lập biên bản'}
        </Button>
      </div>
    </div>
  );
}
