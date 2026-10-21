// Nội dung cố định của mẫu "Hợp đồng kinh tế" (theo file MẪU HỢP ĐỒNG KINH TẾ MỚI NHẤT.doc).
// Các trường dạng $ten_truong được thay bằng dữ liệu thật khi xem trước và in.

export const CONTRACT_TEMPLATE = {
  nationalTitle: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM',
  nationalMotto: 'Độc lập - Tự do - Hạnh phúc',
  nationalDivider: '--------o0o----------',
  title: 'HỢP ĐỒNG KINH TẾ',
  numberLine: 'Số: $so_hop_dong',
  legalBases: [
    'Căn cứ luật thương mại số 36/2005/QH 11 ngày 14/06/2005 được Quốc hội nước CHXHCN Việt Nam khóa XI kỳ 7 thông qua ngày 14/06/2005',
    'Căn cứ Luật Thương mại số 36/2005/QH11 ngày 14/6/2005;',
    'Căn cứ Bộ luật Dân sự số 91/2015/QH13 ngày 24/11/2015;',
    'Căn cứ Luật Thuế giá trị gia tăng số 48/2024/QH15 có hiệu lực từ ngày 01/7/2025;',
    'Căn cứ Nghị định số 70/2025/NĐ-CP ngày 20/5/2025 của Chính phủ về hóa đơn, chứng từ;',
    'Căn cứ nhu cầu của bên A và khả năng cung ứng của bên B',
  ],
  meetingLine:
    'Hôm nay, ngày $ngay tháng $thang năm $nam, tại văn phòng Công Ty TNHH TM Và XD Cơ Sở Hạ Tầng Xuân Tiệp, chúng tôi gồm:',
  partyA: {
    heading: 'BÊN A :',
    lines: [
      'CCCD: $cccd_A          Ngày sinh: $ngay_sinh_A',
      'Cấp ngày: $ngay_cap_cccd_A',
      'Địa chỉ công trình: $dia_chi_cong_trinh_A',
      'Địa chỉ: $dia_chi_A',
      'Số điện thoại: $sdt_A',
    ],
  },
  partyB: {
    heading: 'BÊN B:',
    name: 'CÔNG TY TNHH THƯƠNG MẠI VÀ XD CƠ SỞ HẠ TẦNG XUÂN TIỆP',
    lines: [
      'Địa chỉ: TDP Quý Kim 2 (tại nhà ông Bùi Đức Tiệp), P.Nam Đồ Sơn, Hải Phòng.',
      'Mã số thuế: 0201263785',
      'Tài khoản NH số: 119000090101 tại Ngân Hàng Thương mại cổ phần Công Thương Việt Nam (Vietinbank), Chi nhánh Đông Hải Phòng.',
      'Điện thoại: 02253.646.886          DĐ: 0569 669 669',
      'Đại diện bởi: Ông: Bùi Đức Tiệp          Chức vụ: Giám đốc công ty',
      'Kỹ thuật: Hoàng Văn Tuấn          Chức vụ: Kỹ thuật trưởng',
      'Điện thoại: 0339.398.669',
    ],
  },
  agreementLine: 'Hai bên cùng nhau thống nhất ký hợp đồng theo những điều khoản và điều kiện sau đây:',
  article1: {
    heading: 'ĐIỀU 1 : NGUYÊN TẮC KÝ KẾT HỢP ĐỒNG',
    content:
      'Hợp đồng này được ký kết dựa trên nguyên tắc tự nguyện, không Bên nào có các hành vi ép buộc Bên nào trong quá trình đàm phán, ký kết và thực hiện Hợp đồng. Kể từ ngày Hợp đồng có hiệu lực không Bên nào được có các hành vi lừa dối, hoặc các hành vi khác nhằm thoái thác việc thực hiện các quyền và nghĩa vụ được quy định tại Hợp đồng này.',
  },
  paymentMethod: {
    heading: 'PHƯƠNG THỨC THANH TOÁN',
    intro: 'Hợp đồng được thanh toán làm $so_lan_thanh_toan lần cụ thể như sau:',
    installmentLine:
      'Lần $lan: Bên A thanh toán $ten_dot ($phan_tram% giá trị hợp đồng), số tiền tương ứng: $so_tien (Bằng chữ: $so_tien_bang_chu).',
    dueDateLabel: 'Hạn thanh toán:',
  },
  paymentNotice: {
    heading: 'CHÚ Ý: Khách hàng ứng tiền hoặc thanh toán tiền chuyển khoản vào đúng tài khoản của công ty:',
    lines: [
      'STK: 119000090101 tại Ngân hàng TMCP Công Thương Việt Nam (Vietinbank) - Chi nhánh Đông Hải Phòng.',
      'Tên tài khoản: CÔNG TY TNHH TM VÀ XD CƠ SỞ HẠ TẦNG XUÂN TIỆP',
      'Nội dung chuyển khoản: Tạm ứng tiền hàng theo hợp đồng số $so_hop_dong',
      '- Nếu khách hàng thanh toán bằng tiền mặt thì phải nhận được hóa đơn thanh toán có dấu của công ty.',
      '- Các khoản thanh toán chỉ được xem là hợp lệ khi được chuyển đúng tài khoản công ty hoặc có phiếu thu xác nhận hợp lệ do công ty phát hành.',
    ],
    qrImageUrl: '/contracts/vietinbank-qr.png',
  },
  signing: {
    placeLine: 'Hải Phòng, $ngay_thang_nam',
    partyALabel: 'Đại diện bên A',
    partyBLabel: 'Đại diện bên B',
    signHint: '(ký tên và đóng dấu)',
  },
} as const;

// Các phần soạn thảo (Cơ chế, Điều khoản, Chính sách) được ghép nối tiếp từ Điều 2 trở đi
export const CONTRACT_BODY_START_ARTICLE = 2;
