'use client';

import React from 'react';

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
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`text-xs sm:text-[13px] font-medium px-4 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-transparent'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;

