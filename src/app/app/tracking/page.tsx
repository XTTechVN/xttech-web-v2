'use client';

import Heading from '@/components/ui/Heading';
import SubHeading from '@/components/ui/SubHeading';
import Search from '@/components/ui/Search';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import MapContainer from './_components/MapContainer';
import { DatePicker } from 'antd';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import api from '@/utils/api';
import queryClient from '@/utils/query';

// Type
import type { Dayjs } from 'dayjs';

export default function TrackingPage() {
  const [label, setLabel] = useState('');
  const [detectionResult, setDetectionResult] = useState('');
  const [date, setDate] = useState<Dayjs | null>(null);

  const { data } = useQuery({
    queryKey: ['tracking', label, detectionResult, date],
    queryFn: () => api.get('/api/v1/detected-objects/tracing', {
      params: {
        label,
        detectionResult: detectionResult,
        startDate: date?.toISOString(), // format iso 8601
        endDate: date?.endOf('day').toISOString(), // format iso 8601, end of date
      },
    }),
    enabled: !!detectionResult && !!label && !!date,
  });

  const onSearch = () => {
    queryClient.invalidateQueries({ queryKey: ['tracking', label, detectionResult] });
  };

  return (
    <div className="space-y-4 p-4">
      <div>
        <Heading>Truy vết đối tượng</Heading>
        <SubHeading>Theo dõi và truy vết các đối tượng trong hệ thống</SubHeading>
      </div>

      <div className="flex items-center gap-4">
        <Search size="sm" placeholder="Nhập biển số xe" className="w-96" onChange={(value) => setDetectionResult(value as string)} />
        <Select
          size="sm"
          placeholder="Chọn loại đối tượng"
          options={[
            { label: 'Tất cả', value: 'all' },
            { label: 'Biển số xe', value: 'plate' },
          ]}
          onChange={(value) => setLabel(value as string)}
        />
        <DatePicker
          placeholder="Chọn ngày"
          className='h-9'
          onChange={(value) => setDate(value)}
        />
        <Button size="sm" onClick={onSearch}>Tìm kiếm</Button>
      </div>

      {data && data.data.items.length > 0 && (
        <div className="h-[600px] w-full">
          <MapContainer
            routeCoordinates={data?.data.items.map((item: any) => [item.event.camera.lat, item.event.camera.lng])}
            center={[data?.data.items[0].event.camera.lat, data?.data.items[0].event.camera.lng]}
          />
        </div>
      )}
    </div>
  );
}
