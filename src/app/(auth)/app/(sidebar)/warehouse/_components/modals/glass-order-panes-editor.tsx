'use client';

import React from 'react';
import { Button, Input, Select } from '@/components';
import { Trash2, Plus, AlertCircle } from 'lucide-react';
import { ManualReason } from '@/types/warehouse';
import { GRIND_OPTIONS, MANUAL_REASON_OPTIONS } from '../../_utils/glass-mapping';

export interface EditablePaneItem {
  tempId: string;
  positionId?: number | null;
  positionCode?: string | null;
  doorName?: string | null;
  sourcePositionRevision?: number | null;
  paneSource: 'door' | 'manual';
  manualReason?: ManualReason | null;
  paneLabel: string;
  widthMm: number;
  heightMm: number;
  glassType: string;
  grindType: string;
  unitPrice: number;
  isMeasured?: boolean;
}

export interface DoorOption {
  id: number;
  code: string;
  name?: string | null;
  isMeasured?: boolean;
}

interface GlassOrderPanesEditorProps {
  panes: EditablePaneItem[];
  onChange: (panes: EditablePaneItem[]) => void;
  doorOptions?: DoorOption[];
  isLoading?: boolean;
}

export function GlassOrderPanesEditor({
  panes,
  onChange,
  doorOptions = [],
  isLoading,
}: GlassOrderPanesEditorProps) {
  const handleUpdateField = <K extends keyof EditablePaneItem>(
    index: number,
    field: K,
    value: EditablePaneItem[K]
  ) => {
    const updated = [...panes];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleDoorChange = (index: number, valueStr: string) => {
    const updated = [...panes];
    if (!valueStr || valueStr === 'manual') {
      updated[index] = {
        ...updated[index],
        paneSource: 'manual',
        positionId: null,
        positionCode: null,
        doorName: null,
        sourcePositionRevision: null,
        manualReason: updated[index].manualReason || 'spare',
        isMeasured: true,
      };
    } else {
      const doorId = Number(valueStr);
      const door = doorOptions.find((d) => d.id === doorId);
      updated[index] = {
        ...updated[index],
        paneSource: 'door',
        positionId: doorId,
        positionCode: door?.code || null,
        doorName: door?.name || null,
        sourcePositionRevision: updated[index].sourcePositionRevision || 1,
        manualReason: null,
        isMeasured: door?.isMeasured !== false,
      };
    }
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    onChange(panes.filter((_, i) => i !== index));
  };

  const handleAddPane = () => {
    const newPane: EditablePaneItem = {
      tempId: `pane_${Date.now()}_${Math.random()}`,
      paneSource: 'manual',
      positionId: null,
      positionCode: null,
      doorName: null,
      sourcePositionRevision: null,
      manualReason: 'spare',
      paneLabel: `Kính lẻ ${panes.length + 1}`,
      widthMm: 1000,
      heightMm: 1000,
      glassType: 'Kính dán an toàn 8.38mm trắng trong',
      grindType: 'grind_edge',
      unitPrice: panes[0]?.unitPrice || 350000,
      isMeasured: true,
    };
    onChange([...panes, newPane]);
  };

  if (isLoading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-3" />
        <p className="text-sm font-medium">Đang tự động bóc tách ô kính từ thiết kế cửa...</p>
      </div>
    );
  }

  const doorSelectOptions = [
    { value: 'manual', label: '— Kính lẻ (không thuộc cửa) —' },
    ...doorOptions.map((d) => ({
      value: String(d.id),
      label: `${d.code}${d.name ? ` (${d.name})` : ''}${d.isMeasured === false ? ' ⚠️ Chưa đo' : ''}`,
    })),
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Danh Sách Tấm Kính Đặt Hàng ({panes.length} tấm)
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddPane}
          className="text-xs h-7 gap-1 text-emerald-600 border-emerald-300 hover:bg-emerald-50"
        >
          <Plus className="w-3.5 h-3.5" /> Thêm Tấm Kính
        </Button>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-[360px] overflow-y-auto">
        <table className="min-w-full divide-y divide-slate-200 text-xs">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              <th className="px-2 py-2 text-center font-medium text-slate-600 w-8">STT</th>
              <th className="px-2 py-2 text-left font-medium text-slate-600 min-w-[150px]">Thuộc Cửa</th>
              <th className="px-2 py-2 text-left font-medium text-slate-600 min-w-[160px]">Ký hiệu / Lý do</th>
              <th className="px-2 py-2 text-left font-medium text-slate-600 min-w-[170px]">Chủng loại kính</th>
              <th className="px-2 py-2 text-center font-medium text-slate-600 w-20">Rộng (mm)</th>
              <th className="px-2 py-2 text-center font-medium text-slate-600 w-20">Cao (mm)</th>
              <th className="px-2 py-2 text-right font-medium text-slate-600 w-16">S (m²)</th>
              <th className="px-2 py-2 text-left font-medium text-slate-600 w-32">Mài cạnh</th>
              <th className="px-2 py-2 text-right font-medium text-slate-600 w-24">Đơn giá (đ)</th>
              <th className="px-2 py-2 text-right font-medium text-slate-600 w-24">Thành tiền (đ)</th>
              <th className="px-1 py-2 text-center font-medium text-slate-600 w-8">Xóa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {panes.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-slate-400">
                  Chưa có tấm kính nào. Nhấn &quot;Thêm Tấm Kính&quot; để bổ sung ô kính vào đơn.
                </td>
              </tr>
            ) : (
              panes.map((pane, idx) => {
                const area = (pane.widthMm * pane.heightMm) / 1_000_000.0;
                const lineTotal = Math.round(area * pane.unitPrice);
                const isManual = pane.paneSource === 'manual' || !pane.positionId;
                const isUnmeasured = !isManual && pane.isMeasured === false;

                return (
                  <tr
                    key={pane.tempId}
                    className={`hover:bg-slate-50 transition-colors ${
                      isManual ? 'bg-amber-50/40' : isUnmeasured ? 'bg-red-50/50' : ''
                    }`}
                  >
                    <td className="px-2 py-1.5 text-center text-slate-500">{idx + 1}</td>
                    <td className="px-2 py-1">
                      <Select
                        value={isManual ? 'manual' : String(pane.positionId)}
                        onChange={(e) => handleDoorChange(idx, e.target.value)}
                        options={doorSelectOptions}
                        className={`text-xs h-7 py-0 px-2 ${
                          isUnmeasured ? 'border-red-400 text-red-600 font-medium' : ''
                        }`}
                      />
                      {isUnmeasured && (
                        <span className="flex items-center gap-1 text-[10px] text-red-600 font-medium mt-0.5">
                          <AlertCircle className="w-3 h-3 flex-shrink-0" /> Chưa đo thực tế ô chờ!
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-1">
                      <div className="space-y-1">
                        <Input
                          type="text"
                          value={pane.paneLabel}
                          onChange={(e) => handleUpdateField(idx, 'paneLabel', e.target.value)}
                          className="text-xs h-7 px-2"
                          placeholder={isManual ? 'Nhãn kính lẻ (bắt buộc)' : 'Ký hiệu ô kính'}
                        />
                        {isManual && (
                          <Select
                            value={pane.manualReason || 'spare'}
                            onChange={(e) =>
                              handleUpdateField(idx, 'manualReason', e.target.value as ManualReason)
                            }
                            options={MANUAL_REASON_OPTIONS}
                            className="text-[11px] h-6 py-0 px-1.5 bg-amber-50 border-amber-300 text-amber-800"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-1">
                      <Input
                        type="text"
                        value={pane.glassType}
                        onChange={(e) => handleUpdateField(idx, 'glassType', e.target.value)}
                        className="text-xs h-7 px-2"
                        placeholder="Quy cách kính..."
                      />
                    </td>
                    <td className="px-2 py-1">
                      <Input
                        type="number"
                        value={pane.widthMm || ''}
                        onChange={(e) => handleUpdateField(idx, 'widthMm', Number(e.target.value))}
                        className="text-xs h-7 px-1 text-center"
                        min={1}
                      />
                    </td>
                    <td className="px-2 py-1">
                      <Input
                        type="number"
                        value={pane.heightMm || ''}
                        onChange={(e) => handleUpdateField(idx, 'heightMm', Number(e.target.value))}
                        className="text-xs h-7 px-1 text-center"
                        min={1}
                      />
                    </td>
                    <td className="px-2 py-1.5 text-right font-medium text-slate-700">
                      {area.toFixed(3)}
                    </td>
                    <td className="px-2 py-1">
                      <Select
                        value={pane.grindType}
                        onChange={(e) => handleUpdateField(idx, 'grindType', e.target.value)}
                        options={GRIND_OPTIONS}
                        className="text-xs h-7 py-0 px-2"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <Input
                        type="number"
                        value={pane.unitPrice || ''}
                        onChange={(e) => handleUpdateField(idx, 'unitPrice', Number(e.target.value))}
                        className="text-xs h-7 px-1 text-right"
                        min={0}
                        step={1000}
                      />
                    </td>
                    <td className="px-2 py-1.5 text-right font-semibold text-emerald-600">
                      {lineTotal.toLocaleString('vi-VN')}
                    </td>
                    <td className="px-1 py-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemove(idx)}
                        className="p-1 text-slate-400 hover:text-red-500 rounded transition"
                        title="Xóa tấm kính"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
