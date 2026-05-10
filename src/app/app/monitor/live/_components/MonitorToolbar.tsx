'use client';

import Heading from '@/components/ui/Heading';
import SubHeading from '@/components/ui/SubHeading';
import Button from '@/components/ui/Button';
import { List, Plus } from 'lucide-react';

import useMonitorStore from '@/stores/useMonitorStore';

export default function HeaderToolbar({ userId }: { userId: string }) {
  const { setIsShowList, setIsShowSetting, createNewMonitor, isLoading } = useMonitorStore();

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
          onClick={() => createNewMonitor(4, userId)}
          isLoading={isLoading}
        >
          Thêm mới
        </Button>
        <Button
          size="sm"
          icon={<List size={16} />}
          onClick={() => {
            setIsShowList(true);
            setIsShowSetting(false);
          }}
        >
          Danh sách
        </Button>
      </div>
    </div>
  );
}
