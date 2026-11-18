'use client';

import React from 'react';
import { Avatar } from '@/components';
import { Camera } from 'lucide-react';
import { UseFormRegister, UseFormSetValue } from 'react-hook-form';

interface AvatarUploadProps {
  previewUrl: string | null;
  fullName?: string;
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
}

export function AvatarUpload({ previewUrl, fullName, register, setValue }: AvatarUploadProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-1">
      <div className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 bg-gray-50 flex items-center justify-center shadow-xs">
        {previewUrl ? (
          <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <Avatar name={fullName || 'Nhân sự'} size="xl" />
        )}
        <label
          htmlFor="avatar-file-input"
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity cursor-pointer text-white text-[11px]"
        >
          <Camera size={22} />
          <span>Chọn ảnh</span>
        </label>
        <input id="avatar-file-input" type="file" accept="image/*" className="hidden" {...register('avatar')} />
      </div>
      <div className="flex items-center gap-4">
        <label
          htmlFor="avatar-file-input"
          className="text-xs text-primary font-medium hover:underline cursor-pointer flex items-center gap-1"
        >
          <Camera size={14} />
          <span>Chọn ảnh đại diện</span>
        </label>
        {previewUrl && (
          <button
            type="button"
            className="text-xs text-red-500 font-medium hover:underline cursor-pointer"
            onClick={() => setValue('avatar', null)}
          >
            Xóa ảnh
          </button>
        )}
      </div>
    </div>
  );
}
