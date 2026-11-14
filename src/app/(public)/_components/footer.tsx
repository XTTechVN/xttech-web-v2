'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, CheckCircle2, Phone } from 'lucide-react';
import { Modal, XTLogo } from '@/components';
import {
  HeroRegisterInlineForm,
  markRegisterInteracted,
} from './hero/hero-register-inline-form';
import {
  FOOTER_BOTTOM_LINKS,
  FOOTER_CONTACT_ITEMS,
  FOOTER_LEGAL_LINKS,
  FOOTER_SOLUTION_LINKS,
} from '../_constants/public-layout.constants';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const handleOpenRegisterModal = () => {
    markRegisterInteracted();
    setIsRegisterModalOpen(true);
  };

  const handleFooterLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href === '/#about' && pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer
      id="contact"
      className="relative scroll-mt-20 overflow-hidden bg-linear-to-b from-[#062e39] via-[#04242d] to-[#031920] text-slate-300"
    >
      {/* Dải nhấn thương hiệu phía trên */}
      <div className="h-1 w-full bg-linear-to-r from-[var(--hero-accent-from)] via-primary to-[var(--hero-accent-to)]" />

      {/* Quầng sáng nền nhẹ */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[var(--hero-accent-from)]/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-72 w-72 rounded-full bg-[var(--hero-accent-to)]/10 blur-3xl" />

      {/* Khối chính Footer */}
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        {/* Banner CTA đầu chân trang */}
        <div className="mb-12 flex flex-col justify-between gap-6 rounded-2xl border border-white/15 bg-linear-to-r from-[#074754] via-[#063f4b] to-[#084c59] p-6 shadow-lg sm:p-8 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">
              Sẵn sàng số hóa xưởng nhôm kính của bạn?
            </h2>
            <p className="mt-1.5 text-sm text-slate-200/90">
              Đội ngũ XTTECH hướng dẫn triển khai từ khảo sát đến vận hành thực tế.
            </p>
          </div>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={handleOpenRegisterModal}
              className="inline-flex flex-1 cursor-pointer items-center justify-center whitespace-nowrap rounded-xl bg-white px-3.5 py-2.5 text-sm font-bold text-primary shadow-sm transition-all hover:bg-teal-50 sm:flex-none sm:px-5"
            >
              Đăng ký ngay
            </button>
            <a
              href="tel:0776710766"
              className="inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-white/25 bg-white/5 px-3.5 py-2.5 text-sm font-bold text-white transition-all hover:border-teal-300/60 hover:bg-white/10 sm:flex-none sm:px-5"
            >
              <Phone className="h-4 w-4 shrink-0 text-teal-300" />
              <span>0776 710 766</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Cột 1: Thông tin thương hiệu */}
          <div className="flex flex-col gap-4 lg:col-span-4">
            <div className="inline-flex w-fit items-center gap-2.5 rounded-xl bg-white px-3.5 py-2 shadow-sm">
              <XTLogo className="h-8 w-8 drop-shadow-[0_2px_5px_rgba(4,88,99,0.35)]" />
              <span className="text-xl font-black tracking-tight text-primary">XTTECH</span>
            </div>
            <p className="text-sm text-white sm:max-w-sm">
              Nền tảng tiên phong số hóa ngành nhôm kính & xây dựng — Giải pháp quản trị khép kín từ khảo sát, thiết kế 3D, bóc tách kỹ thuật đến quản lý thi công công trình.
            </p>
          </div>

          {/* Cột 2: Điều hướng */}
          <div className="flex flex-col gap-3.5 lg:col-span-2 lg:pl-2">
            <h3 className="font-semibold text-white text-lg">Giải pháp</h3>
            <ul className="flex flex-col space-y-2.5 text-sm">
              {FOOTER_SOLUTION_LINKS.map((item) => (
                <li key={item.label}>
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-white transition-all hover:translate-x-0.5 hover:text-teal-200"
                    >
                      {item.label} <ArrowUpRight className="h-3.5 w-3.5 text-teal-300/80" />
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={(e) => handleFooterLinkClick(e, item.href)}
                      className="inline-block text-white transition-all hover:translate-x-0.5 hover:text-teal-200"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 3: Pháp lý & Chính sách */}
          <div className="flex flex-col gap-3.5 lg:col-span-3">
            <h3 className="font-semibold text-white text-lg">Pháp lý & Chính sách</h3>
            <ul className="flex flex-col space-y-2.5 text-sm">
              {FOOTER_LEGAL_LINKS.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="group inline-flex items-center gap-2 text-white transition-all hover:translate-x-0.5 hover:text-teal-200"
                    >
                      {Icon && (
                        <Icon className="h-4 w-4 shrink-0 text-teal-300/70 transition-colors group-hover:text-[#4eb622]" />
                      )}
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Cột 4: Liên hệ */}
          <div className="flex flex-col gap-3.5 lg:col-span-3">
            <h3 className="font-semibold text-white text-lg">Liên hệ</h3>
            <ul className="flex flex-col space-y-2.5 text-sm">
              {FOOTER_CONTACT_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.title}>
                    <a
                      href={item.href}
                      className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition-all hover:border-teal-400/40 hover:bg-white/10"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-400/15 text-teal-300 transition-colors group-hover:bg-teal-400/25 group-hover:text-white">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <span className="block text-[11px] font-medium text-slate-400">{item.title}</span>
                        <span className="block truncate text-sm font-semibold text-white">{item.value}</span>
                      </div>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* Dải bản quyền */}
      <div className="relative border-t border-white/10 bg-black/25 py-4">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-slate-400">
            © {currentYear} <span className="font-semibold text-white">XTTECH</span>. Tất cả các quyền được bảo lưu.
          </p>
          <div className="flex items-center gap-5 text-xs text-slate-400">
            {FOOTER_BOTTOM_LINKS.map((item, idx) => (
              <React.Fragment key={item.label}>
                {idx > 0 && <span className="h-3 w-px bg-white/15" />}
                {item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="transition-colors hover:text-white"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    onClick={(e) => handleFooterLinkClick(e, item.href)}
                    className="transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
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
    </footer>
  );
};
