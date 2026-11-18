import { redirect } from 'next/navigation';

// Danh sách phòng ban đã gộp vào trang Nhân sự (tab Phòng ban)
const Page = () => redirect('/app/employees?tab=departments');

export default Page;
