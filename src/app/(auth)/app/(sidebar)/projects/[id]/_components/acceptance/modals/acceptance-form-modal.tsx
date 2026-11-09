'use client';

import React, { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { createProjectAcceptance } from '@/actions';
import { Button, Input, Modal, Textarea } from '@/components';
import { showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import type {
  AcceptanceItemInput,
  AcceptanceItemResult,
  EvidenceMediaItem,
  ProjectDoorPosition,
  SignatureInput,
} from '@/types';
import { EvidenceUploader, SignatureFields } from '../../shared';

type SignMode = 'onsite' | 'link' | 'later';

interface DoorEvalState {
  checked: boolean;
  result: AcceptanceItemResult;
  note: string;
}

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
    <Modal isOpen={isOpen} onClose={onClose} title="Lập biên bản nghiệm thu" className="max-w-3xl w-full">
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
  const [evalMap, setEvalMap] = useState<Record<number, DoorEvalState>>(() => {
    const initial: Record<number, DoorEvalState> = {};
    installedPositions.forEach((p) => {
      initial[p.id] = { checked: true, result: 'passed', note: '' };
    });
    return initial;
  });

  const [photos, setPhotos] = useState<EvidenceMediaItem[]>([]);
  const [note, setNote] = useState('');
  const [mode, setMode] = useState<SignMode>('onsite');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [companySignature, setCompanySignature] = useState<SignatureInput | null>(null);
  const [customerSignature, setCustomerSignature] = useState<SignatureInput | null>(null);

  const selectedItems = useMemo<AcceptanceItemInput[]>(() => {
    const list: AcceptanceItemInput[] = [];
    installedPositions.forEach((pos) => {
      const st = evalMap[pos.id];
      if (st?.checked) {
        list.push({
          positionId: pos.id,
          result: st.result,
          note: st.note.trim() || undefined,
        });
      }
    });
    return list;
  }, [installedPositions, evalMap]);

  const passedCount = useMemo(
    () => selectedItems.filter((it) => it.result === 'passed').length,
    [selectedItems],
  );
  const failedCount = useMemo(
    () => selectedItems.filter((it) => it.result === 'failed').length,
    [selectedItems],
  );

  const updateDoorEval = (id: number, patch: Partial<DoorEvalState>) => {
    setEvalMap((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? { checked: true, result: 'passed', note: '' }), ...patch },
    }));
  };

  const toggleAll = (checked: boolean) => {
    setEvalMap((prev) => {
      const next = { ...prev };
      installedPositions.forEach((p) => {
        next[p.id] = { ...(next[p.id] ?? { result: 'passed', note: '' }), checked };
      });
      return next;
    });
  };

  const create = useMutation({
    mutationFn: () =>
      createProjectAcceptance(projectId, {
        positionIds: selectedItems.map((it) => it.positionId),
        items: selectedItems,
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
          ? `Biên bản ${result.code} đã đủ chữ ký 2 bên (${passedCount} cửa đạt, ${failedCount} cửa hẹn nghiệm thu lại)`
          : `Đã lập biên bản ${result.code}, đang chờ khách ký`,
      );
      onClose();
    },
    onError: (error) => showErrorToast(error, 'Không lập được biên bản nghiệm thu'),
  });

  const isReady = useMemo(
    () =>
      selectedItems.length > 0 &&
      photos.length > 0 &&
      Boolean(companySignature) &&
      (mode !== 'onsite' || Boolean(customerSignature)),
    [selectedItems, photos, companySignature, customerSignature, mode],
  );

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <span>Danh sách bộ cửa nghiệm thu ({selectedItems.length}/{installedPositions.length})</span>
            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
              {passedCount} Đạt
            </span>
            {failedCount > 0 && (
              <span className="rounded bg-red-50 px-1.5 py-0.5 text-[11px] font-bold text-red-600 border border-red-200">
                {failedCount} Chưa đạt (sẽ nghiệm thu lại lần sau)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => toggleAll(true)}
              className="cursor-pointer font-semibold text-primary hover:underline"
            >
              Chọn tất cả
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => toggleAll(false)}
              className="cursor-pointer font-semibold text-slate-500 hover:underline"
            >
              Bỏ chọn
            </button>
          </div>
        </div>

        <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/50 p-2">
          {installedPositions.map((position) => {
            const st = evalMap[position.id] ?? { checked: true, result: 'passed', note: '' };
            const isPassed = st.result === 'passed';

            return (
              <div
                key={position.id}
                className={`rounded-md border p-2.5 transition-colors ${
                  !st.checked
                    ? 'border-slate-200 bg-slate-100/60 opacity-60'
                    : isPassed
                      ? 'border-emerald-200/80 bg-white'
                      : 'border-red-200 bg-red-50/30'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="flex cursor-pointer items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={st.checked}
                      onChange={(e) => updateDoorEval(position.id, { checked: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    <span className="font-bold text-slate-800">{position.code}</span>
                    <span className="text-slate-500">
                      · {position.description || `${position.width} × ${position.height} mm`}
                    </span>
                    {position.floor?.name && (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                        {position.floor.name}
                      </span>
                    )}
                  </label>

                  {st.checked && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateDoorEval(position.id, { result: 'passed' })}
                        className={`inline-flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold transition-colors ${
                          isPassed
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <CheckCircle2 size={12} />
                        Đạt
                      </button>
                      <button
                        type="button"
                        onClick={() => updateDoorEval(position.id, { result: 'failed' })}
                        className={`inline-flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold transition-colors ${
                          !isPassed
                            ? 'bg-red-600 text-white shadow-2xs'
                            : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <XCircle size={12} />
                        Không đạt
                      </button>
                    </div>
                  )}
                </div>

                {st.checked && (
                  <div className="mt-2 pl-6">
                    <input
                      type="text"
                      value={st.note}
                      onChange={(e) => updateDoorEval(position.id, { note: e.target.value })}
                      placeholder={
                        isPassed
                          ? 'Ghi chú nghiệm thu cho bộ cửa này (tùy chọn)...'
                          : 'Nhập lý do chưa đạt cần khắc phục (VD: Chỉnh lại bản lề, thay kính...) *'
                      }
                      className={`w-full rounded border px-2.5 py-1 text-xs outline-none ${
                        isPassed
                          ? 'border-slate-200 bg-slate-50/50 focus:border-primary focus:bg-white'
                          : 'border-red-300 bg-white text-red-800 placeholder:text-red-400 focus:border-red-500'
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <EvidenceUploader projectId={projectId} value={photos} onChange={setPhotos} label="Ảnh nghiệm thu thực tế" required />
      <Textarea label="Ghi chú chung của biên bản" value={note} onChange={(e) => setNote(e.target.value)} rows={2} fullWidth />

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
