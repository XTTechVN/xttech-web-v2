'use client';

import React, { useState } from 'react';
import {
  FrameShape,
  FrameShapeCategory,
  FRAME_SHAPE_ITEMS,
} from '../studio-types';

interface FrameShapePickerProps {
  currentShape: FrameShape;
  onSelectShape: (shape: FrameShape) => void;
}

const CATEGORIES: Array<{ id: FrameShapeCategory; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'basic', label: 'Cơ bản' },
  { id: 'arch', label: 'Vòm' },
  { id: 'corner', label: 'Bo góc' },
  { id: 'special_arch', label: 'Vòm đặc biệt' },
];

export const FrameShapePicker: React.FC<FrameShapePickerProps> = ({
  currentShape,
  onSelectShape,
}) => {
  const [activeCategory, setActiveCategory] = useState<FrameShapeCategory>('all');

  const filteredItems = FRAME_SHAPE_ITEMS.filter(
    (item) => activeCategory === 'all' || item.category === activeCategory
  );

  return (
    <div className="flex flex-col space-y-3">
      {/* Category Pills */}
      <div className="flex flex-wrap gap-1.5 pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-full transition-all cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200/60'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of Shapes */}
      <div className="grid grid-cols-3 gap-2 max-h-[320px] overflow-y-auto pr-1">
        {filteredItems.map((item) => {
          const isSelected = currentShape === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectShape(item.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-blue-500 bg-blue-50/50 shadow-xs ring-2 ring-blue-500/20'
                  : 'border-gray-200/80 bg-white hover:border-gray-300 hover:bg-gray-50/50'
              }`}
            >
              {/* Mini SVG Frame Illustration */}
              <div className="w-10 h-10 flex items-center justify-center mb-1.5">
                <svg viewBox="0 0 40 40" className="w-8 h-8">
                  <path
                    d={item.svgPath}
                    fill="#e0f2fe"
                    stroke="#475569"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-[10.5px] font-medium text-gray-700 text-center leading-tight line-clamp-2">
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
