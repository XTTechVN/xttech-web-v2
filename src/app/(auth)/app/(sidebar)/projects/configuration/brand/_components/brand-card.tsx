'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Pencil, Trash2, ExternalLink } from 'lucide-react';
import type { Brand } from '@/types';
import { BASE_MINIO_URL } from '@/config';

interface BrandCardProps {
  brand: Brand;
  onClick?: (brand: Brand) => void;
  onEdit: (brand: Brand) => void;
  onDelete: (brand: Brand) => void;
}

function BrandLogo({
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
        className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-slate-400 gap-1">
      <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-sm text-primary shadow-2xs">
        {code ? code.slice(0, 2).toUpperCase() : 'XT'}
      </div>
    </div>
  );
}

export function BrandCard({ brand, onClick, onEdit, onDelete }: BrandCardProps) {
  return (
    <div
      onClick={() => onClick?.(brand)}
      className="group bg-white border border-slate-200 hover:border-primary hover:shadow-md rounded-lg p-2.5 flex flex-col justify-between transition-all duration-200 relative overflow-hidden cursor-pointer select-none"
    >
      {/* Card Header: Brand Logo & Status indicator */}
      <div>
        <div className="relative aspect-square w-full bg-slate-50/80 border border-slate-100 rounded-md flex items-center justify-center overflow-hidden mb-2">
          <BrandLogo
            logoPath={brand.logoPath}
            name={brand.name}
            code={brand.code}
            updatedAt={brand.updatedAt}
          />

          {/* Active dot badge */}
          <span
            className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${
              brand.isActive ? 'bg-emerald-500 ring-2 ring-emerald-50' : 'bg-rose-400 ring-2 ring-rose-50'
            }`}
            title={brand.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
          />
        </div>

        {/* Brand Name & Code */}
        <div className="flex flex-col gap-0.5">
          <h3
            className="font-bold text-xs text-slate-900 truncate group-hover:text-primary transition-colors"
            title={brand.name}
          >
            {brand.name}
          </h3>

          <div className="flex items-center gap-1 flex-wrap mt-0.5">
            <span className="font-mono text-[10px] font-semibold text-primary bg-primary/10 px-1 py-0.2 rounded">
              {brand.code}
            </span>
            {brand.originCountry && (
              <span className="text-[10px] text-slate-500 truncate" title={`Xuất xứ: ${brand.originCountry}`}>
                • {brand.originCountry}
              </span>
            )}
          </div>

          {Boolean(brand.barLengthMm) && (
            <span className="text-[10px] text-slate-400 mt-0.5 truncate">
              Cây: <strong className="text-slate-600 font-medium">{brand.barLengthMm}mm</strong>
            </span>
          )}
        </div>
      </div>

      {/* Card Footer: Action buttons & link */}
      <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
        <div>
          {brand.website ? (
            <a
              href={brand.website}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1 text-slate-400 hover:text-primary transition inline-flex"
              title={brand.website}
            >
              <ExternalLink size={12} />
            </a>
          ) : (
            <span className="text-[9px] text-slate-300 font-mono">#{brand.id}</span>
          )}
        </div>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(brand);
            }}
            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
            title="Xóa thương hiệu"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
