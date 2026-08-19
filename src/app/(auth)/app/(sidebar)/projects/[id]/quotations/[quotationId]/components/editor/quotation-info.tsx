import React from 'react';
import { Input } from '@/components';
import { useQuotationStore } from '@/stores';
import { EDITOR_STYLES } from './config';

export const QuotationInfo = () => {
  const store = useQuotationStore();

  return (
    <div className="flex flex-col gap-3 pb-4">
      {/* Dòng 1: Tiêu đề */}
      <div className="w-full">
        <label className={EDITOR_STYLES.label}>Tiêu đề</label>
        <Input value={store.title} onChange={(e) => store.setQuotationField('title', e.target.value)} className={EDITOR_STYLES.input} />
      </div>
      {/* Dòng 2: Mã & Chiết khấu */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={EDITOR_STYLES.label}>Mã</label>
          <Input value={store.code} onChange={(e) => store.setQuotationField('code', e.target.value)} className={EDITOR_STYLES.input} />
        </div>
        <div>
          <label className={EDITOR_STYLES.label}>Chiết khấu (%)</label>
          <Input
            type="number"
            value={store.discountPercentage ?? ''}
            onChange={(e) => store.setQuotationField('discountPercentage', e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))}
            className={EDITOR_STYLES.input}
          />
        </div>
      </div>
    </div>
  );
};
