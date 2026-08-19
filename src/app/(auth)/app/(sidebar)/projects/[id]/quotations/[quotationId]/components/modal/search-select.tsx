import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, Check } from 'lucide-react';

interface SearchSelectProps<T> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: T[];
  selectedValue?: string | number;
  onSelect: (item: T) => void;
  searchKeys?: (keyof T)[];
  renderItem?: (item: T) => React.ReactNode;
  triggerRef: React.RefObject<HTMLDivElement | null>;
}

export function SearchSelect<T extends { id: string | number; name?: string | null; code?: string | null }>({
  isOpen,
  onClose,
  items,
  selectedValue,
  onSelect,
  searchKeys = ['name', 'code'],
  renderItem,
  triggerRef,
}: SearchSelectProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const term = searchTerm.toLowerCase();
    return items.filter((item) => {
      return searchKeys.some((key) => {
        const val = item[key];
        if (typeof val === 'string') {
          return val.toLowerCase().includes(term);
        }
        return false;
      });
    });
  }, [items, searchTerm, searchKeys]);

  // Tính toán tọa độ và kích thước cho dropdown panel
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const updateCoords = () => {
        if (triggerRef.current) {
          const rect = triggerRef.current.getBoundingClientRect();
          setCoords({
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
          });
        }
      };
      
      updateCoords();
      // Chạy thêm 1 frame ngắn để định vị thật chắc chắn
      const timer = setTimeout(updateCoords, 0);

      window.addEventListener('resize', updateCoords);
      window.addEventListener('scroll', updateCoords, true);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updateCoords);
        window.removeEventListener('scroll', updateCoords, true);
      };
    } else {
      setCoords(null);
    }
  }, [isOpen, triggerRef]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        const panel = document.getElementById('search-select-dropdown-panel');
        if (panel && !panel.contains(e.target as Node)) {
          onClose();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, triggerRef]);

  // Khi đóng dropdown thì clear search
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  if (!isOpen || !coords) return null;

  return createPortal(
    <div
      id="search-select-dropdown-panel"
      style={{
        position: 'absolute',
        top: coords.top + 4,
        left: coords.left,
        width: Math.max(coords.width, 280),
        zIndex: 99999,
      }}
      className="bg-white rounded-lg shadow-xl border border-slate-200 flex flex-col max-h-[300px] text-slate-800 focus:outline-none overflow-hidden animate-in fade-in slide-in-from-top-1 duration-100"
    >
      {/* Search Input */}
      <div className="p-2 border-b border-slate-100/60 shrink-0">
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-6 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-primary focus:bg-white transition-all text-slate-800 font-normal"
            autoFocus
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 bg-slate-200/50 hover:bg-slate-200 transition-all cursor-pointer border-0"
            >
              <X size={10} />
            </button>
          )}
        </div>
      </div>

      {/* Content list */}
      <div className="flex-1 overflow-y-auto p-1 space-y-0.5 min-h-0 text-[11px]">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => {
            const isSelected = item.id === selectedValue;
            return (
              <div
                key={item.id}
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between gap-3 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary/5 text-primary font-medium'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-normal'
                }`}
              >
                <div className="flex-1 min-w-0">
                  {renderItem ? (
                    renderItem(item)
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate pr-2">
                        {item.name || '—'}
                      </span>
                      {item.code && (
                        <span className={`text-[9px] uppercase font-medium px-1.5 py-0.5 rounded shrink-0 ${
                          isSelected 
                            ? 'bg-primary/10 text-primary border border-primary/20' 
                            : 'bg-slate-100 text-slate-500 border border-slate-200/50'
                        }`}>
                          {item.code}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {isSelected && <Check size={12} className="text-primary shrink-0" />}
              </div>
            );
          })
        ) : (
          <div className="text-center py-6 text-slate-400 text-[11px] italic">
            Không tìm thấy kết quả phù hợp
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
