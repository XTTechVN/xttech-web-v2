import React, { useState } from 'react';
import { Plus, Copy, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components';
import { useQuotationStore } from '@/stores';
import { QuotationMaterial } from './quotation-material';
import { EDITOR_STYLES } from './config';
import type { Accessory, ExtraOption, Material, Door, Formula } from '@/types';
import { getResolvedPrice } from './utils';

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

  if (!floor) return null;

  const handleAddMaterial = () => {
    const defaultMat = materialsList[0];
    if (defaultMat) {
      const price = getResolvedPrice(defaultMat, store.priceType);
      store.addMaterial(fIndex, defaultMat.id, price);
    }
  };

  return (
    <div className="border border-gray-200 rounded-md bg-white shadow-sm p-3.5 flex flex-col gap-3.5">
      <div className={`flex items-center justify-between transition-all duration-200 ${isOpen ? 'pb-2.5 border-b border-gray-100' : 'pb-0'}`}>
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="p-0 h-auto w-auto hover:opacity-80 text-gray-500 border-none flex items-center justify-center shrink-0"
            title={isOpen ? "Thu gọn tầng" : "Mở rộng tầng"}
          >
            {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </Button>
          <input
            type="text"
            placeholder="Tên tầng..."
            value={floor.name}
            onChange={(e) => store.updateFloorName(fIndex, e.target.value)}
            className="h-8 text-sm px-1.5 text-slate-800 bg-transparent border-none focus:ring-0 focus:outline-none flex-1 min-w-0 font-bold hover:bg-slate-50 focus:bg-white rounded transition-colors"
            title={floor.name}
          />
        </div>
        <div className="flex items-center gap-2.5 ml-2 shrink-0">
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
            className="text-slate-400 hover:text-primary p-0 bg-transparent hover:bg-transparent h-auto w-auto min-w-0 inline-flex items-center justify-center border-none transition-all duration-150"
            onClick={() => store.copyFloor(fIndex)}
            title="Sao chép tầng này"
          >
            <Copy size={15} />
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
              Chưa có hệ nhôm nào. Nhấn &quot;Thêm hệ nhôm&quot; để bắt đầu.
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
