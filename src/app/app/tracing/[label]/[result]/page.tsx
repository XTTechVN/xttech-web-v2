'use client';

import Heading from '@/components/ui/Heading';
import SubHeading from '@/components/ui/SubHeading';

import MapContainer from './_components/MapContainer';

import { useParams } from 'next/navigation';

export default function Component({}: {}) {
  const params = useParams<{ label: string; result: string }>();

  return (
    <div className="p-4 space-y-4">
      <div>
        <Heading>Chi tiết truy vết</Heading>
        <SubHeading>
          {`Bạn đang xem chi tiết truy vết cho đối tượng ${params.label} với kết quả ${params.result}`}
        </SubHeading>
      </div>

      <MapContainer tracingLabel={params.label} tracingDetectionResult={params.result} />
    </div>
  );
}
