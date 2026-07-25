import Heading from '@/components/ui/Heading';
import StatCard from './_components/StatCard';
import ServerStatusCard from './_components/ServerStatusCard';
import MockupChart from './_components/MockupChart';
import { Video, Hash, UserX, AlertTriangle } from 'lucide-react';

export default function App() {
  return (
    <div className="p-4 space-y-4">
      <Heading>Trang chủ</Heading>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Tổng số video"
          value="1,280"
          icon={<Video size={24} />}
          colorClassName="bg-blue-500"
          trend={{ value: '12%', isUp: true }}
        />
        <StatCard
          label="Biển số nhận diện"
          value="456"
          icon={<Hash size={24} />}
          colorClassName="bg-purple-500"
          trend={{ value: '8%', isUp: true }}
        />
        <StatCard
          label="Người lạ phát hiện"
          value="12"
          icon={<UserX size={24} />}
          colorClassName="bg-orange-500"
          trend={{ value: '5%', isUp: false }}
        />
        <StatCard
          label="Vi phạm giao thông"
          value="89"
          icon={<AlertTriangle size={24} />}
          colorClassName="bg-red-500"
          trend={{ value: '2%', isUp: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 auto-rows-max">
        {/* Main Charts */}
        <div className="lg:col-span-2 space-y-4">
          <MockupChart
            title="Lưu lượng video theo thời gian"
            data={[20, 35, 45, 30, 55, 70, 65, 80, 95, 85, 100, 90]}
            color="#3b82f6"
          />
          <MockupChart
            title="Tần suất phát hiện biển số"
            data={[10, 25, 20, 45, 50, 40, 60, 55, 75, 70, 80, 85]}
            color="#a855f7"
          />
        </div>

        {/* Server Side Sidebar */}
        <div className="space-y-4">
          <ServerStatusCard />
          <MockupChart
            title="Độ trễ hệ thống (ms)"
            data={[45, 42, 48, 50, 47, 44, 46, 49, 52, 50, 48, 45]}
            color="#ef4444"
          />
        </div>
      </div>
    </div>
  );
}
