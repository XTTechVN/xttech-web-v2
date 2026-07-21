export type ExportBatch = {
  id: string;
  imageCount: number;
  format: string;
  downloadUrl: string | null;
  minioKey: string | null;
  createdBy: string | null;
  exportedAt: string;
};
