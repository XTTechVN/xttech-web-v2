/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useEffect, useState } from 'react';
import { AccessDenied } from '@/components/access-denied';
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
  const { can, isReady } = useCan();

  // Trang tổng quan theo nhóm việc của người dùng (suy từ quyền, không so tên role)
  const renderDashboard = () => {
    if (can('role:assign_permission')) return <AdminDashboard />;
    if (can('user:update')) return <HRDashboard />;
    if (can('quotation:submit')) return <SaleDashboard />;
    if (can('door:calculate')) return <TechnicianDashboard />;
    if (can('payment:create')) return <AccountantDashboard />;
    return <EmployeeDashboard />;
  };

  // Chờ quyền tải xong để không nháy sai giao diện (menu đã chặn người thiếu dashboard:read)
  if (!isReady) return null;
  if (!can('dashboard:read')) return <AccessDenied />;

  return <div className="p-4 font-body [&_h1]:font-heading [&_h2]:font-heading [&_h3]:font-heading [&_h4]:font-heading">
      {renderDashboard()}
    </div>;
};

export default Dashboard;
