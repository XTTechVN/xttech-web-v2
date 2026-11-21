'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { completeWarrantyVisit, createWarrantyVisit, getProjectPositions, getUsers, updateWarrantyVisit } from '@/actions';
import { WARRANTY_ISSUE_TAG_OPTIONS } from '@/config';
import { useCan } from '@/hooks';
import type { EvidenceMediaItem, WarrantyIssueTag, WarrantyVisit } from '@/types';
import { cn } from '@/utils/cn';
import { BTN_PRIMARY, Field, INPUT } from '../../_components/form';
import { Select } from '../../_components/select';
import { Sheet } from '../../_components/sheet';
import { useAct } from '../[id]/_components/use-act';
import { EvidenceUploader } from './evidence-uploader';
import { MoneyInput } from './fields';

const AREA = 'w-full rounded-rm border border-rm-line bg-rm-surface p-3 text-base outline-none focus-visible:border-rm-primary md:text-sm';
const list = (raw: string) =>
  raw
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
const today = () => new Date().toISOString().slice(0, 10);

// Tạo yêu cầu bảo hành của khách (visit rỗng) hoặc sửa lịch một đợt: nội dung, ngày hẹn, người phụ trách, cửa, hiện tượng lỗi, phạm vi và phí.
export function VisitFormSheet({
  projectId,
  open,
  visit,
  onClose,
}: {
  projectId: number;
  open: boolean;
  visit: WarrantyVisit | null;
  onClose: () => void;
}) {
  const { can } = useCan();
  const [f, setF] = useState({
    title: visit?.title ?? '',
    date: visit?.scheduledDate ?? today(),
    assignee: visit?.assigneeId ?? '',
    rname: visit?.requesterName ?? '',
    rphone: visit?.requesterPhone ?? '',
    issue: visit?.issueDescription ?? '',
    charge: visit?.isChargeable ?? false,
    fee: visit?.feeAmount ?? 0,
    scope: visit?.scopeNote ?? '',
  });
  const [pos, setPos] = useState<number[]>(visit?.positionIds ?? []);
  const [tags, setTags] = useState<WarrantyIssueTag[]>(visit?.issueTags ?? []);
  const users = useQuery({
    queryKey: ['users', 'warranty-assignees'],
    queryFn: () => getUsers({ limit: 100 }),
    enabled: open && can('user:read'),
    staleTime: 300_000,
  });
  const positions = useQuery({
    queryKey: ['project', projectId, 'positions', 'warranty'],
    queryFn: () => getProjectPositions(projectId, { limit: 200 }),
    enabled: open,
    staleTime: 120_000,
  });
  const save = useAct(
    projectId,
    () => {
      const body = {
        title: f.title.trim(),
        scheduledDate: f.date,
        assigneeId: f.assignee || undefined,
        positionIds: pos,
        requesterName: f.rname.trim() || undefined,
        requesterPhone: f.rphone.trim() || undefined,
        issueTags: tags,
        issueDescription: f.issue.trim() || undefined,
        isChargeable: f.charge,
        feeAmount: f.charge ? f.fee : 0,
        scopeNote: f.scope.trim() || undefined,
      };
      return visit ? updateWarrantyVisit(projectId, visit.id, body) : createWarrantyVisit(projectId, { ...body, kind: 'claim' });
    },
    visit ? 'Đã cập nhật đợt bảo hành' : 'Đã tạo yêu cầu bảo hành',
    onClose,
  );
  const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <Sheet open={open} onClose={onClose} title={visit ? `Sửa ${visit.code}` : 'Tạo yêu cầu bảo hành'}>
      <form
        className="flex flex-col gap-4 p-rm-gutter"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <Field label="Nội dung / tiêu đề" id="wf-title">
          <input id="wf-title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className={INPUT} />
        </Field>
        <Field label="Ngày hẹn" id="wf-date">
          <input id="wf-date" type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} className={INPUT} />
        </Field>
        {can('user:read') && (
          <Field label="Người phụ trách" id="wf-asg">
            <Select
              id="wf-asg"
              label="Người phụ trách"
              value={f.assignee}
              onChange={(v) => setF({ ...f, assignee: v })}
              options={[{ value: '', label: 'Chưa phân công' }, ...(users.data?.items ?? []).map((u) => ({ value: u.id, label: u.fullName }))]}
            />
          </Field>
        )}
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
          <Field label="Người liên hệ báo" id="wf-rn">
            <input id="wf-rn" value={f.rname} onChange={(e) => setF({ ...f, rname: e.target.value })} className={INPUT} />
          </Field>
          <Field label="SĐT liên hệ" id="wf-rp">
            <input
              id="wf-rp"
              type="tel"
              inputMode="tel"
              value={f.rphone}
              onChange={(e) => setF({ ...f, rphone: e.target.value })}
              className={INPUT}
            />
          </Field>
        </div>
        {(positions.data?.items.length ?? 0) > 0 && (
          <fieldset>
            <legend className="mb-1 text-sm font-medium">Cửa cần kiểm tra ({pos.length})</legend>
            <ul className="max-h-44 divide-y divide-rm-line overflow-y-auto rounded-rm border border-rm-line">
              {positions.data!.items.map((p) => (
                <li key={p.id}>
                  <label className="flex min-h-rm-tap items-center gap-3 px-3 text-sm">
                    <input
                      type="checkbox"
                      checked={pos.includes(p.id)}
                      onChange={() => setPos(toggle(pos, p.id))}
                      className="size-5 flex-none accent-[var(--rm-primary)]"
                    />
                    <span className="min-w-0 truncate">
                      {p.code} · {p.description || `${p.width}×${p.height}`}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        )}
        <fieldset>
          <legend className="mb-1 text-sm font-medium">Hiện tượng lỗi</legend>
          <div className="flex flex-wrap gap-2">
            {WARRANTY_ISSUE_TAG_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                aria-pressed={tags.includes(o.value)}
                onClick={() => setTags(toggle(tags, o.value))}
                className={cn(
                  'h-9 rounded-rm border px-3 text-sm',
                  tags.includes(o.value) ? 'border-rm-primary bg-rm-primary-soft text-rm-primary' : 'border-rm-line',
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </fieldset>
        <Field label="Mô tả sự cố" id="wf-issue">
          <textarea id="wf-issue" rows={3} value={f.issue} onChange={(e) => setF({ ...f, issue: e.target.value })} className={AREA} />
        </Field>
        <label className="flex min-h-rm-tap items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={f.charge}
            onChange={(e) => setF({ ...f, charge: e.target.checked })}
            className="size-5 accent-[var(--rm-primary)]"
          />
          Tính phí sửa chữa
        </label>
        {f.charge && (
          <>
            <Field label="Số tiền (đ)" id="wf-fee">
              <MoneyInput id="wf-fee" value={f.fee} onChange={(v) => setF({ ...f, fee: v ?? 0 })} />
            </Field>
            <Field label="Ghi chú phạm vi" id="wf-scope">
              <input id="wf-scope" value={f.scope} onChange={(e) => setF({ ...f, scope: e.target.value })} className={INPUT} />
            </Field>
          </>
        )}
        <button type="submit" disabled={save.isPending || !f.title.trim() || !f.date} className={BTN_PRIMARY}>
          {save.isPending ? 'Đang lưu…' : visit ? 'Lưu' : 'Tạo yêu cầu'}
        </button>
      </form>
    </Sheet>
  );
}

// Biên bản kiểm tra và hoàn thành: chẩn đoán, bộ phận hỏng, xử lý, vật tư thay, phạm vi - phí, ảnh; lưu nháp hoặc hoàn thành.
export function CompleteSheet({ visit, onClose }: { visit: WarrantyVisit | null; onClose: () => void }) {
  const pid = visit?.projectId ?? 0;
  const [f, setF] = useState({
    diag: visit?.diagnosisNote ?? '',
    damaged: visit?.damagedParts.join(', ') ?? '',
    repair: visit?.repairActions ?? '',
    replaced: visit?.replacedParts.join(', ') ?? '',
    result: visit?.resultNote ?? '',
    inScope: visit?.isInScope ?? true,
    charge: visit?.isChargeable ?? false,
    fee: visit?.feeAmount ?? 0,
    scope: visit?.scopeNote ?? '',
  });
  const [photos, setPhotos] = useState<EvidenceMediaItem[]>(visit?.photos ?? []);
  const common = () => ({
    diagnosisNote: f.diag.trim() || null,
    damagedParts: list(f.damaged),
    repairActions: f.repair.trim() || null,
    replacedParts: list(f.replaced),
    isInScope: f.inScope,
    isChargeable: f.charge,
    feeAmount: f.charge ? f.fee : 0,
    scopeNote: f.scope.trim() || null,
  });
  const draft = useAct(pid, () => updateWarrantyVisit(pid, visit!.id, common()), 'Đã lưu biên bản kiểm tra', onClose);
  const done = useAct(
    pid,
    () =>
      completeWarrantyVisit(pid, visit!.id, {
        ...common(),
        resultNote: f.result.trim() || f.repair.trim() || 'Đã hoàn thành xử lý bảo hành',
        photos,
      }),
    'Đã hoàn thành và đóng phiếu bảo hành',
    onClose,
  );
  const busy = draft.isPending || done.isPending;

  return (
    <Sheet open={!!visit} onClose={onClose} title={visit ? `Biên bản ${visit.code}` : 'Biên bản'}>
      <form
        className="flex flex-col gap-4 p-rm-gutter"
        onSubmit={(e) => {
          e.preventDefault();
          done.mutate();
        }}
      >
        {visit && (
          <p className="rounded-rm bg-rm-bg px-3 py-2 text-sm">
            <strong>{visit.title}</strong>
            {visit.issueDescription && <span className="block text-rm-muted">Khách báo: {visit.issueDescription}</span>}
          </p>
        )}
        <Field label="Chẩn đoán kỹ thuật (hỏng gì, nguyên nhân)" id="wc-diag">
          <textarea id="wc-diag" rows={3} value={f.diag} onChange={(e) => setF({ ...f, diag: e.target.value })} className={AREA} />
        </Field>
        <Field label="Bộ phận bị hỏng (cách nhau dấu phẩy)" id="wc-dmg">
          <input
            id="wc-dmg"
            value={f.damaged}
            onChange={(e) => setF({ ...f, damaged: e.target.value })}
            placeholder="VD: Bản lề chữ A, khoá đa điểm"
            className={INPUT}
          />
        </Field>
        <Field label="Biện pháp xử lý thực tế" id="wc-fix">
          <textarea id="wc-fix" rows={3} value={f.repair} onChange={(e) => setF({ ...f, repair: e.target.value })} className={AREA} />
        </Field>
        <Field label="Vật tư / phụ kiện đã thay (cách nhau dấu phẩy)" id="wc-rep">
          <input id="wc-rep" value={f.replaced} onChange={(e) => setF({ ...f, replaced: e.target.value })} className={INPUT} />
        </Field>
        <Field label="Kết quả" id="wc-res">
          <input id="wc-res" value={f.result} onChange={(e) => setF({ ...f, result: e.target.value })} className={INPUT} />
        </Field>
        <fieldset className="flex flex-col gap-2 rounded-rm-xl border border-rm-line p-3">
          <legend className="px-1 text-sm font-medium">Phạm vi bảo hành và chi phí</legend>
          <label className="flex min-h-rm-tap items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={f.inScope}
              onChange={(e) => setF({ ...f, inScope: e.target.checked, charge: e.target.checked ? false : f.charge })}
              className="size-5 accent-[var(--rm-primary)]"
            />
            Trong phạm vi bảo hành
          </label>
          <label className="flex min-h-rm-tap items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={f.charge}
              onChange={(e) => setF({ ...f, charge: e.target.checked })}
              className="size-5 accent-[var(--rm-primary)]"
            />
            Có tính phí
          </label>
          {f.charge && (
            <Field label="Số tiền (đ)" id="wc-fee">
              <MoneyInput id="wc-fee" value={f.fee} onChange={(v) => setF({ ...f, fee: v ?? 0 })} />
            </Field>
          )}
          <Field label="Ghi chú phạm vi" id="wc-scope">
            <input id="wc-scope" value={f.scope} onChange={(e) => setF({ ...f, scope: e.target.value })} className={INPUT} />
          </Field>
        </fieldset>
        {visit && <EvidenceUploader projectId={visit.projectId} value={photos} onChange={setPhotos} label="Ảnh / video xử lý" />}
        <div className="flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => draft.mutate()}
            className="flex h-rm-tap min-w-0 flex-1 items-center justify-center rounded-rm border border-rm-line text-sm font-medium"
          >
            Lưu nháp
          </button>
          <button type="submit" disabled={busy} className={`${BTN_PRIMARY} min-w-0 flex-1`}>
            {done.isPending ? 'Đang lưu…' : 'Hoàn thành'}
          </button>
        </div>
      </form>
    </Sheet>
  );
}
