'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Globe, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  getDocumentCategoryShares,
  getDocumentShares,
  revokeDocumentCategoryShare,
  revokeDocumentShare,
  shareDocument,
  shareDocumentCategory,
  updateDocument,
  updateDocumentCategory,
} from '@/actions';
import { useCan } from '@/hooks';
import { FOLDER_PERMISSION_MAP, type DocumentCategory, type DocumentItem, type FolderShare } from '@/types';
import { DOC_QUERY_KEYS, invalidateDocumentQueries } from '@/utils';
import { cn } from '@/utils/cn';
import { PeoplePicker } from '../people-picker';
import { BTN_PRIMARY, Field, messageOf } from '../form';
import { Sheet } from '../sheet';
import { useShareOptions } from '../use-share-options';
import { ConfirmSheet } from './confirm-sheet';

type Target = 'user' | 'department' | 'all';
type Perm = 'view' | 'edit';
const TARGETS: [Target, string][] = [
  ['user', 'Cá nhân'],
  ['department', 'Phòng ban'],
  ['all', 'Cả công ty'],
];

interface Props {
  folder: DocumentCategory | null;
  doc: DocumentItem | null;
  onClose: () => void;
}

const nameOf = (s: FolderShare) => s.userName || s.user?.fullName || s.department?.name || s.departmentName || 'Không rõ';

// Chia sẻ thư mục hoặc tài liệu cho cá nhân / phòng ban / cả công ty với quyền xem hoặc sửa; xem và thu hồi người đã được chia sẻ.
export function ShareSheet({ folder, doc, onClose }: Props) {
  const qc = useQueryClient();
  const { me } = useCan();
  const isDoc = !!doc;
  const id = doc?.id ?? folder?.id ?? 0;
  const opts = useShareOptions(!!(folder || doc), me?.user.id);
  const [target, setTarget] = useState<Target>(doc?.shareScope === 'all' ? 'all' : doc?.shareScope === 'department' ? 'department' : 'user');
  const [users, setUsers] = useState<string[]>([]);
  const [depts, setDepts] = useState<string[]>([]);
  const [perm, setPerm] = useState<Perm>('view');
  const [busy, setBusy] = useState(false);
  const [revoke, setRevoke] = useState<{ id: number | string; name: string } | null>(null);

  const key = isDoc ? DOC_QUERY_KEYS.documents.shares(id, doc?.shareScope) : DOC_QUERY_KEYS.categories.shares(id);
  const shares = useQuery<FolderShare[]>({
    queryKey: key,
    enabled: !!id,
    queryFn: async () => {
      if (!doc) return getDocumentCategoryShares(id);
      const list = await getDocumentShares(id);
      if (doc.shareScope !== 'all') return list;
      return [{ id: 'all_system', categoryId: doc.id, permission: 'view', userName: 'Toàn công ty' } as FolderShare, ...list];
    },
  });
  const owner = String(doc?.createdById ?? folder?.createdById ?? me?.user.id ?? '');
  const list = (shares.data ?? []).filter((s) => String(s.userId ?? s.user?.id ?? '') !== owner);

  const refresh = () => {
    void shares.refetch();
    invalidateDocumentQueries(qc);
  };

  const submit = async () => {
    if (target === 'user' && users.length === 0) return void toast.error('Chọn ít nhất một nhân sự');
    if (target === 'department' && depts.length === 0) return void toast.error('Chọn ít nhất một phòng ban');
    setBusy(true);
    try {
      if (doc) {
        await shareDocument(doc.id, {
          shareScope: target === 'all' ? 'all' : target === 'department' ? 'department' : 'user',
          recipientUserIds: target === 'user' ? users : [],
          recipientDepartmentIds: target === 'department' ? depts : [],
          permission: perm,
        });
      } else if (folder) {
        const calls =
          target === 'user'
            ? users.map((u) => shareDocumentCategory(folder.id, { userId: u, permission: perm }))
            : target === 'department'
              ? depts.map((d) => shareDocumentCategory(folder.id, { departmentId: Number(d), permission: perm }))
              : opts.departments.map((d) => shareDocumentCategory(folder.id, { departmentId: Number(d.value), permission: perm }));
        if (target === 'all') await updateDocumentCategory(folder.id, { shareScope: 'all' } as never).catch(() => undefined);
        const done = await Promise.allSettled(calls);
        if (done.every((r) => r.status === 'rejected')) throw new Error('Không thể chia sẻ cho các đối tượng đã chọn');
      }
      toast.success('Đã cập nhật quyền chia sẻ');
      setUsers([]);
      setDepts([]);
      refresh();
    } catch (e) {
      toast.error(messageOf(e));
    } finally {
      setBusy(false);
    }
  };

  const doRevoke = async () => {
    if (!revoke) return;
    setBusy(true);
    try {
      if (doc) {
        if (revoke.id === 'all_system') await updateDocument(doc.id, { shareScope: 'private' } as never);
        else await revokeDocumentShare(doc.id, revoke.id);
      } else if (folder) await revokeDocumentCategoryShare(folder.id, revoke.id);
      toast.success(`Đã thu hồi quyền của "${revoke.name}"`);
      setRevoke(null);
      refresh();
    } catch (e) {
      toast.error(messageOf(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Sheet open={!!(folder || doc)} onClose={onClose} title={`Chia sẻ ${isDoc ? 'tài liệu' : 'thư mục'}`}>
        <div className="flex flex-col gap-4 py-4">
          <p className="truncate text-sm font-semibold">{doc?.title ?? folder?.name}</p>

          <div role="group" aria-label="Đối tượng chia sẻ" className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-1 rounded-control bg-slate-200 p-1">
            {TARGETS.map(([v, label]) => (
              <button
                key={v}
                type="button"
                aria-pressed={target === v}
                onClick={() => setTarget(v)}
                className={cn('h-11 truncate rounded-control px-1 text-sm font-medium', target === v ? 'bg-white text-primary' : 'text-slate-500')}
              >
                {label}
              </button>
            ))}
          </div>
          {target === 'user' && (
            <Field label="Chọn nhân sự" id="sh-users">
              <PeoplePicker
                id="sh-users"
                label="Nhân sự"
                searchLabel="Tìm tên hoặc email"
                options={opts.employees}
                value={users}
                onChange={setUsers}
              />
            </Field>
          )}
          {target === 'department' && (
            <Field label="Chọn phòng ban" id="sh-depts">
              <PeoplePicker
                id="sh-depts"
                label="Phòng ban"
                searchLabel="Tìm phòng ban"
                options={opts.departments}
                value={depts}
                onChange={setDepts}
              />
            </Field>
          )}
          {target === 'all' && (
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <Globe size={16} aria-hidden="true" />
              Mọi nhân sự trong công ty sẽ thấy {isDoc ? 'tài liệu' : 'thư mục'} này.
            </p>
          )}

          <div role="group" aria-label="Quyền" className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-1 rounded-control bg-slate-200 p-1">
            {(['view', 'edit'] as const).map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={perm === p}
                onClick={() => setPerm(p)}
                className={cn('h-11 truncate rounded-control px-1 text-sm font-medium', perm === p ? 'bg-white text-primary' : 'text-slate-500')}
              >
                {p === 'view' ? 'Chỉ xem' : 'Được sửa'}
              </button>
            ))}
          </div>
          <p className="-mt-2 text-xs text-slate-500">{FOLDER_PERMISSION_MAP[perm]}</p>
          <button type="button" disabled={busy} onClick={submit} className={BTN_PRIMARY}>
            {busy ? 'Đang chia sẻ…' : 'Chia sẻ'}
          </button>

          <section aria-label="Người có quyền truy cập">
            <h3 className="mb-2 text-sm font-semibold">Đang được chia sẻ ({list.length})</h3>
            {shares.isLoading && <p className="text-sm text-slate-500">Đang tải…</p>}
            {shares.data && list.length === 0 && <p className="text-sm text-slate-500">Chưa chia sẻ cho ai khác.</p>}
            <ul className="divide-y divide-slate-200 rounded-block border border-slate-200/80">
              {list.map((s) => (
                <li key={s.id} className="flex min-h-12 items-center gap-3 px-3">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{nameOf(s)}</span>
                    <span className="block truncate text-xs text-slate-500">
                      {s.user?.email ?? (s.departmentId ? 'Phòng ban' : '')} · {s.permission === 'edit' ? 'Được sửa' : 'Chỉ xem'}
                    </span>
                  </span>
                  <button
                    type="button"
                    aria-label={`Thu hồi quyền của ${nameOf(s)}`}
                    onClick={() => setRevoke({ id: s.id, name: nameOf(s) })}
                    className="flex size-11 flex-none items-center justify-center text-red-600 active:bg-red-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </Sheet>
      <ConfirmSheet
        open={!!revoke}
        title="Thu hồi quyền chia sẻ"
        message={
          <>
            Thu hồi quyền của <strong>{revoke?.name}</strong> đối với {isDoc ? 'tài liệu' : 'thư mục'} này?
          </>
        }
        confirmLabel="Thu hồi"
        busy={busy}
        onClose={() => setRevoke(null)}
        onConfirm={doRevoke}
      />
    </>
  );
}
