'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { QueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ensureDocumentFolders, uploadSingleDocumentItem, downloadCategoryZip } from '@/actions/document';
import { showErrorToast, invalidateDocumentQueries, parseDataTransferEntries } from '@/utils';
import type { QueueUploadItem } from '@/components/documents/upload-progress-drawer';

const CONCURRENCY_LIMIT = 3;

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
  const [uploadQueue, setUploadQueue] = useState<QueueUploadItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const activeWorkersRef = useRef(0);
  const pendingQueueRef = useRef<QueueUploadItem[]>([]);
  const allTasksMapRef = useRef<Map<string, QueueUploadItem>>(new Map());
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Tự động đóng modal tiến trình sau 2s khi toàn bộ tác vụ hoàn tất thành công (không có lỗi)
  useEffect(() => {
    if (!isDrawerOpen || uploadQueue.length === 0) {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }
      return;
    }

    const isRunning = uploadQueue.some(
      (it) => it.status === 'pending' || it.status === 'uploading' || it.status === 'compressing',
    );
    const hasSuccess = uploadQueue.some((it) => it.status === 'success');
    const hasError = uploadQueue.some((it) => it.status === 'error');

    if (!isRunning && hasSuccess && !hasError) {
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = setTimeout(() => {
        setIsDrawerOpen(false);
        setUploadQueue((prev) => {
          const remaining = prev.filter(
            (it) => it.status === 'pending' || it.status === 'uploading' || it.status === 'compressing',
          );
          allTasksMapRef.current.clear();
          remaining.forEach((it) => allTasksMapRef.current.set(it.id, it));
          return remaining;
        });
      }, 2000);
    } else if (isRunning || hasError) {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }
    }

    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
    };
  }, [uploadQueue, isDrawerOpen]);

  const isUploading = uploadQueue.some((i) => i.status === 'uploading' || i.status === 'pending' || i.status === 'compressing');

  const updateItemStatus = useCallback(
    (id: string, updates: Partial<QueueUploadItem>) => {
      const task = allTasksMapRef.current.get(id);
      if (task) {
        Object.assign(task, updates);
      }
      setUploadQueue((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
      );
    },
    [],
  );

  const runWorker = useCallback(async () => {
    while (pendingQueueRef.current.length > 0) {
      // Atomic shift: lấy task ra khỏi đầu hàng đợi ngay lập tức (miễn nhiễm race condition)
      const nextItem = pendingQueueRef.current.shift();
      if (!nextItem || !nextItem.file) continue;

      const controller = new AbortController();
      abortControllersRef.current.set(nextItem.id, controller);

      updateItemStatus(nextItem.id, { status: 'uploading', progress: 0 });

      try {
        await uploadSingleDocumentItem({
          file: nextItem.file,
          categoryId: nextItem.targetCategoryId,
          title: nextItem.title,
          signal: controller.signal,
          onProgress: (percent) => updateItemStatus(nextItem.id, { progress: percent }),
        });

        updateItemStatus(nextItem.id, { status: 'success', progress: 100 });
        invalidateDocumentQueries(queryClient);
      } catch (err: any) {
        if (controller.signal.aborted) {
          updateItemStatus(nextItem.id, { status: 'cancelled' });
        } else {
          updateItemStatus(nextItem.id, {
            status: 'error',
            errorMessage: err?.message || 'Lỗi khi tải tệp',
          });
        }
      } finally {
        abortControllersRef.current.delete(nextItem.id);
      }
    }
  }, [queryClient, updateItemStatus]);

  const dispatchWorkers = useCallback(() => {
    const pendingCount = pendingQueueRef.current.length;
    if (pendingCount === 0) return;

    const availableSlots = CONCURRENCY_LIMIT - activeWorkersRef.current;
    if (availableSlots <= 0) return;

    const workersToSpawn = Math.min(pendingCount, availableSlots);
    for (let i = 0; i < workersToSpawn; i++) {
      activeWorkersRef.current += 1;
      void runWorker().finally(() => {
        activeWorkersRef.current -= 1;
        if (activeWorkersRef.current === 0 && pendingQueueRef.current.length === 0) {
          const allItems = Array.from(allTasksMapRef.current.values());
          const uploadItems = allItems.filter((it) => it.direction !== 'download');
          const successes = uploadItems.filter((it) => it.status === 'success').length;
          const errors = uploadItems.filter((it) => it.status === 'error').length;
          if (successes > 0 && errors === 0) {
            toast.success(`Đã tải lên toàn bộ ${successes} tệp thành công!`);
          }
          onSuccess?.();
        }
      });
    }
  }, [runWorker, onSuccess]);

  const executeBulkUpload = useCallback(
    async (files: File[], isFolder: boolean, customRelativePaths?: string[]) => {
      if (files.length === 0) return;

      const relativePaths =
        customRelativePaths ||
        (isFolder
          ? files.map((f) => (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name)
          : files.map((f) => f.name));

      // Giai đoạn 1: Thu thập và phân giải trước cây thư mục
      const folderPathSet = new Set<string>();
      relativePaths.forEach((p) => {
        const cleaned = p.replace(/\\/g, '/').replace(/^\/+/, '');
        const lastSlash = cleaned.lastIndexOf('/');
        if (lastSlash > 0) {
          folderPathSet.add(cleaned.substring(0, lastSlash));
        }
      });

      let folderMap: Record<string, number> = {};
      if (folderPathSet.size > 0) {
        try {
          const res = await ensureDocumentFolders(currentFolderId, Array.from(folderPathSet));
          folderMap = res.folderMap || {};
        } catch (err) {
          showErrorToast(err, 'Không thể tạo cây thư mục đích');
          return;
        }
      }

      // Giai đoạn 2: Khởi tạo các item trong hàng đợi
      const now = Date.now();
      const newItems: QueueUploadItem[] = files.map((file, idx) => {
        const relPath = relativePaths[idx] || file.name;
        const cleaned = relPath.replace(/\\/g, '/').replace(/^\/+/, '');
        const lastSlash = cleaned.lastIndexOf('/');
        const folderPart = lastSlash > 0 ? cleaned.substring(0, lastSlash) : null;
        const targetId =
          folderPart && folderMap[folderPart] !== undefined ? folderMap[folderPart] : currentFolderId;
        const filename = lastSlash > 0 ? cleaned.substring(lastSlash + 1) : cleaned;

        return {
          id: `${now}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
          file,
          relativePath: relPath,
          targetCategoryId: targetId,
          title: filename,
          size: file.size,
          progress: 0,
          status: 'pending',
        };
      });

      newItems.forEach((it) => {
        allTasksMapRef.current.set(it.id, it);
        pendingQueueRef.current.push(it);
      });

      setUploadQueue((prev) => [...prev, ...newItems]);
      setIsDrawerOpen(true);
      dispatchWorkers();
    },
    [currentFolderId, dispatchWorkers],
  );

  const retryItem = useCallback(
    (id: string) => {
      const task = allTasksMapRef.current.get(id);
      if (!task || !task.file) return;
      updateItemStatus(id, { status: 'pending', progress: 0, errorMessage: undefined });
      pendingQueueRef.current.push(task);
      dispatchWorkers();
    },
    [updateItemStatus, dispatchWorkers],
  );

  const cancelItem = useCallback(
    (id: string) => {
      const idx = pendingQueueRef.current.findIndex((it) => it.id === id);
      if (idx !== -1) {
        pendingQueueRef.current.splice(idx, 1);
      }
      const controller = abortControllersRef.current.get(id);
      if (controller) {
        controller.abort();
      } else {
        updateItemStatus(id, { status: 'cancelled' });
      }
    },
    [updateItemStatus],
  );

  const triggerFilesUpload = useCallback(() => {
    if (!fileInputRef.current) return;
    fileInputRef.current.value = '';
    fileInputRef.current.click();
  }, []);

  const triggerFolderUpload = useCallback(() => {
    if (!folderInputRef.current) return;
    folderInputRef.current.value = '';
    folderInputRef.current.click();
  }, []);

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

  const handleDroppedDataTransfer = useCallback(
    async (dataTransfer: DataTransfer) => {
      try {
        const { files, relativePaths } = await parseDataTransferEntries(dataTransfer);
        if (files.length === 0) {
          toast.error('Thư mục hoặc tệp được thả vào không có nội dung');
          return;
        }
        const hasFolders = relativePaths.some((p) => p.includes('/'));
        await executeBulkUpload(files, hasFolders, relativePaths);
      } catch (error: unknown) {
        showErrorToast(error, 'Không thể đọc tệp hoặc thư mục được thả vào');
      }
    },
    [executeBulkUpload],
  );

  const startDownloadFolder = useCallback(
    async (folderId: number, folderName: string) => {
      const itemId = `download-${folderId}-${Date.now()}`;
      const controller = new AbortController();
      abortControllersRef.current.set(itemId, controller);

      const newItem: QueueUploadItem = {
        id: itemId,
        title: `${folderName}.zip`,
        size: 0,
        progress: 0,
        status: 'compressing',
        direction: 'download',
        abortController: controller,
      };

      allTasksMapRef.current.set(itemId, newItem);

      // Chỉ giữ lại các tác vụ đang thực sự chạy, loại bỏ 100% lịch sử cũ đã xong hoặc đã hủy
      setUploadQueue((prev) => {
        const activeRunningItems = prev.filter(
          (it) => it.status === 'uploading' || it.status === 'compressing' || it.status === 'pending',
        );
        return [newItem, ...activeRunningItems];
      });
      setIsDrawerOpen(true);

      try {
        await downloadCategoryZip(folderId, folderName, {
          signal: controller.signal,
          onProgress: (loaded, total) => {
            const percent = total > 0 ? Math.round((loaded * 100) / total) : 50;
            updateItemStatus(itemId, {
              status: 'uploading',
              size: total || loaded,
              progress: percent,
            });
          },
        });
        updateItemStatus(itemId, { status: 'success', progress: 100 });
        toast.success(`Đã tải xuống thư mục "${folderName}"!`);
      } catch (err: any) {
        if (controller.signal.aborted) {
          updateItemStatus(itemId, { status: 'cancelled' });
        } else {
          updateItemStatus(itemId, {
            status: 'error',
            errorMessage: err?.message || 'Lỗi khi tải thư mục',
          });
          toast.error(err?.message || 'Không thể tải xuống thư mục');
        }
      } finally {
        abortControllersRef.current.delete(itemId);
      }
    },
    [updateItemStatus],
  );

  return {
    isUploading,
    uploadQueue,
    isDrawerOpen,
    closeDrawer: () => {
      setIsDrawerOpen(false);
      setUploadQueue((prev) => {
        const remaining = prev.filter(
          (it) => it.status === 'pending' || it.status === 'uploading' || it.status === 'compressing',
        );
        allTasksMapRef.current.clear();
        remaining.forEach((it) => allTasksMapRef.current.set(it.id, it));
        return remaining;
      });
    },
    retryItem,
    cancelItem,
    startDownloadFolder,
    fileInputRef,
    folderInputRef,
    triggerFilesUpload,
    triggerFolderUpload,
    handleFilesChange,
    handleFolderChange,
    handleDroppedDataTransfer,
  };
}
