'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getAccounts,
  getAutoPostingTemplates,
  getBankAccounts,
  getCostItems,
  getFinanceSetting,
  getMyFinancePermissions,
  getTaxInvoices,
} from '@/actions/finance';
import { getCustomers } from '@/actions/customer';
import { getDepartments } from '@/actions/department';
import { getEmployees } from '@/actions/employee';
import { getProjects } from '@/actions/project';
import { getWarehouseItems, getWarehouseSuppliers } from '@/actions/warehouse';
import type { VoucherMasterLookups } from './voucher-editor.constants';

export function useVoucherLookups(enabled = true) {
  const { data: setting = null } = useQuery({
    queryKey: ['finance', 'settings'],
    queryFn: getFinanceSetting,
    enabled,
    staleTime: 60_000,
  });
  const { data: accountsRes, isLoading: loadingAccounts } = useQuery({
    queryKey: ['finance', 'accounts', 'all'],
    queryFn: () => getAccounts({ limit: 500 }),
    enabled,
    staleTime: 60_000,
  });
  const { data: banksRes } = useQuery({
    queryKey: ['finance', 'bank-accounts', 'all'],
    queryFn: () => getBankAccounts({ limit: 100 }),
    enabled,
    staleTime: 60_000,
  });
  const { data: costItemsRes } = useQuery({
    queryKey: ['finance', 'cost-items', 'all'],
    queryFn: () => getCostItems({ limit: 200 }),
    enabled,
    staleTime: 60_000,
  });
  const { data: templatesRes } = useQuery({
    queryKey: ['finance', 'templates', 'all'],
    queryFn: () => getAutoPostingTemplates({ limit: 200 }),
    enabled,
    staleTime: 60_000,
  });
  const { data: projectsRes } = useQuery({
    queryKey: ['finance', 'lookups', 'projects'],
    queryFn: () => getProjects({ limit: 200 }),
    enabled,
    staleTime: 60_000,
  });
  const { data: departmentsRes } = useQuery({
    queryKey: ['finance', 'lookups', 'departments'],
    queryFn: () => getDepartments({ limit: 100 }),
    enabled,
    staleTime: 60_000,
  });
  const { data: customersRes } = useQuery({
    queryKey: ['finance', 'lookups', 'customers'],
    queryFn: () => getCustomers({ limit: 200 }),
    enabled,
    staleTime: 60_000,
  });
  const { data: suppliersRes } = useQuery({
    queryKey: ['finance', 'lookups', 'suppliers'],
    queryFn: () => getWarehouseSuppliers({ limit: 200 }),
    enabled,
    staleTime: 60_000,
  });
  const { data: employeesRes } = useQuery({
    queryKey: ['finance', 'lookups', 'employees'],
    queryFn: () => getEmployees({ limit: 200 }),
    enabled,
    staleTime: 60_000,
  });
  const { data: warehouseItemsRes } = useQuery({
    queryKey: ['finance', 'lookups', 'warehouse-items'],
    queryFn: () => getWarehouseItems({ limit: 200 }),
    enabled,
    staleTime: 60_000,
  });
  const { data: taxInvoicesRes } = useQuery({
    queryKey: ['finance', 'tax-invoices', 'unlinked-pool'],
    queryFn: () => getTaxInvoices({ limit: 100 }),
    enabled,
    staleTime: 30_000,
  });
  const { data: myPermissions = null } = useQuery({
    queryKey: ['finance', 'permissions', 'me'],
    queryFn: getMyFinancePermissions,
    enabled,
    staleTime: 60_000,
  });

  const lookups: VoucherMasterLookups = useMemo(
    () => ({
      setting,
      accounts: accountsRes?.items || [],
      bankAccounts: banksRes?.items || [],
      costItems: costItemsRes?.items || [],
      templates: templatesRes?.items || [],
      projects: projectsRes?.items || [],
      departments: Array.isArray(departmentsRes)
        ? departmentsRes
        : departmentsRes?.items || [],
      customers: customersRes?.items || [],
      suppliers: suppliersRes?.items || [],
      employees: employeesRes?.items || [],
      warehouseItems: warehouseItemsRes?.items || [],
    }),
    [
      setting,
      accountsRes,
      banksRes,
      costItemsRes,
      templatesRes,
      projectsRes,
      departmentsRes,
      customersRes,
      suppliersRes,
      employeesRes,
      warehouseItemsRes,
    ],
  );

  return {
    lookups,
    availableInvoices: (taxInvoicesRes?.items || []).filter((inv) => !inv.voucherId),
    loadingAccounts,
    myPermissions,
  };
}
