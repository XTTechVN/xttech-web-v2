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