'use client';

import React from 'react';

export function BrandGridSkeleton({ count = 16 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white border border-slate-200 rounded-lg p-2.5 flex flex-col gap-2.5 animate-pulse"
        >
          <div className="aspect-square bg-slate-100 rounded-md w-full" />
          <div className="h-3.5 bg-slate-100 rounded w-3/4" />
          <div className="h-3 bg-slate-100 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}
