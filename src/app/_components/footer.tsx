import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, ArrowUpRight, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { XTLogo } from '@/components';

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
            <div className="inline-flex items-center gap-2 rounded-lg border border-primary/15 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary w-fit">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
              <span>Tiên phong công nghệ số hóa 4.0</span>
            </div>
          </div>

          {/* Cột 2: Điều hướng */}
          <div className="flex flex-col gap-3 lg:col-span-2 lg:pl-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">Giải pháp</h3>
            <ul className="flex flex-col space-y-2 text-sm">
              <li>
                <Link href="/#about" className="text-gray-600 hover:text-primary transition-colors">Về chúng tôi</Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-600 hover:text-primary transition-colors">Bảng giá dịch vụ</Link>
              </li>
              <li>
                <Link href="/signin" className="text-gray-600 hover:text-primary transition-colors">Đăng nhập</Link>
              </li>
              <li>
                <a href="https://zalo.me/0865853327" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-gray-600 hover:text-primary transition-colors">
                  Tư vấn Zalo <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 3: Pháp lý & Chính sách */}
          <div className="flex flex-col gap-3 lg:col-span-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">Pháp lý & Chính sách</h3>
            <ul className="flex flex-col space-y-2 text-sm">
              <li>
                <Link href="#" className="inline-flex items-center gap-1.5 text-gray-600 hover:text-primary transition-colors">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-gray-400" />
                  <span>Chính sách bảo mật</span>
                </Link>
              </li>
              <li>
                <Link href="#" className="inline-flex items-center gap-1.5 text-gray-600 hover:text-primary transition-colors">
                  <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                  <span>Điều khoản dịch vụ</span>
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-primary transition-colors">Chính sách hoàn tiền</Link>
              </li>
            </ul>
          </div>

          {/* Cột 4: Liên hệ */}
          <div className="flex flex-col gap-3 lg:col-span-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">Liên hệ</h3>
            <ul className="flex flex-col space-y-2.5 text-sm">
              <li>
                <a href="tel:0865853327" className="group flex items-start gap-2 text-gray-600 hover:text-primary transition-colors">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <span className="block font-medium text-gray-900">Hotline tư vấn</span>
                    <span>0865 853 327</span>
                  </div>
                </a>
              </li>
              <li>
                <a href="mailto:contact@xttech.vn" className="group flex items-start gap-2 text-gray-600 hover:text-primary transition-colors">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <span className="block font-medium text-gray-900">Email hỗ trợ</span>
                    <span>contact@xttech.vn</span>
                  </div>
                </a>
              </li>
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
            <Link href="/#about" className="hover:text-primary transition-colors">Về chúng tôi</Link>
            <span className="h-3 w-[1px] bg-gray-300" />
            <Link href="/pricing" className="hover:text-primary transition-colors">Bảng giá</Link>
            <span className="h-3 w-[1px] bg-gray-300" />
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">Facebook</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
