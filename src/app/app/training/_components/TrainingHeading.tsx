'use client';

import { useRouter } from 'next/navigation';
import Heading from '@/components/ui/Heading';
import SubHeading from '@/components/ui/SubHeading';
import Button from '@/components/ui/Button';
import { Upload, Download, History } from 'lucide-react';

interface TrainingHeadingProps {
  onUpload: () => void;
  onExport: () => void;
  isExporting?: boolean;
}

export default function TrainingHeading({ onUpload, onExport, isExporting }: TrainingHeadingProps) {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between">
      <div>
        <Heading>AI Training</Heading>
        <SubHeading>Quản lý và đánh nhãn ảnh phục vụ huấn luyện mô hình nhận diện</SubHeading>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          icon={<History size={15} />}
          onClick={() => router.push('/app/training/exports')}
        >
          Lịch sử export
        </Button>
        <Button
          variant="outline"
          size="sm"
          icon={<Download size={15} />}
          onClick={onExport}
          isLoading={isExporting}
        >
          Export dataset
        </Button>

        <Button variant="primary" size="sm" icon={<Upload size={15} />} onClick={onUpload}>
          Upload ảnh
        </Button>
      </div>
    </div>
  );
}
