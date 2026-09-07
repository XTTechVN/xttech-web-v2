export const EDITOR_STYLES = {
  // Nhãn (Label): In hoa, đậm, giãn chữ rộng, xám nhạt
  label: 'block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1 select-none',
  
  // Tiêu đề nhóm (Section Header): In hoa, primary, giãn chữ nhẹ
  sectionHeader: 'text-[10px] font-bold text-primary uppercase tracking-wider select-none',
  
  // Ô nhập liệu (Input): Chỉ có đường gạch chân, không nền, không viền 3 bên
  input: 'h-8 text-base md:text-sm px-0.5 text-black bg-transparent border-t-0 border-l-0 border-r-0 border-b border-gray-200 rounded-none focus:border-black focus:ring-0 transition-colors duration-150',

  // Dropdown (Select): Cùng kiểu dáng với input
  select: 'h-8 text-base md:text-sm px-0.5 text-black bg-transparent border-t-0 border-l-0 border-r-0 border-b border-gray-200 rounded-none focus:border-black focus:ring-0 transition-colors duration-150',
  
  // Nút Thêm (Add): Chỉ có icon Plus màu primary, không text, không padding
  addButton: 'text-[#045863] hover:opacity-80 p-0 bg-transparent hover:bg-transparent h-auto w-auto min-w-0 inline-flex items-center justify-center border-none transition-all duration-150',
  
  // Nút xóa (Delete): Chỉ có icon Trash màu đỏ nhạt (danger/70), không text, không padding
  deleteButton: 'text-red-400 hover:text-red-600 p-0 bg-transparent hover:bg-transparent h-auto w-auto min-w-0 inline-flex items-center justify-center border-none transition-all duration-150',

  // Khung chứa phần tử con (Accessories, Extra Options, Formulas)
  subSectionContainer: 'flex flex-col gap-1.5 max-h-48 overflow-y-auto bg-transparent py-1 pl-4',
};

export const DEFAULT_TERMS_AND_CONDITIONS = `<p><strong>1. Quy định chung &amp; Tiến độ:</strong></p>
<ul>
  <li>Giá trên đã bao gồm thuế GTGT (VAT), chi phí vận chuyển và công lắp đặt hoàn thiện tại công trình.</li>
  <li>Khối lượng trên là khối lượng tạm tính, khối lượng thực tế căn cứ vào biên bản nghiệm thu có xác nhận của hai bên.</li>
  <li><strong>Tiến độ giao hàng:</strong> ........ ngày kể từ ngày xác nhận báo giá, tạm ứng đơn hàng, nhận số đo.</li>
  <li><strong>Hiệu lực báo giá:</strong> Báo giá có hiệu lực trong vòng 05 ngày kể từ ngày báo giá.</li>
</ul>

<p><strong>2. Phương thức &amp; Thông tin thanh toán:</strong></p>
<ul>
  <li><strong>Lần 1: Tạm ứng 30% trên tổng giá trị dự toán sau khi ký hợp đồng.</li>
  <li><strong>Lần 2: Tạm ứng 50% giá trị còn lại của dự toán sau khi hàng được chuyển đến công trình.</li>
  <li><strong>Lần 3: Thanh toán đủ 20% giá trị còn lại khi hoàn thành lắp đặt.</li>
</ul>
<p><strong>* Hình thức thanh toán:</strong> Bằng tiền mặt hoặc chuyển khoản ngân hàng</p>
<p><em><strong>Thông tin chuyển khoản:</strong> Tài khoản số: <strong>119000090101</strong>, tại Ngân Hàng TMCP Công Thương Việt Nam (Vietinbank) - Chi nhánh Đông Hải Phòng<br/>
Chủ tài khoản: <strong>CÔNG TY TNHH THƯƠNG MẠI VÀ XÂY DỰNG CƠ SỞ HẠ TẦNG XUÂN TIỆP</strong><br/>
Nội dung chuyển khoản: <strong>TÊN KHÁCH HÀNG chuyển tiền</strong></em></p>

<p><strong>3. Tùy chọn quy cách kính &amp; Phụ thu (nếu có thay đổi):</strong></p>
<p><em>(Đơn giá tiêu chuẩn áp dụng cho kính an toàn 6.38ly, chưa bao gồm film dán phản quang)</em></p>
<ul>
  <li>Nếu làm kính 8.38ly trắng trong: cộng thêm <strong>+180.000 đ/m²</strong></li>
  <li>Nếu làm kính 8 ly cường lực trắng trong: cộng thêm <strong>+290.000 đ/m²</strong> | Kính 10ly cường lực: cộng thêm <strong>+330.000 đ/m²</strong></li>
  <li>Nếu làm kính cường lực 12 ly trắng trong: cộng thêm <strong>+450.000 đ/m²</strong> | Kính dán cường lực 10.38 ly: cộng thêm <strong>+490.000 đ/m²</strong></li>
  <li>Nếu làm kính dán an toàn 11.52 ly: cộng thêm <strong>+950.000 đ/m²</strong> | Làm rèm trong hộp kính: cộng thêm <strong>+3.270.000 đ/m²</strong></li>
  <li>Nếu làm kính hộp 20ly hút chân không chạy chỉ đồng: cộng thêm <strong>+1.520.000 đ/m²</strong> (không chạy chỉ đồng: cộng <strong>+1.250.000 đ/m²</strong>)</li>
  <li>Đối với cửa nhôm nếu làm cửa chia ô: cộng thêm <strong>+480.000 đ/m²</strong> | Làm cửa pano không kính: cộng thêm <strong>+480.000 đ/m²</strong></li>
  <li>Nếu làm khuôn phào phủ tường: cộng thêm <strong>+550.000 đ/md</strong> | Bơm Foam chèn khe: cộng thêm <strong>+120.000 đ/m²</strong></li>
</ul>

<p><strong>4. Chính sách bảo hành &amp; Bảo trì:</strong></p>
<ul>
  <li>Bảo hành phụ kiện kim khí: <strong>24 tháng</strong> chính hãng kể từ ngày nghiệm thu bàn giao.</li>
  <li>Nước sơn tĩnh điện: Bảo hành <strong>10 năm ngoài trời</strong>, <strong>15 năm trong nhà</strong>.</li>
  <li><strong>Bảo trì miễn phí trong vòng 05 năm</strong> (12 tháng định kỳ bảo trì, bảo dưỡng 1 lần).</li>
</ul>`;