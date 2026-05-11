'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/utils/api';

import Heading from '@/components/ui/Heading';
import SubHeading from '@/components/ui/SubHeading';

// types
import { Camera } from '@/types/shared/camera';

// components
import Stream from './_components/Stream';
import Control from './_components/Control';

export default function CameraStreamPage() {
  const params = useParams<{ id: string }>();

  const {
    data: camera,
    isError,
    isLoading,
  } = useQuery<Camera>({
    queryKey: ['camera', params.id],
    queryFn: async () => {
      const response = await api.get(`/api/v1/cameras/${params.id}`);
      return response.data;
    },
  });

  if (isError) {
    return (
      <div className="p-4">
        <div className="flex flex-col space-y-4">
          <Heading>
            Camera <span className="text-primary">LIVE</span>
          </Heading>
          <SubHeading>Quản lý và điều khiển camera {camera?.name ?? '...'}</SubHeading>
        </div>
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex flex-col space-y-4">
          <Heading>
            Camera <span className="text-primary">LIVE</span>
          </Heading>
        </div>
      </div>
    );
  }
  if (!camera) {
    return (
      <div className="p-4">
        <div className="flex flex-col space-y-4">
          <Heading>
            Camera <span className="text-primary">LIVE</span>
          </Heading>
          <SubHeading>Không tìm thấy camera này</SubHeading>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="p-4">
        <div className="flex flex-col space-y-4">
          {/* Tiêu đề trang */}
          <div>
            <Heading>
              Camera <span className="text-primary">LIVE</span>
            </Heading>
            <SubHeading>Quản lý và điều khiển camera {camera?.name ?? '...'}</SubHeading>
          </div>

          {/* Stream của camera */}
          <div className="flex gap-4">
            <div className="flex-4">
              <Stream camera={camera} />
            </div>
            <div className="flex-1">
              <Control camera={camera} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
