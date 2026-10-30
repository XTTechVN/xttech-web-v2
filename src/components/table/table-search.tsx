'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks';
import { cn } from '@/utils/cn';

import type { ITableSearchProps } from './types';

const SEARCH_DEBOUNCE_MS = 500;
const WRAPPER_CLASSNAME = '';
const INPUT_CLASSNAME =
  'w-full bg-white border text-gray-500 border-gray-300 rounded-lg px-3 text-sm md:text-sm font-medium focus:outline-none focus:border-border-focus transition-all h-9 placeholder:text-gray-400';

export function TableSearch({ placeholder, value, onChange, className }: ITableSearchProps) {
  const [search, setSearch] = useState(value || '');

  const searchDebounce = useDebounce(search, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    // Trim khoảng trắng thừa (gõ tay dễ dư dấu cách cuối làm backend không khớp)
    const trimmedSearch = searchDebounce.trim();
    // Chỉ gọi onChange khi giá trị debounce thực sự khác với giá trị hiện tại từ bên ngoài
    if (onChange && trimmedSearch !== (value || '')) {
      onChange(trimmedSearch);
    }
  }, [searchDebounce]);

  // Đồng bộ giá trị tìm kiếm từ component cha (ví dụ khi nhấn Reset) ngay trong lúc render.
  // Bỏ qua khi giá trị cha chỉ là bản đã trim của chính nội dung đang gõ, tránh xóa dấu cách người dùng vừa nhập.
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    if ((value || '') !== search.trim()) {
      setSearch(value || '');
    }
  }

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
