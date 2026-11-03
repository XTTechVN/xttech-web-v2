'use client';

import React from 'react';
import Link from 'next/link';

export interface TrendingItem {
  rank: number;
  id: string;
  title: string;
  slug: string;
}

interface TrendingSidebarProps {
  items: TrendingItem[];
}

export const TrendingSidebar: React.FC<TrendingSidebarProps> = ({ items }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs h-full flex flex-col">
      <h3 className="text-base font-bold text-slate-900 mb-2">
        Đọc nhiều nhất
      </h3>

      <div className="flex flex-col divide-y divide-slate-100 flex-1 justify-around">
        {items.map((item, index) => (
          <div
            key={item.id || index}
            className="flex items-start gap-3 py-3.5 first:pt-2 last:pb-2 group cursor-pointer"
          >
            <span className="text-lg font-bold text-teal-700 w-5 shrink-0 pt-0 leading-tight">
              {item.rank || index + 1}
            </span>
            <Link
              href={`/new/${item.slug}`}
              className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-teal-700 transition-colors leading-snug line-clamp-2"
            >
              {item.title}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingSidebar;

