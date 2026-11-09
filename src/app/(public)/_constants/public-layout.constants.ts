import { Mail, Phone, RotateCcw, ShieldCheck, FileText, type LucideIcon } from 'lucide-react';

export interface PublicNavLink {
  href: string;
  label: string;
  key: 'about' | 'pricing' | 'news' | 'legal' | 'contact';
}

export const NAV_LINKS: PublicNavLink[] = [
  { href: '/#about', label: 'Về chúng tôi', key: 'about' },
  { href: '/pricing', label: 'Giá', key: 'pricing' },
  { href: '/news', label: 'Tin tức', key: 'news' },
  { href: '/privacy-policy', label: 'Chính sách', key: 'legal' },
  { href: '/#contact', label: 'Liên hệ', key: 'contact' },
];

export interface FooterSolutionLink {
  href: string;
  label: string;
  external?: boolean;
}

export const FOOTER_SOLUTION_LINKS: FooterSolutionLink[] = [
  { href: '/#about', label: 'Về chúng tôi' },
  { href: '/pricing', label: 'Bảng giá dịch vụ' },
  { href: '/news', label: 'Tin tức & Sự kiện' },
  { href: '/signin', label: 'Đăng nhập' },
  { href: 'https://zalo.me/0776710766', label: 'Tư vấn Zalo', external: true },
];

export interface FooterLegalLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const FOOTER_LEGAL_LINKS: FooterLegalLink[] = [
  { href: '/privacy-policy', label: 'Chính sách bảo mật', icon: ShieldCheck },
  { href: '/terms-of-service', label: 'Điều khoản dịch vụ', icon: FileText },
  { href: '/refund-policy', label: 'Chính sách hoàn tiền', icon: RotateCcw },
];

export interface FooterContactItem {
  href: string;
  title: string;
  value: string;
  icon: LucideIcon;
}

export const FOOTER_CONTACT_ITEMS: FooterContactItem[] = [
  { href: 'tel:0776710766', title: 'Hotline tư vấn', value: '0776 710 766', icon: Phone },
  { href: 'mailto:contact@xttech.vn', title: 'Email hỗ trợ', value: 'xttechvn@gmail.com', icon: Mail },
];

export interface FooterBottomLink {
  href: string;
  label: string;
  external?: boolean;
}

export const FOOTER_BOTTOM_LINKS: FooterBottomLink[] = [
  { href: '/#about', label: 'Về chúng tôi' },
  { href: '/pricing', label: 'Bảng giá' },
  { href: '/news', label: 'Tin tức' },
  { href: 'https://facebook.com', label: 'Facebook', external: true },
];
