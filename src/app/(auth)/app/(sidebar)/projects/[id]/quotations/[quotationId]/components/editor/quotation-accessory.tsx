import React, { useState, useRef } from 'react';
import { Trash2, ChevronDown } from 'lucide-react';
import { Button } from '@/components';
import { useQuotationStore } from '@/stores';
import { EDITOR_STYLES } from './config';
import { SearchSelect } from '../modal';
import { Accessory, formatAccessoryUnit } from '@/types';

interface QuotationAccessoryProps {
  fIndex: number;
  mIndex: number;
  dIndex: number;
  aIndex: number;
  selectedAccId: number;
  accessoriesList: Accessory[];
}

export const QuotationAccessory = ({
  fIndex,
  mIndex,
  dIndex,
  aIndex,
  selectedAccId,
  accessoriesList,
}: QuotationAccessoryProps) => {
  const store = useQuotationStore();
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const selectedAcc = accessoriesList.find(acc => acc.id === selectedAccId);

  return (
    <div className="grid grid-cols-[1fr_auto] gap-3 items-center py-1">
      <div className="w-full relative min-w-0">
        <div 
          ref={triggerRef}
          onClick={() => setIsSelectOpen(true)}
          className={EDITOR_STYLES.select + ' flex justify-between items-center w-full cursor-pointer'}
          title={selectedAcc ? `${selectedAcc.name} (${selectedAcc.code})` : 'Chọn phụ kiện...'}
        >
          <span className="truncate pr-4">
            {selectedAcc ? `${selectedAcc.name} (${selectedAcc.code})` : 'Chọn phụ kiện...'}
          </span>
          <ChevronDown size={14} className="text-slate-400 shrink-0" />
        </div>

        <SearchSelect
          isOpen={isSelectOpen}
          onClose={() => setIsSelectOpen(false)}
          title="Chọn phụ kiện"
          items={accessoriesList}
          selectedValue={selectedAccId}
          onSelect={(item) => store.updateAccessory(fIndex, mIndex, dIndex, aIndex, item.id)}
          searchKeys={['name', 'code']}
          renderItem={(item) => (
            <div className="flex items-center justify-between w-full">
              <div className="whitespace-nowrap pr-[100px] font-medium flex-1">
                {item.name}
              </div>
              <span className="text-[10px] text-[#045863] bg-[#045863]/5 px-1.5 py-0.5 rounded font-bold shrink-0 sticky right-8 bg-inherit pl-2.5 z-10 select-none">
                {item.price.toLocaleString('vi-VN')}đ{item.unit ? `/${formatAccessoryUnit(item.unit)}` : ''}
              </span>
            </div>
          )}
          triggerRef={triggerRef}
        />
      </div>
      <Button
        variant="ghost"
        size="sm"
        className={EDITOR_STYLES.deleteButton}
        onClick={() => store.removeAccessory(fIndex, mIndex, dIndex, aIndex)}
        title="Xóa phụ kiện"
      >
        <Trash2 size={14} />
      </Button>
    </div>
  );
};
