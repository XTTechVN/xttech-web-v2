import React from 'react';
import { Input } from '@/components';
import { useQuotationStore } from '@/stores';

export const QuotationInfo = () => {
  const store = useQuotationStore();

  return (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-3 gap-4">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">Tiêu đề báo giá</label>
        <Input 
          value={store.title} 
          onChange={(e) => store.setQuotationField('title', e.target.value)} 
          className="h-9 text-sm" 
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">Mã báo giá</label>
        <Input 
          value={store.code} 
          onChange={(e) => store.setQuotationField('code', e.target.value)} 
          className="h-9 text-sm" 
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">Chiết khấu (%)</label>
        <Input
          type="number"
          value={store.discountPercentage}
          onChange={(e) => store.setQuotationField('discountPercentage', parseFloat(e.target.value) || 0)}
          className="h-9 text-sm"
        />
      </div>
    </div>
  );
};
