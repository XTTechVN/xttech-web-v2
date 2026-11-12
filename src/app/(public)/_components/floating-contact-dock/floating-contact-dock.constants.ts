import { Mail, MessageCircle, PhoneCall, type LucideIcon } from 'lucide-react';
import { CONTACT_INFO } from '@/config/contact';
import { FacebookIcon } from './facebook-icon';

export interface ContactAction {
  key: string;
  href: string;
  title: string;
  tooltip: string;
  icon: LucideIcon | typeof FacebookIcon;
  iconClassName: string;
  buttonClassName: string;
  tooltipClassName: string;
  external?: boolean;
}

const TOOLTIP_DEFAULT_CLASS = 'bg-slate-900/90 backdrop-blur-xs font-semibold';
const TOOLTIP_PRIMARY_CLASS = 'bg-primary font-bold';

export const CONTACT_ACTIONS: ContactAction[] = [
  {
    key: 'zalo',
    href: CONTACT_INFO.zaloUrl,
    title: `Zalo: ${CONTACT_INFO.phoneDisplay}`,
    tooltip: 'Tư vấn Zalo',
    icon: MessageCircle,
    iconClassName: 'h-5 w-5 fill-current',
    buttonClassName: 'bg-[#0068FF] shadow-blue-500/35',
    tooltipClassName: TOOLTIP_DEFAULT_CLASS,
    external: true,
  },
  {
    key: 'facebook',
    href: CONTACT_INFO.facebookUrl,
    title: 'Fanpage XTTech',
    tooltip: 'Facebook Fanpage',
    icon: FacebookIcon,
    iconClassName: 'h-5 w-5 fill-current',
    buttonClassName: 'bg-[#1877F2] shadow-blue-600/35',
    tooltipClassName: TOOLTIP_DEFAULT_CLASS,
    external: true,
  },
  {
    key: 'email',
    href: `mailto:${CONTACT_INFO.email}`,
    title: `Gửi Email tới ${CONTACT_INFO.email}`,
    tooltip: CONTACT_INFO.email,
    icon: Mail,
    iconClassName: 'h-5 w-5',
    buttonClassName: 'bg-[#EA4335] shadow-red-500/35',
    tooltipClassName: TOOLTIP_DEFAULT_CLASS,
  },
  {
    key: 'hotline',
    href: `tel:${CONTACT_INFO.phone}`,
    title: `Gọi Hotline: ${CONTACT_INFO.phoneDisplay}`,
    tooltip: `Hotline: ${CONTACT_INFO.phoneDisplay}`,
    icon: PhoneCall,
    iconClassName: 'h-5 w-5',
    buttonClassName: 'bg-primary shadow-primary/35',
    tooltipClassName: TOOLTIP_PRIMARY_CLASS,
  },
];
