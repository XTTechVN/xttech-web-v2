'use client';

import React, { useState } from 'react';

interface NullableNumberInputProps {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  placeholder?: string;
  step?: number;
  min?: number;
  max?: number;
  className?: string;
}

const parseDraft = (draft: string): number | null => {
  if (draft.trim() === '') return null;
  const parsed = Number(draft);
  return Number.isFinite(parsed) ? parsed : null;
};

/** Ô nhập số cho phép rỗng (null), giữ chuỗi đang gõ để không mất dấu '.' hoặc '-'. */
export function NullableNumberInput({ value, onChange, placeholder, step = 0.1, min, max, className }: NullableNumberInputProps) {
  const [draft, setDraft] = useState<string>(value === null || value === undefined ? '' : String(value));

  const externalText = value === null || value === undefined ? '' : String(value);
  const displayValue = parseDraft(draft) === (value ?? null) ? draft : externalText;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDraft(event.target.value);
    onChange(parseDraft(event.target.value));
  };

  const handleBlur = () => setDraft(value === null || value === undefined ? '' : String(value));

  return (
    <input
      type="number"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      step={step}
      min={min}
      max={max}
      className={`w-full h-8 px-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:border-primary transition ${className ?? ''}`}
    />
  );
}
