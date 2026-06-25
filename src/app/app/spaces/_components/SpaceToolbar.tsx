import Button from '@/components/ui/Button';
import Search from '@/components/ui/Search';
import { Plus } from 'lucide-react';

export default function SpaceToolbar({
  onAdd,
  onChangeSearch,
}: {
  onAdd: () => void;
  onChangeSearch: (val: string) => void;
}) {
  return (
    <div className="flex flex-col md:flex-row gap-2 items-center justify-between">
      <div className="flex items-center gap-2 w-full md:w-fit">
        <Search
          size="sm"
          className="w-full md:w-96"
          placeholder="Tìm kiếm theo tên hoặc mã..."
          onChange={onChangeSearch}
        />
      </div>

      <div className="flex items-center gap-2 w-full md:w-fit">
        <Button size="sm" icon={<Plus size={16} />} onClick={onAdd}>
          Thêm khu vực
        </Button>
      </div>
    </div>
  );
}
