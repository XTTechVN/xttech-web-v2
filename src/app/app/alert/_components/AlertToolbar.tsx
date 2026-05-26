import Button from '@/components/ui/Button';
import Search from '@/components/ui/Search';
import { Download } from 'lucide-react';

export default function AlertToolbar({
  onExport,
}: {
  onExport: () => void;
}) {
  return (
    <div className="flex flex-col md:flex-row gap-2 items-center justify-between">
      <div className="flex items-center gap-2 w-full md:w-fit">
        <Search size="sm" className="w-full md:w-96" placeholder="Tìm kiếm cảnh báo..." />
      </div>

      {/* <div className="flex items-center gap-2 w-full md:w-fit">
        <Button size="sm" icon={<Download size={16} />} onClick={onExport}>
          Xuất báo cáo
        </Button>
      </div> */}
    </div>
  );
}
