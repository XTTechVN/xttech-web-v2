'use client';

import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createDocument, createDocumentVersion, publishDocument, submitDocument, updateDocument } from '@/actions/document';
import type { DocumentItem } from '@/types';

export type RuleSaveActionMode = 'draft' | 'submit' | 'publish_now';

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
  actionMode: RuleSaveActionMode;
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

// Lưu bản nháp, trình duyệt, hoặc duyệt & ban hành ngay (dành cho cấp quản lý)
export function useRuleSave(onSaved: () => void) {
  return useMutation({
    mutationFn: async ({ values, file, existingDoc, actionMode }: SaveRuleInput) => {
      const savedDoc = existingDoc ? await updateDraft(existingDoc, values, file) : await createDraft(values, file as File);
      if (actionMode === 'submit') {
        await submitDocument(savedDoc.id, { approverId: values.approverId as string });
      } else if (actionMode === 'publish_now') {
        await publishDocument(savedDoc.id, {
          shareScope: values.shareScope,
          supersedesId: values.supersedesId ?? undefined,
          recipientDepartmentIds: values.shareScope === 'department' ? values.recipientDepartmentIds?.map(Number) : undefined,
          recipientUserIds: values.shareScope === 'user' ? values.recipientUserIds?.map(String) : undefined,
        });
      }
      return { actionMode };
    },
    onSuccess: ({ actionMode }) => {
      const msg =
        actionMode === 'publish_now'
          ? 'Đã duyệt và ban hành văn bản chính thức!'
          : actionMode === 'submit'
            ? 'Đã lưu và gửi văn bản đi phê duyệt'
            : 'Đã lưu bản nháp';
      toast.success(msg);
      onSaved();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
