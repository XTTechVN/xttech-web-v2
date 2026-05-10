import { Monitor } from '@/types/shared/monitor';

export function MonitorItem({
  monitor,
  onSelectMonitor,
}: {
  monitor: Monitor;
  onSelectMonitor: (monitor: Monitor) => void;
}) {
  return (
    <div
      className="bg-white px-4 py-2 rounded-md text-sm font-semibold text-primary w-full text-center mb-4 cursor-pointer transition-all duration-200"
      onClick={() => onSelectMonitor(monitor)}
    >
      {monitor.name}
    </div>
  );
}

export default function MonitorList({
  monitors,
  onSelectMonitor,
}: {
  monitors: Monitor[];
  onSelectMonitor: (monitor: Monitor) => void;
}) {
  return (
    <div className="bg-gray-50 rounded-lg min-h-[80vh] overflow-hidden">
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
          monitors.map((monitor) => (
            <MonitorItem key={monitor.id} monitor={monitor} onSelectMonitor={onSelectMonitor} />
          ))
        )}
      </div>
    </div>
  );
}
