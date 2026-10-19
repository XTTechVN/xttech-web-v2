import React from 'react';

interface FloatingSelectionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
}

export const FloatingSelectionBar: React.FC<FloatingSelectionBarProps> = ({
  selectedCount,
  onClearSelection,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur text-white px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-3 border border-slate-700/80 animate-in fade-in slide-in-from-bottom-3 duration-150 text-xs">
      <span className="font-medium flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        Đã chọn <strong>{selectedCount}</strong> mục
      </span>
      <div className="h-3 w-px bg-slate-700" />
      <button
        type="button"
        onClick={onClearSelection}
        className="text-slate-300 hover:text-white transition-colors cursor-pointer text-xs font-semibold"
      >
        Bỏ chọn (Esc)
      </button>
    </div>
  );
};
