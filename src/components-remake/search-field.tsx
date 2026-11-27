import { Search } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  /** Nhãn đọc cho trình đọc màn hình */
  label: string;
}

/** Ô tìm kiếm của thanh công cụ: 44px trên điện thoại, 40px từ 768px */
export function SearchField({ value, onChange, placeholder, label }: Props) {
  return (
    <div className="relative min-w-0 flex-1 md:max-w-sm">
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="h-11 w-full rounded-control border border-slate-200 bg-white pl-9 pr-3 text-base text-slate-900 placeholder:text-slate-500 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 md:h-10 md:text-sm"
      />
    </div>
  );
}
