'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Camera } from 'lucide-react';
import { advanceDoorProgress, revertDoorProgress, uploadProgressEvidence } from '@/actions';
import type { EvidenceMediaItem, ProgressStepCode } from '@/types';
import { BTN_PRIMARY, Field, messageOf } from '../../../_components/form';
import { Select } from '../../../_components/select';
import { Sheet } from '../../../_components/sheet';
import { ADVANCE_LABEL, STEP_LABEL } from './tab-progress';

export type ProgressMode = 'advance' | 'revert';
const ORDER: ProgressStepCode[] = ['draft', 'awaiting_measure', 'surveyed', 'producing', 'factory_done', 'installed', 'accepted'];
const AREA =
  'w-full rounded-rm border border-rm-line bg-rm-surface p-3 text-base text-rm-text outline-none focus-visible:border-rm-primary md:text-sm';

interface Props {
  projectId: number;
  mode: ProgressMode;
  current: ProgressStepCode;
  target?: ProgressStepCode;
  ids: number[];
  onClose: () => void;
  onDone: () => void;
}

// Báo mốc kế tiếp (ghi chú + ảnh/video minh chứng) hoặc lùi mốc (bắt buộc lý do) cho các cửa đã chọn.
export function ProgressSheet({ projectId, mode, current, target, ids, onClose, onDone }: Props) {
  const qc = useQueryClient();
  const back = ORDER.slice(0, Math.max(ORDER.indexOf(current), 0)).reverse();
  const [step, setStep] = useState<string>(back[0] ?? 'surveyed');
  const [note, setNote] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const revert = mode === 'revert';

  const save = useMutation({
    mutationFn: async () => {
      const evidenceMedia: EvidenceMediaItem[] = await Promise.all(files.map((f) => uploadProgressEvidence(projectId, f)));
      const media = evidenceMedia.length ? evidenceMedia : undefined;
      if (revert)
        return revertDoorProgress(projectId, { positionIds: ids, targetStep: step as ProgressStepCode, reason: note.trim(), evidenceMedia: media });
      return advanceDoorProgress(projectId, { positionIds: ids, targetStep: target, note: note.trim() || undefined, evidenceMedia: media });
    },
    onSuccess: () => {
      toast.success(revert ? `Đã lùi ${ids.length} cửa` : `Đã cập nhật ${ids.length} cửa`);
      qc.invalidateQueries({ queryKey: ['project', projectId] });
      qc.invalidateQueries({ queryKey: ['projects'] });
      onDone();
    },
    onError: (e) => toast.error(messageOf(e)),
  });

  return (
    <Sheet open onClose={onClose} title={revert ? `Lùi mốc ${ids.length} cửa` : (ADVANCE_LABEL[target ?? 'factory_done'] ?? 'Cập nhật tiến độ')}>
      <form
        className="flex flex-col gap-4 p-rm-gutter"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <p className="text-sm text-rm-muted">
          {revert ? `Từ "${STEP_LABEL[current]}" về mốc:` : `${ids.length} cửa: ${STEP_LABEL[current]} → ${STEP_LABEL[target ?? current]}`}
        </p>
        {revert && (
          <Field label="Lùi về mốc" id="pg-step">
            <Select id="pg-step" label="Lùi về mốc" value={step} onChange={setStep} options={back.map((s) => ({ value: s, label: STEP_LABEL[s] }))} />
          </Field>
        )}
        <Field label={revert ? 'Lý do (bắt buộc)' : 'Ghi chú (không bắt buộc)'} id="pg-note">
          <textarea id="pg-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} className={AREA} />
        </Field>
        <div>
          <label htmlFor="pg-files" className="flex min-h-rm-tap cursor-pointer items-center gap-2 text-sm text-rm-primary">
            <Camera size={18} className="flex-none" aria-hidden="true" />
            <span className="min-w-0 truncate">
              {files.length ? `${files.length} tệp: ${files.map((f) => f.name).join(', ')}` : 'Chụp / đính kèm ảnh hoặc video'}
            </span>
          </label>
          <input
            id="pg-files"
            type="file"
            accept="image/*,video/*"
            capture="environment"
            multiple
            className="sr-only"
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          />
        </div>
        <button type="submit" disabled={save.isPending || (revert && (!note.trim() || back.length === 0))} className={BTN_PRIMARY}>
          {save.isPending ? 'Đang lưu…' : revert ? 'Lùi mốc' : 'Xác nhận'}
        </button>
      </form>
    </Sheet>
  );
}
