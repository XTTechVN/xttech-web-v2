import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button, Input, Select } from '@/components';
import { useQuotationStore } from '@/stores';
import { EDITOR_STYLES } from './config';
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

  const selectedForm = formulasList.find((form) => form.id === formula.fomulaId);
  const isArch =
    selectedForm?.type === 'circle' ||
    selectedForm?.type === 'semicircle' ||
    selectedForm?.type === 'wall_cladding';

  return (
    <div className="flex flex-col gap-1 py-1">
      <div className="grid grid-cols-[1fr_auto] gap-3 items-center">
        <Select
          value={formula.fomulaId.toString()}
          onChange={(e) =>
            store.updateFormula(fIndex, mIndex, dIndex, foIndex, 'fomulaId', parseInt(e.target.value, 10))
          }
          className={EDITOR_STYLES.select + ' w-full'}
        >
          {formulasList.map((form) => (
            <option key={form.id} value={form.id}>
              {form.name || form.code}
            </option>
          ))}
        </Select>
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
      {isArch && (
        <div className="grid grid-cols-2 gap-4 mt-1.5">
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
