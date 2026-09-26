'use client';

import React, { useState, useMemo, useEffect } from 'react';
import type { Brand } from '@/types';
import { BASE_MINIO_URL } from '@/config';

interface ProfileBarSidebarProps {
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

  useEffect(() => {
    setHasError(false);
  }, [logoPath, updatedAt]);

  const logoUrl = useMemo(() => {
    if (!logoPath) return null;
    const base = logoPath.startsWith('http')
      ? logoPath
      : `${BASE_MINIO_URL}/${logoPath.startsWith('/') ? logoPath.slice(1) : logoPath}`;

    const timestamp = updatedAt ? new Date(updatedAt).getTime() : Date.now();
    const separator = base.includes('?') ? '&' : '?';
    return `${base}${separator}t=${timestamp}`;
  }, [logoPath, updatedAt]);

  if (logoUrl && !hasError) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className="w-full h-full object-contain p-1"
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <span className="text-xs font-bold text-primary">
      {code ? code.slice(0, 2).toUpperCase() : name.slice(0, 2).toUpperCase()}
    </span>
  );
}

export function ProfileBarSidebar({
  brands,
  selectedBrandId,
  onSelectBrand,
}: ProfileBarSidebarProps) {
  // Sắp xếp danh sách hãng A-Z
  const sortedBrands = useMemo(() => {
    return [...brands].sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }));
  }, [brands]);

  return (
    <div className="w-full md:w-20 lg:w-22 shrink-0 bg-white border-b md:border-b-0 md:border-r border-slate-200 rounded-none py-2.5 px-3 md:py-3 md:px-1.5 flex flex-row md:flex-col items-center gap-3 md:gap-2.5 shadow-none sticky top-0 z-10 md:h-[calc(100vh-105px)] overflow-x-auto md:overflow-x-hidden md:overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {/* Danh sách từng Hãng dạng Hình Vuông */}
      <div className="flex flex-row md:flex-col items-center gap-3 md:gap-2.5 shrink-0 md:w-full">
        {sortedBrands.map((b) => {
          const isSelected = selectedBrandId === b.id;

          return (
            <button
              key={b.id}
              type="button"
              onClick={() => onSelectBrand(b.id)}
              className="group flex flex-col items-center gap-1 cursor-pointer shrink-0 md:w-full"
              title={`${b.name} (${b.code})`}
            >
              <div
                className={`w-12 h-12 md:w-14 md:h-14 rounded-md bg-white flex items-center justify-center overflow-hidden transition-all ${
                  isSelected
                    ? 'border-2 border-primary bg-primary/5'
                    : 'border border-slate-200 hover:border-slate-400'
                }`}
              >
                <BrandSquareLogo
                  logoPath={b.logoPath}
                  name={b.name}
                  code={b.code}
                  updatedAt={b.updatedAt}
                />
              </div>
              <span
                className={`text-[10px] text-center truncate w-14 md:w-16 leading-tight ${
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
