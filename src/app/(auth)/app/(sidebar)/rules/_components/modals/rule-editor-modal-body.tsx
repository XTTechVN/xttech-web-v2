'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';
import { FilePen, FileUp, RefreshCw, Sparkles, Zap } from 'lucide-react';
import { Modal, Button, Input, Select, MultiSelect, Textarea, Checkbox } from '@/components';
import { OnlineA4Composer } from '@/components/documents/composer/online-a4-composer';
import {
  buildAdministrativeA4Html, createHtmlDocumentFile,
  extractComposerBodyFromHtml, getTemplateByDocType,
} from '@/config/document-templates';
import { usePermission } from '@/hooks';
import type { DocumentItem } from '@/types';
import { DOCUMENT_TYPE_MAP, RULE_FILTER_TYPES } from '@/types';
import { api, getFileExtension, getFileUrl } from '@/utils';
import { useRulesShareOptions } from '../../_hooks/use-rules-share-options';
import { useRuleSave, type RuleFormValues } from '../../_hooks/use-rule-save';
import { RuleFilePicker } from '../rule-file-picker';

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

export interface RuleEditorModalProps {
  isOpen: boolean;
  document: DocumentItem | null;
  supersedingDoc?: DocumentItem | null;
  onClose: () => void;
  onSaved: () => void;
}

const TYPE_OPTIONS = RULE_FILTER_TYPES.map((key) => ({ value: key, label: DOCUMENT_TYPE_MAP[key].label }));
const SCOPE_OPTIONS = [
  { value: 'all', label: 'Toàn công ty' },
  { value: 'department', label: 'Theo phòng ban' },
  { value: 'user', label: 'Theo cá nhân' },
];
const EMPTY_ARRAY: (string | number)[] = [];

const buildDefaults = (doc: DocumentItem | null, supersedingDoc?: DocumentItem | null): RuleFormValues => {
  const source = doc || supersedingDoc;
  if (!source) {
    return {
      title: '', documentType: 'regulation', summary: '', shareScope: 'all',
      recipientDepartmentIds: [], recipientUserIds: [], expirationDate: '',
      approverId: '', requiresAcknowledgement: false, supersedesId: null,
    };
  }
  const shareScope = source.shareScope === 'department' || source.shareScope === 'user' ? source.shareScope : 'all';
  return {
    title: doc ? (doc.title ?? '') : `Thay thế ${source.title}`,
    documentType: source.documentType === 'notice' ? 'announcement' : (source.documentType ?? 'regulation'),
    summary: doc ? (doc.summary ?? '') : `Văn bản ban hành thay thế cho ${source.code} - ${source.title}`,
    shareScope,
    recipientDepartmentIds: source.recipientDepartmentIds ?? source.recipientDepartments?.map((d) => d.id) ?? [],
    recipientUserIds: source.recipients?.map((r) => r.userId) ?? [],
    expirationDate: doc?.expirationDate ? dayjs(doc.expirationDate).format('YYYY-MM-DD') : '',
    approverId: doc?.approverId ?? '',
    requiresAcknowledgement: source.requiresAcknowledgement ?? false,
    supersedesId: doc ? (doc.supersedesId ?? doc.supersedesDoc?.id ?? null) : source.id,
  };
};

export const RuleEditorModalBody: React.FC<RuleEditorModalProps> = ({
  isOpen, document: doc, supersedingDoc, onClose, onSaved,
}) => {
  const { user, isManager } = usePermission();
  const existingExt = getFileExtension(doc?.currentVersion?.fileName || '').toLowerCase();
  const isExistingHtml = !doc || existingExt === 'html' || existingExt === 'htm';
  const [authorMode, setAuthorMode] = useState<'compose' | 'upload'>(isExistingHtml ? 'compose' : 'upload');
  const [composerHtml, setComposerHtml] = useState<string>(
    () => getTemplateByDocType(doc?.documentType || supersedingDoc?.documentType || 'regulation').defaultBodyHtml,
  );
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const actionModeRef = useRef<'draft' | 'submit' | 'publish_now'>('draft');
  const { approverOptions, employeeOptions, departmentOptions } = useRulesShareOptions(isOpen, user?.id);
  const { register, handleSubmit, setValue, setError, clearErrors, watch, formState: { errors } } = useForm<RuleFormValues>({
    resolver: zodResolver(ruleSchema), defaultValues: buildDefaults(doc, supersedingDoc),
  });

  useEffect(() => {
    if (!doc?.currentVersion || (existingExt !== 'html' && existingExt !== 'htm')) return;
    const downloadUrl = doc.currentVersion.downloadUrl || (doc.currentVersion.filePath ? getFileUrl(doc.currentVersion.filePath) : null);
    if (!downloadUrl) return;
    api.get(downloadUrl, { responseType: 'text' }).then((res) => {
      if (typeof res.data === 'string' && res.data.trim()) setComposerHtml(extractComposerBodyFromHtml(res.data));
    }).catch(() => {});
  }, [doc, existingExt]);

  const saveMutation = useRuleSave(() => { onSaved(); onClose(); });
  const approverSelectOptions = useMemo(
    () => [{ value: '', label: 'Chưa chỉ định (Mặc định lưu vào bản nháp)' }, ...approverOptions],
    [approverOptions],
  );

  const [currentDocType, currentTitle, currentSummary, currentApproverId, currentShareScope, rawDeptIds, rawUserIds] = watch([
    'documentType', 'title', 'summary', 'approverId', 'shareScope', 'recipientDepartmentIds', 'recipientUserIds',
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
        title: values.title, code: doc?.code, documentType: values.documentType,
        summary: values.summary, bodyHtml: composerHtml,
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
  const targetReplaced = supersedingDoc || doc?.supersedesDoc;

  return (
    <Modal
      isOpen={isOpen} onClose={onClose} size="xl" className="m-2 max-w-4xl w-full"
      title={
        <div className="flex items-center gap-2 text-slate-800">
          <FilePen className="text-primary" size={20} />
          <span>{supersedingDoc ? 'Soạn cơ chế thay thế văn bản' : doc ? 'Chỉnh sửa dự thảo văn bản' : 'Soạn thảo & Đề xuất Văn bản'}</span>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onValid)} className="flex flex-col gap-3.5 text-xs">
        {targetReplaced && (
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900">
            <RefreshCw size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-800">Thay thế cho văn bản: </span>
              <span className="font-mono font-bold text-amber-700">[{targetReplaced.code}]</span> {targetReplaced.title}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="Tiêu đề văn bản / cơ chế *" fullWidth {...register('title')} error={errors.title?.message} />
          <Select
            label="Loại cơ chế *" fullWidth value={currentDocType}
            onChange={(e) => setValue('documentType', e.target.value, { shouldValidate: true })}
            options={TYPE_OPTIONS} error={errors.documentType?.message}
          />
        </div>

        <div className="flex items-center justify-between gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200">
          {([
            { id: 'compose' as const, icon: Sparkles, label: 'Soạn trực tuyến trên Khổ giấy A4 (Khuyên dùng)' },
            { id: 'upload' as const, icon: FileUp, label: 'Tải tệp có sẵn (PDF / Word / Excel)' },
          ]).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => { setAuthorMode(id); setFileError(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                authorMode === id ? 'bg-white text-primary shadow-xs border border-primary/20' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon size={15} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {authorMode === 'compose' ? (
          <OnlineA4Composer
            title={currentTitle} code={doc?.code} documentType={currentDocType}
            summary={currentSummary} bodyHtml={composerHtml}
            creatorName={user?.fullName || user?.email} approverName={selectedApproverLabel}
            error={fileError}
            onChangeBody={(html) => { setComposerHtml(html); if (fileError) setFileError(null); }}
          />
        ) : (
          <RuleFilePicker
            file={file} existingFileName={doc?.currentVersion?.fileName}
            isRequired={!doc} error={fileError}
            onChange={(selected) => {
              setFile(selected);
              setFileError(null);
              if (selected && !watch('title')) setValue('title', selected.name.replace(/\.[^/.]+$/, ''));
            }}
          />
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Trích yếu nội dung</label>
          <Textarea rows={2} fullWidth {...register('summary')} placeholder="Tóm tắt mục đích, nội dung chính của cơ chế..." />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Phạm vi phát hành *" fullWidth value={currentShareScope}
            onChange={(e) => {
              setValue('shareScope', e.target.value as 'all' | 'department' | 'user', { shouldValidate: true });
              clearErrors(['recipientDepartmentIds', 'recipientUserIds']);
            }}
            options={SCOPE_OPTIONS}
          />
          <Select
            label={isManager ? 'Người phê duyệt (Không cần nếu Ban hành ngay)' : 'Người phê duyệt (Để trống nếu lưu nháp)'}
            fullWidth value={currentApproverId ?? ''}
            onChange={(e) => { setValue('approverId', e.target.value, { shouldValidate: true }); if (e.target.value) clearErrors('approverId'); }}
            options={approverSelectOptions} error={errors.approverId?.message}
          />
          <Input label="Ngày hết hiệu lực (nếu có)" type="date" fullWidth {...register('expirationDate')} />
        </div>

        {currentShareScope === 'department' && (
          <MultiSelect
            label="Phòng ban nhận *" options={departmentOptions} value={selectedDeptIds}
            onChange={(val) => { setValue('recipientDepartmentIds', val); if (val.length > 0) clearErrors('recipientDepartmentIds'); }}
            placeholder="Chọn phòng ban nhận..." searchPlaceholder="Tìm tên phòng ban..." fullWidth
          />
        )}

        {currentShareScope === 'user' && (
          <MultiSelect
            label="Cá nhân nhận đích danh *" options={employeeOptions} value={selectedUserIds}
            onChange={(val) => { setValue('recipientUserIds', val); if (val.length > 0) clearErrors('recipientUserIds'); }}
            placeholder="Chọn nhân sự nhận..." searchPlaceholder="Tìm tên hoặc email..." fullWidth
          />
        )}

        <Checkbox
          label="Yêu cầu người nhận xác nhận “đã đọc và hiểu”"
          checked={watch('requiresAcknowledgement')}
          onChange={(e) => setValue('requiresAcknowledgement', e.target.checked)}
        />

        <div className="flex flex-wrap gap-2.5 justify-end w-full mt-2 pt-2 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>Hủy</Button>
          <Button
            id="rule-save-draft" variant="outline" size="sm" type="submit" disabled={isLoading}
            loading={isLoading && activeMode === 'draft'} onClick={() => { actionModeRef.current = 'draft'; }}
          >
            Lưu nháp
          </Button>
          <Button
            id="rule-save-submit" variant={isManager ? 'outline' : 'primary'} size="sm" type="submit" disabled={isLoading}
            loading={isLoading && activeMode === 'submit'} onClick={() => { actionModeRef.current = 'submit'; }}
          >
            Lưu &amp; gửi duyệt
          </Button>
          {isManager && (
            <Button
              id="rule-save-publish-now" size="sm" type="submit" disabled={isLoading}
              leftIcon={<Zap size={14} />}
              loading={isLoading && activeMode === 'publish_now'} onClick={() => { actionModeRef.current = 'publish_now'; }}
            >
              Duyệt &amp; Ban hành ngay
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};
