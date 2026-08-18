'use client';

import React, { useState } from 'react';
import DoorsPage from '../doors/page';
import MaterialsPage from '../materials/page';
import AccessoriesPage from '../accessories/page';
import ExtraOptionsPage from '../extra-options/page';
import FormulasPage from '../formulas/page';
import { Columns, ListChecks, Settings, Calculator, LayoutGrid } from 'lucide-react';

const TABS = [
  { id: 'doors', label: 'Cấu hình Cửa', component: DoorsPage, icon: <Columns size={16} /> },
  { id: 'materials', label: 'Cấu hình Hệ nhôm', component: MaterialsPage, icon: <LayoutGrid size={16} /> },
  { id: 'accessories', label: 'Cấu hình Phụ kiện', component: AccessoriesPage, icon: <ListChecks size={16} /> },
  { id: 'extra-options', label: 'Tùy chọn phát sinh', component: ExtraOptionsPage, icon: <Settings size={16} /> },
  { id: 'formulas', label: 'Công thức áp dụng', component: FormulasPage, icon: <Calculator size={16} /> },
];

export default function ProjectConfigurationPage() {
  const [activeTab, setActiveTab] = useState('doors');

  const ActiveComponent = TABS.find((t) => t.id === activeTab)?.component || DoorsPage;

  return (
    <div className="flex flex-col gap-5 text-black">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none gap-1.5 bg-slate-50 p-1.5 rounded-lg border">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-teal-700 hover:bg-slate-100'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm min-h-[400px]">
        <ActiveComponent />
      </div>
    </div>
  );
}
