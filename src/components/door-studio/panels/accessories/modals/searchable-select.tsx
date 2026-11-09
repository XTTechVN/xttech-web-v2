'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, X } from 'lucide-react';

export interface SearchableSelectOption {
  value: number | string;
  label: string;
  name?: string;
  code?: string;
  subLabel?: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: number | string;
  onChange: (value: number | string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Chọn...',
  className = '',
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [query, setQuery] = useState('');
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(() => options.find((o) => o.value === value), [options, value]);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: 'fixed',
      top: rect.bottom + 4,
      left: rect.left,
      width: Math.max(rect.width, 360),
      zIndex: 9999,
    });
  };

  const updateTooltipPosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setTooltipStyle({
      position: 'fixed',
      bottom: window.innerHeight - rect.top + 6,
      left: rect.left,
      maxWidth: Math.max(rect.width, 380),
      zIndex: 10000,
    });
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handler = () => updatePosition();
    window.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', handler);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [isOpen]);

  const handleOpen = () => {
    setIsHovered(false);
    updatePosition();
    setIsOpen((prev) => !prev);
  };

  const handleMouseEnter = () => {
    if (!selected || isOpen) return;
    updateTooltipPosition();
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title={selected ? selected.label : undefined}
        className="w-full h-9 px-2.5 border border-gray-200 rounded-md text-xs bg-white focus:outline-none focus:border-primary text-gray-800 flex items-center justify-between gap-1 hover:border-primary/50 transition cursor-pointer"
      >
        <span className="truncate text-left flex-1">
          {selected ? selected.label : <span className="text-gray-400">{placeholder}</span>}
        </span>
        <ChevronDown
          size={13}
          className={`shrink-0 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isHovered &&
        !isOpen &&
        selected &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            style={tooltipStyle}
            className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl pointer-events-none border border-slate-700 leading-relaxed"
          >
            {selected.name ? (
              <div className="flex flex-col gap-1">
                <div className="font-semibold text-white break-words">{selected.name}</div>
                <div className="flex items-center flex-wrap gap-2 text-[11px] text-slate-300">
                  {selected.code && (
                    <span>
                      Mã: <strong className="font-mono text-amber-300">{selected.code}</strong>
                    </span>
                  )}
                  {selected.subLabel && (
                    <span>
                      Đơn giá: <strong className="text-emerald-300">{selected.subLabel}</strong>
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="font-medium break-words">{selected.label}</div>
            )}
          </div>,
          document.body,
        )}

      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={dropdownRef}
            style={dropdownStyle}
            className="bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden"
          >
            <div className="flex items-center gap-1.5 px-2.5 py-2 border-b border-slate-100">
              <Search size={12} className="text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm phụ kiện theo tên hoặc mã..."
                className="flex-1 text-xs outline-none placeholder:text-slate-400 text-slate-800 bg-transparent"
              />
              {query && (
                <button type="button" onClick={() => setQuery('')}>
                  <X size={11} className="text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>

            <div className="max-h-56 overflow-y-auto divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-3">Không tìm thấy</p>
              ) : (
                filtered.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    title={opt.label}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setQuery('');
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition-colors cursor-pointer leading-snug break-words ${
                      opt.value === value ? 'bg-primary/5 text-primary font-semibold' : 'text-slate-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
