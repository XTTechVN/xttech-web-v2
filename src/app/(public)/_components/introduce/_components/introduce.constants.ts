import {
  Briefcase,
  Building2,
  Clock,
  Cpu,
  FileSpreadsheet,
  HardHat,
  Layers,
  Package,
  PencilRuler,
  QrCode,
  Scissors,
  ShieldCheck,
  Smartphone,
  TrendingUp,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

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

export interface ProblemSolutionItem {
  problem: string;
  solution: string;
}

export const PROBLEM_SOLUTIONS: ProblemSolutionItem[] = [
  {
    problem: 'Bóc tách vật tư & báo giá thủ công trên Excel hoặc sổ tay mất nhiều thời gian, dễ lệch kích thước ô chờ khi chốt phương án.',
    solution: 'Thiết kế cửa CAD 2D/3D trực quan, hệ thống tự động tính thanh nhôm, kính cường lực và phụ kiện theo công thức chuẩn.',
  },
  {
    problem: 'Thợ chia cây nhôm theo kinh nghiệm khiến đề-xê phát sinh nhiều, khó tận dụng nhôm thừa và khó kiểm soát định mức tiêu hao.',
    solution: 'Tối ưu phương án cắt và xuất thẻ cắt A4 rõ ràng cho phân xưởng, giúp chủ động quản lý phôi nhôm và giảm hao hụt vật tư.',
  },
  {
    problem: 'Chạy nhiều công trình cùng lúc dễ thất thoát kho nhôm, kính, phụ kiện (Kinlong, Draho...) và chậm nhịp giữa xưởng với đội lắp đặt.',
    solution: 'Theo dõi tồn kho vật tư, tiến độ từ gia công ép góc đến lắp dựng và chấm công tại công trình trên cùng một hệ thống.',
  },
  {
    problem: 'Bản vẽ, phiếu thu chi, chấm công phân tán qua Zalo và giấy tờ rời rạc khiến chủ xưởng khó nắm rõ lãi/lỗ thực tế.',
    solution: 'Tập trung toàn bộ hồ sơ công trình, bản vẽ, phiếu kho và báo cáo tài chính trên một nền tảng đám mây đồng bộ.',
  },
];

export interface KeyFeatureItem {
  title: string;
  tag: string;
  desc: string;
  highlights: string[];
  icon: LucideIcon;
}

export const KEY_FEATURES: KeyFeatureItem[] = [
  {
    title: 'Thiết kế cửa CAD 2D/3D & Thư viện hãng nhôm',
    tag: 'XMS Fab',
    desc: 'Hỗ trợ sẵn hơn 25 hãng nhôm thông dụng (Xingfa, PMA, Kenwin, Rolan, Maxpro...) và 9+ hãng phụ kiện phổ biến, tùy chỉnh tỷ trọng và độ dày kính linh hoạt.',
    highlights: [
      'Chuyển đổi qua lại giữa bản vẽ kỹ thuật 2D và mô hình 3D trực quan',
      'Tùy chỉnh màu nhôm, độ dày kính và thông số tỷ trọng theo xưởng',
      'Phóng to, thu nhỏ, kiểm tra kích thước đố và cánh ngay trên trình duyệt',
    ],
    icon: PencilRuler,
  },
  {
    title: 'Bóc tách vật tư & Xuất thẻ cắt A4 tối ưu',
    tag: 'Sản xuất',
    desc: 'Tự động lập bảng bóc tách thanh nhôm, kính, phụ kiện và xuất thẻ cắt A4 trực tiếp cho tổ thợ gia công, hạn chế sai số và tận dụng nhôm thừa.',
    highlights: [
      'Tính toán tự động thanh nhôm, kính cường lực và phụ kiện theo công thức',
      'Gom cắt thông minh theo cây nhôm chuẩn, hạn chế đề-xê dư thừa',
      'In thẻ cắt A4 rõ kích thước từng thanh để thợ đưa vào máy cắt ngay',
    ],
    icon: Scissors,
  },
  {
    title: 'Báo giá nhanh & Chia sẻ link bản vẽ 3D',
    tag: 'Kinh doanh',
    desc: 'Lập dự toán nhanh ngay khi khảo sát công trình, gửi link xem bản vẽ 2D/3D cho chủ đầu tư và cập nhật đồng bộ khi có điều chỉnh.',
    highlights: [
      'Tạo bảng dự toán và báo giá chi tiết ngay tại công trình khảo sát',
      'Gửi 1 đường dẫn duy nhất cho khách hàng xem trước bản vẽ cửa',
      'Mọi thay đổi kích thước được cập nhật thẳng vào link đã gửi',
    ],
    icon: FileSpreadsheet,
  },
  {
    title: 'Quản lý kho vật tư & Tiến độ phân xưởng',
    tag: 'Kho & Xưởng',
    desc: 'Kiểm soát nhập – xuất – tồn kho nhôm, kính, phụ kiện theo từng đơn hàng; theo dõi từng công đoạn từ cắt, ép góc đến xuất xưởng.',
    highlights: [
      'Theo dõi tồn kho thực tế của từng hệ nhôm, kính và phụ kiện',
      'Gắn vật tư xuất kho trực tiếp vào từng đơn hàng sản xuất',
      'Cập nhật trạng thái gia công từ cắt phôi, ép góc đến hoàn thiện',
    ],
    icon: Package,
  },
  {
    title: 'App Mobile thực địa & Bảo hành QR',
    tag: 'XMS Build',
    desc: 'Đội lắp đặt chấm công tại công trình, cập nhật ảnh hiện trường, bàn giao nghiệm thu và kích hoạt tem bảo hành điện tử QR cho từng bộ cửa.',
    highlights: [
      'Thợ kỹ thuật chấm công tại công trình và cập nhật ảnh lắp dựng',
      'Tra cứu bản vẽ kỹ thuật và danh sách vật tư ngay trên điện thoại',
      'Quét mã QR nghiệm thu bàn giao và kích hoạt bảo hành điện tử',
    ],
    icon: QrCode,
  },
  {
    title: 'Quản lý thu chi, HCNS & Trợ lý AI XTTECH',
    tag: 'XMS Biz',
    desc: 'Tổng hợp chi phí vật tư, nhân công, báo cáo lãi/lỗ công trình; hỗ trợ nhập báo cáo tiến độ nhanh qua giọng nói và hình ảnh.',
    highlights: [
      'Theo dõi doanh thu, chi phí vật tư, công thợ và lãi/lỗ từng công trình',
      'Quản lý hồ sơ nhân sự, phân quyền chi tiết theo từng phòng ban',
      'Trợ lý AI hỗ trợ trích xuất văn bản báo cáo tiến độ từ giọng nói',
    ],
    icon: Cpu,
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
    avatarUrl: TEMP_MEMBER_AVATAR,
  },
  {
    name: 'Trần Hữu Văn',
    initials: 'HV',
    role: 'Tech Lead & Fullstack Engineer',
    bio: 'Phát triển lõi tính toán bóc tách vật tư BOM, tối ưu cắt, hệ thống API đám mây và giao diện web.',
    skills: ['Tech Lead', 'BOM & Tối ưu cắt', 'Cloud API'],
    avatarUrl: TEMP_MEMBER_AVATAR,
  },
  {
    name: 'Nguyễn Quang Linh',
    initials: 'QL',
    role: 'Fullstack & CAD 2D/3D Engineer',
    bio: 'Xây dựng giao diện thiết kế cửa CAD 2D/3D trực quan, trải nghiệm người dùng và tích hợp hệ thống.',
    skills: ['Fullstack Web', 'CAD 2D/3D', 'Hiệu năng giao diện'],
    avatarUrl: TEMP_MEMBER_AVATAR,
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

export interface PlatformCapabilityItem {
  title: string;
  desc: string;
  tags: string[];
  icon: LucideIcon;
}

export const PLATFORM_CAPABILITIES: PlatformCapabilityItem[] = [
  {
    title: 'Thiết kế CAD 2D/3D & Bóc tách',
    desc: 'Thiết kế cửa nhôm 2D/3D theo 25+ hãng nhôm, tự động bóc tách thanh nhôm, kính và phụ kiện.',
    tags: ['25+ hãng nhôm', 'Tự động bóc tách'],
    icon: PencilRuler,
  },
  {
    title: 'Sản xuất xưởng & Thẻ cắt A4',
    desc: 'Tối ưu phương án cắt phôi, xuất thẻ cắt A4 cho thợ và theo dõi tiến độ cắt, ép góc, hoàn thiện.',
    tags: ['Tối ưu cắt phôi', 'Thẻ cắt A4'],
    icon: Scissors,
  },
  {
    title: 'Kho vật tư & Bảo hành QR',
    desc: 'Quản lý nhập – xuất – tồn kho nhôm, kính, phụ kiện theo đơn hàng và tem bảo hành điện tử QR.',
    tags: ['Kho vật tư', 'Bảo hành QR'],
    icon: Package,
  },
  {
    title: 'Dự án & Thi công công trình',
    desc: 'Theo dõi tiến độ hạng mục, nhật ký lắp dựng, ảnh hiện trường và chấm công tại công trình.',
    tags: ['Tiến độ dự án', 'Chấm công công trình'],
    icon: HardHat,
  },
  {
    title: 'Báo giá & Hợp đồng (CRM)',
    desc: 'Lập dự toán báo giá nhanh, chia sẻ link bản vẽ 2D/3D cho khách hàng và quản lý hợp đồng.',
    tags: ['Báo giá nhanh', 'Chia sẻ link 2D/3D'],
    icon: FileSpreadsheet,
  },
  {
    title: 'Tài chính, Nhân sự & Báo cáo',
    desc: 'Tổng hợp thu chi, chi phí vật tư – nhân công, phân quyền HCNS và báo cáo lãi/lỗ từng công trình.',
    tags: ['Thu chi & HCNS', 'Lãi/lỗ công trình'],
    icon: TrendingUp,
  },
];

export const INTRODUCE_QUICK_STATS = [
  { label: 'Truy cập Web & App Mobile đồng bộ', value: 'Nền tảng Đám mây', icon: Smartphone },
  { label: 'Gửi link 2D/3D trực tiếp cho khách', value: 'Bản vẽ & Báo giá nhanh', icon: PencilRuler },
  { label: 'Hướng dẫn setup hệ nhôm theo xưởng', value: 'Đồng hành triển khai 1-1', icon: Wrench },
  { label: 'Phân quyền chặt chẽ từng bộ phận', value: 'Bảo mật dữ liệu riêng', icon: ShieldCheck },
];

export interface MissionPillar {
  title: string;
  desc: string;
  icon: LucideIcon;
}

export const MISSION_PILLARS: MissionPillar[] = [
  {
    title: 'Số hóa thực chất cho xưởng Việt',
    desc: 'Biến những đầu việc thủ công trên giấy tờ, Zalo và Excel thành quy trình gọn gàng, dễ áp dụng cho cả chủ xưởng lẫn thợ kỹ thuật.',
    icon: Layers,
  },
  {
    title: 'Đơn giản hóa nghiệp vụ kỹ thuật',
    desc: 'Từ bản vẽ CAD 2D/3D, bóc tách thanh nhôm đến thẻ cắt A4 và quản lý kho — mọi thao tác đều trực quan để ai trong xưởng cũng dùng được.',
    icon: Wrench,
  },
  {
    title: 'Minh bạch số liệu từ xưởng đến công trình',
    desc: 'Kết nối chặt chẽ giữa kho vật tư, tiến độ gia công, chấm công thực địa và báo cáo lãi/lỗ để chủ doanh nghiệp nắm rõ tình hình mỗi ngày.',
    icon: TrendingUp,
  },
  {
    title: 'Đồng hành bền vững cùng doanh nghiệp',
    desc: 'Không chỉ bàn giao phần mềm, đội ngũ XTTECH sát cánh từ khâu thiết lập hệ nhôm, đào tạo nhân sự đến tối ưu vận hành lâu dài.',
    icon: ShieldCheck,
  },
];
