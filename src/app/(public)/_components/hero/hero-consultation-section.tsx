'use client';

import React, { useState } from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

interface ConsultationFormState {
  fullName: string;
  companyName: string;
  email: string;
  companyAddress: string;
  phone: string;
  jobTitle: string;
}

const INITIAL_FORM: ConsultationFormState = {
  fullName: '',
  companyName: '',
  email: '',
  companyAddress: '',
  phone: '',
  jobTitle: '',
};

const CITY_OPTIONS = [
  'Hà Nội',
  'TP. Hồ Chí Minh',
  'Đà Nẵng',
  'Hải Phòng',
  'Bình Dương',
  'Đồng Nai',
  'Quảng Ninh',
  'Nghệ An',
  'Thanh Hóa',
  'Cần Thơ',
  'Tỉnh thành khác',
];

const JOB_OPTIONS = [
  'Chủ doanh nghiệp / Chủ xưởng',
  'Quản lý sản xuất / Giám sát',
  'Kế toán / Thủ kho',
  'Kỹ thuật viên / Thiết kế cửa',
  'Nhà thầu / Đối tác thi công',
  'Khác',
];

export function HeroConsultationSection() {
  const [formData, setFormData] = useState<ConsultationFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof ConsultationFormState, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ConsultationFormState, string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(formData.phone.replace(/\s+/g, ''))) {
      newErrors.phone = 'Số điện thoại không đúng định dạng';
    }

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Email không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof ConsultationFormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc');
      return;
    }

    setIsSubmitting(true);
    // UI only - giả lập gửi thành công
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success('Đăng ký nhận tư vấn thành công! XTTech sẽ liên hệ bạn ngay.');
    }, 450);
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    setIsSubmitted(false);
  };

  return (
    <section id="consultation" className="py-16 lg:py-24 bg-white border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200/90 bg-linear-to-b from-slate-50/70 via-white to-white p-6 sm:p-10 lg:p-14 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* CỘT TRÁI: FORM ĐĂNG KÝ (ẢNH 1) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Tiêu đề theo mẫu Ảnh 1 */}
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Đăng ký nhận thông tin{' '}
                  <span className="text-primary  font-black">tư vấn</span>
                </h2>
                <p className="mt-2 text-sm sm:text-base text-slate-600 font-medium">
                  Chúng tôi sẽ liên hệ ngay trong <span className="font-bold text-slate-900">2h làm việc!</span>
                </p>
              </div>

              {isSubmitted ? (
                /* Trạng thái xác nhận thành công */
                <div className="p-8 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-slate-900">
                      Gửi yêu cầu tư vấn thành công!
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                      Cảm ơn <span className="font-bold text-slate-900">{formData.fullName}</span>.
                      Chuyên viên giải pháp XTTECH sẽ liên hệ qua số điện thoại{' '}
                      <span className="font-bold text-primary">{formData.phone}</span> trong vòng 2h làm việc để tư vấn chi tiết.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-primary hover:text-primary-dark transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Gửi thêm yêu cầu khác</span>
                  </button>
                </div>
              ) : (
                /* Form nhập liệu 6 trường bố cục 2 cột (Ảnh 1) */
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {/* Hàng 1: Họ và tên | Tên công ty */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <input
                        type="text"
                        placeholder="Họ và tên *"
                        value={formData.fullName}
                        onChange={(e) => handleChange('fullName', e.target.value)}
                        className={`w-full h-11 px-3.5 text-xs sm:text-sm bg-white border rounded-lg outline-none transition-all placeholder:text-slate-400 text-slate-900 ${
                          errors.fullName
                            ? 'border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                            : 'border-slate-300 hover:border-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20'
                        }`}
                      />
                      {errors.fullName && (
                        <span className="text-xs text-rose-500 font-medium">{errors.fullName}</span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <input
                        type="text"
                        placeholder="Tên công ty / Xưởng"
                        value={formData.companyName}
                        onChange={(e) => handleChange('companyName', e.target.value)}
                        className="w-full h-11 px-3.5 text-xs sm:text-sm bg-white border border-slate-300 hover:border-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg outline-none transition-all placeholder:text-slate-400 text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Hàng 2: Email | Địa chỉ công ty */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <input
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className={`w-full h-11 px-3.5 text-xs sm:text-sm bg-white border rounded-lg outline-none transition-all placeholder:text-slate-400 text-slate-900 ${
                          errors.email
                            ? 'border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                            : 'border-slate-300 hover:border-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20'
                        }`}
                      />
                      {errors.email && (
                        <span className="text-xs text-rose-500 font-medium">{errors.email}</span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <select
                        value={formData.companyAddress}
                        onChange={(e) => handleChange('companyAddress', e.target.value)}
                        className="w-full h-11 px-3.5 text-xs sm:text-sm bg-white border border-slate-300 hover:border-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg outline-none transition-all text-slate-700 cursor-pointer"
                      >
                        <option value="">Địa chỉ công ty (Khu vực)</option>
                        {CITY_OPTIONS.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Hàng 3: Số điện thoại | Chức vụ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <input
                        type="tel"
                        placeholder="Số điện thoại *"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className={`w-full h-11 px-3.5 text-xs sm:text-sm bg-white border rounded-lg outline-none transition-all placeholder:text-slate-400 text-slate-900 ${
                          errors.phone
                            ? 'border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                            : 'border-slate-300 hover:border-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20'
                        }`}
                      />
                      {errors.phone && (
                        <span className="text-xs text-rose-500 font-medium">{errors.phone}</span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <select
                        value={formData.jobTitle}
                        onChange={(e) => handleChange('jobTitle', e.target.value)}
                        className="w-full h-11 px-3.5 text-xs sm:text-sm bg-white border border-slate-300 hover:border-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg outline-none transition-all text-slate-700 cursor-pointer"
                      >
                        <option value="">Chức vụ / Job title</option>
                        {JOB_OPTIONS.map((job) => (
                          <option key={job} value={job}>
                            {job}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Nút gửi NHẬN TƯ VẤN & BÁO GIÁ (Không hover: bg trắng, text primary, border primary | Hover: text trắng, bg primary, border primary) */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-lg border-2 border-primary bg-white text-primary hover:bg-primary hover:text-white hover:border-primary active:scale-[0.99] font-extrabold text-xs sm:text-sm tracking-wider uppercase shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'ĐANG GỬI THÔNG TIN...' : 'NHẬN TƯ VẤN & BÁO GIÁ'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* CỘT PHẢI: HÌNH ẢNH MINH HỌA TƯ VẤN VIÊN (ẢNH 1) */}
            <div className="lg:col-span-5 flex justify-center items-center">
              <div className="relative w-full max-w-sm sm:max-w-md">
                <svg
                  viewBox="0 0 400 320"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-auto drop-shadow-md select-none"
                >
                  {/* Nền mây trang trí nhẹ */}
                  <circle cx="280" cy="180" r="110" fill="#f0fdf4" />
                  <ellipse cx="200" cy="270" rx="170" ry="20" fill="#f1f5f9" />

                  {/* Họa tiết lá cây xanh nền */}
                  <path
                    d="M320 220C340 180 370 190 380 260C340 260 320 250 320 220Z"
                    fill="#38bdf8"
                    opacity="0.3"
                  />
                  <path
                    d="M290 240C300 200 330 210 340 270C300 270 290 260 290 240Z"
                    fill="#0ea5e9"
                    opacity="0.5"
                  />

                  {/* Bong bóng chat câu hỏi (?) màu vàng */}
                  <g>
                    <rect x="290" y="45" width="46" height="38" rx="8" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
                    <text x="306" y="71" fill="#f59e0b" fontSize="20" fontWeight="bold">?</text>
                  </g>

                  {/* Bong bóng tin nhắn văn bản */}
                  <g>
                    <rect x="210" y="25" width="56" height="42" rx="8" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
                    <rect x="220" y="37" width="36" height="4" rx="2" fill="#fcd34d" />
                    <rect x="220" y="46" width="28" height="4" rx="2" fill="#fcd34d" />
                  </g>

                  {/* Bong bóng cuộc gọi điện thoại vàng */}
                  <g>
                    <rect x="180" y="95" width="46" height="40" rx="8" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
                    <path
                      d="M206 120C202 120 197 115 197 111C197 109 198 107 200 106L202 108C201 109 201 110 201 111C201 113 203 115 205 115C206 115 207 115 208 114L210 116C209 118 207 120 206 120Z"
                      fill="#f59e0b"
                    />
                  </g>

                  {/* Nhân vật nữ tư vấn viên */}
                  <path
                    d="M260 145C260 95 210 95 210 145C210 175 220 185 235 185C250 185 260 175 260 145Z"
                    fill="#0f172a"
                  />
                  <ellipse cx="235" cy="145" rx="20" ry="24" fill="#fed7aa" />
                  <rect x="231" y="165" width="8" height="15" fill="#fdba74" />

                  {/* Kính mắt */}
                  <circle cx="228" cy="142" r="6" stroke="#0f172a" strokeWidth="1.5" fill="none" />
                  <circle cx="242" cy="142" r="6" stroke="#0f172a" strokeWidth="1.5" fill="none" />
                  <line x1="234" y1="142" x2="236" y2="142" stroke="#0f172a" strokeWidth="1.5" />

                  {/* Nụ cười */}
                  <path d="M231 156Q235 160 239 156" stroke="#ea580c" strokeWidth="1.5" fill="none" />

                  {/* Tai nghe Headset màu xanh dương */}
                  <path
                    d="M212 145C212 120 258 120 258 145"
                    stroke="#0284c7"
                    strokeWidth="3.5"
                    fill="none"
                  />
                  <rect x="210" y="138" width="6" height="14" rx="3" fill="#0284c7" />
                  <rect x="254" y="138" width="6" height="14" rx="3" fill="#0284c7" />
                  <path d="M215 148L228 158" stroke="#0284c7" strokeWidth="1.5" fill="none" />
                  <circle cx="229" cy="159" r="2.5" fill="#0284c7" />

                  {/* Áo vàng */}
                  <path
                    d="M210 180C190 195 190 270 190 270L280 270C280 270 280 195 260 180C250 190 220 190 210 180Z"
                    fill="#f59e0b"
                  />

                  {/* Cốc cà phê xanh mint */}
                  <rect x="145" y="240" width="16" height="22" rx="3" fill="#06b6d4" />
                  <path d="M161 245H166C168 245 168 252 166 252H161" stroke="#06b6d4" strokeWidth="2" fill="none" />
                  <path d="M150 234Q152 230 150 226" stroke="#94a3b8" strokeWidth="1" fill="none" />
                  <path d="M155 235Q157 231 155 227" stroke="#94a3b8" strokeWidth="1" fill="none" />

                  {/* Laptop */}
                  <polygon points="180,270 270,270 260,205 190,205" fill="#cbd5e1" />
                  <polygon points="183,268 267,268 258,208 192,208" fill="#e2e8f0" />
                  <polygon points="160,270 290,270 295,273 155,273" fill="#1e293b" />
                  <circle cx="225" cy="236" r="4.5" fill="#38bdf8" />

                  {/* Cạnh bàn làm việc */}
                  <rect x="120" y="270" width="220" height="6" rx="2" fill="#1e293b" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroConsultationSection;

