'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, Check } from 'lucide-react';
import { WarehouseItem } from '@/types';
import { WAREHOUSE_ITEM_TYPE_MAP } from '@/config';

interface ReceiptItemComboboxProps {
  selectedItemId?: number;
  selectedItemCode?: string;
  selectedItemName?: string;
  itemsList: WarehouseItem[];
  onSelect: (item: WarehouseItem) => void;
  placeholder?: string;
}

export function ReceiptItemCombobox({
  selectedItemId,
  selectedItemCode,
  selectedItemName,
  itemsList,
  onSelect,
  placeholder = 'Gõ tên hoặc mã VT để tìm...',
}: ReceiptItemComboboxProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedItem = itemsList.find((i) => i.id === selectedItemId);
  const displayLabel = selectedItem
    ? `[${selectedItem.itemCode}] ${selectedItem.itemName}`
    : selectedItemCode
    ? `[${selectedItemCode}] ${selectedItemName || ''}`.trim()
    : '';

  // Lọc thông minh theo mã hoặc tên
  const filtered = itemsList
    .filter((item) => {
      if (!query.trim()) return true;
      const q = query.toLowerCase().trim();
      return (
        item.itemCode.toLowerCase().includes(q) ||
        item.itemName.toLowerCase().includes(q)
      );
    })
    .slice(0, 10);

  // Định vị menu nổi qua Portal
  const updatePosition = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropdownHeight = 240;
    const openUpward = spaceBelow < dropdownHeight && rect.top > dropdownHeight;
    setDropdownPos({
      top: openUpward ? rect.top - dropdownHeight - 4 : rect.bottom + 4,
      left: rect.left,
      width: Math.max(rect.width, 320),
    });
  };

  const openDropdown = () => {
    updatePosition();
    setIsOpen(true);
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }
  }, [isOpen]);

  // Đóng khi click ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: WarehouseItem) => {
    onSelect(item);
    setQuery('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        openDropdown();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1 < filtered.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[highlightIndex]) {
        handleSelect(filtered[highlightIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const menuElement = isOpen && dropdownPos.width > 0 && (
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: dropdownPos.top,
        left: dropdownPos.left,
        width: dropdownPos.width,
        zIndex: 99999,
      }}
      className="bg-white border border-slate-200 rounded-lg shadow-2xl max-h-60 overflow-y-auto divide-y divide-slate-100 animate-in fade-in duration-75"
    >
      {filtered.length === 0 ? (
        <div className="p-3 text-center text-slate-400 italic">
          Không tìm thấy vật tư khớp với &quot;{query}&quot;
        </div>
      ) : (
        filtered.map((item, idx) => {
          const isSelected = item.id === selectedItemId;
          const isHighlight = idx === highlightIndex;
          const typeLabel = WAREHOUSE_ITEM_TYPE_MAP[item.itemType] || item.itemType;
          return (
            <div
              key={item.id}
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setHighlightIndex(idx)}
              className={`p-2.5 cursor-pointer transition-colors flex items-start justify-between gap-2 ${
                isHighlight ? 'bg-indigo-50/80 text-indigo-950' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-indigo-600 uppercase text-[11px]">
                    [{item.itemCode}]
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                    {typeLabel}
                  </span>
                </div>
                <p className="font-medium text-slate-800 text-xs truncate mt-0.5">
                  {item.itemName}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                  <span>ĐVT: <strong className="text-slate-700">{item.unit}</strong></span>
                  <span>Tồn: <strong className="text-emerald-600">{item.currentStock}</strong></span>
                  {item.costPrice > 0 && (
                    <span>Giá: <strong>{item.costPrice.toLocaleString('vi-VN')}đ</strong></span>
                  )}
                </div>
              </div>
              {isSelected && <Check size={14} className="text-indigo-600 shrink-0 mt-1" />}
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <div ref={containerRef} className="relative w-full text-xs">
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={query || (isOpen ? '' : displayLabel)}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) openDropdown();
            setHighlightIndex(0);
          }}
          onFocus={openDropdown}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full text-xs pl-7 pr-6 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500 bg-white placeholder:text-slate-400"
        />
        <Search size={13} className="absolute left-2 text-slate-400 pointer-events-none" />
        <button
          type="button"
          onClick={() => {
            if (isOpen) {
              setIsOpen(false);
            } else {
              openDropdown();
            }
            inputRef.current?.focus();
          }}
          className="absolute right-1 text-slate-400 hover:text-slate-600 p-1"
        >
          <ChevronDown size={13} />
        </button>
      </div>

      {mounted && createPortal(menuElement, document.body)}
    </div>
  );
}
