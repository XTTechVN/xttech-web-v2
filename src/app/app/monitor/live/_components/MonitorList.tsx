import { Monitor } from '@/types/shared/monitor';

import useMonitorStore from '@/stores/useMonitorStore';

export function MonitorItem({ monitor }: { monitor: Monitor }) {
  const { setMonitor, setIsShowList, setIsShowSetting } = useMonitorStore();

  return (
    <div
      className="bg-white px-4 py-2 rounded-md text-sm font-semibold text-primary w-full text-center cursor-pointer transition-all duration-200"
      onClick={() => {
        setMonitor(monitor);
        setIsShowList(false);
        setIsShowSetting(true);
      }}
    >
      {monitor.name}
    </div>
  );
}

export default function MonitorList({ monitors }: { monitors: Monitor[] }) {
  return (
    <div className="bg-gray-100 rounded-lg h-full overflow-hidden">
      <div className="p-4 bg-primary">
        <h2 className="font-semibold text-sm text-white">Danh sách màn hình</h2>
      </div>

      <div className="p-4">
        {monitors.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm font-semibold text-primary">Chưa có màn hình nào</p>
            <p className="text-xs text-muted-foreground">
              Vui lòng ấn nút <strong className="text-primary">"Thêm mới"</strong> để bắt đầu giám
              sát
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {monitors.map((monitor) => (
              <MonitorItem key={monitor.id} monitor={monitor} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
