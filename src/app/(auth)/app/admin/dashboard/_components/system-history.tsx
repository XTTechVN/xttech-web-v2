'use client';

import React, { useState } from 'react';
import { Input } from '@/components';
import { Select } from '@/components';

interface HistoryLog {
  id: string;
  time: string;
  user: string;
  role: 'admin' | 'user';
  ip: string;
  action: string;
  status: 'success' | 'failed';
}

const SystemHistory = () => {
  const [date, setDate] = useState<string>('');

  // Dữ liệu mockup cho lịch sử đăng nhập hệ thống
  const mockHistoryData: HistoryLog[] = [
    { id: '1', time: '2026-07-28 09:30', user: 'Nguyễn Văn A', role: 'admin', ip: '192.168.1.1', action: 'Đăng nhập hệ thống', status: 'success' },
    { id: '2', time: '2026-07-28 09:15', user: 'Trần Thị B', role: 'user', ip: '192.168.1.5', action: 'Cập nhật hồ sơ cá nhân', status: 'success' },
    { id: '3', time: '2026-07-28 08:45', user: 'Lê Văn C', role: 'user', ip: '192.168.1.12', action: 'Đăng nhập sai mật khẩu', status: 'failed' },
    { id: '4', time: '2026-07-28 09:30', user: 'Nguyễn Văn A', role: 'admin', ip: '192.168.1.1', action: 'Đăng nhập hệ thống', status: 'success' },
    { id: '5', time: '2026-07-28 09:15', user: 'Trần Thị B', role: 'user', ip: '192.168.1.5', action: 'Cập nhật hồ sơ cá nhân', status: 'success' },
    { id: '6', time: '2026-07-28 08:45', user: 'Lê Văn C', role: 'user', ip: '192.168.1.12', action: 'Đăng nhập sai mật khẩu', status: 'failed' },
    { id: '7', time: '2026-07-28 09:30', user: 'Nguyễn Văn A', role: 'admin', ip: '192.168.1.1', action: 'Đăng nhập hệ thống', status: 'success' },
    { id: '8', time: '2026-07-28 09:15', user: 'Trần Thị B', role: 'user', ip: '192.168.1.5', action: 'Cập nhật hồ sơ cá nhân', status: 'success' },
    { id: '9', time: '2026-07-28 08:45', user: 'Lê Văn C', role: 'user', ip: '192.168.1.12', action: 'Đăng nhập sai mật khẩu', status: 'failed' },
  ];

  return (
    <div className="flex flex-col gap-4 bg-white border border-gray-300 rounded-xl p-4 shadow-xs">
      <div className="flex justify-between items-center gap-4">
        <h1 className="text-lg font-bold text-gray-800">
          <span className="hidden md:inline text-primary">Lịch sử truy cập hệ thống</span>
          <span className="md:hidden text-primary">Lịch sử</span>
        </h1>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-40" />
      </div>
      <div className="flex flex-col gap-3">
        {mockHistoryData.map((item) => {
          // Lấy giờ (hh:mm) từ chuỗi thời gian YYYY-MM-DD hh:mm
          const timeOnly = item.time.split(' ')[1] || item.time;

          return (
            <div key={item.id} className="flex justify-between items-center py-1 border-b border-gray-200 last:border-b-0 text-sm gap-4">
              <div className="text-black">
                <span className="font-semibold text-primary">{item.user}</span>
                <span> đăng nhập lúc </span>
                <span className="font-semibold text-primary">{timeOnly}</span>
                <span>, chức năng: </span>
                <span className="text-primary font-medium">{item.action}</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                  item.status === 'success' ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'
                }`}
              >
                {item.status === 'success' ? 'Thành công' : 'Thất bại'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SystemHistory;
