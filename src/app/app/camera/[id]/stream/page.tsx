'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/utils/api';

export default function CameraStreamPage() {
  const params = useParams<{ id: string }>();

  const { data: camera } = useQuery({
    queryKey: ['camera', params.id],
    queryFn: async () => {
      const response = await api.get(`/api/v1/cameras/${params.id}`);
      return response.data;
    },
  });

  return (
    <div>
      <h1>Stream: {params.id}</h1>
    </div>
  );
}
