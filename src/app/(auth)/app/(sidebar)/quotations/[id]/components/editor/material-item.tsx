import React from 'react';
import { Plus, Trash2, Box } from 'lucide-react';
import { Button, Select } from '@/components';
import { useQuotationStore } from '@/stores';
import { DoorItem } from './door-item';
import type { Accessory, ExtraOption, Material, Door } from '@/types';

interface MaterialItemProps {
  fIndex: number;
  mIndex: number;
  materialsList: Material[];
  doorsList: Door[];
  accessoriesList: Accessory[];
  extraOptionsList: ExtraOption[];
}

export const MaterialItem = ({ fIndex, mIndex, materialsList, doorsList, accessoriesList, extraOptionsList }: MaterialItemProps) => {
  const store = useQuotationStore();
  const material = store.floors[fIndex].materials[mIndex];

  const handleUpdateMaterial = (materialIdStr: string) => {
    const id = parseInt(materialIdStr, 10);
    const selectedMat = materialsList.find((m) => m.id === id);
    if (selectedMat) {
      store.updateMaterial(fIndex, mIndex, id, selectedMat.price);
    }
  };

  const handleAddDoor = () => {
    const defaultDoor = doorsList[0];
    if (defaultDoor) {
      store.addDoor(fIndex, mIndex, defaultDoor.id, defaultDoor.code || '');
    }
  };

  return (
    <div className="border border-blue-100 rounded-lg bg-blue-50/20 p-4 flex flex-col gap-3">
      {/* Chọn hệ nhôm & Xóa */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <Box size={14} className="text-blue-500" />
          <Select value={material.materialId.toString()} onChange={(e) => handleUpdateMaterial(e.target.value)} className="text-xs h-8 max-w-[320px]">
            {materialsList.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.code}) - {m.price.toLocaleString('vi-VN')}/m²
              </option>
            ))}
          </Select>
        </div>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<Trash2 size={14} />}
          className="h-7 text-red-500 p-1"
          onClick={() => store.removeMaterial(fIndex, mIndex)}
        />
      </div>

      {/* Danh sách cửa của hệ nhôm */}
      <div className="pl-4 border-l-2 border-blue-200 flex flex-col gap-3">
        {material.doors.map((_, dIndex) => (
          <DoorItem
            key={dIndex}
            fIndex={fIndex}
            mIndex={mIndex}
            dIndex={dIndex}
            doorsList={doorsList}
            accessoriesList={accessoriesList}
            extraOptionsList={extraOptionsList}
          />
        ))}
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Plus size={12} />}
          onClick={handleAddDoor}
          className="h-8 text-xs mt-1 w-fit bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          Thêm cửa
        </Button>
      </div>
    </div>
  );
};
