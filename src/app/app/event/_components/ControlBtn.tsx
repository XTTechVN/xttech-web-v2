'use client';

import { Button } from '@/components/ui/Button';
import Search from '@/components/ui/Search';
import { DownloadIcon } from 'lucide-react';

export default function ControlButton() {
  return (
    <div className="flex items-center justify-between gap-2">
      {/* Left */}
      <div className="flex gap-2">
        <Search placeholder="Tìm kiếm sự kiện" size="sm" />
      </div>

      {/* Right */}
      <div className="flex gap-2">
        <Button icon={<DownloadIcon size={16} />} size="sm">
          Xuất báo cáo
        </Button>
      </div>
    </div>
  );
}
