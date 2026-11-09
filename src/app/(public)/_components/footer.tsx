import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { XTLogo } from '@/components';
import {
  FOOTER_BOTTOM_LINKS,
  FOOTER_CONTACT_ITEMS,
  FOOTER_LEGAL_LINKS,
  FOOTER_SOLUTION_LINKS,
} from '../_constants/public-layout.constants';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="scroll-mt-20 border-t border-gray-200 bg-white">
      {/* Khối chính Footer */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Cột 1: Thông tin thương hiệu */}
          <div className="flex flex-col gap-4 lg:col-span-4">
            <div className="flex items-center gap-2.5">
              <XTLogo className="h-8 w-8 drop-shadow-[0_2px_5px_rgba(4,88,99,0.35)]" />
              <span className="text-xl font-black tracking-tight text-primary">XTTECH</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-600 sm:max-w-sm">
              Nền tảng tiên phong số hóa ngành nhôm kính & xây dựng — Giải pháp quản trị khép kín từ khảo sát, thiết kế 3D, bóc tách kỹ thuật đến quản lý thi công công trình.
            </p>
            <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-primary/15 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
              <span>Tiên phong công nghệ số hóa 4.0</span>
            </div>
          </div>

          {/* Cột 2: Điều hướng */}
          <div className="flex flex-col gap-3 lg:col-span-2 lg:pl-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Giải pháp</h3>
            <ul className="flex flex-col space-y-2 text-sm">
              {FOOTER_SOLUTION_LINKS.map((item) => (
                <li key={item.label}>
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-gray-600 transition-colors hover:text-primary"
                    >
                      {item.label} <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
                    </a>
                  ) : (
                    <Link href={item.href} className="text-gray-600 transition-colors hover:text-primary">
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 3: Pháp lý & Chính sách */}
          <div className="flex flex-col gap-3 lg:col-span-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Pháp lý & Chính sách</h3>
            <ul className="flex flex-col space-y-2 text-sm">
              {FOOTER_LEGAL_LINKS.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-1.5 text-gray-600 transition-colors hover:text-primary"
                    >
                      {Icon && <Icon className="h-4 w-4 shrink-0 text-gray-400" />}
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Cột 4: Liên hệ */}
          <div className="flex flex-col gap-3 lg:col-span-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Liên hệ</h3>
            <ul className="flex flex-col space-y-2.5 text-sm">
              {FOOTER_CONTACT_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.title}>
                    <a
                      href={item.href}
                      className="group flex items-start gap-2 text-gray-600 transition-colors hover:text-primary"
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <div>
                        <span className="block font-medium text-gray-900">{item.title}</span>
                        <span>{item.value}</span>
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
      <div className="border-t border-gray-100 bg-gray-50/70 py-4">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-gray-500">
            © {currentYear} <span className="font-semibold text-gray-700">XTTECH</span>. Tất cả các quyền được bảo lưu.
          </p>
          <div className="flex items-center gap-5 text-xs text-gray-500">
            {FOOTER_BOTTOM_LINKS.map((item, idx) => (
              <React.Fragment key={item.label}>
                {idx > 0 && <span className="h-3 w-[1px] bg-gray-300" />}
                {item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="transition-colors hover:text-primary"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link href={item.href} className="transition-colors hover:text-primary">
                    {item.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
