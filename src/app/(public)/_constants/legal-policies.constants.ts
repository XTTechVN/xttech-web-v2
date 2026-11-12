import { CONTACT_INFO } from '@/config/contact';

export type LegalPolicyKey = 'privacy' | 'terms' | 'refund';

export interface LegalClause {
  heading: string;
  paragraphs: string[];
  bullets?: {
    lead?: string;
    text: string;
  }[];
}

export interface LegalSpecTable {
  title: string;
  standardRef: string;
  headers: [string, string, string];
  rows: [string, string, string][];
}

export interface LegalSection {
  id: string;
  articleCode: string;
  title: string;
  principleSummary: string;
  clauses: LegalClause[];
  table?: LegalSpecTable;
  commitmentNote?: {
    label: string;
    content: string;
  };
}

export interface LegalPolicyDocument {
  key: LegalPolicyKey;
  overline: string;
  standardTag: string;
  statusTag: string;
  documentCode: string;
  effectiveDate: string;
  versionLabel: string;
  legalBasisShort: string;
  issuingAuthority: string;
  title: string;
  preamble: string;
  principleBox: string;
  sections: LegalSection[];
}

export interface LegalSupportContact {
  companyName: string;
  legalDepartment: string;
  hotlineDisplay: string;
  hotlineHref: string;
  emailDisplay: string;
  emailHref: string;
  zaloHref: string;
  workingHours: string;
}

export const LEGAL_SUPPORT_INFO: LegalSupportContact = {
  companyName: 'HỆ THỐNG GIẢI PHÁP CÔNG NGHỆ XTTECH',
  legalDepartment: 'Ban Pháp chế & Hội đồng An toàn Thông tin XTTECH',
  hotlineDisplay: CONTACT_INFO.phoneDisplay,
  hotlineHref: `tel:${CONTACT_INFO.phone}`,
  emailDisplay: CONTACT_INFO.email,
  emailHref: `mailto:${CONTACT_INFO.email}`,
  zaloHref: CONTACT_INFO.zaloUrl,
  workingHours: '08:00 – 17:30 (Thứ Hai – Thứ Bảy)',
};

export const LEGAL_POLICIES: Record<LegalPolicyKey, LegalPolicyDocument> = {
  privacy: {
    key: 'privacy',
    overline: 'VĂN BẢN PHÁP LÝ & QUY ĐỊNH DOANH NGHIỆP',
    standardTag: 'ISO/IEC 27001:2022',
    statusTag: 'Hiệu lực hiện hành · v2.4',
    documentCode: 'VB-2026/BM-XTTECH',
    effectiveDate: '01/01/2026',
    versionLabel: 'Bản ban hành v2.4',
    legalBasisShort: 'Luật BVDLCN 91/2025/QH15 & Luật Dữ liệu 2024',
    issuingAuthority: 'Ban Pháp chế & HĐ An toàn XTTECH',
    title:
      'Chính Sách Bảo Mật Dữ Liệu & Quy Chế An Toàn Thông Tin Doanh Nghiệp',
    preamble:
      'Văn bản pháp lý này xác lập khuôn khổ trách nhiệm ràng buộc giữa Hệ thống Giải pháp Công nghệ XTTECH và các Doanh nghiệp, Tổ chức, Cá nhân sử dụng nền tảng. Chính sách được xây dựng và thi hành dựa trên cơ sở tuân thủ Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 (có hiệu lực từ ngày 01/01/2026), Luật Dữ liệu số 60/2024/QH15 (có hiệu lực từ ngày 01/07/2025), Nghị định số 13/2023/NĐ-CP của Chính phủ, Luật Giao dịch điện tử số 20/2023/QH15, Luật An ninh mạng số 24/2018/QH14 và tiêu chuẩn quản lý an toàn thông tin quốc tế ISO/IEC 27001:2022.',
    principleBox:
      'Hệ sinh thái XTTECH ERP vận hành dựa trên nguyên tắc thượng tôn pháp luật và xác định dữ liệu sản xuất – kinh doanh của khách hàng là tài sản tối thượng. Mọi dữ liệu kỹ thuật, bản vẽ hình học CAD, định mức vật tư BOM, bảng giá vốn nguyên vật liệu, công nợ thương mại và thông tin nhân sự được bảo vệ độc lập. XTTECH cam kết tuyệt đối không khai thác thương mại, không mua bán và không cấp quyền truy cập trái phép cho bất kỳ bên thứ ba nào dưới mọi hình thức.',
    sections: [
      {
        id: 'dieu-01',
        articleCode: 'ĐIỀU 01',
        title:
          'Quyền Sở Hữu Dữ Liệu Doanh Nghiệp & Bảo Mật Bản Vẽ Kỹ Thuật CAD/BOM',
        principleSummary:
          'Quy định quyền sở hữu tài sản trí tuệ độc quyền đối với dữ liệu mặt cắt nhôm kính, định mức vật tư và cơ chế cô lập dữ liệu đa thuê bao.',
        clauses: [
          {
            heading: 'Khoản 1.1. Quyền sở hữu tuyệt đối của Doanh nghiệp thuê bao',
            paragraphs: [
              'Toàn bộ dữ liệu được khởi tạo, tải lên hoặc phát sinh từ quá trình vận hành hệ thống XTTECH ERP — bao gồm nhưng không giới hạn ở: bản vẽ kỹ thuật CAD 2D/3D, thông số mặt cắt hệ nhôm, cấu hình kính, công thức khấu trừ gia công, bảng bóc tách định mức nguyên vật liệu (BOM), dữ liệu tối ưu cắt, bảng giá vốn nhà cung cấp, báo giá thương mại và hồ sơ hợp đồng — thuộc quyền sở hữu hợp pháp, duy nhất và tuyệt đối của Doanh nghiệp thuê bao.',
              'XTTECH chỉ đóng vai trò là đơn vị cung cấp hạ tầng công nghệ lưu trữ và xử lý tính toán tự động theo lệnh của người dùng; không giữ bất kỳ quyền sở hữu trí tuệ hay quyền định đoạt thương mại nào đối với dữ liệu của khách hàng.',
            ],
          },
          {
            heading:
              'Khoản 1.2. Cơ chế cô lập dữ liệu đa thuê bao (Multi-Tenant Isolation)',
            paragraphs: [
              'Hệ thống áp dụng kiến trúc phân tách dữ liệu độc lập cho từng pháp nhân doanh nghiệp nhằm loại bỏ hoàn toàn nguy cơ rò rỉ hoặc truy cập chéo giữa các đơn vị sản xuất trong cùng ngành:',
            ],
            bullets: [
              {
                lead: 'Mã hóa dữ liệu lưu trữ (Encryption at Rest):',
                text: 'Toàn bộ cơ sở dữ liệu dự án, tệp bản vẽ và chứng từ lưu trữ trên đám mây được mã hóa theo chuẩn AES-256.',
              },
              {
                lead: 'Mã hóa đường truyền (Encryption in Transit):',
                text: 'Mọi luồng truyền tải dữ liệu giữa trình duyệt web, thiết bị di động và máy chủ đều được mã hóa qua giao thức HTTPS/TLS 1.3.',
              },
              {
                lead: 'Kiểm soát truy cập theo vai trò (RBAC):',
                text: 'Doanh nghiệp chủ động thiết lập ma trận phân quyền chi tiết cho từng bộ phận (Ban Giám đốc, Kỹ thuật, Kế toán, Kho, Xưởng sản xuất), đảm bảo nhân sự chỉ tiếp cận đúng phạm vi công việc được giao.',
              },
            ],
          },
        ],
        commitmentNote: {
          label: 'Nguyên tắc hỗ trợ kỹ thuật:',
          content:
            'Chuyên viên kỹ thuật của XTTECH bị nghiêm cấm truy cập vào dữ liệu chi tiết của doanh nghiệp. Trong trường hợp cần kiểm tra để xử lý sự cố theo yêu cầu, việc tiếp cận chỉ được thực hiện sau khi có sự phê duyệt trực tiếp từ Quản trị viên của Doanh nghiệp.',
        },
      },
      {
        id: 'dieu-02',
        articleCode: 'ĐIỀU 02',
        title:
          'Bảo Vệ Dữ Liệu Cá Nhân & Quy Tắc Thu Thập Dữ Liệu Hiện Trường (Luật số 91/2025/QH15)',
        principleSummary:
          'Khuôn khổ tuân thủ Luật Bảo vệ dữ liệu cá nhân 2025 đối với thông tin của cán bộ văn phòng, kỹ thuật viên và đội ngũ lắp đặt tại công trình.',
        clauses: [
          {
            heading:
              'Khoản 2.1. Phân định trách nhiệm theo Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15',
            paragraphs: [
              'Theo quy định của Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 và Nghị định số 13/2023/NĐ-CP, Doanh nghiệp thuê bao đóng vai trò là "Bên Kiểm soát Dữ liệu Cá nhân" đối với thông tin nhân sự và khách hàng của đơn vị mình; XTTECH đóng vai trò là "Bên Xử lý Dữ liệu Cá nhân" thực hiện lưu trữ, bảo mật và xử lý theo đúng phạm vi hợp đồng dịch vụ đã giao kết.',
            ],
          },
          {
            heading:
              'Khoản 2.2. Phân loại dữ liệu và nguyên tắc thu thập tối thiểu trên thiết bị',
            paragraphs: [
              'Hệ thống phân tách rõ dữ liệu cá nhân cơ bản và dữ liệu gắn với vị trí hiện trường, chỉ thu thập các thông tin phục vụ trực tiếp cho nghiệp vụ định danh tài khoản, phân công công việc, chấm công và nghiệm thu lắp đặt công trình:',
            ],
          },
        ],
        table: {
          title: 'DANH MỤC DỮ LIỆU THU THẬP & THỜI HẠN LƯU TRỮ',
          standardRef: 'LUẬT SỐ 91/2025/QH15',
          headers: [
            'Nhóm dữ liệu',
            'Mục đích & Phạm vi thu thập hợp pháp',
            'Thời hạn lưu trữ',
          ],
          rows: [
            [
              'Dữ liệu cá nhân cơ bản (Tài khoản)',
              'Họ tên, số điện thoại, địa chỉ email, chức vụ và phòng ban nhằm cấp quyền đăng nhập và ghi nhận lịch sử thao tác.',
              'Trong suốt thời hạn hợp đồng',
            ],
            [
              'Dữ liệu định vị công trường (GPS)',
              'Chỉ ghi nhận tại đúng thời điểm nhân sự bấm chấm công hoặc gửi báo cáo nghiệm thu. Tuyệt đối không theo dõi vị trí ngầm ngoài giờ làm việc.',
              'Tối đa 90 ngày hoặc theo cấu hình DN',
            ],
            [
              'Hình ảnh & Chữ ký nghiệm thu',
              'Ảnh chụp thực tế hạng mục thi công và chữ ký xác nhận điện tử phục vụ đối soát chất lượng công trình và quyết toán.',
              'Theo vòng đời hồ sơ dự án',
            ],
          ],
        },
      },
      {
        id: 'dieu-03',
        articleCode: 'ĐIỀU 03',
        title:
          'Mục Đích Xử Lý Dữ Liệu & Cam Kết Không Chia Sẻ Cho Bên Thứ Ba',
        principleSummary:
          'Giới hạn nghiêm ngặt mục đích sử dụng dữ liệu và các trường hợp ngoại lệ duy nhất theo yêu cầu của cơ quan Nhà nước có thẩm quyền.',
        clauses: [
          {
            heading: 'Khoản 3.1. Phạm vi sử dụng dữ liệu hợp pháp',
            paragraphs: [
              'Dữ liệu thu thập trên hệ thống chỉ được sử dụng cho các mục đích vận hành nội bộ của chính Doanh nghiệp thuê bao, bao gồm: duy trì hoạt động tài khoản, tính toán bóc tách vật tư, xuất báo cáo quản trị, gửi thông báo trạng thái đơn hàng và hỗ trợ kỹ thuật khi có yêu cầu.',
            ],
          },
          {
            heading: 'Khoản 3.2. Cam kết không tiết lộ dữ liệu (Non-Disclosure)',
            paragraphs: [
              'XTTECH cam kết không bán, không cho thuê, không trao đổi và không tiết lộ bất kỳ thông tin cá nhân hay dữ liệu kinh doanh nào của Doanh nghiệp cho bên thứ ba, ngoại trừ hai trường hợp sau:',
            ],
            bullets: [
              {
                lead: 'Có văn bản ủy quyền của Doanh nghiệp:',
                text: 'Khi Doanh nghiệp chủ động kích hoạt kết nối tích hợp dữ liệu sang phần mềm kế toán, hóa đơn điện tử hoặc thiết bị máy cắt CNC của đối tác do chính Doanh nghiệp chỉ định.',
              },
              {
                lead: 'Yêu cầu pháp lý bắt buộc:',
                text: 'Khi có quyết định hoặc yêu cầu bằng văn bản hợp pháp từ Cơ quan Nhà nước có thẩm quyền theo trình tự luật định của pháp luật Việt Nam (trong trường hợp này, XTTECH sẽ thông báo trước cho Doanh nghiệp trừ khi pháp luật cấm thông báo).',
              },
            ],
          },
        ],
      },
      {
        id: 'dieu-04',
        articleCode: 'ĐIỀU 04',
        title:
          'An Toàn Hạ Tầng Đám Mây, Nhật Ký Kiểm Toán & Sao Lưu Dự Phòng',
        principleSummary:
          'Quy chuẩn bảo vệ máy chủ, ghi nhận nhật ký thao tác bất biến (Audit Log) và quy trình sao lưu khôi phục dữ liệu sau sự cố.',
        clauses: [
          {
            heading: 'Khoản 4.1. Nhật ký kiểm toán hệ thống (Audit Trail)',
            paragraphs: [
              'Mọi thao tác quan trọng trên phần mềm — bao gồm đăng nhập, tạo mới, chỉnh sửa hoặc xóa dự án, thay đổi đơn giá vật tư, phê duyệt báo giá và xuất nhập kho — đều được tự động ghi nhận kèm dấu thời gian thực, tài khoản thực hiện và địa chỉ IP. Nhật ký này giúp Ban Giám đốc doanh nghiệp kiểm soát nội bộ và truy vết minh bạch khi cần đối soát.',
            ],
          },
          {
            heading: 'Khoản 4.2. Cơ chế sao lưu định kỳ và phòng chống mất mát dữ liệu',
            paragraphs: [
              'Hệ thống cơ sở dữ liệu và kho lưu trữ tệp đính kèm được tự động sao lưu (Auto-Backup) định kỳ hằng ngày sang cụm máy chủ dự phòng độc lập. Trong trường hợp xảy ra sự cố phần cứng hoặc gián đoạn hạ tầng, cơ chế khôi phục thảm họa (Disaster Recovery) đảm bảo tái lập nguyên trạng dữ liệu của doanh nghiệp trong thời gian ngắn nhất.',
            ],
          },
        ],
      },
      {
        id: 'dieu-05',
        articleCode: 'ĐIỀU 05',
        title:
          'Quyền Của Chủ Thể Dữ Liệu, Trích Xuất & Xóa Bỏ Dữ Liệu Vĩnh Viễn',
        principleSummary:
          'Đảm bảo quyền tự quyết của doanh nghiệp trong việc chỉnh sửa, tải về toàn bộ dữ liệu gốc và yêu cầu tiêu hủy dữ liệu khi ngừng sử dụng.',
        clauses: [
          {
            heading: 'Khoản 5.1. Quyền truy cập, đính chính và trích xuất dữ liệu',
            paragraphs: [
              'Trong suốt thời gian sử dụng dịch vụ, Quản trị viên của Doanh nghiệp có toàn quyền truy cập, cập nhật, chỉnh sửa thông tin và chủ động trích xuất (Export) toàn bộ dữ liệu dự án, bảng bóc tách BOM, báo giá, danh mục vật tư và phiếu kho ra các định dạng tiêu chuẩn (.xlsx, .pdf, .csv) mà không bị giới hạn số lần tải về.',
            ],
          },
          {
            heading: 'Khoản 5.2. Quy trình bàn giao và tiêu hủy dữ liệu khi kết thúc hợp đồng',
            paragraphs: [
              'Khi chấm dứt hợp đồng sử dụng dịch vụ, XTTECH duy trì thời gian bảo lưu 60 ngày để Doanh nghiệp hoàn tất việc tải về toàn bộ dữ liệu lưu trữ. Sau thời hạn này (hoặc ngay lập tức khi có văn bản yêu cầu xóa sớm từ người đại diện hợp pháp của Doanh nghiệp), XTTECH sẽ tiến hành xóa vĩnh viễn và không thể khôi phục toàn bộ dữ liệu của Doanh nghiệp trên cả máy chủ chính lẫn các bản sao lưu dự phòng.',
            ],
          },
        ],
      },
      {
        id: 'dieu-06',
        articleCode: 'ĐIỀU 06',
        title:
          'Cơ Chế Thông Báo Sự Cố Bảo Mật & Hiệu Lực Sửa Đổi Chính Sách',
        principleSummary:
          'Quy định thời hạn cảnh báo khi phát hiện rủi ro an ninh mạng và nguyên tắc thông báo trước khi cập nhật quy định mới.',
        clauses: [
          {
            heading: 'Khoản 6.1. Quy trình ứng cứu và thông báo sự cố an toàn thông tin',
            paragraphs: [
              'Trong trường hợp phát hiện nguy cơ tấn công mạng hoặc sự cố rò rỉ dữ liệu có khả năng ảnh hưởng đến phạm vi dữ liệu của khách hàng, Ban An toàn Thông tin XTTECH có trách nhiệm kích hoạt quy trình cô lập sự cố ngay lập tức và gửi thông báo bằng văn bản cho Doanh nghiệp trong vòng tối đa 72 giờ kể từ khi phát hiện, tuân thủ nghiêm ngặt Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 và Điều 23 Nghị định số 13/2023/NĐ-CP.',
            ],
          },
          {
            heading: 'Khoản 6.2. Cập nhật và sửa đổi chính sách',
            paragraphs: [
              'Khi có sự thay đổi về quy định pháp luật hiện hành hoặc nâng cấp tiêu chuẩn bảo mật kỹ thuật, XTTECH sẽ cập nhật nội dung văn bản này và thông báo trước tối thiểu 15 ngày qua email quản trị hoặc thông báo trực tiếp trên hệ thống trước khi phiên bản mới chính thức có hiệu lực.',
            ],
          },
        ],
      },
    ],
  },

  terms: {
    key: 'terms',
    overline: 'VĂN BẢN PHÁP LÝ & QUY ĐỊNH DOANH NGHIỆP',
    standardTag: 'LUẬT GDĐT 2023 & LUẬT SHTT',
    statusTag: 'Hiệu lực hiện hành · v2.4',
    documentCode: 'VB-2026/ĐK-XTTECH',
    effectiveDate: '01/01/2026',
    versionLabel: 'Bản ban hành v2.4',
    legalBasisShort: 'Bộ luật Dân sự 2015 & Luật GDĐT 20/2023/QH15',
    issuingAuthority: 'Ban Pháp chế & HĐ An toàn XTTECH',
    title:
      'Điều Khoản Dịch Vụ & Quy Chế Sử Dụng Nền Tảng Phần Mềm XTTECH ERP',
    preamble:
      'Văn bản Điều khoản Dịch vụ này quy định các quyền, nghĩa vụ pháp lý và tiêu chuẩn vận hành giữa Hệ thống Giải pháp Công nghệ XTTECH và Doanh nghiệp/Khách hàng đăng ký sử dụng phần mềm. Văn bản được lập trên cơ sở tuân thủ Bộ luật Dân sự số 91/2015/QH13, Luật Thương mại số 36/2005/QH11, Luật Giao dịch điện tử số 20/2023/QH15, Nghị định số 23/2025/NĐ-CP về chữ ký điện tử & dịch vụ tin cậy, Luật Dữ liệu số 60/2024/QH15 và Luật Sở hữu trí tuệ hiện hành.',
    principleBox:
      'Bằng việc đăng ký tài khoản, ký kết hợp đồng thuê bao hoặc truy cập sử dụng hệ thống XTTECH ERP, Doanh nghiệp xác nhận đã đọc, hiểu rõ và đồng ý tuân thủ toàn bộ các điều khoản được quy định trong văn bản này. Mọi thỏa thuận đặc thù được ký kết bằng văn bản giữa hai bên (nếu có) sẽ được ưu tiên áp dụng cùng với các quy định chung dưới đây.',
    sections: [
      {
        id: 'dieu-01',
        articleCode: 'ĐIỀU 01',
        title:
          'Phạm Vi Cấp Phép Sử Dụng Phần Mềm & Quyền Sở Hữu Trí Tuệ',
        principleSummary:
          'Xác định phạm vi cấp quyền sử dụng phần mềm theo mô hình thuê bao (SaaS) và bảo hộ bản quyền đối với mã nguồn hệ thống.',
        clauses: [
          {
            heading: 'Khoản 1.1. Quyền sử dụng dịch vụ phần mềm (SaaS License)',
            paragraphs: [
              'XTTECH cấp cho Doanh nghiệp quyền sử dụng không độc quyền, có thời hạn và không được chuyển nhượng trái phép đối với hệ thống phần mềm quản trị sản xuất – kinh doanh nhôm kính XTTECH ERP theo đúng gói cước, số lượng tài khoản nhân sự và các phân hệ chức năng đã đăng ký.',
            ],
          },
          {
            heading: 'Khoản 1.2. Bảo hộ quyền sở hữu trí tuệ đối với nền tảng',
            paragraphs: [
              'Toàn bộ mã nguồn, thuật toán tính toán bóc tách vật tư, động cơ dựng hình CAD 2D/3D, cấu trúc cơ sở dữ liệu, giao diện thiết kế, tài liệu hướng dẫn và nhãn hiệu XTTECH thuộc quyền sở hữu trí tuệ hợp pháp của XTTECH. Nghiêm cấm mọi hành vi sao chép, dịch ngược mã nguồn (Reverse Engineering), phân tách hoặc tạo ra sản phẩm phái sinh nhằm mục đích thương mại cạnh tranh không lành mạnh.',
            ],
          },
        ],
      },
      {
        id: 'dieu-02',
        articleCode: 'ĐIỀU 02',
        title:
          'Quản Lý Tài Khoản Doanh Nghiệp & Trách Nhiệm Bảo Mật Truy Cập',
        principleSummary:
          'Quy định thẩm quyền của tài khoản Quản trị viên tối cao (Admin) và trách nhiệm quản lý nhân sự nội bộ của doanh nghiệp.',
        clauses: [
          {
            heading: 'Khoản 2.1. Thẩm quyền của Tài khoản Quản trị viên (Root Admin)',
            paragraphs: [
              'Khi kích hoạt dịch vụ, XTTECH bàn giao tài khoản Quản trị viên cao nhất cho người đại diện hợp pháp hoặc người được ủy quyền của Doanh nghiệp. Quản trị viên có toàn quyền khởi tạo tài khoản nhân viên, phân quyền theo vai trò, khóa tài khoản khi nhân sự nghỉ việc và phê duyệt các thiết lập quan trọng của đơn vị.',
            ],
          },
          {
            heading: 'Khoản 2.2. Nghĩa vụ sử dụng hợp pháp và an toàn tài khoản',
            paragraphs: [
              'Doanh nghiệp và các người dùng trực thuộc có trách nhiệm:',
            ],
            bullets: [
              {
                lead: 'Bảo mật thông tin xác thực:',
                text: 'Tự bảo quản mật khẩu đăng nhập, không dùng chung một tài khoản cho nhiều cá nhân ngoài tổ chức và thông báo ngay cho XTTECH nếu phát hiện dấu hiệu truy cập bất thường.',
              },
              {
                lead: 'Tuân thủ quy định pháp luật:',
                text: 'Không sử dụng hệ thống để lưu trữ, phát tán dữ liệu vi phạm pháp luật, mã độc hoặc thực hiện các hành vi gây quá tải, cản trở hoạt động bình thường của hạ tầng máy chủ.',
              },
            ],
          },
        ],
      },
      {
        id: 'dieu-03',
        articleCode: 'ĐIỀU 03',
        title:
          'Quy Chuẩn Dữ Liệu Thiết Kế Kỹ Thuật & Nghiệm Thu Sản Xuất',
        principleSummary:
          'Phân định trách nhiệm kiểm soát thông số kỹ thuật hệ nhôm, công thức khấu trừ và phê duyệt bản vẽ trước khi gia công.',
        clauses: [
          {
            heading: 'Khoản 3.1. Nguyên tắc vận hành công cụ tính toán tự động',
            paragraphs: [
              'Phần mềm XTTECH cung cấp công cụ tự động hóa thiết kế cửa nhôm kính, tính toán kích thước cắt nhôm, diện tích kính và định mức phụ kiện dựa trên thư viện thông số kỹ thuật và dữ liệu đầu vào do người dùng thiết lập.',
            ],
          },
          {
            heading: 'Khoản 3.2. Trách nhiệm rà soát và phê duyệt lệnh sản xuất',
            paragraphs: [
              'Trước khi phát hành phiếu xuất kho hoặc lệnh cắt nhôm/đặt kính hàng loạt xuống nhà xưởng, cán bộ kỹ thuật của Doanh nghiệp có trách nhiệm kiểm tra và xác nhận lại kích thước thông thủy thực tế tại công trình, mã hệ nhôm, độ dày kính và công thức khấu trừ. Đối với các hệ nhôm đặc thù hoặc cấu hình phi tiêu chuẩn do Doanh nghiệp tự tùy chỉnh công thức, Doanh nghiệp chịu trách nhiệm về tính chính xác của các thông số đã khai báo.',
            ],
          },
        ],
        commitmentNote: {
          label: 'Hỗ trợ chuẩn hóa kỹ thuật từ XTTECH:',
          content:
            'Đội ngũ kỹ sư của XTTECH luôn sẵn sàng hỗ trợ kiểm tra chéo và cập nhật chuẩn thông số hệ nhôm theo catalogue chính hãng của nhà sản xuất khi Doanh nghiệp gửi yêu cầu hỗ trợ.',
        },
      },
      {
        id: 'dieu-04',
        articleCode: 'ĐIỀU 04',
        title:
          'Cam Kết Chất Lượng Dịch Vụ (SLA), Bảo Trì & Hỗ Trợ Kỹ Thuật',
        principleSummary:
          'Chỉ số cam kết thời gian hoạt động liên tục của hệ thống đám mây và thời gian phản hồi hỗ trợ kỹ thuật cho doanh nghiệp.',
        clauses: [
          {
            heading: 'Khoản 4.1. Cam kết độ sẵn sàng của hệ thống (Service Level Agreement)',
            paragraphs: [
              'XTTECH cam kết duy trì hạ tầng máy chủ vận hành ổn định 24/7 với tỷ lệ thời gian hoạt động liên tục đạt tối thiểu 99.9% trong mỗi chu kỳ tháng, đáp ứng nhu cầu làm việc xuyên suốt của văn phòng và nhà xưởng:',
            ],
          },
        ],
        table: {
          title: 'BẢNG CAM KẾT CHẤT LƯỢNG VẬN HÀNH & HỖ TRỢ KỸ THUẬT (SLA)',
          standardRef: 'QUY CHUẨN VẬN HÀNH',
          headers: [
            'Hạng mục cam kết',
            'Nội dung chi tiết & Phương thức thực hiện',
            'Chỉ số cam kết',
          ],
          rows: [
            [
              'Tỷ lệ sẵn sàng hệ thống (Uptime)',
              'Đảm bảo truy cập lập báo giá, thiết kế bản vẽ, bóc tách BOM và quản lý kho liên tục 24/7.',
              '≥ 99.9% / tháng',
            ],
            [
              'Phản hồi sự cố khẩn cấp (Mức P1)',
              'Sự cố gián đoạn truy cập toàn hệ thống hoặc lỗi không xuất được lệnh sản xuất.',
              'Phản hồi ≤ 30 phút',
            ],
            [
              'Hỗ trợ nghiệp vụ & hướng dẫn sử dụng',
              'Hỗ trợ qua Hotline, Zalo và phần mềm điều khiển từ xa (UltraViewer / TeamViewer) từ Thứ Hai đến Thứ Bảy.',
              '08:00 – 17:30 hằng ngày',
            ],
            [
              'Bảo trì & nâng cấp định kỳ',
              'Thực hiện ngoài giờ hành chính (từ 00:00 – 04:00 sáng) và thông báo trước tối thiểu 24 giờ.',
              'Miễn phí 100% bản cập nhật',
            ],
          ],
        },
      },
      {
        id: 'dieu-05',
        articleCode: 'ĐIỀU 05',
        title:
          'Phí Dịch Vụ, Gia Hạn Thuê Bao & Chế Độ Bảo Lưu Dữ Liệu',
        principleSummary:
          'Quy định về chu kỳ thanh toán, thông báo nhắc gia hạn tự động và chính sách giữ an toàn dữ liệu khi tài khoản tạm ngưng.',
        clauses: [
          {
            heading: 'Khoản 5.1. Chu kỳ thanh toán và hóa đơn tài chính',
            paragraphs: [
              'Phí dịch vụ phần mềm được thanh toán theo chu kỳ gói cước mà Doanh nghiệp lựa chọn (theo tháng, 06 tháng hoặc theo năm). XTTECH cung cấp đầy đủ hợp đồng điện tử/văn bản và xuất hóa đơn giá trị gia tăng (GTGT) hợp lệ theo quy định của pháp luật thuế hiện hành.',
            ],
          },
          {
            heading: 'Khoản 5.2. Cơ chế nhắc gia hạn và bảo lưu dữ liệu khi quá hạn',
            paragraphs: [
              'Hệ thống tự động gửi thông báo nhắc gia hạn trước 15 ngày và 07 ngày trước khi gói dịch vụ hết hạn. Trường hợp Doanh nghiệp chậm gia hạn quá 07 ngày kể từ ngày đến hạn, tài khoản sẽ tạm chuyển sang chế độ Chỉ xem (Read-Only) — Doanh nghiệp vẫn đăng nhập để tra cứu và tải về toàn bộ dữ liệu cũ nhưng tạm dừng tạo dự án mới. Toàn bộ dữ liệu được bảo lưu an toàn tối thiểu 60 ngày để chờ gia hạn hoặc trích xuất.',
            ],
          },
        ],
      },
      {
        id: 'dieu-06',
        articleCode: 'ĐIỀU 06',
        title:
          'Giới Hạn Trách Nhiệm Pháp Lý, Bất Khả Kháng & Giải Quyết Tranh Chấp',
        principleSummary:
          'Quy định trường hợp miễn trừ bất khả kháng, giới hạn bồi thường thiệt hại và cơ chế thương lượng, giải quyết tranh chấp.',
        clauses: [
          {
            heading: 'Khoản 6.1. Sự kiện Bất khả kháng (Force Majeure)',
            paragraphs: [
              'Theo quy định tại Điều 156 Bộ luật Dân sự 2015, không bên nào phải chịu trách nhiệm pháp lý nếu việc chậm trễ hoặc gián đoạn nghĩa vụ phát sinh trực tiếp từ các sự kiện bất khả kháng nằm ngoài tầm kiểm soát hợp lý như: thiên tai, hỏa hoạn, dịch bệnh, sự cố đứt cáp quang quốc tế diện rộng hoặc yêu cầu khẩn cấp từ cơ quan Nhà nước có thẩm quyền.',
            ],
          },
          {
            heading: 'Khoản 6.2. Luật áp dụng và cơ quan giải quyết tranh chấp',
            paragraphs: [
              'Mọi vướng mắc hoặc tranh chấp phát sinh từ việc thực hiện Điều khoản dịch vụ này trước hết sẽ được giải quyết trên tinh thần hợp tác và thương lượng thiện chí giữa hai bên trong vòng 30 ngày kể từ ngày phát sinh. Trường hợp không đạt được thỏa thuận, tranh chấp sẽ được đưa ra giải quyết tại Tòa án nhân dân có thẩm quyền hoặc Trung tâm Trọng tài theo quy định của pháp luật Việt Nam.',
            ],
          },
        ],
      },
    ],
  },

  refund: {
    key: 'refund',
    overline: 'VĂN BẢN PHÁP LÝ & QUY ĐỊNH DOANH NGHIỆP',
    standardTag: 'LUẬT THƯƠNG MẠI & TÀI CHÍNH',
    statusTag: 'Hiệu lực hiện hành · v2.4',
    documentCode: 'VB-2026/HT-XTTECH',
    effectiveDate: '01/01/2026',
    versionLabel: 'Bản ban hành v2.4',
    legalBasisShort: 'Luật Thương mại 2005 & Luật BVQLNTĐ 19/2023/QH15',
    issuingAuthority: 'Ban Pháp chế & Phòng Kế toán XTTECH',
    title:
      'Chính Sách Hoàn Tiền, Đối Soát Thanh Toán & Đảm Bảo Quyền Lợi Khách Hàng',
    preamble:
      'Văn bản này quy định chi tiết các điều kiện áp dụng hoàn phí, nguyên tắc khấu trừ khi nâng cấp hoặc chấm dứt hợp đồng trước hạn, cùng quy trình đối soát và giải ngân hoàn tiền cho khách hàng sử dụng nền tảng XTTECH ERP. Chính sách được xây dựng minh bạch trên cơ sở tuân thủ Luật Thương mại số 36/2005/QH11, Luật Bảo vệ quyền lợi người tiêu dùng số 19/2023/QH15 và Nghị định số 123/2020/NĐ-CP được sửa đổi, bổ sung bởi Nghị định số 70/2025/NĐ-CP về hóa đơn, chứng từ điện tử.',
    principleBox:
      'XTTECH cam kết bảo vệ quyền lợi tài chính chính đáng của mọi khách hàng doanh nghiệp. Mọi yêu cầu hoàn tiền hợp lệ đều được tiếp nhận, đối soát chứng từ rõ ràng và giải ngân chuyển khoản trực tiếp về tài khoản ngân hàng của doanh nghiệp theo đúng khung thời gian cam kết dưới đây mà không phát sinh bất kỳ thủ tục gây phiền hà nào.',
    sections: [
      {
        id: 'dieu-01',
        articleCode: 'ĐIỀU 01',
        title:
          'Cam Kết Hoàn Tiền 100% Trong Giai Đoạn Khởi Tạo Dịch Vụ',
        principleSummary:
          'Bảo đảm hoàn lại toàn bộ chi phí đăng ký mới nếu phần mềm gặp lỗi kỹ thuật không đạt cam kết hoặc phát sinh thanh toán thừa.',
        clauses: [
          {
            heading: 'Khoản 1.1. Hoàn tiền 100% trong 07 ngày đầu tiên',
            paragraphs: [
              'Trong vòng 07 (bảy) ngày lịch kể từ ngày kích hoạt gói dịch vụ có trả phí lần đầu tiên, Doanh nghiệp được hoàn lại 100% số tiền đã thanh toán nếu hệ thống XTTECH ERP phát sinh lỗi kỹ thuật nghiêm trọng khiến các phân hệ cốt lõi không thể vận hành theo đúng tài liệu đặc tả và đội ngũ kỹ thuật của XTTECH không thể khắc phục trong vòng 48 giờ làm việc kể từ khi tiếp nhận thông báo.',
            ],
          },
          {
            heading: 'Khoản 1.2. Hoàn trả ngay các khoản thanh toán trùng lặp hoặc chuyển thừa',
            paragraphs: [
              'Trường hợp kế toán của Doanh nghiệp thực hiện lệnh chuyển khoản trùng lặp (Double Payment), chuyển nhầm số tiền cao hơn giá trị hóa đơn hoặc thanh toán nhầm kỳ cước do lỗi kết nối ngân hàng, XTTECH cam kết hoàn trả 100% khoản tiền chênh lệch ngay sau khi hai bên xác nhận sao kê giao dịch.',
            ],
          },
        ],
      },
      {
        id: 'dieu-02',
        articleCode: 'ĐIỀU 02',
        title:
          'Ma Trận Tỷ Lệ Hoàn Phí & Chấm Dứt Hợp Đồng Trước Hạn',
        principleSummary:
          'Quy định cách tính phí hoàn trả minh bạch đối với các hợp đồng thuê bao thanh toán theo chu kỳ dài hạn (06 tháng hoặc 12 tháng).',
        clauses: [
          {
            heading: 'Khoản 2.1. Nguyên tắc đối soát theo thời gian sử dụng thực tế',
            paragraphs: [
              'Đối với các hợp đồng thanh toán trả trước theo chu kỳ 06 tháng hoặc 12 tháng, trường hợp chấm dứt dịch vụ trước thời hạn được áp dụng định mức hoàn phí minh bạch theo bảng dưới đây:',
            ],
          },
        ],
        table: {
          title: 'MA TRẬN ĐỐI SOÁT TỶ LỆ HOÀN PHÍ & THỜI GIAN GIẢI NGÂN',
          standardRef: 'QUY CHUẨN KẾ TOÁN',
          headers: [
            'Trường hợp áp dụng',
            'Phương thức tính toán & Điều kiện đối soát',
            'Tỷ lệ hoàn / Thời gian',
          ],
          rows: [
            [
              'Yêu cầu trong 07 ngày đầu (Lỗi kỹ thuật hệ thống)',
              'Không phát sinh phí sử dụng; hoàn trả nguyên vẹn tổng số tiền doanh nghiệp đã thanh toán.',
              'Hoàn 100% · 02–03 ngày LV',
            ],
            [
              'Thanh toán trùng lặp / Chuyển khoản thừa',
              'Đối chiếu ủy nhiệm chi hoặc sao kê ngân hàng giữa phòng kế toán hai bên.',
              'Hoàn 100% phần dư · 24–48 giờ',
            ],
            [
              'Dừng hợp đồng năm do lỗi cam kết SLA của XTTECH',
              'Hoàn trả toàn bộ giá trị của các tháng chưa sử dụng tính từ thời điểm xác nhận chấm dứt.',
              '100% tháng còn lại · 03–05 ngày LV',
            ],
            [
              'Doanh nghiệp chủ động dừng hợp đồng năm trước hạn',
              'Khấu trừ số tháng thực tế đã sử dụng (tính theo đơn giá niêm yết tháng) và phí khởi tạo ban đầu (nếu có).',
              'Hoàn phần dư · 05–07 ngày LV',
            ],
          ],
        },
      },
      {
        id: 'dieu-03',
        articleCode: 'ĐIỀU 03',
        title:
          'Chính Sách Bù Trừ Chi Phí Khi Nâng Cấp Gói Dịch Vụ & Bảo Lưu',
        principleSummary:
          'Quyền lợi cộng dồn giá trị ngày sử dụng còn lại khi nâng cấp lên gói cao hơn hoặc tạm bảo lưu ngân sách khi xưởng tạm ngưng hoạt động.',
        clauses: [
          {
            heading: 'Khoản 3.1. Khấu trừ 100% giá trị còn lại khi nâng cấp gói cước (Pro-rata Credit)',
            paragraphs: [
              'Khi Doanh nghiệp có nhu cầu mở rộng quy mô sản xuất và nâng cấp lên gói dịch vụ cao hơn ngay trong kỳ thuê bao hiện tại, hệ thống sẽ tự động quy đổi 100% giá trị tiền tương ứng với số ngày chưa sử dụng của gói cũ để khấu trừ trực tiếp vào hóa đơn thanh toán của gói mới.',
            ],
          },
          {
            heading: 'Khoản 3.2. Quyền bảo lưu ngân sách hoặc chuyển nhượng hợp đồng',
            paragraphs: [
              'Trong trường hợp nhà xưởng tạm ngưng hoạt động để cải tạo mặt bằng hoặc tái cơ cấu pháp nhân, thay vì rút phí trước hạn, Doanh nghiệp có thể yêu cầu bảo lưu toàn bộ số tháng sử dụng còn lại trong thời hạn tối đa 12 tháng hoặc làm thủ tục chuyển nhượng quyền sử dụng hợp đồng sang pháp nhân mới thuộc cùng chủ sở hữu mà không mất bất kỳ khoản phí chuyển đổi nào.',
            ],
          },
        ],
      },
      {
        id: 'dieu-04',
        articleCode: 'ĐIỀU 04',
        title:
          'Các Hạng Mục Dịch Vụ Không Thuộc Phạm Vi Hoàn Tiền',
        principleSummary:
          'Phân định rõ các khoản chi phí dịch vụ triển khai một lần đã nghiệm thu thực tế hoặc chi phí trả hộ bên thứ ba.',
        clauses: [
          {
            heading: 'Khoản 4.1. Danh mục các khoản phí không hoàn lại',
            paragraphs: [
              'Để đảm bảo tính công bằng về chi phí nhân sự kỹ thuật đã thực hiện, chính sách hoàn tiền không áp dụng đối với các khoản mục dịch vụ triển khai một lần sau đây khi đã hoàn thành bàn giao:',
            ],
            bullets: [
              {
                lead: 'Dịch vụ đào tạo và triển khai trực tiếp tại xưởng:',
                text: 'Chi phí cử chuyên viên kỹ thuật đến khảo sát, cài đặt và đào tạo nhân sự trực tiếp tại văn phòng/nhà máy của khách hàng đã được nghiệm thu.',
              },
              {
                lead: 'Chi phí lập trình tính năng theo yêu cầu riêng (Custom Development):',
                text: 'Các hạng mục thiết kế mẫu báo giá riêng hoặc lập trình tính năng đặc thù theo đơn đặt hàng đã được bàn giao đúng biên bản đặc tả kỹ thuật.',
              },
              {
                lead: 'Chi phí hạ tầng và dịch vụ bên thứ ba:',
                text: 'Các khoản phí đăng ký tên miền riêng, chữ ký số, hóa đơn điện tử hoặc dịch vụ máy chủ riêng do XTTECH chi trả hộ nhà cung cấp thứ ba theo ủy quyền của Doanh nghiệp.',
              },
            ],
          },
        ],
      },
      {
        id: 'dieu-05',
        articleCode: 'ĐIỀU 05',
        title:
          'Quy Trình Tiếp Nhận, Đối Soát & Giải Ngân Hoàn Tiền 03 Bước',
        principleSummary:
          'Trình tự thủ tục đơn giản, rõ ràng từ khâu gửi yêu cầu trực tuyến đến khi tiền được chuyển trả về tài khoản ngân hàng của doanh nghiệp.',
        clauses: [
          {
            heading: 'Khoản 5.1. Trình tự thực hiện thủ tục hoàn phí',
            paragraphs: [
              'Doanh nghiệp thực hiện yêu cầu hoàn tiền nhanh chóng qua 03 bước chuẩn hóa mà không cần gửi hồ sơ giấy phức tạp:',
            ],
            bullets: [
              {
                lead: 'Bước 01 — Gửi yêu cầu đối soát:',
                text: `Đại diện Doanh nghiệp gửi email tới ${CONTACT_INFO.email} hoặc liên hệ Hotline/Zalo Pháp chế ${CONTACT_INFO.phoneDisplay} kèm theo Mã hợp đồng (hoặc số điện thoại đăng ký tài khoản) và chứng từ thanh toán.`,
              },
              {
                lead: 'Bước 02 — Thẩm định & Lập biên bản xác nhận (01–02 ngày làm việc):',
                text: 'Bộ phận Kế toán và Pháp chế của XTTECH kiểm tra lịch sử giao dịch, tính toán số tiền hoàn trả theo đúng quy định và gửi Biên bản đối soát hoàn phí qua email để Doanh nghiệp xác nhận.',
              },
              {
                lead: 'Bước 03 — Giải ngân chuyển khoản (02–05 ngày làm việc):',
                text: 'Ngay sau khi nhận được xác nhận đối soát, Phòng Kế toán XTTECH thực hiện lệnh chuyển khoản hoàn tiền về đúng tài khoản ngân hàng của Doanh nghiệp.',
              },
            ],
          },
        ],
      },
      {
        id: 'dieu-06',
        articleCode: 'ĐIỀU 06',
        title:
          'Quy Định Về Phương Thức Nhận Tiền & Điều Chỉnh Hóa Đơn Thuế GTGT',
        principleSummary:
          'Đảm bảo tuân thủ đúng quy định pháp luật về quản lý thuế, hóa đơn điện tử và an toàn tài chính doanh nghiệp.',
        clauses: [
          {
            heading: 'Khoản 6.1. Nguyên tắc tài khoản thụ hưởng hoàn tiền',
            paragraphs: [
              'Khoản tiền hoàn trả bắt buộc phải được chuyển khoản về đúng số tài khoản ngân hàng đứng tên Pháp nhân Doanh nghiệp (hoặc tài khoản của người đại diện hợp pháp đã thực hiện thanh toán ban đầu). XTTECH không thực hiện hoàn tiền bằng tiền mặt hoặc chuyển vào tài khoản cá nhân thứ ba không có giấy ủy quyền hợp lệ.',
            ],
          },
          {
            heading: 'Khoản 6.2. Thủ tục điều chỉnh hoặc thay thế hóa đơn GTGT điện tử',
            paragraphs: [
              'Trường hợp giao dịch hoàn phí đã được xuất Hóa đơn Giá trị gia tăng (GTGT) điện tử, hai bên sẽ lập văn bản thỏa thuận ghi rõ nội dung điều chỉnh và XTTECH thực hiện xuất hóa đơn điện tử điều chỉnh hoặc thay thế theo đúng quy định tại Nghị định số 123/2020/NĐ-CP được sửa đổi, bổ sung bởi Nghị định số 70/2025/NĐ-CP của Chính phủ (có hiệu lực từ ngày 01/06/2025) đồng thời với quá trình giải ngân hoàn phí.',
            ],
          },
        ],
      },
    ],
  },
};
