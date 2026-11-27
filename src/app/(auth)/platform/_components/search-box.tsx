import { SearchField } from '@/components-remake';

// Ô tìm kiếm trên đầu danh sách: gõ tiếng Việt dùng state riêng của trang, không gắn vào URL
export function SearchBox(props: { value: string; onChange: (v: string) => void; label: string; placeholder: string }) {
  return (
    <div className="flex items-center gap-2">
      <SearchField {...props} />
    </div>
  );
}
