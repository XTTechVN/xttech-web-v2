'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

// Thành phần & hook dùng chung
import { cn } from '@/utils/cn';

// icons thư viện lucide - react
import { Users, Building2 } from 'lucide-react';

// API Actions & React Query
import { useQuery } from '@tanstack/react-query';
import { getEmployees } from '@/actions/employee';
import { getDepartments } from '@/actions/department';

import EmployeeTable from './employee/table';
import DepartmentTable from './department/table';

const DEFAULT_TAB = 'employees';

// Phong cách minimalistic áp riêng cho trang này (không đổi component dùng chung):
// bảng bo lớn viền mảnh, tiêu đề cột nhạt, hàng thoáng; ô tìm kiếm và nút Cài đặt dạng pill
const PAGE_STYLE = [
  '[&_.shadow-2xs]:rounded-3xl [&_.shadow-2xs]:border-gray-100 [&_.shadow-2xs]:shadow-none',
  '[&_thead]:bg-white [&_thead_tr]:bg-white [&_thead_tr]:border-gray-100',
  '[&_thead_th]:h-12 [&_thead_th]:border-gray-100 [&_thead_th]:text-[11px] [&_thead_th]:font-medium [&_thead_th]:uppercase [&_thead_th]:tracking-wider [&_thead_th]:text-gray-400',
  '[&_tbody_tr]:border-gray-100 [&_tbody_td]:h-16 [&_tbody_td]:text-gray-600',
  '[&_input[type=text]]:h-10 [&_input[type=text]]:rounded-full [&_input[type=text]]:border-transparent [&_input[type=text]]:bg-gray-100 [&_input[type=text]]:pl-10 [&_input[type=text]]:focus:bg-white [&_input[type=text]]:focus:border-gray-300',
  '[&_button:has(.lucide-sliders-horizontal)]:h-10 [&_button:has(.lucide-sliders-horizontal)]:rounded-full [&_button:has(.lucide-sliders-horizontal)]:px-4 [&_button:has(.lucide-sliders-horizontal)]:shadow-none',
].join(' ');

const EmployeeTabs = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Số lượng hiển thị cạnh tên tab
  const { data: employeeData } = useQuery({ queryKey: ['employees', 'total'], queryFn: () => getEmployees({ limit: 1 }) });
  const { data: departmentData } = useQuery({ queryKey: ['departments', 'total'], queryFn: () => getDepartments({ limit: 1 }) });
  const withCount = (label: string, total?: number) => (total === undefined ? label : `${label} · ${total}`);

  const tabs = useMemo(
    () => [
      { value: 'employees', label: withCount('Nhân viên', employeeData?.meta?.total), icon: <Users size={16} /> },
      { value: 'departments', label: withCount('Phòng ban', departmentData?.meta?.total), icon: <Building2 size={16} /> },
    ],
    [employeeData?.meta?.total, departmentData?.meta?.total],
  );

  const requested = searchParams.get('tab') || DEFAULT_TAB;
  const activeTab = tabs.some((t) => t.value === requested) ? requested : DEFAULT_TAB;

  // Đổi tab → URL sạch (bỏ search/offset của tab cũ)
  const handleChange = (value: string) => {
    router.replace(value === DEFAULT_TAB ? pathname : `${pathname}?tab=${value}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive = tab.value === activeTab;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => handleChange(tab.value)}
              className={cn(
                'inline-flex h-10 items-center gap-2 rounded-full border px-5 text-sm font-medium transition-colors cursor-pointer select-none',
                isActive
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900',
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>
      <div key={activeTab} className={cn('flex flex-col gap-4', PAGE_STYLE)}>
        {activeTab === 'employees' && <EmployeeTable />}
        {activeTab === 'departments' && <DepartmentTable />}
      </div>
    </div>
  );
};

export default EmployeeTabs;
