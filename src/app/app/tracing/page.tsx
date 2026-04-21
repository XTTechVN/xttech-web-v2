'use client';

import Heading from '@/components/ui/Heading';
import SubHeading from '@/components/ui/SubHeading';

import Toolbar from './_components/Toolbar';
import DetectionResultTable from './_components/DetectionResultTable';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TrackingPage() {
  const router = useRouter();
  const [label, setLabel] = useState('');

  return (
    <div className="space-y-4 p-4">
      <div>
        <Heading>Truy vết đối tượng</Heading>
        <SubHeading>Theo dõi và truy vết các đối tượng trong hệ thống</SubHeading>
      </div>

      <Toolbar label={label} setLabel={setLabel} />

      <DetectionResultTable
        label={label}
        onTrace={(item: any) => {
          router.push(`/app/tracing/${item.label}/${item.detectionResult}`);
        }}
      />
    </div>
  );
}
