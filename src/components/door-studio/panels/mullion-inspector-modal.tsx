'use client';

import React, { useMemo, useState } from 'react';
import { Ruler, X } from 'lucide-react';
import { ProfileBar } from '@/types';
import { MullionCutType, MullionInfo, ProfileIdRef, SceneCellNode } from '../studio-types';
import { MullionReferenceContext, computeMullionReferenceContext, formatReferenceValue } from '../utils/mullion-reference-utils';
import { MullionAdvancedTab, MullionBasicTab } from './mullion-inspector';

interface MullionInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  mullion: MullionInfo | null;
  profileBars: ProfileBar[];
  rootCell?: SceneCellNode;
  w?: number;
  h?: number;
  onSave: (params: { dimension: number; profileId?: ProfileIdRef; cutType?: MullionCutType }) => void;
  onDeleteMullion: () => void;
  onLocalTranspose?: (parentId: string, mullionIndex: number) => void;
}

function buildFallbackContext(mullion: MullionInfo): MullionReferenceContext {
  const pairTotal = Math.max(2, formatReferenceValue(mullion.totalDimension));
  const leftDim = Math.max(1, formatReferenceValue(mullion.dimension));
  const minDim = Math.min(Math.floor(pairTotal / 2), Math.min(50, Math.max(20, Math.floor(pairTotal * 0.15))));
  const isSash = mullion.id.includes('-sm-');
  return {
    scopeType: isSash ? 'sash' : 'frame_unit', scopeLabel: isSash ? 'Cánh cửa' : 'Khung bao chính',
    scopeSpan: pairTotal, scopePerpSpan: pairTotal, direction: mullion.direction, isSashMullion: isSash,
    isFlatSashMullion: mullion.id.includes('-sm-bar-'), leftCellStart: 0, rightCellEnd: pairTotal,
    leftDim, rightDim: Math.max(1, formatReferenceValue(pairTotal - leftDim)), pairTotal, minDim,
    currentPos: leftDim, absMinPos: minDim, absMaxPos: formatReferenceValue(pairTotal - minDim),
    targetPerpStart: 0, targetPerpEnd: pairTotal, refMullions: [], defaultMode: 'from_start', defaultRefId: null,
  };
}

interface MullionInspectorContentProps {
  mullion: MullionInfo;
  ctx: MullionReferenceContext;
  profileBars: ProfileBar[];
  onClose: () => void;
  onSave: MullionInspectorModalProps['onSave'];
  onDeleteMullion: () => void;
  onLocalTranspose?: (parentId: string, mullionIndex: number) => void;
}

const MullionInspectorContent: React.FC<MullionInspectorContentProps> = ({
  mullion, ctx, profileBars, onClose, onSave, onDeleteMullion, onLocalTranspose,
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');
  const orientationLabel = mullion.direction === 'horizontal' ? 'đứng' : 'ngang';

  return (
    <div
      className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-[400px] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 select-none"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
          <Ruler size={16} className="text-[#045863] rotate-45" />
          <span>Kích thước khoang ({orientationLabel})</span>
        </div>
        <button type="button" onClick={onClose} className="w-7 h-7 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer">
          <X size={16} />
        </button>
      </div>

      <div className="px-5 py-1.5">
        <div className="flex bg-slate-100/90 p-1 rounded-2xl border border-slate-200/70">
          {(['basic', 'advanced'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === tab ? (tab === 'basic' ? 'bg-white text-orange-600 shadow-xs' : 'bg-white text-teal-700 shadow-xs') : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab === 'basic' ? 'Cơ bản' : 'Nâng cao'}
            </button>
          ))}
        </div>
      </div>

      <div className={activeTab === 'basic' ? 'block' : 'hidden'}>
        <MullionBasicTab mullion={mullion} ctx={ctx} profileBars={profileBars} onSave={onSave} onDeleteMullion={onDeleteMullion} onClose={onClose} />
      </div>
      {activeTab === 'advanced' && (
        <MullionAdvancedTab mullion={mullion} isSashMullion={ctx.isSashMullion} onLocalTranspose={onLocalTranspose} onClose={onClose} />
      )}
    </div>
  );
};

export const MullionInspectorModal: React.FC<MullionInspectorModalProps> = ({
  isOpen, onClose, mullion, profileBars, rootCell, w, h, onSave, onDeleteMullion, onLocalTranspose,
}) => {
  const refContext = useMemo(() => {
    if (!isOpen || !mullion) return null;
    if (rootCell) {
      const computed = computeMullionReferenceContext(rootCell, w ?? rootCell.w, h ?? rootCell.h, mullion);
      if (computed) return computed;
    }
    return buildFallbackContext(mullion);
  }, [isOpen, mullion, rootCell, w, h]);

  if (!isOpen || !mullion || !refContext) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <MullionInspectorContent
        key={`${mullion.id}-${mullion.dimension}-${mullion.cutType ?? ''}-${mullion.profileId ?? ''}`}
        mullion={mullion}
        ctx={refContext}
        profileBars={profileBars}
        onClose={onClose}
        onSave={onSave}
        onDeleteMullion={onDeleteMullion}
        onLocalTranspose={onLocalTranspose}
      />
    </div>
  );
};
