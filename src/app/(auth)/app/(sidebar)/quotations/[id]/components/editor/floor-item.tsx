import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Input } from '@/components';
import { useQuotationStore } from '@/stores';
import { MaterialItem } from './material-item';
import type { Accessory, ExtraOption, Material, Door } from '@/types';

interface FloorItemProps {
  fIndex: number;
  materialsList: Material[];
  doorsList: Door[];
  accessoriesList: Accessory[];
  extraOptionsList: ExtraOption[];
}

export const FloorItem = ({
  fIndex,
  materialsList,
  doorsList,
  accessoriesList,
  extraOptionsList,
}: FloorItemProps) => {
  const store = useQuotationStore();
  const floor = store.floors[fIndex];

  const handleAddMaterial = () => {
    const defaultMat = materialsList[0];
    if (defaultMat) {
      store.addMaterial(fIndex, defaultMat.id, defaultMat.price);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Tên tầng & Nút thêm hệ nhôm */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Input 
            placeholder="Tên tầng..." 
            value={floor.name} 
            onChange={(e) => store.updateFloorName(fIndex, e.target.value)}
            className="h-8 text-sm max-w-[200px]"
          />
          <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={handleAddMaterial} className="h-8 text-xs">
            Thêm hệ nhôm
          </Button>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          leftIcon={<Trash2 size={14} />}
          className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50 px-2"
          onClick={(e) => { e.stopPropagation(); store.removeFloor(fIndex); }}
        >
          Xóa tầng
        </Button>
      </div>

      {/* Danh sách hệ nhôm của tầng */}
      <div className="flex flex-col gap-4">
        {floor.materials.length === 0 ? (
          <div className="text-center py-4 text-xs text-gray-400 italic">
            Chưa có hệ nhôm nào. Nhấn "Thêm hệ nhôm" để bắt đầu.
          </div>
        ) : (
          floor.materials.map((_, mIndex) => (
            <MaterialItem
              key={mIndex}
              fIndex={fIndex}
              mIndex={mIndex}
              materialsList={materialsList}
              doorsList={doorsList}
              accessoriesList={accessoriesList}
              extraOptionsList={extraOptionsList}
            />
          ))
        )}
      </div>
    </div>
  );
};
