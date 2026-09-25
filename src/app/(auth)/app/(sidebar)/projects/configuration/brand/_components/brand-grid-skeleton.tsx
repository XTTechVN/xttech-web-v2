'use client';

import React from 'react';

export function BrandGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-3 animate-pulse"
        >
          <div className="aspect-square bg-slate-100 rounded-lg w-full" />
          <div className="h-4 bg-slate-100 rounded w-3/4" />
          <div className="h-3 bg-slate-100 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}
