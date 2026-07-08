import Heading from '@/components/ui/Heading';
import SubHeading from '@/components/ui/SubHeading';

import type { Event } from '@/types/shared/event';

export default function MediaViewer({ selectedId, data }: { selectedId: string; data: any }) {
  const detectedObject = data?.find((item: any) => item.id === selectedId);
  const event: Event = detectedObject?.event;

  return (
    <div className="space-y-4">
      <div className="">
        <Heading>Hình ảnh và video hiện trường</Heading>
        <SubHeading>Được cắt từ ảnh chụp lại của camera</SubHeading>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <img src={`http://157.66.100.182:9000/ai-data/thumbnail/${event?.record?.thumbnailId}`} alt="" />

        <video src={`http://157.66.100.182:9000/ai-data/video/${event?.record?.videoId}`} controls></video>
      </div>
    </div>
  );
}
