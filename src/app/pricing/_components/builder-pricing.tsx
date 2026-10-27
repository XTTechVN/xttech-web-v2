import React from 'react';
import { 
  CheckCircle2, 
  ExternalLink, 
  ShieldCheck, 
  Users, 
  HardDrive, 
  Zap, 
  Layers, 
  FileText, 
  Settings, 
  HelpCircle,
  Clock,
  RefreshCw
} from 'lucide-react';

// 1. DỮ LIỆU MOCKUP CHUẨN DÀNH CHO XƯỞNG NHÔM & NỘI THẤT
const PRICING_DATA = {
  header: {
    title: "Ngành xây dựng và đội thợ",
    badge: "Số công trình",
    subTitle: "XMS Build — Công trình, kho bãi, nhân công",
    slug: "/bang-gia-xây dựng",
    resetNote: "Reset mùng 1 hàng tháng",
    billingCycleNote: "Theo tháng / năm",
  },
  plans: [
    {
      id: "free",
      name: "MIỄN PHÍ",
      price: "Miễn phí",
      priceSubText: "Mãi mãi • Không cần thẻ",
      monthlyCalc: null,
      saveBadge: null,
      buttonText: "Dùng thử 20 cửa miễn phí",
      footerNote: "Không cần thẻ",
      isPopular: false,
    },
    {
      id: "doi-nho",
      name: "Đội Nhỏ",
      price: "4.900.000đ",
      priceUnit: "/năm",
      priceSubText: null,
      monthlyCalc: "~408.333đ/tháng",
      saveBadge: "Tiết kiệm 20%",
      buttonText: "Chọn Đội Nhỏ",
      footerNote: "Bắt đầu ngay",
      isPopular: false,
    },
    {
      id: "doi-lon",
      name: "Đội lớn",
      price: "9.900.000đ",
      priceUnit: "/năm",
      priceSubText: null,
      monthlyCalc: "~825.000đ/tháng",
      saveBadge: "Tiết kiệm 20%",
      buttonText: "Chọn đội lớn",
      footerNote: "Phổ biến nhất",
      isPopular: true,
    },
    {
      id: "tong-thau",
      name: "TỔNG THẦU",
      price: "24.900.000đ",
      priceUnit: "/năm",
      priceSubText: null,
      monthlyCalc: "~2.075.000đ/tháng",
      saveBadge: "Tiết kiệm 20%",
      buttonText: "Liên hệ Tổng Thầu",
      footerNote: "Không giới hạn",
      isPopular: false,
    },
  ],
  featureGroups: [
    {
      groupTitle: "BỘ NHỚ & GIỚI HẠN",
      rows: [
        {
          label: "Số hóa đơn / tháng",
          icon: ShieldCheck,
          values: [
            { main: "10", sub: "tổng cả đời", check: true },
            { main: "100", sub: "công trình / tháng, reset mùng 1", check: true },
            { main: "500", sub: "công trình / tháng", check: true },
            { main: "Không giới hạn", sub: "∞", check: true },
          ],
        },
        {
          label: "Số nhân sự",
          icon: Users,
          values: [
            { main: "3 nhân sự", sub: null, check: true },
            { main: "10 nhân sự", sub: null, check: true },
            { main: "30 nhân sự", sub: null, check: true },
            { main: "Không giới hạn", sub: null, check: true },
          ],
        },
        {
          label: "Dung lượng lưu trữ",
          icon: HardDrive,
          values: [
            { main: "3 GB", sub: null, check: true },
            { main: "20 GB", sub: null, check: true },
            { main: "100 GB", sub: null, check: true },
            { main: "1 TB", sub: "1024 GB", check: true },
          ],
        },
      ],
    },
    {
      groupTitle: "MODULE & TÍNH NĂNG",
      rows: [
        {
          label: "Module Cấu hình dự án",
          icon: Layers,
          values: [
            { main: "0", sub: "Chưa hỗ trợ", check: true },
            { main: "0", sub: "Chưa hỗ trợ", check: true },
            { main: "0", sub: "Chưa hỗ trợ", check: true },
            { main: "0", sub: "Chưa hỗ trợ", check: true },
          ],
        },
         {
          label: "Dự án và kho",
          icon: Layers,
          values: [
            { main: "0", sub: "Chưa hỗ trợ", check: true },
            { main: "0", sub: "Chưa hỗ trợ", check: true },
            { main: "0", sub: "Chưa hỗ trợ", check: true },
            { main: "0", sub: "Chưa hỗ trợ", check: true },
          ],
        },
        {
          label: "Dự án và kho vật tư",
          icon: HelpCircle,
          values: [
            { main: "10", sub: null, check: true },
            { main: "50", sub: null, check: true },
            { main: "200", sub: null, check: true },
            { main: "full", sub: null, check: true },
          ],
        },
        {
          label: "Nhân sự và chấm công GPS",
          icon: FileText,
          values: [
            { main: "Thử 3 người", sub: "giới hạn", check: true },
            { main: "10 người", sub: null, check: true },
            { main: "20 người", sub: null, check: true },
            { main: "Không giới hạn", sub: null, check: true },
          ],
        },
        {
          label: "Kế toán",
          icon: Settings,
          values: [
            { main: "Chỉ xem", sub: "Chỉ xem", check: true },
            { main: "100 HĐ", sub: "Giao việc", check: true },
            { main: "500 HĐ", sub: "QR + Bảo hành", check: true },
            { main: "Full" , sub: null, check: true },
          ],
        },
        
      ],
    },
  ],
  addOns: [
    { text: "+100 cửa", price: "99k" },
    { text: "+10 nhân sự", price: "99k" },
    { text: "+20GB", price: "99k" },
  ],
  footerNote: "*Áp dụng cho gói 1 gói 2 tự động cộng vào tháng sau",
};

// 2. COMPONENT CHÍNH RENDER UI
const BuiderSpicing = () => {
  const { header, plans, featureGroups, addOns, footerNote } = PRICING_DATA;

  return (
  <div className="w-full bg-white px-20 py-4 font-sans text-[#0A192F]">
      <div className="w-full space-y-4">
        
        {/* HEADER TOP SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-primary">
                <Layers className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2">
                {header.title}
                <ExternalLink className="w-4 h-4 text-primary" />
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-medium">
                {header.badge}
              </span>
              <span className="text-gray-500">{header.subTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
            <div className="flex items-center gap-1.5">
              {header.resetNote}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              {header.billingCycleNote}
            </div>
          </div>
        </div>

        {/* PRICING MATRIX CONTAINER */}
        <div className="bg-white border border-gray-200/80 rounded-lg overflow-visible shadow-sm">
          
          {/* HEADER ROW - PRICE CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-5 border-b border-gray-200/80 divide-y md:divide-y-0 md:divide-x divide-gray-200/80">
            
            {/* Cột 1: Thông tin mô tả bên trái */}
            <div className="p-6 bg-white flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  SO SÁNH TÍNH NĂNG
                </span>
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-600 font-medium">
                  <ShieldCheck className="w-4 h-4 text-gray-400" />
                  Google One style • minh bạch
                </div>
              </div>
            </div>

            {/* Map 4 gói giá */}
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`p-6 relative flex flex-col justify-between transition-all ${
                  plan.isPopular
                    ? "bg-[#0A192F] text-white shadow-xl z-10 rounded-t-xl md:rounded-none"
                    : "bg-white text-[#0A192F]"
                }`}
              >
                {/* Badge Bán chạy nhất */}
                 {plan.isPopular && (
                  <div className="absolute -top-3 right-6 bg-red-500 text-white text-sm font-extrabold px-3 py-1 rounded-full whitespace-nowrap shadow-sm z-20">
                    Bán chạy nhất
                  </div>
                )}
                <div>
                  {/* Plan Name */}
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      plan.isPopular ? "text-primary" : "text-primary"
                    }`}
                  >
                    {plan.name}
                  </span>

                  {/* Price */}
                  <div className="mt-3">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl lg:text-3xl font-extrabold tracking-tight">
                        {plan.price}
                      </span>
                      {plan.priceUnit && (
                        <span
                          className={`text-xs font-medium ${
                            plan.isPopular ? "text-white" : "text-primary"
                          }`}
                        >
                        </span>
                      )}
                    </div>
                    {plan.priceSubText && (
                      <p className="text-xs text-gray-400 mt-1">{plan.priceSubText}</p>
                    )}
                  </div>

                  {/* Monthly Calculation & Save Badge */}
                  {plan.monthlyCalc && (
                    <div className="mt-3 flex flex-wrap items-center gap-1.5 bg-primary text-white text-[11px] font-bold px-2 py-1 rounded-lg">
                      <span>{plan.monthlyCalc}</span>
                      <span>{plan.saveBadge}</span>
                    </div>
                  )}
                </div>

                {/* Button & Subtext */}
                <div className="mt-6 space-y-2">
                  <button
                    className={`w-full py-2.5 px-4 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      plan.isPopular
                        ? "bg-primary text-[#0A192F] hover:bg-primary/80"
                        : plan.id === "free"
                        ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        : "bg-[#0A192F] text-white hover:bg-slate-800"
                    }`}
                  >
                    {plan.buttonText}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <p
                    className={`text-[11px] text-center ${
                      plan.isPopular ? "text-gray-400" : "text-gray-400"
                    }`}
                  >
                    {plan.footerNote}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* FEATURE COMPARISON MATRIX (MAP NHÓM TÍNH NĂNG) */}
          {featureGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="border-b border-gray-200/80 last:border-b-0">
              {/* Header của từng nhóm tính năng */}
              <div className="bg-[#F5F6F0]/80 px-6 py-2.5 border-t border-b border-gray-200/80">
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                  {group.groupTitle}
                </span>
              </div>

              {/* Các hàng tính năng */}
              <div className="divide-y divide-gray-100">
                {group.rows.map((row, rowIdx) => {
                  const RowIcon = row.icon;
                  return (
                    <div
                      key={rowIdx}
                      className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-gray-200/80 items-center hover:bg-slate-50/50 transition-colors"
                    >
                      {/* Cột 1: Tên đặc tính */}
                      <div className="p-4 px-6 flex items-center gap-2.5 text-xs font-semibold text-gray-700 bg-white">
                        {RowIcon && <RowIcon className="w-4 h-4 text-primary shrink-0" />}
                        <span className='text-black'>{row.label}</span>
                      </div>

                      {/* 4 Cột tương ứng 4 gói */}
                      {row.values.map((val, valIdx) => {
                        const isPopularColumn = plans[valIdx]?.isPopular;
                        return (
                          <div
                            key={valIdx}
                            className={`p-4 px-6 text-center flex flex-col items-center justify-center min-h-[64px] ${
                              isPopularColumn ? "bg-slate-50/70" : "bg-white"
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-gray-900">
                                {val.main}
                              </span>
                              {val.check && (
                                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                              )}
                            </div>
                            {val.sub && (
                              <span className="text-[10px] text-gray-400 mt-0.5 font-medium">
                                {val.sub}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* FOOTER SECTION: MUA THÊM LẺ & GHI CHÚ */}
          <div className="bg-[#F5F6F0]/60 p-4 px-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-200/80">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1 font-semibold text-gray-700 mr-2">
                <Zap className="w-3.5 h-3.5 text-primary fill-primary" />
                <span>Hết lưu lượng? Mua thêm lẻ:</span>
              </div>
              {addOns.map((addOn, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 px-3 py-1 rounded-full text-[11px] font-medium text-gray-700 shadow-2xs flex items-center gap-1"
                >
                  <span>{addOn.text}</span>
                  <span className="font-bold text-gray-900">{addOn.price}</span>
                </div>
              ))}
            </div>

            <div className="text-[11px] text-primary font-bold">
              {footerNote}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BuiderSpicing;