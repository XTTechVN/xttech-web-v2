'use client';

import Select from '@/components/ui/Select';

interface TrainingToolbarProps {
  source: string;
  isLabeled: string;
  onSourceChange: (v: string) => void;
  onIsLabeledChange: (v: string) => void;
}

const sourceOptions = [
  { label: 'Upload thủ công', value: 'upload' },
  { label: 'Active Learning', value: 'active_learning' },
];

const labeledOptions = [
  { label: 'Chưa label', value: 'false' },
  { label: 'Đã label', value: 'true' },
];

export default function TrainingToolbar({
  source,
  isLabeled,
  onSourceChange,
  onIsLabeledChange,
}: TrainingToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      <Select
        options={sourceOptions}
        value={source}
        onChange={(v) => onSourceChange(String(v))}
        placeholder="Tất cả nguồn"
        size="sm"
        canClear
      />
      <Select
        options={labeledOptions}
        value={isLabeled}
        onChange={(v) => onIsLabeledChange(String(v))}
        placeholder="Mọi trạng thái"
        size="sm"
        canClear
      />
    </div>
  );
}
