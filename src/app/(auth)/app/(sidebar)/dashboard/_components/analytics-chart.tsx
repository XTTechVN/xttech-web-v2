
'use client';

// Các hooks dùng chung cho toàn bộ trang
import { useEffect, useState } from 'react';

// import biểu đồ
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// import Heading
import { Heading } from '@/components';

// Dữ liệu biểu đồ mockup
const analyticsData = [
  { name: 'Tháng 1', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'Tháng 2', uv: 3000, pv: 1398, amt: 2210 },
  { name: 'Tháng 3', uv: 2000, pv: 9800, amt: 2290 },
  { name: 'Tháng 4', uv: 2780, pv: 3908, amt: 2000 },
  { name: 'Tháng 5', uv: 1890, pv: 4800, amt: 2181 },
  { name: 'Tháng 6', uv: 1890, pv: 4800, amt: 2181 },
  { name: 'Tháng 7', uv: 1890, pv: 4800, amt: 2181 },
];

const AnalyticsChart = () => {
  const [barSize, setBarSize] = useState(16);

  // Hàm theo dõi sự thay đổi kích thước màn hình để điều chỉnh kích thước cột (barSize) cho responsive
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setBarSize(40); // Desktop
      } else if (width >= 768) {
        setBarSize(32); // Tablet
      } else {
        setBarSize(12); // Mobile
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3 sm:p-4 shadow-xs flex flex-col gap-5">
      <div>
        <Heading size="h2" className="text-primary text-lg">
          Thống kê hệ thống
        </Heading>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={analyticsData} margin={{ top: 10, right: 3, left: -24, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 5" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'black' }} tickLine={false} />
          <YAxis tick={{ fontSize: 9, fill: 'black' }} tickLine={false} axisLine={false} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          <Bar dataKey="uv" fill="var(--color-primary)" radius={[4, 4, 0, 0]} barSize={barSize} />
          <Bar dataKey="pv" fill="#82ca9d" radius={[4, 4, 0, 0]} barSize={barSize} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnalyticsChart;
