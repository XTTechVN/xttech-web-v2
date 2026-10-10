'use client';

import React from 'react';
import { Sparkles, Move, Upload, BookmarkPlus, Check, Trash2, Loader2 } from 'lucide-react';
import { GlassGrilleMotif } from '../../../studio-types';
import { MOTIF_DEFS, GrilleMotifSvg, MotifDefinition } from '../../grille-motif-svgs';
import { SavedTemplateItem } from '../types';
import { GrilleTemplateMiniPreview } from './grille-template-mini-preview';

interface GrilleRightPanelProps {
  activeRightTab: 'nan' | 'templates';
  setActiveRightTab: (tab: 'nan' | 'templates') => void;
  activeMotifTool: string;
  setActiveMotifTool: (tool: string) => void;
  getMotifDefaultPrice: (motifType: string, fallbackPrice?: number) => number;
  motifs: GlassGrilleMotif[];
  selectedMotifId: string | null;
  setSelectedMotifId: (id: string | null) => void;
  onDeleteSelectedMotif: () => void;
  motifUnitPrice: number;
  templateName: string;
  setTemplateName: (name: string) => void;
  onSaveTemplate: () => void;
  isSavingTemplate: boolean;
  patterns: SavedTemplateItem[];
  isLoadingPatterns: boolean;
  onApplyTemplate: (tpl: SavedTemplateItem) => void;
  onDeleteTemplate: (id: string) => void;
}

export const GrilleRightPanel: React.FC<GrilleRightPanelProps> = ({
  activeRightTab,
  setActiveRightTab,
  activeMotifTool,
  setActiveMotifTool,
  getMotifDefaultPrice,
  motifs,
  selectedMotifId,
  setSelectedMotifId,
  motifUnitPrice,
  templateName,
  setTemplateName,
  onSaveTemplate,
  isSavingTemplate,
  patterns,
  isLoadingPatterns,
  onApplyTemplate,
  onDeleteTemplate,
}) => {
  return (
    <div className="w-full lg:w-[310px] shrink-0 border-l border-gray-200/80 bg-white flex flex-col overflow-hidden">
      {/* 2 Tabs Header */}
      <div className="flex border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveRightTab('nan')}
          className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-colors cursor-pointer ${
            activeRightTab === 'nan'
              ? 'border-amber-500 text-amber-800 bg-amber-50/50'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Thư viện hoa văn
        </button>
        <button
          type="button"
          onClick={() => setActiveRightTab('templates')}
          className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-colors cursor-pointer ${
            activeRightTab === 'templates'
              ? 'border-amber-500 text-amber-800 bg-amber-50/50'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Mẫu nan lưu ({patterns.length})
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeRightTab === 'nan' ? (
          <>
            {/* Hướng dẫn kéo thả */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                <Sparkles size={14} className="text-amber-600" />
                <span>Kéo thả để gắn hoặc thay thế</span>
              </div>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                Kéo trực tiếp hoa văn bên dưới thả vào giao điểm trên kính, hoặc bấm chọn hoa văn rồi click vào vị trí giao điểm.
              </p>
            </div>

            {/* Danh sách các con hoa văn mẫu */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-gray-800">Chọn loại hoa văn:</div>
              <div className="space-y-2">
                {MOTIF_DEFS.map((def: MotifDefinition) => {
                  const isSelected = activeMotifTool === def.id;
                  const itemPrice = getMotifDefaultPrice(def.id, 150000);

                  return (
                    <div
                      key={def.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', def.id);
                        e.dataTransfer.effectAllowed = 'copy';
                        setActiveMotifTool(def.id);
                      }}
                      onClick={() => setActiveMotifTool(def.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-grab active:cursor-grabbing flex items-center gap-3 ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/60 shadow-xs ring-1 ring-amber-400'
                          : 'border-gray-200 hover:border-amber-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg bg-white border border-gray-100 flex items-center justify-center p-1 shrink-0 drop-shadow-2xs">
                        <GrilleMotifSvg motifType={def.id} width={38} height={38} color="#D4AF37" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs text-gray-900 truncate">{def.name}</div>
                        <div className="text-[10px] text-gray-500 font-mono">
                          {def.width} × {def.height} mm
                        </div>
                        <div className="text-[11px] font-bold text-amber-700 font-mono mt-0.5">
                          {itemPrice.toLocaleString('vi-VN')} đ/con
                        </div>
                      </div>
                      <div className="text-gray-400 hover:text-amber-600">
                        <Move size={15} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Danh sách các hoa văn đã gắn trên kính */}
            <div className="space-y-2 pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">Hoa văn trên kính ({motifs.length})</span>
                {motifs.length > 0 && (
                  <span className="text-[10.5px] font-mono font-bold text-amber-800">
                    {motifs.reduce((sum, m) => sum + (m.price || motifUnitPrice), 0).toLocaleString('vi-VN')} đ
                  </span>
                )}
              </div>

              {motifs.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-gray-200 text-center text-gray-400 text-xs">
                  Chưa gắn hoa văn nào trên nan kính
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                  {motifs.map((m: GlassGrilleMotif, idx: number) => {
                    const isSelected = selectedMotifId === m.id;
                    const cNum = (m.gridCol ?? 0) + 1;
                    const rNum = (m.gridRow ?? 0) + 1;

                    return (
                      <div
                        key={m.id}
                        onClick={() => setSelectedMotifId(m.id)}
                        className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'border-amber-400 bg-amber-50/90 font-bold text-amber-950 shadow-2xs'
                            : 'border-gray-200 bg-white hover:bg-slate-50 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[9.5px] font-bold shrink-0">
                            {idx + 1}
                          </span>
                          <div className="truncate">
                            <div className="truncate">{m.name || 'Hoa văn'}</div>
                            <div className="text-[10px] text-gray-400 font-mono">
                              Giao điểm ({cNum}, {rNum}) · {(m.price || motifUnitPrice).toLocaleString('vi-VN')} đ
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMotifId(m.id);
                          }}
                          className="text-gray-400 hover:text-amber-600 p-1 cursor-pointer"
                        >
                          Sửa
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          /* TAB TEMPLATES: MẪU LƯU */
          <div className="space-y-4">
            {/* Lưu mẫu mới */}
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
              <div className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                <BookmarkPlus size={14} className="text-amber-600" />
                <span>Lưu cấu hình nan hiện tại</span>
              </div>
              <div className="space-y-1.5">
                <input
                  type="text"
                  placeholder="Nhập tên mẫu nan..."
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs bg-white rounded-lg border border-gray-300 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={onSaveTemplate}
                  disabled={isSavingTemplate}
                  className="w-full py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSavingTemplate ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                  <span>Lưu vào CSDL</span>
                </button>
              </div>
            </div>

            {/* Danh sách templates đã lưu */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-gray-800">Thư viện mẫu nan ({patterns.length}):</div>
              {isLoadingPatterns ? (
                <div className="py-6 flex items-center justify-center text-gray-400 text-xs">
                  <Loader2 size={16} className="animate-spin mr-2" />
                  <span>Đang tải danh sách mẫu...</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  {patterns.map((tpl) => (
                    <div
                      key={tpl.id}
                      className="p-3 rounded-xl border border-gray-200 hover:border-amber-300 bg-white hover:bg-amber-50/20 transition-all flex items-start gap-3 group"
                    >
                      {/* Mini preview thumbnail */}
                      <div className="w-11 h-15 rounded-md bg-slate-50 border border-gray-200 shrink-0 overflow-hidden flex items-center justify-center p-0.5">
                        <GrilleTemplateMiniPreview config={tpl.config} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-gray-900 truncate">{tpl.name}</span>
                          {tpl.isDefault && (
                            <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-amber-100 text-amber-800">
                              Hệ thống
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">{tpl.description}</p>

                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => onApplyTemplate(tpl)}
                            className="px-2.5 py-1 text-[11px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Check size={12} />
                            <span>Áp dụng</span>
                          </button>
                          {!tpl.isDefault && (
                            <button
                              type="button"
                              onClick={() => onDeleteTemplate(tpl.id)}
                              className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                              title="Xóa mẫu này"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
