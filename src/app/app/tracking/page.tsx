'use client';

import Heading from '@/components/ui/Heading';
import SubHeading from '@/components/ui/SubHeading';
import ModalWrapper from '@/components/modal/ModalWrapper';

import Toolbar from './_components/Toolbar';
import MapContainer from './_components/MapContainer';
import DetectionResultTable from './_components/DetectionResultTable';

import { useState } from 'react';

export default function TrackingPage() {
  const [label, setLabel] = useState('');
  const [openModal, setOpenModal] = useState(false)
  const [tracingLabel, setTracingLabel] = useState('');
  const [tracingDetectionResult, setTracingDetectionResult] = useState('');


  return (
    <div className="space-y-4 p-4">
      <div>
        <Heading>Truy vết đối tượng</Heading>
        <SubHeading>Theo dõi và truy vết các đối tượng trong hệ thống</SubHeading>
      </div>

      <Toolbar label={label} setLabel={setLabel} />

      <DetectionResultTable label={label} onTrace={(item: any) => {
        setOpenModal(true)
        setTracingLabel(item.label)
        setTracingDetectionResult(item.detectionResult)
      }} />

      {/* {tracingLabel && tracingDetectionResult && (
        <div className="h-[600px] w-full">
          <MapContainer tracingLabel={tracingLabel} tracingDetectionResult={tracingDetectionResult} />
        </div>
      )} */}

      {/* Modal */}
      <ModalWrapper
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
      >
        <MapContainer tracingLabel={tracingLabel} tracingDetectionResult={tracingDetectionResult} />
      </ModalWrapper>
    </div>
  );
}
