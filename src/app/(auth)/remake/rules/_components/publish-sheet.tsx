'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import type { DocumentItem, PublishDocumentPayload } from '@/types';
import { BTN_PRIMARY, Field, INPUT } from '../../_components/form';
import { Select } from '../../_components/select';
import { Sheet } from '../../_components/sheet';
import { useShareOptions } from '../../_components/use-share-options';
import { PeoplePicker } from '../../_components/people-picker';

type Scope = PublishDocumentPayload['shareScope'];
export const SCOPES: { value: Scope; label: string }[] = [
  { value: 'all', label: 'Toàn công ty' },
  { value: 'department', label: 'Theo phòng ban' },
  { value: 'user', label: 'Theo cá nhân chỉ định' },
];
const today = () => new Date().toISOString().slice(0, 10);

interface Props {
  doc: DocumentItem | null;
  busy: boolean;
  onClose: () => void;
  onConfirm: (p: PublishDocumentPayload) => void;
}

// Ban hành: chọn phạm vi (toàn công ty / phòng ban / cá nhân), ngày hiệu lực; tự thay thế văn bản cũ nếu có.
export function PublishSheet({ doc, busy, onClose, onConfirm }: Props) {
  const [scope, setScope] = useState<Scope>(SCOPES.some((x) => x.value === doc?.shareScope) ? (doc!.shareScope as Scope) : 'all');
  const [date, setDate] = useState(doc?.effectiveDate?.slice(0, 10) ?? today());
  const [users, setUsers] = useState<string[]>(doc?.recipients?.map((r) => r.userId) ?? []);
  const [depts, setDepts] = useState<string[]>((doc?.recipientDepartmentIds ?? doc?.recipientDepartments?.map((d) => d.id) ?? []).map(String));
  const [error, setError] = useState('');
  const opts = useShareOptions(!!doc, doc?.createdById);
  const sup = doc?.supersedesDoc;
  // chỉ tính người còn trong danh sách chọn (người soạn không tự nhận nên bị ẩn)
  const picked = users.filter((u) => opts.employees.some((o) => o.value === u));

  const submit = () => {
    if ((scope === 'department' && depts.length === 0) || (scope === 'user' && picked.length === 0)) return setError('Chọn ít nhất một người nhận');
    onConfirm({
      shareScope: scope,
      effectiveDate: date,
      supersedesId: doc?.supersedesId ?? sup?.id ?? undefined,
      recipientDepartmentIds: scope === 'department' ? depts.map(Number) : undefined,
      recipientUserIds: scope === 'user' ? picked : undefined,
    });
  };

  return (
    <Sheet open={!!doc} onClose={onClose} title="Ban hành văn bản">
      <div className="flex flex-col gap-4 p-rm-gutter">
        <p className="text-sm [overflow-wrap:anywhere]">
          Ban hành: <strong>{doc?.title}</strong>
        </p>
        {sup && (
          <p className="flex items-start gap-2 rounded-rm bg-rm-warning-soft p-3 text-sm text-rm-warning">
            <RefreshCw size={16} className="mt-0.5 flex-none" aria-hidden="true" />
            <span className="min-w-0 [overflow-wrap:anywhere]">
              Sẽ thay thế văn bản [{sup.code}] {sup.title}, văn bản cũ chuyển sang trạng thái Đã bị thay thế.
            </span>
          </p>
        )}
        <Field label="Phạm vi ban hành" id="pb-scope">
          <Select
            id="pb-scope"
            label="Phạm vi ban hành"
            value={scope}
            onChange={(v) => {
              setScope(v as Scope);
              setError('');
            }}
            options={SCOPES}
          />
        </Field>
        <Field label="Ngày bắt đầu hiệu lực" id="pb-date">
          <input id="pb-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={INPUT} />
        </Field>
        {scope === 'department' && (
          <Field label="Phòng ban nhận" id="pb-depts">
            <PeoplePicker
              id="pb-depts"
              label="Phòng ban nhận"
              searchLabel="Tìm phòng ban"
              options={opts.departments}
              value={depts}
              onChange={(v) => {
                setDepts(v);
                setError('');
              }}
            />
          </Field>
        )}
        {scope === 'user' && (
          <Field label="Người nhận" id="pb-users">
            <PeoplePicker
              id="pb-users"
              label="Người nhận"
              searchLabel="Tìm tên hoặc email"
              options={opts.employees}
              value={picked}
              onChange={(v) => {
                setUsers(v);
                setError('');
              }}
            />
          </Field>
        )}
        {error && (
          <p role="alert" className="text-sm text-rm-danger">
            {error}
          </p>
        )}
        <button type="button" disabled={busy} onClick={submit} className={`${BTN_PRIMARY} w-full`}>
          {busy ? 'Đang ban hành…' : 'Ban hành'}
        </button>
      </div>
    </Sheet>
  );
}
