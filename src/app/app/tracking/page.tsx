'use client';

import Heading from '@/components/ui/Heading';
import SubHeading from '@/components/ui/SubHeading';
import Search from '@/components/ui/Search';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import MapContainer from './_components/MapContainer';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import api from '@/utils/api';

export default function TrackingPage() {
  const [label, setLabel] = useState('');
  const [detectionResult, setDetectionResult] = useState('');
  const [startDate, setStartDate] = useState('2026-04-15T00:00:00.000000Z');
  const [endDate, setEndDate] = useState('2026-04-15T23:59:59.999999Z');

  const { data } = useQuery({
    queryKey: ['tracking', label, detectionResult, startDate, endDate],
    queryFn: () => api.get('/api/v1/detected-objects/tracing', {
      params: {
        label,
        detectionResult: detectionResult,
        startDate: startDate,
        endDate: endDate,
      },
    }),
    enabled: !!detectionResult && !!label,
  });

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
        <Button size="sm">Tìm kiếm</Button>
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
