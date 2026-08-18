import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button, Select } from '@/components';
import { useQuotationStore } from '@/stores';
import { EDITOR_STYLES } from './config';
import type { Accessory } from '@/types';

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

  return (
    <div className="grid grid-cols-[1fr_auto] gap-3 items-center py-1">
      <Select
        value={selectedAccId.toString()}
        onChange={(e) =>
          store.updateAccessory(fIndex, mIndex, dIndex, aIndex, parseInt(e.target.value, 10))
        }
        className={EDITOR_STYLES.select + ' w-full'}
      >
        {accessoriesList.map((acc) => (
          <option key={acc.id} value={acc.id}>
            {acc.name} ({acc.code})
          </option>
        ))}
      </Select>
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
