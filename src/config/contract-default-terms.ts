// Nội dung mặc định từ Điều 2 đến Điều 6 của hợp đồng (Điều 1 đã cố định trong CONTRACT_TEMPLATE).
// HTML chỉ dùng các thẻ được sanitizeRichHtml cho phép; $biến được thay khi xem trước và in.

const heading = (text: string): string => `<h3>${text}</h3>`;
const paragraph = (text: string): string => `<p>${text}</p>`;
const bulletList = (items: string[]): string => `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
const numberedList = (items: string[]): string => `<ol>${items.map((item) => `<li>${item}</li>`).join('')}</ol>`;

export const DEFAULT_CONTRACT_TERMS_HTML = [
  heading('ĐIỀU 2: NỘI DUNG ( Bên A thuê Bên B)'),
  paragraph(
    'Bên B đồng ý cung cấp và lắp đặt cho Bên A với giá trị hợp đồng, khối lượng, chủng loại vật tư và các nội dung liên quan được xác định theo bảng dự toán số $ma_bao_gia đính kèm theo hợp đồng này và là một phần không tách rời của hợp đồng.',
  ),
  paragraph('<strong><u>CHÚ Ý:</u></strong>'),
  numberedList([
    'Từ khi nhận tiền tạm ứng thì Bên B bắt đầu tiến hành thiết kế bản vẽ kích thước cửa theo thông thủy đẹp (lỗ ban đẹp) đem vượng khí vào nhà cho gia chủ. Từ khi nhận tiền tạm ứng sau 5 ngày sẽ gửi bản thiết kế cho chủ đầu tư và có kỹ thuật đến giám sát công trình cùng với chủ thầu xây dựng (đối với công trình chưa lên tường).',
    'Hợp đồng kèm theo 1 hòm mẫu gồm: một mẫu góc FV, một khóa AD-AE chính hãng, một khóa đa điểm cửa sổ Kinlong, một tay cài Hope, gioăng, keo, ốc vít; một mẫu góc FV bản 180 VIP, mẫu góc khung bao, mẫu mặt cắt của cánh, mẫu đố T.',
    'Đơn giá trên đã bao gồm toàn bộ chi phí vận chuyển và lắp đặt thực hiện công trình, bao gồm cả các khoản thuế, nghĩa vụ tài chính theo quy định pháp luật hiện hành.',
    'Khối lượng trên là tạm tính, giá trị quyết toán được tính theo số lượng nghiệm thu thực tế tại công trình.',
  ]),

  heading('ĐIỀU 3: THỜI GIAN, ĐỊA ĐIỂM, PHƯƠNG THỨC GIAO HÀNG VÀ LẮP ĐẶT'),
  paragraph('<strong>1. Bên B có trách nhiệm giao hàng cho Bên A theo địa điểm: $dia_chi_cong_trinh_A</strong>'),
  paragraph('a. Kiểm nhận hàng:'),
  paragraph(
    'Khi nhận hàng, Bên A có quyền và trách nhiệm kiểm nhận nhãn mác, chất lượng, số lượng, quy cách hàng hóa tại chỗ. Nếu phát hiện hàng hóa thiếu hoặc không đúng tiêu chuẩn chất lượng v.v thì có quyền không nhận hàng. Hàng đã nhận Bên B không chịu trách nhiệm nếu không do lỗi của nhà sản xuất.',
  ),
  paragraph('b. Giao nhận hàng:'),
  paragraph(
    '+ Trường hợp người đại diện chính thức của Bên A không trực tiếp nhận hàng mà ủy quyền cho người khác nhận hàng, thì người nhận hàng đó phải là người được ủy quyền.',
  ),
  paragraph(
    '+ Phiếu giao nhận hàng của Bên B với Bên A, được ký xác nhận bởi đại điện của Bên A hoặc người được ủy quyền của Bên A sẽ là cơ sở cho việc thanh toán.',
  ),
  paragraph('<strong>2. Thời gian lắp đặt</strong>'),
  bulletList([
    'Bên B sản xuất trong vòng ..... ngày kể từ ngày nhận số đo.',
    'Bên A phải báo ngày lắp đặt cho Bên B trước 7 ngày để Bên B tiến hành lắp đặt và bàn giao đúng tiến độ.',
  ]),

  heading('ĐIỀU 4: QUYỀN VÀ TRÁCH NHIỆM CỦA HAI BÊN'),
  paragraph('<strong>1. Quyền và Trách nhiệm của bên A:</strong>'),
  bulletList([
    'Bên A có trách nhiệm thực hiện nghĩa vụ thanh toán theo quy định tại Điều 4 của hợp đồng.',
    'Bên A tạo mọi điều kiện về mặt bằng và điện để bên B thi công lắp đặt sản phẩm hoàn thiện.',
    'Được nhận hàng đúng số lượng, chất lượng, chủng loại theo thỏa thuận.',
    'Được nhận hàng đúng thời gian cam kết.',
    'Bên A phối hợp với bên B để công trình được lắp đặt sản phẩm kịp theo thời gian thỏa thuận.',
  ]),
  paragraph('<strong>2. Quyền và Trách nhiệm của bên B:</strong>'),
  bulletList([
    'Bên B có trách nhiệm cung cấp, gia công hàng hóa đúng chủng loại. Đảm bảo hàng hóa đúng hãng và chất lượng theo tiêu chuẩn của nhà sản xuất.',
    'Bên B có trách nhiệm đảm bảo tính pháp lý của sản phẩm gia công cho Bên A.',
    'Trong quá trình thực hiện Hợp đồng, nếu giá cả thị trường có sự thay đổi tăng hoặc giảm giá thì giá vẫn được niêm yết như nêu điều 2.',
    'Được nhận tiền đúng giá trị và thời gian theo thỏa thuận.',
    'Cam kết giao hàng theo nội dung thỏa thuận.',
    'Đảm bảo đúng số lượng, chất lượng và chủng loại theo thỏa thuận.',
    'Phối hợp với Bên A trong quá trình giao nhận hàng hóa.',
    'Cung cấp hóa đơn chứng từ đầy đủ theo quy định của pháp luật.',
  ]),

  heading('ĐIỀU 5: BẢO HÀNH SẢN PHẨM'),
  bulletList([
    'Cửa nhôm FV: phụ kiện bảo hành 24 tháng, nước sơn bảo hành 10 năm ngoài trời, 15 năm trong nhà kể từ ngày lắp đặt.',
    'Từ khi lắp đặt và nghiệm thu xong, sau 03 tháng bảo trì lần đầu tiên và sau đó 12 tháng bảo trì lần tiếp theo, bảo trì trong vòng 05 năm.',
  ]),

  heading('ĐIỀU 6: ĐIỀU KHOẢN CHUNG'),
  bulletList([
    'Hai bên cam kết thực hiện đầy đủ và kịp thời các điều khoản đã ghi trong Hợp đồng này. Mọi sửa đổi bổ sung hợp đồng này phải được lập thành văn bản và có xác nhận của hai bên.',
    'Hai bên cam kết nghiêm túc thực hiện nội dung hợp đồng trên tinh thần hợp tác tôn trọng hiểu biết lẫn nhau và cùng ký kết trong lúc còn rất minh mẫn sáng suốt. Nếu một trong hai bên đơn phương hủy hợp đồng thì sẽ chịu bồi thường 70% dự toán công trình.',
    'Không bên nào được đơn phương từ bỏ hợp đồng, trường hợp có tranh chấp xảy ra, hai bên cùng nhau bàn bạc và tìm biện pháp giải quyết trên tinh thần thương lượng. Nếu hai bên thương thuyết không thành sẽ đưa ra Toà án kinh tế - Toà án nhân dân thành phố Hải Phòng, phán quyết của toà án kinh tế là cuối cùng và bắt buộc đối với cả hai bên. Chi phí toà án do bên có lỗi chịu.',
    'Các điều kiện và điều khoản khác không ghi trong hợp đồng này sẽ được các bên thực hiện theo quy định hiện hành của các văn bản pháp luật về HĐKT.',
    'Hợp đồng và các văn bản liên quan đến hợp đồng này được ký bản chính (bản gốc) và có giá trị pháp lý như nhau, ràng buộc đối với hai bên.',
    'Hợp đồng có hiệu lực kể từ ngày ký.',
    'Hợp đồng này được lập thành 02 bản, mỗi bên giữ 01 bản có giá trị pháp lý như nhau.',
  ]),
].join('');
