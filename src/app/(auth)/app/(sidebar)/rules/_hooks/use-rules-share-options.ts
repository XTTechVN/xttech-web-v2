'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getEmployees } from '@/actions/employee';
import { getDepartments } from '@/actions/department';
import { getApproverRoleBadge, isApproverEligible } from '@/app/(auth)/app/(sidebar)/documents/_utils/doc-helpers';
import { DOC_QUERY_KEYS } from '@/app/(auth)/app/(sidebar)/documents/_utils/doc-query-keys';

interface SelectOption {
  value: string;
  label: string;
  subLabel?: string;
}

const toDepartmentList = (raw: any): any[] => {
  const source = raw?.data ?? raw;
  if (Array.isArray(source)) return source;
  return Array.isArray(source?.items) ? source.items : [];
};

// Nguồn lựa chọn dùng chung cho form soạn thảo & ban hành: người duyệt, nhân sự nhận, phòng ban nhận
export function useRulesShareOptions(isEnabled: boolean, excludeUserId?: string) {
  const { data: employeesData } = useQuery({
    queryKey: DOC_QUERY_KEYS.options.employees,
    queryFn: () => getEmployees({ limit: 200 }),
    enabled: isEnabled,
  });
  const { data: departmentsData } = useQuery({
    queryKey: DOC_QUERY_KEYS.options.departments,
    queryFn: () => getDepartments({ limit: 100 }),
    enabled: isEnabled,
  });

  const approverOptions = useMemo<SelectOption[]>(() => {
    const employees: any[] = employeesData?.items || [];
    return employees
      .filter((emp) => emp?.id && String(emp.id) !== excludeUserId && isApproverEligible(emp))
      .map((emp) => ({
        value: String(emp.id),
        label: `${emp.fullName || emp.username} [${getApproverRoleBadge(emp)}]`,
        subLabel: emp.email,
      }));
  }, [employeesData, excludeUserId]);

  const employeeOptions = useMemo<SelectOption[]>(() => {
    const employees: any[] = employeesData?.items || [];
    return employees
      .filter((emp) => emp?.id && String(emp.id) !== excludeUserId)
      .map((emp) => ({
        value: String(emp.id),
        label: emp.fullName || emp.username || 'Nhân sự',
        subLabel: emp.email,
      }));
  }, [employeesData, excludeUserId]);

  const departmentOptions = useMemo<SelectOption[]>(
    () =>
      toDepartmentList(departmentsData).map((dept) => ({
        value: String(dept.id),
        label: dept.name,
        subLabel: dept.code ? `[${dept.code}]` : undefined,
      })),
    [departmentsData],
  );

  return { approverOptions, employeeOptions, departmentOptions };
}
