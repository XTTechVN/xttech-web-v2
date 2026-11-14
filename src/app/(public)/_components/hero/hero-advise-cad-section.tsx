'use client';

import React, { useState } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { ADVISE_ADVANTAGES } from './hero.constants';

export const HeroAdviseCadSection = () => {
  const [activeTab, setActiveTab] = useState<'wood' | 'grey' | 'white'>('wood');

  return (
    <section className="border-t border-gray-100 bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-black tracking-tight text-[#16384C] uppercase sm:text-3xl lg:text-4xl">
            TƯ VẤN CỤ THỂ — BÁO GIÁ NHANH CHÓNG
          </h2>
          <div className="mx-auto mt-2 h-1 w-16 rounded-full" style={{ backgroundColor: '#D97706' }} />
          <p className="mt-4 text-sm text-gray-600 sm:text-base">
            Từ bản vẽ kỹ thuật sắc nét đến mô hình 3D sống động, mọi thứ đều có thể chia sẻ cho khách hàng chỉ với một liên kết.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Cột trái: Lợi thế tư vấn */}
          <div className="space-y-6 lg:col-span-6">
            <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">
              Thiết kế & chốt phương án <span className="font-black text-primary">ngay tại công trình</span> bằng các lợi thế:
            </h3>

            <div className="space-y-4 pt-1">
              {ADVISE_ADVANTAGES.map((adv) => {
                const Icon = adv.icon;
                return (
                  <div key={adv.title} className="group flex items-start gap-3.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{adv.title}</h4>
                      <p className="mt-0.5 text-xs leading-relaxed text-gray-600 sm:text-sm">{adv.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cột phải: Card preview Cửa 2D kỹ thuật cao */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl border border-gray-200 bg-white p-5 shadow-2xl shadow-gray-200/50 sm:p-7">
              {/* Thanh điều khiển trên Card */}
              <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4">
                <span className="inline-flex items-center rounded-full bg-[#1e293b] px-4 py-1.5 text-xs font-bold text-white shadow-sm">
                  2D Kỹ Thuật
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('wood')}
                    title="Nhôm vân gỗ cao cấp"
                    className={`h-5 w-5 rounded-full border-2 bg-[#966b43] transition-all ${
                      activeTab === 'wood' ? 'scale-110 border-primary ring-2 ring-primary/30' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setActiveTab('grey')}
                    title="Nhôm xám ghi Xingfa"
                    className={`h-5 w-5 rounded-full border-2 bg-[#4b5563] transition-all ${
                      activeTab === 'grey' ? 'scale-110 border-primary ring-2 ring-primary/30' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setActiveTab('white')}
                    title="Nhôm trắng sứ tĩnh điện"
                    className={`h-5 w-5 rounded-full border-2 bg-[#e2e8f0] transition-all ${
                      activeTab === 'white' ? 'scale-110 border-primary ring-2 ring-primary/30' : 'border-gray-300'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-1 text-gray-500">
                  <span className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-100">
                    <ZoomIn className="h-3.5 w-3.5" />
                  </span>
                  <span className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-100">
                    <ZoomOut className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>

              {/* Khung vẽ Bản vẽ Cửa CAD chuẩn tỷ lệ */}
              <div className="relative flex min-h-95 items-center justify-center rounded-2xl bg-white p-4 sm:p-6">
                <svg
                  viewBox="0 0 540 620"
                  className="w-full max-w-105 drop-shadow-md select-none"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <pattern id="dot-grid" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="0.75" fill="#cbd5e1" opacity="0.6" />
                  </pattern>
                  <rect x="0" y="0" width="540" height="620" fill="url(#dot-grid)" />

                  {/* Khuôn bao ngoài */}
                  <rect
                    x="70"
                    y="40"
                    width="340"
                    height="480"
                    rx="4"
                    fill={activeTab === 'wood' ? '#9a6a43' : activeTab === 'grey' ? '#4b5563' : '#e2e8f0'}
                    stroke="#2d3748"
                    strokeWidth="2.5"
                  />

                  {/* Lòng trong khuôn bao */}
                  <rect x="90" y="60" width="300" height="440" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />

                  {/* Cánh trái */}
                  <rect
                    x="94"
                    y="64"
                    width="144"
                    height="432"
                    fill={activeTab === 'wood' ? '#aa7a4f' : activeTab === 'grey' ? '#64748b' : '#f1f5f9'}
                    stroke="#334155"
                    strokeWidth="1.5"
                  />
                  <rect x="110" y="80" width="112" height="400" fill="#bbf7d0" fillOpacity="0.45" stroke="#10b981" strokeWidth="1" />
                  <line x1="110" y1="80" x2="222" y2="480" stroke="#d97706" strokeWidth="1.5" strokeDasharray="4 2" />
                  <line x1="222" y1="80" x2="110" y2="480" stroke="#d97706" strokeWidth="1.5" strokeDasharray="4 2" />
                  <circle cx="166" cy="280" r="14" fill="#fbbf24" fillOpacity="0.5" stroke="#b45309" strokeWidth="1" />
                  <line x1="166" y1="240" x2="166" y2="320" stroke="#b45309" strokeWidth="1.5" />
                  <line x1="130" y1="280" x2="202" y2="280" stroke="#b45309" strokeWidth="1.5" />

                  {/* Cánh phải */}
                  <rect
                    x="242"
                    y="64"
                    width="144"
                    height="432"
                    fill={activeTab === 'wood' ? '#aa7a4f' : activeTab === 'grey' ? '#64748b' : '#f1f5f9'}
                    stroke="#334155"
                    strokeWidth="1.5"
                  />
                  <rect x="258" y="80" width="112" height="400" fill="#bbf7d0" fillOpacity="0.45" stroke="#10b981" strokeWidth="1" />
                  <line x1="258" y1="80" x2="370" y2="480" stroke="#d97706" strokeWidth="1.5" strokeDasharray="4 2" />
                  <line x1="370" y1="80" x2="258" y2="480" stroke="#d97706" strokeWidth="1.5" strokeDasharray="4 2" />
                  <circle cx="314" cy="280" r="14" fill="#fbbf24" fillOpacity="0.5" stroke="#b45309" strokeWidth="1" />
                  <line x1="314" y1="240" x2="314" y2="320" stroke="#b45309" strokeWidth="1.5" />
                  <line x1="278" y1="280" x2="350" y2="280" stroke="#b45309" strokeWidth="1.5" />

                  {/* Tay nắm */}
                  <rect x="238" y="270" width="4" height="40" rx="2" fill="#0f172a" />
                  <rect x="234" y="282" width="12" height="6" rx="2" fill="#0f172a" />

                  {/* Kích thước */}
                  <line x1="430" y1="40" x2="430" y2="520" stroke="#2563eb" strokeWidth="1.5" />
                  <line x1="410" y1="40" x2="436" y2="40" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1="410" y1="520" x2="436" y2="520" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 3" />
                  <circle cx="430" cy="40" r="2.5" fill="#2563eb" />
                  <circle cx="430" cy="520" r="2.5" fill="#2563eb" />
                  <text x="444" y="285" fill="#2563eb" fontSize="12" fontWeight="bold" transform="rotate(-90 444 285)">
                    2400
                  </text>

                  <line x1="50" y1="290" x2="50" y2="520" stroke="#2563eb" strokeWidth="1.5" />
                  <line x1="50" y1="290" x2="70" y2="290" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1="50" y1="520" x2="70" y2="520" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 3" />
                  <circle cx="50" cy="290" r="2.5" fill="#2563eb" />
                  <circle cx="50" cy="520" r="2.5" fill="#2563eb" />
                  <text x="42" y="415" fill="#2563eb" fontSize="11" fontWeight="bold" transform="rotate(-90 42 415)">
                    1050
                  </text>

                  <line x1="70" y1="545" x2="240" y2="545" stroke="#2563eb" strokeWidth="1.5" />
                  <line x1="240" y1="545" x2="410" y2="545" stroke="#2563eb" strokeWidth="1.5" />
                  <line x1="70" y1="520" x2="70" y2="550" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1="240" y1="520" x2="240" y2="550" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1="410" y1="520" x2="410" y2="550" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 3" />
                  <circle cx="70" cy="545" r="2.5" fill="#2563eb" />
                  <circle cx="240" cy="545" r="2.5" fill="#2563eb" />
                  <circle cx="410" cy="545" r="2.5" fill="#2563eb" />
                  <text x="145" y="540" fill="#2563eb" fontSize="11" fontWeight="bold">
                    1000
                  </text>
                  <text x="315" y="540" fill="#2563eb" fontSize="11" fontWeight="bold">
                    1000
                  </text>

                  <line x1="70" y1="575" x2="410" y2="575" stroke="#2563eb" strokeWidth="2" />
                  <line x1="70" y1="545" x2="70" y2="580" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1="410" y1="545" x2="410" y2="580" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 3" />
                  <circle cx="70" cy="575" r="3" fill="#2563eb" />
                  <circle cx="410" cy="575" r="3" fill="#2563eb" />
                  <text x="225" y="595" fill="#2563eb" fontSize="12" fontWeight="bold">
                    2000
                  </text>
                </svg>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>Hệ cửa đi 2 cánh mở quay Xingfa 55</span>
                </div>
                <span className="font-semibold text-primary">Tỉ lệ 1:20 • mm</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

