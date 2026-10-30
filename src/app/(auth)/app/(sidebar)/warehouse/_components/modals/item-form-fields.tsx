'use client';

import React from 'react';
import { Input, Select } from '@/components';
import { WarehouseItemType } from '@/types';
import { STANDARD_UNIT_OPTIONS } from '../../_utils/unit-mapping';

interface ItemFormFieldsProps {
  inputMode: 'library' | 'manual';
  itemType: WarehouseItemType;
  isEditMode?: boolean;
  itemCode: string;
  setItemCode: (val: string) => void;
  itemName: string;
  setItemName: (val: string) => void;
  unit: string;
  setUnit: (val: string) => void;
  standardLengthMm: string;
  setStandardLengthMm: (val: string) => void;
  costPrice: string;
  setCostPrice: (val: string) => void;
  currentStock: string;
  setCurrentStock: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
  minStockLevel: string;
  setMinStockLevel: (val: string) => void;
}

export const ItemFormFields: React.FC<ItemFormFieldsProps> = ({
  inputMode,
  itemType,
  isEditMode = false,
  itemCode,
  setItemCode,
  itemName,
  setItemName,
  unit,
  setUnit,
  standardLengthMm,
  setStandardLengthMm,
  costPrice,
  setCostPrice,
  currentStock,
  setCurrentStock,
  location,
  setLocation,
  minStockLevel,
  setMinStockLevel,
}) => {
  const isLibrary = inputMode === 'library' && !isEditMode;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-slate-700 font-medium">Mã vật tư kho *</label>
            {isEditMode ? (
              <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                Cố định
              </span>
            ) : isLibrary ? (
              <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-medium">
                Tự động từ thư viện
              </span>
            ) : null}
          </div>
          <Input
            placeholder="VD: C3209_TRANG"
            value={itemCode}
            onChange={(e) => setItemCode(e.target.value)}
            required
            disabled={isLibrary || isEditMode}
            className={`font-mono font-bold uppercase ${
              isLibrary || isEditMode ? 'bg-slate-100 text-slate-700 cursor-not-allowed border-slate-200' : ''
            }`}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-slate-700 font-medium">Đơn vị tính *</label>
            {isLibrary && (
              <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-medium">
                Tự động
              </span>
            )}
          </div>
          {isLibrary ? (
            <Input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              required
              disabled
              className="bg-slate-100 text-slate-700 cursor-not-allowed border-slate-200 font-semibold"
            />
          ) : (
            <Select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              options={STANDARD_UNIT_OPTIONS}
            />
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-slate-700 font-medium">Tên mặt hàng kho *</label>
          {isLibrary && (
            <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-medium">
              Tự động từ thư viện
            </span>
          )}
        </div>
        <Input
          placeholder="VD: Khung bao cửa đi Xingfa 55 (Trắng sứ)"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          required
          disabled={isLibrary}
          className={isLibrary ? 'bg-slate-100 text-slate-700 cursor-not-allowed border-slate-200 font-medium' : ''}
        />
      </div>

      <div className={`grid gap-3 ${isEditMode ? (itemType === 'profile' ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2') : 'grid-cols-1 sm:grid-cols-3'}`}>
        {itemType === 'profile' && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-700 font-medium">Chiều dài (mm)</label>
              {!isEditMode && isLibrary && (
                <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-medium">
                  Chuẩn hãng
                </span>
              )}
            </div>
            <Input
              type="number"
              value={standardLengthMm}
              onChange={(e) => setStandardLengthMm(e.target.value)}
              disabled={isLibrary && !isEditMode}
              className={isLibrary && !isEditMode ? 'bg-slate-100 text-slate-700 cursor-not-allowed border-slate-200' : ''}
            />
          </div>
        )}
        <div>
          <label className="block text-slate-700 font-medium mb-1">Vị trí lưu kho</label>
          <Input
            placeholder="VD: Kệ A1, Kệ nhôm B2..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-slate-700 font-medium mb-1">
            {isEditMode ? 'Đơn giá vốn bình quân (đ)' : 'Giá vốn ước tính (đ)'}
          </label>
          <Input
            type="number"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
          />
        </div>
        {!isEditMode && (
          <div>
            <label className="block text-slate-700 font-medium mb-1">Tồn kho ban đầu</label>
            <Input
              type="number"
              value={currentStock}
              onChange={(e) => setCurrentStock(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
        <div>
          <span className="font-semibold text-slate-800 block">Định mức tồn kho tối thiểu</span>
          <span className="text-[11px] text-slate-500">Hệ thống sẽ cảnh báo khi lượng tồn kho dưới mức này</span>
        </div>
        <div className="w-24">
          <Input
            type="number"
            value={minStockLevel}
            onChange={(e) => setMinStockLevel(e.target.value)}
            className="text-right font-bold"
          />
        </div>
      </div>
    </>
  );
};
