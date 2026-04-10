'use client';

import Heading from '@/components/ui/Heading';
import SubHeading from '@/components/ui/SubHeading';
import Search from '@/components/ui/Search';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import MapContainer from './_components/MapContainer';

export default function TrackingPage() {
  return (
    <div className="space-y-4 p-4">
      <div>
        <Heading>Truy vết đối tượng</Heading>
        <SubHeading>Theo dõi và truy vết các đối tượng trong hệ thống</SubHeading>
      </div>

      <div className="flex items-center gap-4">
        <Search size="sm" placeholder="Tìm kiếm theo thẻ đối tượng..." className="w-96" />
        <Select
          size="sm"
          placeholder="Chọn loại đối tượng"
          options={[
            { label: 'Tất cả', value: 'all' },
            { label: 'Xe máy', value: 'motorcycle' },
            { label: 'Ô tô', value: 'car' },
            { label: 'Xe đạp', value: 'bicycle' },
          ]}
          onChange={() => {}}
        />
        <Button size="sm">Tìm kiếm</Button>
      </div>

      <div className="h-[600px] w-full">
        <MapContainer />
      </div>
    </div>
  );
}
