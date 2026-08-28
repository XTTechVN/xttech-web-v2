import React, { useState, useRef } from 'react';
import { Trash2, ChevronDown } from 'lucide-react';
import { Button, Input } from '@/components';
import { useQuotationStore } from '@/stores';
import { EDITOR_STYLES } from './config';
import { SearchSelect } from '../modal/search-select';
import type { Formula, DraftFormula } from '@/types';

interface QuotationFormulaProps {
  fIndex: number;
  mIndex: number;
  dIndex: number;
  foIndex: number;
  formula: DraftFormula;
  formulasList: Formula[];
}

export const QuotationFormula = ({
  fIndex,
  mIndex,
  dIndex,
  foIndex,
  formula,
  formulasList,
}: QuotationFormulaProps) => {
  const store = useQuotationStore();
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  const selectedForm = formulasList.find((form) => form.id === formula.fomulaId);
  // Chỉ semicircle và circle mới cần nhập chiều rộng; các loại còn lại backend tự tính
  const needsWidthInput =
    selectedForm?.type === 'circle' || selectedForm?.type === 'semicircle';
  const showExtraFields = selectedForm !== undefined;

  return (
    <div className="flex flex-col gap-1 py-1">
      <div className="grid grid-cols-[1fr_auto] gap-3 items-center">
        <div className="w-full relative min-w-0">
          <div 
            ref={triggerRef}
            onClick={() => setIsSelectOpen(true)}
            className={EDITOR_STYLES.select + ' flex justify-between items-center w-full cursor-pointer'}
            title={selectedForm ? (selectedForm.name || selectedForm.code || '—') : 'Chọn công thức...'}
          >
            <span className="truncate pr-4">
              {selectedForm ? (selectedForm.name || selectedForm.code || '—') : 'Chọn công thức...'}
            </span>
            <ChevronDown size={14} className="text-slate-400 shrink-0" />
          </div>

          <SearchSelect
            isOpen={isSelectOpen}
            onClose={() => setIsSelectOpen(false)}
            title="Chọn công thức"
            items={formulasList}
            selectedValue={formula.fomulaId}
            onSelect={(item) => store.updateFormula(fIndex, mIndex, dIndex, foIndex, 'fomulaId', item.id)}
            searchKeys={['name', 'code']}
            triggerRef={triggerRef}
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          className={EDITOR_STYLES.deleteButton}
          onClick={() => store.removeFormula(fIndex, mIndex, dIndex, foIndex)}
          title="Xóa công thức"
        >
          <Trash2 size={14} />
        </Button>
      </div>
      {showExtraFields && (
        <div className="grid grid-cols-2 gap-4 mt-1.5">
          {needsWidthInput && (
            <div>
              <span className={EDITOR_STYLES.label}>Rộng (mm)</span>
              <Input
                type="number"
                placeholder="Mặc định"
                value={formula.width ?? ''}
                onChange={(e) =>
                  store.updateFormula(
                    fIndex,
                    mIndex,
                    dIndex,
                    foIndex,
                    'width',
                    parseFloat(e.target.value) || undefined
                  )
                }
                className={EDITOR_STYLES.input}
              />
            </div>
          )}
          <div>
            <span className={EDITOR_STYLES.label}>Tiền công</span>
            <Input
              type="number"
              placeholder="Nhập..."
              value={formula.salary ?? ''}
              onChange={(e) =>
                store.updateFormula(
                  fIndex,
                  mIndex,
                  dIndex,
                  foIndex,
                  'salary',
                  parseInt(e.target.value, 10) || undefined
                )
              }
              className={EDITOR_STYLES.input}
            />
          </div>
        </div>
      )}
    </div>
  );
};
