import api from '@/utils/api';
import type { ImportPreviewResult, ImportResult } from '@/types';

/**
 * Tải xuống file Excel mẫu (có sẵn dữ liệu & ảnh nhúng)
 */
export const downloadProjectImportTemplate = async (): Promise<void> => {
  try {
    const response = await api.get('/api/v1/excels/project/export', {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'project_export_sample.xlsx');
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error: unknown) {
    console.warn('API error downloadProjectImportTemplate', error);
    throw error;
  }
};

/**
 * Preview dữ liệu từ file Excel trước khi import (Dry-run validation)
 */
export const previewImportProjectExcel = async (file: File): Promise<ImportPreviewResult> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/v1/excels/project/import/preview', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: unknown) {
    console.warn('API error previewImportProjectExcel', error);
    throw error;
  }
};

/**
 * Thực hiện Import dữ liệu chính thức từ file Excel
 */
export const importProjectExcel = async (file: File): Promise<ImportResult> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/v1/excels/project/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: unknown) {
    console.warn('API error importProjectExcel', error);
    throw error;
  }
};
