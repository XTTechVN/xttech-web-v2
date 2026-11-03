'use client';

import React from 'react';
import { Button } from '@/components/button';

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

interface CategoryFilterProps {
  categories: CategoryItem[];
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
}) => {
  return (
    <div className="w-full overflow-x-auto py-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
      <div className="flex items-center gap-2 min-w-max pb-1">
        {categories.map((cat) => {
          const isActive = activeCategoryId === cat.id;
          return (
            <Button
              key={cat.id}
              variant={isActive ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onSelectCategory(cat.id)}
              className={`rounded-full px-4 h-8 text-xs sm:text-[13px] font-medium transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer ${
                isActive
                  ? 'shadow-xs font-semibold hover:shadow-md'
                  : 'text-slate-600 hover:text-primary hover:bg-slate-100/90'
              }`}
            >
              {cat.name}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;

