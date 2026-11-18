/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useEffect, useState } from 'react';
import { useCan } from '@/hooks';
import {
  AdminDashboard,
  HRDashboard,
  SaleDashboard,
  TechnicianDashboard,
  AccountantDashboard,
  EmployeeDashboard,
} from './_pages';

const Dashboard = () => {
  const { can } = useCan();

  // Trang tổng quan theo nhóm việc của người dùng (suy từ quyền, không so tên role)
  const renderDashboard = () => {
    if (can('role:assign_permission')) return <AdminDashboard />;
    if (can('user:update')) return <HRDashboard />;
    if (can('quotation:submit')) return <SaleDashboard />;
    if (can('door:calculate')) return <TechnicianDashboard />;
    if (can('payment:create')) return <AccountantDashboard />;
    return <EmployeeDashboard />;
  };

  return <div className="p-4">{renderDashboard()}</div>;
};

export default Dashboard;
