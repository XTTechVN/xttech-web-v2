'use client';

import React from 'react';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Edit3,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  Headphones,
  LayoutDashboard,
  Lightbulb,
  MapPin,
  Menu,
  Navigation,
  Package,
  PanelLeftClose,
  PieChart,
  PlusCircle,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';

export function HeroDashboardMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[660px] pt-2 pb-6 sm:pr-12 lg:pr-14 select-none">
      {/* ================= MACBOOK PRO MOCKUP (EXACT DESKTOP DASHBOARD UI) ================= */}
      <div className="relative z-10">
        {/* Laptop Top Lid / Screen Bezel */}
        <div className="relative mx-auto overflow-hidden rounded-t-[14px] border-[5px] border-[#1e242b] bg-[#1e242b] shadow-[0_20px_50px_rgba(0,0,0,0.45)] ring-1 ring-white/20">
          {/* Webcam dot */}
          <div className="flex justify-center bg-[#1e242b] pb-1">
            <span className="h-1 w-1 rounded-full bg-slate-600" />
          </div>

          {/* Inner Screen Viewport - Exact replica of Desktop Dashboard */}
          <div className="grid grid-cols-12 overflow-hidden rounded-t-[6px] bg-[#f5f7f9] text-slate-800">
            {/* LEFT SIDEBAR (2 cols) */}
            <div className="hidden sm:flex sm:col-span-2 flex-col justify-between border-r border-slate-200/80 bg-white text-[5.5px] whitespace-nowrap">
              <div>
                {/* Logo Row */}
                <div className="flex items-center justify-between border-b border-slate-100 px-2 py-1.5">
                  <div className="flex items-center gap-1">
                    <div className="flex h-3.5 w-3.5 items-center justify-center rounded bg-primary text-[6px] font-black text-white">
                      XT
                    </div>
                    <div className="leading-none">
                      <div className="text-[7px] font-black tracking-tight text-primary">XTTECH</div>
                      <div className="text-[5px] text-slate-400">v2.1.2</div>
                    </div>
                  </div>
                  <PanelLeftClose className="h-2.5 w-2.5 text-slate-400" />
                </div>

                {/* Menu Groups */}
                <div className="space-y-1.5 p-1.5">
                  {/* ĐIỀU HÀNH */}
                  <div className="space-y-0.5">
                    <div className="px-1 text-[4.8px] font-bold uppercase tracking-wider text-slate-400">
                      ĐIỀU HÀNH
                    </div>
                    <div className="flex items-center gap-1 rounded bg-[#e8f2f3] px-1.5 py-0.5 font-bold text-primary">
                      <LayoutDashboard className="h-2 w-2 shrink-0" />
                      <span>Tổng quan</span>
                    </div>
                    <div className="flex items-center gap-1 px-1.5 py-0.5 text-slate-600">
                      <MapPin className="h-2 w-2 shrink-0 text-slate-400" />
                      <span>Bản đồ trực tiếp</span>
                    </div>
                  </div>

                  {/* NHÂN SỰ & CHẤM CÔNG */}
                  <div className="space-y-0.5">
                    <div className="px-1 text-[4.8px] font-bold uppercase tracking-wider text-slate-400">
                      NHÂN SỰ & CHẤM CÔNG
                    </div>
                    <div className="flex items-center gap-1 px-1.5 py-0.5 text-slate-600">
                      <ClipboardCheck className="h-2 w-2 shrink-0 text-slate-400" />
                      <span>Công việc & Giao việc</span>
                    </div>
                    <div className="flex items-center justify-between px-1.5 py-0.5 text-slate-600">
                      <span className="flex items-center gap-1">
                        <Users className="h-2 w-2 shrink-0 text-slate-400" />
                        <span>Nhân sự</span>
                      </span>
                      <ChevronRight className="h-2 w-2 text-slate-300" />
                    </div>
                    <div className="flex items-center justify-between px-1.5 py-0.5 text-slate-600">
                      <span className="flex items-center gap-1">
                        <Clock className="h-2 w-2 shrink-0 text-slate-400" />
                        <span>Chấm công</span>
                      </span>
                      <ChevronRight className="h-2 w-2 text-slate-300" />
                    </div>
                    <div className="flex items-center gap-1 px-1.5 py-0.5 text-slate-600">
                      <FileText className="h-2 w-2 shrink-0 text-slate-400" />
                      <span>Nghỉ phép & Đơn từ</span>
                    </div>
                    <div className="flex items-center gap-1 px-1.5 py-0.5 text-slate-600">
                      <AlertCircle className="h-2 w-2 shrink-0 text-slate-400" />
                      <span>Khiếu nại công</span>
                    </div>
                    <div className="flex items-center gap-1 px-1.5 py-0.5 text-slate-600">
                      <Lightbulb className="h-2 w-2 shrink-0 text-slate-400" />
                      <span>Sáng kiến & Đề xuất</span>
                    </div>
                  </div>

                  {/* DỰ ÁN & ĐỐI TÁC */}
                  <div className="space-y-0.5">
                    <div className="px-1 text-[4.8px] font-bold uppercase tracking-wider text-slate-400">
                      DỰ ÁN & ĐỐI TÁC
                    </div>
                    <div className="flex items-center gap-1 px-1.5 py-0.5 text-slate-600">
                      <FolderKanban className="h-2 w-2 shrink-0 text-slate-400" />
                      <span>Dự án</span>
                    </div>
                    <div className="flex items-center gap-1 px-1.5 py-0.5 text-slate-600">
                      <FileSpreadsheet className="h-2 w-2 shrink-0 text-slate-400" />
                      <span>Duyệt báo giá</span>
                    </div>
                    <div className="flex items-center gap-1 px-1.5 py-0.5 text-slate-600">
                      <Package className="h-2 w-2 shrink-0 text-slate-400" />
                      <span>Quản lý kho</span>
                    </div>
                    <div className="flex items-center justify-between px-1.5 py-0.5 text-slate-600">
                      <span className="flex items-center gap-1">
                        <Settings className="h-2 w-2 shrink-0 text-slate-400" />
                        <span>Cấu hình dự án</span>
                      </span>
                      <ChevronRight className="h-2 w-2 text-slate-300" />
                    </div>
                    <div className="flex items-center justify-between px-1.5 py-0.5 text-slate-600">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-2 w-2 shrink-0 text-slate-400" />
                        <span>Khách hàng & Đối tác</span>
                      </span>
                      <ChevronRight className="h-2 w-2 text-slate-300" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Support Footer Box */}
              <div className="m-1.5 rounded-md border border-slate-200/80 bg-slate-50/70 p-1.5 whitespace-normal">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[5.5px] font-bold text-slate-800">
                    <Headphones className="h-2 w-2 text-primary" /> Hỗ trợ kỹ thuật
                  </span>
                  <span className="rounded bg-sky-100 px-1 text-[4.5px] font-bold text-sky-600">
                    Zalo
                  </span>
                </div>
                <p className="mt-0.5 text-[4.5px] leading-tight text-slate-400">
                  Liên hệ để đóng góp ý kiến hoặc phản hồi sự cố hệ thống
                </p>
                <div className="mt-1 rounded bg-primary py-0.5 text-center text-[5px] font-bold text-white">
                  Mở nhóm hỗ trợ ↗
                </div>
              </div>
            </div>

            {/* RIGHT MAIN WORKSPACE (10 cols) */}
            <div className="col-span-12 sm:col-span-10 flex flex-col">
              {/* Top Bar: Search + User Profile */}
              <div className="flex items-center justify-between border-b border-slate-200/80 bg-white px-2.5 py-1">
                <div className="flex items-center gap-1 rounded-md border border-slate-200/70 bg-slate-50 px-2 py-0.5 text-[6px] text-slate-400 w-44">
                  <Search className="h-2 w-2" />
                  <span>Tìm kiếm hệ thống...</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="text-right leading-none">
                    <div className="text-[6.5px] font-bold text-slate-800">System Administrator</div>
                    <div className="mt-0.5 text-[5px] text-slate-400">Super Admin</div>
                  </div>
                  <div className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[6px] font-bold text-primary">
                    SA
                  </div>
                </div>
              </div>

              {/* Breadcrumb Bar */}
              <div className="border-b border-slate-200/60 bg-white px-2.5 py-0.5 text-[6px] font-semibold text-primary">
                Trang chủ
              </div>

              {/* Dashboard Body */}
              <div className="space-y-1.5 p-2">
                {/* 4 Top KPI Cards */}
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: 'Tổng nhân sự', value: '16', icon: Users },
                    { label: 'Chuyên cần hôm nay', value: '24', icon: CheckCircle2 },
                    { label: 'Hồ sơ chờ phê duyệt', value: '1', icon: Clock },
                    { label: 'Dự án đang triển khai', value: '4', icon: FolderKanban },
                  ].map((kpi) => {
                    const Icon = kpi.icon;
                    return (
                      <div
                        key={kpi.label}
                        className="rounded-lg border border-slate-200/60 bg-white p-1.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex h-4 w-4 items-center justify-center rounded-md bg-primary/8 text-primary">
                            <Icon className="h-2.5 w-2.5" />
                          </span>
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-1 py-0.5 text-[5.5px] font-bold text-emerald-600">
                            <TrendingUp className="h-2 w-2" /> 0%
                          </span>
                        </div>
                        <div className="mt-1 truncate text-[6px] font-medium text-slate-500">
                          {kpi.label}
                        </div>
                        <div className="text-[11px] font-black leading-tight text-primary">
                          {kpi.value}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Main 2 Columns (8 cols left + 4 cols right) */}
                <div className="grid grid-cols-12 gap-1.5">
                  {/* Left 8 Cols */}
                  <div className="col-span-8 space-y-1.5">
                    {/* Card 1: CÔNG VIỆC & NHẮC VIỆC CỦA TÔI */}
                    <div className="rounded-lg border border-slate-200/60 bg-white p-2 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="flex h-4 w-4 items-center justify-center rounded-md bg-primary/8 text-primary">
                            <ClipboardCheck className="h-2.5 w-2.5" />
                          </span>
                          <div>
                            <div className="text-[6.5px] font-extrabold uppercase text-slate-800">
                              CÔNG VIỆC & NHẮC VIỆC CỦA TÔI
                            </div>
                            <div className="text-[5.5px] text-slate-400">
                              Theo dõi hạn hoàn thành công việc & lịch bảo hành được giao
                            </div>
                          </div>
                        </div>
                        <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[5.5px] font-semibold text-primary whitespace-nowrap">
                          Mở bảng công việc →
                        </span>
                      </div>

                      <div className="mt-1.5 grid grid-cols-4 gap-1 text-[5.8px] whitespace-nowrap">
                        <div className="rounded-md border border-slate-200/70 bg-slate-50/50 px-1.5 py-1">
                          <div className="text-slate-500">Cần thực hiện</div>
                          <div className="mt-0.5 text-[9px] font-black text-primary">0</div>
                        </div>
                        <div className="rounded-md border border-amber-200/70 bg-amber-50/40 px-1.5 py-1">
                          <div className="text-amber-700">Sắp hết hạn (24h)</div>
                          <div className="mt-0.5 text-[9px] font-black text-amber-600">0</div>
                        </div>
                        <div className="rounded-md border border-rose-200/70 bg-rose-50/40 px-1.5 py-1">
                          <div className="text-rose-700">Quá hạn</div>
                          <div className="mt-0.5 text-[9px] font-black text-rose-600">0</div>
                        </div>
                        <div className="rounded-md border border-emerald-200/70 bg-emerald-50/40 px-1.5 py-1">
                          <div className="text-emerald-700">Xong hôm nay</div>
                          <div className="mt-0.5 text-[9px] font-black text-emerald-600">0</div>
                        </div>
                      </div>

                      <div className="mt-1 flex items-center gap-1 text-[5.5px] font-medium text-emerald-600">
                        <CheckCircle2 className="h-2 w-2" />
                        <span>Tuyệt vời! Bạn đã hoàn thành toàn bộ công việc được giao.</span>
                      </div>
                    </div>

                    {/* Card 2: Báo cáo dự án */}
                    <div className="rounded-lg border border-slate-200/60 bg-white p-2 shadow-2xs">
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex items-start gap-1.5">
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-md bg-primary/8 text-primary">
                            <FolderKanban className="h-2.5 w-2.5" />
                          </span>
                          <div>
                            <div className="flex items-center gap-1 whitespace-nowrap">
                              <span className="text-[7px] font-extrabold text-slate-800">
                                Báo cáo dự án
                              </span>
                              <span className="rounded bg-primary/10 px-1 py-0.2 text-[5.2px] font-semibold text-primary">
                                4 công trình
                              </span>
                              <span className="rounded bg-slate-100 px-1 py-0.2 text-[5.2px] text-slate-600">
                                28 bộ cửa · 79.56 m²
                              </span>
                            </div>
                            <div className="text-[5.2px] text-slate-400">
                              Tổng hợp dòng tiền hợp đồng, tiến độ sản xuất cửa và bảo hành toàn công ty
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5 rounded-md border border-slate-200 p-0.5 text-[5.2px] whitespace-nowrap">
                          <span className="inline-flex items-center gap-0.5 rounded bg-primary px-1 py-0.5 font-bold text-white">
                            <BarChart3 className="h-2 w-2" /> Cột
                          </span>
                          <span className="inline-flex items-center gap-0.5 px-1 py-0.5 text-slate-500">
                            <PieChart className="h-2 w-2" /> Tròn
                          </span>
                          <span className="inline-flex items-center gap-0.5 px-1 py-0.5 text-slate-500">
                            <Activity className="h-2 w-2" /> Sóng
                          </span>
                        </div>
                      </div>

                      {/* 3 Financial Boxes */}
                      <div className="mt-1.5 grid grid-cols-3 gap-1 text-[5.8px] whitespace-nowrap">
                        <div className="rounded-md border border-slate-200/70 bg-slate-50/40 p-1.5">
                          <div className="text-slate-400">Giá trị hợp đồng</div>
                          <div className="mt-0.5 font-mono text-[8px] font-black text-slate-900">
                            315.562.575 ₫
                          </div>
                        </div>
                        <div className="rounded-md border border-emerald-200/70 bg-emerald-50/30 p-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Đã thu</span>
                            <span className="rounded bg-emerald-100 px-1 text-[5px] font-bold text-emerald-700">
                              32%
                            </span>
                          </div>
                          <div className="mt-0.5 font-mono text-[8px] font-black text-primary">
                            100.000.000 ₫
                          </div>
                        </div>
                        <div className="rounded-md border border-slate-200/70 bg-slate-50/40 p-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Còn phải thu</span>
                            <span className="rounded bg-slate-200 px-1 text-[5px] font-bold text-slate-600">
                              68%
                            </span>
                          </div>
                          <div className="mt-0.5 font-mono text-[8px] font-black text-slate-900">
                            215.562.575 ₫
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar + Labels */}
                      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full w-[32%] rounded-full bg-primary" />
                      </div>
                      <div className="mt-0.5 flex items-center justify-between text-[5px] text-slate-500">
                        <span className="flex items-center gap-0.5">
                          <span className="h-1 w-1 rounded-full bg-primary" />
                          Đã thanh toán: <b>32%</b> (100.000.000 ₫)
                        </span>
                        <span className="flex items-center gap-0.5">
                          <span className="h-1 w-1 rounded-full bg-slate-400" />
                          Công nợ còn lại: <b>68%</b> (215.562.575 ₫)
                        </span>
                      </div>

                      {/* Giai đoạn công trình (4) */}
                      <div className="mt-1.5">
                        <div className="text-[5.5px] font-semibold text-slate-600">
                          Giai đoạn công trình (4)
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[5px] whitespace-nowrap">
                          {[
                            'Thiết kế bóc tách: 1',
                            'Lập báo giá: 1',
                            'Đã ký hợp đồng: 1',
                            'Đang sản xuất: 1',
                          ].map((stage) => (
                            <span
                              key={stage}
                              className="inline-flex items-center gap-0.5 rounded border border-slate-200 bg-slate-50 px-1 py-0.2 font-medium text-slate-700"
                            >
                              <span className="h-1 w-1 rounded-full bg-primary" />
                              {stage}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Chart Sub-tabs + Bars */}
                      <div className="mt-1.5 flex items-center justify-between text-[5px]">
                        <div className="inline-flex rounded bg-slate-100 p-0.5">
                          <span className="rounded bg-white px-1.5 py-0.2 font-bold text-slate-800 shadow-2xs">
                            Tiến độ bộ cửa (Bộ & m²)
                          </span>
                          <span className="px-1.5 py-0.2 text-slate-500">Giai đoạn công trình</span>
                        </div>
                        <span className="text-slate-400">Tổng cộng 28 bộ cửa (79.56 m²)</span>
                      </div>

                      <div className="mt-1 flex items-end gap-4 border-b border-slate-100 pb-0.5 pl-2 h-8 text-[5px] text-slate-400">
                        <div className="flex flex-col justify-between h-full pr-1">
                          <span>12</span>
                          <span>9</span>
                        </div>
                        <div className="h-7 w-4 rounded-t bg-primary" />
                        <div className="h-4 w-4 rounded-t bg-primary" />
                      </div>
                    </div>
                  </div>

                  {/* Right 4 Cols: Live GPS + Hoạt động gần đây */}
                  <div className="col-span-4 space-y-1.5">
                    {/* Card 1: Nhân sự thực địa (Live GPS) */}
                    <div className="rounded-lg border border-slate-200/60 bg-white p-2 shadow-2xs">
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex items-center gap-1">
                          <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded bg-primary/8 text-primary">
                            <Navigation className="h-2 w-2" />
                          </span>
                          <div className="leading-none">
                            <div className="text-[6.2px] font-extrabold text-slate-800">
                              Nhân sự thực địa (Live GPS)
                            </div>
                            <div className="mt-0.5 text-[5px] text-slate-400">
                              Kỹ thuật viên đang bật định vị
                            </div>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1 py-0.2 text-[5px] font-bold text-emerald-600 whitespace-nowrap">
                          <span className="h-1 w-1 rounded-full bg-emerald-500" /> 8 online
                        </span>
                      </div>

                      <div className="mt-1.5 space-y-1">
                        {[
                          {
                            name: 'Bùi Xuân Đức',
                            coords: '20.7704, 106.7349',
                            time: '17:52',
                            bg: 'bg-rose-100 text-rose-700',
                            init: 'Đ',
                          },
                          {
                            name: 'Cao Đắc Lăng',
                            coords: '20.7252, 106.7462',
                            time: '17:55',
                            bg: 'bg-amber-100 text-amber-700',
                            init: 'L',
                          },
                          {
                            name: 'Hoàng Văn Tuấn',
                            coords: '20.7255, 106.7461',
                            time: '17:55',
                            bg: 'bg-slate-200 text-slate-700',
                            init: 'T',
                          },
                          {
                            name: 'Lê Trọng Thái',
                            coords: '20.7253, 106.7462',
                            time: '17:55',
                            bg: 'bg-teal-50 text-primary',
                            init: 'L',
                          },
                        ].map((staff) => (
                          <div
                            key={staff.name}
                            className="flex items-center justify-between rounded border border-slate-100 bg-slate-50/60 px-1.5 py-0.5 whitespace-nowrap"
                          >
                            <div className="flex items-center gap-1 min-w-0">
                              <span
                                className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[5.5px] font-bold ${staff.bg}`}
                              >
                                {staff.init}
                              </span>
                              <div className="min-w-0 leading-tight">
                                <div className="truncate text-[5.8px] font-bold text-slate-800">
                                  {staff.name}
                                </div>
                                <div className="font-mono text-[5px] text-emerald-600">
                                  {staff.coords}
                                </div>
                              </div>
                            </div>
                            <span className="font-mono text-[5px] text-slate-400">{staff.time}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-1.5 flex items-center justify-between border-t border-slate-100 pt-1 text-[5.2px] font-semibold text-primary">
                        <span>Mở bản đồ giám sát toàn màn hình</span>
                        <ArrowUpRight className="h-2 w-2" />
                      </div>
                    </div>

                    {/* Card 2: Hoạt động gần đây */}
                    <div className="rounded-lg border border-slate-200/60 bg-white p-2 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="flex h-3.5 w-3.5 items-center justify-center rounded bg-primary/8 text-primary">
                            <Activity className="h-2 w-2" />
                          </span>
                          <div className="leading-none">
                            <div className="text-[6.2px] font-extrabold text-slate-800">
                              Hoạt động gần đây
                            </div>
                            <div className="mt-0.5 text-[4.8px] text-slate-400">
                              Nhật ký và biến động thao tác trên hệ thống
                            </div>
                          </div>
                        </div>
                        <RefreshCw className="h-2 w-2 text-slate-400" />
                      </div>

                      <div className="mt-1.5 space-y-1 text-[5px] leading-snug">
                        <div className="flex items-start gap-1 rounded border border-slate-100 bg-slate-50/50 p-1">
                          <PlusCircle className="mt-0.5 h-2.5 w-2.5 shrink-0 text-emerald-500" />
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-slate-700">
                              <b>System Administrator</b> đã thêm mới news articles{' '}
                              <span className="font-semibold text-primary">
                                &ldquo;Làm sao để chủ xưởng nhôm kính nắm được tiến độ...&rdquo;
                              </span>
                            </p>
                            <span className="text-[4.5px] text-slate-400">49 phút trước</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-1 rounded border border-slate-100 bg-slate-50/50 p-1">
                          <Edit3 className="mt-0.5 h-2.5 w-2.5 shrink-0 text-amber-500" />
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-slate-700">
                              <b>System Administrator</b> đã cập nhật news articles{' '}
                              <span className="font-semibold text-amber-700">
                                &ldquo;ÁP LỰC DÒNG TIỀN CỦA CHỦ XƯỞNG NHÔM KÍNH...&rdquo;
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Realistic MacBook Aluminum Base / Deck */}
        <div className="relative -mx-2 sm:-mx-4">
          <div className="h-2.5 w-full rounded-t-[2px] rounded-b-lg bg-linear-to-r from-slate-400 via-slate-200 to-slate-400 shadow-md">
            <div className="mx-auto h-1 w-16 rounded-b-md bg-slate-500/70" />
          </div>
          <div className="mx-auto h-1 w-[94%] rounded-b-xl bg-slate-800/90 shadow-2xl" />
        </div>
      </div>

      {/* ================= IPHONE MOCKUP (OVERLAPPING BOTTOM-RIGHT) ================= */}
      <div className="mt-5 mx-auto w-[190px] sm:mt-0 sm:mx-0 sm:w-[175px] lg:w-[185px] sm:absolute sm:right-0 sm:bottom-0 z-20">
        <div className="overflow-hidden rounded-[26px] border-[5px] border-[#181d23] bg-[#f4f7f8] shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/30">
          {/* iPhone Notch */}
          <div className="bg-white pt-1">
            <div className="mx-auto h-2 w-14 rounded-full bg-[#181d23]" />
          </div>

          {/* Mobile App Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-white px-2.5 py-1">
            <Menu className="h-3 w-3 text-slate-700" />
            <span className="text-[7.5px] font-bold text-primary">Trang chủ</span>
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 text-[6.5px] font-bold text-slate-700">
              SA
            </div>
          </div>

          <div className="space-y-1.5 p-2">
            {/* Greeting Card */}
            <div className="rounded-xl border border-slate-100 bg-white p-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-[8.5px] font-black text-primary">
                  S
                </div>
                <div className="min-w-0 leading-tight">
                  <div className="flex items-center gap-0.5 text-[6.5px] text-slate-500">
                    <span>Chào buổi chiều</span>
                    <Sparkles className="h-2 w-2 text-amber-500" />
                  </div>
                  <div className="truncate text-[7.5px] font-extrabold text-slate-900">
                    System Administrator
                  </div>
                  <div className="text-[6px] font-semibold text-primary">Trưởng phòng</div>
                </div>
              </div>
              <div className="mt-1 flex items-center gap-1 border-t border-slate-100 pt-1 text-[6px] text-slate-500">
                <Calendar className="h-2 w-2 text-primary" />
                <span>Thứ Ba, 10/11/2026</span>
              </div>
            </div>

            {/* Dark Teal Attendance Card */}
            <div className="rounded-xl bg-linear-to-br from-[#045863] to-[#023840] p-2 text-white shadow-xs">
              <div className="flex items-center justify-between gap-1 whitespace-nowrap">
                <div className="flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5 text-teal-200 shrink-0" />
                  <div className="leading-tight">
                    <div className="text-[7px] font-bold">Ca làm việc linh hoạt</div>
                    <div className="text-[5.5px] text-teal-100/80">Thời gian làm việc linh hoạt</div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-white/15 px-1 py-0.5 text-[5.5px] font-semibold text-teal-100">
                  <ShieldCheck className="h-2 w-2" /> Chính thức
                </span>
              </div>

              <div className="mt-1.5 grid grid-cols-2 rounded-lg bg-black/20 p-1 text-[6px] whitespace-nowrap">
                <div className="border-r border-white/10 pr-1">
                  <div className="text-teal-100/70">GIỜ VÀO</div>
                  <div className="mt-0.5 font-bold text-[#d6ff3d]">Chưa vào ca</div>
                </div>
                <div className="pl-1.5">
                  <div className="text-teal-100/70">GIỜ RA</div>
                  <div className="mt-0.5 font-mono text-white/80">--:--</div>
                </div>
              </div>

              <div className="mt-1.5 flex items-center justify-center gap-1 rounded-lg bg-white py-1 text-[7px] font-bold text-primary whitespace-nowrap">
                <span>Chấm công vào ca ngay</span>
                <ArrowRight className="h-2 w-2" />
              </div>
            </div>

            {/* Tiện ích doanh nghiệp (10 tính năng) */}
            <div className="rounded-xl border border-slate-100 bg-white p-1.5 shadow-2xs">
              <div className="flex items-center justify-between text-[6px] whitespace-nowrap">
                <span className="font-extrabold uppercase tracking-wider text-slate-800">
                  TIỆN ÍCH DOANH NGHIỆP
                </span>
                <span className="text-slate-400">10 tính năng</span>
              </div>

              <div className="mt-1 grid grid-cols-4 gap-y-1 gap-x-0.5 text-center text-[5.5px] font-medium text-slate-700 whitespace-nowrap">
                {[
                  { label: 'Công việc', icon: ClipboardCheck, bg: 'bg-teal-50 text-primary' },
                  { label: 'Bản đồ Live', icon: MapPin, bg: 'bg-emerald-50 text-emerald-600' },
                  { label: 'Nghỉ phép', icon: Calendar, bg: 'bg-amber-50 text-amber-600' },
                  {
                    label: 'Khiếu nại',
                    icon: AlertCircle,
                    bg: 'bg-blue-50 text-blue-600',
                    badge: '1',
                  },
                  { label: 'Bảng công', icon: CalendarCheck, bg: 'bg-purple-50 text-purple-600' },
                  { label: 'Lịch đi làm', icon: Clock, bg: 'bg-teal-50 text-teal-600' },
                  { label: 'Dự án', icon: Building2, bg: 'bg-sky-50 text-sky-600' },
                  { label: 'Nhân sự', icon: Users, bg: 'bg-indigo-50 text-indigo-600' },
                  { label: 'Góp ý', icon: Lightbulb, bg: 'bg-rose-50 text-rose-500' },
                  { label: 'Báo cáo', icon: BarChart3, bg: 'bg-emerald-50 text-emerald-600' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex flex-col items-center gap-0.5">
                      <div
                        className={`relative flex h-5 w-5 items-center justify-center rounded-md ${item.bg}`}
                      >
                        <Icon className="h-2.5 w-2.5" />
                        {item.badge && (
                          <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2 items-center justify-center rounded-full bg-red-500 text-[4.5px] font-bold text-white">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Home Indicator */}
          <div className="bg-white pb-1 pt-0.5">
            <div className="mx-auto h-0.5 w-12 rounded-full bg-slate-800" />
          </div>
        </div>
      </div>
    </div>
  );
}
