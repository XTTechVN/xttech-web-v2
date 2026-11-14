'use client';

import React, { useState } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { Modal } from '@/components';
import { ADVISE_ADVANTAGES } from './hero.constants';
import {
  HeroRegisterInlineForm,
  markRegisterInteracted,
} from './hero-register-inline-form';

type DoorColorKey = 'wood' | 'grey' | 'white' | 'black' | 'champagne';

const DOOR_COLOR_OPTIONS: {
  key: DoorColorKey;
  label: string;
  swatch: string;
  frameColor: string;
  frameDark: string;
  sashColor: string;
}[] = [
  {
    key: 'wood',
    label: 'Nhôm vân gỗ cao cấp',
    swatch: '#966b43',
    frameColor: '#9a6a43',
    frameDark: '#6d4728',
    sashColor: '#aa7a4f',
  },
  {
    key: 'grey',
    label: 'Nhôm xám ghi Xingfa',
    swatch: '#4b5563',
    frameColor: '#4b5563',
    frameDark: '#334155',
    sashColor: '#64748b',
  },
  {
    key: 'white',
    label: 'Nhôm trắng sứ tĩnh điện',
    swatch: '#e2e8f0',
    frameColor: '#cbd5e1',
    frameDark: '#94a3b8',
    sashColor: '#f1f5f9',
  },
  {
    key: 'black',
    label: 'Nhôm đen tuyền',
    swatch: '#18181b',
    frameColor: '#18181b',
    frameDark: '#09090b',
    sashColor: '#27272a',
  },
  {
    key: 'champagne',
    label: 'Nhôm Anode sâm panh',
    swatch: '#bfa06a',
    frameColor: '#bfa06a',
    frameDark: '#8f7344',
    sashColor: '#d1b582',
  },
];

export const HeroAdviseCadSection = () => {
  const [activeTab, setActiveTab] = useState<DoorColorKey>('wood');
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [zoom, setZoom] = useState<number>(1);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const handleOpenRegisterModal = () => {
    markRegisterInteracted();
    setIsRegisterModalOpen(true);
  };

  const activeColor = DOOR_COLOR_OPTIONS.find((item) => item.key === activeTab) ?? DOOR_COLOR_OPTIONS[0];
  const { frameColor, frameDark, sashColor } = activeColor;

  return (
    <section className="border-t border-gray-100 bg-white pt-16 pb-8 lg:pt-24 lg:pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-black tracking-tight text-[#16384C] uppercase sm:text-3xl lg:text-4xl">
            TƯ VẤN CỤ THỂ — BÁO GIÁ NHANH CHÓNG
          </h2>
          <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-primary" />
          <p className="mt-4 text-sm text-primary sm:text-base">
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

            <div className="pt-2">
              <button
                type="button"
                onClick={handleOpenRegisterModal}
                className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-primary bg-white px-6 py-3 text-sm font-bold text-primary shadow-sm transition-colors duration-200 hover:border-primary hover:bg-primary hover:text-white"
              >
                Đăng ký ngay
              </button>
            </div>
          </div>

          {/* Cột phải: Card preview Cửa 2D kỹ thuật cao */}
          <div className="lg:col-span-6">
            <div className="relative rounded-xl border border-gray-200 bg-white p-5 shadow-xl shadow-gray-200/50 sm:p-7">
              {/* Thanh điều khiển trên Card */}
              <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="relative grid grid-cols-2 items-center rounded-full bg-slate-100 p-1">
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-hero-accent shadow-sm transition-transform duration-300 ease-out ${
                      viewMode === '3d' ? 'translate-x-full' : 'translate-x-0'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setViewMode('2d')}
                    className={`relative z-10 cursor-pointer rounded-full px-3.5 py-1.5 text-center text-xs font-bold transition-colors duration-300 ${
                      viewMode === '2d'
                        ? 'text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    2D Kỹ Thuật
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('3d')}
                    className={`relative z-10 cursor-pointer rounded-full px-3.5 py-1.5 text-center text-xs font-bold transition-colors duration-300 ${
                      viewMode === '3d'
                        ? 'text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    3D Mô phỏng
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  {DOOR_COLOR_OPTIONS.map((colorOption) => (
                    <button
                      key={colorOption.key}
                      type="button"
                      onClick={() => setActiveTab(colorOption.key)}
                      title={colorOption.label}
                      style={{ backgroundColor: colorOption.swatch }}
                      className={`h-5 w-5 rounded-full border-2 transition-all cursor-pointer ${
                        activeTab === colorOption.key
                          ? 'scale-110 border-primary ring-2 ring-primary/30'
                          : 'border-gray-300'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-1 text-gray-500">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(1.18, Number((z + 0.08).toFixed(2))))}
                    aria-label="Phóng to"
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-100"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(0.84, Number((z - 0.08).toFixed(2))))}
                    aria-label="Thu nhỏ"
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-100"
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Khung vẽ Bản vẽ Cửa CAD 2D hoặc Mô hình 3D */}
              <div className="relative min-h-95 overflow-hidden rounded-2xl bg-white">
                <div
                  className={`flex w-[200%] items-center transition-transform duration-300 ease-out ${
                    viewMode === '3d' ? '-translate-x-1/2' : 'translate-x-0'
                  }`}
                >
                  <div
                    className={`order-2 flex w-1/2 shrink-0 items-center justify-center p-4 transition-opacity duration-300 sm:p-6 ${
                      viewMode === '3d' ? 'opacity-100' : 'opacity-40'
                    }`}
                  >
                    {/* Ảnh SVG 3D tĩnh siêu nhẹ (2 cánh mở hé, kính hoa đồng) */}
                  <svg
                    viewBox="0 0 540 620"
                    style={{ transform: `scale(${zoom})` }}
                    className="w-full max-w-105 select-none transition-transform duration-300"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >

                    {/* Khung bao trên & 2 bên tạo độ sâu */}
                    <polygon points="88,42 452,32 452,48 88,58" fill={frameDark} stroke="#090d12" strokeWidth="1.5" />
                    <polygon points="88,42 104,54 104,536 88,540" fill={frameDark} stroke="#090d12" strokeWidth="1.5" />
                    <polygon points="452,32 436,46 436,546 452,550" fill={frameDark} stroke="#090d12" strokeWidth="1.5" />

                    {/* ================= CÁNH TRÁI 3D (mở hướng về trước bên trái) ================= */}
                    <g>
                      {/* Khung cánh trái */}
                      <polygon
                        points="96,46 232,68 232,576 96,536"
                        fill={frameColor}
                        stroke="#090d12"
                        strokeWidth="2"
                      />
                      {/* Cạnh độ dày mép cánh trái */}
                      <polygon
                        points="232,68 242,72 242,572 232,576"
                        fill={frameDark}
                        stroke="#090d12"
                        strokeWidth="1.5"
                      />
                      {/* Đường ghép vát 45 độ góc khung cánh trái */}
                      <line x1="96" y1="46" x2="112" y2="62" stroke="#090d12" strokeWidth="1.2" />
                      <line x1="232" y1="68" x2="216" y2="82" stroke="#090d12" strokeWidth="1.2" />
                      <line x1="96" y1="536" x2="112" y2="520" stroke="#090d12" strokeWidth="1.2" />
                      <line x1="232" y1="576" x2="216" y2="554" stroke="#090d12" strokeWidth="1.2" />

                      {/* Tấm kính xanh xám cánh trái */}
                      <polygon
                        points="112,64 216,81 216,554 112,519"
                        fill="#4f728e"
                        fillOpacity="0.88"
                        stroke="#1e293b"
                        strokeWidth="1.5"
                      />

                      {/* Nan trang trí kính cánh trái */}
                      <line x1="164" y1="72" x2="164" y2="537" stroke="#c5a467" strokeWidth="1.5" />
                      <line x1="112" y1="176" x2="216" y2="196" stroke="#c5a467" strokeWidth="1.3" />
                      <line x1="112" y1="292" x2="216" y2="314" stroke="#c5a467" strokeWidth="1.3" />
                      <line x1="112" y1="406" x2="216" y2="432" stroke="#c5a467" strokeWidth="1.3" />
                      {/* Hoa văn giữa kính trái */}
                      <polygon
                        points="164,274 176,304 164,334 152,304"
                        fill="#b89454"
                        fillOpacity="0.65"
                        stroke="#d6b87c"
                        strokeWidth="1.2"
                      />
                      <circle cx="164" cy="186" r="6" fill="none" stroke="#d6b87c" strokeWidth="1.2" />
                      <circle cx="164" cy="419" r="6" fill="none" stroke="#d6b87c" strokeWidth="1.2" />
                    </g>

                    {/* ================= CÁNH PHẢI 3D (mở hé tạo khe 3D ở giữa) ================= */}
                    <g>
                      {/* Cạnh độ dày mép cánh phải */}
                      <polygon
                        points="266,54 276,50 276,586 266,582"
                        fill={frameDark}
                        stroke="#090d12"
                        strokeWidth="1.5"
                      />
                      {/* Khung cánh phải */}
                      <polygon
                        points="276,50 444,34 444,548 276,586"
                        fill={sashColor}
                        stroke="#090d12"
                        strokeWidth="2"
                      />
                      {/* Đường ghép vát 45 độ góc khung cánh phải */}
                      <line x1="276" y1="50" x2="294" y2="66" stroke="#090d12" strokeWidth="1.2" />
                      <line x1="444" y1="34" x2="426" y2="52" stroke="#090d12" strokeWidth="1.2" />
                      <line x1="276" y1="586" x2="294" y2="564" stroke="#090d12" strokeWidth="1.2" />
                      <line x1="444" y1="548" x2="426" y2="532" stroke="#090d12" strokeWidth="1.2" />

                      {/* Tấm kính xanh xám cánh phải */}
                      <polygon
                        points="294,66 426,52 426,532 294,564"
                        fill="#537996"
                        fillOpacity="0.9"
                        stroke="#1e293b"
                        strokeWidth="1.5"
                      />

                      {/* Nan trang trí kính cánh phải */}
                      <line x1="360" y1="59" x2="360" y2="548" stroke="#c5a467" strokeWidth="1.5" />
                      <line x1="294" y1="186" x2="426" y2="172" stroke="#c5a467" strokeWidth="1.3" />
                      <line x1="294" y1="312" x2="426" y2="292" stroke="#c5a467" strokeWidth="1.3" />
                      <line x1="294" y1="438" x2="426" y2="412" stroke="#c5a467" strokeWidth="1.3" />
                      {/* Hoa văn giữa kính phải */}
                      <polygon
                        points="360,268 375,302 360,336 345,302"
                        fill="#b89454"
                        fillOpacity="0.65"
                        stroke="#d6b87c"
                        strokeWidth="1.2"
                      />
                      <circle cx="360" cy="179" r="7" fill="none" stroke="#d6b87c" strokeWidth="1.2" />
                      <circle cx="360" cy="425" r="7" fill="none" stroke="#d6b87c" strokeWidth="1.2" />

                      {/* Tay nắm cửa đen cánh phải */}
                      <rect x="281" y="314" width="6" height="44" rx="3" fill="#090d12" />
                      <rect x="282" y="320" width="24" height="6" rx="3" fill="#090d12" />
                    </g>
                  </svg>
                  </div>
                  <div
                    className={`order-1 flex w-1/2 shrink-0 items-center justify-center p-4 transition-opacity duration-300 sm:p-6 ${
                      viewMode === '2d' ? 'opacity-100' : 'opacity-40'
                    }`}
                  >
                <svg
                  viewBox="0 0 540 620"
                  style={{ transform: `scale(${zoom})` }}
                  className="w-full max-w-105 drop-shadow-md select-none transition-transform duration-300"
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
                    fill={frameColor}
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
                    fill={sashColor}
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
                    fill={sashColor}
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
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>Hệ cửa đi 2 cánh mở quay Xingfa 55</span>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        size="md"
        title="Đăng ký trải nghiệm XTTECH XMS Fab"
        className="max-w-lg border border-primary/20"
        bodyClassName="p-5 sm:p-6"
      >
        <HeroRegisterInlineForm
          variant="modal"
          onBack={() => setIsRegisterModalOpen(false)}
        />
      </Modal>
    </section>
  );
};

