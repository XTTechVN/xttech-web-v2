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

/* Màu nhấn (lime) – đồng bộ nhận diện thương hiệu XTTech */
export const ACCENT = '#d6ff3d';

export interface HeroStatItem {
  value: string;
  label: string;
}

// Số liệu ấn tượng về năng lực của XTTech
export const STATS: HeroStatItem[] = [
  { value: '500+', label: 'Xưởng nhôm & Nhà thầu tin dùng' },
  { value: '120,000+', label: 'Bộ cửa & Công trình hoàn thiện' },
  { value: '35%', label: 'Giảm chi phí vận hành & vật tư thừa' },
  { value: '99.8%', label: 'Độ chính xác bóc tách & thẻ cắt A4' },
];

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

export interface CorePillarItem {
  icon: LucideIcon;
  title: string;
  desc: string;
  tag: string;
}

// 4 Trụ cột giải pháp
export const CORE_PILLARS: CorePillarItem[] = [
  {
    icon: Factory,
    title: 'Chuyên biệt ngành Cửa & Nhôm Kính',
    desc: 'Thiết kế may đo cho xưởng sản xuất, tự động bóc tách kỹ thuật, tối ưu thanh nhôm tránh vụn nhôm thừa và in thẻ cắt A4 phân ca.',
    tag: 'Sản xuất thông minh',
  },
  {
    icon: Workflow,
    title: 'Liền mạch từ Báo giá đến Công trường',
    desc: 'Chu trình khép kín: Khảo sát ô chờ, live pricing engine lãi gộp, ký hợp đồng số, lệnh sản xuất và KCS nghiệm thu qua mã QR.',
    tag: 'Quy trình chuẩn ISO',
  },
  {
    icon: Users,
    title: 'Đồng hành tái cấu trúc xưởng 1-1',
    desc: 'Không dừng lại ở phần mềm đóng gói, chuyên gia XTTech trực tiếp tới xưởng hướng dẫn văn phòng & thợ cơ khí, chuẩn hóa kho vật tư.',
    tag: 'Chuyển giao thực chiến',
  },
  {
    icon: Cpu,
    title: 'Công nghệ tiên phong & Đa nền tảng',
    desc: 'Hoạt động trên Web, Tablet và Mobile App. Tích hợp chấm công GPS chống gian lận, ký điện tử và quản lý tiến độ thời gian thực.',
    tag: 'Hệ sinh thái 4.0',
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
      'Tự động bóc tách kỹ thuật, barem nhôm kính chuẩn xác 99.8%',
      'Thuật toán tối ưu hóa cắt nhôm, giảm tối đa đề-xê và vụn nhôm thừa',
      'Xuất lệnh sản xuất và in thẻ cắt A4 phân ca chi tiết cho thợ xưởng',
    ],
  },
  {
    number: '02',
    category: 'site',
    icon: Workflow,
    title: 'TIẾN ĐỘ THI CÔNG & LẮP ĐẶT',
    bullets: [
      'Cập nhật tiến độ sản xuất tại xưởng và lắp ráp công trình realtime',
      'Tự động đo lường tiến độ dự án, cảnh báo thi công chậm trễ',
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
      'Live pricing engine tính toán giá vốn, tỷ suất lãi gộp ngay tại công trình',
      'Quản lý ngân sách dự án, tiến độ giải ngân và công nợ từng khách hàng',
      'Số hóa biểu mẫu hợp đồng số, phụ lục, phiếu thu/chi tự động',
      'Dự báo chính xác lãi/lỗ thực tế so với kế hoạch dự toán ban đầu',
    ],
  },
  {
    number: '05',
    category: 'site',
    icon: Users,
    title: 'CHẤM CÔNG & NGUỒN LỰC THỢ',
    bullets: [
      'Chấm công thợ xưởng và thợ lắp đặt công trình qua GPS và FaceID',
      'Tự động cảnh báo khi xảy ra vượt định mức khối lượng hoặc trùng ca',
      'Tự động hóa bảng tính lương theo công nhật, giờ làm hoặc khoán sản phẩm',
      'Báo cáo quân số và năng suất làm việc của từng tổ đội realtime',
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
      'Cập nhật tiến độ thanh toán, đối soát công nợ NCC tự động',
      'Đánh giá năng lực và lịch sử hợp tác của từng đơn vị thầu phụ',
    ],
  },
  {
    number: '07',
    category: 'workshop',
    icon: Cpu,
    title: 'HỆ THỐNG BÁO CÁO THÔNG MINH',
    bullets: [
      'Dashboard báo cáo trực quan doanh thu, chi phí, dòng tiền thời gian thực',
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

export interface MissionVisionItem {
  title: string;
  subtitle: string;
  desc: string;
  highlight: string;
}

// Tầm nhìn & Sứ mệnh
export const MISSION_VISION: MissionVisionItem[] = [
  {
    title: 'Tầm nhìn chiến lược',
    subtitle: 'Kiến tạo vị thế số 1',
    desc: 'Trở thành nền tảng công nghệ số hàng đầu chuyên sâu cho ngành cơ khí, nhôm kính và xây lắp công trình — nâng tầm năng lực số cho hàng chục ngàn doanh nghiệp.',
    highlight: 'Dẫn đầu công nghệ quản trị sản xuất nhôm kính thế hệ mới.',
  },
  {
    title: 'Sứ mệnh phụng sự',
    subtitle: 'Giải phóng sức lao động',
    desc: 'Biến những khâu thủ công phức tạp, nhầm lẫn và thất thoát vật tư trở nên minh bạch chỉ qua vài chạm, giúp chủ xưởng nắm chắc lãi lỗ từng công trình.',
    highlight: 'Mang lại sự an tâm tuyệt đối và lợi nhuận bền vững cho khách hàng.',
  },
];

