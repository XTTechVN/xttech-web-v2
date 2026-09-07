import React, { useState, useRef } from 'react';
import { Trash2, ChevronDown } from 'lucide-react';
import { Button } from '@/components';
import { useQuotationStore } from '@/stores';
import { EDITOR_STYLES } from './config';
import { SearchSelect } from '../modal/search-select';
import { ExtraOption, EXTRA_OPTION_UNIT_MAP } from '@/types';
import { getResolvedPrice } from './utils';

interface QuotationExtraOptionProps {
  fIndex: number;
  mIndex: number;
  dIndex: number;
  oIndex: number;
  selectedOptId: number;
  extraOptionsList: ExtraOption[];
}

export const QuotationExtraOption = ({
  fIndex,
  mIndex,
  dIndex,
  oIndex,
  selectedOptId,
  extraOptionsList,
}: QuotationExtraOptionProps) => {
  const store = useQuotationStore();
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const selectedOpt = extraOptionsList.find(opt => opt.id === selectedOptId);

  return (
    <div className="grid grid-cols-[1fr_auto] gap-3 items-center py-1">
      <div className="w-full relative min-w-0">
        <div 
          ref={triggerRef}
          onClick={() => setIsSelectOpen(true)}
          className={EDITOR_STYLES.select + ' flex justify-between items-center w-full cursor-pointer'}
          title={selectedOpt ? `${selectedOpt.name} (${selectedOpt.code})` : 'Chọn tùy chọn...'}
        >
          <span className="truncate pr-4">
            {selectedOpt ? `${selectedOpt.name} (${selectedOpt.code})` : 'Chọn tùy chọn...'}
          </span>
          <ChevronDown size={14} className="text-slate-400 shrink-0" />
        </div>

        <SearchSelect<ExtraOption>
          isOpen={isSelectOpen}
          onClose={() => setIsSelectOpen(false)}
          title="Chọn tùy chọn phát sinh"
          items={extraOptionsList}
          selectedValue={selectedOptId}
          onSelect={(item) => store.updateExtraOption(fIndex, mIndex, dIndex, oIndex, item.id)}
          searchKeys={['name', 'code']}
          renderItem={(item) => {
            const unitText = item.unit ? (EXTRA_OPTION_UNIT_MAP[item.unit] || item.unit) : '';
            const displayPrice = getResolvedPrice(item, store.priceType);
            return (
              <div className="relative flex items-center justify-between w-full min-w-0 pr-8" title={item.name}>
                <div className="truncate pr-24 font-medium flex-1" title={item.name}>
                  {item.name}
                </div>
                <span className="text-[10px] text-[#045863] bg-[#045863]/5 px-1.5 py-0.5 rounded font-bold shrink-0 absolute right-0 top-1/2 -translate-y-1/2 bg-inherit pl-2.5 z-10 select-none">
                  {displayPrice.toLocaleString('vi-VN')}đ{unitText ? `/${unitText}` : ''}
                </span>
              </div>
            );
          }}
          triggerRef={triggerRef}
        />
      </div>
      <Button
        variant="ghost"
        size="sm"
        className={EDITOR_STYLES.deleteButton}
        onClick={() => store.removeExtraOption(fIndex, mIndex, dIndex, oIndex)}
        title="Xóa tùy chọn"
      >
        <Trash2 size={14} />
      </Button>
    </div>
  );
};
