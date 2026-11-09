export interface EditorColorOption {
  label: string;
  value: string;
}

export interface BlockFormatOption {
  value: string;
  label: string;
}

export type EditorToolbarIconKey =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikeThrough'
  | 'justifyLeft'
  | 'justifyCenter'
  | 'justifyRight'
  | 'justifyFull'
  | 'insertUnorderedList'
  | 'insertOrderedList';

export interface ToolbarActionMeta {
  command: string;
  title: string;
  iconKey: EditorToolbarIconKey;
}

export const TEXT_STYLE_ACTION_ITEMS: ToolbarActionMeta[] = [
  { command: 'bold', title: 'In đậm (Ctrl+B)', iconKey: 'bold' },
  { command: 'italic', title: 'In nghiêng (Ctrl+I)', iconKey: 'italic' },
  { command: 'underline', title: 'Gạch chân (Ctrl+U)', iconKey: 'underline' },
  { command: 'strikeThrough', title: 'Gạch ngang chữ', iconKey: 'strikeThrough' },
];

export const ALIGN_AND_LIST_ACTION_ITEMS: ToolbarActionMeta[] = [
  { command: 'justifyLeft', title: 'Căn trái', iconKey: 'justifyLeft' },
  { command: 'justifyCenter', title: 'Căn giữa tiêu đề / đoạn văn', iconKey: 'justifyCenter' },
  { command: 'justifyRight', title: 'Căn phải', iconKey: 'justifyRight' },
  { command: 'justifyFull', title: 'Căn đều hai bên', iconKey: 'justifyFull' },
  { command: 'insertUnorderedList', title: 'Danh sách gạch đầu dòng', iconKey: 'insertUnorderedList' },
  { command: 'insertOrderedList', title: 'Danh sách đánh số', iconKey: 'insertOrderedList' },
];

export const TEXT_COLOR_PALETTE: EditorColorOption[] = [
  { label: 'Đen đá phiến (Mặc định)', value: '#0F172A' },
  { label: 'Xám đậm', value: '#475569' },
  { label: 'Xám trung tính', value: '#64748B' },
  { label: 'Xanh cổ vịt XTTECH', value: '#045863' },
  { label: 'Xanh dương đậm', value: '#2563EB' },
  { label: 'Xanh lá cây', value: '#16A34A' },
  { label: 'Cam hổ phách', value: '#D97706' },
  { label: 'Đỏ nổi bật', value: '#DC2626' },
  { label: 'Tím đậm', value: '#7C3AED' },
  { label: 'Hồng đậm', value: '#DB2777' },
];

export const HIGHLIGHT_COLOR_PALETTE: EditorColorOption[] = [
  { label: 'Vàng tô sáng', value: '#FEF08A' },
  { label: 'Cam nhạt', value: '#FED7AA' },
  { label: 'Xanh ngọc XTTECH', value: '#E6F2F3' },
  { label: 'Xanh lá nhạt', value: '#DCFCE7' },
  { label: 'Xanh dương nhạt', value: '#DBEAFE' },
  { label: 'Tím nhạt', value: '#EDE9FE' },
  { label: 'Đỏ hồng nhạt', value: '#FFE4E6' },
  { label: 'Xám nhạt', value: '#F1F5F9' },
];

export const BLOCK_FORMAT_OPTIONS: BlockFormatOption[] = [
  { value: 'p', label: 'Văn bản thường' },
  { value: 'h2', label: 'Tiêu đề chương (H2)' },
  { value: 'h3', label: 'Tiêu đề lớn (H3)' },
  { value: 'h4', label: 'Tiêu đề vừa (H4)' },
  { value: 'blockquote', label: 'Khối trích dẫn' },
];

export const MEDIA_CONTENT_STYLES = `
  [&_figure]:my-4 [&_figure]:mx-auto [&_figcaption]:text-xs [&_figcaption]:text-slate-500
  [&_figcaption]:italic [&_figcaption]:text-center [&_figcaption]:mt-1.5
  [&_img]:max-w-full [&_img]:rounded-lg [&_img]:mx-auto
  [&_video]:max-w-full [&_video]:rounded-lg [&_video]:mx-auto
  [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-lg [&_iframe]:mx-auto [&_iframe]:border-0 [&_iframe]:shadow-sm
  [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:my-3
  [&_blockquote]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:bg-primary/5
  [&_blockquote]:px-3.5 [&_blockquote]:py-2 [&_blockquote]:rounded-r-lg [&_blockquote]:italic [&_blockquote]:text-slate-700
  [&_hr]:my-4 [&_hr]:border-slate-200
  [&_a]:text-primary [&_a]:font-medium [&_a]:underline
  [&_mark]:bg-yellow-200 [&_mark]:px-0.5 [&_mark]:rounded-xs
  [&_s]:line-through [&_del]:line-through`;

export const CONTENT_CLASS = `p-4 text-[13.5px] leading-[1.7] text-slate-800 focus:outline-hidden overflow-y-auto
  [&_p]:my-2 [&_ul]:my-2 [&_ul]:pl-5 [&_ul]:list-disc [&_ol]:my-2 [&_ol]:pl-5 [&_ol]:list-decimal
  [&_li]:my-0.5 [&_strong]:font-bold [&_u]:underline [&_em]:italic
  [&_h3]:text-[15px] [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:my-2.5
  [&_h4]:text-[13.5px] [&_h4]:font-bold [&_h4]:text-slate-900 [&_h4]:my-2 ${MEDIA_CONTENT_STYLES}`;

export const PAPER_CONTENT_CLASS = `min-h-[260px] text-[13.5px] leading-[1.7] text-slate-900 focus:outline-hidden font-sans
  [&_p]:my-2 [&_ul]:my-2 [&_ul]:pl-6 [&_ul]:list-disc [&_ol]:my-2 [&_ol]:pl-6 [&_ol]:list-decimal
  [&_li]:my-1 [&_strong]:font-bold [&_u]:underline [&_em]:italic
  [&_h3]:text-[15px] [&_h3]:font-bold [&_h3]:my-2.5 [&_h4]:text-[14px] [&_h4]:font-bold [&_h4]:my-2 ${MEDIA_CONTENT_STYLES}`;
