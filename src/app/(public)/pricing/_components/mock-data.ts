import { GraduationCap, Video, Building2, Rocket, type LucideIcon } from 'lucide-react';

/* ---------- Types dùng chung cho các gói giá ---------- */
export type ButtonVariant = 'outline' | 'solid' | 'accent';

export interface PlanHighlight {
  bold: string;
  rest: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  monthly: number | null;
  yearly: number | null;
  yearlyOnly: boolean;
  priceSubText: string | null;
  buttonText: string;
  buttonVariant: ButtonVariant;
  isPopular: boolean;
  highlights: PlanHighlight[];
}

export interface AddOn {
  text: string;
  price: string;
}

export interface PricingSectionData {
  header: {
    title: string;
    badge: string;
    subTitle: string;
    slug: string;
    resetNote: string;
  };
  plans: PricingPlan[];
  addOns: AddOn[];
  footerNote: string;
}

/* ---------- Helpers format & tính phần trăm ---------- */
export const formatVnd = (n: number) => `${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}đ`;
export const savePercent = (monthly: number, yearly: number) => Math.round((1 - yearly / (monthly * 12)) * 100);

/* ---------- 1. DỮ LIỆU XƯỞNG NHÔM & NỘI THẤT ---------- */
export const ALUMINUM_PRICING_DATA: PricingSectionData = {
  header: {
    title: 'Xưởng Nhôm & Nội Thất',
    badge: 'Số bộ cửa',
    subTitle: 'XMS Fab — Quản lý báo giá, sản xuất, lắp đặt',
    slug: '/bang-gia-xuong-nhom',
    resetNote: 'Reset mùng 1 hàng tháng',
  },
  plans: [
    {
      id: 'free',
      name: 'Miễn phí',
      monthly: null,
      yearly: null,
      yearlyOnly: false,
      priceSubText: 'Mãi mãi, không cần thẻ',
      buttonText: 'Dùng thử 20 cửa miễn phí',
      buttonVariant: 'outline',
      isPopular: false,
      highlights: [
        { bold: '20 bộ cửa', rest: 'tổng cả đời' },
        { bold: '3 nhân sự', rest: '' },
        { bold: '3 GB', rest: 'lưu trữ' },
        { bold: 'Thử 3 hệ nhôm', rest: 'Xingfa, PMA, Việt Pháp' },
        { bold: '20 đơn', rest: 'báo giá & đặt hàng' },
        { bold: 'Sản xuất cơ bản', rest: 'xem tiến độ' },
        { bold: 'Hỗ trợ', rest: 'cộng đồng' },
      ],
    },
    {
      id: 'gon',
      name: 'Gọn',
      monthly: 590000,
      yearly: 5900000,
      yearlyOnly: false,
      priceSubText: null,
      buttonText: 'Chọn Gọn',
      buttonVariant: 'solid',
      isPopular: false,
      highlights: [
        { bold: '100 bộ cửa', rest: '/ tháng, reset mùng 1' },
        { bold: '10 nhân sự', rest: '' },
        { bold: '20 GB', rest: 'lưu trữ' },
        { bold: '10 hệ nhôm', rest: 'tùy chọn' },
        { bold: '100 đơn', rest: '/ tháng' },
        { bold: 'Sản xuất đầy đủ', rest: 'giao việc' },
        { bold: 'Chat', rest: 'hỗ trợ 24h' },
      ],
    },
    {
      id: 'tai-cau-truc',
      name: 'Tái cấu trúc',
      monthly: 1290000,
      yearly: 12900000,
      yearlyOnly: false,
      priceSubText: null,
      buttonText: 'Chọn Tái Cấu Trúc',
      buttonVariant: 'accent',
      isPopular: true,
      highlights: [
        { bold: '500 bộ cửa', rest: '/ tháng' },
        { bold: '20 nhân sự', rest: '' },
        { bold: '100 GB', rest: 'lưu trữ' },
        { bold: 'Toàn bộ hệ nhôm', rest: 'không giới hạn' },
        { bold: '500 đơn', rest: '/ tháng' },
        { bold: 'Sản xuất full', rest: 'QR + bảo hành' },
        { bold: 'Hỗ trợ ưu tiên', rest: '1-1' },
      ],
    },
    {
      id: 'tong-thau',
      name: 'Tổng thầu',
      monthly: 2490000,
      yearly: 29900000,
      yearlyOnly: false,
      priceSubText: null,
      buttonText: 'Liên hệ Tổng Thầu',
      buttonVariant: 'outline',
      isPopular: false,
      highlights: [
        { bold: 'Bộ cửa không giới hạn', rest: '' },
        { bold: 'Nhân sự không giới hạn', rest: '' },
        { bold: '1 TB', rest: 'lưu trữ (1024 GB)' },
        { bold: 'Toàn bộ hệ nhôm', rest: '+ Custom' },
        { bold: 'Đơn hàng không giới hạn', rest: '' },
        { bold: 'Sản xuất full', rest: '+ API' },
        { bold: 'Quản lý', rest: 'tài khoản riêng' },
      ],
    },
  ],
  addOns: [
    { text: '+100 cửa', price: '99k' },
    { text: '+10 nhân sự', price: '99k' },
    { text: '+20GB', price: '99k' },
  ],
  footerNote: '* Áp dụng cho G1/G2, tự động cộng vào tháng sau',
};

/* ---------- 2. DỮ LIỆU NGÀNH XÂY DỰNG & ĐỘI THỢ ---------- */
export const BUILDER_PRICING_DATA: PricingSectionData = {
  header: {
    title: 'Ngành xây dựng và đội thợ',
    badge: 'Số công trình',
    subTitle: 'XMS Build — Công trình, kho bãi, nhân công',
    slug: '/bang-gia-xay-dung',
    resetNote: 'Reset mùng 1 hàng tháng',
  },
  plans: [
    {
      id: 'free',
      name: 'Miễn phí',
      monthly: null,
      yearly: null,
      yearlyOnly: false,
      priceSubText: 'Mãi mãi, không cần thẻ',
      buttonText: 'Dùng thử 10 công trình',
      buttonVariant: 'outline',
      isPopular: false,
      highlights: [
        { bold: '10 công trình', rest: 'tổng cả đời' },
        { bold: '3 nhân sự', rest: '' },
        { bold: '3 GB', rest: 'lưu trữ' },
        { bold: '10 dự án', rest: 'và kho vật tư' },
        { bold: 'Thử 3 người', rest: 'chấm công GPS' },
        { bold: 'Kế toán', rest: 'chỉ xem' },
        { bold: 'Hỗ trợ', rest: 'cộng đồng' },
      ],
    },
    {
      id: 'doi-nho',
      name: 'Đội nhỏ',
      monthly: 490000,
      yearly: 4900000,
      yearlyOnly: false,
      priceSubText: null,
      buttonText: 'Chọn Đội Nhỏ',
      buttonVariant: 'solid',
      isPopular: false,
      highlights: [
        { bold: '100 công trình', rest: '/ tháng, reset mùng 1' },
        { bold: '10 nhân sự', rest: '' },
        { bold: '20 GB', rest: 'lưu trữ' },
        { bold: '50 dự án', rest: 'và kho vật tư' },
        { bold: '10 người', rest: 'chấm công GPS' },
        { bold: '100 HĐ', rest: 'kế toán giao việc' },
        { bold: 'Chat', rest: 'hỗ trợ 24h' },
      ],
    },
    {
      id: 'doi-lon',
      name: 'Đội lớn',
      monthly: 990000,
      yearly: 9900000,
      yearlyOnly: false,
      priceSubText: null,
      buttonText: 'Chọn Đội Lớn',
      buttonVariant: 'accent',
      isPopular: true,
      highlights: [
        { bold: '500 công trình', rest: '/ tháng' },
        { bold: '30 nhân sự', rest: '' },
        { bold: '100 GB', rest: 'lưu trữ' },
        { bold: '200 dự án', rest: 'và kho vật tư' },
        { bold: '20 người', rest: 'chấm công GPS' },
        { bold: '500 HĐ', rest: 'kế toán QR + bảo hành' },
        { bold: 'Hỗ trợ ưu tiên', rest: '1-1' },
      ],
    },
    {
      id: 'tong-thau',
      name: 'Tổng thầu',
      monthly: null,
      yearly: 24900000,
      yearlyOnly: true,
      priceSubText: null,
      buttonText: 'Liên hệ Tổng Thầu',
      buttonVariant: 'outline',
      isPopular: false,
      highlights: [
        { bold: 'Công trình không giới hạn', rest: '∞' },
        { bold: 'Nhân sự không giới hạn', rest: '' },
        { bold: '1 TB', rest: 'lưu trữ (1024 GB)' },
        { bold: 'Full dự án & kho vật tư', rest: '' },
        { bold: 'Chấm công GPS', rest: 'không giới hạn' },
        { bold: 'Kế toán Full', rest: 'toàn diện' },
        { bold: 'Quản lý', rest: 'tài khoản riêng' },
      ],
    },
  ],
  addOns: [
    { text: '+100 công trình', price: '99k' },
    { text: '+10 nhân sự', price: '99k' },
    { text: '+20GB', price: '99k' },
  ],
  footerNote: '* Áp dụng cho gói 1 gói 2 tự động cộng vào tháng sau',
};

/* ---------- 3. DỮ LIỆU NGÀNH HCNS, KẾ TOÁN, KINH DOANH ---------- */
export const BUSINESS_PRICING_DATA: PricingSectionData = {
  header: {
    title: 'HCNS, Kế Toán, Kinh doanh',
    badge: 'Nhân sự + Hóa đơn',
    subTitle: 'XMS Biz — CRM & Office, nhân sự, hóa đơn',
    slug: '/bang-gia-hcns-ke-toan',
    resetNote: 'Reset mùng 1 hàng tháng',
  },
  plans: [
    {
      id: 'free',
      name: 'Miễn phí',
      monthly: null,
      yearly: null,
      yearlyOnly: false,
      priceSubText: 'Mãi mãi, không cần thẻ',
      buttonText: 'Dùng thử 10 miễn phí',
      buttonVariant: 'outline',
      isPopular: false,
      highlights: [
        { bold: '10 công trình', rest: 'tổng cả đời' },
        { bold: '3 nhân sự', rest: '' },
        { bold: '3 GB', rest: 'lưu trữ' },
        { bold: '10 dự án', rest: 'và kho vật tư' },
        { bold: 'Thử 3 người', rest: 'chấm công GPS' },
        { bold: 'Báo cáo lãi lỗ', rest: 'chỉ xem' },
        { bold: 'Hỗ trợ', rest: 'cộng đồng' },
      ],
    },
    {
      id: 'van-phong',
      name: 'Văn phòng',
      monthly: 390000,
      yearly: 3900000,
      yearlyOnly: false,
      priceSubText: null,
      buttonText: 'Chọn Văn Phòng',
      buttonVariant: 'solid',
      isPopular: false,
      highlights: [
        { bold: '50 công trình', rest: '/ tháng, reset mùng 1' },
        { bold: '10 nhân sự', rest: '' },
        { bold: '20 GB', rest: 'lưu trữ' },
        { bold: '50 dự án', rest: 'và kho vật tư' },
        { bold: '10 người', rest: 'chấm công GPS' },
        { bold: 'Báo cáo lãi lỗ', rest: 'chi tiết' },
        { bold: 'Chat', rest: 'hỗ trợ 24h' },
      ],
    },
    {
      id: 'van-hanh',
      name: 'Vận hành',
      monthly: 790000,
      yearly: 7900000,
      yearlyOnly: false,
      priceSubText: null,
      buttonText: 'Chọn Vận Hành',
      buttonVariant: 'accent',
      isPopular: true,
      highlights: [
        { bold: '200 công trình', rest: '/ tháng' },
        { bold: '20 nhân sự', rest: '' },
        { bold: '100 GB', rest: 'lưu trữ' },
        { bold: '200 dự án', rest: 'và kho vật tư' },
        { bold: '20 người', rest: 'chấm công GPS' },
        { bold: 'Báo cáo lãi lỗ', rest: 'Full + Xuất' },
        { bold: 'Hỗ trợ ưu tiên', rest: '1-1' },
      ],
    },
    {
      id: 'tong-thau',
      name: 'Tổng thầu',
      monthly: null,
      yearly: 19900000,
      yearlyOnly: true,
      priceSubText: null,
      buttonText: 'Liên hệ Tổng Thầu',
      buttonVariant: 'outline',
      isPopular: false,
      highlights: [
        { bold: 'Công trình không giới hạn', rest: '∞' },
        { bold: 'Nhân sự không giới hạn', rest: '' },
        { bold: '1 TB', rest: 'lưu trữ (1024 GB)' },
        { bold: 'Full dự án & kho vật tư', rest: '' },
        { bold: 'Chấm công GPS', rest: 'không giới hạn' },
        { bold: 'Báo cáo lãi lỗ', rest: 'Full + Kế toán' },
        { bold: 'Quản lý', rest: 'tài khoản riêng' },
      ],
    },
  ],
  addOns: [
    { text: '+100 công trình', price: '99k' },
    { text: '+10 nhân sự', price: '99k' },
    { text: '+20GB', price: '99k' },
  ],
  footerNote: '* Áp dụng cho G1/G2, tự động cộng vào tháng sau',
};

/* ---------- 4. DỮ LIỆU CÁC GÓI TRIỂN KHAI & TÁI CẤU TRÚC ---------- */
export type ImplementationPlan = {
  id: string;
  name: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  price: string;
  unit: string;
  oldPrice?: string;
  subtitle?: string;
  features: string[];
  cta: string;
  highlight?: boolean;
  badge?: string;
  promo?: string;
  note?: string;
};

export const IMPLEMENTATION_PRICING_PLANS: ImplementationPlan[] = [
  {
    id: 'self',
    name: 'Tự học',
    icon: GraduationCap,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    price: '0đ',
    unit: '/mãi mãi',
    features: ['Kho video 120+ bài', 'Tài liệu & biểu mẫu', 'Cộng đồng hỗ trợ'],
    cta: 'Bắt đầu học',
  },
  {
    id: 'online',
    name: 'Đồng hành Online',
    icon: Video,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    price: '5tr',
    unit: '/3 tháng',
    subtitle: '12 buổi 1-1 qua Meet, setup hệ thống',
    features: ['Setup 10 hệ nhóm / 50 công trình', 'Quy trình báo giá → nghiệm thu', 'Bàn giao quản trị viên'],
    cta: 'Chọn gói Online',
  },
  {
    id: 'onsite',
    name: 'Đào tạo tận xưởng',
    icon: Building2,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    price: '8tr',
    unit: '/ngày',
    subtitle: 'Chuyên gia đến tận nơi, cầm tay chỉ việc',
    features: ['Đào tạo 2 ca: văn phòng + xưởng', 'Chuẩn hóa kho, mã hàng', 'Kèm 1 tháng G2'],
    cta: 'Đặt lịch xưởng',
  },
  {
    id: 'full',
    name: 'Tái cấu trúc toàn diện',
    icon: Rocket,
    iconBg: 'bg-white/15',
    iconColor: 'text-[#d6ff3d]',
    price: '15tr',
    oldPrice: '30tr',
    unit: '/lần',
    promo: 'Tặng 1 tháng G2 • Combo G4 = 44.9tr năm đầu',
    features: [
      'Audit xưởng 3 ngày, vẽ lại flow',
      'Tái cấu trúc nhân sự + KPI',
      'Bàn giao Tổng Thầu G4 full không giới hạn',
      'Bảo hành vận hành 12 tháng',
    ],
    cta: 'Nhận combo 44.9tr ',
    highlight: true,
    badge: 'BEST VALUE • TIẾT KIỆM 50%',
    note: 'Chỉ 5 suất / tháng • Đã bao gồm G4 1TB + 1 tháng G2',
  },
];
