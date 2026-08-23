import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components';

// This is a dummy type for interaction logs, replace with actual type when API is ready
export interface InteractionLog {
  id: string;
  date: string;
  type: string;
  status: string;
  notes: string;
}

interface InteractionLogsProps {
  logs: InteractionLog[];
  onCreateClick: () => void;
}

export const InteractionLogs = ({ logs, onCreateClick }: InteractionLogsProps) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
          Lịch sử tương tác ({logs.length})
        </h3>
        <Button
          variant="primary"
          size="sm"
          className="text-primary hover:bg-primary/5 font-semibold px-2 py-1 h-auto"
          leftIcon={<Plus size={16} />}
          onClick={onCreateClick}
        >
          Tạo lượt tương tác
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-2 shadow-sm">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-100 bg-gray-50/50 rounded-t-lg">
          <div className="col-span-3 text-xs font-semibold text-gray-400 uppercase">Ngày tạo</div>
          <div className="col-span-4 text-xs font-semibold text-gray-400 uppercase">Loại tương tác</div>
          <div className="col-span-3 text-xs font-semibold text-gray-400 uppercase">Trạng thái</div>
          <div className="col-span-2 text-xs font-semibold text-gray-400 uppercase text-right">Hành động</div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col">
          {logs.length > 0 ? (
            logs.map((log) => (
              <div
                key={log.id}
                className="grid grid-cols-12 gap-4 px-4 py-3.5 border-b border-gray-50 last:border-0 items-center hover:bg-gray-50/50 transition-colors"
              >
                <div className="col-span-3 text-sm font-semibold text-gray-900">{log.date}</div>
                <div className="col-span-4 text-sm font-semibold text-gray-700">{log.type}</div>
                <div className="col-span-3">
                  <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                    {log.status}
                  </span>
                </div>
                <div className="col-span-2 flex justify-end gap-2">
                  <Button variant="secondary" size="sm" className="h-7 px-3 text-xs">
                    Chi tiết
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-sm text-gray-500">
              Chưa có lượt tương tác nào.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
