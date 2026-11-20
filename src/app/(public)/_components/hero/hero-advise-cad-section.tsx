'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { Modal, RegisterInlineForm } from '@/components';
import { HeroCadDoorPreview } from './hero-cad-door-preview';
import { ADVISE_ADVANTAGES, DOOR_COLOR_OPTIONS, type DoorColorKey } from './hero.constants';

export const HeroAdviseCadSection = () => {
  const [activeTab, setActiveTab] = useState<DoorColorKey>('wood');
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [zoom, setZoom] = useState<number>(1);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const activeColor = DOOR_COLOR_OPTIONS.find((item) => item.key === activeTab) ?? DOOR_COLOR_OPTIONS[0];

  return (
    <section className="overflow-x-clip border-t border-gray-100 bg-white pt-16 pb-8 lg:pt-24 lg:pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-black tracking-tight text-[#16384C] uppercase sm:text-3xl lg:text-4xl">
            TƯ VẤN CỤ THỂ — BÁO GIÁ NHANH CHÓNG
          </h2>
          <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-primary" />
          <p className="mt-4 text-sm text-primary sm:text-base">
            Từ bản vẽ kỹ thuật sắc nét đến mô hình 3D sống động, mọi thứ đều có thể chia sẻ cho khách hàng chỉ với một
            liên kết.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -70 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6 lg:col-span-6"
          >
            <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">
              Thiết kế &amp; chốt phương án <span className="font-black text-primary">ngay tại công trình</span> bằng
              các lợi thế:
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
                      <h4 className="text-sm font-bold text-primary">{adv.title}</h4>
                      <p className="mt-0.5 text-xs leading-relaxed text-gray-600 sm:text-sm">{adv.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center pt-2 lg:justify-start">
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(true)}
                className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-primary bg-white px-6 py-3 text-sm font-bold text-primary shadow-sm transition-colors duration-200 hover:border-primary hover:bg-primary hover:text-white"
              >
                Đăng ký sử dụng miễn phí
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 70 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6"
          >
            <div className="relative rounded-xl border border-gray-200 bg-white p-5 shadow-xl shadow-gray-200/50 sm:p-7">
              <div className="mb-4 flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative grid w-full grid-cols-2 items-center rounded-full bg-slate-100 p-1 sm:w-auto">
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-hero-accent shadow-sm transition-transform duration-300 ease-out ${
                      viewMode === '3d' ? 'translate-x-full' : 'translate-x-0'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setViewMode('2d')}
                    className={`relative z-10 cursor-pointer whitespace-nowrap rounded-full px-3.5 py-1.5 text-center text-xs font-bold transition-colors duration-300 ${
                      viewMode === '2d' ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    2D Kỹ Thuật
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('3d')}
                    className={`relative z-10 cursor-pointer whitespace-nowrap rounded-full px-3.5 py-1.5 text-center text-xs font-bold transition-colors duration-300 ${
                      viewMode === '3d' ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    3D Mô phỏng
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
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
              </div>

              <HeroCadDoorPreview
                viewMode={viewMode}
                zoom={zoom}
                frameColor={activeColor.frameColor}
                frameDark={activeColor.frameDark}
                sashColor={activeColor.sashColor}
              />

              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>Hệ cửa đi 2 cánh mở quay Xingfa 55</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        size="md"
        title="Đăng ký sử dụng XTTECH XMS Fab"
        className="max-w-lg border border-primary/20"
        bodyClassName="p-5 sm:p-6"
      >
        <RegisterInlineForm
          key={`cad-reg-${isRegisterModalOpen}`}
          variant="modal"
          onBack={() => setIsRegisterModalOpen(false)}
        />
      </Modal>
    </section>
  );
};
