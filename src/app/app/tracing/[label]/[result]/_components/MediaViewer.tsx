import Heading from '@/components/ui/Heading';
import SubHeading from '@/components/ui/SubHeading';
import { MEDIA_BASE_URL } from '@/config/app';

import type { Record } from '@/types/shared/event';

export default function MediaViewer({ selectedId, data }: { selectedId: string; data: any }) {
  const detectedObject = data?.find((item: any) => item.id === selectedId);
  const record: Record = detectedObject?.record;

  return (
    <div className="space-y-4">
      <div className="">
        <Heading>Hình ảnh và video hiện trường</Heading>
        <SubHeading>Được cắt từ ảnh chụp lại của camera</SubHeading>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <img src={`${MEDIA_BASE_URL}/ai-data/thumbnail/${record?.thumbnailId}`} alt="" />

        <video src={`${MEDIA_BASE_URL}/ai-data/video/${record?.videoId}`} controls></video>
      </div>
    </div>
  );
}
