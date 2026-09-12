/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { WeeklyDayStat } from '@/types';
import { CalendarCheck, Users } from 'lucide-react';

interface WeeklyAttendanceChartProps {
  data?: WeeklyDayStat[];
  todayCount?: number;
}

export const WeeklyAttendanceChart: React.FC<WeeklyAttendanceChartProps> = ({ data = [] }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalWeeklyCheckins = data.reduce((acc, cur) => acc + (cur.presentCount || 0), 0);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-4 min-w-0">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <CalendarCheck size={18} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm sm:text-base font-bold text-gray-900">
              Chuyên cần 7 ngày gần nhất
            </h2>
            <span className="text-[11px] text-gray-500 font-medium">
              Thống kê nhân sự có mặt và đi muộn theo ngày
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
            <Users size={13} className="text-primary" />
            <span>
              Tổng tuần: <strong className="text-gray-900">{totalWeeklyCheckins}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="w-full h-72 sm:h-80 min-w-0 relative">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={260} debounce={50}>
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="dayName"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.96)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  border: '1px solid #f3f4f6',
                  fontSize: '12px',
                }}
                labelFormatter={(label, payload) => {
                  const item = payload?.[0]?.payload as WeeklyDayStat | undefined;
                  return item ? `${item.dayName} (${item.date})` : label;
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
              <Bar
                name="Có mặt"
                dataKey="presentCount"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
              />
              <Bar
                name="Đi muộn"
                dataKey="lateCount"
                fill="#f59e0b"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50/50 rounded-xl">
            <span className="text-xs text-gray-400">Đang tải biểu đồ...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyAttendanceChart;
