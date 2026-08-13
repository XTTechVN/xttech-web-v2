'use client';

import React from 'react';
import { Plus, Layers, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Accordion } from '@/components';
import { useQuotationStore } from '@/stores';
import { QuotationInfo } from './quotation-info';
import { FloorItem } from './floor-item';
import type { Accessory, ExtraOption, Material, Door } from '@/types';

interface QuotationEditorProps {
  quotationId: number;
  materialsList: Material[];
  doorsList: Door[];
  accessoriesList: Accessory[];
  extraOptionsList: ExtraOption[];
}

export const QuotationEditor = ({
  quotationId,
  materialsList,
  doorsList,
  accessoriesList,
  extraOptionsList,
}: QuotationEditorProps) => {
  const store = useQuotationStore();
  const floors = store.floors;
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleUpdateQuotation = async () => {
    setIsUpdating(true);
    try {
      await store.updateQuotation(quotationId);
      toast.success('Cập nhật báo giá thành công!');
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi cập nhật báo giá.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Tạo cấu trúc Accordion từ danh sách các tầng
  const accordionItems =
    floors.length > 0
      ? floors.map((floor, fIndex) => {
          const title = (
            <div className="flex items-center gap-2 font-bold text-gray-800">
              <Layers size={16} className="text-amber-500" />
              <span>{floor.name}</span>
            </div>
          );

          const content = (
            <FloorItem
              fIndex={fIndex}
              materialsList={materialsList}
              doorsList={doorsList}
              accessoriesList={accessoriesList}
              extraOptionsList={extraOptionsList}
            />
          );

          return {
            id: `floor-${fIndex}`,
            title: title,
            content: content,
          };
        })
      : [];

  return (
    <div className="flex flex-col gap-6 text-black">
      {/* Thanh tác vụ đầu tiên */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-700">Chỉnh sửa chi tiết báo giá</span>
        <Button variant="primary" leftIcon={<Save size={16} />} onClick={handleUpdateQuotation} loading={isUpdating}>
          Cập nhật báo giá
        </Button>
      </div>

      {/* 1. Thông tin chung */}
      <QuotationInfo />

      {/* 2. Cấu trúc các tầng */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800 text-sm">Cấu trúc các tầng</h3>
          <Button variant="outline" size="sm" leftIcon={<Plus size={14} />} onClick={store.addFloor} className="h-8">
            Thêm tầng
          </Button>
        </div>

        {floors.length === 0 ? (
          <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-sm italic">
            Chưa có tầng nào được tạo. Nhấn "Thêm tầng" để bắt đầu.
          </div>
        ) : (
          <Accordion items={accordionItems} allowMultiple={true} />
        )}
      </div>
    </div>
  );
};
