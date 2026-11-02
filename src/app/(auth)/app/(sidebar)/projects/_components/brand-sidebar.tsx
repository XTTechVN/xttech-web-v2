'use client';

import React, { useState, useMemo } from 'react';
import { Star } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { updateBrand } from '@/actions';
import { isBrandFavorite, type Brand } from '@/types';
import { BASE_MINIO_URL } from '@/config';
import queryClient from '@/utils/query';
import { showErrorToast } from '@/utils';

export interface BrandSidebarProps {
  brands: Brand[];
  selectedBrandId: number | null;
  onSelectBrand: (brandId: number) => void;
}

function BrandSquareLogo({
  logoPath,
  name,
  code,
  updatedAt,
}: {
  logoPath?: string | null;
  name: string;
  code: string;
  updatedAt?: string;
}) {
  const [hasError, setHasError] = useState(false);

  const logoUrl = useMemo(() => {
    if (!logoPath) return null;
    const base = logoPath.startsWith('http')
      ? logoPath
      : `${BASE_MINIO_URL}/${logoPath.startsWith('/') ? logoPath.slice(1) : logoPath}`;

    if (!updatedAt) return base;
    const timestamp = new Date(updatedAt).getTime();
    const separator = base.includes('?') ? '&' : '?';
    return `${base}${separator}t=${timestamp}`;
  }, [logoPath, updatedAt]);

  if (logoUrl && !hasError) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className="w-full h-full object-contain p-2"
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <span className="text-md md:text-xl font-bold text-primary">
      {code ? code.slice(0, 2).toUpperCase() : name.slice(0, 2).toUpperCase()}
    </span>
  );
}

export function BrandSidebar({
  brands,
  selectedBrandId,
  onSelectBrand,
}: BrandSidebarProps) {
  // Giữ nguyên thứ tự sắp xếp A-Z (không thay đổi vị trí khi gắn cờ yêu thích)
  const sortedBrands = useMemo(() => {
    return [...brands].sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }));
  }, [brands]);

  const { mutate: toggleFavoriteMutate, isPending: isToggling } = useMutation({
    mutationFn: async ({ brand, nextFavorite }: { brand: Brand; nextFavorite: boolean }) => {
      if (nextFavorite) {
        const previousFavorites = brands.filter(
          (item) => item.id !== brand.id && isBrandFavorite(item),
        );
        await Promise.all([
          ...previousFavorites.map((item) => updateBrand(item.id, { sortOrder: 0 })),
          updateBrand(brand.id, { sortOrder: 1 }),
        ]);
        return;
      }
      await updateBrand(brand.id, { sortOrder: 0 });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['brands-picker'] });
      if (variables.nextFavorite) {
        toast.success(`Đã đặt "${variables.brand.name}" làm hãng mặc định khi vào trang`);
      } else {
        toast.success(`Đã bỏ đánh dấu yêu thích hãng "${variables.brand.name}"`);
      }
    },
    onError: (err) => showErrorToast(err, 'Không thể cập nhật trạng thái yêu thích'),
  });

  const handleToggleFavorite = (e: React.MouseEvent, brand: Brand) => {
    e.stopPropagation();
    if (isToggling) return;
    const nextFavorite = !isBrandFavorite(brand);
    toggleFavoriteMutate({ brand, nextFavorite });
  };

  return (
    <div className="w-full md:w-30 lg:w-33 shrink-0 bg-white border-b md:border-b-0 md:border-r border-slate-200 rounded-none py-3 px-4 md:py-4 md:px-3 flex flex-row md:flex-col items-center gap-4 md:gap-4 shadow-none sticky top-0 z-10 md:h-[calc(100vh-105px)] overflow-x-auto md:overflow-x-hidden md:overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {/* Danh sách từng Hãng dạng Hình Vuông */}
      <div className="flex flex-row md:flex-col items-center gap-4 md:gap-4 shrink-0">
        {sortedBrands.map((b) => {
          const isSelected = selectedBrandId === b.id;
          const isFavorite = isBrandFavorite(b);

          return (
            <div
              key={b.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectBrand(b.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectBrand(b.id);
                }
              }}
              className="group flex flex-col items-center gap-1.5 cursor-pointer shrink-0 select-none"
              title={`${b.name} (${b.code})`}
            >
              <div
                className={`relative w-10 h-10 md:w-20 md:h-20 rounded-xl bg-white flex items-center justify-center overflow-hidden transition-all ${
                  isSelected
                    ? 'border-2 border-primary bg-primary/5 shadow-xs'
                    : 'border border-slate-200 hover:border-slate-400'
                }`}
              >
                {/* Nút ngôi sao Yêu thích góc trên bên trái */}
                <button
                  type="button"
                  onClick={(e) => handleToggleFavorite(e, b)}
                  disabled={isToggling}
                  title={isFavorite ? 'Bỏ đánh dấu hãng yêu thích' : 'Đặt làm hãng yêu thích (chọn mặc định khi vào trang)'}
                  className="absolute top-1 left-1 z-10 p-0.5 rounded-full transition-transform hover:scale-110 cursor-pointer"
                >
                  <Star
                    size={14}
                    className={
                      isFavorite
                        ? 'fill-amber-400 text-amber-400 drop-shadow-2xs'
                        : 'text-slate-300 hover:text-amber-400 transition-colors'
                    }
                  />
                </button>

                <BrandSquareLogo
                  key={`${b.logoPath ?? ''}-${b.updatedAt ?? ''}`}
                  logoPath={b.logoPath}
                  name={b.name}
                  code={b.code}
                  updatedAt={b.updatedAt}
                />
              </div>
              <span
                className={`text-xs md:text-sm text-center truncate w-22 md:w-36 leading-snug ${
                  isSelected
                    ? 'font-bold text-primary'
                    : 'font-medium text-slate-600 group-hover:text-slate-900'
                }`}
              >
                {b.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
