'use client';

import React, { useState } from 'react';
import {
  Breadcrumb,
  Heading,
  Button,
  Input,
  Select,
  Badge,
  Avatar,
  TableData,
  ITableColumn,
  Tooltip,
} from '@/components';
import { toast } from 'react-hot-toast';
import {
  Plus,
  Calendar,
  CheckCircle2,
  Users,
  ShieldAlert,
  Clock,
  Pencil,
  Trash2,
  Filter,
  Download,
  Lightbulb,
  Search,
  RefreshCw,
  Star,
  Activity,
} from 'lucide-react';

interface WorkShift {
  id: string;
  name: string;
  subName: string;
  timeRange: string;
  breakDuration: string;
  type: 'administrative' | 'flexible' | 'project';
  typeLabel: string;
  departments: string[];
}

const mockShifts: WorkShift[] = [
  {
    id: '1',
    name: 'Ca sáng (S1)',
    subName: 'Vận hành máy CNC',
    timeRange: '06:00 - 14:00',
    breakDuration: '45 Phút',
    type: 'administrative',
    typeLabel: 'Ca hành chính',
    departments: ['SX', 'LR'],
  },
  {
    id: '2',
    name: 'Ca chiều (C1)',
    subName: 'Vận hành máy CNC',
    timeRange: '14:00 - 22:00',
    breakDuration: '45 Phút',
    type: 'flexible',
    typeLabel: 'Ca linh hoạt',
    departments: ['SX'],
  },
  {
    id: '3',
    name: 'Dự án EV - Phase 2',
    subName: 'Lắp ráp pin điện',
    timeRange: '08:00 - 18:00',
    breakDuration: '60 Phút',
    type: 'project',
    typeLabel: 'Ca theo dự án',
    departments: ['LR'],
  },
];

export default function ShiftsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'running' | 'paused'>('running');

  const breadcrumbItems = [
    { label: 'Trang chủ', href: '/app' },
    { label: 'Quản lý nhân sự', href: '/app/employees' },
    { label: 'Ca làm việc', href: '/app/shifts' },
  ];

  const fetcher = async ({ offset, limit }: { offset: number; limit: number }) => {
    let filtered = [...mockShifts];
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.subName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return {
      items: filtered.slice(offset, offset + limit),
      meta: {
        total: filtered.length,
        offset,
        limit,
        next: offset + limit < filtered.length,
      },
    };
  };

  const columns: ITableColumn<WorkShift>[] = [
    {
      key: 'name',
      label: 'Tên Ca làm việc',
      minWidth: '220px',
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-900 text-sm">{row.name}</div>
          <div className="text-xs text-slate-500 mt-0.5">{row.subName}</div>
        </div>
      ),
    },
    {
      key: 'timeRange',
      label: 'Thời gian',
      minWidth: '160px',
      cell: (row) => (
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Clock size={14} className="text-slate-400" />
          <span>{row.timeRange}</span>
        </div>
      ),
    },
    {
      key: 'breakDuration',
      label: 'Nghỉ giữa ca',
      minWidth: '120px',
      cell: (row) => <span className="text-xs text-slate-600 font-medium">{row.breakDuration}</span>,
    },
    {
      key: 'type',
      label: 'Loại hình',
      minWidth: '140px',
      cell: (row) => {
        const variantMap = {
          administrative: 'success' as const,
          flexible: 'info' as const,
          project: 'warning' as const,
        };
        return (
          <Badge variant={variantMap[row.type] ?? 'info'} className="text-[11px] font-semibold px-2.5">
            {row.typeLabel}
          </Badge>
        );
      },
    },
    {
      key: 'departments',
      label: 'Phòng ban',
      minWidth: '120px',
      cell: (row) => (
        <div className="flex items-center gap-1">
          {row.departments.map((dept, idx) => (
            <span
              key={idx}
              className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-700 uppercase"
            >
              {dept}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      minWidth: '100px',
      cell: (row) => (
        <div className="flex items-center gap-1">
          <Tooltip content="Chỉnh sửa ca" position="top">
            <button
              onClick={() => toast.info(`Chỉnh sửa ${row.name}`)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              <Pencil size={15} />
            </button>
          </Tooltip>
          <Tooltip content="Xóa ca" position="top">
            <button
              onClick={() => toast.error(`Đã xóa ${row.name}`)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
            >
              <Trash2 size={15} />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  const renderCard = (row: WorkShift) => (
    <div key={row.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-slate-900 text-sm">{row.name}</h4>
        <Badge variant={row.type === 'administrative' ? 'success' : row.type === 'flexible' ? 'info' : 'warning'}>
          {row.typeLabel}
        </Badge>
      </div>
      <p className="text-xs text-slate-500">{row.subName}</p>
      <div className="text-xs text-slate-700 flex items-center justify-between pt-1">
        <span><strong>Giờ:</strong> {row.timeRange}</span>
        <span><strong>Nghỉ:</strong> {row.breakDuration}</span>
      </div>
    </div>
  );

  return (
    <div className="flex h-full w-full flex-1 flex-col bg-slate-50 p-6 space-y-6">
      {/* Top Breadcrumb & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Breadcrumb items={breadcrumbItems} />
        <Button
          className="bg-[#005c53] hover:bg-[#004740] text-white font-semibold shadow-sm gap-2 self-start sm:self-auto"
          leftIcon={<Plus size={18} />}
          onClick={() => toast.success('Tạo ca làm việc mới')}
        >
          Tạo ca mới
        </Button>
      </div>

      {/* Header Title */}
      <div>
        <Heading size="h2" className="text-2xl font-bold text-slate-900">
          Quản lý ca làm việc
        </Heading>
        <p className="mt-1 text-sm text-slate-500">
          Lập lịch và điều phối nhân sự vận hành nhà máy
        </p>
      </div>

      {/* 4 Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">TỔNG SỐ CA</span>
            <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
              <Calendar size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">12</div>
        </div>

        {/* Card 2 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">ĐANG HOẠT ĐỘNG</span>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">8</div>
        </div>

        {/* Card 3 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">PHÒNG BAN GÁN</span>
            <div className="rounded-xl bg-sky-50 p-2.5 text-sky-600">
              <Users size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">06</div>
        </div>

        {/* Card 4 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">TRƯỜNG HỢP ĐẶC BIỆT</span>
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
              <ShieldAlert size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">14</div>
        </div>
      </div>

      {/* Main Filter Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span>Phòng ban:</span>
            <Select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs w-44"
              options={[
                { label: 'Tất cả phòng ban', value: 'all' },
                { label: 'Xưởng CNC', value: 'cnc' },
                { label: 'Lắp ráp', value: 'assembly' },
              ]}
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span>Loại ca:</span>
            <Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="text-xs w-40"
              options={[
                { label: 'Tất cả loại ca', value: 'all' },
                { label: 'Ca hành chính', value: 'administrative' },
                { label: 'Ca linh hoạt', value: 'flexible' },
                { label: 'Ca theo dự án', value: 'project' },
              ]}
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span>Trạng thái:</span>
            <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setStatusFilter('running')}
                className={`py-1 px-3 rounded-lg text-xs font-bold transition ${
                  statusFilter === 'running'
                    ? 'bg-[#005c53] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Đang chạy
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('paused')}
                className={`py-1 px-3 rounded-lg text-xs font-bold transition ${
                  statusFilter === 'paused'
                    ? 'bg-[#005c53] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tạm dừng
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.info('Lọc ca')}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
          >
            <Filter size={16} />
          </button>
          <button
            onClick={() => toast.success('Tải danh sách ca')}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Shift Table */}
        <div className="lg:col-span-2 space-y-4">
          <TableData<WorkShift>
            queryKey={['shifts-data', searchQuery, selectedDept, selectedType, statusFilter]}
            fetcher={fetcher}
            columns={columns}
            renderCard={renderCard}
            select={false}
            syncToUrl={false}
          />
        </div>

        {/* Right Column: Special Cases & Management Tips */}
        <div className="space-y-6">

          {/* Card 1: Trường hợp đặc biệt */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
                <Users size={18} className="text-slate-600" />
                <span>Trường hợp đặc biệt</span>
              </div>
              <span className="h-2 w-2 rounded-full bg-red-500" />
            </div>

            <div className="space-y-4">
              {/* Item 1 */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">Trần Thị B</span>
                  <Badge variant="danger" className="text-[10px] font-extrabold px-2 py-0.5">Y TẾ</Badge>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Giảm 2 giờ làm việc/ngày. Kết thúc lúc 15:00.
                </p>
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-700 pt-1">
                  <Clock size={13} />
                  <span>Hiệu lực: 15/10 - 20/11</span>
                </div>
              </div>

              {/* Item 2 */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">Lê Văn C</span>
                  <Badge variant="info" className="text-[10px] font-extrabold px-2 py-0.5">HỌC TẬP</Badge>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Làm việc online buổi sáng thứ 4 hàng tuần.
                </p>
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-blue-700 pt-1">
                  <RefreshCw size={13} />
                  <span>Định kỳ hàng tuần</span>
                </div>
              </div>

              {/* Item 3 */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">Phạm Minh D</span>
                  <Badge variant="success" className="text-[10px] font-extrabold px-2 py-0.5">HỖ TRỢ</Badge>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tăng cường ca đêm tại xưởng B trong 3 ngày.
                </p>
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 pt-1">
                  <Star size={13} />
                  <span>Dự án cấp bách</span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full text-xs font-semibold border-teal-600 text-teal-700 hover:bg-teal-50"
              onClick={() => toast.info('Xem tất cả danh sách trường hợp đặc biệt')}
            >
              Xem tất cả danh sách
            </Button>
          </div>

          {/* Card 2: Mẹo quản lý */}
          <div className="rounded-2xl border border-teal-100 bg-teal-50/50 p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-[#005c53] font-bold text-sm">
              <Lightbulb size={18} />
              <span>Mẹo quản lý</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sử dụng &quot;Ca linh hoạt&quot; cho nhân sự kho bãi để tối ưu hóa thời gian xuất nhập hàng cao điểm.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
