'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Info } from 'lucide-react';
import { Button, Tooltip } from '@/components';
import { updateQuotation, exportQuotation } from '@/actions';
import { useQuotationStore } from '@/stores';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Accessory, ExtraOption, Material, Door, Formula } from '@/types';

import { QuotationInfo } from './quotation-info';
import { QuotationFloor } from './quotation-floor';


interface QuotationEditorProps {
  quotationId: number;
  materialsList: Material[];
  doorsList: Door[];
  accessoriesList: Accessory[];
  extraOptionsList: ExtraOption[];
  formulasList: Formula[];
}

export const QuotationEditor = ({ quotationId, materialsList, doorsList, accessoriesList, extraOptionsList, formulasList }: QuotationEditorProps) => {
  const store = useQuotationStore();
  const floors = store.floors;
  const queryClient = useQueryClient();
  const [activeFloorIndex, setActiveFloorIndex] = useState<number | null>(0);
  const [isSavingForLoBan, setIsSavingForLoBan] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { mutate: updateQuotationMutate, mutateAsync: updateQuotationMutateAsync, isPending } = useMutation({
    mutationFn: () => {
      const payload = store.getPayload(accessoriesList, extraOptionsList, materialsList);
      return updateQuotation(quotationId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotation', quotationId] });
    },
    onError: (error) => {
      console.error(error);
      toast.error('Có lỗi xảy ra khi cập nhật báo giá.');
    },
  });

  const handleLoBanClick = () => {
    setIsSavingForLoBan(true);
    updateQuotationMutate(undefined, {
      onSuccess: () => {
        setIsSavingForLoBan(false);
        toast.success('Cập nhật báo giá thành công!');
        window.open('https://wonder.vn/thuoc-lo-ban/', '_blank');
      },
      onError: () => {
        setIsSavingForLoBan(false);
      },
    });
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    const toastId = toast.loading('Đang chuẩn bị file Excel báo giá...');
    try {
      await updateQuotationMutateAsync();
      await exportQuotation(quotationId);
      toast.success('Xuất file Excel thành công!', { id: toastId });
    } catch (error: any) {
      console.error('Lỗi xuất file Excel:', error);
      toast.error(error?.message || 'Có lỗi xảy ra khi xuất file Excel.', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 text-black">

      {/* Thanh tác vụ đầu tiên */}
      <div className="sticky top-[-1rem] -mx-4 -mt-4 px-4 py-2.5 bg-white/95 backdrop-blur-xs z-20 border-b border-gray-200 shadow-xs rounded-t flex justify-between items-center xl:static xl:m-0 xl:p-0 xl:bg-transparent xl:border-b-0 xl:shadow-none xl:rounded-none xl:z-auto xl:pb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <h2 className="text-sm sm:text-base font-bold text-primary truncate">Chỉnh sửa báo giá</h2>
          <Tooltip content={isSavingForLoBan ? 'Đang lưu báo giá...' : 'Xem thông thủy đẹp (Thước Lỗ Ban)'} position="top">
            <button
              type="button"
              onClick={handleLoBanClick}
              disabled={isSavingForLoBan || isPending || isExporting}
              className="text-primary hover:text-primary-dark focus:outline-hidden disabled:opacity-50 cursor-pointer flex items-center justify-center pt-0.5 shrink-0"
            >
              <Info size={16} />
            </button>
          </Tooltip>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            loading={isExporting}
            disabled={isPending || isSavingForLoBan}
            className="h-7 text-xs px-2.5 hover:bg-slate-50 border-slate-200"
          >
            Xuất Excel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => updateQuotationMutate()}
            loading={isPending}
            disabled={isExporting || isSavingForLoBan}
            className="h-7 text-xs px-2.5"
          >
            Lưu
          </Button>
        </div>
      </div>

      {/* 1. Thông tin chung */}
      <QuotationInfo materialsList={materialsList} />

      {/* 2. Cấu trúc các tầng */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center pb-1.5">
          <h3 className="text-base font-bold text-primary">Cấu trúc các tầng</h3>
          <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={store.addFloor} className="h-7 text-xs px-2.5">
            Thêm tầng
          </Button>
        </div>

        {floors.length === 0 ? (
          <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-sm italic">
            Chưa có tầng nào được tạo. Nhấn &ldquo;Thêm tầng&rdquo; để bắt đầu.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {floors.map((_, fIndex) => (
              <QuotationFloor
                key={fIndex}
                fIndex={fIndex}
                materialsList={materialsList}
                doorsList={doorsList}
                accessoriesList={accessoriesList}
                extraOptionsList={extraOptionsList}
                formulasList={formulasList}
                isOpen={activeFloorIndex === fIndex}
                onToggle={() => setActiveFloorIndex(activeFloorIndex === fIndex ? null : fIndex)}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
