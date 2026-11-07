'use client';

import React, { useState, useMemo } from 'react';
import { Star, Search, X } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { updateBrand } from '@/actions';
import { isBrandFavorite, type Brand } from '@/types';
import { BASE_MINIO_URL } from '@/config';
import queryClient from '@/utils/query';
import { showErrorToast, includesSearchText } from '@/utils';

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
  const [brandSearch, setBrandSearch] = useState('');

  // Giữ nguyên thứ tự sắp xếp A-Z (không thay đổi vị trí khi gắn cờ yêu thích)
  const sortedBrands = useMemo(() => {
    return [...brands].sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }));
  }, [brands]);

  const filteredBrands = useMemo(() => {
    const query = brandSearch.trim();
    if (!query) return sortedBrands;
    return sortedBrands.filter(
      (b) => includesSearchText(b.name, query) || includesSearchText(b.code || '', query),
    );
  }, [sortedBrands, brandSearch]);

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
    <div className="w-full md:w-32 lg:w-35 shrink-0 bg-white border-b md:border-b-0 md:border-r border-slate-200 rounded-none flex flex-col shadow-none sticky top-0 z-10 md:h-[calc(100vh-105px)]">
      {/* Ô tìm kiếm nhanh Hãng cố định ở đỉnh cột */}
      <div className="shrink-0 px-3 pt-3 pb-2 md:px-2.5 md:pt-3 md:pb-2 w-full">
        <div className="relative w-full">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            placeholder="Tìm hãng..."
            className="w-full h-8 pl-7 pr-6 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary/20 transition"
          />
          {brandSearch && (
            <button
              type="button"
              onClick={() => setBrandSearch('')}
              title="Xóa tìm kiếm"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Danh sách từng Hãng dạng Hình Vuông */}
      <div className="flex-1 w-full py-2 px-4 md:py-2 md:px-2.5 overflow-x-auto md:overflow-x-hidden md:overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {filteredBrands.length === 0 ? (
          <div className="py-6 text-center text-[11px] text-slate-400 font-medium px-1">
            Không tìm thấy hãng
          </div>
        ) : (
          <div className="flex flex-row md:flex-col items-center gap-4 md:gap-4 shrink-0">
            {filteredBrands.map((b) => {
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
                    className={`text-xs md:text-sm text-center truncate w-22 md:w-28 leading-snug ${
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
        )}
      </div>
    </div>
  );
}
