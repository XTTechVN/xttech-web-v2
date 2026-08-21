'use client';

import React, { useEffect, useState } from 'react';
import { UserRole } from '@/config';
import {
  AdminDashboard,
  HRDashboard,
  SaleDashboard,
  TechnicianDashboard,
  AccountantDashboard,
} from './_pages';

const Dashboard = () => {
  const [userRole, setUserRole] = useState<UserRole>('admin');

  // Đồng bộ role từ cookie lúc component mount
  useEffect(() => {
    const xtAuthCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('xt-auth='))
      ?.split('=')[1];

    if (xtAuthCookie) {
      try {
        const parsed = JSON.parse(decodeURIComponent(xtAuthCookie));
        const firstRole = parsed.roles?.[0];
        const roleCode = typeof firstRole === 'string' ? firstRole : firstRole?.code;
        if (roleCode) {
          setUserRole(roleCode as UserRole);
        }
      } catch {}
    }
  }, []);

  switch (userRole) {
    case 'super':
    case 'admin':
      return <AdminDashboard />;
    case 'hr':
      return <HRDashboard />;
    case 'sale':
      return <SaleDashboard />;
    case 'technician':
      return <TechnicianDashboard />;
    case 'accountant':
      return <AccountantDashboard />;
    default:
      return <AdminDashboard />;
  }
};

export default Dashboard;
