import {
  Briefcase,
  Building2,
  Clock,
  Compass,
  HardHat,
  Layers,
  ShieldCheck,
  Smartphone,
  Target,
  TrendingUp,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

export const INTRODUCE_EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export interface SloganWord {
  text: string;
  accent?: boolean;
}

export const SLOGAN_LINES: SloganWord[][] = [
  [
    { text: 'KIẾN' },
    { text: 'TẠO' },
    { text: 'GIÁ', accent: true },
    { text: 'TRỊ', accent: true },
  ],
  [
    { text: 'CHUYỂN' },
    { text: 'HÓA' },
    { text: 'TƯƠNG', accent: true },
    { text: 'LAI', accent: true },
  ],
];

export interface EcosystemModule {
  code: string;
  name: string;
  desc: string;
  icon: LucideIcon;
}

export const ECOSYSTEM_MODULES: EcosystemModule[] = [
  {
    code: 'XMS Fab',
    name: 'Xưởng Nhôm Kính & Nội Thất',
    desc: 'Thiết kế CAD 2D/3D, bóc tách BOM tự động, xuất thẻ cắt A4 và quản lý tiến độ sản xuất tại xưởng.',
    icon: Layers,
  },
  {
    code: 'XMS Build',
    name: 'Xây Dựng & Đội Thợ Thực Địa',
    desc: 'Quản lý công trình, kho vật tư xuất nhập, chấm công tại công trình và nghiệm thu bảo hành QR.',
    icon: HardHat,
  },
  {
    code: 'XMS Biz',
    name: 'HCNS, Kế Toán & Kinh Doanh',
    desc: 'Quản lý hợp đồng, báo giá, thu chi, nhân sự và báo cáo lãi/lỗ chi tiết theo từng đơn hàng.',
    icon: Briefcase,
  },
];

export interface BenefitStepStyle {
  card: string;
  circle: string;
  title: string;
  desc: string;
  icon: string;
  offsetClass: string;
}

export const BENEFIT_STEP_STYLES: BenefitStepStyle[] = [
  {
    card: 'bg-white text-slate-900 border-slate-200/80 shadow-md shadow-slate-200/40 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10',
    circle: 'bg-slate-50 border border-slate-200/90 text-primary shadow-xs',
    title: 'text-slate-900 group-hover:text-primary',
    desc: 'text-slate-600',
    icon: 'text-slate-400 group-hover:text-primary',
    offsetClass: 'ml-0',
  },
  {
    card: 'bg-[#eef8f5] text-slate-900 border-[#d2eee5] shadow-xs hover:border-primary/50 hover:shadow-md hover:shadow-primary/10',
    circle: 'bg-white border border-[#bce2d7] text-primary shadow-2xs',
    title: 'text-slate-900 group-hover:text-primary',
    desc: 'text-slate-600',
    icon: 'text-[#007a6e] group-hover:scale-110',
    offsetClass: 'sm:ml-6 lg:ml-8 xl:ml-10',
  },
  {
    card: 'bg-[#d6f0e7] text-slate-900 border-[#b9e5d8] shadow-xs hover:border-primary/60 hover:shadow-md hover:shadow-primary/15',
    circle: 'bg-white border border-[#a2d8c9] text-primary shadow-2xs',
    title: 'text-slate-900 group-hover:text-primary',
    desc: 'text-slate-700',
    icon: 'text-[#005b52] group-hover:scale-110',
    offsetClass: 'sm:ml-12 lg:ml-16 xl:ml-20',
  },
  {
    card: 'bg-[#044e54] text-white border-[#033c41] shadow-xl shadow-[#044e54]/25 hover:shadow-2xl hover:shadow-[#044e54]/40 hover:border-teal-400/50',
    circle: 'bg-white/20 border border-white/30 text-white backdrop-blur-xs shadow-xs',
    title: 'text-white',
    desc: 'text-teal-50/90',
    icon: 'text-teal-200 group-hover:text-white group-hover:scale-110',
    offsetClass: 'sm:ml-18 lg:ml-24 xl:ml-30',
  },
];

export interface BenefitItem {
  title: string;
  desc: string;
  icon: LucideIcon;
}

export const SOFTWARE_BENEFITS: BenefitItem[] = [
  {
    title: 'Báo giá nhanh tại công trình',
    desc: 'Lên phương án và dự toán vật tư tức thì, bỏ thao tác tính tay trên Excel.',
    icon: Clock,
  },
  {
    title: 'Giảm hao hụt phôi & kho',
    desc: 'Chuẩn hóa bóc tách và thẻ cắt A4 giúp kiểm soát chặt định mức nhôm, kính.',
    icon: TrendingUp,
  },
  {
    title: 'Đồng bộ xưởng & đội thợ',
    desc: 'Giao việc rõ ràng theo bản vẽ, theo dõi tiến độ xuyên suốt đến lắp dựng.',
    icon: Wrench,
  },
  {
    title: 'Minh bạch dữ liệu & dòng tiền',
    desc: 'Nắm bắt tức thời vật tư, công thợ và lãi/lỗ từng dự án trên một màn hình.',
    icon: ShieldCheck,
  },
];

export interface AudienceItem {
  title: string;
  subtitle: string;
  points: string[];
  icon: LucideIcon;
}

export const TARGET_AUDIENCES: AudienceItem[] = [
  {
    title: 'Xưởng sản xuất nhôm kính',
    subtitle: 'Từ xưởng vừa đến nhà máy gia công',
    points: [
      'Thiết kế CAD 2D/3D, bóc tách BOM & xuất thẻ cắt A4 nhanh',
      'Chuẩn hóa thư viện hệ nhôm, phụ kiện theo giá nhập thực tế',
    ],
    icon: Building2,
  },
  {
    title: 'Nhà thầu thi công & Xây lắp',
    subtitle: 'Mặt dựng, dân dụng, công nghiệp',
    points: [
      'Quản lý đồng thời nhiều hạng mục, dự án & kho công trường',
      'Theo dõi tiến độ lắp đặt, bàn giao & bảo hành QR',
    ],
    icon: HardHat,
  },
  {
    title: 'Đội thợ & Kỹ thuật hiện trường',
    subtitle: 'Vận hành qua App Mobile',
    points: [
      'Xem bản vẽ, kích thước ô chờ & vật tư cần mang đi lắp',
      'Chấm công tại công trình & gửi ảnh nghiệm thu về văn phòng',
    ],
    icon: Smartphone,
  },
  {
    title: 'Chủ xưởng, Kế toán & Kinh doanh',
    subtitle: 'Phối hợp trên một dữ liệu chung',
    points: [
      'Kinh doanh chốt giá nhanh, kế toán kiểm soát chi phí vật tư',
      'Chủ doanh nghiệp xem báo cáo lãi/lỗ & phê duyệt từ xa',
    ],
    icon: Users,
  },
];

export interface MissionVisionHighlight {
  lead: string;
  text: string;
}

export interface MissionVisionBlock {
  id: 'mission' | 'vision';
  badge: string;
  title: string;
  icon: LucideIcon;
  summaryLead: string;
  summaryHighlight: string;
  summaryTail: string;
  listTitle: string;
  items: MissionVisionHighlight[];
  imageSrc: string;
  imageAlt: string;
  imageAnimationClass: string;
  glowClass: string;
  imageFirst: boolean;
}

export const MISSION_VISION_BLOCKS: MissionVisionBlock[] = [
  {
    id: 'mission',
    badge: 'Sứ mệnh XTTECH',
    title: 'Sứ mệnh',
    icon: Compass,
    summaryLead: 'XTTECH đưa công nghệ trở thành công cụ vận hành',
    summaryHighlight: 'dễ tiếp cận, hiệu quả và bền vững',
    summaryTail: 'cho mọi doanh nghiệp vừa và nhỏ tại Việt Nam.',
    listTitle: 'Chúng tôi giúp doanh nghiệp:',
    items: [
      {
        lead: 'Quản trị nội bộ thông minh:',
        text: 'Tiết kiệm thời gian và chi phí vận hành.',
      },
      {
        lead: 'Áp dụng AI xây dựng thương hiệu số:',
        text: 'Thông qua hệ thống app/web mang dấu ấn riêng.',
      },
      {
        lead: 'Kết nối cộng đồng doanh nghiệp cùng ngành:',
        text: 'Chia sẻ nguồn lực và cơ hội phát triển.',
      },
    ],
    imageSrc: '/assets/introduce/our-mission.png',
    imageAlt: 'Sứ mệnh XTTECH',
    imageAnimationClass: 'animate-compass-mission',
    glowClass: 'bg-linear-to-tr from-primary/20 via-emerald-400/15 to-transparent',
    imageFirst: false,
  },
  {
    id: 'vision',
    badge: 'Tầm nhìn XTTECH',
    title: 'Tầm nhìn',
    icon: Target,
    summaryLead: 'Trở thành',
    summaryHighlight: 'đơn vị dẫn đầu',
    summaryTail: 'trong lĩnh vực chuyển đổi số cho ngành nhôm cao cấp và xây dựng tại Việt Nam.',
    listTitle: 'Định hướng phát triển trọng tâm:',
    items: [
      {
        lead: 'Đối tác công nghệ tin cậy:',
        text: 'Đồng hành cùng các doanh nghiệp SME đang trên hành trình hiện đại hóa mô hình vận hành.',
      },
      {
        lead: 'Tiên phong chuẩn hóa ngành:',
        text: 'Tích hợp toàn diện thiết kế CAD 2D/3D, bóc tách vật tư và quản lý thi công trên một nền tảng.',
      },
      {
        lead: 'Kiến tạo giá trị dài hạn:',
        text: 'Giúp xưởng và nhà thầu nâng cao năng lực cạnh tranh và tối ưu hóa lợi nhuận.',
      },
    ],
    imageSrc: '/assets/introduce/vision.jpg',
    imageAlt: 'Tầm nhìn XTTECH',
    imageAnimationClass: 'animate-compass-vision',
    glowClass: 'bg-linear-to-bl from-teal-400/20 via-primary/15 to-transparent',
    imageFirst: true,
  },
];
