import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button, Select } from '@/components';
import { useQuotationStore } from '@/stores';
import { EDITOR_STYLES } from './config';
import type { ExtraOption } from '@/types';

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

  return (
    <div className="grid grid-cols-[1fr_auto] gap-3 items-center py-1">
      <Select
        value={selectedOptId.toString()}
        onChange={(e) =>
          store.updateExtraOption(fIndex, mIndex, dIndex, oIndex, parseInt(e.target.value, 10))
        }
        className={EDITOR_STYLES.select + ' w-full'}
      >
        {extraOptionsList.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name} ({opt.code})
          </option>
        ))}
      </Select>
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
