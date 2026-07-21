'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TrainingHeading from './_components/TrainingHeading';
import TrainingTable, { LabelImage } from './_components/TrainingTable';
import UploadImageModal from './_components/UploadImageModal';
import ModalWrapper from '@/components/modal/ModalWrapper';
import ModalConfirm from '@/components/modal/ModalConfirm';
import api from '@/utils/api';
import queryClient from '@/utils/query';
import toast from 'react-hot-toast';

export default function TrainingPage() {
  const router = useRouter();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<LabelImage | undefined>(undefined);

  // ── Upload ───────────────────────────────────────────────────────────────

  const handleUpload = async (files: File[], note: string) => {
    setIsUploading(true);
    let successCount = 0;
    let failCount = 0;

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        if (note.trim()) formData.append('note', note.trim());

        await api.post('/api/v1/label/images/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        successCount++;
      } catch {
        failCount++;
      }
    }

    setIsUploading(false);
    setIsUploadOpen(false);
    queryClient.invalidateQueries({ queryKey: ['label-images'] });

    if (successCount > 0 && failCount === 0) {
      toast.success(`Upload thành công ${successCount} ảnh`);
    } else if (successCount > 0 && failCount > 0) {
      toast(`Upload được ${successCount} ảnh, thất bại ${failCount} ảnh`);
    } else {
      toast.error('Upload thất bại');
    }
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Tạo ZIP YOLO dataset trên MinIO
      const res = await api.post('/api/v1/label/export/zip');
      const downloadUrl: string = res.data?.downloadUrl ?? res.data?.download_url;
      if (downloadUrl) {
        // Mở URL để tải file ZIP
        window.open(downloadUrl, '_blank');
        toast.success(`Export thành công — ${res.data?.imageCount ?? res.data?.image_count ?? '?'} ảnh`);
      } else {
        toast.error('Không nhận được link download');
      }
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: { message?: string } } } })
        ?.response?.data?.detail?.message;
      toast.error(msg ?? 'Export thất bại');
    } finally {
      setIsExporting(false);
    }
  };

  // ── Label ────────────────────────────────────────────────────────────────

  const handleLabel = (image: LabelImage) => {
    router.push(`/app/training/${image.id}`);
  };

  // ── Delete ───────────────────────────────────────────────────────────────

  const handleDeleteConfirm = async () => {
    if (!selectedImage) return;
    setIsDeleting(true);
    try {
      await api.delete(`/api/v1/label/images/${selectedImage.id}`);
      toast.success('Đã xóa ảnh');
      queryClient.invalidateQueries({ queryKey: ['label-images'] });
    } catch {
      toast.error('Xóa ảnh thất bại');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setSelectedImage(undefined);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Heading */}
      <TrainingHeading
        onUpload={() => setIsUploadOpen(true)}
        onExport={handleExport}
        isExporting={isExporting}
      />

      {/* Table — filter pills & pagination đều qua TableData + URL params */}
      <TrainingTable
        onLabel={handleLabel}
        onDelete={(image) => {
          setSelectedImage(image);
          setIsDeleteModalOpen(true);
        }}
      />

      {/* Upload modal */}
      <ModalWrapper isOpen={isUploadOpen} onClose={() => !isUploading && setIsUploadOpen(false)}>
        <UploadImageModal
          isLoading={isUploading}
          onClose={() => setIsUploadOpen(false)}
          onUpload={handleUpload}
        />
      </ModalWrapper>

      {/* Delete confirm modal */}
      <ModalWrapper isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <ModalConfirm
          title="Xóa ảnh"
          description="Bạn có chắc chắn muốn xóa ảnh này? Ảnh sẽ bị xóa khỏi hệ thống và MinIO, không thể khôi phục."
          isLoading={isDeleting}
          onCancel={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
        />
      </ModalWrapper>
    </div>
  );
}
