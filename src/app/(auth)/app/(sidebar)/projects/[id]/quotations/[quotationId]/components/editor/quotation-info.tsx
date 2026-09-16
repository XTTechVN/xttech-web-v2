import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components';
import { useQuotationStore } from '@/stores';
import { EDITOR_STYLES } from './config';
import type { Material } from '@/types';
import { SearchSelect } from '../modal/search-select';
import { ChevronDown } from 'lucide-react';

interface QuotationInfoProps {
  materialsList: Material[];
}

const priceOptions = [
  { id: 'retail', name: 'Bán lẻ' },
  { id: 'sale', name: 'Đại lý' },
];

export const QuotationInfo = ({ materialsList }: QuotationInfoProps) => {
  const store = useQuotationStore();
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  const [localDiscount, setLocalDiscount] = useState(store.discountPercentage?.toString() || '');

  useEffect(() => {
    setLocalDiscount(store.discountPercentage?.toString() || '');
  }, [store.discountPercentage]);

  return (
    <div className="flex flex-col gap-3 pb-4">
      {/* Dòng 1: Tiêu đề */}
      <div className="w-full">
        <label className={EDITOR_STYLES.label}>Tiêu đề</label>
        <Input value={store.title} onChange={(e) => store.setQuotationField('title', e.target.value)} className={EDITOR_STYLES.input} />
      </div>
      {/* Dòng 2: Mã, Chiết khấu & Loại giá */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={EDITOR_STYLES.label}>Mã</label>
          <Input value={store.code} onChange={(e) => store.setQuotationField('code', e.target.value)} className={EDITOR_STYLES.input} />
        </div>
        <div>
          <label className={EDITOR_STYLES.label}>Chiết khấu (%)</label>
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={localDiscount}
            onChange={(e) => {
              const rawValue = e.target.value;
              let cleanValue = rawValue.replace(/[^0-9]/g, '');

              if (cleanValue !== '') {
                const num = parseInt(cleanValue, 10);
                if (num > 100) {
                  cleanValue = '100';
                }
              }

              setLocalDiscount(cleanValue);

              if (cleanValue === '') {
                store.setQuotationField('discountPercentage', 0);
              } else {
                store.setQuotationField('discountPercentage', parseInt(cleanValue, 10));
              }
            }}
            className={EDITOR_STYLES.input}
          />
        </div>
        <div>
          <label className={EDITOR_STYLES.label}>Loại giá áp dụng</label>
          <div
            ref={triggerRef}
            onClick={() => setIsSelectOpen(true)}
            className={`${EDITOR_STYLES.select} flex justify-between items-center w-full cursor-pointer`}
          >
            <span className="truncate">{priceOptions.find((o) => o.id === (store.priceType || 'retail'))?.name}</span>
            <ChevronDown size={14} className="text-slate-400 shrink-0" />
          </div>

          <SearchSelect
            isOpen={isSelectOpen}
            onClose={() => setIsSelectOpen(false)}
            title="Chọn loại giá áp dụng"
            items={priceOptions}
            selectedValue={store.priceType || 'retail'}
            onSelect={(item) => store.setPriceType(item.id as any, materialsList)}
            triggerRef={triggerRef}
            width={triggerRef.current?.clientWidth}
          />
        </div>
      </div>
    </div>
  );
};
