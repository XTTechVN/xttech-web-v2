'use client';

import { useState, useMemo } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import queryClient from '@/utils/query';
import { showErrorToast } from '@/utils';
import {
  previewAccessoriesExcel,
  bulkUpsertAccessories,
  uploadAccessoryExcelImage,
  getAccessories,
} from '@/actions';
import type {
  Brand,
  AccessoryCategory,
  AccessoryExcelItemData,
  AccessoryExcelPreviewRow,
} from '@/types';
import type { AccessoryExcelFilterTab } from './accessory-excel-header';
import {
  autoDisambiguateAccessoryRows,
  countDuplicateCodeRows,
  revalidateAllAccessoryRows,
} from './accessory-excel-utils';

interface UseAccessoryExcelParams {
  isOpen: boolean;
  onClose: () => void;
  brands: Brand[];
  categories: AccessoryCategory[];
  defaultBrandId?: number | null;
  onImportSuccess?: (
    importedBrandIds: number[],
    importedCategoryIds: Array<number | null>,
  ) => void;
}

export function useAccessoryExcel({
  isOpen,
  onClose,
  brands,
  categories,
  defaultBrandId,
  onImportSuccess,
}: UseAccessoryExcelParams) {
  const [rows, setRows] = useState<AccessoryExcelPreviewRow[]>([]);
  const [pinnedExistingIds, setPinnedExistingIds] = useState<Map<number, number>>(new Map());
  const [filterTab, setFilterTab] = useState<AccessoryExcelFilterTab>('ALL');
  const [fileName, setFileName] = useState<string>('');
  const [uploadingRows, setUploadingRows] = useState<Set<number>>(new Set());

  const { data: existingAccessories = [] } = useQuery({
    queryKey: ['accessories', 'all-for-excel'],
    queryFn: async () =>
      (await getAccessories({ offset: 0, limit: 5000, allowDeleted: false })).items,
    enabled: isOpen,
  });

  const { mutate: previewMutate, isPending: isPreviewing } = useMutation({
    mutationFn: (file: File) => previewAccessoriesExcel(file, defaultBrandId),
    onSuccess: (res) => {
      const nextRows = res.rows || [];
      setPinnedExistingIds(new Map());
      setRows(nextRows);
      setFilterTab('ALL');
      const dupCnt = countDuplicateCodeRows(nextRows);
      if (dupCnt > 0) {
        toast.error(
          `Phát hiện ${dupCnt} dòng trùng Mã phụ kiện trong file Excel. Hãy bấm "Tự tách mã trùng" trước khi lưu!`,
          { duration: 5000 },
        );
      } else {
        toast.success(`Đã phân tích ${res.totalRows} dòng phụ kiện từ file Excel`);
      }
    },
    onError: (err) => showErrorToast(err, 'Không thể đọc file Excel'),
  });

  const { mutate: upsertMutate, isPending: isSaving } = useMutation({
    mutationFn: bulkUpsertAccessories,
    onSuccess: (res, variables) => {
      const importedBrandIds = Array.from(
        new Set(
          variables.items
            .map((it) => it.brandId)
            .filter((id): id is number => typeof id === 'number' && id > 0),
        ),
      );
      const importedCategoryIds = Array.from(
        new Set(variables.items.map((it) => it.categoryId ?? null)),
      );

      onImportSuccess?.(importedBrandIds, importedCategoryIds);

      queryClient.invalidateQueries({ queryKey: ['accessories'] });
      queryClient.invalidateQueries({ queryKey: ['accessories-list'] });
      queryClient.invalidateQueries({ queryKey: ['accessory-combos'] });
      queryClient.invalidateQueries({ queryKey: ['accessory-combos-list'] });
      queryClient.invalidateQueries({ queryKey: ['all-accessories-dropdown'] });

      const targetBrandNames = importedBrandIds
        .map((id) => brands.find((b) => b.id === id)?.name)
        .filter(Boolean)
        .join(', ');
      const brandSuffix = targetBrandNames ? ` (Hãng: ${targetBrandNames})` : '';
      toast.success(
        `Hoàn tất: Thêm mới ${res.createdCount}, Cập nhật ${res.updatedCount} phụ kiện${brandSuffix}!`,
      );
      setRows([]);
      setPinnedExistingIds(new Map());
      setFileName('');
      onClose();
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi lưu danh sách phụ kiện'),
  });

  const counts = useMemo(() => {
    let create = 0, update = 0, error = 0;
    rows.forEach((r) => {
      if (r.action === 'CREATE') create++;
      else if (r.action === 'UPDATE') update++;
      else error++;
    });
    return { total: rows.length, create, update, error, valid: create + update };
  }, [rows]);

  const duplicateRowCount = useMemo(() => countDuplicateCodeRows(rows), [rows]);

  const filteredRows = useMemo(
    () => (filterTab === 'ALL' ? rows : rows.filter((r) => r.action === filterTab)),
    [rows, filterTab],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    previewMutate(file);
    e.target.value = '';
  };

  const handleUpdateCell = (rowIndex: number, patch: Partial<AccessoryExcelItemData>) => {
    setRows((prev) =>
      revalidateAllAccessoryRows(
        prev.map((r) => (r.rowIndex === rowIndex ? { ...r, data: { ...r.data, ...patch } } : r)),
        brands,
        categories,
        existingAccessories,
        pinnedExistingIds,
      ),
    );
  };

  const handleRemoveRow = (rowIndex: number) => {
    const nextPinned = new Map(pinnedExistingIds);
    nextPinned.delete(rowIndex);
    setPinnedExistingIds(nextPinned);
    setRows((prev) =>
      revalidateAllAccessoryRows(
        prev.filter((r) => r.rowIndex !== rowIndex),
        brands,
        categories,
        existingAccessories,
        nextPinned,
      ),
    );
  };

  const handleDisambiguateDuplicates = () => {
    const { nextRows, nextPinnedIds, changedCount } = autoDisambiguateAccessoryRows(
      rows,
      brands,
      categories,
      existingAccessories,
      pinnedExistingIds,
    );
    setPinnedExistingIds(nextPinnedIds);
    setRows(nextRows);
    if (filterTab === 'ERROR') setFilterTab('ALL');
    toast.success(`Đã tự động tách ${changedCount} dòng trùng mã thành các mã duy nhất!`);
  };

  const handleUploadRowImage = async (rowIndex: number, file: File) => {
    setUploadingRows((prev) => new Set(prev).add(rowIndex));
    try {
      const res = await uploadAccessoryExcelImage(file);
      handleUpdateCell(rowIndex, { imagePath: res.imagePath });
      toast.success('Đã tải ảnh phụ kiện lên');
    } catch (err: unknown) {
      showErrorToast(err, 'Lỗi tải ảnh phụ kiện');
    } finally {
      setUploadingRows((prev) => {
        const next = new Set(prev);
        next.delete(rowIndex);
        return next;
      });
    }
  };

  const handleBatchImageMatch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;

    const tasks: Array<{ rowIndex: number; file: File }> = [];
    files.forEach((file) => {
      const baseName = file.name.replace(/\.[^/.]+$/, '').trim().toUpperCase();
      if (!baseName) return;
      rows.forEach((r) => {
        const codeUpper = (r.data.code || '').trim().toUpperCase();
        if (codeUpper && (baseName === codeUpper || baseName.startsWith(codeUpper))) {
          tasks.push({ rowIndex: r.rowIndex, file });
        }
      });
    });
    if (tasks.length === 0) {
      toast.error('Không tìm thấy dòng nào có Mã phụ kiện khớp với tên file ảnh đã chọn');
      return;
    }

    setUploadingRows((prev) => new Set([...prev, ...tasks.map((t) => t.rowIndex)]));
    const results = await Promise.allSettled(
      tasks.map(async (t) => ({ rowIndex: t.rowIndex, res: await uploadAccessoryExcelImage(t.file) })),
    );
    const imagePatchByRow = new Map<number, string>();
    results.forEach((item) => {
      if (item.status === 'fulfilled') imagePatchByRow.set(item.value.rowIndex, item.value.res.imagePath);
    });
    if (imagePatchByRow.size > 0) {
      setRows((prev) =>
        revalidateAllAccessoryRows(
          prev.map((r) =>
            imagePatchByRow.has(r.rowIndex)
              ? { ...r, data: { ...r.data, imagePath: imagePatchByRow.get(r.rowIndex)! } }
              : r,
          ),
          brands,
          categories,
          existingAccessories,
          pinnedExistingIds,
        ),
      );
      toast.success(`Đã ghép thành công ${imagePatchByRow.size} ảnh theo Mã phụ kiện!`);
    } else {
      toast.error('Tải ảnh hàng loạt thất bại');
    }
    setUploadingRows((prev) => {
      const next = new Set(prev);
      tasks.forEach((t) => next.delete(t.rowIndex));
      return next;
    });
  };

  const handleAddBlankRow = () => {
    const nextIdx = rows.length > 0 ? Math.max(...rows.map((r) => r.rowIndex)) + 1 : 2;
    const resolvedBrandId =
      (defaultBrandId && brands.some((b) => b.id === defaultBrandId)
        ? defaultBrandId
        : brands[0]?.id) ?? null;
    const blankRow: AccessoryExcelPreviewRow = {
      rowIndex: nextIdx,
      action: 'ERROR',
      existingId: null,
      data: {
        code: '', name: '', brandId: resolvedBrandId, categoryId: categories[0]?.id ?? null,
        unit: 'pcs', color: '', specification: null, costPrice: 120000, imagePath: null, isActive: true,
      },
      oldData: null,
      errors: [],
      warnings: [],
    };
    setRows((prev) =>
      revalidateAllAccessoryRows([...prev, blankRow], brands, categories, existingAccessories, pinnedExistingIds),
    );
  };

  const handleClearAll = () => {
    setRows([]);
    setPinnedExistingIds(new Map());
    setFileName('');
    setFilterTab('ALL');
    toast.success('Đã xóa toàn bộ dữ liệu đang nhập');
  };

  const handleConfirmSave = () => {
    const validRows = rows.filter((r) => r.action === 'CREATE' || r.action === 'UPDATE');
    if (validRows.length === 0) return toast.error('Không có dòng phụ kiện hợp lệ nào để lưu');
    upsertMutate({
      items: validRows.map((r) => ({
        existingId: r.existingId, code: r.data.code.trim(), name: r.data.name.trim(),
        brandId: r.data.brandId ? Number(r.data.brandId) : null,
        categoryId: r.data.categoryId ? Number(r.data.categoryId) : null,
        unit: r.data.unit, color: r.data.color || '', specification: r.data.specification,
        costPrice: Number(r.data.costPrice) || 0, imagePath: r.data.imagePath ?? null, isActive: r.data.isActive,
      })),
    });
  };

  return {
    rows,
    filteredRows,
    filterTab,
    setFilterTab,
    fileName,
    uploadingRows,
    counts,
    duplicateRowCount,
    isPreviewing,
    isSaving,
    handleFileChange,
    handleUpdateCell,
    handleRemoveRow,
    handleDisambiguateDuplicates,
    handleUploadRowImage,
    handleBatchImageMatch,
    handleAddBlankRow,
    handleClearAll,
    handleConfirmSave,
  };
}

