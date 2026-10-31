'use client';

import React, { useState, useMemo } from 'react';
import type { Brand } from '@/types';
import { BASE_MINIO_URL } from '@/config';

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
    <span className="text-xl md:text-2xl font-bold text-primary">
      {code ? code.slice(0, 2).toUpperCase() : name.slice(0, 2).toUpperCase()}
    </span>
  );
}

export function BrandSidebar({
  brands,
  selectedBrandId,
  onSelectBrand,
}: BrandSidebarProps) {
  // Sắp xếp danh sách hãng A-Z
  const sortedBrands = useMemo(() => {
    return [...brands].sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }));
  }, [brands]);

  return (
    <div className="w-full md:w-40 lg:w-44 shrink-0 bg-white border-b md:border-b-0 md:border-r border-slate-200 rounded-none py-3 px-4 md:py-4 md:px-3 flex flex-row md:flex-col items-center gap-4 md:gap-4 shadow-none sticky top-0 z-10 md:h-[calc(100vh-105px)] overflow-x-auto md:overflow-x-hidden md:overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {/* Danh sách từng Hãng dạng Hình Vuông */}
      <div className="flex flex-row md:flex-col items-center gap-4 md:gap-4 shrink-0 md:w-full">
        {sortedBrands.map((b) => {
          const isSelected = selectedBrandId === b.id;

          return (
            <button
              key={b.id}
              type="button"
              onClick={() => onSelectBrand(b.id)}
              className="group flex flex-col items-center gap-1.5 cursor-pointer shrink-0 md:w-full"
              title={`${b.name} (${b.code})`}
            >
              <div
                className={`w-20 h-20 md:w-28 md:h-28 rounded-xl bg-white flex items-center justify-center overflow-hidden transition-all ${
                  isSelected
                    ? 'border-2 border-primary bg-primary/5'
                    : 'border border-slate-200 hover:border-slate-400'
                }`}
              >
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
            </button>
          );
        })}
      </div>
    </div>
  );
}

