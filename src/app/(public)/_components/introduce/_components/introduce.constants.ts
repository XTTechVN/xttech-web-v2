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
    title: 'Tiết kiệm thời gian lập báo giá',
    desc: 'Lên phương án thiết kế và dự toán vật tư nhanh chóng ngay tại công trình, giảm thời gian chờ đợi tính tay trên Excel.',
    icon: Clock,
  },
  {
    title: 'Giảm hao hụt phôi & chi phí kho',
    desc: 'Chuẩn hóa công thức bóc tách và thẻ cắt A4 giúp kiểm soát chặt định mức nhôm, kính, phụ kiện cho từng đơn hàng.',
    icon: TrendingUp,
  },
  {
    title: 'Nâng cao năng suất xưởng & đội thợ',
    desc: 'Giao việc rõ ràng theo bản vẽ, theo dõi tiến độ xuyên suốt từ văn phòng, phân xưởng sản xuất đến tổ lắp dựng.',
    icon: Wrench,
  },
  {
    title: 'Minh bạch dữ liệu & dòng tiền',
    desc: 'Chủ doanh nghiệp nắm bắt tức thời tình trạng vật tư, công thợ và hiệu quả lãi/lỗ của từng dự án trên một màn hình.',
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
    title: 'Xưởng sản xuất cửa nhôm kính & nội thất',
    subtitle: 'Từ xưởng quy mô vừa đến nhà máy gia công',
    points: [
      'Cần thiết kế CAD 2D/3D, bóc tách BOM và xuất thẻ cắt A4 nhanh cho thợ',
      'Muốn chuẩn hóa thư viện hệ nhôm, phụ kiện theo giá nhập thực tế',
    ],
    icon: Building2,
  },
  {
    title: 'Nhà thầu thi công & Xây lắp công trình',
    subtitle: 'Mặt dựng, dân dụng, công nghiệp',
    points: [
      'Quản lý đồng thời nhiều hạng mục, dự án và kho vật tư công trường',
      'Theo dõi sát tiến độ lắp đặt, bàn giao và nghiệm thu bảo hành QR',
    ],
    icon: HardHat,
  },
  {
    title: 'Đội thợ lắp đặt & Kỹ thuật viên hiện trường',
    subtitle: 'Sử dụng App Mobile tại công trình',
    points: [
      'Xem bản vẽ, kích thước ô chờ và danh sách vật tư cần mang đi lắp',
      'Chấm công tại công trình và gửi ảnh báo cáo nghiệm thu về văn phòng',
    ],
    icon: Smartphone,
  },
  {
    title: 'Chủ xưởng, Kế toán, Thủ kho & Kinh doanh',
    subtitle: 'Phối hợp nhịp nhàng trên một dữ liệu chung',
    points: [
      'Kinh doanh chốt báo giá nhanh, kế toán nắm chi phí vật tư và nhân công',
      'Chủ doanh nghiệp xem báo cáo tổng hợp và phê duyệt từ xa',
    ],
    icon: Users,
  },
];

export interface DeveloperMember {
  name: string;
  role: string;
  bio: string;
}

export const DEVELOPER_TEAM_MEMBERS: DeveloperMember[] = [
  {
    name: 'Bùi Xuân Đức',
    role: 'Founder & Kiến trúc hệ thống',
    bio: 'Phụ trách định hướng sản phẩm và kiến trúc nền tảng ERP ngành nhôm kính, xây dựng.',
  },
  {
    name: 'Trần Hữu Văn',
    role: 'Tech Lead & Fullstack Engineer',
    bio: 'Phát triển lõi tính toán bóc tách vật tư BOM, tối ưu cắt, hệ thống API đám mây và giao diện web.',
  },
  {
    name: 'Nguyễn Quang Linh',
    role: 'Fullstack & CAD 2D/3D Engineer',
    bio: 'Xây dựng giao diện thiết kế cửa CAD 2D/3D trực quan, trải nghiệm người dùng và tích hợp hệ thống.',
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
