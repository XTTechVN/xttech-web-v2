import React from 'react';
import { cn } from '@/utils/cn';

const FIELD_BASE =
  'w-full h-11 px-3.5 text-xs sm:text-sm bg-white border rounded-xl outline-none transition-all';
const FIELD_NORMAL_BORDER =
  'border-slate-300 hover:border-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20';
const FIELD_ERROR_BORDER =
  'border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20';

interface TextFieldProps {
  type?: 'text' | 'email' | 'tel';
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function ConsultationTextField({ type = 'text', placeholder, value, onChange, error }: TextFieldProps) {
  return (
    <div className="space-y-1">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          FIELD_BASE,
          'placeholder:text-slate-400 text-slate-900',
          error ? FIELD_ERROR_BORDER : FIELD_NORMAL_BORDER,
        )}
      />
      {error && <span className="text-xs text-rose-500 font-medium">{error}</span>}
    </div>
  );
}

interface SelectFieldProps {
  placeholder: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

export function ConsultationSelectField({ placeholder, value, options, onChange }: SelectFieldProps) {
  return (
    <div className="space-y-1">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(FIELD_BASE, FIELD_NORMAL_BORDER, 'text-slate-700 cursor-pointer')}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
