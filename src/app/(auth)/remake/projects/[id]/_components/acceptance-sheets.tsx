'use client';

import { useState } from 'react';
import { createProjectAcceptance, signAcceptanceOnsite } from '@/actions';
import type { AcceptanceItemInput, AcceptanceItemResult, EvidenceMediaItem, ProjectAcceptance, ProjectDoorPosition, SignatureInput } from '@/types';
import { cn } from '@/utils/cn';
import { BTN_PRIMARY, Field, INPUT } from '../../../_components/form';
import { Sheet } from '../../../_components/sheet';
import { EvidenceUploader } from '../../_components/evidence-uploader';
import { SignatureFields } from '../../_components/signature-pad';
import { useAct } from './use-act';

type Mode = 'onsite' | 'link' | 'later';
const MODES: [Mode, string, string][] = [
  ['onsite', 'Khách ký tại công trình', 'Khách ký ngay trên thiết bị này'],
  ['link', 'Gửi link ký online', 'Gửi email cho khách ký từ xa'],
  ['later', 'Lưu, khách ký sau', 'Tạo biên bản, gửi link sau'],
];
interface Eval {
  checked: boolean;
  result: AcceptanceItemResult;
  note: string;
}

// Lập biên bản nghiệm thu: chọn cửa đã lắp, đánh giá Đạt / Không đạt từng cửa, ảnh thực tế, chữ ký công ty và cách khách ký.
export function AcceptanceFormSheet({
  projectId,
  open,
  onClose,
  positions,
  canSign,
  canSend,
}: {
  projectId: number;
  open: boolean;
  onClose: () => void;
  positions: ProjectDoorPosition[];
  canSign: boolean;
  canSend: boolean;
}) {
  const [ev, setEv] = useState<Record<number, Eval>>(() =>
    Object.fromEntries(positions.map((p) => [p.id, { checked: true, result: 'passed', note: '' } as Eval])),
  );
  const [photos, setPhotos] = useState<EvidenceMediaItem[]>([]);
  const [note, setNote] = useState('');
  const [email, setEmail] = useState('');
  const modes = MODES.filter(([m]) => (m === 'onsite' ? canSign : m === 'link' ? canSend : true));
  const [mode, setMode] = useState<Mode>(modes[0][0]);
  const [company, setCompany] = useState<SignatureInput | null>(null);
  const [customer, setCustomer] = useState<SignatureInput | null>(null);

  const get = (id: number): Eval => ev[id] ?? { checked: true, result: 'passed', note: '' };
  const set = (id: number, p: Partial<Eval>) => setEv({ ...ev, [id]: { ...get(id), ...p } });
  const chosen: AcceptanceItemInput[] = positions
    .filter((p) => get(p.id).checked)
    .map((p) => ({ positionId: p.id, result: get(p.id).result, note: get(p.id).note.trim() || undefined }));
  const passed = chosen.filter((i) => i.result === 'passed').length;
  const failed = chosen.length - passed;
  const save = useAct(
    projectId,
    () =>
      createProjectAcceptance(projectId, {
        positionIds: chosen.map((i) => i.positionId),
        items: chosen,
        photos,
        note: note.trim() || undefined,
        companySignature: company as SignatureInput,
        customerSignature: mode === 'onsite' ? (customer ?? undefined) : undefined,
        sendLink: mode === 'link',
        recipientEmail: email.trim() || undefined,
      }),
    'Đã lập biên bản nghiệm thu',
    onClose,
  );
  const ready = chosen.length > 0 && photos.length > 0 && !!company && (mode !== 'onsite' || !!customer);

  return (
    <Sheet open={open} onClose={onClose} title="Lập biên bản nghiệm thu">
      <form
        className="flex flex-col gap-4 p-rm-gutter"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <fieldset>
          <legend className="mb-1 flex flex-wrap items-center gap-2 text-sm font-medium">
            Bộ cửa nghiệm thu ({chosen.length}/{positions.length})<span className="text-xs text-rm-success">{passed} đạt</span>
            {failed > 0 && <span className="text-xs text-rm-danger">{failed} không đạt (nghiệm thu lại sau)</span>}
          </legend>
          <div className="mb-1 flex gap-3 text-sm">
            <button
              type="button"
              className="h-rm-tap text-rm-primary"
              onClick={() => setEv(Object.fromEntries(positions.map((p) => [p.id, { ...get(p.id), checked: true }])))}
            >
              Chọn tất cả
            </button>
            <button
              type="button"
              className="h-rm-tap text-rm-primary"
              onClick={() => setEv(Object.fromEntries(positions.map((p) => [p.id, { ...get(p.id), checked: false }])))}
            >
              Bỏ chọn
            </button>
          </div>
          <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto">
            {positions.map((p) => {
              const s = get(p.id);
              return (
                <li
                  key={p.id}
                  className={cn(
                    'rounded-rm-xl border p-2',
                    !s.checked ? 'border-rm-line opacity-60' : s.result === 'passed' ? 'border-rm-edge' : 'border-rm-danger',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <label className="flex min-h-rm-tap min-w-0 flex-1 items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={s.checked}
                        onChange={(e) => set(p.id, { checked: e.target.checked })}
                        className="size-5 flex-none accent-[var(--rm-primary)]"
                      />
                      <span className="min-w-0 truncate">
                        {p.code} · {p.description || `${p.width}×${p.height}`}
                      </span>
                    </label>
                    {s.checked && (
                      <div role="group" aria-label={`Kết quả ${p.code}`} className="flex flex-none gap-1">
                        {(['passed', 'failed'] as const).map((r) => (
                          <button
                            key={r}
                            type="button"
                            aria-pressed={s.result === r}
                            onClick={() => set(p.id, { result: r })}
                            className={cn(
                              'h-9 rounded-rm border px-3 text-sm',
                              s.result === r
                                ? r === 'passed'
                                  ? 'border-rm-success bg-rm-success-soft text-rm-success'
                                  : 'border-rm-danger bg-rm-danger-soft text-rm-danger'
                                : 'border-rm-line',
                            )}
                          >
                            {r === 'passed' ? 'Đạt' : 'Không đạt'}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {s.checked && s.result === 'failed' && (
                    <input
                      aria-label={`Lý do không đạt ${p.code}`}
                      value={s.note}
                      onChange={(e) => set(p.id, { note: e.target.value })}
                      placeholder="Lý do không đạt"
                      className={`${INPUT} mt-2`}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </fieldset>
        <EvidenceUploader projectId={projectId} value={photos} onChange={setPhotos} label="Ảnh / video nghiệm thu" required />
        <Field label="Ghi chú biên bản" id="af-note">
          <input id="af-note" value={note} onChange={(e) => setNote(e.target.value)} className={INPUT} />
        </Field>
        <SignatureFields id="af-company" title="Đại diện công ty ký" defaultTitle="Giám sát" onChange={setCompany} />
        <fieldset>
          <legend className="mb-1 text-sm font-medium">Khách hàng ký</legend>
          <div className="flex flex-col gap-2">
            {modes.map(([m, l, h]) => (
              <label
                key={m}
                className="flex min-h-rm-tap cursor-pointer items-start gap-3 rounded-rm-xl border border-rm-line p-3 text-sm has-[:checked]:border-rm-primary"
              >
                <input
                  type="radio"
                  name="af-mode"
                  checked={mode === m}
                  onChange={() => setMode(m)}
                  className="mt-0.5 size-5 flex-none accent-[var(--rm-primary)]"
                />
                <span>
                  <span className="block font-medium">{l}</span>
                  <span className="text-xs text-rm-muted">{h}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        {mode === 'onsite' && <SignatureFields id="af-customer" title="Khách hàng ký xác nhận" defaultTitle="Chủ nhà" onChange={setCustomer} />}
        {mode === 'link' && (
          <Field label="Email khách (để trống dùng email trong hồ sơ)" id="af-email">
            <input id="af-email" type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} className={INPUT} />
          </Field>
        )}
        <button type="submit" disabled={save.isPending || !ready} className={BTN_PRIMARY}>
          {save.isPending ? 'Đang lập…' : 'Lập biên bản'}
        </button>
      </form>
    </Sheet>
  );
}

// Khách ký tại chỗ vào biên bản đang chờ.
export function CustomerSignSheet({ projectId, a, onClose }: { projectId: number; a: ProjectAcceptance | null; onClose: () => void }) {
  const [sig, setSig] = useState<SignatureInput | null>(null);
  const sign = useAct(
    projectId,
    () => signAcceptanceOnsite(projectId, a!.id, sig as SignatureInput),
    'Đã đủ chữ ký hai bên, các cửa được nghiệm thu',
    onClose,
  );
  return (
    <Sheet open={!!a} onClose={onClose} title={a ? `Khách ký ${a.code}` : 'Khách ký'}>
      <form
        className="flex flex-col gap-4 p-rm-gutter"
        onSubmit={(e) => {
          e.preventDefault();
          sign.mutate();
        }}
      >
        {a && (
          <p className="text-sm text-rm-muted">
            Nghiệm thu {a.positionCodes.length} bộ cửa: {a.positionCodes.join(', ')}
          </p>
        )}
        <SignatureFields id="cs" title="Khách hàng ký xác nhận" defaultTitle="Chủ nhà" onChange={setSig} />
        <button type="submit" disabled={sign.isPending || !sig} className={BTN_PRIMARY}>
          {sign.isPending ? 'Đang lưu…' : 'Xác nhận ký'}
        </button>
      </form>
    </Sheet>
  );
}
