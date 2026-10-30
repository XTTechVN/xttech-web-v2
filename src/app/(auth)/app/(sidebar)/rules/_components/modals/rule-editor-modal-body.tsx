'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';
import { FilePen, RefreshCw } from 'lucide-react';
import { Modal, Button, Input, Select, MultiSelect, Textarea, Checkbox } from '@/components';
import { usePermission } from '@/hooks';
import type { DocumentItem } from '@/types';
import { DOCUMENT_TYPE_MAP, RULE_FILTER_TYPES } from '@/types';
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
  isOpen,
  document: doc,
  supersedingDoc,
  onClose,
  onSaved,
}) => {
  const { user } = usePermission();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const isSubmitIntentRef = useRef(false);

  const { approverOptions, employeeOptions, departmentOptions } = useRulesShareOptions(isOpen, user?.id);

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

  const saveMutation = useRuleSave(() => {
    onSaved();
    onClose();
  });

  const approverSelectOptions = useMemo(
    () => [{ value: '', label: 'Chưa chỉ định (Mặc định lưu vào bản nháp)' }, ...approverOptions],
    [approverOptions],
  );

  const currentShareScope = watch('shareScope');
  const rawDeptIds = watch('recipientDepartmentIds');
  const rawUserIds = watch('recipientUserIds');
  const selectedDeptIds = Array.isArray(rawDeptIds) ? rawDeptIds : EMPTY_ARRAY;
  const selectedUserIds = Array.isArray(rawUserIds) ? rawUserIds : EMPTY_ARRAY;

  const onValid = (values: RuleFormValues) => {
    if (!doc && !file) return void setFileError('Vui lòng chọn tệp văn bản đính kèm');
    if (isSubmitIntentRef.current) {
      if (!values.approverId) {
        return void setError('approverId', { message: 'Vui lòng chọn người phê duyệt để gửi duyệt (hoặc bấm "Lưu nháp")' });
      }
      if (values.shareScope === 'department' && (!values.recipientDepartmentIds || values.recipientDepartmentIds.length === 0)) {
        return void setError('recipientDepartmentIds', { message: 'Vui lòng chọn ít nhất một phòng ban nhận' });
      }
      if (values.shareScope === 'user' && (!values.recipientUserIds || values.recipientUserIds.length === 0)) {
        return void setError('recipientUserIds', { message: 'Vui lòng chọn ít nhất một cá nhân nhận' });
      }
    }
    saveMutation.mutate({ values, file, existingDoc: doc, isSubmitting: isSubmitIntentRef.current });
  };

  const isLoading = saveMutation.isPending;
  const isSubmittingLoading = isLoading && Boolean(saveMutation.variables?.isSubmitting);
  const targetReplaced = supersedingDoc || doc?.supersedesDoc;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      className="m-2 max-w-2xl w-full"
      title={
        <div className="flex items-center gap-2 text-slate-800">
          <FilePen className="text-primary" size={20} />
          <span>{supersedingDoc ? 'Soạn cơ chế thay thế văn bản' : doc ? 'Chỉnh sửa bản nháp' : 'Soạn cơ chế mới'}</span>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onValid)} className="flex flex-col gap-4 text-xs">
        {targetReplaced && (
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900">
            <RefreshCw size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-amber-800">Văn bản này được soạn thảo để thay thế cho:</div>
              <div className="mt-0.5 font-medium">
                <span className="font-mono font-bold text-amber-700">[{targetReplaced.code}]</span> {targetReplaced.title}
              </div>
              <p className="mt-1 text-[11px] text-amber-700/90 leading-relaxed">
                Khi văn bản mới này được phê duyệt và ban hành, văn bản cũ sẽ tự động hết hiệu lực và chuyển sang trạng thái <strong>&quot;Đã bị thay thế&quot;</strong>.
              </p>
            </div>
          </div>
        )}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="Tiêu đề cơ chế *" fullWidth {...register('title')} error={errors.title?.message} />
          <Select
            label="Loại cơ chế *"
            fullWidth
            value={watch('documentType')}
            onChange={(e) => setValue('documentType', e.target.value, { shouldValidate: true })}
            options={TYPE_OPTIONS}
            error={errors.documentType?.message}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Trích yếu nội dung</label>
          <Textarea rows={2} fullWidth {...register('summary')} placeholder="Tóm tắt mục đích, nội dung chính của cơ chế..." />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Phạm vi phát hành *"
            fullWidth
            value={currentShareScope}
            onChange={(e) => {
              setValue('shareScope', e.target.value as any, { shouldValidate: true });
              clearErrors(['recipientDepartmentIds', 'recipientUserIds']);
            }}
            options={SCOPE_OPTIONS}
          />
          <Input label="Ngày hết hiệu lực (nếu có)" type="date" fullWidth {...register('expirationDate')} />
        </div>

        {currentShareScope === 'department' && (
          <div>
            <MultiSelect
              label="Phòng ban nhận *"
              options={departmentOptions}
              value={selectedDeptIds}
              onChange={(val) => {
                setValue('recipientDepartmentIds', val);
                if (val.length > 0) clearErrors('recipientDepartmentIds');
              }}
              placeholder="Chọn phòng ban nhận..."
              searchPlaceholder="Tìm tên phòng ban..."
              fullWidth
            />
            {errors.recipientDepartmentIds && (
              <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.recipientDepartmentIds.message as string}</p>
            )}
          </div>
        )}

        {currentShareScope === 'user' && (
          <div>
            <MultiSelect
              label="Cá nhân nhận đích danh *"
              options={employeeOptions}
              value={selectedUserIds}
              onChange={(val) => {
                setValue('recipientUserIds', val);
                if (val.length > 0) clearErrors('recipientUserIds');
              }}
              placeholder="Chọn nhân sự nhận..."
              searchPlaceholder="Tìm tên hoặc email..."
              fullWidth
            />
            {errors.recipientUserIds && (
              <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.recipientUserIds.message as string}</p>
            )}
          </div>
        )}

        <div>
          <Select
            label="Người phê duyệt (Để trống nếu lưu nháp)"
            fullWidth
            value={watch('approverId') ?? ''}
            onChange={(e) => {
              setValue('approverId', e.target.value, { shouldValidate: true });
              if (e.target.value) clearErrors('approverId');
            }}
            options={approverSelectOptions}
            error={errors.approverId?.message}
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Nếu không chọn người phê duyệt, cơ chế sẽ tự động được lưu vào tab Bản nháp.
          </p>
        </div>

        <Checkbox
          label="Yêu cầu người nhận xác nhận “đã đọc và hiểu”"
          checked={watch('requiresAcknowledgement')}
          onChange={(e) => setValue('requiresAcknowledgement', e.target.checked)}
        />

        <div className="flex gap-3 justify-end w-full mt-2 pt-2 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            id="rule-save-draft"
            variant="outline"
            size="sm"
            type="submit"
            disabled={isLoading}
            loading={isLoading && !isSubmittingLoading}
            onClick={() => { isSubmitIntentRef.current = false; }}
          >
            Lưu nháp
          </Button>
          <Button
            id="rule-save-submit"
            size="sm"
            type="submit"
            disabled={isLoading}
            loading={isSubmittingLoading}
            onClick={() => { isSubmitIntentRef.current = true; }}
          >
            Lưu &amp; gửi duyệt
          </Button>
        </div>
      </form>
    </Modal>
  );
};
