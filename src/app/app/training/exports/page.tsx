'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import Heading from '@/components/ui/Heading';
import SubHeading from '@/components/ui/SubHeading';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Button from '@/components/ui/Button';
import api from '@/utils/api';
import queryClient from '@/utils/query';
import ExportBatchTable from './_components/ExportBatchTable';
import type { ExportBatch } from '@/types/shared';

export default function ExportsPage() {
  const [isCreating, setIsCreating] = useState(false);

  // ── Tạo export batch mới ──────────────────────────────────────────────────

  const createExportMutation = useMutation({
    mutationFn: () => api.post('/api/v1/label/export/zip'),
    onMutate: () => setIsCreating(true),
    onSuccess: (res) => {
      const downloadUrl: string = res.data?.downloadUrl ?? res.data?.download_url;
      const count = res.data?.imageCount ?? res.data?.image_count ?? '?';
      toast.success(`Export thành công — ${count} ảnh`);
      if (downloadUrl) window.open(downloadUrl, '_blank');
      queryClient.invalidateQueries({ queryKey: ['export-batches'] });
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { detail?: { message?: string } } } })
        ?.response?.data?.detail?.message;
      toast.error(msg ?? 'Export thất bại');
    },
    onSettled: () => setIsCreating(false),
  });

  // ── Download ──────────────────────────────────────────────────────────────

  const handleDownload = (batch: ExportBatch) => {
    if (batch.downloadUrl) {
      window.open(batch.downloadUrl, '_blank');
    } else {
      toast.error('File không khả dụng');
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'AI Training', path: '/app/training' },
          { label: 'Lịch sử Export' },
        ]}
      />

      {/* Heading */}
      <div className="flex items-center justify-between">
        <div>
          <Heading>Lịch sử Export</Heading>
          <SubHeading>Các lần export YOLO dataset đã tạo</SubHeading>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus size={15} />}
          isLoading={isCreating}
          onClick={() => createExportMutation.mutate()}
        >
          Export mới
        </Button>
      </div>

      {/* Table */}
      <ExportBatchTable onDownload={handleDownload} />
    </div>
  );
}
