// Các icons trong lucide - react
import { Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import { XTLogo } from '@/components';

export const Footer = () => {
  return (
    <footer id="contact" className="bg-white border-t border-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          {/* Logo & Thông Tin */}
          <div className="flex flex-col gap-3 md:max-w-xs">
            <div className="flex items-center gap-2">
              <XTLogo className="w-6 h-6 drop-shadow-[0_1px_3px_rgba(4,88,99,0.35)]" />
              <span className="text-lg font-bold text-primary tracking-tight">XTTECH</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed pr-4">Giải pháp quản trị doanh nghiệp toàn diện.</p>
          </div>

          {/* Liên Hệ */}
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-primary text-lg">Liên hệ</h3>
            <div className="flex flex-col gap-2">
              <a href="mailto:contact@xttech.vn" className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors">
                <Mail className="w-4 h-4" />
                xttech.vn.com
              </a>
              <a href="tel:0987654321" className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors">
                <Phone className="w-4 h-4" />
                0865 853 327
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-primary text-lg">Pháp lý</h3>
            <div className="flex flex-col gap-2">
              <Link href="#" className="text-sm text-gray-600 hover:text-primary transition-colors">
                Chính sách bảo mật
              </Link>
              <Link href="#" className="text-sm text-gray-600 hover:text-primary transition-colors">
                Điều khoản dịch vụ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
