'use client';

import React, { useRef, useState } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { uploadProgressEvidence } from '@/actions';
import { Button } from '@/components';
import { BASE_MINIO_URL } from '@/config';
import { showErrorToast } from '@/utils';
import type { EvidenceMediaItem } from '@/types';

interface EvidenceUploaderProps {
  projectId: number;
  value: EvidenceMediaItem[];
  onChange: (next: EvidenceMediaItem[]) => void;
  label?: string;
  required?: boolean;
}

const mediaUrl = (url: string): string =>
  url.startsWith('http') ? url : `${BASE_MINIO_URL}/${url.replace(/^\//, '')}`;

/** Chọn / chụp ảnh-video minh chứng, tải lên kho và trả về danh sách đường dẫn. */
export function EvidenceUploader({ projectId, value, onChange, label, required }: EvidenceUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const results = await Promise.all(
        Array.from(files).map((file) => uploadProgressEvidence(projectId, file)),
      );
      onChange([...value, ...results.map((r) => ({ url: r.url, name: r.name, type: r.type }))]);
    } catch (error) {
      showErrorToast(error, 'Lỗi khi tải tệp lên');
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700">
          {label ?? 'Ảnh / video thực tế'}
          {required && <span className="text-red-500"> *</span>}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          capture="environment"
          multiple
          hidden
          onChange={(e) => void handleFiles(e.target.files)}
        />
        <Button
          size="xs"
          variant="outline"
          loading={isUploading}
          leftIcon={<Camera size={12} />}
          onClick={() => inputRef.current?.click()}
        >
          Chụp / chọn ảnh
        </Button>
      </div>
      {value.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {value.map((media, index) => (
            <div key={`${media.url}-${index}`} className="group relative">
              {media.type === 'video' ? (
                <div className="flex h-16 w-16 items-center justify-center rounded-md border border-slate-200 bg-slate-100 text-[10px] text-slate-500">
                  Video
                </div>
              ) : (
                 
                <img
                  src={mediaUrl(media.url)}
                  alt={media.name ?? 'Minh chứng'}
                  className="h-16 w-16 rounded-md border border-slate-200 object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => onChange(value.filter((_, i) => i !== index))}
                className="absolute -right-1.5 -top-1.5 hidden cursor-pointer rounded-full bg-red-500 p-0.5 text-white group-hover:block"
                title="Xóa"
              >
                <Trash2 size={10} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-slate-400">Chưa có tệp nào.</p>
      )}
    </div>
  );
}
