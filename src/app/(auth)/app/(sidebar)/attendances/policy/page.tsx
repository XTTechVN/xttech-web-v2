'use client';

import React, { useState } from 'react';
import {
  Breadcrumb,
  Heading,
  Button,
  Input,
  Select,
  Switch,
  Checkbox,
  Badge,
} from '@/components';
import { toast } from 'react-hot-toast';
import {
  History,
  Save,
  Clock,
  AlertTriangle,
  Calendar,
  TrendingUp,
  FileCheck,
  Calculator,
  Info,
  Search,
} from 'lucide-react';

export default function AttendancePolicyPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [startTime, setStartTime] = useState('08:00 AM');
  const [endTime, setEndTime] = useState('05:30 PM');
  const [breakStart, setBreakStart] = useState('12:00 PM');
  const [breakEnd, setBreakEnd] = useState('01:30 PM');
  const [autoSubtractLunch, setAutoSubtractLunch] = useState(true);

  const [gracePeriod, setGracePeriod] = useState(5);
  const [deductionRule, setDeductionRule] = useState('after_15_minus_025');
  const [strictAudit, setStrictAudit] = useState(false);

  const [standardWorkDays, setStandardWorkDays] = useState<'24' | '26'>('24');

  const [minOTMinutes, setMinOTMinutes] = useState('30');
  const [weekdayOTMultiplier, setWeekdayOTMultiplier] = useState('1.5');
  const [weekendOTMultiplier, setWeekendOTMultiplier] = useState('2.0');
  const [requireOTApproval, setRequireOTApproval] = useState(true);

  const [defaultAnnualLeave, setDefaultAnnualLeave] = useState('12');

  const [calcMethod, setCalcMethod] = useState('actual_hours');
  const [roundingMethod, setRoundingMethod] = useState('round_15_mins');

  const breadcrumbItems = [
    { label: 'Trang chủ', href: '/app' },
    { label: 'Quản lý nhân sự', href: '/app/employees' },
    { label: 'Chính sách chấm công', href: '/app/attendances/policy' },
  ];

  const handleSave = () => {
    toast.success('Đã lưu cấu hình chính sách chấm công!');
  };

  return (
    <div className="flex h-full w-full flex-1 flex-col bg-slate-50 p-6 space-y-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Breadcrumb items={breadcrumbItems} />
        <div className="flex items-center gap-3">
          <div className="relative w-72">
            <Input
              placeholder="Tìm kiếm chính sách hoặc cài đặt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <Button
            variant="outline"
            className="gap-2 border-slate-200 text-slate-700 hover:bg-slate-100"
            leftIcon={<History size={16} />}
            onClick={() => {
              toast.loading('Tính năng lịch sử đang được phát triển')
              setTimeout(() => {
                toast.dismiss()
              }, 500)
            }}
          >
            Lịch sử thay đổi
          </Button>
          <Button
            variant="primary"
            className="gap-2"
            leftIcon={<Save size={16} />}
            onClick={handleSave}
          >
            Lưu thay đổi
          </Button>
        </div>
      </div>

      {/* Main Page Title Header */}
      <div>
        <Heading size="h2" className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          Chính sách & Cấu hình Chấm công
        </Heading>
        <p className="mt-1 text-sm text-slate-500">
          Thiết lập các quy tắc và phương pháp tính toán thời gian làm việc cho toàn hệ thống sản xuất.
        </p>
      </div>

      {/* Configuration Grid Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Card 1: Quy định giờ làm */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-teal-50 p-2.5 text-[#005c53]">
              <Clock size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Quy định giờ làm</h3>
              <p className="text-xs text-slate-500">Khung giờ làm việc chuẩn và thời gian nghỉ giữa ca</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Giờ bắt đầu & Kết thúc
              </label>
              <div className="flex items-center gap-2">
                <Input
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="text-center font-semibold text-slate-800"
                />
                <span className="text-slate-400 font-bold">—</span>
                <Input
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="text-center font-semibold text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Thời gian nghỉ trưa
              </label>
              <div className="flex items-center gap-2">
                <Input
                  value={breakStart}
                  onChange={(e) => setBreakStart(e.target.value)}
                  className="text-center font-semibold text-slate-800"
                />
                <span className="text-slate-400 font-bold">—</span>
                <Input
                  value={breakEnd}
                  onChange={(e) => setBreakEnd(e.target.value)}
                  className="text-center font-semibold text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Info Banner Box */}
          <div className="rounded-xl bg-blue-50/70 border border-blue-100 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs text-blue-800 font-medium">
              <Info size={16} className="text-blue-600 shrink-0" />
              <span>Hệ thống sẽ tự động trừ 1.5 giờ nghỉ trưa vào tổng công.</span>
            </div>
            <Checkbox
              label="Tự động trừ:"
              checked={autoSubtractLunch}
              onChange={(e) => setAutoSubtractLunch(e.target.checked)}
              className="text-xs font-semibold text-slate-700 shrink-0"
            />
          </div>
        </div>

        {/* Card 2: Đi muộn / Về sớm */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
              <AlertTriangle size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Đi muộn / Về sớm</h3>
              <p className="text-xs text-slate-500">Quy định xử lý đi muộn & trừ lương</p>
            </div>
          </div>

          <div className="space-y-4 pt-1">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                <span>Thời gian ân hạn (phút)</span>
                <Badge variant="warning" pill className="font-bold px-2.5">{gracePeriod} phút</Badge>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={gracePeriod}
                onChange={(e) => setGracePeriod(Number(e.target.value))}
                className="w-full accent-[#005c53] cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Quy tắc trừ lương
              </label>
              <Select
                value={deductionRule}
                onChange={(e) => setDeductionRule(e.target.value)}
                options={[
                  { label: 'Sau 15 phút - Trừ 0.25 công', value: 'after_15_minus_025' },
                  { label: 'Sau 30 phút - Trừ 0.5 công', value: 'after_30_minus_05' },
                  { label: 'Trừ theo số phút thực tế', value: 'actual_minutes' },
                ]}
              />
            </div>

            <div className="pt-1">
              <Checkbox
                label="Không cho phép đi muộn trong kỳ kiểm toán"
                checked={strictAudit}
                onChange={(e) => setStrictAudit(e.target.checked)}
                className="text-xs text-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Quy định ngày công */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-teal-50 p-2.5 text-[#005c53]">
              <Calendar size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Quy định ngày công</h3>
              <p className="text-xs text-slate-500">Số ngày công tiêu chuẩn hàng tháng</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Số ngày công chuẩn/tháng
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStandardWorkDays('24')}
                  className={`py-2.5 px-4 rounded-xl font-bold text-sm transition border ${standardWorkDays === '24'
                    ? 'bg-[#005c53] text-white border-[#005c53] shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                >
                  24 ngày
                </button>
                <button
                  type="button"
                  onClick={() => setStandardWorkDays('26')}
                  className={`py-2.5 px-4 rounded-xl font-bold text-sm transition border ${standardWorkDays === '26'
                    ? 'bg-[#005c53] text-white border-[#005c53] shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                >
                  26 ngày
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-3.5 space-y-1">
              <span className="text-xs font-bold text-slate-800 block">Định nghĩa 1 ngày công:</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Làm việc tối thiểu 7.5 giờ (không tính nghỉ trưa).
              </p>
            </div>
          </div>
        </div>

        {/* Card 4: Quy định tăng ca (OT) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
              <TrendingUp size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Quy định tăng ca (OT)</h3>
              <p className="text-xs text-slate-500">Hệ số nhân và điều kiện phê duyệt làm thêm giờ</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-4">
              <span className="text-xs font-semibold text-slate-500 block mb-1">Tối thiểu tính OT</span>
              <div className="flex items-baseline gap-1">
                <Input
                  value={minOTMinutes}
                  onChange={(e) => setMinOTMinutes(e.target.value)}
                  className="font-bold text-xl text-slate-900 border-none p-0 h-auto bg-transparent focus:ring-0 w-16"
                />
                <span className="text-xs font-medium text-slate-500">phút</span>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-4">
              <span className="text-xs font-semibold text-slate-500 block mb-1">Hệ số Ngày thường</span>
              <div className="flex items-baseline gap-1">
                <Input
                  value={weekdayOTMultiplier}
                  onChange={(e) => setWeekdayOTMultiplier(e.target.value)}
                  className="font-bold text-xl text-slate-900 border-none p-0 h-auto bg-transparent focus:ring-0 w-16"
                />
                <span className="text-xs font-medium text-slate-500">lần</span>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-4">
              <span className="text-xs font-semibold text-slate-500 block mb-1">Hệ số Cuối tuần</span>
              <div className="flex items-baseline gap-1">
                <Input
                  value={weekendOTMultiplier}
                  onChange={(e) => setWeekendOTMultiplier(e.target.value)}
                  className="font-bold text-xl text-slate-900 border-none p-0 h-auto bg-transparent focus:ring-0 w-16"
                />
                <span className="text-xs font-medium text-slate-500">lần</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-700">
              Yêu cầu phê duyệt OT bởi quản lý trực tiếp
            </span>
            <Switch
              checked={requireOTApproval}
              onChange={(e) => setRequireOTApproval(e.target.checked)}
            />
          </div>
        </div>

        {/* Card 5: Quy định nghỉ phép */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-teal-50 p-2.5 text-[#005c53]">
              <FileCheck size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Quy định nghỉ phép</h3>
              <p className="text-xs text-slate-500">Chế độ phép năm tiêu chuẩn</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-semibold text-slate-700">
              Số ngày phép năm mặc định
            </span>
            <div className="flex items-center gap-2">
              <Input
                value={defaultAnnualLeave}
                onChange={(e) => setDefaultAnnualLeave(e.target.value)}
                className="w-20 text-center font-bold text-slate-900"
              />
              <span className="text-xs font-medium text-slate-600">ngày</span>
            </div>
          </div>
        </div>

        {/* Card 6: Cách tính công & Formula */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-teal-50 p-2.5 text-[#005c53]">
              <Calculator size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Cách tính công & Formula</h3>
              <p className="text-xs text-slate-500">Cấu hình thuật toán làm tròn và phương thức quy đổi công</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Phương thức tính
              </label>
              <Select
                value={calcMethod}
                onChange={(e) => setCalcMethod(e.target.value)}
                options={[
                  { label: 'Tính theo giờ thực tế', value: 'actual_hours' },
                  { label: 'Tính theo ca cố định', value: 'fixed_shifts' },
                  { label: 'Quy đổi sản lượng sản xuất', value: 'production_output' },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Làm tròn thời gian
              </label>
              <Select
                value={roundingMethod}
                onChange={(e) => setRoundingMethod(e.target.value)}
                options={[
                  { label: 'Làm tròn 15 phút', value: 'round_15_mins' },
                  { label: 'Làm tròn 30 phút', value: 'round_30_mins' },
                  { label: 'Không làm tròn', value: 'exact' },
                ]}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
