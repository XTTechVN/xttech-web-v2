'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Modal } from '@/components';
import type { Brand } from '@/types';
import { BASE_MINIO_URL } from '@/config';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BrandInfoTab, BrandColorsTab } from './brand-detail-modal-tabs';

interface BrandDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand: Brand | null;
  brands?: Brand[];
  onSelectBrand?: (brand: Brand) => void;
}

export function BrandDetailModal({
  isOpen,
  onClose,
  brand,
  brands = [],
  onSelectBrand,
}: BrandDetailModalProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [brands]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 280;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!brand) return null;

  const logoUrl = brand.logoPath
    ? brand.logoPath.startsWith('http')
      ? brand.logoPath
      : `${BASE_MINIO_URL}/${brand.logoPath.startsWith('/') ? brand.logoPath.slice(1) : brand.logoPath}`
    : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      title={
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <div className="w-8 h-8 rounded-md bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 p-0.5">
              <img src={logoUrl} alt={brand.name} className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-md bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
              {brand.code ? brand.code.slice(0, 2).toUpperCase() : 'XT'}
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">{brand.name}</span>
            <span className="text-xs font-mono font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
              {brand.code}
            </span>
          </div>
        </div>
      }
      bodyClassName="p-4 sm:p-6 bg-white min-h-[calc(100vh-65px)] flex flex-col gap-5"
    >
      {/* Top Bar: Khu vực chọn thương hiệu nhanh */}
      {brands.length > 0 && (
        <div className="relative flex items-center pb-3 border-b border-slate-200 shrink-0">
          {/* Nút cuộn trái */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-3 z-10 flex items-center pr-3 bg-gradient-to-r from-white via-white/95 to-transparent">
              <button
                type="button"
                onClick={() => handleScroll('left')}
                className="p-1.5 bg-white hover:bg-slate-50 text-slate-700 shadow-md rounded-full border border-slate-200 transition-all cursor-pointer"
                title="Cuộn sang trái"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          )}

          {/* Dải danh sách thương hiệu */}
          <div
            ref={scrollContainerRef}
            className="flex items-center gap-2 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden w-full px-0.5"
          >
            {brands.map((b) => {
              const isSelected = b.id === brand.id;
              const bLogo = b.logoPath
                ? b.logoPath.startsWith('http')
                  ? b.logoPath
                  : `${BASE_MINIO_URL}/${b.logoPath.startsWith('/') ? b.logoPath.slice(1) : b.logoPath}`
                : null;

              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onSelectBrand?.(b)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer border select-none ${
                    isSelected
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  {bLogo ? (
                    <img
                      src={bLogo}
                      alt={b.name}
                      className="w-4 h-4 object-contain rounded-xs shrink-0"
                    />
                  ) : (
                    <span className="w-4 h-4 rounded-xs bg-slate-200 text-slate-700 text-[9px] flex items-center justify-center font-bold">
                      {b.code ? b.code.slice(0, 1) : 'B'}
                    </span>
                  )}
                  <span className="truncate max-w-[130px]">{b.name}</span>
                </button>
              );
            })}
          </div>

          {/* Nút cuộn phải */}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-3 z-10 flex items-center pl-3 bg-gradient-to-l from-white via-white/95 to-transparent">
              <button
                type="button"
                onClick={() => handleScroll('right')}
                className="p-1.5 bg-white hover:bg-slate-50 text-slate-700 shadow-md rounded-full border border-slate-200 transition-all cursor-pointer"
                title="Cuộn sang phải"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2 Cột: Bên trái Thông tin hãng, Bên phải Bảng hệ màu */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Cột trái: Khu vực thông tin hãng */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col min-w-0">
          <div className="pb-2.5 mb-4 border-b border-slate-200">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Thông tin thương hiệu
            </h3>
          </div>
          <BrandInfoTab brand={brand} />
        </div>

        {/* Cột phải: Khu vực để bảng hệ màu */}
        <div className="lg:col-span-7 xl:col-span-7 flex flex-col min-w-0 border-t lg:border-t-0 lg:border-l border-slate-200 lg:pl-6 pt-6 lg:pt-0">
          <div className="pb-2.5 mb-4 border-b border-slate-200">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Danh sách hệ màu
            </h3>
          </div>
          <BrandColorsTab brand={brand} />
        </div>
      </div>
    </Modal>
  );
}
