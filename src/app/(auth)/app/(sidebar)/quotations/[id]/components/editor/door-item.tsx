import React from 'react';
import { Plus, Trash2, PenTool } from 'lucide-react';
import { Button, Input, Select } from '@/components';
import { useQuotationStore } from '@/stores';
import type { Accessory, ExtraOption, Door } from '@/types';

interface DoorItemProps {
  fIndex: number;
  mIndex: number;
  dIndex: number;
  doorsList: Door[];
  accessoriesList: Accessory[];
  extraOptionsList: ExtraOption[];
}

export const DoorItem = ({
  fIndex,
  mIndex,
  dIndex,
  doorsList,
  accessoriesList,
  extraOptionsList,
}: DoorItemProps) => {
  const store = useQuotationStore();
  const door = store.floors[fIndex].materials[mIndex].doors[dIndex];

  const handleUpdateDoor = (field: string, value: any) => {
    if (field === 'doorId') {
      const id = parseInt(value, 10);
      const selectedDoor = doorsList.find((d) => d.id === id);
      store.updateDoor(fIndex, mIndex, dIndex, 'doorId', id);
      store.updateDoor(fIndex, mIndex, dIndex, 'code', selectedDoor?.code || '');
    } else {
      store.updateDoor(fIndex, mIndex, dIndex, field, value);
    }
  };

  const handleAddAccessory = () => {
    const firstAcc = accessoriesList[0];
    if (firstAcc) {
      store.addAccessory(fIndex, mIndex, dIndex, firstAcc.id);
    }
  };

  const handleAddExtraOption = () => {
    const firstOpt = extraOptionsList[0];
    if (firstOpt) {
      store.addExtraOption(fIndex, mIndex, dIndex, firstOpt.id);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Tiêu đề cửa & Nút xóa cửa */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-600 flex items-center gap-1">
          <PenTool size={12} className="text-blue-500" /> Cửa #{dIndex + 1}
        </span>
        <Button 
          variant="ghost" 
          size="sm" 
          leftIcon={<Trash2 size={12} />}
          className="h-6 w-6 p-0 text-red-400 hover:text-red-600"
          onClick={() => store.removeDoor(fIndex, mIndex, dIndex)}
        />
      </div>

      {/* Các thuộc tính & Kích thước cửa */}
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-3">
          <span className="text-[10px] text-gray-400 font-semibold block mb-0.5">Biên dạng cửa</span>
          <Select 
            value={door.doorId.toString()} 
            onChange={(e) => handleUpdateDoor('doorId', e.target.value)}
            className="text-xs h-8 w-full"
          >
            <option value="0" disabled>Chọn cửa...</option>
            {doorsList.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
            ))}
          </Select>
        </div>
        <div>
          <span className="text-[10px] text-gray-400">Rộng (mm)</span>
          <Input 
            type="number" 
            value={door.width || ''} 
            onChange={(e) => handleUpdateDoor('width', parseFloat(e.target.value) || 0)} 
            className="h-8 text-xs" 
          />
        </div>
        <div>
          <span className="text-[10px] text-gray-400">Cao (mm)</span>
          <Input 
            type="number" 
            value={door.height || ''} 
            onChange={(e) => handleUpdateDoor('height', parseFloat(e.target.value) || 0)} 
            className="h-8 text-xs" 
          />
        </div>
        <div>
          <span className="text-[10px] text-gray-400">Số lượng</span>
          <Input 
            type="number" 
            value={door.quantity || ''} 
            onChange={(e) => handleUpdateDoor('quantity', parseInt(e.target.value, 10) || 1)} 
            className="h-8 text-xs" 
          />
        </div>

        {/* Danh sách Phụ kiện đính kèm */}
        <div className="col-span-3 mt-1 flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-semibold text-gray-500 block">Phụ kiện đính kèm</span>
            <Button 
              variant="outline" 
              size="xs" 
              leftIcon={<Plus size={10} />} 
              onClick={handleAddAccessory}
              className="h-5 text-[9px] px-1.5"
            >
              Thêm phụ kiện
            </Button>
          </div>
          <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto border border-gray-100 rounded-md p-2 bg-gray-50/50">
            {(!door.accessoryIds || door.accessoryIds.length === 0) ? (
              <span className="text-[10px] text-gray-400 italic">Không có phụ kiện</span>
            ) : (
              door.accessoryIds.map((selectedAccId, aIndex) => (
                <div key={aIndex} className="flex gap-1.5 items-center">
                  <Select
                    value={selectedAccId.toString()}
                    onChange={(e) => store.updateAccessory(fIndex, mIndex, dIndex, aIndex, parseInt(e.target.value, 10))}
                    className="text-xs h-7 flex-1"
                  >
                    {accessoriesList.map((acc) => (
                      <option key={acc.id} value={acc.id}>{acc.name} ({acc.code})</option>
                    ))}
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Trash2 size={12} />}
                    className="h-7 w-7 text-red-500 p-0"
                    onClick={() => store.removeAccessory(fIndex, mIndex, dIndex, aIndex)}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Danh sách Tùy chọn phát sinh */}
        <div className="col-span-3 mt-1.5 flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-semibold text-gray-500 block">Tùy chọn phát sinh</span>
            <Button 
              variant="outline" 
              size="xs" 
              leftIcon={<Plus size={10} />} 
              onClick={handleAddExtraOption}
              className="h-5 text-[9px] px-1.5"
            >
              Thêm tùy chọn
            </Button>
          </div>
          <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto border border-gray-100 rounded-md p-2 bg-gray-50/50">
            {(!door.extraOptionIds || door.extraOptionIds.length === 0) ? (
              <span className="text-[10px] text-gray-400 italic">Không có tùy chọn</span>
            ) : (
              door.extraOptionIds.map((selectedOptId, oIndex) => (
                <div key={oIndex} className="flex gap-1.5 items-center">
                  <Select
                    value={selectedOptId.toString()}
                    onChange={(e) => store.updateExtraOption(fIndex, mIndex, dIndex, oIndex, parseInt(e.target.value, 10))}
                    className="text-xs h-7 flex-1"
                  >
                    {extraOptionsList.map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.name} ({opt.code})</option>
                    ))}
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Trash2 size={12} />}
                    className="h-7 w-7 text-red-500 p-0"
                    onClick={() => store.removeExtraOption(fIndex, mIndex, dIndex, oIndex)}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
