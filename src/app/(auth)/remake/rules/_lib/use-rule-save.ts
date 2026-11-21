import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createDocument, createDocumentVersion, publishDocument, submitDocument, updateDocument } from '@/actions';
import type { DocumentItem } from '@/types';
import { messageOf } from '../../_components/form';

export type SaveMode = 'draft' | 'submit' | 'publish_now';

export interface RuleValues {
  title: string;
  documentType: string;
  summary: string;
  shareScope: 'all' | 'department' | 'user';
  departmentIds: string[];
  userIds: string[];
  expirationDate: string;
  approverId: string;
  requiresAcknowledgement: boolean;
  supersedesId: number | null;
}

const payloadOf = (v: RuleValues) => ({
  title: v.title.trim(),
  documentType: v.documentType,
  summary: v.summary.trim() || null,
  shareScope: v.shareScope,
  expirationDate: v.expirationDate || null,
  requiresAcknowledgement: v.requiresAcknowledgement,
  ...(v.supersedesId ? { supersedesId: v.supersedesId } : {}),
  ...(v.shareScope === 'department' && v.departmentIds.length ? { recipientDepartmentIds: v.departmentIds.map(Number) } : {}),
  ...(v.shareScope === 'user' && v.userIds.length ? { recipientUserIds: v.userIds } : {}),
});

async function save(v: RuleValues, file: File | null, doc: DocumentItem | null): Promise<DocumentItem> {
  if (!doc) {
    const fd = new FormData();
    fd.append('file', file as File);
    fd.append('document_data', JSON.stringify(payloadOf(v)));
    return createDocument(fd);
  }
  const updated = await updateDocument(doc.id, payloadOf(v) as Partial<DocumentItem>);
  if (file) {
    const fd = new FormData();
    fd.append('file', file);
    await createDocumentVersion(doc.id, fd);
  }
  return updated;
}

// Lưu bản nháp, gửi duyệt, hoặc duyệt và ban hành ngay (cấp ban hành).
export function useRuleSave(onSaved: () => void) {
  return useMutation({
    mutationFn: async ({ values, file, doc, mode }: { values: RuleValues; file: File | null; doc: DocumentItem | null; mode: SaveMode }) => {
      const saved = await save(values, file, doc);
      if (mode === 'submit') await submitDocument(saved.id, { approverId: values.approverId });
      if (mode === 'publish_now') {
        await publishDocument(saved.id, {
          shareScope: values.shareScope,
          supersedesId: values.supersedesId ?? undefined,
          recipientDepartmentIds: values.shareScope === 'department' ? values.departmentIds.map(Number) : undefined,
          recipientUserIds: values.shareScope === 'user' ? values.userIds : undefined,
        });
      }
      return mode;
    },
    onSuccess: (mode) => {
      toast.success(
        mode === 'publish_now' ? 'Đã duyệt và ban hành văn bản' : mode === 'submit' ? 'Đã lưu và gửi văn bản đi phê duyệt' : 'Đã lưu bản nháp',
      );
      onSaved();
    },
    onError: (e) => toast.error(messageOf(e)),
  });
}
