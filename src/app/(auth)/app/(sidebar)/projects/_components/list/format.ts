import type { TagTone } from '@/components-remake';
import { PROJECT_STATUS_OPTIONS } from '@/config';
import type { Project, ProjectStatus } from '@/types';

const TONE: Record<ProjectStatus, TagTone> = {
  draft: 'slate',
  surveying: 'blue',
  designing: 'violet',
  quotation: 'amber',
  contract: 'teal',
  producing: 'orange',
  installing: 'orange',
  completed: 'green',
  cancelled: 'red',
};

export const STATUSES = PROJECT_STATUS_OPTIONS.map((o) => ({ value: o.value as string, label: o.label, tone: TONE[o.value] }));

export const statusOf = (s: string) => STATUSES.find((o) => o.value === s) ?? { value: s, label: s, tone: 'slate' as TagTone };

export const codeOf = (p: Pick<Project, 'code' | 'id'>) => p.code || `DA-${p.id}`;

export const fmtDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString('vi-VN') : '–');

export const scaleText = (p: Project) => `${p.totalPositions ?? 0} bộ cửa · ${(p.totalAreaM2 ?? 0).toFixed(2)} m²`;
