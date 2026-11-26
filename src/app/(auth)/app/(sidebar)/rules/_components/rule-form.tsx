'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';
import { FilePen, FileUp } from 'lucide-react';
import { Input, MultiSelect, Textarea, Checkbox } from '@/components';
import { Button, Chip, DrawerSection, Select } from '@/components-remake';
import { OnlineA4Composer } from '@/components/documents/composer/online-a4-composer';
import { buildAdministrativeA4Html, createHtmlDocumentFile, extractComposerBodyFromHtml, getTemplateByDocType } from '@/config/document-templates';
import { useCan } from '@/hooks';
import { useAuthStore } from '@/stores';
import type { DocumentItem } from '@/types';
import { DOCUMENT_TYPE_MAP, RULE_FILTER_TYPES } from '@/types';
import { api, getFileExtension, getFileUrl, invalidateDocumentQueries, RULES_QUERY_KEYS } from '@/utils';
import { cn } from '@/utils/cn';
import queryClient from '@/utils/query';
import { useRulesShareOptions } from '../_hooks/use-rules-share-options';
import { useRuleSave, type RuleFormValues } from '../_hooks/use-rule-save';
import { RuleFilePicker } from './rule-file-picker';

const ruleSchema = z.object({
  title: z.string().trim().min(1, { message: 'Tiêu đề không được để trống' }).max(255, { message: 'Tối đa 255 ký tự' }),
  documentType: z.string().min(1, { message: 'Vui lòng chọn loại cơ chế' }),
  summary: z.string().optional(),
  shareScope: z.enum(['all', 'department', 'user']),
  recipientDepartmentIds: z.array(z.union([z.string(), z.number()])).optional(),
  recipientUserIds: z.array(z.union([z.string(), z.number()])).optional(),
  expirationDate: z.string().optional(),
  approverId: z.string().optional(),
  requiresAcknowledgement: z.boolean(),
  supersedesId: z.number().nullable().optional(),
});

interface Props {
  document: DocumentItem | null;
  supersedingDoc?: DocumentItem | null;
  onSaved: () => void;
}

const TYPE_OPTIONS = RULE_FILTER_TYPES.map((key) => ({ value: key, label: DOCUMENT_TYPE_MAP[key].label }));
const SCOPE_OPTIONS = [
  { value: 'all', label: 'Toàn công ty' },
  { value: 'department', label: 'Theo phòng ban' },
  { value: 'user', label: 'Theo cá nhân' },
];
const BLOCK = 'rounded-block border border-slate-200 bg-white p-4';
const RULE_FORM_ID = 'rule-form';
const EMPTY_ARRAY: (string | number)[] = [];

const buildDefaults = (doc: DocumentItem | null, supersedingDoc?: DocumentItem | null): RuleFormValues => {
  const source = doc || supersedingDoc;
  if (!source) {
    return {
      title: '',
      documentType: 'regulation',
      summary: '',
      shareScope: 'all',
      recipientDepartmentIds: [],
      recipientUserIds: [],
      expirationDate: '',
      approverId: '',
      requiresAcknowledgement: false,
      supersedesId: null,
    };
  }
  const shareScope = source.shareScope === 'department' || source.shareScope === 'user' ? source.shareScope : 'all';
  return {
    title: doc ? (doc.title ?? '') : /^thay thế/i.test(source.title) ? source.title : `Thay thế ${source.title}`,
    documentType: source.documentType === 'notice' ? 'announcement' : (source.documentType ?? 'regulation'),
    summary: doc ? (doc.summary ?? '') : `Thay thế cho ${source.code}`,
    shareScope,
    recipientDepartmentIds: source.recipientDepartmentIds ?? source.recipientDepartments?.map((d) => d.id) ?? [],
    recipientUserIds: source.recipients?.map((r) => r.userId) ?? [],
    expirationDate: doc?.expirationDate ? dayjs(doc.expirationDate).format('YYYY-MM-DD') : '',
    approverId: doc?.approverId ?? '',
    requiresAcknowledgement: source.requiresAcknowledgement ?? false,
    supersedesId: doc ? (doc.supersedesId ?? doc.supersedesDoc?.id ?? null) : source.id,
  };
};

// Form soạn / sửa văn bản (dài, nhiều hành động nên là trang riêng): thanh nút cố định đáy
export function RuleForm({ document: doc, supersedingDoc, onSaved }: Props) {
  const user = useAuthStore((s) => s.user);
  const isManager = useCan().can('document:publish');
  const existingExt = getFileExtension(doc?.currentVersion?.fileName || '').toLowerCase();
  const isExistingHtml = !doc || existingExt === 'html' || existingExt === 'htm';
  const [authorMode, setAuthorMode] = useState<'compose' | 'upload'>(isExistingHtml ? 'compose' : 'upload');
  const [composerHtml, setComposerHtml] = useState<string>(
    () => getTemplateByDocType(doc?.documentType || supersedingDoc?.documentType || 'regulation').defaultBodyHtml,
  );
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const actionModeRef = useRef<'draft' | 'submit' | 'publish_now'>('draft');
  const { approverOptions, employeeOptions, departmentOptions } = useRulesShareOptions(true, user?.id);
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm<RuleFormValues>({
    resolver: zodResolver(ruleSchema),
    defaultValues: buildDefaults(doc, supersedingDoc),
  });

  useEffect(() => {
    if (!doc?.currentVersion || (existingExt !== 'html' && existingExt !== 'htm')) return;
    const downloadUrl = doc.currentVersion.downloadUrl || (doc.currentVersion.filePath ? getFileUrl(doc.currentVersion.filePath) : null);
    if (!downloadUrl) return;
    api
      .get(downloadUrl, { responseType: 'text' })
      .then((res) => {
        if (typeof res.data === 'string' && res.data.trim()) setComposerHtml(extractComposerBodyFromHtml(res.data));
      })
      .catch(() => {});
  }, [doc, existingExt]);

  const saveMutation = useRuleSave(() => {
    queryClient.invalidateQueries({ queryKey: RULES_QUERY_KEYS.root });
    invalidateDocumentQueries(queryClient);
    onSaved();
  });

  const [currentDocType, currentTitle, currentSummary, currentApproverId, currentShareScope, rawDeptIds, rawUserIds] = watch([
    'documentType',
    'title',
    'summary',
    'approverId',
    'shareScope',
    'recipientDepartmentIds',
    'recipientUserIds',
  ]);
  const selectedDeptIds = Array.isArray(rawDeptIds) ? rawDeptIds : EMPTY_ARRAY;
  const selectedUserIds = Array.isArray(rawUserIds) ? rawUserIds : EMPTY_ARRAY;
  const selectedApproverLabel = useMemo(() => {
    const found = approverOptions.find((o) => String(o.value) === String(currentApproverId));
    return found ? found.label.replace(/\s*\([^)]*\)\s*$/, '') : undefined;
  }, [approverOptions, currentApproverId]);

  const onValid = (values: RuleFormValues) => {
    let targetFile: File | null = file;
    if (authorMode === 'compose') {
      if (!composerHtml.replace(/<[^>]+>/g, '').trim()) {
        return void setFileError('Vui lòng nhập nội dung văn bản trên trình soạn thảo A4');
      }
      const fullA4Html = buildAdministrativeA4Html({
        title: values.title,
        code: doc?.code,
        documentType: values.documentType,
        summary: values.summary,
        bodyHtml: composerHtml,
        creatorName: user?.fullName || user?.email,
        approverName: selectedApproverLabel || (actionModeRef.current === 'publish_now' ? user?.fullName : undefined),
      });
      targetFile = createHtmlDocumentFile(fullA4Html, doc?.code || values.title);
    } else if (!doc && !file) {
      return void setFileError('Vui lòng chọn tệp văn bản đính kèm');
    }
    const mode = actionModeRef.current;
    if (mode === 'submit' && !values.approverId) {
      return void setError('approverId', { message: 'Vui lòng chọn người phê duyệt để gửi duyệt (hoặc bấm "Lưu nháp")' });
    }
    if (mode === 'submit' || mode === 'publish_now') {
      if (values.shareScope === 'department' && (!values.recipientDepartmentIds || values.recipientDepartmentIds.length === 0)) {
        return void setError('recipientDepartmentIds', { message: 'Vui lòng chọn ít nhất một phòng ban nhận' });
      }
      if (values.shareScope === 'user' && (!values.recipientUserIds || values.recipientUserIds.length === 0)) {
        return void setError('recipientUserIds', { message: 'Vui lòng chọn ít nhất một cá nhân nhận' });
      }
    }
    saveMutation.mutate({ values, file: targetFile, existingDoc: doc, actionMode: mode });
  };

  const isLoading = saveMutation.isPending;
  const activeMode = saveMutation.variables?.actionMode;
  const submitAs = (mode: 'draft' | 'submit' | 'publish_now') => () => {
    actionModeRef.current = mode;
  };

  const settings = (
    <section className={BLOCK}>
      <DrawerSection title="Phát hành">
        <div className="flex flex-col gap-4">
          <Select
            label="Loại văn bản *"
            value={currentDocType}
            options={TYPE_OPTIONS}
            onChange={(v) => setValue('documentType', v, { shouldValidate: true })}
          />
          <Select
            label="Phạm vi phát hành *"
            value={currentShareScope}
            options={SCOPE_OPTIONS}
            onChange={(v) => {
              setValue('shareScope', v as 'all' | 'department' | 'user', { shouldValidate: true });
              clearErrors(['recipientDepartmentIds', 'recipientUserIds']);
            }}
          />
          {currentShareScope === 'department' && (
            <MultiSelect
              label="Phòng ban nhận *"
              options={departmentOptions}
              value={selectedDeptIds}
              onChange={(val) => {
                setValue('recipientDepartmentIds', val);
                if (val.length > 0) clearErrors('recipientDepartmentIds');
              }}
              placeholder="Chọn phòng ban..."
              searchPlaceholder="Tìm phòng ban..."
              fullWidth
            />
          )}
          {currentShareScope === 'user' && (
            <MultiSelect
              label="Cá nhân nhận *"
              options={employeeOptions}
              value={selectedUserIds}
              onChange={(val) => {
                setValue('recipientUserIds', val);
                if (val.length > 0) clearErrors('recipientUserIds');
              }}
              placeholder="Chọn nhân sự..."
              searchPlaceholder="Tìm tên hoặc email..."
              fullWidth
            />
          )}
          <div>
            <Select
              label="Người phê duyệt"
              value={currentApproverId ?? ''}
              options={approverOptions}
              placeholder="Chọn người phê duyệt"
              clearLabel="Chưa chỉ định"
              onChange={(v) => {
                setValue('approverId', v, { shouldValidate: true });
                if (v) clearErrors('approverId');
              }}
            />
            {errors.approverId?.message && <p className="mt-1 text-sm text-red-600">{errors.approverId.message}</p>}
          </div>
          <Input label="Hết hiệu lực (không bắt buộc)" type="date" fullWidth {...register('expirationDate')} />
          <Textarea label="Trích yếu" rows={3} fullWidth {...register('summary')} placeholder="Mục đích, nội dung chính..." />
          <Checkbox
            label="Yêu cầu người nhận xác nhận “đã đọc và hiểu”"
            checked={watch('requiresAcknowledgement')}
            onChange={(e) => setValue('requiresAcknowledgement', e.target.checked)}
          />
        </div>
      </DrawerSection>
    </section>
  );

  return (
    <form
      id={RULE_FORM_ID}
      onSubmit={handleSubmit(onValid)}
      className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]"
    >
      <div className="flex min-w-0 flex-col gap-4">
        <section className={BLOCK}>
          <Input label="Tiêu đề *" fullWidth {...register('title')} error={errors.title?.message} />
        </section>

        <section className={cn(BLOCK, 'flex flex-col gap-4')}>
          <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2">
            {[
              { id: 'compose' as const, icon: FilePen, label: 'Soạn trực tuyến' },
              { id: 'upload' as const, icon: FileUp, label: 'Tải tệp lên' },
            ].map(({ id, icon: Icon, label }) => (
              <Chip
                key={id}
                selected={authorMode === id}
                onClick={() => {
                  setAuthorMode(id);
                  setFileError(null);
                }}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Icon size={16} aria-hidden="true" />
                  {label}
                </span>
              </Chip>
            ))}
          </div>

          {authorMode === 'compose' ? (
            <OnlineA4Composer
              title={currentTitle}
              code={doc?.code}
              documentType={currentDocType}
              summary={currentSummary}
              bodyHtml={composerHtml}
              creatorName={user?.fullName || user?.email}
              approverName={selectedApproverLabel}
              error={fileError}
              onChangeBody={(html) => {
                setComposerHtml(html);
                if (fileError) setFileError(null);
              }}
            />
          ) : (
            <RuleFilePicker
              file={file}
              existingFileName={doc?.currentVersion?.fileName}
              isRequired={!doc}
              error={fileError}
              onChange={(selected) => {
                setFile(selected);
                setFileError(null);
                if (selected && !watch('title')) setValue('title', selected.name.replace(/\.[^/.]+$/, ''));
              }}
            />
          )}
        </section>
      </div>

      <aside className="max-lg:contents lg:flex lg:flex-col lg:gap-4 lg:sticky lg:top-4 lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto">
        {settings}
        <div className="sticky bottom-0 z-10 -mx-4 flex gap-3 border-t border-slate-200 bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:static lg:mx-0 lg:flex-col-reverse lg:rounded-block lg:border lg:border-slate-200 lg:p-4">
          <Button
            type="submit"
            className="flex-1 lg:flex-none"
            variant="outline"
            disabled={isLoading}
            loading={isLoading && activeMode === 'draft'}
            onClick={submitAs('draft')}
          >
            Lưu nháp
          </Button>
          <Button
            type="submit"
            className="flex-1 lg:flex-none"
            variant={isManager ? 'outline' : 'primary'}
            disabled={isLoading}
            loading={isLoading && activeMode === 'submit'}
            onClick={submitAs('submit')}
          >
            Gửi duyệt
          </Button>
          {isManager && (
            <Button
              type="submit"
              className="flex-1 lg:flex-none"
              disabled={isLoading}
              loading={isLoading && activeMode === 'publish_now'}
              onClick={submitAs('publish_now')}
            >
              Ban hành ngay
            </Button>
          )}
        </div>
      </aside>
    </form>
  );
}
