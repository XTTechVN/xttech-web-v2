export interface LabelAnnotation {
  id: string;
  imageId: string;
  classId: number;
  className: string;
  xCenter: number;
  yCenter: number;
  width: number;
  height: number;
  createdBy?: string;
  createdAt?: string;
}

export interface LabelImage {
  id: string;
  source: 'upload' | 'active_learning';
  imageUrl: string;
  minioKey: string;
  isLabeled: boolean;
  aiLabel?: string;
  aiConfidence?: number;
  cameraId?: string;
  note?: string;
  createdAt: string;
  updatedAt?: string;
  annotations: LabelAnnotation[];
}

export interface LabelClass {
  id: string;
  classId: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LabelExportBatch {
  id: string;
  imageCount: number;
  format: string;
  downloadUrl?: string;
  minioKey?: string;
  createdBy?: string;
  exportedAt?: string;
}
