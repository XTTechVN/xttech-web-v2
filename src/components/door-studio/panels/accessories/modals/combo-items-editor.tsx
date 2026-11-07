'use client';

import React from 'react';
import type { FieldArrayWithId, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { Input } from '@/components/input';
import { Button } from '@/components/button';
import { Plus, Trash2, Layers } from 'lucide-react';
import { SearchableSelect, type SearchableSelectOption } from './searchable-select';
import type { AccessoryComboCreate, AccessoryComboItem } from '@/types';

export type ComboAccessoryOption = SearchableSelectOption;

interface ComboItemsEditorProps {
  fields: FieldArrayWithId<AccessoryComboCreate, 'comboItems', 'id'>[];
  comboItems: AccessoryComboItem[] | undefined;
  accessoryOptions: ComboAccessoryOption[];
  register: UseFormRegister<AccessoryComboCreate>;
  setValue: UseFormSetValue<AccessoryComboCreate>;
  onAppend: () => void;
  onRemove: (idx: number) => void;
}

export function ComboItemsEditor({
  fields,
  comboItems,
  accessoryOptions,
  register,
  setValue,
  onAppend,
  onRemove,
}: ComboItemsEditorProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Layers size={15} />
          Chi tiết các món phụ kiện trong gói
        </span>
        <Button
          variant="outline"
          size="xs"
          leftIcon={<Plus size={13} />}
          onClick={onAppend}
          type="button"
        >
          Thêm món
        </Button>
      </div>

      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
        {fields.map((field, idx) => {
          const noteValue = comboItems?.[idx]?.note || '';
          return (
            <div key={field.id} className="flex items-center gap-2 border border-slate-200 rounded-lg p-2 bg-slate-50/50">
              <SearchableSelect
                options={accessoryOptions}
                value={Number(comboItems?.[idx]?.accessoryId) || 0}
                onChange={(val) => setValue(`comboItems.${idx}.accessoryId`, Number(val), { shouldDirty: true })}
                placeholder="Chọn phụ kiện..."
                className="min-w-0 flex-1"
              />
              <div className="w-16 shrink-0">
                <Input
                  type="number"
                  min={1}
                  placeholder="SL"
                  title={comboItems?.[idx]?.quantity ? `Số lượng: ${comboItems[idx].quantity}` : 'Số lượng'}
                  {...register(`comboItems.${idx}.quantity`, { required: true })}
                />
              </div>
              <div className="w-32 shrink-0">
                <Input
                  placeholder="Vị trí lắp"
                  title={noteValue ? `Vị trí lắp: ${noteValue}` : 'VD: Bản lề trên, Tay nắm, Khóa sàn...'}
                  {...register(`comboItems.${idx}.note`)}
                />
              </div>
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition cursor-pointer shrink-0"
                title="Xóa món"
              >
                <Trash2 size={15} />
              </button>
            </div>
          );
        })}
        {fields.length === 0 && (
          <p className="text-xs text-gray-400 italic text-center py-3 border border-dashed border-slate-200 rounded-lg">
            Chưa có món phụ kiện nào. Nhấn &quot;Thêm món&quot; để bắt đầu.
          </p>
        )}
      </div>
    </div>
  );
}
