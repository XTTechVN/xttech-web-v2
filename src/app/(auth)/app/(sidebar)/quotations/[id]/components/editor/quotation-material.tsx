import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Button, Select } from '@/components';
import { useQuotationStore } from '@/stores';
import { QuotationDoor } from './quotation-door';
import { EDITOR_STYLES } from './config';
import type { Accessory, ExtraOption, Material, Door, Formula } from '@/types';

interface QuotationMaterialProps {
  fIndex: number;
  mIndex: number;
  materialsList: Material[];
  doorsList: Door[];
  accessoriesList: Accessory[];
  extraOptionsList: ExtraOption[];
  formulasList: Formula[];
}

export const QuotationMaterial = ({
  fIndex,
  mIndex,
  materialsList,
  doorsList,
  accessoriesList,
  extraOptionsList,
  formulasList,
}: QuotationMaterialProps) => {
  const store = useQuotationStore();
  const floor = store.floors[fIndex];
  if (!floor) return null;
  const material = floor.materials[mIndex];
  if (!material) return null;
  const [isOpen, setIsOpen] = useState(true);

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
    <div className="flex flex-col gap-2 py-2">
      {/* Chọn hệ nhôm & Thêm cửa / Xóa */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="p-0 h-auto w-auto hover:opacity-80 text-gray-500 border-none flex items-center justify-center mr-1"
            title={isOpen ? "Thu gọn hệ nhôm" : "Mở rộng hệ nhôm"}
          >
            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </Button>
          <Select
            value={material.materialId.toString()}
            onChange={(e) => handleUpdateMaterial(e.target.value)}
            className={EDITOR_STYLES.select + ' w-full'}
          >
            {materialsList.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.code}) - {m.price.toLocaleString('vi-VN')}/m²
              </option>
            ))}
          </Select>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className={EDITOR_STYLES.addButton}
            onClick={handleAddDoor}
            title="Thêm cửa"
          >
            <Plus size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={EDITOR_STYLES.deleteButton}
            onClick={() => store.removeMaterial(fIndex, mIndex)}
            title="Xóa hệ nhôm"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      {/* Danh sách cửa của hệ nhôm */}
      {isOpen && (
        <div className="flex flex-col gap-3 pl-4">
          {material.doors.map((_, dIndex) => (
            <QuotationDoor
              key={dIndex}
              fIndex={fIndex}
              mIndex={mIndex}
              dIndex={dIndex}
              doorsList={doorsList}
              accessoriesList={accessoriesList}
              extraOptionsList={extraOptionsList}
              formulasList={formulasList}
            />
          ))}
        </div>
      )}
    </div>
  );
};
