'use client';

import React, { useRef, useState } from 'react';
import { Camera, Play, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadQrClaimMedia } from '@/actions';
import type { EvidenceMediaItem } from '@/types';
import { getErrorMessage, isVideoMedia, mediaUrl } from './qr-helpers';

export function QrMediaStrip({
  items,
  onPlayVideo,
}: {
  items: EvidenceMediaItem[];
  onPlayVideo: (url: string) => void;
}) {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {items.map((media, idx) => {
        const url = mediaUrl(media.url);
        const isVideo = isVideoMedia(media.url, media.type);
        if (isVideo) {
          return (
            <button
              key={`${media.url}-${idx}`}
              type="button"
              onClick={() => onPlayVideo(url)}
              className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-900"
            >
              <video
                src={url}
                preload="metadata"
                className="h-full w-full object-cover opacity-75"
              />
              <Play size={18} className="absolute fill-white text-white" />
            </button>
          );
        }
        return (
          <a
            key={`${media.url}-${idx}`}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="block h-16 w-16 overflow-hidden rounded-xl border border-slate-200"
          >
            <img src={url} alt={media.name || 'Ảnh'} className="h-full w-full object-cover" />
          </a>
        );
      })}
    </div>
  );
}

interface QrMediaUploaderProps {
  token: string;
  value: EvidenceMediaItem[];
  onChange: (items: EvidenceMediaItem[]) => void;
  buttonLabel?: string;
  onUploadingChange?: (isUploading: boolean) => void;
}

export function QrMediaUploader({
  token,
  value,
  onChange,
  buttonLabel = 'Chụp ảnh / Quay video hiện trạng (Hỗ trợ video dung lượng lớn)',
  onUploadingChange,
}: QrMediaUploaderProps) {
  const [uploadingFileName, setUploadingFileName] = useState<string | null>(null);
  const [uploadPercent, setUploadPercent] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    onUploadingChange?.(true);
    try {
      const nextItems = [...value];
      for (const file of fileArray) {
        setUploadingFileName(file.name);
        setUploadPercent(0);
        const uploaded = await uploadQrClaimMedia(token, file, (percent) => {
          setUploadPercent(percent);
        });
        nextItems.push(uploaded);
        onChange([...nextItems]);
      }
      toast.success(`Đã tải lên ${fileArray.length} tệp`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không thể tải tệp lên'));
    } finally {
      setUploadingFileName(null);
      setUploadPercent(0);
      onUploadingChange?.(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        hidden
        onChange={(e) => void handleFilesSelected(e.target.files)}
      />
      <button
        type="button"
        disabled={Boolean(uploadingFileName)}
        onClick={() => fileInputRef.current?.click()}
        className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#045863]/50 bg-[#045863]/5 px-4 py-2.5 text-xs font-semibold text-[#045863] transition hover:bg-[#045863]/10 disabled:opacity-60"
      >
        <Camera size={16} />
        <span>{buttonLabel}</span>
      </button>

      {uploadingFileName && (
        <div className="space-y-1.5 rounded-xl bg-slate-100 p-3 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate font-medium text-slate-700">
              Đang tải: {uploadingFileName}
            </span>
            <span className="font-mono font-bold tabular-nums text-[#045863]">
              {uploadPercent}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-[#045863] transition-all duration-150"
              style={{ width: `${uploadPercent}%` }}
            />
          </div>
        </div>
      )}

      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2 pt-1">
          {value.map((item, idx) => {
            const isVideo = isVideoMedia(item.url, item.type);
            return (
              <div
                key={`${item.url}-${idx}`}
                className="relative h-24 overflow-hidden rounded-xl border border-slate-200 bg-slate-900"
              >
                {isVideo ? (
                  <div className="relative h-full w-full">
                    <video
                      src={mediaUrl(item.url)}
                      preload="metadata"
                      className="h-full w-full object-cover opacity-80"
                    />
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <Play size={20} className="fill-white text-white" />
                    </div>
                  </div>
                ) : (
                  <img
                    src={mediaUrl(item.url)}
                    alt={item.name || 'Hiện trạng'}
                    className="h-full w-full object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={() => onChange(value.filter((_, i) => i !== idx))}
                  className="absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-black/65 text-white"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
