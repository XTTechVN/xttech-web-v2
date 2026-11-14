'use client';

import React from 'react';
import { BarChart3, PenTool, Redo2, Sliders, Undo2 } from 'lucide-react';

interface DrawMobileToolbarProps {
  sketchMode: boolean;
  historyIdx: number;
  historyLength: number;
  selectedCellId: string | null;
  mobileDrawer: 'toolbox' | 'inspector' | 'bom' | null;
  onUndo: () => void;
  onRedo: () => void;
  onToggleDrawer: (drawer: 'toolbox' | 'inspector' | 'bom') => void;
}

export function DrawMobileToolbar({
  sketchMode,
  historyIdx,
  historyLength,
  selectedCellId,
  mobileDrawer,
  onUndo,
  onRedo,
  onToggleDrawer,
}: DrawMobileToolbarProps) {
  return (
    <div className="lg:hidden absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 p-1 bg-slate-900/90 backdrop-blur-md text-white rounded-full shadow-2xl border border-slate-700/80 max-w-[94vw] select-none">
      <button
        type="button"
        onClick={onUndo}
        disabled={historyIdx <= 0}
        className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all text-slate-200 cursor-pointer"
        title="Hoàn tác"
      >
        <Undo2 size={13} />
      </button>
      <button
        type="button"
        onClick={onRedo}
        disabled={historyIdx >= historyLength - 1}
        className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all text-slate-200 cursor-pointer"
        title="Làm lại"
      >
        <Redo2 size={13} />
      </button>
      <div className="w-px h-4 bg-slate-700/90 mx-0.5" />
      <button
        type="button"
        onClick={() => onToggleDrawer('toolbox')}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
          mobileDrawer === 'toolbox'
            ? 'bg-primary text-white shadow-xs'
            : 'text-slate-300 hover:text-white hover:bg-white/10'
        }`}
      >
        <PenTool size={13} />
        <span>Vẽ cửa</span>
      </button>
      <button
        type="button"
        onClick={() => onToggleDrawer('inspector')}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer relative ${
          mobileDrawer === 'inspector'
            ? 'bg-primary text-white shadow-xs'
            : 'text-slate-300 hover:text-white hover:bg-white/10'
        }`}
      >
        <Sliders size={13} />
        <span>Ô kính</span>
        {selectedCellId && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
      </button>
      {!sketchMode && (
        <button
          type="button"
          onClick={() => onToggleDrawer('bom')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
            mobileDrawer === 'bom'
              ? 'bg-primary text-white shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <BarChart3 size={13} />
          <span>BOM</span>
        </button>
      )}
    </div>
  );
}
