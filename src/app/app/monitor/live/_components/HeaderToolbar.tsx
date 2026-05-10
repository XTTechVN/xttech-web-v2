'use client';

import Heading from '@/components/ui/Heading';
import SubHeading from '@/components/ui/SubHeading';
import Button from '@/components/ui/Button';
import { List, Plus, Settings } from 'lucide-react';

import api from '@/utils/api';
import queryClient from '@/utils/query';
import { useState } from 'react';

export default function HeaderToolbar({
  userId,
  onShowList,
  onShowSetting,
}: {
  userId: string;
  onShowList: () => void;
  onShowSetting: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAddMonitor = async () => {
    try {
      setIsLoading(true);
      const res = await api.post('/api/v1/monitors', {
        name: 'Monitor Example',
        userId: userId,
        grid: {
          '1': {},
          '2': {},
          '3': {},
          '4': {},
        },
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="">
        <Heading>Giám sát trực tiếp</Heading>
        <SubHeading>Stream video trực tiếp từ các camera</SubHeading>
      </div>

      <div className="flex items-center gap-2 w-full md:w-fit">
        <Button
          size="sm"
          icon={<Plus size={16} />}
          onClick={handleAddMonitor}
          isLoading={isLoading}
        >
          Thêm mới
        </Button>
        <Button size="sm" icon={<List size={16} />} onClick={onShowList}>
          Danh sách
        </Button>
        <Button size="sm" icon={<Settings size={16} />} onClick={onShowSetting}>
          Cài đặt
        </Button>
      </div>
    </div>
  );
}
