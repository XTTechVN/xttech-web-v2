'use client';

import { useEffect, useRef, useState } from 'react';
import { FileUp, RefreshCw, Sparkles, Zap } from 'lucide-react';
import { buildAdministrativeA4Html, createHtmlDocumentFile, extractComposerBodyFromHtml, getTemplateByDocType } from '@/config/document-templates';
import { useCan } from '@/hooks';
import { DOCUMENT_TYPE_MAP, RULE_FILTER_TYPES, type DocumentItem } from '@/types';
import { api, getFileExtension, getFileUrl } from '@/utils';
import { cn } from '@/utils/cn';
import { BTN_LINE, BTN_PRIMARY, Field, INPUT } from '../../_components/form';
import { Select } from '../../_components/select';
import { useRuleSave, type RuleValues, type SaveMode } from '../_lib/use-rule-save';
import { useShareOptions } from '../../_components/use-share-options';
import { PeoplePicker } from '../../_components/people-picker';
import { A4Composer } from './a4-composer';
import { SCOPES } from './publish-sheet';

const TYPES = RULE_FILTER_TYPES.map((k) => ({ value: k, label: DOCUMENT_TYPE_MAP[k].label }));
const day = (s?: string | null) => s?.slice(0, 10) ?? '';

function initial(doc: DocumentItem | null, replacing: DocumentItem | null): RuleValues {
  const src = doc ?? replacing;
  if (!src) {
    return {
      title: '',
      documentType: 'regulation',
      summary: '',
      shareScope: 'all',
      departmentIds: [],
      userIds: [],
      expirationDate: '',
      approverId: '',
      requiresAcknowledgement: false,
      supersedesId: null,
    };
  }
  return {
    title: doc ? doc.title : `Thay thế ${src.title}`,
    documentType: src.documentType === 'notice' ? 'announcement' : src.documentType,
    summary: doc ? (doc.summary ?? '') : `Văn bản ban hành thay thế cho ${src.code} - ${src.title}`,
    shareScope: src.shareScope === 'department' || src.shareScope === 'user' ? src.shareScope : 'all',
    departmentIds: (src.recipientDepartmentIds ?? src.recipientDepartments?.map((d) => d.id) ?? []).map(String),
    userIds: src.recipients?.map((r) => r.userId) ?? [],
    expirationDate: doc ? day(doc.expirationDate) : '',
    approverId: doc?.approverId ?? '',
    requiresAcknowledgement: src.requiresAcknowledgement ?? false,
    supersedesId: doc ? (doc.supersedesId ?? doc.supersedesDoc?.id ?? null) : src.id,
  };
}

interface Props {
  /** văn bản đang sửa (null = soạn mới) */
  doc: DocumentItem | null;
  /** văn bản bị thay thế khi soạn bản thay thế */
  replacing?: DocumentItem | null;
  onSaved: () => void;
  onCancel: () => void;
}

// Soạn / sửa dự thảo: soạn trực tuyến trên khổ A4 hoặc tải tệp; lưu nháp, gửi duyệt, hoặc ban hành ngay (cấp ban hành).
export function RuleEditor({ doc, replacing = null, onSaved, onCancel }: Props) {
  const { can, me } = useCan();
  const isPublisher = can('document:publish');
  const userId = me?.user.id;
  const ext = getFileExtension(doc?.currentVersion?.fileName || '').toLowerCase();
  const [v, setV] = useState(() => initial(doc, replacing));
  const [mode, setMode] = useState<'compose' | 'upload'>(!doc || ext === 'html' || ext === 'htm' ? 'compose' : 'upload');
  const [html, setHtml] = useState(() => getTemplateByDocType(v.documentType).defaultBodyHtml);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<Record<'title' | 'content' | 'approver' | 'dept' | 'user', string>>>({});
  const action = useRef<SaveMode>('draft');
  const opts = useShareOptions(true, userId);
  const saver = useRuleSave(onSaved);
  const pickedUsers = v.userIds.filter((u) => opts.employees.some((o) => o.value === u));
  const set = <K extends keyof RuleValues>(k: K, val: RuleValues[K]) => setV((s) => ({ ...s, [k]: val }));
  const approverName = opts.approvers.find((o) => o.value === v.approverId)?.label;

  useEffect(() => {
    const url = doc?.currentVersion?.downloadUrl || (doc?.currentVersion?.filePath ? getFileUrl(doc.currentVersion.filePath) : null);
    if (!url || (ext !== 'html' && ext !== 'htm')) return;
    api
      .get(url, { responseType: 'text' })
      .then((r) => typeof r.data === 'string' && r.data.trim() && setHtml(extractComposerBodyFromHtml(r.data)))
      .catch(() => {});
  }, [doc, ext]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const m = action.current;
    const err: typeof errors = {};
    if (!v.title.trim()) err.title = 'Tiêu đề không được để trống';
    let target = file;
    if (mode === 'compose') {
      if (!html.replace(/<[^>]+>/g, '').trim()) err.content = 'Nhập nội dung văn bản trên trình soạn thảo';
      else {
        target = createHtmlDocumentFile(
          buildAdministrativeA4Html({
            title: v.title,
            code: doc?.code,
            documentType: v.documentType,
            summary: v.summary,
            bodyHtml: html,
            creatorName: me?.user.fullName || me?.user.email,
            approverName: approverName || (m === 'publish_now' ? me?.user.fullName : undefined),
          }),
          doc?.code || v.title,
        );
      }
    } else if (!doc && !file) err.content = 'Chọn tệp văn bản đính kèm';
    if (m === 'submit' && !v.approverId) err.approver = 'Chọn người phê duyệt để gửi duyệt (hoặc bấm Lưu nháp)';
    if (m !== 'draft') {
      if (v.shareScope === 'department' && v.departmentIds.length === 0) err.dept = 'Chọn ít nhất một phòng ban nhận';
      if (v.shareScope === 'user' && pickedUsers.length === 0) err.user = 'Chọn ít nhất một người nhận';
    }
    setErrors(err);
    if (Object.keys(err).length === 0) saver.mutate({ values: { ...v, userIds: pickedUsers }, file: target, doc, mode: m });
  };

  const busy = saver.isPending;
  const running = saver.variables?.mode;
  const target = replacing ?? doc?.supersedesDoc;

  const scopeHint = {
    all: 'Mọi nhân sự trong công ty sẽ nhận được văn bản.',
    department: 'Nhân sự thuộc các phòng ban được chọn sẽ nhận được.',
    user: 'Chỉ những người được chọn mới nhận được.',
  }[v.shareScope];
  const err = (msg?: string) =>
    msg && (
      <span role="alert" className="text-sm text-rm-danger">
        {msg}
      </span>
    );

  return (
    <form
      onSubmit={submit}
      className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[minmax(0,1fr)_21rem] lg:grid-rows-[auto_1fr]"
      noValidate
    >
      <div className="flex flex-col gap-4 lg:col-start-1 lg:row-span-2 lg:row-start-1">
        {target && (
          <p className="flex items-start gap-2 rounded-rm-xl bg-rm-warning-soft p-3 text-sm text-rm-warning">
            <RefreshCw size={16} className="mt-0.5 flex-none" aria-hidden="true" />
            <span className="min-w-0 [overflow-wrap:anywhere]">
              Thay thế văn bản [{target.code}] {target.title}
            </span>
          </p>
        )}

        <Card title="Thông tin văn bản">
          <Field label="Tiêu đề" id="re-title">
            <input
              id="re-title"
              value={v.title}
              onChange={(e) => set('title', e.target.value)}
              maxLength={255}
              placeholder="Ví dụ: Quy chế làm việc từ xa"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 're-title-err' : undefined}
              className={INPUT}
            />
            {errors.title && (
              <span id="re-title-err" role="alert" className="text-sm text-rm-danger">
                {errors.title}
              </span>
            )}
          </Field>
          <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-[repeat(2,minmax(0,1fr))]">
            <Field label="Loại văn bản" id="re-type">
              <Select id="re-type" label="Loại văn bản" value={v.documentType} onChange={(x) => set('documentType', x)} options={TYPES} />
            </Field>
            <Field label="Ngày hết hiệu lực (nếu có)" id="re-exp">
              <input id="re-exp" type="date" value={v.expirationDate} onChange={(e) => set('expirationDate', e.target.value)} className={INPUT} />
            </Field>
          </div>
          <Field label="Trích yếu" id="re-sum">
            <textarea
              id="re-sum"
              rows={2}
              value={v.summary}
              onChange={(e) => set('summary', e.target.value)}
              placeholder="Tóm tắt mục đích, nội dung chính"
              className="w-full rounded-rm border border-rm-line bg-rm-surface p-3 text-base outline-none focus-visible:border-rm-primary md:text-sm"
            />
          </Field>
        </Card>

        <Card title="Nội dung">
          <div role="group" aria-label="Cách soạn nội dung" className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-1 rounded-rm bg-rm-bg p-1">
            {(
              [
                ['compose', Sparkles, 'Soạn trực tuyến'],
                ['upload', FileUp, 'Tải tệp có sẵn'],
              ] as const
            ).map(([id, Icon, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={mode === id}
                onClick={() => {
                  setMode(id);
                  setErrors((s) => ({ ...s, content: undefined }));
                }}
                className={cn(
                  'flex h-11 items-center justify-center gap-2 rounded-rm text-sm font-medium transition-[background-color] duration-(--rm-dur-fast)',
                  mode === id ? 'bg-rm-surface text-rm-primary shadow-sm' : 'text-rm-muted',
                )}
              >
                <Icon size={16} aria-hidden="true" />
                <span className="min-w-0 truncate">{label}</span>
              </button>
            ))}
          </div>

          {mode === 'compose' ? (
            <A4Composer
              title={v.title}
              code={doc?.code}
              documentType={v.documentType}
              summary={v.summary}
              bodyHtml={html}
              creatorName={me?.user.fullName || me?.user.email}
              approverName={approverName}
              error={errors.content ?? null}
              onChangeBody={(h) => {
                setHtml(h);
                setErrors((s) => ({ ...s, content: undefined }));
              }}
            />
          ) : (
            <Field label={doc ? 'Tệp mới (bỏ trống để giữ tệp hiện tại)' : 'Tệp văn bản (PDF, Word, Excel)'} id="re-file">
              <label
                htmlFor="re-file"
                className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-rm-xl border border-dashed border-rm-line bg-rm-bg p-4 text-center text-sm active:bg-rm-line"
              >
                <FileUp size={24} className="text-rm-primary" aria-hidden="true" />
                <span className="max-w-full truncate font-medium">{file ? file.name : 'Chọn tệp từ thiết bị'}</span>
                <span className="text-xs text-rm-muted">PDF, Word, Excel hoặc HTML</span>
              </label>
              <input
                id="re-file"
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.html"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setFile(f);
                  setErrors((s) => ({ ...s, content: undefined }));
                  if (f && !v.title.trim()) set('title', f.name.replace(/\.[^/.]+$/, ''));
                }}
              />
              {doc?.currentVersion && !file && (
                <span className="text-sm text-rm-muted [overflow-wrap:anywhere]">Hiện tại: {doc.currentVersion.fileName}</span>
              )}
              {err(errors.content)}
            </Field>
          )}
        </Card>
      </div>

      <div className="lg:col-start-2 lg:row-start-1">
        <Card title="Phát hành" hint={scopeHint}>
          <Field label="Phạm vi" id="re-scope">
            <Select
              id="re-scope"
              label="Phạm vi phát hành"
              value={v.shareScope}
              onChange={(x) => {
                set('shareScope', x as RuleValues['shareScope']);
                setErrors((s) => ({ ...s, dept: undefined, user: undefined }));
              }}
              options={SCOPES}
            />
          </Field>
          {v.shareScope === 'department' && (
            <Field label="Phòng ban nhận" id="re-depts">
              <PeoplePicker
                id="re-depts"
                label="Phòng ban nhận"
                searchLabel="Tìm phòng ban"
                options={opts.departments}
                value={v.departmentIds}
                onChange={(x) => {
                  set('departmentIds', x);
                  setErrors((s) => ({ ...s, dept: undefined }));
                }}
              />
              {err(errors.dept)}
            </Field>
          )}
          {v.shareScope === 'user' && (
            <Field label="Cá nhân nhận" id="re-users">
              <PeoplePicker
                id="re-users"
                label="Cá nhân nhận"
                searchLabel="Tìm tên hoặc email"
                options={opts.employees}
                value={pickedUsers}
                onChange={(x) => {
                  set('userIds', x);
                  setErrors((s) => ({ ...s, user: undefined }));
                }}
              />
              {err(errors.user)}
            </Field>
          )}
          <Field label="Người phê duyệt" id="re-approver">
            <Select
              id="re-approver"
              label="Người phê duyệt"
              value={v.approverId}
              onChange={(x) => {
                set('approverId', x);
                setErrors((s) => ({ ...s, approver: undefined }));
              }}
              options={[{ value: '', label: 'Chưa chỉ định' }, ...opts.approvers]}
            />
            <span className="text-xs text-rm-muted">{isPublisher ? 'Không cần nếu ban hành ngay.' : 'Để trống nếu chỉ lưu nháp.'}</span>
            {err(errors.approver)}
          </Field>
          <label className="flex min-h-rm-tap cursor-pointer items-start gap-3 rounded-rm bg-rm-bg p-3 text-sm">
            <input
              type="checkbox"
              checked={v.requiresAcknowledgement}
              onChange={(e) => set('requiresAcknowledgement', e.target.checked)}
              className="mt-0.5 size-5 flex-none accent-rm-primary"
            />
            <span className="min-w-0">Yêu cầu người nhận xác nhận đã đọc và hiểu</span>
          </label>
        </Card>
      </div>

      <div className="contents lg:grid lg:grid-cols-[minmax(0,1fr)] lg:gap-2 lg:col-start-2 lg:row-start-2 lg:sticky lg:top-4">
        {isPublisher && (
          <div className="lg:hidden">
            <button type="submit" disabled={busy} onClick={() => (action.current = 'submit')} className={`${BTN_LINE} w-full`}>
              {busy && running === 'submit' ? 'Đang gửi…' : 'Lưu và gửi duyệt'}
            </button>
          </div>
        )}
        <div className="sticky bottom-[calc(var(--spacing-rm-nav)+env(safe-area-inset-bottom)+0.5rem)] z-10 -mx-rm-gutter grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2 border-t border-rm-line bg-rm-bg px-rm-gutter py-3 lg:static lg:mx-0 lg:grid-cols-[minmax(0,1fr)] lg:rounded-rm-xl lg:border lg:border-rm-edge lg:bg-rm-surface lg:p-rm-gutter">
          <button type="submit" disabled={busy} onClick={() => (action.current = 'publish_now')} className={`${BTN_PRIMARY} lg:order-1`}>
            <Zap size={16} aria-hidden="true" className="flex-none" />
            <span className="min-w-0 truncate">{busy && running === 'publish_now' ? 'Đang ban hành…' : 'Ban hành ngay'}</span>
          </button>
          <button type="submit" disabled={busy} onClick={() => (action.current = 'draft')} className={`${BTN_LINE} order-first lg:order-2`}>
            {busy && running === 'draft' ? 'Đang lưu…' : 'Lưu nháp'}
          </button>
          {isPublisher && (
            <span className="hidden lg:contents">
              <button type="submit" disabled={busy} onClick={() => (action.current = 'submit')} className={`${BTN_LINE} lg:order-3`}>
                {busy && running === 'submit' ? 'Đang gửi…' : 'Lưu và gửi duyệt'}
              </button>
            </span>
          )}
          <span className="hidden lg:contents">
            <button type="button" disabled={busy} onClick={onCancel} className="h-rm-control text-sm text-rm-muted lg:order-4">
              Huỷ
            </button>
          </span>
        </div>
      </div>
    </form>
  );
}

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section aria-label={title} className="flex flex-col gap-4 rounded-rm-xl border border-rm-edge bg-rm-surface p-rm-gutter">
      <header>
        <h2 className="font-heading text-base font-semibold">{title}</h2>
        {hint && <p className="mt-0.5 text-sm text-rm-muted">{hint}</p>}
      </header>
      {children}
    </section>
  );
}
