'use client';

import { useState, useEffect } from 'react';
import useDebounce from '@/hooks/useDebounce';
import { cn } from '@/utils/cn';

import type { ITableSearchProps } from './types';

const WRAPPER_CLASSNAME = '';
const INPUT_CLASSNAME =
  'w-full bg-white border text-gray-500 border-gray-300 rounded-lg px-3 text-sm md:text-sm font-medium focus:outline-none focus:border-border-focus transition-all h-9 placeholder:text-gray-400';

export function TableSearch({ placeholder, value, onChange, className }: ITableSearchProps) {
  const [search, setSearch] = useState(value || '');

  const searchDebounce = useDebounce(search, 300);

  useEffect(() => {
    if (onChange) {
      onChange(searchDebounce);
    }
  }, [searchDebounce]);

  // Đồng bộ giá trị tìm kiếm từ component cha (ví dụ khi nhấn Reset)
  useEffect(() => {
    setSearch(value || '');
  }, [value]);

  // Tự động chuyển các class độ rộng cố định (ví dụ: w-80) thành w-full trên mobile để tránh tràn màn hình
  const sanitizedClassName = className
    ? className.replace(/\bw-\d+\b/g, (match) => `w-full md:${match}`)
    : '';

  return (
    <div className={cn(WRAPPER_CLASSNAME, 'w-full md:w-auto')}>
      <input
        type="text"
        className={cn(INPUT_CLASSNAME, sanitizedClassName)}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
