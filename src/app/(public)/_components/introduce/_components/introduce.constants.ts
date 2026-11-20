import {
  Briefcase,
  Building2,
  Clock,
  HardHat,
  Layers,
  ShieldCheck,
  Smartphone,
  TrendingUp,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

export const INTRODUCE_EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

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

export interface DeveloperMember {
  name: string;
  initials: string;
  role: string;
  bio: string;
  skills: string[];
  avatarUrl: string;
}

const TEMP_MEMBER_AVATAR = 'https://i.pinimg.com/736x/5b/c0/53/5bc053022466ee661f4778311411c6dd.jpg';

export const DEVELOPER_TEAM_MEMBERS: DeveloperMember[] = [
  {
    name: 'Bùi Xuân Đức',
    initials: 'XĐ',
    role: 'Founder & Kiến trúc hệ thống',
    bio: 'Phụ trách định hướng sản phẩm và kiến trúc nền tảng ERP ngành nhôm kính, xây dựng.',
    skills: ['Kiến trúc ERP', 'Quy trình xưởng', 'Định hướng sản phẩm'],
    avatarUrl: '/assets/introduce/dev/duc.jpg',
  },
  {
    name: 'Trần Hữu Văn',
    initials: 'HV',
    role: 'Tech Lead & Fullstack Engineer',
    bio: 'Phát triển lõi tính toán bóc tách vật tư BOM, tối ưu cắt, hệ thống API đám mây và giao diện web.',
    skills: ['Tech Lead', 'BOM & Tối ưu cắt', 'Cloud API'],
    avatarUrl: '/assets/introduce/dev/van.jpg',
  },
  {
    name: 'Nguyễn Quang Linh',
    initials: 'QL',
    role: 'Fullstack & CAD 2D/3D Engineer',
    bio: 'Xây dựng giao diện thiết kế cửa CAD 2D/3D trực quan, trải nghiệm người dùng và tích hợp hệ thống.',
    skills: ['Fullstack Web', 'CAD 2D/3D', 'Hiệu năng giao diện'],
    avatarUrl: '/assets/introduce/dev/linh.jpg',
  },
  {
    name: 'Vũ Quyên',
    initials: 'VQ',
    role: 'UI/UX Design',
    bio: 'Thiết kế giao diện trực quan, chuẩn hóa trải nghiệm người dùng cho nền tảng web và ứng dụng công trình.',
    skills: ['UI/UX Design', 'Design System', 'Luồng thao tác'],
    avatarUrl: TEMP_MEMBER_AVATAR,
  },
];
