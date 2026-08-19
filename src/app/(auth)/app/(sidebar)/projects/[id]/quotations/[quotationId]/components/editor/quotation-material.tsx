import React, { useState, useRef } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components';
import { useQuotationStore } from '@/stores';
import { QuotationDoor } from './quotation-door';
import { EDITOR_STYLES } from './config';
import { SearchSelect } from '../modal/search-select';
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
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const selectedMat = materialsList.find((m) => m.id === material.materialId);

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
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="p-0 h-auto w-auto hover:opacity-80 text-gray-500 border-none flex items-center justify-center mr-1"
            title={isOpen ? "Thu gọn hệ nhôm" : "Mở rộng hệ nhôm"}
          >
            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </Button>
          <div className="w-full relative min-w-0">
            <div 
              ref={triggerRef}
              onClick={() => setIsSelectOpen(true)}
              className={EDITOR_STYLES.select + ' flex justify-between items-center w-full cursor-pointer'}
              title={
                selectedMat 
                  ? `${selectedMat.name} (${selectedMat.code}) - ${selectedMat.price.toLocaleString('vi-VN')}/m²` 
                  : 'Chọn hệ nhôm...'
              }
            >
              <span className="truncate pr-4">
                {selectedMat 
                  ? `${selectedMat.name} (${selectedMat.code}) - ${selectedMat.price.toLocaleString('vi-VN')}/m²` 
                  : 'Chọn hệ nhôm...'}
              </span>
              <ChevronDown size={14} className="text-slate-400 shrink-0" />
            </div>

            <SearchSelect<Material>
              isOpen={isSelectOpen}
              onClose={() => setIsSelectOpen(false)}
              title="Chọn hệ nhôm"
              items={materialsList}
              selectedValue={material.materialId}
              onSelect={(item) => handleUpdateMaterial(item.id.toString())}
              searchKeys={['name', 'code']}
              renderItem={(item) => (
                <div className="relative flex items-center justify-between w-full min-w-0 pr-8">
                  <div className="truncate pr-24 font-medium flex-1">
                    {item.name}
                  </div>
                  <span className="text-[10px] text-[#045863] bg-[#045863]/5 px-1.5 py-0.5 rounded font-bold shrink-0 absolute right-0 top-1/2 -translate-y-1/2 bg-inherit pl-2.5 z-10 select-none">
                    {item.price.toLocaleString('vi-VN')}đ/m²
                  </span>
                </div>
              )}
              triggerRef={triggerRef}
            />
          </div>
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
