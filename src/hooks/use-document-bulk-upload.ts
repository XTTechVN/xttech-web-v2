'use client';

import { useState, useRef, useCallback } from 'react';
import type { QueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { bulkUploadDocuments } from '@/actions/document';
import { showErrorToast, invalidateDocumentQueries } from '@/utils';

interface UseDocumentBulkUploadOptions {
  queryClient: QueryClient;
  currentFolderId: number | null;
  onSuccess?: () => void;
}

export function useDocumentBulkUpload({
  queryClient,
  currentFolderId,
  onSuccess,
}: UseDocumentBulkUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  const triggerFilesUpload = useCallback(() => {
    if (isUploading || !fileInputRef.current) return;
    fileInputRef.current.value = '';
    fileInputRef.current.click();
  }, [isUploading]);

  const triggerFolderUpload = useCallback(() => {
    if (isUploading || !folderInputRef.current) return;
    folderInputRef.current.value = '';
    folderInputRef.current.click();
  }, [isUploading]);

  const executeBulkUpload = useCallback(
    async (files: File[], isFolder: boolean) => {
      if (files.length === 0 || isUploading) return;
      setIsUploading(true);
      const loadingToastId = toast.loading(
        isFolder
          ? `Đang tải thư mục lên (${files.length} tệp)...`
          : `Đang tải ${files.length} tệp lên...`,
      );

      try {
        const relativePaths = isFolder
          ? files.map((f) => (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name)
          : files.map((f) => f.name);

        const result = await bulkUploadDocuments({
          files,
          relativePaths,
          categoryId: currentFolderId,
          shareScope: 'private',
        });

        const uploadedCount = result?.uploadedCount ?? files.length;
        const createdFolders = result?.createdFoldersCount ?? 0;

        toast.dismiss(loadingToastId);
        toast.success(
          isFolder && createdFolders > 0
            ? `Đã tải lên ${uploadedCount} tệp và tạo ${createdFolders} thư mục thành công`
            : `Đã tải lên ${uploadedCount} tệp thành công`,
        );

        invalidateDocumentQueries(queryClient);
        onSuccess?.();
      } catch (error: unknown) {
        toast.dismiss(loadingToastId);
        showErrorToast(error, isFolder ? 'Không thể tải thư mục lên' : 'Không thể tải tệp lên');
      } finally {
        setIsUploading(false);
      }
    },
    [currentFolderId, isUploading, queryClient, onSuccess],
  );

  const handleFilesChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;
      if (!fileList || fileList.length === 0) return;
      const files = Array.from(fileList);
      e.target.value = '';
      void executeBulkUpload(files, false);
    },
    [executeBulkUpload],
  );

  const handleFolderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;
      if (!fileList || fileList.length === 0) return;
      const files = Array.from(fileList);
      e.target.value = '';
      void executeBulkUpload(files, true);
    },
    [executeBulkUpload],
  );

  return {
    isUploading,
    fileInputRef,
    folderInputRef,
    triggerFilesUpload,
    triggerFolderUpload,
    handleFilesChange,
    handleFolderChange,
  };
}
