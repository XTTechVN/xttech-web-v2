/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useRef } from 'react';
import { Plus, Copy, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Button, Input } from '@/components';
import { useQuotationStore } from '@/stores';
import { QuotationDoor } from './quotation-door';
import { EDITOR_STYLES } from './config';
import { SearchSelect } from '../modal/search-select';
import { fetchDefaultAccessories, getResolvedPrice } from './utils';
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
      const price = getResolvedPrice(selectedMat, store.priceType);
      store.updateMaterial(fIndex, mIndex, id, price);
    }
  };

  const handleAddDoor = async () => {
    const defaultDoor = doorsList[0];
    if (defaultDoor) {
      const defaultAccIds = await fetchDefaultAccessories(material.materialId, defaultDoor.id);
      store.addDoor(fIndex, mIndex, defaultDoor.id, defaultDoor.code || '', defaultAccIds);
    }
  };

  return (
    <div className="flex flex-col gap-2 py-2">
      {/* Chọn hệ nhôm & Đơn giá & Thêm cửa / Xóa */}
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
          <div className="grid grid-cols-[1fr_115px] gap-2 items-center flex-1 min-w-0">
            <div className="w-full relative min-w-0">
              <div 
                ref={triggerRef}
                onClick={() => setIsSelectOpen(true)}
                className={EDITOR_STYLES.select + ' flex justify-between items-center w-full cursor-pointer'}
                title={
                  selectedMat 
                    ? `${selectedMat.name} (${selectedMat.code})` 
                    : 'Chọn hệ nhôm...'
                }
              >
                <span className="truncate pr-4">
                  {selectedMat 
                    ? `${selectedMat.name} (${selectedMat.code})` 
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
                renderItem={(item) => {
                  const displayPrice = getResolvedPrice(item, store.priceType);
                  return (
                    <div className="relative flex items-center justify-between w-full min-w-0 pr-8" title={item.name}>
                      <div className="truncate pr-24 font-medium flex-1" title={item.name}>
                        {item.name}
                      </div>
                      <span className="text-[10px] text-[#045863] bg-[#045863]/5 px-1.5 py-0.5 rounded font-bold shrink-0 absolute right-0 top-1/2 -translate-y-1/2 bg-inherit pl-2.5 z-10 select-none">
                        {displayPrice.toLocaleString('vi-VN')}đ/m²
                      </span>
                    </div>
                  );
                }}
                triggerRef={triggerRef}
              />
            </div>

            <div className="relative min-w-0" title="Đơn giá hệ nhôm (đ/m²)">
              <Input
                type="number"
                value={material.initPrice ?? ''}
                onChange={(e) =>
                  store.updateMaterialField(
                    fIndex,
                    mIndex,
                    'initPrice',
                    e.target.value === '' ? '' : parseFloat(e.target.value) || 0
                  )
                }
                placeholder="Đơn giá/m²"
                className={EDITOR_STYLES.input + ' text-right text-xs pr-7 font-medium'}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 pointer-events-none select-none">
                đ/m²
              </span>
            </div>
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
            className="text-slate-400 hover:text-primary p-0 bg-transparent hover:bg-transparent h-auto w-auto min-w-0 inline-flex items-center justify-center border-none transition-all duration-150"
            onClick={() => store.copyMaterial(fIndex, mIndex)}
            title="Sao chép hệ nhôm này"
          >
            <Copy size={15} />
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
