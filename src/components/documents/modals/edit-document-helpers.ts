import toast from 'react-hot-toast';
import { updateDocument } from '@/actions/document';
import type { DocumentCategory, DocumentItem } from '@/types';
import { DOCUMENT_TYPE_MAP, PERSONAL_DOC_TYPES } from '@/types';

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

export const DOC_TYPE_SELECT_OPTIONS = PERSONAL_DOC_TYPES.map((key) => ({
  value: key,
  label: DOCUMENT_TYPE_MAP[key]?.label || key,
}));

export function getPersonalDocTypeOptions(currentType?: string): { value: string; label: string }[] {
  const baseOptions = PERSONAL_DOC_TYPES.map((key) => ({
    value: key,
    label: DOCUMENT_TYPE_MAP[key]?.label || key,
  }));
  if (currentType && !PERSONAL_DOC_TYPES.includes(currentType)) {
    return [
      { value: currentType, label: DOCUMENT_TYPE_MAP[currentType]?.label || currentType },
      ...baseOptions,
    ];
  }
  return baseOptions;
}

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
