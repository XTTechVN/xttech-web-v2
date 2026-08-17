'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Save, Plus } from 'lucide-react';
import { Button } from '@/components';
import { updateQuotation } from '@/actions';
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

  const { mutate: updateQuotationMutate, isPending } = useMutation({
    mutationFn: () => {
      const payload = store.getPayload();
      return updateQuotation(quotationId, payload);
    },
    onSuccess: () => {
      toast.success('Cập nhật báo giá thành công!');
      queryClient.invalidateQueries({ queryKey: ['quotation', quotationId] });
    },
    onError: (error) => {
      console.error(error);
      toast.error('Có lỗi xảy ra khi cập nhật báo giá.');
    },
  });

  return (
    <div className="flex flex-col gap-3 text-black">
      {/* Thanh tác vụ đầu tiên */}
      <div className="flex justify-between items-center pb-2">
        <h2 className="text-base font-bold text-primary">Chỉnh sửa báo giá</h2>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Save size={14} />}
          onClick={() => updateQuotationMutate()}
          loading={isPending}
          className="h-7 text-xs px-2.5"
        >
          Cập nhật
        </Button>
      </div>

      {/* 1. Thông tin chung */}
      <QuotationInfo />

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
            Chưa có tầng nào được tạo. Nhấn "Thêm tầng" để bắt đầu.
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
