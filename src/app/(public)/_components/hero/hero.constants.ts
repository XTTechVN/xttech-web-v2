import {
  Factory,
  Cpu,
  Layers,
  Users,
  Workflow,
  Camera,
  Share2,
  Palette,
  FileSpreadsheet,
  type LucideIcon,
} from 'lucide-react';

export interface AdviseAdvantageItem {
  icon: LucideIcon;
  title: string;
  desc: string;
}

// Lợi thế tư vấn & chốt đơn
export const ADVISE_ADVANTAGES: AdviseAdvantageItem[] = [
  {
    icon: FileSpreadsheet,
    title: 'Lên phương án thiết kế cửa & gửi Bản vẽ ngay',
    desc: 'Xuất Báo giá và bản thảo Hợp đồng cho khách hàng ngay tại công trình chỉ trong vài phút.',
  },
  {
    icon: Camera,
    title: 'Chụp ảnh công trình & ghép mẫu cửa thực tế',
    desc: 'Khách hàng dễ dàng hình dung ngôi nhà hoàn thiện, linh hoạt đổi màu nhôm (vân gỗ, xám ghi, sâm panh).',
  },
  {
    icon: Layers,
    title: 'Trải nghiệm 3D sống động đóng mở cửa',
    desc: 'Mô phỏng chân thực cửa đi mở quay, cửa sổ lùa, cửa gấp xếp trượt, mở song song trực quan không cần cài app.',
  },
  {
    icon: Palette,
    title: 'Màu sắc theo catalogue chuẩn hãng',
    desc: 'Xingfa, PMA, Maxpro, Slim, Topal... hiển thị đúng tỷ lệ khung cánh và kính hoa đồng sắc nét.',
  },
  {
    icon: Share2,
    title: 'Gửi link 3D xem trực tiếp qua Zalo / SMS',
    desc: 'Khách hàng mở xem mượt mà trên iPhone/Android mà không cần cài thêm bất kỳ phần mềm nào.',
  },
  {
    icon: Workflow,
    title: 'Tự động đồng bộ khi sửa đổi thiết kế',
    desc: 'Mọi tinh chỉnh kích thước hay phụ kiện lập tức được cập nhật vào link đã gửi, không lo thất lạc bản vẽ.',
  },
];

export interface XTTechPillarCard {
  number: string;
  category: 'workshop' | 'site';
  icon: LucideIcon;
  title: string;
  bullets: string[];
}

// 8 Trụ cột giải pháp chuyên sâu XTTech theo phong cách card số hóa
export const XTTECH_PILLAR_CARDS: XTTechPillarCard[] = [
  {
    number: '01',
    category: 'workshop',
    icon: Factory,
    title: 'SẢN XUẤT CỬA & NHÔM KÍNH',
    bullets: [
      'Dễ dàng khởi tạo đơn hàng, thiết kế mẫu cửa 2D/3D trực quan',
      'Bóc tách tự động theo công thức và barem nhôm kính của xưởng',
      'Thuật toán hỗ trợ giảm hao hụt vật tư, tối ưu đề-xê và vụn nhôm thừa',
      'Xuất lệnh sản xuất và in thẻ cắt A4 phân ca chi tiết cho thợ xưởng',
    ],
  },
  {
    number: '02',
    category: 'site',
    icon: Workflow,
    title: 'TIẾN ĐỘ THI CÔNG & LẮP ĐẶT',
    bullets: [
      'Cập nhật tiến độ sản xuất tại xưởng và lắp ráp công trình nhanh chóng',
      'Hỗ trợ đo lường tiến độ dự án, cảnh báo thi công chậm trễ',
      'Lập nhật ký thi công, lưu trữ hình ảnh hiện trường trực tiếp trên app',
      'Kiểm soát quy trình khảo sát ô chờ và KCS nghiệm thu qua mã QR',
    ],
  },
  {
    number: '03',
    category: 'workshop',
    icon: Layers,
    title: 'KHO VẬT TƯ & BoQ DỰ ÁN',
    bullets: [
      'Quản lý danh mục thanh nhôm, kính, phụ kiện (Kinlong, Draho, Roto...)',
      'Cập nhật vật tư xuất nhập xưởng theo từng đơn hàng và công trình',
      'Tự động cảnh báo khi tồn kho chạm ngưỡng định mức tối thiểu',
      'Kiểm soát sử dụng vật tư thực tế, ngăn ngừa thất thoát triệt để',
    ],
  },
  {
    number: '04',
    category: 'site',
    icon: FileSpreadsheet,
    title: 'NGÂN SÁCH & BÁO GIÁ DỰ ÁN',
    bullets: [
      'Công cụ tính toán giá vốn, tỷ suất lãi gộp ngay tại công trình',
      'Quản lý ngân sách dự án và tiến độ thanh toán từng khách hàng',
      'Số hóa biểu mẫu hợp đồng số, phụ lục, phiếu thu/chi tự động',
      'Dự báo lãi/lỗ thực tế so với kế hoạch dự toán ban đầu',
    ],
  },
  {
    number: '05',
    category: 'site',
    icon: Users,
    title: 'CHẤM CÔNG & NGUỒN LỰC THỢ',
    bullets: [
      'Chấm công tại công trình cho thợ xưởng và đội lắp đặt qua ứng dụng di động',
      'Hỗ trợ cảnh báo khi xảy ra vượt định mức khối lượng hoặc trùng ca',
      'Hỗ trợ bảng tính lương theo công nhật, giờ làm hoặc khoán sản phẩm',
      'Báo cáo quân số và năng suất làm việc của từng tổ đội rõ ràng',
    ],
  },
  {
    number: '06',
    category: 'site',
    icon: Share2,
    title: 'THẦU PHỤ & NHÀ CUNG CẤP',
    bullets: [
      'Quản lý danh mục đối tác nhôm, kính cường lực, phụ kiện và đội thợ phụ',
      'Kiểm soát tiến độ giao hàng, đơn đặt kính và nghiệm thu chất lượng',
      'Cập nhật tiến độ thanh toán và đối soát đơn hàng với nhà cung cấp',
      'Đánh giá năng lực và lịch sử hợp tác của từng đơn vị thầu phụ',
    ],
  },
  {
    number: '07',
    category: 'workshop',
    icon: Cpu,
    title: 'HỆ THỐNG BÁO CÁO THÔNG MINH',
    bullets: [
      'Dashboard báo cáo trực quan doanh thu, chi phí, dòng tiền dự án',
      'Báo cáo tỷ lệ hao hụt thanh nhôm và hiệu suất vận hành máy móc',
      'Báo cáo tiến độ hoàn thành đơn hàng và công trình của toàn doanh nghiệp',
      'Xuất báo cáo đa định dạng (Excel, PDF) nhanh chóng phục vụ điều hành',
    ],
  },
  {
    number: '08',
    category: 'workshop',
    icon: Palette,
    title: 'PHÊ DUYỆT & ĐA NỀN TẢNG 4.0',
    bullets: [
      'Hoạt động liền mạch trên Web, Máy tính bảng (Tablet) và Mobile App',
      'Phê duyệt online đơn nghỉ phép, phiếu mua vật tư, đề xuất tạm ứng',
      'Ký số hợp đồng và gửi link bản vẽ 3D cho khách hàng qua Zalo/SMS',
      'Phân quyền bảo mật chặt chẽ theo vai trò (Chủ xưởng, Kế toán, Thợ kỹ thuật)',
    ],
  },
];

export interface HeroHighlightItem {
  bold: string;
  text: string;
}

// 4 lợi điểm cốt lõi hiển thị ở hero chính
export const HERO_HIGHLIGHTS: HeroHighlightItem[] = [
  {
    bold: 'Phù hợp các doanh nghiệp:',
    text: 'xưởng sản xuất nhôm kính, nhà thầu thi công mặt dựng và các công trình xây dựng dân dụng, công nghiệp...',
  },
  {
    bold: 'Chuyên sâu về ngành Nhôm Kính:',
    text: 'kết nối liền mạch từ khảo sát ô chờ, thiết kế bóc tách tự động theo công thức 2D/3D, dự toán báo giá đến xuất thẻ cắt A4 phân xưởng.',
  },
  {
    bold: 'App Mobile thực địa:',
    text: 'dành cho đội lắp đặt, kỹ thuật viên chấm công tại công trình và cập nhật tiến độ, bảo hành.',
  },
  {
    bold: 'Quản lý toàn diện từ A–Z:',
    text: 'vật tư kho - khối lượng bộ cửa - tiến độ sản xuất - dòng tiền hợp đồng - quản lý tài liệu - giao việc và hành chính nhân sự.',
  },
];

// Tùy chọn khu vực & chức vụ của form đăng ký tư vấn
export const CITY_OPTIONS: string[] = [
  'Hà Nội',
  'TP. Hồ Chí Minh',
  'Đà Nẵng',
  'Hải Phòng',
  'Bình Dương',
  'Đồng Nai',
  'Quảng Ninh',
  'Nghệ An',
  'Thanh Hóa',
  'Cần Thơ',
  'Tỉnh thành khác',
];

export const JOB_OPTIONS: string[] = [
  'Chủ doanh nghiệp / Chủ xưởng',
  'Quản lý sản xuất / Giám sát',
  'Kế toán / Thủ kho',
  'Kỹ thuật viên / Thiết kế cửa',
  'Nhà thầu / Đối tác thi công',
  'Khác',
];

export type DoorColorKey = 'wood' | 'grey' | 'white' | 'black' | 'champagne';

export interface DoorColorOption {
  key: DoorColorKey;
  label: string;
  swatch: string;
  frameColor: string;
  frameDark: string;
  sashColor: string;
}

export const DOOR_COLOR_OPTIONS: DoorColorOption[] = [
  {
    key: 'wood',
    label: 'Nhôm vân gỗ cao cấp',
    swatch: '#966b43',
    frameColor: '#9a6a43',
    frameDark: '#6d4728',
    sashColor: '#aa7a4f',
  },
  {
    key: 'grey',
    label: 'Nhôm xám ghi Xingfa',
    swatch: '#4b5563',
    frameColor: '#4b5563',
    frameDark: '#334155',
    sashColor: '#64748b',
  },
  {
    key: 'white',
    label: 'Nhôm trắng sứ tĩnh điện',
    swatch: '#e2e8f0',
    frameColor: '#cbd5e1',
    frameDark: '#94a3b8',
    sashColor: '#f1f5f9',
  },
  {
    key: 'black',
    label: 'Nhôm đen tuyền',
    swatch: '#18181b',
    frameColor: '#18181b',
    frameDark: '#09090b',
    sashColor: '#27272a',
  },
  {
    key: 'champagne',
    label: 'Nhôm Anode sâm panh',
    swatch: '#bfa06a',
    frameColor: '#bfa06a',
    frameDark: '#8f7344',
    sashColor: '#d1b582',
  },
];

export interface ProjectReportItem {
  id: string;
  number: string;
  title: string;
  category: string;
  description: string;
  imageSrc: string;
}

export const PROJECT_REPORTS: ProjectReportItem[] = [
  {
    id: 'overview',
    number: '01',
    title: 'Báo cáo tổng quan & Tiến trình dự án',
    category: 'Quản lý dự án',
    description:
      'Theo dõi xuyên suốt 5 bước nghiệp vụ: Khảo sát đo đạc → Thiết kế bóc tách → Dự toán báo giá → Ký kết hợp đồng → Lệnh gia công lắp đặt.',
    imageSrc: '/images/projects/project-overview.png',
  },
  {
    id: 'pricing',
    number: '02',
    title: 'Báo cáo cấu thành giá & Dự toán tự động',
    category: 'Dự toán & Báo giá',
    description:
      'Live pricing engine bóc tách chi tiết: Vật tư nhôm kính (49%), Nhân công thợ (9%), Nhôm hao hụt (2%), Chi phí xưởng & Tiền lãi (31%).',
    imageSrc: '/images/projects/project-pricing.png',
  },
  {
    id: 'contract',
    number: '03',
    title: 'Báo cáo hợp đồng & Tiến độ dòng tiền',
    category: 'Hợp đồng & Tài chính',
    description:
      'Kiểm soát giá trị hợp đồng hiệu lực, theo dõi số tiền đã thu theo đợt thi công, số tiền còn lại và hỗ trợ lập phiếu thu theo tiến độ.',
    imageSrc: '/images/projects/project-contract.png',
  },
  {
    id: 'production',
    number: '04',
    title: 'Lệnh sản xuất & Tối ưu thẻ cắt A4',
    category: 'Phân xưởng sản xuất',
    description: 'Tự động gom cửa, lập lệnh sản xuất (LSX), tối ưu hóa sơ đồ cắt cây nhôm hỗ trợ giảm đề-xê thừa và theo dõi tiến độ xuất xưởng.',
    imageSrc: '/images/projects/project-production.png',
  },
  {
    id: 'spec',
    number: '05',
    title: 'Bóc tách kỹ thuật & Định mức vật tư',
    category: 'Kỹ thuật bóc tách',
    description:
      'Chuẩn hóa danh mục vật tư theo từng hệ nhôm, kính cường lực, phụ kiện đồng bộ; tự động sinh phiếu đề xuất xuất/nhập vật tư công trình.',
    imageSrc: '/images/projects/project-spec.png',
  },
];