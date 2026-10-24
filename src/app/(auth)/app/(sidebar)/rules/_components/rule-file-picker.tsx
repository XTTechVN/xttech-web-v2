'use client';

import React, { useRef } from 'react';
import { FileUp, X } from 'lucide-react';
import { formatBytes, getFileVisualInfo } from '@/utils';

interface RuleFilePickerProps {
  file: File | null;
  existingFileName?: string;
  isRequired?: boolean;
  error?: string | null;
  onChange: (file: File | null) => void;
}

export const RuleFilePicker: React.FC<RuleFilePickerProps> = ({ file, existingFileName, isRequired, error, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) onChange(dropped);
  };

  return (
    <div>
      <label className="text-xs font-semibold text-gray-700 select-none block mb-1.5">
        Tệp văn bản (PDF, DOCX, XLSX...) {isRequired && <span className="text-rose-500">*</span>}
      </label>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />

      {file ? (
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">{getFileVisualInfo(file.name).icon}</div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-800 truncate text-xs">{file.name}</p>
              <p className="text-[10px] text-slate-400">{formatBytes(file.size)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="p-1 rounded-full text-slate-400 hover:text-rose-500 hover:bg-slate-200/60 cursor-pointer"
            title="Chọn tệp khác"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          id="rule-file-dropzone"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer bg-slate-50/50 hover:bg-slate-50 flex flex-col items-center gap-1.5 transition-colors ${
            error ? 'border-red-400' : 'border-slate-300 hover:border-primary/60'
          }`}
        >
          <FileUp size={22} className="text-primary" />
          <p className="text-xs font-semibold text-slate-700">Nhấp để chọn tệp hoặc kéo thả vào đây</p>
          {existingFileName && (
            <p className="text-[11px] text-slate-400">Hiện tại: {existingFileName} (chọn tệp mới để thay thế)</p>
          )}
        </div>
      )}
      {error && <span className="text-xs text-red-500 mt-1 block">{error}</span>}
    </div>
  );
};
