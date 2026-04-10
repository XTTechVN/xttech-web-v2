'use client';

// components
import MonitorGrid from './_components/MonitorGrid';
import MonitorSetting from './_components/MonitorSetting';
import Heading from '@/components/ui/Heading';
import SubHeading from '@/components/ui/SubHeading';

// hooks
import { useLiveStore } from '@/stores/useLiveStore';

// types
import { VIEW_MODES_CONFIG } from '@/types/shared/view';

export default function LivePage() {
  const { viewMode, portView, setViewMode, setPortView } = useLiveStore(); // Lấy view mode từ store

  const total = VIEW_MODES_CONFIG[viewMode].total; // Tổng số camera

  return (
    <div className="p-4">
      <Heading>Giám sát trực tiếp</Heading>
      <SubHeading>Stream video trực tiếp từ các camera</SubHeading>

      <div className="grid grid-cols-5 gap-4">
        <div className="mt-4 col-span-4">
          <MonitorGrid
            viewMode={viewMode}
            total={total}
            portView={portView}
            setPortView={setPortView}
          />
        </div>
        <div className="mt-4 col-span-1">
          <MonitorSetting setViewMode={setViewMode} setPortView={setPortView} />
        </div>
      </div>
    </div>
  );
}
