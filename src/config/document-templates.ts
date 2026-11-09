import dayjs from 'dayjs';

export interface AdministrativeDocumentTemplate {
  id: 'decision' | 'announcement' | 'procedure' | 'regulation';
  label: string;
  docTypes: string[];
  description: string;
  defaultBodyHtml: string;
}

export const ADMINISTRATIVE_TEMPLATES: AdministrativeDocumentTemplate[] = [
  {
    id: 'decision',
    label: 'Mẫu Quyết định (Điều 1, 2, 3)',
    docTypes: ['decision'],
    description: 'Bố cục chuẩn Quyết định của Ban Giám đốc: Căn cứ pháp lý, Xét đề nghị và các Điều khoản thi hành.',
    defaultBodyHtml: `<p style="text-align: justify;"><em>- Căn cứ Điều lệ tổ chức và hoạt động của Công ty Cổ phần XTTECH;</em></p>
<p style="text-align: justify;"><em>- Căn cứ chức năng, nhiệm vụ và quyền hạn của Ban Giám đốc;</em></p>
<p style="text-align: justify;"><em>- Xét đề nghị của Trưởng bộ phận chuyên môn,</em></p>
<h3 style="text-align: center;"><strong>QUYẾT ĐỊNH:</strong></h3>
<p style="text-align: justify;"><strong>Điều 1. Nội dung ban hành</strong></p>
<p style="text-align: justify;">Ban hành kèm theo Quyết định này nội dung quy định/phương án triển khai áp dụng thống nhất trong phạm vi Công ty.</p>
<p style="text-align: justify;"><strong>Điều 2. Tổ chức thực hiện</strong></p>
<p style="text-align: justify;">Các phòng ban, bộ phận và cá nhân có liên quan chịu trách nhiệm phối hợp triển khai thực hiện nghiêm túc nội dung tại Điều 1.</p>
<p style="text-align: justify;"><strong>Điều 3. Hiệu lực thi hành</strong></p>
<p style="text-align: justify;">Quyết định này có hiệu lực kể từ ngày ký. Trưởng các phòng ban và toàn thể CBNV có liên quan chịu trách nhiệm thi hành Quyết định này./.</p>`,
  },
  {
    id: 'announcement',
    label: 'Mẫu Thông báo nội bộ',
    docTypes: ['announcement', 'notice'],
    description: 'Bố cục chuẩn Thông báo gửi toàn công ty hoặc phòng ban về lịch làm việc, chủ trương, sự kiện.',
    defaultBodyHtml: `<p style="text-align: center;"><strong>Kính gửi: Toàn thể Cán bộ Nhân viên Công ty Cổ phần XTTECH</strong></p>
<p style="text-align: justify;">Nhằm đảm bảo sự thống nhất trong công tác vận hành và phối hợp giữa các phòng ban, Ban Giám đốc thông báo đến toàn thể Cán bộ Nhân viên nội dung như sau:</p>
<p style="text-align: justify;"><strong>1. Nội dung thông báo:</strong></p>
<ul>
  <li>Nội dung chi tiết thứ nhất...</li>
  <li>Nội dung chi tiết thứ hai...</li>
</ul>
<p style="text-align: justify;"><strong>2. Thời gian áp dụng:</strong></p>
<p style="text-align: justify;">Bắt đầu thực hiện từ ngày .../.../2026 cho đến khi có thông báo mới.</p>
<p style="text-align: justify;"><strong>3. Tổ chức thực hiện:</strong></p>
<p style="text-align: justify;">Đề nghị Trưởng các bộ phận phổ biến đầy đủ nội dung thông báo này đến từng nhân sự trực thuộc để nghiêm túc thực hiện./.</p>`,
  },
  {
    id: 'procedure',
    label: 'Mẫu Quy trình / Hướng dẫn (SOP)',
    docTypes: ['procedure', 'guideline', 'standard', 'norm'],
    description: 'Bố cục chuẩn Quy trình thao tác chuẩn (SOP): Mục đích, Phạm vi, Định nghĩa, Các bước thực hiện.',
    defaultBodyHtml: `<p style="text-align: center;"><strong>PHẦN I: MỤC ĐÍCH &amp; PHẠM VI ÁP DỤNG</strong></p>
<p style="text-align: justify;"><strong>1. Mục đích:</strong> Quy trình này quy định trình tự, trách nhiệm và biểu mẫu áp dụng nhằm chuẩn hóa hoạt động nghiệp vụ tại Công ty Cổ phần XTTECH.</p>
<p style="text-align: justify;"><strong>2. Phạm vi áp dụng:</strong> Áp dụng đối với các phòng ban, bộ phận trực tiếp tham gia vào luồng công việc liên quan.</p>
<p style="text-align: center;"><strong>PHẦN II: NỘI DUNG QUY TRÌNH THỰC HIỆN</strong></p>
<p style="text-align: justify;"><strong>Bước 1: Tiếp nhận và kiểm tra yêu cầu</strong></p>
<p style="text-align: justify;">Bộ phận phụ trách tiếp nhận hồ sơ, đối chiếu tiêu chuẩn kỹ thuật và xác nhận tính hợp lệ.</p>
<p style="text-align: justify;"><strong>Bước 2: Xử lý và thẩm định chuyên môn</strong></p>
<p style="text-align: justify;">Thực hiện nghiệp vụ theo phân công, ghi nhận kết quả lên hệ thống quản trị ERP.</p>
<p style="text-align: justify;"><strong>Bước 3: Phê duyệt và nghiệm thu kết quả</strong></p>
<p style="text-align: justify;">Trưởng bộ phận kiểm tra, ký duyệt nghiệm thu và lưu trữ hồ sơ theo quy định./.</p>`,
  },
  {
    id: 'regulation',
    label: 'Mẫu Quy chế / Chính sách / Tờ trình',
    docTypes: ['regulation', 'rule', 'policy'],
    description: 'Bố cục chuẩn Quy chế quản trị nội bộ chia theo Chương, Điều khoản rõ ràng.',
    defaultBodyHtml: `<p style="text-align: center;"><strong>CHƯƠNG I: QUY ĐỊNH CHUNG</strong></p>
<p style="text-align: justify;"><strong>Điều 1. Mục đích ban hành</strong></p>
<p style="text-align: justify;">Xây dựng khuôn khổ quản trị minh bạch, thống nhất tiêu chuẩn làm việc và nâng cao hiệu suất vận hành tại doanh nghiệp.</p>
<p style="text-align: justify;"><strong>Điều 2. Đối tượng và phạm vi áp dụng</strong></p>
<p style="text-align: justify;">Áp dụng đối với toàn thể Cán bộ Nhân viên đang làm việc tại các phòng ban, đơn vị trực thuộc Công ty Cổ phần XTTECH.</p>
<p style="text-align: center;"><strong>CHƯƠNG II: NỘI DUNG QUY ĐỊNH CHI TIẾT</strong></p>
<p style="text-align: justify;"><strong>Điều 3. Nguyên tắc thực hiện</strong></p>
<p style="text-align: justify;">1. Tuân thủ đúng quy trình, thẩm quyền và thời hạn xử lý công việc.</p>
<p style="text-align: justify;">2. Đảm bảo tính chính xác, bảo mật thông tin và phối hợp liên phòng ban hiệu quả.</p>
<p style="text-align: center;"><strong>CHƯƠNG III: ĐIỀU KHOẢN THI HÀNH</strong></p>
<p style="text-align: justify;"><strong>Điều 4. Hiệu lực và trách nhiệm thi hành</strong></p>
<p style="text-align: justify;">Văn bản này có hiệu lực kể từ ngày ban hành. Phòng Hành chính - Nhân sự và Trưởng các bộ phận chịu trách nhiệm hướng dẫn, giám sát việc thực hiện./.</p>`,
  },
];

export function getTemplateByDocType(documentType?: string): AdministrativeDocumentTemplate {
  return (
    ADMINISTRATIVE_TEMPLATES.find((tpl) => tpl.docTypes.includes(documentType || '')) ||
    ADMINISTRATIVE_TEMPLATES[3]
  );
}

const BODY_START_MARKER = '<!-- XTTECH_BODY_START -->';
const BODY_END_MARKER = '<!-- XTTECH_BODY_END -->';

export interface BuildAdministrativeA4Params {
  title: string;
  code?: string | null;
  documentType: string;
  summary?: string | null;
  effectiveDate?: string | null;
  bodyHtml: string;
  creatorName?: string | null;
  approverName?: string | null;
}

export const DOC_TYPE_HEADING_MAP: Record<string, string> = {
  decision: 'QUYẾT ĐỊNH',
  announcement: 'THÔNG BÁO',
  notice: 'THÔNG BÁO',
  procedure: 'QUY TRÌNH NGHIỆP VỤ',
  guideline: 'HƯỚNG DẪN CÔNG VIỆC',
  regulation: 'QUY CHẾ QUẢN TRỊ',
  rule: 'NỘI QUY - QUY ĐỊNH',
  policy: 'CHÍNH SÁCH CÔNG TY',
  standard: 'TIÊU CHUẨN KỸ THUẬT',
  norm: 'ĐỊNH MỨC KỸ THUẬT',
};

export function buildAdministrativeA4Html(params: BuildAdministrativeA4Params): string {
  const dateObj = params.effectiveDate ? dayjs(params.effectiveDate) : dayjs();
  const dateStr = `Ngày ${dateObj.format('DD')} tháng ${dateObj.format('MM')} năm ${dateObj.format('YYYY')}`;
  const docCode = params.code?.trim() || '....../2026/VB-XTTECH';
  const typeHeading = DOC_TYPE_HEADING_MAP[params.documentType] || 'VĂN BẢN ĐỊNH CHẾ';
  const cleanTitle = (params.title || 'Tiêu đề văn bản').trim();

  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${cleanTitle}</title>
<style>
  @page { size: A4 portrait; margin: 20mm 18mm 20mm 25mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 0;
    background: #ffffff;
    color: #111827;
    font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 13pt;
    line-height: 1.65;
  }
  .a4-sheet {
    max-width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    padding: 18mm 18mm 20mm 24mm;
    background: #ffffff;
  }
  .admin-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 22px;
  }
  .header-left, .header-right {
    text-align: center;
  }
  .header-left { width: 44%; }
  .header-right { width: 54%; }
  .company-name {
    font-weight: 700;
    font-size: 12pt;
    text-transform: uppercase;
    margin: 0;
  }
  .nation-title {
    font-weight: 700;
    font-size: 12pt;
    text-transform: uppercase;
    margin: 0;
  }
  .nation-motto {
    font-weight: 700;
    font-size: 12.5pt;
    margin: 2px 0 0 0;
  }
  .divider-line {
    width: 120px;
    border-bottom: 1.5px solid #111827;
    margin: 5px auto 8px auto;
  }
  .doc-code {
    font-size: 11.5pt;
    margin-top: 6px;
  }
  .doc-date {
    font-style: italic;
    font-size: 11.5pt;
    margin-top: 6px;
  }
  .doc-title-block {
    text-align: center;
    margin: 22px 0 20px 0;
  }
  .doc-type-heading {
    font-size: 15pt;
    font-weight: 700;
    text-transform: uppercase;
    margin: 0 0 4px 0;
  }
  .doc-main-title {
    font-size: 13.5pt;
    font-weight: 700;
    margin: 0;
  }
  .doc-summary {
    font-style: italic;
    font-size: 12pt;
    color: #374151;
    margin-top: 4px;
  }
  .doc-body {
    text-align: justify;
    min-height: 140mm;
  }
  .doc-body p { margin: 0 0 9px 0; }
  .doc-body ul, .doc-body ol { margin: 0 0 10px 22px; }
  .doc-body table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  .doc-body th, .doc-body td { border: 1px solid #374151; padding: 6px 8px; }
  .admin-footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-top: 28px;
    page-break-inside: avoid;
  }
  .recipients-box {
    width: 48%;
    font-size: 11pt;
  }
  .recipients-title {
    font-weight: 700;
    font-style: italic;
    text-decoration: underline;
    margin-bottom: 4px;
  }
  .signature-box {
    width: 48%;
    text-align: center;
  }
  .signature-role {
    font-weight: 700;
    font-size: 12pt;
    text-transform: uppercase;
  }
  .signature-note {
    font-style: italic;
    font-size: 11pt;
    color: #4b5563;
  }
  .signature-name {
    margin-top: 68px;
    font-weight: 700;
    font-size: 12.5pt;
  }
</style>
</head>
<body>
  <div class="a4-sheet">
    <div class="admin-header">
      <div class="header-left">
        <p class="company-name">CÔNG TY CỔ PHẦN XTTECH</p>
        <div class="divider-line"></div>
        <div class="doc-code">Số: ${docCode}</div>
      </div>
      <div class="header-right">
        <p class="nation-title">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
        <p class="nation-motto">Độc lập - Tự do - Hạnh phúc</p>
        <div class="divider-line"></div>
        <div class="doc-date">Hà Nội, ${dateStr.toLowerCase()}</div>
      </div>
    </div>

    <div class="doc-title-block">
      <h1 class="doc-type-heading">${typeHeading}</h1>
      <h2 class="doc-main-title">${cleanTitle}</h2>
      ${params.summary ? `<div class="doc-summary">(${params.summary})</div>` : ''}
    </div>

    <div class="doc-body">
      ${BODY_START_MARKER}
      ${params.bodyHtml}
      ${BODY_END_MARKER}
    </div>

    <div class="admin-footer">
      <div class="recipients-box">
        <div class="recipients-title">Nơi nhận:</div>
        <div>- Ban Giám đốc (để báo cáo);</div>
        <div>- Các Phòng ban / Bộ phận liên quan (để thực hiện);</div>
        <div>- Lưu: VT, HCNS${params.creatorName ? ` (${params.creatorName})` : ''}.</div>
      </div>
      <div class="signature-box">
        <div class="signature-role">ĐẠI DIỆN BAN GIÁM ĐỐC / PHÊ DUYỆT</div>
        <div class="signature-note">(Ký, ghi rõ họ tên và đóng dấu)</div>
        <div class="signature-name">${params.approverName || ''}</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function extractComposerBodyFromHtml(fullHtml: string): string {
  if (!fullHtml) return '';
  const startIdx = fullHtml.indexOf(BODY_START_MARKER);
  const endIdx = fullHtml.indexOf(BODY_END_MARKER);
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    return fullHtml.slice(startIdx + BODY_START_MARKER.length, endIdx).trim();
  }
  const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return bodyMatch ? bodyMatch[1].trim() : fullHtml.trim();
}

export function createHtmlDocumentFile(htmlContent: string, codeOrTitle: string): File {
  const safeBase =
    (codeOrTitle || 'van-ban-hanh-chinh')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'van-ban-xttech';
  return new File([htmlContent], `${safeBase}.html`, { type: 'text/html;charset=utf-8' });
}

