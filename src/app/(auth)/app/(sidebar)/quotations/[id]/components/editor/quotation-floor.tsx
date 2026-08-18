import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Button, Input } from '@/components';
import { useQuotationStore } from '@/stores';
import { QuotationMaterial } from './quotation-material';
import { EDITOR_STYLES } from './config';
import type { Accessory, ExtraOption, Material, Door, Formula } from '@/types';

interface QuotationFloorProps {
  fIndex: number;
  materialsList: Material[];
  doorsList: Door[];
  accessoriesList: Accessory[];
  extraOptionsList: ExtraOption[];
  formulasList: Formula[];
  isOpen: boolean;
  onToggle: () => void;
}

export const QuotationFloor = ({
  fIndex,
  materialsList,
  doorsList,
  accessoriesList,
  extraOptionsList,
  formulasList,
  isOpen,
  onToggle,
}: QuotationFloorProps) => {
  const store = useQuotationStore();
  const floor = store.floors[fIndex];

  const handleAddMaterial = () => {
    const defaultMat = materialsList[0];
    if (defaultMat) {
      store.addMaterial(fIndex, defaultMat.id, defaultMat.price);
    }
  };

  return (
    <div className="border border-gray-200 rounded-md bg-white shadow-sm p-4 flex flex-col gap-4">
      <div className={`flex items-center justify-between transition-all duration-200 ${isOpen ? 'pb-3 border-b border-gray-100' : 'pb-0'}`}>
        <div className="flex items-center gap-2 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="p-0 h-auto w-auto hover:opacity-80 text-gray-500 border-none flex items-center justify-center"
            title={isOpen ? "Thu gọn tầng" : "Mở rộng tầng"}
          >
            {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </Button>
          <Input
            placeholder="Tên tầng..."
            value={floor.name}
            onChange={(e) => store.updateFloorName(fIndex, e.target.value)}
            className="h-8 text-sm px-0.5 text-black bg-transparent border-none focus:ring-0 focus:outline-none w-full font-bold text-gray-800"
          />
        </div>
        <div className="flex items-center gap-3.5 ml-3">
          <Button
            variant="ghost"
            size="sm"
            className={EDITOR_STYLES.addButton}
            onClick={handleAddMaterial}
            title="Thêm hệ nhôm"
          >
            <Plus size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={EDITOR_STYLES.deleteButton}
            onClick={() => store.removeFloor(fIndex)}
            title="Xóa tầng"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      {/* Danh sách hệ nhôm của tầng */}
      {isOpen && (
        <div className="flex flex-col gap-3 pl-4">
          {floor.materials.length === 0 ? (
            <div className="text-center py-4 text-xs text-gray-400 italic">
              Chưa có hệ nhôm nào. Nhấn "Thêm hệ nhôm" để bắt đầu.
            </div>
          ) : (
            floor.materials.map((_, mIndex) => (
              <QuotationMaterial
                key={mIndex}
                fIndex={fIndex}
                mIndex={mIndex}
                materialsList={materialsList}
                doorsList={doorsList}
                accessoriesList={accessoriesList}
                extraOptionsList={extraOptionsList}
                formulasList={formulasList}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};
