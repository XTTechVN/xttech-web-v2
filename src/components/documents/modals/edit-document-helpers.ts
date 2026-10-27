import toast from 'react-hot-toast';
import { updateDocument } from '@/actions/document';
import type { DocumentCategory, DocumentItem } from '@/types';
import { DOCUMENT_TYPE_MAP } from '@/types';

export function flattenCategoriesForSelect(
  cats: DocumentCategory[],
  prefix = '',
  visited = new Set<number>(),
): { id: number; name: string }[] {
  let result: { id: number; name: string }[] = [];
  if (!Array.isArray(cats)) return result;
  for (const cat of cats) {
    if (cat?.id && !visited.has(cat.id)) {
      visited.add(cat.id);
      result.push({ id: cat.id, name: `${prefix}${cat.name}` });
    }
    if (cat?.children?.length) {
      result = result.concat(flattenCategoriesForSelect(cat.children, `${prefix}— `, visited));
    }
  }
  return result;
}

export const DOC_TYPE_SELECT_OPTIONS = Object.entries(DOCUMENT_TYPE_MAP).map(([key, item]) => ({
  value: key,
  label: item.label,
}));

export interface SaveDocumentPersonalData {
  title: string;
  documentType: string;
  code?: string;
  categoryId?: number | string;
  summary?: string;
}

export async function saveDocumentPersonalInfo({
  doc,
  data,
}: {
  doc: DocumentItem;
  data: SaveDocumentPersonalData;
}) {
  const payload: Record<string, any> = {
    title: data.title.trim(),
    documentType: data.documentType,
  };
  if (data.code?.trim()) payload.code = data.code.trim().toUpperCase();
  if (data.categoryId) payload.categoryId = Number(data.categoryId);
  if (data.summary !== undefined) payload.summary = data.summary?.trim() || null;

  await updateDocument(doc.id, payload);
  toast.success('Cập nhật thông tin tài liệu thành công!');
}
