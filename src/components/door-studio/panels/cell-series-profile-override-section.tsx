'use client';

import React, { useMemo, useState } from 'react';
import { DoorSeries, ProfileBar } from '@/types';
import { SceneCellNode, FrameConfig, SashConfig, FrameCornerJoint, SashCornerJoint } from '../studio-types';
import { EnclosingFrameUnitInfo } from '../utils/door-tree-utils';
import { Select } from '@/components/select';
import { Layers, RotateCcw, ChevronDown, ChevronRight, Box } from 'lucide-react';
import { parseStudioProfileId } from '../utils/profile-combine-utils';

interface CellSeriesProfileOverrideSectionProps {
  selectedCell: SceneCellNode;
  onUpdateCell: (updates: Partial<SceneCellNode>) => void;
  frameUnitInfo?: EnclosingFrameUnitInfo | null;
  onUpdateFrameUnit?: (updates: Partial<SceneCellNode>) => void;
  globalSeriesId?: number;
  availableSeries?: DoorSeries[];
  allBrandProfiles?: ProfileBar[];
  frameConfig?: FrameConfig;
  sashConfig?: SashConfig;
}

const frameJointOptions = [
  { value: '', label: 'Mặc định theo cửa' },
  { value: '45', label: 'Cắt vát 45° (Góc chéo)' },
  { value: '90_vert', label: 'Ghép 90° — Cây đứng thông suốt' },
  { value: '90_horiz', label: 'Ghép 90° — Cây ngang thông suốt' },
];

const sashJointOptions = [
  { value: '', label: 'Mặc định theo cửa' },
  { value: '45', label: 'Cắt vát 45° (Góc chéo)' },
  { value: '90_vert', label: 'Ghép 90° — Đứng thông suốt' },
  { value: '90_horiz', label: 'Ghép 90° — Ngang thông suốt' },
];

const unitBottomOptions = [
  { value: 'inherit', label: 'Theo cấu hình cửa chung' },
  { value: 'open', label: 'Hở chân toàn khối khung này' },
  { value: 'closed', label: 'Kín đáy khung bao (có thanh dưới)' },
];

function normalizeJointSelectValue(raw?: string | null): string {
  if (!raw) return '';
  if (raw === 'miter_45') return '45';
  if (raw === 'butt_vertical') return '90_vert';
  if (raw === 'butt_horizontal') return '90_horiz';
  return raw;
}

function filterProfilesForSeries(allProfiles: ProfileBar[], seriesId: number | undefined, barType: string): ProfileBar[] {
  const targetType = barType.toUpperCase();
  const byType = allProfiles.filter((p) => (p.barType || '').toUpperCase() === targetType);
  if (!seriesId) return byType;
  const matched = byType.filter((p) => p.seriesId === seriesId);
  return matched.length > 0 ? matched : byType;
}

function buildProfileSelectOptions(profiles: ProfileBar[], defaultLabel = 'Mặc định theo hệ / cửa') {
  return [
    { value: '', label: defaultLabel },
    ...profiles.map((p) => ({ value: String(p.id), label: `${p.code} — ${p.name} (${p.sectionHeightMm ?? 0}mm)` })),
  ];
}

export const CellSeriesProfileOverrideSection: React.FC<CellSeriesProfileOverrideSectionProps> = ({
  selectedCell,
  onUpdateCell,
  frameUnitInfo,
  onUpdateFrameUnit,
  globalSeriesId,
  availableSeries = [],
  allBrandProfiles = [],
}) => {
  const [showUnitAdvanced, setShowUnitAdvanced] = useState(false);
  const [showLeafAdvanced, setShowLeafAdvanced] = useState(false);

  const unitNode = frameUnitInfo?.unitNode ?? selectedCell;
  const isCoupledUnit = Boolean(frameUnitInfo?.isCoupledSubFrame && onUpdateFrameUnit);
  const effectiveUnitSeriesId = unitNode.seriesIdOverride ?? globalSeriesId;
  const effectiveLeafSeriesId = selectedCell.seriesIdOverride ?? unitNode.seriesIdOverride ?? globalSeriesId;
  const isOperableLeaf = Boolean(selectedCell.sashType && selectedCell.sashType !== 'fixed');

  const seriesOptions = useMemo(
    () => [{ value: '', label: 'Mặc định theo cửa chính' }, ...availableSeries.map((s) => ({ value: String(s.id), label: `${s.code} — ${s.name}` }))],
    [availableSeries]
  );

  const unitFrameProfiles = useMemo(() => filterProfilesForSeries(allBrandProfiles, effectiveUnitSeriesId, 'FRAME'), [allBrandProfiles, effectiveUnitSeriesId]);
  const unitMullionProfiles = useMemo(() => filterProfilesForSeries(allBrandProfiles, effectiveUnitSeriesId, 'MULLION'), [allBrandProfiles, effectiveUnitSeriesId]);
  const leafSashProfiles = useMemo(() => filterProfilesForSeries(allBrandProfiles, effectiveLeafSeriesId, 'SASH'), [allBrandProfiles, effectiveLeafSeriesId]);
  const leafBeadProfiles = useMemo(() => filterProfilesForSeries(allBrandProfiles, effectiveLeafSeriesId, 'BEAD'), [allBrandProfiles, effectiveLeafSeriesId]);

  const unitBottomValue =
    unitNode.openBottomOverride === 'open' || unitNode.hasBottomFrameOverride === false
      ? 'open'
      : unitNode.openBottomOverride === 'closed' || unitNode.hasBottomFrameOverride === true
      ? 'closed'
      : 'inherit';

  const hasUnitOverride = Boolean(
    unitNode.seriesIdOverride || unitNode.frameProfileIdOverride || unitNode.frameTopProfileIdOverride || unitNode.frameBottomProfileIdOverride ||
      unitNode.frameLeftProfileIdOverride || unitNode.frameRightProfileIdOverride || unitNode.mullionProfileIdOverride || unitNode.frameCornerJointOverride ||
      unitBottomValue !== 'inherit'
  );
  const hasLeafOverride = Boolean(
    selectedCell.seriesIdOverride || selectedCell.sashProfileIdOverride || selectedCell.sashTopProfileIdOverride || selectedCell.sashBottomProfileIdOverride ||
      selectedCell.sashLeftProfileIdOverride || selectedCell.sashRightProfileIdOverride || selectedCell.sashCornerJointOverride || selectedCell.beadProfileIdOverride
  );

  const handleResetUnitOverride = () =>
    onUpdateFrameUnit?.({
      seriesIdOverride: undefined, frameProfileIdOverride: undefined, frameTopProfileIdOverride: undefined, frameBottomProfileIdOverride: undefined,
      frameLeftProfileIdOverride: undefined, frameRightProfileIdOverride: undefined, mullionProfileIdOverride: undefined, frameCornerJointOverride: undefined,
      openBottomOverride: undefined, hasBottomFrameOverride: undefined,
    });

  const handleResetLeafOverride = () =>
    onUpdateCell({
      seriesIdOverride: undefined, sashProfileIdOverride: undefined, sashTopProfileIdOverride: undefined, sashBottomProfileIdOverride: undefined,
      sashLeftProfileIdOverride: undefined, sashRightProfileIdOverride: undefined, sashCornerJointOverride: undefined, beadProfileIdOverride: undefined,
    });

  if (availableSeries.length <= 1 && allBrandProfiles.length === 0) return null;

  return (
    <div className="space-y-2.5">
      {isCoupledUnit && onUpdateFrameUnit && (
        <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-indigo-950 font-semibold text-xs">
              <Box size={13} className="text-indigo-600" />
              <span>Khối khung ghép: {frameUnitInfo?.unitLabel}</span>
            </div>
            {hasUnitOverride && (
              <button type="button" onClick={handleResetUnitOverride} className="flex items-center gap-1 text-[10px] font-semibold text-indigo-700 hover:text-indigo-900 cursor-pointer">
                <RotateCcw size={11} />
                <span>Mặc định</span>
              </button>
            )}
          </div>
          <div>
            <label className="text-[11px] text-slate-600 font-medium block mb-1">Hệ nhôm riêng cho khối khung này</label>
            <Select
              fullWidth
              value={unitNode.seriesIdOverride ? String(unitNode.seriesIdOverride) : ''}
              onChange={(e) =>
                onUpdateFrameUnit({
                  seriesIdOverride: e.target.value ? Number(e.target.value) : undefined,
                  frameProfileIdOverride: undefined, frameTopProfileIdOverride: undefined, frameBottomProfileIdOverride: undefined,
                  frameLeftProfileIdOverride: undefined, frameRightProfileIdOverride: undefined, mullionProfileIdOverride: undefined,
                })
              }
              options={seriesOptions}
              className="h-8 py-0 text-xs md:text-xs bg-white rounded-lg border-indigo-200 font-medium"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-600 font-medium block mb-1">Chân khung bao của khối này</label>
            <Select
              fullWidth
              value={unitBottomValue}
              onChange={(e) => {
                const v = e.target.value;
                onUpdateFrameUnit({
                  openBottomOverride: v === 'open' || v === 'closed' ? v : undefined,
                  hasBottomFrameOverride: v === 'open' ? false : v === 'closed' ? true : undefined,
                });
              }}
              options={unitBottomOptions}
              className="h-8 py-0 text-xs md:text-xs bg-white rounded-lg border-indigo-200 font-medium"
            />
          </div>
          <button type="button" onClick={() => setShowUnitAdvanced((p) => !p)} className="flex items-center gap-1 text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 cursor-pointer pt-0.5">
            {showUnitAdvanced ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            <span>Tùy chỉnh cây khung bao / đố / góc ghép của khối</span>
          </button>
          {showUnitAdvanced && (
            <div className="space-y-2 pt-1 border-t border-indigo-200/60">
              <div>
                <label className="text-[11px] text-slate-600 font-medium block mb-1">Cây khung bao chính</label>
                <Select fullWidth value={unitNode.frameProfileIdOverride ? String(unitNode.frameProfileIdOverride) : ''} onChange={(e) => onUpdateFrameUnit({ frameProfileIdOverride: parseStudioProfileId(e.target.value) })} options={buildProfileSelectOptions(unitFrameProfiles)} className="h-8 py-0 text-xs md:text-xs bg-white rounded-lg border-gray-300" />
              </div>
              <div>
                <label className="text-[11px] text-slate-600 font-medium block mb-1">Cây đố chia khung (T) trong khối</label>
                <Select fullWidth value={unitNode.mullionProfileIdOverride ? String(unitNode.mullionProfileIdOverride) : ''} onChange={(e) => onUpdateFrameUnit({ mullionProfileIdOverride: parseStudioProfileId(e.target.value) })} options={buildProfileSelectOptions(unitMullionProfiles)} className="h-8 py-0 text-xs md:text-xs bg-white rounded-lg border-gray-300" />
              </div>
              <div>
                <label className="text-[11px] text-slate-600 font-medium block mb-1">Kiểu ghép góc khung bao</label>
                <Select fullWidth value={normalizeJointSelectValue(unitNode.frameCornerJointOverride)} onChange={(e) => onUpdateFrameUnit({ frameCornerJointOverride: (e.target.value || undefined) as FrameCornerJoint | undefined })} options={frameJointOptions} className="h-8 py-0 text-xs md:text-xs bg-white rounded-lg border-gray-300" />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="p-2.5 rounded-xl bg-teal-50/70 border border-teal-200/80 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-teal-950 font-semibold text-xs">
            <Layers size={13} className="text-teal-700" />
            <span>Hệ nhôm & Thanh nhôm riêng ô này</span>
          </div>
          {hasLeafOverride && (
            <button type="button" onClick={handleResetLeafOverride} className="flex items-center gap-1 text-[10px] font-semibold text-teal-700 hover:text-teal-900 cursor-pointer">
              <RotateCcw size={11} />
              <span>Mặc định</span>
            </button>
          )}
        </div>
        <div>
          <label className="text-[11px] text-slate-600 font-medium block mb-1">Hệ nhôm riêng của ô</label>
          <Select
            fullWidth
            value={selectedCell.seriesIdOverride ? String(selectedCell.seriesIdOverride) : ''}
            onChange={(e) =>
              onUpdateCell({
                seriesIdOverride: e.target.value ? Number(e.target.value) : undefined,
                sashProfileIdOverride: undefined, sashTopProfileIdOverride: undefined, sashBottomProfileIdOverride: undefined,
                sashLeftProfileIdOverride: undefined, sashRightProfileIdOverride: undefined, beadProfileIdOverride: undefined,
              })
            }
            options={seriesOptions}
            className="h-8 py-0 text-xs md:text-xs bg-white rounded-lg border-teal-200 font-medium"
          />
        </div>
        <button type="button" onClick={() => setShowLeafAdvanced((p) => !p)} className="flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:text-teal-900 cursor-pointer pt-0.5">
          {showLeafAdvanced ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          <span>{isOperableLeaf ? 'Tùy chỉnh thanh cánh / góc cánh / nẹp kính' : 'Tùy chỉnh thanh nẹp kính riêng cho ô'}</span>
        </button>
        {showLeafAdvanced && (
          <div className="space-y-2 pt-1 border-t border-teal-200/60">
            {isOperableLeaf && (
              <>
                <div>
                  <label className="text-[11px] text-slate-600 font-medium block mb-1">Cây cánh chính của ô</label>
                  <Select fullWidth value={selectedCell.sashProfileIdOverride ? String(selectedCell.sashProfileIdOverride) : ''} onChange={(e) => onUpdateCell({ sashProfileIdOverride: parseStudioProfileId(e.target.value) })} options={buildProfileSelectOptions(leafSashProfiles)} className="h-8 py-0 text-xs md:text-xs bg-white rounded-lg border-gray-300" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 font-medium block mb-1">Cây cánh dưới (Chân cánh)</label>
                  <Select fullWidth value={selectedCell.sashBottomProfileIdOverride ? String(selectedCell.sashBottomProfileIdOverride) : ''} onChange={(e) => onUpdateCell({ sashBottomProfileIdOverride: parseStudioProfileId(e.target.value) })} options={buildProfileSelectOptions(leafSashProfiles, 'Giống cây cánh chính')} className="h-8 py-0 text-xs md:text-xs bg-white rounded-lg border-gray-300" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 font-medium block mb-1">Kiểu ghép góc cánh</label>
                  <Select fullWidth value={normalizeJointSelectValue(selectedCell.sashCornerJointOverride)} onChange={(e) => onUpdateCell({ sashCornerJointOverride: (e.target.value || undefined) as SashCornerJoint | undefined })} options={sashJointOptions} className="h-8 py-0 text-xs md:text-xs bg-white rounded-lg border-gray-300" />
                </div>
              </>
            )}
            <div>
              <label className="text-[11px] text-slate-600 font-medium block mb-1">Cây nẹp kính riêng của ô</label>
              <Select fullWidth value={selectedCell.beadProfileIdOverride ? String(selectedCell.beadProfileIdOverride) : ''} onChange={(e) => onUpdateCell({ beadProfileIdOverride: parseStudioProfileId(e.target.value) })} options={buildProfileSelectOptions(leafBeadProfiles)} className="h-8 py-0 text-xs md:text-xs bg-white rounded-lg border-gray-300" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
