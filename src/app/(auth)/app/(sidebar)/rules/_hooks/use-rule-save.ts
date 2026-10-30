'use client';

import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createDocument, createDocumentVersion, submitDocument, updateDocument } from '@/actions/document';
import type { DocumentItem } from '@/types';

export interface RuleFormValues {
  title: string;
  documentType: string;
  summary?: string;
  shareScope: 'all' | 'department' | 'user';
  recipientDepartmentIds?: (string | number)[];
  recipientUserIds?: (string | number)[];
  expirationDate?: string;
  approverId?: string;
  requiresAcknowledgement: boolean;
  supersedesId?: number | null;
}

interface SaveRuleInput {
  values: RuleFormValues;
  file: File | null;
  existingDoc: DocumentItem | null;
  isSubmitting: boolean; // true: lưu rồi gửi duyệt ngay
}

const toDocumentPayload = (values: RuleFormValues) => {
  const payload: Record<string, any> = {
    title: values.title.trim(),
    documentType: values.documentType,
    summary: values.summary?.trim() || null,
    shareScope: values.shareScope || 'all',
    expirationDate: values.expirationDate || null,
    requiresAcknowledgement: values.requiresAcknowledgement,
  };

  if (values.supersedesId) {
    payload.supersedesId = Number(values.supersedesId);
  }

  if (values.shareScope === 'department' && values.recipientDepartmentIds?.length) {
    payload.recipientDepartmentIds = values.recipientDepartmentIds.map(Number);
  } else if (values.shareScope === 'user' && values.recipientUserIds?.length) {
    payload.recipientUserIds = values.recipientUserIds.map(String);
  }

  return payload;
};

const createDraft = async (values: RuleFormValues, file: File): Promise<DocumentItem> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('document_data', JSON.stringify(toDocumentPayload(values)));
  return createDocument(formData);
};

const updateDraft = async (doc: DocumentItem, values: RuleFormValues, file: File | null): Promise<DocumentItem> => {
  const updated = await updateDocument(doc.id, toDocumentPayload(values) as Partial<DocumentItem>);
  if (!file) return updated;

  const formData = new FormData();
  formData.append('file', file);
  await createDocumentVersion(doc.id, formData);
  return updated;
};

// Lưu bản nháp (tạo mới / cập nhật) và tuỳ chọn gửi duyệt ngay sau khi lưu
export function useRuleSave(onSaved: () => void) {
  return useMutation({
    mutationFn: async ({ values, file, existingDoc, isSubmitting }: SaveRuleInput) => {
      const savedDoc = existingDoc ? await updateDraft(existingDoc, values, file) : await createDraft(values, file as File);
      if (!isSubmitting) return { isSubmitted: false };

      await submitDocument(savedDoc.id, { approverId: values.approverId as string });
      return { isSubmitted: true };
    },
    onSuccess: ({ isSubmitted }) => {
      toast.success(isSubmitted ? 'Đã lưu và gửi văn bản đi phê duyệt' : 'Đã lưu bản nháp');
      onSaved();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
