'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Sparkles, Edit3 } from 'lucide-react';
import { Modal, Button } from '@/components';
import { WarehouseItem, WarehouseItemType } from '@/types';
import { createWarehouseItem, updateWarehouseItem } from '@/actions';
import { toDisplayUnit, toBackendUnit } from '../../_utils/unit-mapping';
import { ItemLibrarySelector } from './item-library-selector';
import { ItemFormFields } from './item-form-fields';
import { useItemLibrary } from './use-item-library';

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: WarehouseItem | null;
}

export const ItemFormModal: React.FC<ItemFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const isEditMode = Boolean(initialData);
  const [inputMode, setInputMode] = useState<'library' | 'manual'>('library');
  const [itemType, setItemType] = useState<WarehouseItemType>('profile');

  // Form Fields
  const [itemCode, setItemCode] = useState('');
  const [itemName, setItemName] = useState('');
  const [unit, setUnit] = useState('Cây');
  const [standardLengthMm, setStandardLengthMm] = useState('6000');
  const [costPrice, setCostPrice] = useState('0');
  const [minStockLevel, setMinStockLevel] = useState('5');
  const [currentStock, setCurrentStock] = useState('0');
  const [location, setLocation] = useState('Giá A1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hook quản lý nạp dữ liệu thư viện tự động
  const library = useItemLibrary({
    isOpen,
    isEditMode,
    itemType,
    inputMode,
    setItemCode,
    setItemName,
    setUnit,
    setStandardLengthMm,
    setCostPrice,
  });

  // Khởi tạo hoặc cập nhật form khi mở modal
  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      setInputMode('manual');
      setItemType(initialData.itemType as WarehouseItemType);
      setItemCode(initialData.itemCode);
      setItemName(initialData.itemName);
      setUnit(toDisplayUnit(initialData.unit));
      setStandardLengthMm(String(initialData.standardLengthMm || 6000));
      setCostPrice(String(initialData.costPrice || 0));
      setMinStockLevel(String(initialData.minStockLevel || 0));
      setCurrentStock(String(initialData.currentStock || 0));
      setLocation(initialData.location || '');
    } else {
      setInputMode('library');
      setItemType('profile');
      setItemCode('');
      setItemName('');
      setUnit('Cây');
      setStandardLengthMm('6000');
      setCostPrice('0');
      setMinStockLevel('5');
      setCurrentStock('0');
      setLocation('Giá A1');
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemCode.trim() || !itemName.trim()) {
      toast.error('Vui lòng nhập đầy đủ mã và tên mặt hàng');
      return;
    }

    setIsSubmitting(true);
    try {
      if (initialData) {
        await updateWarehouseItem(initialData.id, {
          itemName: itemName.trim(),
          unit: toBackendUnit(unit),
          standardLengthMm: itemType === 'profile' ? Number(standardLengthMm) || 6000 : undefined,
          costPrice: Number(costPrice) || 0,
          minStockLevel: Number(minStockLevel) || 0,
          location: location.trim() || undefined,
        });
        toast.success('Cập nhật thông tin mặt hàng thành công!');
      } else {
        await createWarehouseItem({
          itemCode: itemCode.trim().toUpperCase(),
          itemName: itemName.trim(),
          itemType,
          unit: toBackendUnit(unit),
          profileBarId: itemType === 'profile' ? library.selectedProfileId : undefined,
          colorId: itemType === 'profile' ? library.selectedColorId : undefined,
          standardLengthMm: itemType === 'profile' ? Number(standardLengthMm) || 6000 : undefined,
          costPrice: Number(costPrice) || 0,
          minStockLevel: Number(minStockLevel) || 0,
          currentStock: Number(currentStock) || 0,
          location: location.trim() || undefined,
        });
        toast.success('Thêm mặt hàng mới vào kho thành công!');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || err.message || 'Lỗi lưu thông tin mặt hàng');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Chỉnh sửa thông tin mặt hàng kho' : 'Thêm mặt hàng mới vào danh mục kho'}
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Hủy bỏ
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || !itemCode.trim() || !itemName.trim()}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            {isSubmitting ? 'Đang lưu...' : isEditMode ? 'Cập nhật' : 'Thêm mặt hàng'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Khối thông tin cố định khi sửa (Mã, Hãng, Màu, Tồn thực tế) */}
        {initialData ? (
          <div className="flex items-center justify-between p-3 bg-indigo-50/70 rounded-xl border border-indigo-100">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs text-indigo-900 bg-white px-2 py-1 rounded border border-indigo-200">
                {initialData.itemCode}
              </span>
              {initialData.brandName && (
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-100 text-indigo-700">
                  {initialData.brandName}
                </span>
              )}
              {initialData.colorName && (
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
                  {initialData.colorName}
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Tồn kho hiện tại: <strong className="text-slate-800">{initialData.currentStock}</strong> {toDisplayUnit(initialData.unit)}
            </span>
          </div>
        ) : (
          /* Chế độ nhập & Phân loại khi tạo mới */
          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setInputMode('library')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-xs transition-colors ${
                  inputMode === 'library'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles size={13} />
                Chọn từ Thư Viện
              </button>
              <button
                type="button"
                onClick={() => setInputMode('manual')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-xs transition-colors ${
                  inputMode === 'manual'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 size={13} />
                Nhập Thủ Công
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Loại:</span>
              <select
                value={itemType}
                onChange={(e) => {
                  const val = e.target.value as WarehouseItemType;
                  setItemType(val);
                  setUnit(val === 'profile' ? 'Cây' : val === 'accessory' ? 'Bộ' : 'Cái');
                }}
                className="text-xs font-semibold border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="profile">Nhôm Profile (Cây)</option>
                <option value="accessory">Phụ kiện (Bộ/Cái)</option>
                <option value="consumable">Vật tư phụ & Keo</option>
              </select>
            </div>
          </div>
        )}

        {/* Khối chọn từ thư viện (chỉ khi tạo mới và chọn chế độ library) */}
        {!isEditMode && inputMode === 'library' && (
          <ItemLibrarySelector
            itemType={itemType}
            brands={library.brands}
            selectedBrandId={library.selectedBrandId}
            onSelectBrandId={library.setSelectedBrandId}
            profiles={library.profiles}
            selectedProfileId={library.selectedProfileId}
            onSelectProfileId={library.setSelectedProfileId}
            colors={library.colors}
            selectedColorId={library.selectedColorId}
            onSelectColorId={library.setSelectedColorId}
            accessories={library.accessories}
            selectedAccessoryId={library.selectedAccessoryId}
            onSelectAccessoryId={library.setSelectedAccessoryId}
          />
        )}

        {/* Thông tin chi tiết mặt hàng */}
        <ItemFormFields
          inputMode={inputMode}
          itemType={itemType}
          isEditMode={isEditMode}
          itemCode={itemCode}
          setItemCode={setItemCode}
          itemName={itemName}
          setItemName={setItemName}
          unit={unit}
          setUnit={setUnit}
          standardLengthMm={standardLengthMm}
          setStandardLengthMm={setStandardLengthMm}
          costPrice={costPrice}
          setCostPrice={setCostPrice}
          currentStock={currentStock}
          setCurrentStock={setCurrentStock}
          location={location}
          setLocation={setLocation}
          minStockLevel={minStockLevel}
          setMinStockLevel={setMinStockLevel}
        />
      </form>
    </Modal>
  );
};
