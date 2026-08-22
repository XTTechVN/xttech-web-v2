/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useRef } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Button, Input, Select } from '@/components';
import { useQuotationStore } from '@/stores';
import { EDITOR_STYLES } from './config';
import { QuotationAccessory } from './quotation-accessory';
import { QuotationExtraOption } from './quotation-extra-option';
import { QuotationFormula } from './quotation-formula';
import { SearchSelect } from '../modal/search-select';
import type { Accessory, ExtraOption, Door, Formula } from '@/types';

interface QuotationDoorProps {
  fIndex: number;
  mIndex: number;
  dIndex: number;
  doorsList: Door[];
  accessoriesList: Accessory[];
  extraOptionsList: ExtraOption[];
  formulasList: Formula[];
}

export const QuotationDoor = ({
  fIndex,
  mIndex,
  dIndex,
  doorsList,
  accessoriesList,
  extraOptionsList,
  formulasList,
}: QuotationDoorProps) => {
  const store = useQuotationStore();
  const floor = store.floors[fIndex];
  if (!floor) return null;
  const material = floor.materials[mIndex];
  if (!material) return null;
  const door = material.doors[dIndex];
  if (!door) return null;
  const [isOpen, setIsOpen] = useState(true);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleUpdateDoor = (field: string, value: any) => {
    if (field === 'doorId') {
      const id = parseInt(value, 10);
      const selectedDoor = doorsList.find((d) => d.id === id);
      store.updateDoor(fIndex, mIndex, dIndex, 'doorId', id);
      store.updateDoor(fIndex, mIndex, dIndex, 'code', selectedDoor?.code || '');
    } else {
      store.updateDoor(fIndex, mIndex, dIndex, field, value);
    }
  };

  const handleAddAccessory = () => {
    const firstAcc = accessoriesList[0];
    if (firstAcc) {
      store.addAccessory(fIndex, mIndex, dIndex, firstAcc.id);
    }
  };

  const handleAddExtraOption = () => {
    const firstOpt = extraOptionsList[0];
    if (firstOpt) {
      store.addExtraOption(fIndex, mIndex, dIndex, firstOpt.id);
    }
  };

  const handleAddFormula = () => {
    const firstForm = formulasList[0];
    if (firstForm) {
      store.addFormula(fIndex, mIndex, dIndex, firstForm.id);
    }
  };

  return (
    <div className="flex flex-col gap-2.5 py-3 border-b border-gray-100 last:border-b-0">
      {/* 1. Header Cửa */}
      <div className="flex items-center justify-between pb-1.5">
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="p-0 h-auto w-auto hover:opacity-80 text-gray-500 border-none flex items-center justify-center mr-1"
            title={isOpen ? "Thu gọn cửa" : "Mở rộng cửa"}
          >
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </Button>
          <span className={EDITOR_STYLES.sectionHeader}>
            Cửa #{dIndex + 1}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className={EDITOR_STYLES.deleteButton}
          onClick={() => store.removeDoor(fIndex, mIndex, dIndex)}
          title="Xóa cửa"
        >
          <Trash2 size={16} />
        </Button>
      </div>

      {/* 2. Chi tiết cửa (thụt lề pl-4) */}
      {isOpen && (
        <div className="pl-4 flex flex-col gap-2.5">
        {/* Biên dạng cửa */}
        <div className="py-2 grid grid-cols-[1fr_auto] gap-2 items-end">
          <div className="w-full min-w-0">
            <span className={EDITOR_STYLES.label}>Biên dạng cửa</span>
            <div 
              ref={triggerRef}
              onClick={() => setIsSelectModalOpen(true)}
              className={EDITOR_STYLES.select + ' flex justify-between items-center w-full cursor-pointer'}
              title={
                doorsList.find((d) => d.id === door.doorId) 
                  ? `${doorsList.find((d) => d.id === door.doorId)?.name} (${doorsList.find((d) => d.id === door.doorId)?.code})` 
                  : 'Chọn cửa...'
              }
            >
              <span className="truncate pr-4">
                {doorsList.find((d) => d.id === door.doorId) 
                  ? `${doorsList.find((d) => d.id === door.doorId)?.name} (${doorsList.find((d) => d.id === door.doorId)?.code})` 
                  : 'Chọn cửa...'}
              </span>
              <ChevronDown size={14} className="text-slate-400 shrink-0" />
            </div>

            <SearchSelect
              isOpen={isSelectModalOpen}
              onClose={() => setIsSelectModalOpen(false)}
              title="Chọn biên dạng cửa"
              items={doorsList}
              selectedValue={door.doorId}
              onSelect={(item) => handleUpdateDoor('doorId', item.id)}
              searchKeys={['name', 'code']}
              triggerRef={triggerRef}
            />
          </div>
        </div>

        {/* 3. Kích thước (Rộng, Cao, Số lượng) */}
        <div className="grid grid-cols-3 gap-4 py-2">
          <div>
            <span className={EDITOR_STYLES.label}>Rộng (mm)</span>
            <Input
              type="number"
              value={door.width ?? ''}
              onChange={(e) => handleUpdateDoor('width', e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))}
              className={EDITOR_STYLES.input}
            />
          </div>
          <div>
            <span className={EDITOR_STYLES.label}>Cao (mm)</span>
            <Input
              type="number"
              value={door.height ?? ''}
              onChange={(e) => handleUpdateDoor('height', e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))}
              className={EDITOR_STYLES.input}
            />
          </div>
          <div>
            <span className={EDITOR_STYLES.label}>Số lượng</span>
            <Input
              type="number"
              value={door.quantity ?? ''}
              onChange={(e) => handleUpdateDoor('quantity', e.target.value === '' ? '' : (parseInt(e.target.value, 10) || 0))}
              className={EDITOR_STYLES.input}
            />
          </div>
        </div>

        {/* 4. Phụ kiện đính kèm */}
        <div className="py-2 flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <span className={EDITOR_STYLES.sectionHeader}>Phụ kiện đính kèm</span>
            <Button variant="ghost" size="sm" onClick={handleAddAccessory} className={EDITOR_STYLES.addButton} title="Thêm phụ kiện">
              <Plus size={16} />
            </Button>
          </div>
          <div className={EDITOR_STYLES.subSectionContainer}>
            {!door.accessoryIds || door.accessoryIds.length === 0 ? (
              <span className="text-[10px] text-gray-400 italic py-1">Không có phụ kiện</span>
            ) : (
              door.accessoryIds.map((selectedAccId, aIndex) => (
                <QuotationAccessory
                  key={aIndex}
                  fIndex={fIndex}
                  mIndex={mIndex}
                  dIndex={dIndex}
                  aIndex={aIndex}
                  selectedAccId={selectedAccId}
                  accessoriesList={accessoriesList}
                />
              ))
            )}
          </div>
        </div>

        {/* 5. Tùy chọn phát sinh */}
        <div className="py-2 flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <span className={EDITOR_STYLES.sectionHeader}>Tùy chọn phát sinh</span>
            <Button variant="ghost" size="sm" onClick={handleAddExtraOption} className={EDITOR_STYLES.addButton} title="Thêm tùy chọn">
              <Plus size={16} />
            </Button>
          </div>
          <div className={EDITOR_STYLES.subSectionContainer}>
            {!door.extraOptionIds || door.extraOptionIds.length === 0 ? (
              <span className="text-[10px] text-gray-400 italic py-1">Không có tùy chọn</span>
            ) : (
              door.extraOptionIds.map((selectedOptId, oIndex) => (
                <QuotationExtraOption
                  key={oIndex}
                  fIndex={fIndex}
                  mIndex={mIndex}
                  dIndex={dIndex}
                  oIndex={oIndex}
                  selectedOptId={selectedOptId}
                  extraOptionsList={extraOptionsList}
                />
              ))
            )}
          </div>
        </div>

        {/* 6. Công thức áp dụng */}
        <div className="py-2 flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <span className={EDITOR_STYLES.sectionHeader}>Công thức áp dụng</span>
            <Button variant="ghost" size="sm" onClick={handleAddFormula} className={EDITOR_STYLES.addButton} title="Thêm công thức">
              <Plus size={16} />
            </Button>
          </div>
          <div className={EDITOR_STYLES.subSectionContainer}>
            {!door.fomulas || door.fomulas.length === 0 ? (
              <span className="text-[10px] text-gray-400 italic py-1">Không có công thức</span>
            ) : (
              door.fomulas.map((formula, foIndex) => (
                <QuotationFormula
                  key={foIndex}
                  fIndex={fIndex}
                  mIndex={mIndex}
                  dIndex={dIndex}
                  foIndex={foIndex}
                  formula={formula}
                  formulasList={formulasList}
                />
              ))
            )}
        </div>
          </div>
        </div>
      )}
    </div>
  );
};
