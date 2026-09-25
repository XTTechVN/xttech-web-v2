'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Modal, Input, Button } from '@/components';
import { useMutation } from '@tanstack/react-query';
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react';
import queryClient from '@/utils/query';
import toast from 'react-hot-toast';
import { showErrorToast } from '@/utils';
import { createBrand, updateBrand } from '@/actions';
import type { Brand, BrandCreate } from '@/types';
import { BASE_MINIO_URL } from '@/config';

interface BrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand?: Brand | null;
}

export function BrandModal({ isOpen, onClose, brand }: BrandModalProps) {
  const isEdit = Boolean(brand);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<BrandCreate>({
    defaultValues: {
      code: '',
      name: '',
      brandType: 'aluminum',
      originCountry: '',
      website: '',
      description: '',
      isActive: true,
      sortOrder: 0,
      barLengthMm: 6000,
    },
  });

  useEffect(() => {
    setSelectedFile(null);
    if (brand) {
      reset({
        code: brand.code,
        name: brand.name,
        brandType: brand.brandType,
        originCountry: brand.originCountry || '',
        website: brand.website || '',
        description: brand.description || '',
        isActive: brand.isActive,
        sortOrder: brand.sortOrder,
        barLengthMm: brand.barLengthMm ?? 6000,
      });

      if (brand.logoPath) {
        const base = brand.logoPath.startsWith('http')
          ? brand.logoPath
          : `${BASE_MINIO_URL}/${brand.logoPath.startsWith('/') ? brand.logoPath.slice(1) : brand.logoPath}`;
        const timestamp = brand.updatedAt ? new Date(brand.updatedAt).getTime() : Date.now();
        const separator = base.includes('?') ? '&' : '?';
        setPreviewUrl(`${base}${separator}t=${timestamp}`);
      } else {
        setPreviewUrl(null);
      }
    } else {
      reset({
        code: '',
        name: '',
        brandType: 'aluminum',
        originCountry: '',
        website: '',
        description: '',
        isActive: true,
        sortOrder: 0,
        barLengthMm: 6000,
      });
      setPreviewUrl(null);
    }
  }, [brand, reset, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: BrandCreate) => {
      if (data.barLengthMm !== undefined && data.barLengthMm !== null) {
        data.barLengthMm = Number(data.barLengthMm);
      }
      if (isEdit && brand) {
        return await updateBrand(brand.id, data, selectedFile);
      }
      return await createBrand(data, selectedFile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success(isEdit ? 'Cập nhật thương hiệu thành công' : 'Thêm thương hiệu thành công');
      onClose();
    },
    onError: (err) => showErrorToast(err, isEdit ? 'Lỗi khi cập nhật' : 'Lỗi khi tạo mới'),
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Sửa thông tin thương hiệu' : 'Thêm thương hiệu mới'}
      size="md"
    >
      <form onSubmit={handleSubmit((d) => mutate(d))} className="flex flex-col gap-4">
        {/* Upload Logo thương hiệu */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-700">Logo thương hiệu</label>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-xl border border-dashed border-gray-300 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 group">
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Logo preview" className="w-full h-full object-contain p-1.5" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow-xs hover:bg-rose-600 cursor-pointer"
                    title="Xóa ảnh"
                  >
                    <X size={12} />
                  </button>
                </>
              ) : (
                <ImageIcon size={24} className="text-slate-400" />
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="brand-logo-file"
              />
              <label
                htmlFor="brand-logo-file"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 hover:border-primary text-slate-700 hover:text-primary rounded-lg text-xs font-semibold cursor-pointer transition shadow-2xs w-fit"
              >
                <UploadCloud size={14} />
                {previewUrl ? 'Thay đổi logo' : 'Tải lên logo'}
              </label>
              <span className="text-[11px] text-slate-400">Định dạng PNG, JPG, WEBP, SVG</span>
            </div>
          </div>
        </div>

        {/* Mã & Tên hãng */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Mã thương hiệu *"
            placeholder="VD: XINGFA_QD"
            {...register('code', { required: true })}
          />
          <Input
            label="Tên thương hiệu *"
            placeholder="VD: Xingfa Quảng Đông"
            {...register('name', { required: true })}
          />
        </div>

        {/* Phân loại & Xuất xứ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Phân loại</label>
            <select
              {...register('brandType')}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="aluminum">Hãng nhôm</option>
              <option value="accessory">Hãng phụ kiện</option>
              <option value="both">Cả hai (Nhôm & Phụ kiện)</option>
            </select>
          </div>

          <Input
            label="Xuất xứ"
            placeholder="VD: Trung Quốc, Việt Nam..."
            {...register('originCountry')}
          />
        </div>

        {/* Chiều dài thanh & Website */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            type="number"
            label="Chiều dài cây nhôm tiêu chuẩn (mm)"
            placeholder="6000"
            {...register('barLengthMm')}
          />

          <Input
            label="Website thương hiệu"
            placeholder="https://..."
            {...register('website')}
          />
        </div>

        <Input
          label="Mô tả / Ghi chú"
          placeholder="Thông tin ghi chú về thương hiệu..."
          {...register('description')}
        />

        {/* Trạng thái hoạt động */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <input
            type="checkbox"
            id="isActive"
            {...register('isActive')}
            className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
            Kích hoạt hoạt động
          </label>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" type="button" onClick={onClose} disabled={isPending}>
            Hủy
          </Button>
          <Button variant="primary" type="submit" loading={isPending}>
            {isEdit ? 'Lưu thay đổi' : 'Thêm mới'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
