# Skeleton Component

Thành phần khung xương tải giả lập (loading skeleton), được sử dụng để mô phỏng bố cục dữ liệu đang tải, giúp giảm thiểu thay đổi bố cục bất ngờ (CLS) và nâng cao trải nghiệm người dùng (UX).

## Quick Start

```tsx
import { Skeleton } from '@/components';

// Khối văn bản giả lập
<Skeleton className="h-4 w-48" />

// Khối avatar tròn giả lập
<Skeleton className="h-10 w-10 rounded-full" />
```

## Props API Table

Kế thừa toàn bộ các thuộc tính HTML `div` tiêu chuẩn (`React.HTMLAttributes<HTMLDivElement>`). Thường sử dụng prop `className` để định cấu hình độ rộng (`w-*`), độ cao (`h-*`) và kiểu bo góc (`rounded-*`).
