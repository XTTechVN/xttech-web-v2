import { NextResponse } from 'next/server';
import {
  BASE_SITE_URL,
  HOME_AI_FAQ_ITEMS,
  NEWS_CATEGORY_MAP,
  SEO_CONFIG,
  fetchAllPublicArticlesForSitemap,
} from '@/config';

export const revalidate = 3600;

export async function GET() {
  const articles = await fetchAllPublicArticlesForSitemap();
  const publishedArticles = articles
    .filter((item) => Boolean(item.slug) && item.status === 'published')
    .slice(0, 30);

  const lines: string[] = [
    `# ${SEO_CONFIG.siteName} — ${SEO_CONFIG.legalName}`,
    '',
    `> ${SEO_CONFIG.defaultDescription}`,
    '',
    '## Tổng quan về Doanh nghiệp & Sản phẩm (Company & Platform Overview)',
    `- **Tên thương hiệu:** ${SEO_CONFIG.siteName} (XTTECH ERP)`,
    `- **Pháp nhân:** ${SEO_CONFIG.legalName}`,
    `- **Website chính thức:** ${BASE_SITE_URL}`,
    `- **Hotline tư vấn:** ${SEO_CONFIG.contactPhone} (Zalo: https://zalo.me/0776710766)`,
    `- **Email hỗ trợ:** ${SEO_CONFIG.contactEmail}`,
    '- **Nền tảng hỗ trợ:** Web App (Desktop/Tablet) & Mobile PWA (iOS/Android)',
    '- **Thị trường trọng tâm:** Việt Nam — Doanh nghiệp vừa và nhỏ (SME), xưởng sản xuất cửa nhôm kính & cơ khí, nhà thầu thi công xây lắp công trình.',
    '',
    '## 3 Phân hệ Giải pháp Cốt lõi (Core Product Suites)',
    '1. **XMS Fab (Phần mềm Quản lý Sản xuất Nhôm Kính & Nội Thất):**',
    '   - Thiết kế cửa nhôm kính trực quan bằng Door Studio CAD 2D & mô phỏng đóng mở 3D ngay trên trình duyệt (hỗ trợ Xingfa, PMA, Maxpro, Topal, Slim, Việt Pháp, cửa uốn vòm...).',
    '   - Tự động bóc tách định mức vật tư (BOM) thanh nhôm, kính, phụ kiện, roan/keo chính xác 99.8%.',
    '   - Tối ưu cắt thanh nhôm giảm nhôm vụn, in thẻ sản xuất A4 phân ca và xuất file Excel đơn đặt kính 2 sheet kèm hình vẽ kỹ thuật.',
    '2. **XMS Build (Phần mềm Quản lý Thi công Công trình & Đội Thợ):**',
    '   - Quản lý khảo sát ô chờ, tiến độ sản xuất – giao hàng – lắp đặt theo thời gian thực.',
    '   - Cấp mã QR riêng cho từng bộ cửa / hạng mục công trình để KCS nghiệm thu hiện trường và kích hoạt sổ bảo hành điện tử.',
    '   - Quản lý kho vật tư nhôm, kính, phụ kiện, nhôm dư tái sử dụng và đối chiếu thiếu hụt vật tư.',
    '3. **XMS Biz (Phần mềm Quản trị Doanh nghiệp, Nhân sự HRM & Kinh doanh):**',
    '   - Lập báo giá tự động theo tỷ lệ lợi nhuận kỳ vọng, soạn thảo & ký số hợp đồng điện tử trực tuyến.',
    '   - Chấm công GPS công trình chống gian lận, phân ca làm việc, duyệt đơn nghỉ phép / giải trình công và bảng công tính lương.',
    '   - Quản lý khách hàng (CRM), giao việc nhân sự (Tasks), văn bản quy định nội bộ và báo cáo dòng tiền / lãi lỗ từng dự án.',
    '',
    '## Bảng Giá Niêm Yết Minh Bạch (Official Pricing Summary)',
    `- Chi tiết đầy đủ tại: ${BASE_SITE_URL}/pricing`,
    '- **Gói Miễn Phí Trọn Đời (0đ):** Hỗ trợ tối đa 3 nhân sự (20 bộ cửa cho XMS Fab hoặc 10 công trình cho XMS Build / XMS Biz), không yêu cầu thẻ thanh toán.',
    '- **XMS Fab (Xưởng Nhôm Kính):** Gói Gọn `590.000đ/tháng` (`5.900.000đ/năm`), Gói Tái cấu trúc `1.290.000đ/tháng` (`12.900.000đ/năm`), Gói Tổng thầu `2.490.000đ/tháng` (`29.900.000đ/năm`).',
    '- **XMS Build (Xây dựng & Đội thợ):** Gói Đội nhỏ `490.000đ/tháng` (`4.900.000đ/năm`), Gói Đội lớn `990.000đ/tháng` (`9.900.000đ/năm`), Gói Tổng thầu `24.900.000đ/năm`.',
    '- **XMS Biz (Quản trị Doanh nghiệp & HRM):** Gói Văn phòng `390.000đ/tháng` (`3.900.000đ/năm`), Gói Vận hành `790.000đ/tháng` (`7.900.000đ/năm`), Gói Tổng thầu `19.900.000đ/năm`.',
    '- **Chính sách cam kết:** Hoàn tiền 100% trong 7 ngày đầu nếu không phù hợp; hỗ trợ chuyên gia đào tạo và chuyển giao quy trình 1-1.',
    '',
    '## Câu hỏi Thường gặp Dành cho Trợ lý AI (FAQ for AI Assistants)',
    ...HOME_AI_FAQ_ITEMS.flatMap((faq) => [`### ${faq.question}`, faq.answer, '']),
    '## Đường dẫn Trang Chính (Primary URLs)',
    `- [Trang chủ XTTECH ERP](${BASE_SITE_URL}): Giới thiệu tổng quan hệ sinh thái ERP nhôm kính, xây dựng & quản trị doanh nghiệp.`,
    `- [Bảng giá dịch vụ](${BASE_SITE_URL}/pricing): So sánh tính năng và chi phí các gói XMS Fab, XMS Build, XMS Biz.`,
    `- [Tin tức & Kiến thức chuyên ngành](${BASE_SITE_URL}/news): Bài viết kỹ thuật nhôm kính, giải pháp quản trị xưởng và công trình thực tế.`,
    `- [Chính sách bảo mật](${BASE_SITE_URL}/privacy-policy): Cam kết bảo mật bản vẽ CAD, định mức BOM và dữ liệu doanh nghiệp.`,
    `- [Điều khoản dịch vụ](${BASE_SITE_URL}/terms-of-service): Quy định sử dụng nền tảng và cam kết SLA 99.9%.`,
    `- [Chính sách hoàn tiền](${BASE_SITE_URL}/refund-policy): Chính sách dùng thử miễn phí và hoàn tiền 100% trong 7 ngày đầu.`,
  ];

  if (publishedArticles.length > 0) {
    lines.push('', '## Bài viết & Kiến thức Chuyên ngành Mới nhất (Latest Published Articles)');
    for (const article of publishedArticles) {
      const url = `${BASE_SITE_URL}/news/${encodeURIComponent(article.slug)}`;
      const categoryLabel = NEWS_CATEGORY_MAP[article.category] || article.category;
      const summary = article.summary?.trim() ? ` — ${article.summary.trim()}` : '';
      lines.push(`- [${article.title}](${url}) (${categoryLabel})${summary}`);
    }
  }

  return new NextResponse(lines.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

