'use client';

import { useState, useEffect } from 'react';
import {
  WarehouseItemType,
  Brand,
  BrandColor,
  ProfileBar,
  Accessory,
} from '@/types';
import {
  getBrands,
  getBrandColors,
  getProfileBars,
  getAccessories,
} from '@/actions';
import { toDisplayUnit } from '../../_utils/unit-mapping';

interface UseItemLibraryProps {
  isOpen: boolean;
  isEditMode: boolean;
  itemType: WarehouseItemType;
  inputMode: 'library' | 'manual';
  setItemCode: (val: string) => void;
  setItemName: (val: string) => void;
  setUnit: (val: string) => void;
  setStandardLengthMm: (val: string) => void;
  setCostPrice: (val: string) => void;
}

export function useItemLibrary({
  isOpen,
  isEditMode,
  itemType,
  inputMode,
  setItemCode,
  setItemName,
  setUnit,
  setStandardLengthMm,
  setCostPrice,
}: UseItemLibraryProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<number | undefined>();
  const [profiles, setProfiles] = useState<ProfileBar[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<number | undefined>();
  const [colors, setColors] = useState<BrandColor[]>([]);
  const [selectedColorId, setSelectedColorId] = useState<number | undefined>();
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [selectedAccessoryId, setSelectedAccessoryId] = useState<number | undefined>();

  // Tải danh mục ban đầu (chỉ khi tạo mới)
  useEffect(() => {
    if (!isOpen || isEditMode) return;
    const fetchInit = async () => {
      try {
        const [brandRes, accRes] = await Promise.all([
          getBrands({ limit: 100 }),
          getAccessories({ limit: 200 }),
        ]);
        setBrands(brandRes.items || []);
        setAccessories(accRes.items || []);
        if (brandRes.items?.length > 0 && !selectedBrandId) {
          setSelectedBrandId(brandRes.items[0].id);
        }
      } catch (err) {
        console.warn('Lỗi tải dữ liệu danh mục', err);
      }
    };
    fetchInit();
  }, [isOpen, isEditMode]);

  // Tải Profile và Màu khi đổi Hãng
  useEffect(() => {
    if (isEditMode || !selectedBrandId || itemType !== 'profile') return;
    const fetchBrandData = async () => {
      try {
        const [profRes, colorRes] = await Promise.all([
          getProfileBars({ brandId: selectedBrandId, limit: 150 }),
          getBrandColors({ brandId: selectedBrandId, limit: 50 }),
        ]);
        setProfiles(profRes.items || []);
        setColors(colorRes.items || []);

        const defaultColor = colorRes.items?.find((c) => c.isDefault) || colorRes.items?.[0];
        if (defaultColor) setSelectedColorId(defaultColor.id);
        if (profRes.items?.length > 0) setSelectedProfileId(profRes.items[0].id);
      } catch (err) {
        console.warn('Lỗi tải profile/color theo hãng', err);
      }
    };
    fetchBrandData();
  }, [selectedBrandId, itemType, isEditMode]);

  // Tự động điền dữ liệu khi chọn Profile và Màu
  useEffect(() => {
    if (isEditMode || inputMode !== 'library' || itemType !== 'profile') return;
    const prof = profiles.find((p) => p.id === selectedProfileId);
    const col = colors.find((c) => c.id === selectedColorId);
    const br = brands.find((b) => b.id === selectedBrandId);

    if (prof) {
      const colorSuffix = col ? `_${col.code || col.name.trim()}` : '';
      const colorLabel = col ? ` (${col.name})` : '';
      setItemCode(`${prof.code}${colorSuffix}`);
      setItemName(`${prof.name} ${br?.name ? `[${br.name}]` : ''}${colorLabel}`.trim());
      setUnit('Cây');
      setStandardLengthMm(String(prof.barLengthMm || 6000));

      const priceKg = col?.pricePerKg && col.pricePerKg > 0 ? col.pricePerKg : 150000;
      const weight = prof.weightPerM || 1.25;
      const estPrice = Math.round(weight * 6.0 * priceKg);
      setCostPrice(String(estPrice));
    }
  }, [selectedProfileId, selectedColorId, selectedBrandId, profiles, colors, brands, inputMode, itemType, isEditMode]);

  // Tự động điền dữ liệu khi chọn Phụ kiện
  useEffect(() => {
    if (isEditMode || inputMode !== 'library' || itemType !== 'accessory') return;
    const acc = accessories.find((a) => a.id === selectedAccessoryId);
    if (acc) {
      setItemCode(acc.code || `ACC-${acc.id}`);
      setItemName(acc.name);
      setUnit(toDisplayUnit(acc.unit || 'pcs'));
      setCostPrice(String(acc.costPrice || acc.unitPrice || 0));
    }
  }, [selectedAccessoryId, accessories, inputMode, itemType, isEditMode]);

  return {
    brands,
    selectedBrandId,
    setSelectedBrandId,
    profiles,
    selectedProfileId,
    setSelectedProfileId,
    colors,
    selectedColorId,
    setSelectedColorId,
    accessories,
    selectedAccessoryId,
    setSelectedAccessoryId,
  };
}
