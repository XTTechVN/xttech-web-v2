export type TrashItemType = 'document' | 'folder';

export interface TrashItem {
  id: number;
  itemType: TrashItemType;
  code: string;
  title: string;
  categoryId: number | null;
  categoryName: string | null;
  documentType: string | null;
  fileName: string | null;
  filePath: string | null;
  fileSize: number | null;
  deletedAt: string;
  deletedByName: string;
  daysLeft: number;
}

export interface TrashActionPayload {
  itemType: TrashItemType;
  itemId: number;
}
