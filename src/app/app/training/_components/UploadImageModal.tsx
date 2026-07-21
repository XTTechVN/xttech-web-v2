'use client';

import { useRef, useState, useCallback } from 'react';
import Heading from '@/components/ui/Heading';
import SubHeading from '@/components/ui/SubHeading';
import Button from '@/components/ui/Button';
import Label from '@/components/ui/Label';
import Input from '@/components/ui/Input';
import { Upload, X, ImagePlus, Trash2 } from 'lucide-react';

interface UploadModalProps {
  isLoading: boolean;
  onClose: () => void;
  onUpload: (files: File[], note: string) => void;
}

export default function UploadImageModal({ isLoading, onClose, onUpload }: UploadModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const accepted = Array.from(newFiles).filter((f) =>
      ['image/jpeg', 'image/png', 'image/webp', 'image/bmp'].includes(f.type),
    );
    setFiles((prev) => [...prev, ...accepted]);
    accepted.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (e) => setPreviews((prev) => [...prev, e.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleSubmit = () => {
    if (files.length === 0) return;
    onUpload(files, note);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col w-full max-w-lg max-h-[90vh]">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-2">
        <div>
          <Heading>Upload ảnh</Heading>
          <SubHeading>Tải ảnh lên để đánh label huấn luyện AI</SubHeading>
        </div>
        <Button type="button" variant="ghost" onClick={onClose} className="rounded-full">
          <X size={20} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors select-none ${
            isDragging
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <ImagePlus size={32} className="text-gray-300" />
          <p className="text-sm font-medium text-gray-600">
            Kéo thả ảnh vào đây hoặc{' '}
            <span className="text-blue-600 underline">chọn từ máy tính</span>
          </p>
          <p className="text-xs text-gray-400">JPG, PNG, WEBP, BMP — không giới hạn số lượng</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/bmp"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
        </div>

        {/* Preview grid */}
        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {previews.map((src, i) => (
              <div key={i} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-video bg-gray-100">
                <img src={src} alt={`preview-${i}`} className="w-full h-full object-cover" />
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <Trash2 size={12} />
                </button>
                <span className="absolute bottom-1 left-1 text-[10px] bg-black/50 text-white px-1 rounded truncate max-w-[90%]">
                  {files[i]?.name}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Note */}
        <div className="flex flex-col gap-1.5">
          <Label>Ghi chú <span className="text-gray-400 font-normal">(tuỳ chọn)</span></Label>
          <Input
            placeholder="VD: Camera cổng A, lô 3..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 pt-2 border-t border-gray-100 flex items-center justify-between gap-3">
        <span className="text-sm text-gray-400">
          {files.length > 0 ? `${files.length} ảnh đã chọn` : 'Chưa có ảnh nào'}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="md" onClick={onClose} disabled={isLoading}>
            Huỷ
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={<Upload size={15} />}
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={files.length === 0}
          >
            Upload {files.length > 0 ? `(${files.length})` : ''}
          </Button>
        </div>
      </div>
    </div>
  );
}
