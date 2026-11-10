'use client';

import React from 'react';
import type { ProfileBar } from '@/types';
import { BAR_TYPE_MAP } from './profile-bar-config';
import { groupCompanionsByWay } from './profile-companion-utils';

interface ProfileBarSubRowsProps {
  bar: ProfileBar;
  isBulkMode: boolean;
}

const renderSpecCell = (overrideVal?: number | null, baseVal?: number | null) => {
  const hasOverride = overrideVal !== null && overrideVal !== undefined && overrideVal > 0;
  const val = hasOverride ? overrideVal : baseVal;
  if (!val || val <= 0) {
    return <span className="text-slate-300">—</span>;
  }
  return (
    <span className={hasOverride ? 'font-semibold text-primary' : 'text-slate-600'}>
      {val}
    </span>
  );
};

export function ProfileBarSubRows({ bar, isBulkMode }: ProfileBarSubRowsProps) {
  const variants = bar.variants ?? [];
  const combineGroups = !bar.isFullCompanion
    ? groupCompanionsByWay(bar.companions ?? [], bar.code, bar.name)
    : [];

  if (variants.length === 0 && combineGroups.length === 0) return null;

  const baseTypeLabel = BAR_TYPE_MAP[bar.barType?.toUpperCase()] || bar.barType || '—';
  const weightText = `${Number(bar.weightPerM || 0).toFixed(3)} kg/m`;

  return (
    <>
      {variants.map((variant, idx) => {
        const variantCode = variant.code || `${bar.code}-${variant.role}`;
        const roleLabel = BAR_TYPE_MAP[variant.role?.toUpperCase()] || variant.role;
        return (
          <tr
            key={variant.id ?? `var-${bar.id}-${idx}`}
            className="bg-slate-50/50 hover:bg-slate-100/60 transition-colors text-xs"
          >
            {isBulkMode && <td className="py-2.5 px-3" />}
            <td className="py-2.5 px-4 pl-8 font-mono text-xs text-slate-700 whitespace-nowrap">
              <span className="text-slate-400 mr-1">↳</span>
              <span>{variantCode}</span>
            </td>
            <td className="py-2.5 px-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-slate-800">{variant.name || bar.name}</span>
                <div>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    {`${variant.role}, ${roleLabel}`}
                  </span>
                </div>
              </div>
            </td>
            <td className="py-2.5 px-3 text-right font-mono tabular-nums">
              {renderSpecCell(variant.sectionHeightMm, bar.sectionHeightMm)}
            </td>
            <td className="py-2.5 px-3 text-right font-mono tabular-nums">
              {renderSpecCell(variant.deductSashMm, bar.deductSashMm)}
            </td>
            <td className="py-2.5 px-3 text-right font-mono tabular-nums">
              {renderSpecCell(variant.deductMullionMm, bar.deductMullionMm)}
            </td>
            <td className="py-2.5 px-3 text-right font-mono tabular-nums">
              {renderSpecCell(variant.deductBeadMm, bar.deductBeadMm)}
            </td>
            <td className="py-2.5 px-3 text-right font-mono tabular-nums">
              {renderSpecCell(variant.deductGlassMm, bar.deductGlassMm)}
            </td>
            <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600 whitespace-nowrap">
              {weightText}
            </td>
            <td className="py-2.5 px-3 text-center">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
                {roleLabel}
              </span>
            </td>
            <td className="py-2.5 px-4 text-right whitespace-nowrap">
              <span className="text-xs text-slate-400">— biến thể</span>
            </td>
          </tr>
        );
      })}

      {combineGroups.map((group) => (
        <tr
          key={`${bar.id}-${group.groupId}`}
          className="bg-amber-50/25 hover:bg-amber-50/50 transition-colors text-xs"
        >
          {isBulkMode && <td className="py-2.5 px-3" />}
          <td className="py-2.5 px-4 pl-8 font-mono text-xs whitespace-nowrap">
            <span className="text-amber-600 font-bold mr-1">⊕</span>
            <span className="text-amber-800 font-semibold">{group.code || `${bar.code}+combine`}</span>
          </td>
          <td className="py-2.5 px-4">
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-amber-900 text-xs">{group.name || bar.name}</span>
              <div className="flex flex-wrap gap-1">
                {group.items.map((item, idx) => (
                  <span
                    key={item.id ?? `comp-badge-${idx}`}
                    className="bg-amber-50 text-amber-700 border border-amber-200/80 rounded px-1.5 py-0.5 text-[10px] font-medium"
                  >
                    {`⊕ kèm${item.companionCode ? ` ${item.companionCode}` : ''} · offset ${item.offsetMm ?? 0}mm × ${item.qty ?? 1}`}
                  </span>
                ))}
              </div>
            </div>
          </td>
          <td className="py-2.5 px-3 text-right font-mono tabular-nums">
            {renderSpecCell(null, bar.sectionHeightMm)}
          </td>
          <td className="py-2.5 px-3 text-right font-mono tabular-nums">
            {renderSpecCell(null, bar.deductSashMm)}
          </td>
          <td className="py-2.5 px-3 text-right font-mono tabular-nums">
            {renderSpecCell(null, bar.deductMullionMm)}
          </td>
          <td className="py-2.5 px-3 text-right font-mono tabular-nums">
            {renderSpecCell(null, bar.deductBeadMm)}
          </td>
          <td className="py-2.5 px-3 text-right font-mono tabular-nums">
            {renderSpecCell(null, bar.deductGlassMm)}
          </td>
          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600 whitespace-nowrap">
            {weightText}
          </td>
          <td className="py-2.5 px-3 text-center">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
              {baseTypeLabel}
            </span>
          </td>
          <td className="py-2.5 px-4 text-right whitespace-nowrap">
            <span className="text-amber-600 font-semibold text-xs">⊕ combine</span>
          </td>
        </tr>
      ))}
    </>
  );
}
