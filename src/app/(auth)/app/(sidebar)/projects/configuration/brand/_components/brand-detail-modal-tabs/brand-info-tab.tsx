'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Input, Button } from '@/components';
import { useMutation } from '@tanstack/react-query';
import { UploadCloud, Image as ImageIcon, X, Check, Save } from 'lucide-react';
import queryClient from '@/utils/query';
import toast from 'react-hot-toast';
import { showErrorToast } from '@/utils';
import { updateBrand } from '@/actions';
import type { Brand, BrandUpdate } from '@/types';
import { BASE_MINIO_URL } from '@/config';

interface BrandInfoTabProps {
  brand: Brand;
}

export function BrandInfoTab({ brand }: BrandInfoTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<BrandUpdate>({
    defaultValues: {
      code: brand.code,
      name: brand.name,
      brandType: brand.brandType,
      originCountry: brand.originCountry || '',
      website: brand.website || '',
      description: brand.description || '',
      isActive: brand.isActive,
      sortOrder: brand.sortOrder,
      barLengthMm: brand.barLengthMm ?? 6000,
    },
  });

  useEffect(() => {
    setSelectedFile(null);
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
  }, [brand, reset]);

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
    mutationFn: async (data: BrandUpdate) => {
      return await updateBrand(brand.id, data, selectedFile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success('Cập nhật thông tin thương hiệu thành công');
    },
    onError: (err) => {
      showErrorToast(err, 'Lỗi khi cập nhật thông tin thương hiệu');
    },
  });

  const onSubmit = (data: BrandUpdate) => {
    mutate({
      ...data,
      sortOrder: Number(data.sortOrder) || 0,
      barLengthMm: Number(data.barLengthMm) || 6000,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-6 max-w-4xl">
      {/* Upload Logo thương hiệu */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="relative w-24 h-24 rounded-xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
            {previewUrl ? (
              <>
                <img
                  src={previewUrl}
                  alt="Brand Logo"
                  className="w-full h-full object-contain p-2"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-1 right-1 p-1 bg-white/90 text-rose-600 rounded-full shadow-xs hover:bg-rose-50 transition cursor-pointer"
                  title="Xóa ảnh"
                >
                  <X size={14} />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 gap-1">
                <ImageIcon size={28} />
                <span className="text-[10px] font-medium">Chưa có logo</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5 flex-1">
            <h4 className="text-sm font-bold text-slate-900">Logo thương hiệu</h4>
            <p className="text-xs text-slate-500">
              Định dạng PNG, JPG, WEBP hoặc SVG. Khuyến nghị ảnh vuông nền trong suốt để hiển thị tối ưu nhất.
            </p>

            <div className="flex items-center gap-2 mt-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp, image/svg+xml"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<UploadCloud size={15} />}
                className="text-xs font-semibold h-8"
              >
                {previewUrl ? 'Thay đổi logo' : 'Tải lên logo'}
              </Button>
              {selectedFile && (
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
                  <Check size={13} />
                  Đã chọn: {selectedFile.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Thông tin chính */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Mã thương hiệu"
            placeholder="VD: XINGFA, KOGEN..."
            required
            {...register('code', { required: 'Mã thương hiệu là bắt buộc' })}
          />

          <Input
            label="Tên thương hiệu"
            placeholder="VD: Xingfa Quảng Đông..."
            required
            {...register('name', { required: 'Tên thương hiệu là bắt buộc' })}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phân loại
            </label>
            <select
              {...register('brandType')}
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition"
            >
              <option value="aluminum">Hãng nhôm</option>
              <option value="accessory">Hãng phụ kiện</option>
              <option value="both">Cả hai (Nhôm & Phụ kiện)</option>
            </select>
          </div>

          <Input
            label="Xuất xứ"
            placeholder="VD: Việt Nam, Trung Quốc, Đức..."
            {...register('originCountry')}
          />

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

        {/* Mô tả / Ghi chú */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-700">
            Mô tả / Ghi chú
          </label>
          <textarea
            rows={3}
            placeholder="Thông tin ghi chú về thương hiệu..."
            {...register('description')}
            className="w-full p-3 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:bg-white transition resize-none"
          />
        </div>

        {/* Trạng thái hoạt động */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            {...register('isActive')}
            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary accent-primary"
          />
          <span className="text-sm font-medium text-slate-700">
            Kích hoạt hoạt động thương hiệu này
          </span>
        </label>

        {/* Nút lưu thay đổi */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            type="submit"
            variant="primary"
            loading={isPending}
            leftIcon={<Save size={16} />}
            className="px-6 font-semibold"
          >
            Lưu thay đổi
          </Button>
        </div>
      </form>
  );
}
